CREATE OR REPLACE FUNCTION public.recalc_gamification(p_student_id bigint) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_attendance_score INT;
    v_achievement_score INT;
    v_extracurricular_score INT;
    v_total_score INT;
    v_level INT;

BEGIN

SELECT COUNT(*) * 3
INTO v_attendance_score
FROM attendance
WHERE student_id = p_student_id
AND attendance_status = TRUE;

SELECT COALESCE(SUM(a.achievement_score), 0)
INTO v_achievement_score
FROM student_achievement sa
JOIN achievement a ON sa.achievement_id = a.id
WHERE sa.student_id = p_student_id;

SELECT COALESCE(SUM(s.ex_team_score), 0)
INTO v_extracurricular_score
FROM extracurricular_team_members m
JOIN extracurricular_score s ON m.team_id = s.team_id
WHERE m.student_id = p_student_id;

v_total_score :=
COALESCE(v_attendance_score, 0) +
COALESCE(v_achievement_score, 0) +
COALESCE(v_extracurricular_score, 0);

SELECT gamification_level
INTO v_level
FROM gamification_level
WHERE gamification_level_score <= v_total_score
ORDER BY gamification_level_score DESC
LIMIT 1;

IF NOT EXISTS (
    SELECT 1 FROM gamification WHERE student_id = p_student_id
) THEN
    INSERT INTO gamification (
        student_id,
        attendance_score,
        achievement_score,
        extracurricular_score,
        total_score,
        level
    )
    VALUES (
        p_student_id,
        COALESCE(v_attendance_score, 0),
        COALESCE(v_achievement_score, 0),
        COALESCE(v_extracurricular_score, 0),
        v_total_score,
        COALESCE(v_level, 0)
    );
ELSE
    UPDATE gamification
    SET
        attendance_score = COALESCE(v_attendance_score, 0),
        achievement_score = COALESCE(v_achievement_score, 0),
        extracurricular_score = COALESCE(v_extracurricular_score, 0),
        total_score = v_total_score,
        level = COALESCE(v_level, 0)
    WHERE student_id = p_student_id;
END IF;

END;
$$;

CREATE OR REPLACE FUNCTION public.check_full_attendance_for_certificate() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN

    IF NEW.certificate_status = 'issued' THEN

        IF EXISTS (
            SELECT 1
            FROM attendance a
            JOIN schedule s ON a.schedule_id = s.id
            JOIN course_class cc ON s.course_class_id = cc.id
            WHERE a.student_id = NEW.student_id
              AND cc.course_id = NEW.course_id
              AND a.attendance_status = FALSE
        ) THEN
            RAISE EXCEPTION 
            'Нельзя выдать сертификат: у студента есть пропуски на курсе';
        END IF;

    END IF;

    RETURN NEW;

END;
$$;

CREATE OR REPLACE FUNCTION public.create_gamification_row() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
INSERT INTO gamification(student_id)
VALUES(NEW.id);
RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.recalc_gamification_all() RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    r RECORD;
BEGIN

FOR r IN
    SELECT student_id FROM gamification
LOOP
    PERFORM recalc_gamification(r.student_id);
END LOOP;

END;
$$;

CREATE OR REPLACE FUNCTION public.set_extracurricular_score() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.ex_team_score IS NULL OR NEW.ex_team_score = 0 THEN
        SELECT ex_course_score
        INTO NEW.ex_team_score
        FROM extracurricular_activity
        WHERE id = NEW.ex_course_id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_achievement_gamification() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM recalc_gamification(NEW.student_id);
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_attendance_gamification() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM recalc_gamification(NEW.student_id);
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_extracurricular_gamification() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    student_record RECORD;
BEGIN
    FOR student_record IN
        SELECT student_id
        FROM extracurricular_team_members
        WHERE team_id = NEW.team_id
    LOOP
        PERFORM recalc_gamification(student_record.student_id);
    END LOOP;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_student_achievement_gamification() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM recalc_gamification(OLD.student_id);
        RETURN OLD;
    ELSE
        PERFORM recalc_gamification(NEW.student_id);
        RETURN NEW;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_team_members_gamification() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM recalc_gamification(NEW.student_id);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS achievement_gamification_trigger ON student_achievement;
CREATE TRIGGER achievement_gamification_trigger AFTER INSERT OR UPDATE ON public.student_achievement FOR EACH ROW EXECUTE FUNCTION public.trg_achievement_gamification();

DROP TRIGGER IF EXISTS attendance_gamification_trigger ON attendance;
CREATE TRIGGER attendance_gamification_trigger AFTER INSERT OR UPDATE ON public.attendance FOR EACH ROW EXECUTE FUNCTION public.trg_attendance_gamification();

DROP TRIGGER IF EXISTS extracurricular_gamification_trigger ON extracurricular_score;
CREATE TRIGGER extracurricular_gamification_trigger AFTER INSERT OR UPDATE ON public.extracurricular_score FOR EACH ROW EXECUTE FUNCTION public.trg_extracurricular_gamification();

DROP TRIGGER IF EXISTS student_gamification_init ON students;
CREATE TRIGGER student_gamification_init AFTER INSERT ON public.students FOR EACH ROW EXECUTE FUNCTION public.create_gamification_row();

DROP TRIGGER IF EXISTS team_members_gamification_trigger ON extracurricular_team_members;
CREATE TRIGGER team_members_gamification_trigger AFTER INSERT ON public.extracurricular_team_members FOR EACH ROW EXECUTE FUNCTION public.trg_team_members_gamification();

DROP TRIGGER IF EXISTS trg_check_full_attendance_for_certificate ON student_certificate;
CREATE TRIGGER trg_check_full_attendance_for_certificate BEFORE INSERT OR UPDATE ON public.student_certificate FOR EACH ROW EXECUTE FUNCTION public.check_full_attendance_for_certificate();

DROP TRIGGER IF EXISTS trg_course_updated_at ON course;
CREATE TRIGGER trg_course_updated_at BEFORE UPDATE ON public.course FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_extracurricular_score ON extracurricular_score;
CREATE TRIGGER trg_set_extracurricular_score BEFORE INSERT ON public.extracurricular_score FOR EACH ROW EXECUTE FUNCTION public.set_extracurricular_score();

DROP TRIGGER IF EXISTS trg_student_achievement_gamification ON student_achievement;
CREATE TRIGGER trg_student_achievement_gamification AFTER INSERT OR DELETE OR UPDATE ON public.student_achievement FOR EACH ROW EXECUTE FUNCTION public.trg_student_achievement_gamification();
