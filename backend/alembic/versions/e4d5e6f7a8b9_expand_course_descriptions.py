"""expand course descriptions

Revision ID: e4d5e6f7a8b9
Revises: e3c4d5e6f7a8
Create Date: 2026-05-19 17:45:00.000000
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "e4d5e6f7a8b9"
down_revision: Union[str, Sequence[str], None] = "e3c4d5e6f7a8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "course",
        "descriptions",
        existing_type=sa.String(length=200),
        type_=sa.Text(),
        existing_nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "course",
        "descriptions",
        existing_type=sa.Text(),
        type_=sa.String(length=200),
        existing_nullable=True,
    )
