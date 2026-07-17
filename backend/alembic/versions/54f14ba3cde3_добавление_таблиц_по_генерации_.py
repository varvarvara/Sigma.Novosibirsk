"""добавление таблиц по генерации расписания и превью расписания

Revision ID: 54f14ba3cde3
Revises: 8f95a25afdaa
Create Date: 2026-05-03 16:15:56.742286

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '54f14ba3cde3'
down_revision: Union[str, Sequence[str], None] = '8f95a25afdaa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.create_table(
        "schedule_generation",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("season_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("solver_status", sa.String(length=30), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("approved_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["season_id"], ["season.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_schedule_generation_id"),
        "schedule_generation",
        ["id"],
        unique=False,
    )

    op.create_table(
        "schedule_generation_item",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("generation_id", sa.Integer(), nullable=False),
        sa.Column("staff_id", sa.Integer(), nullable=False),
        sa.Column("course_class_id", sa.Integer(), nullable=False),
        sa.Column("slot_id", sa.Integer(), nullable=True),
        sa.Column("lesson_date", sa.Date(), nullable=False),
        sa.Column("lesson_time", sa.Time(), nullable=False),
        sa.Column("season_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["generation_id"], ["schedule_generation.id"]),
        sa.ForeignKeyConstraint(["staff_id"], ["staff.id"]),
        sa.ForeignKeyConstraint(["course_class_id"], ["course_class.id"]),
        sa.ForeignKeyConstraint(["slot_id"], ["slots.id"]),
        sa.ForeignKeyConstraint(["season_id"], ["season.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "generation_id",
            "staff_id",
            "lesson_date",
            "lesson_time",
            name="uq_schedule_generation_staff_datetime",
        ),
    )

    op.create_index(
        op.f("ix_schedule_generation_item_id"),
        "schedule_generation_item",
        ["id"],
        unique=False,
    )


def downgrade():
    op.drop_index(
        op.f("ix_schedule_generation_item_id"),
        table_name="schedule_generation_item",
    )
    op.drop_table("schedule_generation_item")

    op.drop_index(
        op.f("ix_schedule_generation_id"),
        table_name="schedule_generation",
    )
    op.drop_table("schedule_generation")