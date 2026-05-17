package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type Role string

const (
	RoleTeacher Role = "teacher"
	RoleStudent Role = "student"
)

type Profile struct {
	UserID    uuid.UUID `json:"user_id"`
	Role      Role      `json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

type Batch struct {
	ID              uuid.UUID `json:"id"`
	TeacherID       uuid.UUID `json:"teacher_id"`
	Name            string    `json:"name"`
	Color           string    `json:"color"`
	Schedule        string    `json:"schedule"`
	Day             string    `json:"day"`
	Time            string    `json:"time"`
	DurationMinutes int       `json:"duration_minutes"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type Student struct {
	ID         uuid.UUID  `json:"id"`
	TeacherID  uuid.UUID  `json:"teacher_id"`
	UserID     *uuid.UUID `json:"user_id,omitempty"`
	BatchID    uuid.UUID  `json:"batch_id"`
	Name       string     `json:"name"`
	Initials   string     `json:"initials"`
	Level      string     `json:"level"`
	Email      *string    `json:"email,omitempty"`
	JoinedDate time.Time  `json:"joined_date"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
}

type PracticeSong struct {
	ID            uuid.UUID       `json:"id"`
	StudentUserID uuid.UUID       `json:"student_user_id"`
	Title         string          `json:"title"`
	Sections      json.RawMessage `json:"sections"`
	Visibility    string          `json:"visibility"`
	CreatedAt     time.Time       `json:"created_at"`
	UpdatedAt     time.Time       `json:"updated_at"`
}

type Lesson struct {
	ID           uuid.UUID `json:"id"`
	TeacherID    uuid.UUID `json:"teacher_id"`
	BatchID      uuid.UUID `json:"batch_id"`
	Title        string    `json:"title"`
	YoutubeURL   *string   `json:"youtube_url,omitempty"`
	Notes        *string   `json:"notes,omitempty"`
	SectionCount int       `json:"section_count,omitempty"`
	MeasureCount int       `json:"measure_count,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	Sections     []Section `json:"sections,omitempty"`
}

type Section struct {
	ID        uuid.UUID `json:"id"`
	LessonID  uuid.UUID `json:"lesson_id"`
	Name      string    `json:"name"`
	Position  int       `json:"position"`
	Tempo     int       `json:"tempo"`
	Loop      bool      `json:"loop"`
	Verse     string    `json:"verse"`
	OrderIdx  int       `json:"order_idx"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Measures  []Measure `json:"measures,omitempty"`
}

type Measure struct {
	ID        uuid.UUID  `json:"id"`
	SectionID uuid.UUID  `json:"section_id"`
	Beats     [][]string `json:"beats"`
	OrderIdx  int        `json:"order_idx"`
	CreatedAt time.Time  `json:"created_at"`
	AudioFile *AudioFile `json:"audio_file,omitempty"`
}

type AudioFile struct {
	ID        uuid.UUID `json:"id"`
	MeasureID uuid.UUID `json:"measure_id"`
	TeacherID uuid.UUID `json:"teacher_id"`
	R2Key     string    `json:"r2_key"`
	Name      string    `json:"name"`
	URL       string    `json:"url"`
	CreatedAt time.Time `json:"created_at"`
}

// Request bodies

type CreateBatchReq struct {
	Name            string `json:"name" binding:"required"`
	Color           string `json:"color" binding:"required"`
	Schedule        string `json:"schedule" binding:"required"`
	Day             string `json:"day" binding:"required"`
	Time            string `json:"time" binding:"required"`
	DurationMinutes int    `json:"duration_minutes" binding:"required,min=1"`
}

type UpdateBatchReq struct {
	Name            string `json:"name"`
	Color           string `json:"color"`
	Schedule        string `json:"schedule"`
	Day             string `json:"day"`
	Time            string `json:"time"`
	DurationMinutes int    `json:"duration_minutes"`
}

type CreateStudentReq struct {
	BatchID  string `json:"batch_id" binding:"required,uuid"`
	Name     string `json:"name" binding:"required"`
	Initials string `json:"initials" binding:"required"`
	Level    string `json:"level" binding:"required,oneof=Beginner Intermediate Advanced"`
	Email    string `json:"email"`
}

type UpdateStudentReq struct {
	BatchID  string `json:"batch_id"`
	Name     string `json:"name"`
	Initials string `json:"initials"`
	Level    string `json:"level"`
	Email    string `json:"email"`
}

type CreatePracticeSongReq struct {
	Title      string          `json:"title"`
	Sections   json.RawMessage `json:"sections"`
	Visibility string          `json:"visibility" binding:"oneof=public private"`
}

type UpdatePracticeSongReq struct {
	Title      string          `json:"title"`
	Sections   json.RawMessage `json:"sections"`
	Visibility string          `json:"visibility" binding:"oneof=public private"`
}

type CreateLessonReq struct {
	BatchID    string  `json:"batch_id" binding:"required,uuid"`
	Title      string  `json:"title" binding:"required"`
	YoutubeURL *string `json:"youtube_url"`
	Notes      *string `json:"notes"`
}

type UpdateLessonReq struct {
	BatchID    string     `json:"batch_id"`
	Title      string     `json:"title"`
	YoutubeURL *string    `json:"youtube_url"`
	Notes      *string    `json:"notes"`
	Sections   []Section  `json:"sections"`
}

type PresignReq struct {
	MeasureID string `json:"measure_id" binding:"required,uuid"`
	FileName  string `json:"file_name" binding:"required"`
}

type PresignResp struct {
	UploadURL   string    `json:"upload_url"`
	R2Key       string    `json:"r2_key"`
	PublicURL   string    `json:"public_url"`
	AudioFileID uuid.UUID `json:"audio_file_id"`
}
