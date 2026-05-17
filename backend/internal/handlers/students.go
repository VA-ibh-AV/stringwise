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

type StudentHandler struct{ db *pgxpool.Pool }

func NewStudentHandler(db *pgxpool.Pool) *StudentHandler { return &StudentHandler{db: db} }

func (h *StudentHandler) List(c *gin.Context) {
	userID := middleware.GetUserID(c)
	role := middleware.GetRole(c)
	ctx := context.Background()

	students := []models.Student{}

	if role == models.RoleTeacher {
		rows, err := h.db.Query(ctx,
			`SELECT id, teacher_id, user_id, batch_id, name, initials, level, email, joined_date, created_at, updated_at
			 FROM students WHERE teacher_id = $1 ORDER BY name`, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()
		for rows.Next() {
			var s models.Student
			if err := rows.Scan(&s.ID, &s.TeacherID, &s.UserID, &s.BatchID, &s.Name, &s.Initials, &s.Level, &s.Email, &s.JoinedDate, &s.CreatedAt, &s.UpdatedAt); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			students = append(students, s)
		}
	} else {
		var s models.Student
		err := h.db.QueryRow(ctx,
			`SELECT id, teacher_id, user_id, batch_id, name, initials, level, email, joined_date, created_at, updated_at
			 FROM students WHERE user_id = $1`, userID,
		).Scan(&s.ID, &s.TeacherID, &s.UserID, &s.BatchID, &s.Name, &s.Initials, &s.Level, &s.Email, &s.JoinedDate, &s.CreatedAt, &s.UpdatedAt)
		if err == nil {
			students = append(students, s)
		}
	}
	c.JSON(http.StatusOK, students)
}

func (h *StudentHandler) Create(c *gin.Context) {
	var req models.CreateStudentReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	batchID, _ := uuid.Parse(req.BatchID)
	userID := middleware.GetUserID(c)

	var email *string
	if req.Email != "" {
		e := req.Email
		email = &e
	}

	var s models.Student
	err := h.db.QueryRow(context.Background(),
		`INSERT INTO students (teacher_id, batch_id, name, initials, level, email)
		 VALUES ($1,$2,$3,$4,$5,$6)
		 RETURNING id, teacher_id, user_id, batch_id, name, initials, level, email, joined_date, created_at, updated_at`,
		userID, batchID, req.Name, req.Initials, req.Level, email,
	).Scan(&s.ID, &s.TeacherID, &s.UserID, &s.BatchID, &s.Name, &s.Initials, &s.Level, &s.Email, &s.JoinedDate, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Pre-link: if the student's email already has an auth account, connect it now
	if email != nil {
		_, _ = h.db.Exec(context.Background(),
			`UPDATE students SET user_id = (SELECT id FROM auth.users WHERE email = $1 LIMIT 1)
			 WHERE id = $2 AND user_id IS NULL`, *email, s.ID)
	}

	c.JSON(http.StatusCreated, s)
}

func (h *StudentHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	var req models.UpdateStudentReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userID := middleware.GetUserID(c)

	var batchID *uuid.UUID
	if req.BatchID != "" {
		bid, _ := uuid.Parse(req.BatchID)
		batchID = &bid
	}

	var s models.Student
	err = h.db.QueryRow(context.Background(),
		`UPDATE students SET
		   batch_id   = COALESCE($3, batch_id),
		   name       = COALESCE(NULLIF($4,''), name),
		   initials   = COALESCE(NULLIF($5,''), initials),
		   level      = COALESCE(NULLIF($6,''), level),
		   email      = COALESCE(NULLIF($7,''), email),
		   updated_at = $8
		 WHERE id = $1 AND teacher_id = $2
		 RETURNING id, teacher_id, user_id, batch_id, name, initials, level, email, joined_date, created_at, updated_at`,
		id, userID, batchID, req.Name, req.Initials, req.Level, req.Email, time.Now(),
	).Scan(&s.ID, &s.TeacherID, &s.UserID, &s.BatchID, &s.Name, &s.Initials, &s.Level, &s.Email, &s.JoinedDate, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, s)
}

func (h *StudentHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	userID := middleware.GetUserID(c)
	_, err = h.db.Exec(context.Background(),
		`DELETE FROM students WHERE id = $1 AND teacher_id = $2`, id, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *StudentHandler) Me(c *gin.Context) {
	userID := middleware.GetUserID(c)
	var s models.Student
	err := h.db.QueryRow(context.Background(),
		`SELECT id, teacher_id, user_id, batch_id, name, initials, level, email, joined_date, created_at, updated_at
		 FROM students WHERE user_id = $1`, userID,
	).Scan(&s.ID, &s.TeacherID, &s.UserID, &s.BatchID, &s.Name, &s.Initials, &s.Level, &s.Email, &s.JoinedDate, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not_enrolled"})
		return
	}
	c.JSON(http.StatusOK, s)
}
