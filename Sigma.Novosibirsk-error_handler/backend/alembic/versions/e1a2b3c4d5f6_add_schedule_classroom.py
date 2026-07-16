"""add schedule classroom

Revision ID: e1a2b3c4d5f6
Revises: c7e8f9a0b1c2
Create Date: 2026-05-18 20:20:00.000000

"""
from typing import Sequence, Union

from alembic import op


revision: str = "e1a2b3c4d5f6"
down_revision: Union[str, Sequence[str], None] = "c7e8f9a0b1c2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE schedule ADD COLUMN IF NOT EXISTS classroom VARCHAR(20)")
    op.execute("ALTER TABLE schedule_generation_item ADD COLUMN IF NOT EXISTS classroom VARCHAR(20)")
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM pg_constraint
                WHERE conname = 'uq_schedule_classroom_datetime'
            ) THEN
                ALTER TABLE schedule
                    ADD CONSTRAINT uq_schedule_classroom_datetime
                    UNIQUE (lesson_date, lesson_time, classroom);
            END IF;
        END $$;
        """
    )


def downgrade() -> None:
    op.execute("ALTER TABLE schedule DROP CONSTRAINT IF EXISTS uq_schedule_classroom_datetime")
    op.execute("ALTER TABLE schedule_generation_item DROP COLUMN IF EXISTS classroom")
    op.execute("ALTER TABLE schedule DROP COLUMN IF EXISTS classroom")
