"""Add MAX tier to subscriptiontier enum.

Revision ID: 20260126_add_max_tier
Revises: 20260126_add_person_profiles
Create Date: 2026-01-26

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = '20260126_add_max_tier'
down_revision = '20260126_add_person_profiles'
branch_labels = None
depends_on = None


def upgrade():
    # Add MAX value to subscriptiontier enum
    # PostgreSQL requires ALTER TYPE to add values to an enum
    op.execute("ALTER TYPE subscriptiontier ADD VALUE IF NOT EXISTS 'MAX'")


def downgrade():
    # Note: PostgreSQL doesn't support removing values from enums
    # The MAX value will remain in the enum type
    pass
