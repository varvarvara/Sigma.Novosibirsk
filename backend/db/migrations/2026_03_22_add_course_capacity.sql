ALTER TABLE course
    ADD COLUMN IF NOT EXISTS capacity INT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'course_capacity_positive'
    ) THEN
        ALTER TABLE course
            ADD CONSTRAINT course_capacity_positive CHECK (capacity IS NULL OR capacity >= 1);
    END IF;
END
$$;
