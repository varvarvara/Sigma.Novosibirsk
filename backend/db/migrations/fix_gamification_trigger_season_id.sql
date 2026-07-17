-- Run once if student signup returns HTTP 500 (gamification trigger missing season_id).
-- Example: docker compose exec db psql -U sigma -d sigma -f db/migrations/fix_gamification_trigger_season_id.sql

CREATE OR REPLACE FUNCTION create_gamification_row()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO gamification(student_id, season_id)
    VALUES (NEW.id, NEW.season_id);
    RETURN NEW;
END;
$$;
