CREATE TABLE IF NOT EXISTS song_reactions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id     UUID        NOT NULL REFERENCES practice_songs(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction    TEXT        NOT NULL CHECK (reaction IN ('like','dislike')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (song_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_reactions_song ON song_reactions(song_id);
