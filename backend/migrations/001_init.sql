CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS profiles (
    user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role       TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS batches (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id       UUID NOT NULL REFERENCES auth.users(id),
    name             TEXT NOT NULL,
    color            TEXT NOT NULL DEFAULT '#E8A020',
    schedule         TEXT NOT NULL,
    day              TEXT NOT NULL,
    "time"           TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id  UUID NOT NULL REFERENCES auth.users(id),
    user_id     UUID REFERENCES auth.users(id),
    batch_id    UUID NOT NULL REFERENCES batches(id),
    name        TEXT NOT NULL,
    initials    TEXT NOT NULL,
    level       TEXT NOT NULL CHECK (level IN ('Beginner','Intermediate','Advanced')),
    joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lessons (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id  UUID NOT NULL REFERENCES auth.users(id),
    batch_id    UUID NOT NULL REFERENCES batches(id),
    title       TEXT NOT NULL,
    youtube_url TEXT,
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sections (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id  UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    name       TEXT NOT NULL,
    position   INTEGER NOT NULL DEFAULT 0,
    tempo      INTEGER NOT NULL DEFAULT 80,
    loop       BOOLEAN NOT NULL DEFAULT FALSE,
    verse      TEXT NOT NULL DEFAULT '',
    order_idx  INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS measures (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    beats      JSONB NOT NULL DEFAULT '[]',
    order_idx  INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audio_files (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    measure_id UUID NOT NULL REFERENCES measures(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES auth.users(id),
    r2_key     TEXT NOT NULL UNIQUE,
    name       TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_batches_teacher   ON batches(teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_teacher  ON students(teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_batch    ON students(batch_id);
CREATE INDEX IF NOT EXISTS idx_students_user     ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_lessons_teacher   ON lessons(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lessons_batch     ON lessons(batch_id);
CREATE INDEX IF NOT EXISTS idx_sections_lesson   ON sections(lesson_id);
CREATE INDEX IF NOT EXISTS idx_measures_section  ON measures(section_id);
CREATE INDEX IF NOT EXISTS idx_audio_measure     ON audio_files(measure_id);
