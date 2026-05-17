package router

import (
	"context"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"stringwise/api/internal/config"
	"stringwise/api/internal/handlers"
	"stringwise/api/internal/middleware"
	"stringwise/api/internal/models"
	"stringwise/api/internal/storage"
)

func New(cfg *config.Config, db *pgxpool.Pool, r2 *storage.R2Client) *gin.Engine {
	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Fetch Supabase EC public key for ES256 JWT validation.
	// Falls back gracefully — HS256 still works if JWKS fetch fails.
	ecKey, err := middleware.FetchECPublicKey(cfg.SupabaseURL)
	if err != nil {
		log.Printf("JWKS fetch failed (ES256 unavailable): %v", err)
	} else {
		log.Printf("JWKS loaded: ES256 public key ready")
	}

	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())

	// CORS
	r.Use(func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		allowed := false
		for _, o := range cfg.CORSOrigins {
			if o == origin {
				allowed = true
				break
			}
		}
		if allowed {
			c.Header("Access-Control-Allow-Origin", origin)
			c.Header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
			c.Header("Access-Control-Allow-Headers", "Authorization,Content-Type")
			c.Header("Access-Control-Max-Age", "86400")
		}
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	})

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	bh := handlers.NewBatchHandler(db)
	sh := handlers.NewStudentHandler(db)
	lh := handlers.NewLessonHandler(db, r2)
	ah := handlers.NewAudioHandler(db, r2)
	ph := handlers.NewPracticeHandler(db)

	authMW := middleware.Auth(db, cfg.SupabaseJWTSecret, ecKey)
	jwtMW := middleware.ValidateJWT(cfg.SupabaseJWTSecret, ecKey)
	teacherMW := middleware.RequireTeacher()

	// JWT-only: registration doesn't require an existing profile
	noProfile := r.Group("/api/v1", jwtMW)
	{
		noProfile.POST("/auth/register", func(c *gin.Context) {
			var req struct {
				Role models.Role `json:"role" binding:"required"`
			}
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			userID := middleware.GetUserID(c)
			_, err := db.Exec(context.Background(),
				`INSERT INTO profiles (user_id, role) VALUES ($1,$2)
				 ON CONFLICT (user_id) DO NOTHING`, userID, req.Role)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			// Auto-link student record by email on first student login
			if req.Role == models.RoleStudent {
				var email string
				_ = db.QueryRow(context.Background(),
					`SELECT email FROM auth.users WHERE id = $1`, userID,
				).Scan(&email)
				if email != "" {
					_, _ = db.Exec(context.Background(),
						`UPDATE students SET user_id = $1 WHERE email = $2 AND user_id IS NULL`,
						userID, email)
				}
			}
			c.JSON(http.StatusCreated, gin.H{"user_id": userID, "role": req.Role})
		})
	}

	// Full auth: JWT + profile required
	v1 := r.Group("/api/v1", authMW)
	{
		v1.POST("/auth/me", func(c *gin.Context) {
			userID := middleware.GetUserID(c)
			role := middleware.GetRole(c)
			var email string
			_ = db.QueryRow(context.Background(),
				`SELECT email FROM auth.users WHERE id = $1`, userID,
			).Scan(&email)
			c.JSON(http.StatusOK, gin.H{
				"user_id": userID,
				"role":    role,
				"email":   email,
			})
		})

		batches := v1.Group("/batches")
		{
			batches.GET("", bh.List)
			batches.POST("", teacherMW, bh.Create)
			batches.PUT("/:id", teacherMW, bh.Update)
			batches.DELETE("/:id", teacherMW, bh.Delete)
		}

		students := v1.Group("/students")
		{
			students.GET("", sh.List)
			students.GET("/me", sh.Me)
			students.POST("", teacherMW, sh.Create)
			students.PUT("/:id", teacherMW, sh.Update)
			students.DELETE("/:id", teacherMW, sh.Delete)
		}

		lessons := v1.Group("/lessons")
		{
			lessons.GET("", lh.List)
			lessons.POST("", teacherMW, lh.Create)
			lessons.GET("/:id", lh.Get)
			lessons.PUT("/:id", teacherMW, lh.Update)
			lessons.DELETE("/:id", teacherMW, lh.Delete)
		}

		audio := v1.Group("/audio", teacherMW)
		{
			audio.POST("/presign", ah.Presign)
			audio.POST("/upload", ah.Upload)
			audio.DELETE("/:id", ah.Delete)
		}

		practice := v1.Group("/practice")
		{
			practice.GET("", ph.List)
			practice.POST("", ph.Create)
			practice.GET("/:id", ph.Get)
			practice.PUT("/:id", ph.Update)
			practice.DELETE("/:id", ph.Delete)
		}
	}

	return r
}
