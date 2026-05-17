package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"stringwise/api/internal/middleware"
	"stringwise/api/internal/models"
)

type BatchHandler struct{ db *pgxpool.Pool }

func NewBatchHandler(db *pgxpool.Pool) *BatchHandler { return &BatchHandler{db: db} }

func (h *BatchHandler) List(c *gin.Context) {
	userID := middleware.GetUserID(c)
	role := middleware.GetRole(c)

	var rows interface{ Scan(...any) error }
	var err error
	ctx := context.Background()

	if role == models.RoleTeacher {
		r, e := h.db.Query(ctx,
			`SELECT id, teacher_id, name, color, schedule, day, "time", duration_minutes, created_at, updated_at
			 FROM batches WHERE teacher_id = $1 ORDER BY created_at`, userID)
		rows, err = r, e
	} else {
		r, e := h.db.Query(ctx,
			`SELECT b.id, b.teacher_id, b.name, b.color, b.schedule, b.day, b."time", b.duration_minutes, b.created_at, b.updated_at
			 FROM batches b
			 JOIN students s ON s.batch_id = b.id
			 WHERE s.user_id = $1`, userID)
		rows, err = r, e
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	batches := []models.Batch{}
	type scanner interface {
		Next() bool
		Scan(...any) error
		Err() error
	}
	rs := rows.(scanner)
	for rs.Next() {
		var b models.Batch
		if err := rs.Scan(&b.ID, &b.TeacherID, &b.Name, &b.Color, &b.Schedule, &b.Day, &b.Time, &b.DurationMinutes, &b.CreatedAt, &b.UpdatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		batches = append(batches, b)
	}
	c.JSON(http.StatusOK, batches)
}

func (h *BatchHandler) Create(c *gin.Context) {
	var req models.CreateBatchReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userID := middleware.GetUserID(c)
	var b models.Batch
	err := h.db.QueryRow(context.Background(),
		`INSERT INTO batches (teacher_id, name, color, schedule, day, "time", duration_minutes)
		 VALUES ($1,$2,$3,$4,$5,$6,$7)
		 RETURNING id, teacher_id, name, color, schedule, day, "time", duration_minutes, created_at, updated_at`,
		userID, req.Name, req.Color, req.Schedule, req.Day, req.Time, req.DurationMinutes,
	).Scan(&b.ID, &b.TeacherID, &b.Name, &b.Color, &b.Schedule, &b.Day, &b.Time, &b.DurationMinutes, &b.CreatedAt, &b.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, b)
}

func (h *BatchHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	var req models.UpdateBatchReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userID := middleware.GetUserID(c)
	var b models.Batch
	err = h.db.QueryRow(context.Background(),
		`UPDATE batches SET
		   name = COALESCE(NULLIF($3,''), name),
		   color = COALESCE(NULLIF($4,''), color),
		   schedule = COALESCE(NULLIF($5,''), schedule),
		   day = COALESCE(NULLIF($6,''), day),
		   "time" = COALESCE(NULLIF($7,''), "time"),
		   duration_minutes = CASE WHEN $8 > 0 THEN $8 ELSE duration_minutes END,
		   updated_at = $9
		 WHERE id = $1 AND teacher_id = $2
		 RETURNING id, teacher_id, name, color, schedule, day, "time", duration_minutes, created_at, updated_at`,
		id, userID, req.Name, req.Color, req.Schedule, req.Day, req.Time, req.DurationMinutes, time.Now(),
	).Scan(&b.ID, &b.TeacherID, &b.Name, &b.Color, &b.Schedule, &b.Day, &b.Time, &b.DurationMinutes, &b.CreatedAt, &b.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, b)
}

func (h *BatchHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	userID := middleware.GetUserID(c)
	_, err = h.db.Exec(context.Background(),
		`DELETE FROM batches WHERE id = $1 AND teacher_id = $2`, id, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}
