-- Additive only: historical rows remain version 1 until read/projected and saved.
ALTER TABLE question_stats ADD COLUMN IF NOT EXISTS question_version integer NOT NULL DEFAULT 1;
ALTER TABLE question_stats ADD COLUMN IF NOT EXISTS revision_history jsonb NOT NULL DEFAULT '[]'::jsonb;
