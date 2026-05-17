package handlers

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"stringwise/api/internal/middleware"
	"stringwise/api/internal/models"
	"stringwise/api/internal/storage"
)

type AudioHandler struct {
	db *pgxpool.Pool
	r2 *storage.R2Client
}

func NewAudioHandler(db *pgxpool.Pool, r2 *storage.R2Client) *AudioHandler {
	return &AudioHandler{db: db, r2: r2}
}

func (h *AudioHandler) Presign(c *gin.Context) {
	var req models.PresignReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userID := middleware.GetUserID(c)
	measureID, _ := uuid.Parse(req.MeasureID)

	// Verify measure exists (via its section → lesson → teacher)
	var teacherID uuid.UUID
	err := h.db.QueryRow(context.Background(),
		`SELECT l.teacher_id FROM measures m
		 JOIN sections s ON s.id = m.section_id
		 JOIN lessons l ON l.id = s.lesson_id
		 WHERE m.id = $1`, measureID,
	).Scan(&teacherID)
	if err != nil || teacherID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
		return
	}

	r2Key := fmt.Sprintf("audio/%s/%s/%s", userID, measureID, req.FileName)
	url, err := h.r2.PresignPut(context.Background(), r2Key, 15*time.Minute)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Record in DB (upsert — one audio file per measure)
	var af models.AudioFile
	err = h.db.QueryRow(context.Background(),
		`INSERT INTO audio_files (measure_id, teacher_id, r2_key, name)
		 VALUES ($1,$2,$3,$4)
		 ON CONFLICT (r2_key) DO UPDATE SET name=$4
		 RETURNING id, measure_id, teacher_id, r2_key, name, created_at`,
		measureID, userID, r2Key, req.FileName,
	).Scan(&af.ID, &af.MeasureID, &af.TeacherID, &af.R2Key, &af.Name, &af.CreatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, models.PresignResp{
		UploadURL:   url,
		R2Key:       r2Key,
		PublicURL:   h.r2.PublicURL(r2Key),
		AudioFileID: af.ID,
	})
}

func (h *AudioHandler) Upload(c *gin.Context) {
	measureIDStr := c.PostForm("measure_id")
	measureID, err := uuid.Parse(measureIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid measure_id"})
		return
	}
	userID := middleware.GetUserID(c)
	ctx := context.Background()

	var teacherID uuid.UUID
	err = h.db.QueryRow(ctx,
		`SELECT l.teacher_id FROM measures m
		 JOIN sections s ON s.id = m.section_id
		 JOIN lessons l ON l.id = s.lesson_id
		 WHERE m.id = $1`, measureID,
	).Scan(&teacherID)
	if err != nil || teacherID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
		return
	}

	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing file"})
		return
	}
	defer file.Close()

	fileName := header.Filename
	contentType := header.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "audio/webm"
	}

	r2Key := fmt.Sprintf("audio/%s/%s/%s", userID, measureID, fileName)
	if err := h.r2.Put(ctx, r2Key, file, header.Size, contentType); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "r2 upload failed: " + err.Error()})
		return
	}

	// Remove any existing audio_files for this measure so there is always at most one.
	_, _ = h.db.Exec(ctx, `DELETE FROM audio_files WHERE measure_id = $1`, measureID)

	var af models.AudioFile
	err = h.db.QueryRow(ctx,
		`INSERT INTO audio_files (measure_id, teacher_id, r2_key, name)
		 VALUES ($1,$2,$3,$4)
		 RETURNING id, measure_id, teacher_id, r2_key, name, created_at`,
		measureID, userID, r2Key, fileName,
	).Scan(&af.ID, &af.MeasureID, &af.TeacherID, &af.R2Key, &af.Name, &af.CreatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, models.PresignResp{
		PublicURL:   h.r2.PublicURL(r2Key),
		AudioFileID: af.ID,
	})
}

func (h *AudioHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	userID := middleware.GetUserID(c)
	ctx := context.Background()

	var r2Key string
	err = h.db.QueryRow(ctx,
		`SELECT r2_key FROM audio_files WHERE id = $1 AND teacher_id = $2`, id, userID,
	).Scan(&r2Key)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	if err := h.r2.Delete(ctx, r2Key); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "r2 delete failed: " + err.Error()})
		return
	}

	_, err = h.db.Exec(ctx, `DELETE FROM audio_files WHERE id = $1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}
