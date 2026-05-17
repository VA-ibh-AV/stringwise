.PHONY: dev dev-down build up down logs migrate tidy

# ── Dev (hot reload via compose override) ────────────
dev:
	docker compose -f docker-compose.yml -f docker-compose.override.yml up -d

dev-down:
	docker compose -f docker-compose.yml -f docker-compose.override.yml down

dev-logs:
	docker compose -f docker-compose.yml -f docker-compose.override.yml logs -f

# ── Local Dev (no Docker) ─────────────────────────────
dev-frontend:
	cd frontend && npm run dev

dev-backend:
	cd backend && go run ./cmd/server

# ── Docker ───────────────────────────────────────────
build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

restart-backend:
	docker compose restart backend

# ── Database ─────────────────────────────────────────
# Apply migration to hosted Supabase (run once)
migrate:
	@DATABASE_URL=$$(grep '^DATABASE_URL=' .env | cut -d= -f2-) && \
	docker run --rm \
		-v "$(CURDIR)/backend/migrations:/migrations:ro" \
		postgres:15-alpine \
		psql "$$DATABASE_URL" -f /migrations/001_init.sql

# ── Go ───────────────────────────────────────────────
tidy:
	cd backend && go mod tidy

backend-build:
	cd backend && go build ./...

# ── Cloudflare Tunnel setup (run once) ───────────────
tunnel-create:
	docker run --rm -v ./infra/cloudflared:/etc/cloudflared cloudflare/cloudflared:latest \
		tunnel --config /etc/cloudflared/config.yml create stringwise

tunnel-login:
	docker run --rm -v ./infra/cloudflared:/etc/cloudflared cloudflare/cloudflared:latest \
		tunnel login
