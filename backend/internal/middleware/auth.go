package middleware

import (
	"context"
	"crypto/ecdsa"
	"crypto/elliptic"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math/big"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"stringwise/api/internal/models"
)

type contextKey string

const (
	CtxUserID contextKey = "userID"
	CtxRole   contextKey = "role"
)

// FetchECPublicKey fetches the ES256 public key from Supabase JWKS endpoint.
func FetchECPublicKey(supabaseURL string) (*ecdsa.PublicKey, error) {
	resp, err := http.Get(supabaseURL + "/auth/v1/.well-known/jwks.json")
	if err != nil {
		return nil, fmt.Errorf("fetch jwks: %w", err)
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read jwks: %w", err)
	}
	var ks struct {
		Keys []struct {
			Kty string `json:"kty"`
			Crv string `json:"crv"`
			X   string `json:"x"`
			Y   string `json:"y"`
			Alg string `json:"alg"`
		} `json:"keys"`
	}
	if err := json.Unmarshal(body, &ks); err != nil {
		return nil, fmt.Errorf("parse jwks: %w", err)
	}
	for _, k := range ks.Keys {
		if k.Kty == "EC" && (k.Alg == "ES256" || k.Crv == "P-256") {
			xb, err := base64.RawURLEncoding.DecodeString(k.X)
			if err != nil {
				return nil, fmt.Errorf("decode X: %w", err)
			}
			yb, err := base64.RawURLEncoding.DecodeString(k.Y)
			if err != nil {
				return nil, fmt.Errorf("decode Y: %w", err)
			}
			return &ecdsa.PublicKey{
				Curve: elliptic.P256(),
				X:     new(big.Int).SetBytes(xb),
				Y:     new(big.Int).SetBytes(yb),
			}, nil
		}
	}
	return nil, fmt.Errorf("no EC P-256 key in JWKS")
}

func parseJWT(c *gin.Context, hmacSecret []byte, ecKey *ecdsa.PublicKey) (uuid.UUID, bool) {
	header := c.GetHeader("Authorization")
	if !strings.HasPrefix(header, "Bearer ") {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing token"})
		return uuid.UUID{}, false
	}
	raw := strings.TrimPrefix(header, "Bearer ")

	tok, err := jwt.Parse(raw, func(t *jwt.Token) (any, error) {
		switch t.Method.(type) {
		case *jwt.SigningMethodHMAC:
			return hmacSecret, nil
		case *jwt.SigningMethodECDSA:
			if ecKey == nil {
				return nil, fmt.Errorf("ES256 key not configured")
			}
			return ecKey, nil
		default:
			return nil, fmt.Errorf("unexpected signing method: %T", t.Method)
		}
	})
	if err != nil || !tok.Valid {
		log.Printf("jwt parse failed: %v", err)
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
		return uuid.UUID{}, false
	}

	claims, ok := tok.Claims.(jwt.MapClaims)
	if !ok {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid claims"})
		return uuid.UUID{}, false
	}

	sub, _ := claims["sub"].(string)
	userID, err := uuid.Parse(sub)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid sub"})
		return uuid.UUID{}, false
	}
	return userID, true
}

// tryParseJWT attempts to parse the JWT without aborting the request on failure.
func tryParseJWT(c *gin.Context, hmacSecret []byte, ecKey *ecdsa.PublicKey) (uuid.UUID, bool) {
	header := c.GetHeader("Authorization")
	if !strings.HasPrefix(header, "Bearer ") {
		return uuid.UUID{}, false
	}
	raw := strings.TrimPrefix(header, "Bearer ")
	tok, err := jwt.Parse(raw, func(t *jwt.Token) (any, error) {
		switch t.Method.(type) {
		case *jwt.SigningMethodHMAC:
			return hmacSecret, nil
		case *jwt.SigningMethodECDSA:
			if ecKey == nil {
				return nil, fmt.Errorf("ES256 key not configured")
			}
			return ecKey, nil
		default:
			return nil, fmt.Errorf("unexpected signing method: %T", t.Method)
		}
	})
	if err != nil || !tok.Valid {
		return uuid.UUID{}, false
	}
	claims, ok := tok.Claims.(jwt.MapClaims)
	if !ok {
		return uuid.UUID{}, false
	}
	sub, _ := claims["sub"].(string)
	userID, err := uuid.Parse(sub)
	if err != nil {
		return uuid.UUID{}, false
	}
	return userID, true
}

// OptionalAuth tries to validate the JWT and set userID in context, but does not abort if absent or invalid.
func OptionalAuth(hmacSecret string, ecKey *ecdsa.PublicKey) gin.HandlerFunc {
	secret := []byte(hmacSecret)
	return func(c *gin.Context) {
		if userID, ok := tryParseJWT(c, secret, ecKey); ok {
			c.Set(string(CtxUserID), userID)
		}
		c.Next()
	}
}

// Auth validates JWT and requires an existing profile row.
func Auth(db *pgxpool.Pool, hmacSecret string, ecKey *ecdsa.PublicKey) gin.HandlerFunc {
	secret := []byte(hmacSecret)
	return func(c *gin.Context) {
		userID, ok := parseJWT(c, secret, ecKey)
		if !ok {
			return
		}
		var role models.Role
		err := db.QueryRow(context.Background(),
			`SELECT role FROM profiles WHERE user_id = $1`, userID,
		).Scan(&role)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "profile not found"})
			return
		}
		c.Set(string(CtxUserID), userID)
		c.Set(string(CtxRole), role)
		c.Next()
	}
}

// ValidateJWT validates the JWT but does not require a profile (for first-time registration).
func ValidateJWT(hmacSecret string, ecKey *ecdsa.PublicKey) gin.HandlerFunc {
	secret := []byte(hmacSecret)
	return func(c *gin.Context) {
		userID, ok := parseJWT(c, secret, ecKey)
		if !ok {
			return
		}
		c.Set(string(CtxUserID), userID)
		c.Next()
	}
}

func RequireTeacher() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, _ := c.Get(string(CtxRole))
		if role != models.RoleTeacher {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "teacher access required"})
			return
		}
		c.Next()
	}
}

func GetUserID(c *gin.Context) uuid.UUID {
	v, _ := c.Get(string(CtxUserID))
	id, _ := v.(uuid.UUID)
	return id
}

func GetRole(c *gin.Context) models.Role {
	v, _ := c.Get(string(CtxRole))
	r, _ := v.(models.Role)
	return r
}
