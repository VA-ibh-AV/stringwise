-- Email on students for account linking
ALTER TABLE students ADD COLUMN IF NOT EXISTS email TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_email ON students(email) WHERE email IS NOT NULL;

-- Student practice songs (sections stored as JSONB)
CREATE TABLE IF NOT EXISTS practice_songs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_user_id UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT        NOT NULL DEFAULT 'Untitled',
  sections        JSONB       NOT NULL DEFAULT '[]',
  visibility      TEXT        NOT NULL DEFAULT 'private'
                              CHECK (visibility IN ('public','private')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_practice_student ON practice_songs(student_user_id);
CREATE INDEX IF NOT EXISTS idx_practice_public  ON practice_songs(visibility) WHERE visibility = 'public';
