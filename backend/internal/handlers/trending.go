package handlers

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"stringwise/api/internal/middleware"
	"stringwise/api/internal/models"
)

type TrendingHandler struct{ db *pgxpool.Pool }

func NewTrendingHandler(db *pgxpool.Pool) *TrendingHandler { return &TrendingHandler{db: db} }

func (h *TrendingHandler) List(c *gin.Context) {
	rows, err := h.db.Query(context.Background(), `
		SELECT
			ps.id,
			ps.title,
			ps.student_user_id,
			COALESCE(u.raw_user_meta_data->>'full_name', u.email, 'Anonymous') AS author_name,
			COALESCE(jsonb_array_length(ps.sections), 0) AS sections_count,
			COUNT(r.id) FILTER (WHERE r.reaction = 'like')    AS like_count,
			COUNT(r.id) FILTER (WHERE r.reaction = 'dislike') AS dislike_count,
			ps.created_at
		FROM practice_songs ps
		JOIN auth.users u ON u.id = ps.student_user_id
		LEFT JOIN song_reactions r ON r.song_id = ps.id
		WHERE ps.visibility = 'public'
		GROUP BY ps.id, u.raw_user_meta_data, u.email
		ORDER BY (COUNT(r.id) FILTER (WHERE r.reaction = 'like') -
		          COUNT(r.id) FILTER (WHERE r.reaction = 'dislike')) DESC,
		         ps.created_at DESC
		LIMIT 50
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	songs := make([]models.TrendingSong, 0)
	for rows.Next() {
		var s models.TrendingSong
		if err := rows.Scan(&s.ID, &s.Title, &s.StudentUserID, &s.AuthorName,
			&s.SectionsCount, &s.LikeCount, &s.DislikeCount, &s.CreatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		songs = append(songs, s)
	}

	// If authenticated, fetch my_reaction for each song
	userID := middleware.GetUserID(c)
	if userID != (uuid.UUID{}) && len(songs) > 0 {
		ids := make([]uuid.UUID, len(songs))
		for i, s := range songs {
			ids[i] = s.ID
		}
		reactionRows, err := h.db.Query(context.Background(),
			`SELECT song_id, reaction FROM song_reactions WHERE user_id = $1 AND song_id = ANY($2)`,
			userID, ids,
		)
		if err == nil {
			defer reactionRows.Close()
			reactionMap := make(map[uuid.UUID]string)
			for reactionRows.Next() {
				var songID uuid.UUID
				var reaction string
				if err := reactionRows.Scan(&songID, &reaction); err == nil {
					reactionMap[songID] = reaction
				}
			}
			for i := range songs {
				if r, ok := reactionMap[songs[i].ID]; ok {
					songs[i].MyReaction = &r
				}
			}
		}
	}

	c.JSON(http.StatusOK, songs)
}

func (h *TrendingHandler) GetSections(c *gin.Context) {
	songID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	var sections []byte
	err = h.db.QueryRow(context.Background(),
		`SELECT sections FROM practice_songs WHERE id = $1 AND visibility = 'public'`,
		songID,
	).Scan(&sections)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.Data(http.StatusOK, "application/json", sections)
}

func (h *TrendingHandler) React(c *gin.Context) {
	songID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid song id"})
		return
	}
	userID := middleware.GetUserID(c)

	var req models.ReactReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Reaction == nil {
		_, err = h.db.Exec(context.Background(),
			`DELETE FROM song_reactions WHERE song_id = $1 AND user_id = $2`,
			songID, userID)
	} else {
		if *req.Reaction != "like" && *req.Reaction != "dislike" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "reaction must be like or dislike"})
			return
		}
		_, err = h.db.Exec(context.Background(),
			`INSERT INTO song_reactions (song_id, user_id, reaction)
			 VALUES ($1, $2, $3)
			 ON CONFLICT (song_id, user_id) DO UPDATE SET reaction = $3`,
			songID, userID, *req.Reaction)
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var likeCount, dislikeCount int
	if err := h.db.QueryRow(context.Background(),
		`SELECT
			COUNT(*) FILTER (WHERE reaction = 'like'),
			COUNT(*) FILTER (WHERE reaction = 'dislike')
		 FROM song_reactions WHERE song_id = $1`, songID,
	).Scan(&likeCount, &dislikeCount); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"like_count":    likeCount,
		"dislike_count": dislikeCount,
		"my_reaction":   req.Reaction,
	})
}
