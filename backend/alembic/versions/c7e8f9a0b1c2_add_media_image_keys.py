"""add media image keys for courses and profiles

Revision ID: c7e8f9a0b1c2
Revises: 54f14ba3cde3
Create Date: 2026-05-15 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c7e8f9a0b1c2"
down_revision: Union[str, Sequence[str], None] = "54f14ba3cde3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("course", sa.Column("cover_image_key", sa.Text(), nullable=True))
    op.add_column("students", sa.Column("avatar_image_key", sa.String(length=512), nullable=True))
    op.add_column("staff", sa.Column("avatar_image_key", sa.String(length=512), nullable=True))


def downgrade() -> None:
    op.drop_column("staff", "avatar_image_key")
    op.drop_column("students", "avatar_image_key")
    op.drop_column("course", "cover_image_key")
