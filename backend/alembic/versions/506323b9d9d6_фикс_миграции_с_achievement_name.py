"""фикс миграции с achievement_name

Revision ID: 506323b9d9d6
Revises: dc43394a2254
Create Date: 2026-03-26 13:57:30.614651

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '506323b9d9d6'
down_revision: Union[str, Sequence[str], None] = 'dc43394a2254'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


from alembic import op

def upgrade() -> None:
    op.alter_column(
        "achievement",
        "name",
        new_column_name="achievement_name"
    )

def downgrade() -> None:
    op.alter_column(
        "achievement",
        "achievement_name",
        new_column_name="name"
    )