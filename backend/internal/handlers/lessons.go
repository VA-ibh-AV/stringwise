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
	"stringwise/api/internal/storage"
)

type LessonHandler struct {
	db *pgxpool.Pool
	r2 *storage.R2Client
}

func NewLessonHandler(db *pgxpool.Pool, r2 *storage.R2Client) *LessonHandler {
	return &LessonHandler{db: db, r2: r2}
}

func (h *LessonHandler) List(c *gin.Context) {
	userID := middleware.GetUserID(c)
	role := middleware.GetRole(c)
	ctx := context.Background()

	const teacherQ = `
		SELECT l.id, l.teacher_id, l.batch_id, l.title, l.youtube_url, l.notes,
		       l.created_at, l.updated_at,
		       COUNT(DISTINCT s.id)::int, COUNT(m.id)::int
		FROM lessons l
		LEFT JOIN sections s ON s.lesson_id = l.id
		LEFT JOIN measures m ON m.section_id = s.id
		WHERE l.teacher_id = $1
		GROUP BY l.id
		ORDER BY l.updated_at DESC`

	const studentQ = `
		SELECT l.id, l.teacher_id, l.batch_id, l.title, l.youtube_url, l.notes,
		       l.created_at, l.updated_at,
		       COUNT(DISTINCT s.id)::int, COUNT(m.id)::int
		FROM lessons l
		JOIN students st ON st.batch_id = l.batch_id
		LEFT JOIN sections s ON s.lesson_id = l.id
		LEFT JOIN measures m ON m.section_id = s.id
		WHERE st.user_id = $1
		GROUP BY l.id
		ORDER BY l.updated_at DESC`

	var q string
	if role == models.RoleTeacher {
		q = teacherQ
	} else {
		q = studentQ
	}

	rows, err := h.db.Query(ctx, q, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	lessons := []models.Lesson{}
	for rows.Next() {
		var l models.Lesson
		if err := rows.Scan(
			&l.ID, &l.TeacherID, &l.BatchID, &l.Title, &l.YoutubeURL, &l.Notes,
			&l.CreatedAt, &l.UpdatedAt, &l.SectionCount, &l.MeasureCount,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		lessons = append(lessons, l)
	}
	c.JSON(http.StatusOK, lessons)
}

func (h *LessonHandler) Get(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	userID := middleware.GetUserID(c)
	role := middleware.GetRole(c)
	ctx := context.Background()

	var lesson models.Lesson
	err = h.db.QueryRow(ctx,
		`SELECT id, teacher_id, batch_id, title, youtube_url, notes, created_at, updated_at
		 FROM lessons WHERE id = $1`, id,
	).Scan(&lesson.ID, &lesson.TeacherID, &lesson.BatchID, &lesson.Title, &lesson.YoutubeURL, &lesson.Notes, &lesson.CreatedAt, &lesson.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "lesson not found"})
		return
	}

	if role == models.RoleTeacher && lesson.TeacherID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
		return
	}

	sRows, err := h.db.Query(ctx,
		`SELECT id, lesson_id, name, position, tempo, loop, verse, order_idx, created_at, updated_at
		 FROM sections WHERE lesson_id = $1 ORDER BY order_idx`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer sRows.Close()

	for sRows.Next() {
		var s models.Section
		if err := sRows.Scan(&s.ID, &s.LessonID, &s.Name, &s.Position, &s.Tempo, &s.Loop, &s.Verse, &s.OrderIdx, &s.CreatedAt, &s.UpdatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		mRows, err := h.db.Query(ctx,
			`SELECT m.id, m.section_id, m.beats, m.order_idx, m.created_at,
			        af.id, af.r2_key, af.name
			 FROM measures m
			 LEFT JOIN LATERAL (
			     SELECT id, r2_key, name FROM audio_files
			     WHERE measure_id = m.id
			     ORDER BY created_at DESC
			     LIMIT 1
			 ) af ON true
			 WHERE m.section_id = $1 ORDER BY m.order_idx`, s.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		for mRows.Next() {
			var m models.Measure
			var beatsJSON []byte
			var afID, afKey, afName *string
			if err := mRows.Scan(&m.ID, &m.SectionID, &beatsJSON, &m.OrderIdx, &m.CreatedAt, &afID, &afKey, &afName); err != nil {
				mRows.Close()
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			_ = json.Unmarshal(beatsJSON, &m.Beats)
			if afID != nil {
				afUUID, _ := uuid.Parse(*afID)
				m.AudioFile = &models.AudioFile{
					ID:    afUUID,
					R2Key: *afKey,
					Name:  *afName,
					URL:   h.r2.PublicURL(*afKey),
				}
			}
			s.Measures = append(s.Measures, m)
		}
		mRows.Close()
		lesson.Sections = append(lesson.Sections, s)
	}

	c.JSON(http.StatusOK, lesson)
}

func (h *LessonHandler) Create(c *gin.Context) {
	var req models.CreateLessonReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	batchID, _ := uuid.Parse(req.BatchID)
	userID := middleware.GetUserID(c)

	var l models.Lesson
	err := h.db.QueryRow(context.Background(),
		`INSERT INTO lessons (teacher_id, batch_id, title, youtube_url, notes)
		 VALUES ($1,$2,$3,$4,$5)
		 RETURNING id, teacher_id, batch_id, title, youtube_url, notes, created_at, updated_at`,
		userID, batchID, req.Title, req.YoutubeURL, req.Notes,
	).Scan(&l.ID, &l.TeacherID, &l.BatchID, &l.Title, &l.YoutubeURL, &l.Notes, &l.CreatedAt, &l.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, l)
}

func (h *LessonHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	var req models.UpdateLessonReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userID := middleware.GetUserID(c)
	ctx := context.Background()

	tx, err := h.db.Begin(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer tx.Rollback(ctx)

	var batchID *uuid.UUID
	if req.BatchID != "" {
		bid, _ := uuid.Parse(req.BatchID)
		batchID = &bid
	}

	var l models.Lesson
	err = tx.QueryRow(ctx,
		`UPDATE lessons SET
		   batch_id    = COALESCE($3, batch_id),
		   title       = COALESCE(NULLIF($4,''), title),
		   youtube_url = $5,
		   notes       = $6,
		   updated_at  = $7
		 WHERE id = $1 AND teacher_id = $2
		 RETURNING id, teacher_id, batch_id, title, youtube_url, notes, created_at, updated_at`,
		id, userID, batchID, req.Title, req.YoutubeURL, req.Notes, time.Now(),
	).Scan(&l.ID, &l.TeacherID, &l.BatchID, &l.Title, &l.YoutubeURL, &l.Notes, &l.CreatedAt, &l.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Replace sections and measures (cascades delete measures + audio_files).
	// Preserve audio_files by collecting them before delete and reinserting after.
	if len(req.Sections) > 0 {
		type audioFileRow struct {
			measureID uuid.UUID
			teacherID uuid.UUID
			r2Key     string
			name      string
		}
		var preserved []audioFileRow
		afRows, _ := tx.Query(ctx,
			`SELECT af.measure_id, af.teacher_id, af.r2_key, af.name
			 FROM audio_files af
			 JOIN measures m ON m.id = af.measure_id
			 JOIN sections s ON s.id = m.section_id
			 WHERE s.lesson_id = $1`, id)
		if afRows != nil {
			for afRows.Next() {
				var a audioFileRow
				_ = afRows.Scan(&a.measureID, &a.teacherID, &a.r2Key, &a.name)
				preserved = append(preserved, a)
			}
			afRows.Close()
		}

		if _, err = tx.Exec(ctx, `DELETE FROM sections WHERE lesson_id = $1`, id); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		for si, sec := range req.Sections {
			var sID uuid.UUID
			if err = tx.QueryRow(ctx,
				`INSERT INTO sections (id, lesson_id, name, position, tempo, loop, verse, order_idx)
				 VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
				sec.ID, id, sec.Name, sec.Position, sec.Tempo, sec.Loop, sec.Verse, si,
			).Scan(&sID); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			for mi, meas := range sec.Measures {
				beatsJSON, _ := json.Marshal(meas.Beats)
				if _, err = tx.Exec(ctx,
					`INSERT INTO measures (id, section_id, beats, order_idx) VALUES ($1,$2,$3,$4)`,
					meas.ID, sID, beatsJSON, mi,
				); err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
				}
			}
		}

		for _, af := range preserved {
			_, _ = tx.Exec(ctx,
				`INSERT INTO audio_files (measure_id, teacher_id, r2_key, name)
				 VALUES ($1,$2,$3,$4)
				 ON CONFLICT (r2_key) DO UPDATE SET name=$4`,
				af.measureID, af.teacherID, af.r2Key, af.name)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, l)
}

func (h *LessonHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	userID := middleware.GetUserID(c)
	_, err = h.db.Exec(context.Background(),
		`DELETE FROM lessons WHERE id = $1 AND teacher_id = $2`, id, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}
