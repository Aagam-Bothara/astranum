"""Add response_style to profiles table

Revision ID: 20260126_add_response_style
Revises: 20240127_add_phone_otp
Create Date: 2026-01-26

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20260126_add_response_style'
down_revision = '20240127_add_phone_otp'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create the enum type first
    response_style_enum = sa.Enum('supportive', 'balanced', 'direct', name='responsestyle')
    response_style_enum.create(op.get_bind(), checkfirst=True)

    # Add response_style column to profiles table with default 'balanced'
    op.add_column(
        'profiles',
        sa.Column(
            'response_style',
            response_style_enum,
            nullable=False,
            server_default='balanced'
        )
    )


def downgrade() -> None:
    # Remove column
    op.drop_column('profiles', 'response_style')

    # Drop the enum type
    sa.Enum(name='responsestyle').drop(op.get_bind(), checkfirst=True)
