package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"stringwise/api/internal/middleware"
	"stringwise/api/internal/models"
)

type PracticeHandler struct{ db *pgxpool.Pool }

func NewPracticeHandler(db *pgxpool.Pool) *PracticeHandler { return &PracticeHandler{db: db} }

func (h *PracticeHandler) List(c *gin.Context) {
	userID := middleware.GetUserID(c)
	ctx := context.Background()

	rows, err := h.db.Query(ctx,
		`SELECT id, student_user_id, title, sections, visibility, created_at, updated_at
		 FROM practice_songs WHERE student_user_id = $1 ORDER BY updated_at DESC`, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	songs := []models.PracticeSong{}
	for rows.Next() {
		var s models.PracticeSong
		var sectionsRaw []byte
		if err := rows.Scan(&s.ID, &s.StudentUserID, &s.Title, &sectionsRaw, &s.Visibility, &s.CreatedAt, &s.UpdatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		s.Sections = json.RawMessage(sectionsRaw)
		songs = append(songs, s)
	}
	c.JSON(http.StatusOK, songs)
}

func (h *PracticeHandler) Create(c *gin.Context) {
	var req models.CreatePracticeSongReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userID := middleware.GetUserID(c)

	title := req.Title
	if title == "" {
		title = "Untitled"
	}
	visibility := req.Visibility
	if visibility == "" {
		visibility = "private"
	}
	sections := req.Sections
	if len(sections) == 0 {
		sections = json.RawMessage("[]")
	}

	var s models.PracticeSong
	var sectionsRaw []byte
	err := h.db.QueryRow(context.Background(),
		`INSERT INTO practice_songs (student_user_id, title, sections, visibility)
		 VALUES ($1,$2,$3,$4)
		 RETURNING id, student_user_id, title, sections, visibility, created_at, updated_at`,
		userID, title, []byte(sections), visibility,
	).Scan(&s.ID, &s.StudentUserID, &s.Title, &sectionsRaw, &s.Visibility, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	s.Sections = json.RawMessage(sectionsRaw)
	c.JSON(http.StatusCreated, s)
}

func (h *PracticeHandler) Get(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	userID := middleware.GetUserID(c)

	var s models.PracticeSong
	var sectionsRaw []byte
	err = h.db.QueryRow(context.Background(),
		`SELECT id, student_user_id, title, sections, visibility, created_at, updated_at
		 FROM practice_songs WHERE id = $1`, id,
	).Scan(&s.ID, &s.StudentUserID, &s.Title, &sectionsRaw, &s.Visibility, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	if s.Visibility == "private" && s.StudentUserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
		return
	}
	s.Sections = json.RawMessage(sectionsRaw)
	c.JSON(http.StatusOK, s)
}

func (h *PracticeHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	var req models.UpdatePracticeSongReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userID := middleware.GetUserID(c)

	sections := req.Sections
	if len(sections) == 0 {
		sections = json.RawMessage("[]")
	}

	var s models.PracticeSong
	var sectionsRaw []byte
	err = h.db.QueryRow(context.Background(),
		`UPDATE practice_songs SET
		   title      = COALESCE(NULLIF($3,''), title),
		   sections   = $4,
		   visibility = COALESCE(NULLIF($5,''), visibility),
		   updated_at = $6
		 WHERE id = $1 AND student_user_id = $2
		 RETURNING id, student_user_id, title, sections, visibility, created_at, updated_at`,
		id, userID, req.Title, []byte(sections), req.Visibility, time.Now(),
	).Scan(&s.ID, &s.StudentUserID, &s.Title, &sectionsRaw, &s.Visibility, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	s.Sections = json.RawMessage(sectionsRaw)
	c.JSON(http.StatusOK, s)
}

func (h *PracticeHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	userID := middleware.GetUserID(c)
	_, err = h.db.Exec(context.Background(),
		`DELETE FROM practice_songs WHERE id = $1 AND student_user_id = $2`, id, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}
