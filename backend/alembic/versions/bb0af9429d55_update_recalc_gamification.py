"""update recalc gamification

Revision ID: bb0af9429d55
Revises: 
Create Date: 2026-03-25 16:05:57.172657

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bb0af9429d55'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
    CREATE OR REPLACE FUNCTION recalc_gamification(p_student_id BIGINT)
    RETURNS VOID
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

        SELECT COALESCE(SUM(a.ex_course_score), 0)
        INTO v_extracurricular_score
        FROM extracurricular_team_members m
        JOIN extracurricular_score s ON m.team_id = s.team_id
        JOIN extracurricular_activity a ON s.ex_course_id = a.id
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
    """)

    op.execute("""
    CREATE OR REPLACE FUNCTION trg_student_achievement_gamification()
    RETURNS TRIGGER
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
    """)
    
    op.execute("""
    DROP TRIGGER IF EXISTS trg_student_achievement_gamification ON student_achievement;
    """)

    op.execute("""
    CREATE TRIGGER trg_student_achievement_gamification
    AFTER INSERT OR UPDATE OR DELETE ON student_achievement
    FOR EACH ROW
    EXECUTE FUNCTION trg_student_achievement_gamification();
    """)


def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS trg_student_achievement_gamification ON student_achievement;")
    op.execute("DROP FUNCTION IF EXISTS trg_student_achievement_gamification();")
    op.execute("DROP FUNCTION IF EXISTS recalc_gamification(BIGINT);")
