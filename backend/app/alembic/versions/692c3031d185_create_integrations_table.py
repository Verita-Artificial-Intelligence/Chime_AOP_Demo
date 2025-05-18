"""create integrations table

Revision ID: 692c3031d185
Revises: 91979b40eb38
Create Date: 2024-05-30 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector

# revision identifiers, used by Alembic.
revision = "692c3031d185"
down_revision = "91979b40eb38"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.create_table(
        "integrations",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("integration_name", sa.Text, nullable=False),
        sa.Column("action_name", sa.Text, nullable=False),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("action_type", sa.Text, nullable=False),
        sa.Column("embedding", Vector(1536), nullable=False),
        sa.Column("metadata", sa.JSON, nullable=False),
    )


def downgrade():
    op.drop_table("integrations")
