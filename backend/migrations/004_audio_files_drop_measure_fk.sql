-- audio_files.measure_id previously enforced FK to measures(id).
-- Students store measures as JSONB in practice_songs (no rows in measures table),
-- so student audio uploads fail the FK check. Drop the constraint; keep the column.
ALTER TABLE audio_files DROP CONSTRAINT IF EXISTS audio_files_measure_id_fkey;
