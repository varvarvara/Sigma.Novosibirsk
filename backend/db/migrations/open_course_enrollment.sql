-- Open student course selection (intake) and ensure courses are published.
UPDATE intake_control
SET intake_closed = FALSE,
    closed_at = NULL,
    closed_by = NULL
WHERE id = 1;

INSERT INTO intake_control (id, intake_closed)
SELECT 1, FALSE
WHERE NOT EXISTS (SELECT 1 FROM intake_control WHERE id = 1);

UPDATE course
SET course_status = 'Published'
WHERE course_status = 'Draft';
