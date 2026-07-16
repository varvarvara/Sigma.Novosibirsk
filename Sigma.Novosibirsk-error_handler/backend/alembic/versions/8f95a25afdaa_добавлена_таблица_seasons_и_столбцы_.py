"""Добавлена таблица seasons и столбцы season_id ко всем таблицам

Revision ID: 8f95a25afdaa
Revises: 506323b9d9d6
Create Date: 2026-04-10 19:47:39.566331

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8f95a25afdaa'
down_revision: Union[str, Sequence[str], None] = '506323b9d9d6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade():
    op.add_column('students', sa.Column('season_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_students_season', 'students', 'season', ['season_id'], ['id'])

    op.add_column('schedule', sa.Column('season_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_schedule_season', 'schedule', 'season', ['season_id'], ['id'])

    op.add_column('attendance', sa.Column('season_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_attendance_season', 'attendance', 'season', ['season_id'], ['id'])

    op.add_column('enrollment', sa.Column('season_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_enrollment_season', 'enrollment', 'season', ['season_id'], ['id'])

    op.add_column('course', sa.Column('season_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_course_season', 'course', 'season', ['season_id'], ['id'])

    op.add_column('course_class', sa.Column('season_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_course_class_season', 'course_class', 'season', ['season_id'], ['id'])

    op.add_column('achievement', sa.Column('season_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_achievement_season', 'achievement', 'season', ['season_id'], ['id'])

    op.add_column('student_achievement', sa.Column('season_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_student_achievement_season', 'student_achievement', 'season', ['season_id'], ['id'])

    op.add_column('student_certificate', sa.Column('season_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_student_certificate_season', 'student_certificate', 'season', ['season_id'], ['id'])

    op.add_column('feedback', sa.Column('season_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_feedback_season', 'feedback', 'season', ['season_id'], ['id'])

    op.add_column('slot', sa.Column('season_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_slot_season', 'slot', 'season', ['season_id'], ['id'])

    op.add_column('gamification', sa.Column('season_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_gamification_season', 'gamification', 'season', ['season_id'], ['id'])

    op.add_column('gamification_level', sa.Column('season_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_gamification_level_season', 'gamification_level', 'season', ['season_id'], ['id'])

    op.add_column('extracurricular_activity', sa.Column('season_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_extracurricular_activity_season', 'extracurricular_activity', 'season', ['season_id'], ['id'])

    op.add_column('extracurricular_team', sa.Column('season_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_extracurricular_team_season', 'extracurricular_team', 'season', ['season_id'], ['id'])

    op.add_column('extracurricular_team_member', sa.Column('season_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_extracurricular_team_member_season', 'extracurricular_team_member', 'season', ['season_id'], ['id'])

    op.add_column('extracurricular_score', sa.Column('season_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_extracurricular_score_season', 'extracurricular_score', 'season', ['season_id'], ['id'])


def downgrade():
    op.drop_constraint('fk_students_season', 'students', type_='foreignkey')
    op.drop_column('students', 'season_id')

    op.drop_constraint('fk_schedule_season', 'schedule', type_='foreignkey')
    op.drop_column('schedule', 'season_id')

    op.drop_constraint('fk_attendance_season', 'attendance', type_='foreignkey')
    op.drop_column('attendance', 'season_id')

    op.drop_constraint('fk_enrollment_season', 'enrollment', type_='foreignkey')
    op.drop_column('enrollment', 'season_id')

    op.drop_constraint('fk_course_season', 'course', type_='foreignkey')
    op.drop_column('course', 'season_id')

    op.drop_constraint('fk_course_class_season', 'course_class', type_='foreignkey')
    op.drop_column('course_class', 'season_id')

    op.drop_constraint('fk_achievement_season', 'achievement', type_='foreignkey')
    op.drop_column('achievement', 'season_id')

    op.drop_constraint('fk_student_achievement_season', 'student_achievement', type_='foreignkey')
    op.drop_column('student_achievement', 'season_id')

    op.drop_constraint('fk_student_certificate_season', 'student_certificate', type_='foreignkey')
    op.drop_column('student_certificate', 'season_id')

    op.drop_constraint('fk_feedback_season', 'feedback', type_='foreignkey')
    op.drop_column('feedback', 'season_id')

    op.drop_constraint('fk_slot_season', 'slot', type_='foreignkey')
    op.drop_column('slot', 'season_id')

    op.drop_constraint('fk_gamification_season', 'gamification', type_='foreignkey')
    op.drop_column('gamification', 'season_id')

    op.drop_constraint('fk_gamification_level_season', 'gamification_level', type_='foreignkey')
    op.drop_column('gamification_level', 'season_id')

    op.drop_constraint('fk_extracurricular_activity_season', 'extracurricular_activity', type_='foreignkey')
    op.drop_column('extracurricular_activity', 'season_id')

    op.drop_constraint('fk_extracurricular_team_season', 'extracurricular_team', type_='foreignkey')
    op.drop_column('extracurricular_team', 'season_id')

    op.drop_constraint('fk_extracurricular_team_member_season', 'extracurricular_team_member', type_='foreignkey')
    op.drop_column('extracurricular_team_member', 'season_id')

    op.drop_constraint('fk_extracurricular_score_season', 'extracurricular_score', type_='foreignkey')
    op.drop_column('extracurricular_score', 'season_id')