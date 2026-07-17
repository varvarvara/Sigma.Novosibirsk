-- Adaptation for teacher pre-registration/profile fields and course type split.
-- Safe to run multiple times.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'teacher_course_types') THEN
        CREATE TYPE teacher_course_types AS ENUM ('Olympiad', 'Author');
    END IF;
END
$$;

-- staff: add teacher profile fields kept after approve
ALTER TABLE staff
    ADD COLUMN IF NOT EXISTS birth_date DATE,
    ADD COLUMN IF NOT EXISTS university VARCHAR(150),
    ADD COLUMN IF NOT EXISTS study_direction VARCHAR(150),
    ADD COLUMN IF NOT EXISTS study_year INT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'staff_study_year_check'
    ) THEN
        ALTER TABLE staff
            ADD CONSTRAINT staff_study_year_check CHECK (study_year BETWEEN 1 AND 6);
    END IF;
END
$$;

-- pre_registration: add fields collected before approve
ALTER TABLE pre_registration
    ADD COLUMN IF NOT EXISTS birth_date DATE,
    ADD COLUMN IF NOT EXISTS university VARCHAR(150),
    ADD COLUMN IF NOT EXISTS study_direction VARCHAR(150),
    ADD COLUMN IF NOT EXISTS study_year INT,
    ADD COLUMN IF NOT EXISTS proposed_course_title VARCHAR(150),
    ADD COLUMN IF NOT EXISTS proposed_course_type teacher_course_types,
    ADD COLUMN IF NOT EXISTS proposed_course_description VARCHAR(500);

-- Backfill existing rows so NOT NULL constraints can be applied safely.
UPDATE pre_registration
SET
    birth_date = COALESCE(birth_date, DATE '2000-01-01'),
    university = COALESCE(university, 'Unknown University'),
    study_direction = COALESCE(study_direction, 'Unknown Direction'),
    study_year = COALESCE(study_year, 1),
    proposed_course_title = COALESCE(proposed_course_title, 'TBD Course'),
    proposed_course_type = COALESCE(proposed_course_type, 'Author'::teacher_course_types),
    proposed_course_description = COALESCE(proposed_course_description, 'No description yet')
WHERE
    birth_date IS NULL
    OR university IS NULL
    OR study_direction IS NULL
    OR study_year IS NULL
    OR proposed_course_title IS NULL
    OR proposed_course_type IS NULL
    OR proposed_course_description IS NULL;

ALTER TABLE pre_registration
    ALTER COLUMN birth_date SET NOT NULL,
    ALTER COLUMN university SET NOT NULL,
    ALTER COLUMN study_direction SET NOT NULL,
    ALTER COLUMN study_year SET NOT NULL,
    ALTER COLUMN proposed_course_title SET NOT NULL,
    ALTER COLUMN proposed_course_type SET NOT NULL,
    ALTER COLUMN proposed_course_description SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'pre_registration_study_year_check'
    ) THEN
        ALTER TABLE pre_registration
            ADD CONSTRAINT pre_registration_study_year_check CHECK (study_year BETWEEN 1 AND 6);
    END IF;
END
$$;

-- course: split old semantic "duration" from teacher course type
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'course'
          AND column_name = 'course_type'
    )
    AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'course'
          AND column_name = 'course_duration'
    ) THEN
        ALTER TABLE course RENAME COLUMN course_type TO course_duration;
    END IF;
END
$$;

ALTER TABLE course
    ADD COLUMN IF NOT EXISTS course_type teacher_course_types;

UPDATE course
SET course_type = 'Author'::teacher_course_types
WHERE course_type IS NULL;

ALTER TABLE course
    ALTER COLUMN course_type SET DEFAULT 'Author'::teacher_course_types,
    ALTER COLUMN course_type SET NOT NULL;
