"""Добавить столбец achievement_name к achievement

Revision ID: dc43394a2254
Revises: 019ff3fd9758
Create Date: 2026-03-26 13:53:53.555170

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'dc43394a2254'
down_revision: Union[str, Sequence[str], None] = '019ff3fd9758'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "achievement",
        sa.Column("name", sa.String(), nullable=True)
    )

def downgrade() -> None:
    op.drop_column("achievement", "name")
