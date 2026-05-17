package config

import (
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port               string
	Env                string
	DatabaseURL        string
	SupabaseURL        string
	SupabaseJWTSecret  string
	R2AccountID        string
	R2AccessKeyID      string
	R2SecretAccessKey  string
	R2Bucket           string
	R2PublicURL        string
	CORSOrigins        []string
}

func Load() *Config {
	_ = godotenv.Load("../../.env")

	cfg := &Config{
		Port:              getEnv("PORT", "8080"),
		Env:               getEnv("ENV", "development"),
		DatabaseURL:       mustEnv("DATABASE_URL"),
		SupabaseURL:       mustEnv("SUPABASE_URL"),
		SupabaseJWTSecret: mustEnv("SUPABASE_JWT_SECRET"),
		R2AccountID:       mustEnv("R2_ACCOUNT_ID"),
		R2AccessKeyID:     mustEnv("R2_ACCESS_KEY_ID"),
		R2SecretAccessKey: mustEnv("R2_SECRET_ACCESS_KEY"),
		R2Bucket:          getEnv("R2_BUCKET", "stringwise"),
		R2PublicURL:       mustEnv("R2_PUBLIC_URL"),
		CORSOrigins:       strings.Split(getEnv("CORS_ORIGINS", "http://localhost:5173"), ","),
	}
	return cfg
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func mustEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		log.Fatalf("required env var %s is not set", key)
	}
	return v
}
