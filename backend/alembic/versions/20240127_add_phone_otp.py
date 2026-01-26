"""Add phone number and OTP tables

Revision ID: 20240127_add_phone_otp
Revises:
Create Date: 2024-01-27

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20240127_add_phone_otp'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add phone_number and is_phone_verified to users table
    op.add_column('users', sa.Column('phone_number', sa.String(20), nullable=True))
    op.add_column('users', sa.Column('is_phone_verified', sa.Boolean(), nullable=True, default=False))
    op.create_index('ix_users_phone_number', 'users', ['phone_number'], unique=True)

    # Create OTPs table
    op.create_table(
        'otps',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('target', sa.String(255), nullable=False, index=True),
        sa.Column('otp_type', sa.Enum('email', 'phone', name='otptype'), nullable=False),
        sa.Column('purpose', sa.Enum('signup', 'login', 'password_reset', name='otppurpose'), nullable=False),
        sa.Column('code', sa.String(6), nullable=False),
        sa.Column('is_used', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('attempts', sa.Integer(), default=0),
    )


def downgrade() -> None:
    # Drop OTPs table
    op.drop_table('otps')

    # Remove columns from users
    op.drop_index('ix_users_phone_number', 'users')
    op.drop_column('users', 'is_phone_verified')
    op.drop_column('users', 'phone_number')
