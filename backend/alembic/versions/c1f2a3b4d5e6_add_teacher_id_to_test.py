"""add_teacher_id_to_test

Revision ID: c1f2a3b4d5e6
Revises: 8aa19c36ceb6
Create Date: 2026-04-21 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c1f2a3b4d5e6'
down_revision: Union[str, Sequence[str], None] = '8aa19c36ceb6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('tests', sa.Column('teacher_id', sa.Integer(), nullable=True))
    op.create_foreign_key(
        'fk_tests_teacher_id_teachers',
        'tests',
        'teachers',
        ['teacher_id'],
        ['id'],
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('fk_tests_teacher_id_teachers', 'tests', type_='foreignkey')
    op.drop_column('tests', 'teacher_id')
