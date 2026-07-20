"""expand proposed course description

Revision ID: f5a6b7c8d9e0
Revises: e4d5e6f7a8b9
Create Date: 2026-07-20 00:00:00.000000
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "f5a6b7c8d9e0"
down_revision: Union[str, Sequence[str], None] = "e4d5e6f7a8b9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "pre_registration",
        "proposed_course_description",
        existing_type=sa.String(length=500),
        type_=sa.String(length=2000),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        "pre_registration",
        "proposed_course_description",
        existing_type=sa.String(length=2000),
        type_=sa.String(length=500),
        existing_nullable=False,
    )
