"""Create the complete Sigma schema baseline.

This is the first migration for a fresh database.  It intentionally contains
schema objects only; reference and application data are loaded separately.

Revision ID: 20260720_0001
Revises:
Create Date: 2026-07-20
"""

from pathlib import Path
from typing import Sequence, Union

from alembic import op


revision: str = "20260720_0001"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    schema_file = Path(__file__).with_name("baseline_schema.sql")
    op.execute(schema_file.read_text(encoding="utf-8"))


def downgrade() -> None:
    # Tables are dropped in dependency order. PostgreSQL then removes their
    # table-bound triggers; standalone routines and enum types are explicit.
    op.execute(
        """
        DROP TABLE IF EXISTS schedule_generation_item;
        DROP TABLE IF EXISTS schedule_generation;
        DROP TABLE IF EXISTS teacher_certificate;
        DROP TABLE IF EXISTS student_certificate;
        DROP TABLE IF EXISTS student_achievement;
        DROP TABLE IF EXISTS achievement;
        DROP TABLE IF EXISTS extracurricular_score;
        DROP TABLE IF EXISTS extracurricular_team_members;
        DROP TABLE IF EXISTS extracurricular_team;
        DROP TABLE IF EXISTS extracurricular_activity;
        DROP TABLE IF EXISTS gamification_level;
        DROP TABLE IF EXISTS gamification;
        DROP TABLE IF EXISTS course_feedback;
        DROP TABLE IF EXISTS attendance;
        DROP TABLE IF EXISTS enrollment;
        DROP TABLE IF EXISTS schedule;
        DROP TABLE IF EXISTS course_class;
        DROP TABLE IF EXISTS course;
        DROP TABLE IF EXISTS slots;
        DROP TABLE IF EXISTS pre_registration;
        DROP TABLE IF EXISTS feedback_control;
        DROP TABLE IF EXISTS intake_control;
        DROP TABLE IF EXISTS students;
        DROP TABLE IF EXISTS staff;
        DROP TABLE IF EXISTS season;

        DROP PROCEDURE IF EXISTS approve_pre_registration(BIGINT, TEXT);
        DROP FUNCTION IF EXISTS check_full_attendance_for_certificate();
        DROP FUNCTION IF EXISTS create_gamification_row();
        DROP FUNCTION IF EXISTS trg_extracurricular_gamification();
        DROP FUNCTION IF EXISTS trg_achievement_gamification();
        DROP FUNCTION IF EXISTS trg_attendance_gamification();
        DROP FUNCTION IF EXISTS trg_student_achievement_gamification();
        DROP FUNCTION IF EXISTS recalc_gamification(BIGINT);
        DROP FUNCTION IF EXISTS set_updated_at();

        DROP TYPE IF EXISTS certificate_statuses;
        DROP TYPE IF EXISTS enrollment_statuses;
        DROP TYPE IF EXISTS teacher_course_types;
        DROP TYPE IF EXISTS course_types;
        DROP TYPE IF EXISTS course_statuses;
        DROP TYPE IF EXISTS pre_registration_statuses;
        DROP TYPE IF EXISTS staff_roles;
        DROP TYPE IF EXISTS student_statuses;
        """
    )
