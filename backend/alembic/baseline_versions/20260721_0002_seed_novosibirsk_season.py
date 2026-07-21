"""Seed the 2026 Novosibirsk season and its control rows.

Revision ID: 20260721_0002
Revises: 20260720_0001
Create Date: 2026-07-21
"""

from typing import Sequence, Union

from alembic import op


revision: str = "20260721_0002"
down_revision: Union[str, Sequence[str], None] = "20260720_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        INSERT INTO season (
            season_year,
            season_description,
            start_date,
            end_date
        )
        SELECT
            2026,
            'Сезон 2026 года, Новосибирск',
            DATE '2026-07-22',
            DATE '2026-07-30'
        WHERE NOT EXISTS (
            SELECT 1
            FROM season
            WHERE season_year = 2026
              AND start_date = DATE '2026-07-22'
              AND end_date = DATE '2026-07-30'
        );

        INSERT INTO intake_control (id, intake_closed)
        VALUES (1, FALSE)
        ON CONFLICT (id) DO NOTHING;

        INSERT INTO feedback_control (id, feedback_open, season_id)
        SELECT 1, FALSE, id
        FROM season
        WHERE season_year = 2026
          AND start_date = DATE '2026-07-22'
          AND end_date = DATE '2026-07-30'
        ORDER BY id
        LIMIT 1
        ON CONFLICT (id) DO NOTHING;
        """
    )


def downgrade() -> None:
    # Remove only untouched control rows. Delete the season only when no
    # application records reference it, avoiding destructive CASCADE effects.
    op.execute(
        """
        DELETE FROM feedback_control
        WHERE id = 1
          AND feedback_open = FALSE
          AND opened_at IS NULL
          AND opened_by IS NULL
          AND closed_at IS NULL
          AND closed_by IS NULL
          AND season_id IN (
              SELECT id
              FROM season
              WHERE season_year = 2026
                AND season_description = 'Сезон 2026 года, Новосибирск'
                AND start_date = DATE '2026-07-22'
                AND end_date = DATE '2026-07-30'
          );

        DELETE FROM intake_control
        WHERE id = 1
          AND intake_closed = FALSE
          AND closed_at IS NULL
          AND closed_by IS NULL;

        DELETE FROM season AS s
        WHERE s.season_year = 2026
          AND s.season_description = 'Сезон 2026 года, Новосибирск'
          AND s.start_date = DATE '2026-07-22'
          AND s.end_date = DATE '2026-07-30'
          AND NOT EXISTS (SELECT 1 FROM staff WHERE season_id = s.id)
          AND NOT EXISTS (SELECT 1 FROM students WHERE season_id = s.id)
          AND NOT EXISTS (SELECT 1 FROM pre_registration WHERE season_id = s.id)
          AND NOT EXISTS (SELECT 1 FROM slots WHERE season_id = s.id)
          AND NOT EXISTS (SELECT 1 FROM course WHERE season_id = s.id)
          AND NOT EXISTS (SELECT 1 FROM course_class WHERE season_id = s.id)
          AND NOT EXISTS (SELECT 1 FROM schedule WHERE season_id = s.id)
          AND NOT EXISTS (SELECT 1 FROM attendance WHERE season_id = s.id)
          AND NOT EXISTS (SELECT 1 FROM enrollment WHERE season_id = s.id)
          AND NOT EXISTS (SELECT 1 FROM course_feedback WHERE season_id = s.id)
          AND NOT EXISTS (SELECT 1 FROM gamification WHERE season_id = s.id)
          AND NOT EXISTS (SELECT 1 FROM gamification_level WHERE season_id = s.id)
          AND NOT EXISTS (SELECT 1 FROM extracurricular_activity WHERE season_id = s.id)
          AND NOT EXISTS (SELECT 1 FROM extracurricular_team WHERE season_id = s.id)
          AND NOT EXISTS (SELECT 1 FROM extracurricular_team_members WHERE season_id = s.id)
          AND NOT EXISTS (SELECT 1 FROM extracurricular_score WHERE season_id = s.id)
          AND NOT EXISTS (SELECT 1 FROM achievement WHERE season_id = s.id)
          AND NOT EXISTS (SELECT 1 FROM student_achievement WHERE season_id = s.id)
          AND NOT EXISTS (SELECT 1 FROM student_certificate WHERE season_id = s.id)
          AND NOT EXISTS (SELECT 1 FROM teacher_certificate WHERE season_id = s.id)
          AND NOT EXISTS (SELECT 1 FROM schedule_generation WHERE season_id = s.id)
          AND NOT EXISTS (SELECT 1 FROM schedule_generation_item WHERE season_id = s.id);
        """
    )
