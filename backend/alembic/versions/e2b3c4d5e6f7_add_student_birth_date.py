"""add student birth date

Revision ID: e2b3c4d5e6f7
Revises: e1a2b3c4d5f6
Create Date: 2026-05-18 21:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


revision: str = "e2b3c4d5e6f7"
down_revision: Union[str, Sequence[str], None] = "e1a2b3c4d5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE students ADD COLUMN IF NOT EXISTS birth_date DATE")


def downgrade() -> None:
    op.execute("ALTER TABLE students DROP COLUMN IF EXISTS birth_date")
