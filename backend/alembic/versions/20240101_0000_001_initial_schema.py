"""Initial schema for AstraVaani

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('email', sa.String(255), unique=True, nullable=False, index=True),
        sa.Column('email_verified', sa.Boolean(), default=False),
        sa.Column('hashed_password', sa.String(255), nullable=True),
        sa.Column('full_name', sa.String(255), nullable=True),
        sa.Column('date_of_birth', sa.Date(), nullable=True),
        sa.Column('time_of_birth', sa.Time(), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('place_of_birth', sa.String(255), nullable=True),
        sa.Column('guidance_mode', sa.Enum('ASTROLOGY', 'NUMEROLOGY', 'BOTH', name='guidancemode'), default='BOTH'),
        sa.Column('language', sa.Enum('ENGLISH', 'HINDI', 'HINGLISH', name='language'), default='ENGLISH'),
        sa.Column('onboarding_completed', sa.Boolean(), default=False),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('is_superuser', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Create subscriptions table
    op.create_table(
        'subscriptions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('tier', sa.Enum('FREE', 'STARTER', 'PRO', name='subscriptiontier'), default='FREE'),
        sa.Column('status', sa.Enum('ACTIVE', 'CANCELLED', 'EXPIRED', 'PAUSED', name='subscriptionstatus'), default='ACTIVE'),
        sa.Column('current_period_start', sa.Date(), nullable=True),
        sa.Column('current_period_end', sa.Date(), nullable=True),
        sa.Column('price_paise', sa.Integer(), default=0),
        sa.Column('cancel_at_period_end', sa.Boolean(), default=False),
        sa.Column('razorpay_order_id', sa.String(255), nullable=True),
        sa.Column('razorpay_payment_id', sa.String(255), nullable=True),
        sa.Column('razorpay_subscription_id', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Create credits_ledger table
    op.create_table(
        'credits_ledger',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('subscription_id', sa.String(36), sa.ForeignKey('subscriptions.id', ondelete='SET NULL'), nullable=True),
        sa.Column('credit_type', sa.Enum('SUBSCRIPTION_GRANT', 'PURCHASE', 'USAGE', 'REFUND', 'BONUS', 'EXPIRY', name='credittype')),
        sa.Column('amount', sa.Integer(), nullable=False),
        sa.Column('balance_after', sa.Integer(), nullable=False),
        sa.Column('reference_id', sa.String(255), nullable=True),
        sa.Column('description', sa.String(500), nullable=True),
        sa.Column('metadata', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Create usage_limits table
    op.create_table(
        'usage_limits',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('period_date', sa.Date(), nullable=False, index=True),
        sa.Column('questions_used_daily', sa.Integer(), default=0),
        sa.Column('questions_used_monthly', sa.Integer(), default=0),
        sa.Column('characters_used', sa.Integer(), default=0),
        sa.Column('free_questions_used_lifetime', sa.Integer(), default=0),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Create unique constraint on usage_limits
    op.create_unique_constraint('uq_usage_limits_user_date', 'usage_limits', ['user_id', 'period_date'])

    # Create conversations table
    op.create_table(
        'conversations',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('mode', sa.Enum('ASTROLOGY', 'NUMEROLOGY', 'BOTH', name='guidancemode')),
        sa.Column('started_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('last_message_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('message_count', sa.Integer(), default=0),
        sa.Column('metadata', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Create messages table
    op.create_table(
        'messages',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('conversation_id', sa.String(36), sa.ForeignKey('conversations.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('role', sa.Enum('USER', 'ASSISTANT', 'SYSTEM', name='messagerole'), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('chart_snapshot_id', sa.String(36), nullable=True),
        sa.Column('data_points_used', postgresql.JSONB(), nullable=True),
        sa.Column('validation_passed', sa.Boolean(), nullable=True),
        sa.Column('was_regenerated', sa.Boolean(), default=False),
        sa.Column('token_count', sa.Integer(), nullable=True),
        sa.Column('metadata', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Create chart_snapshots table
    op.create_table(
        'chart_snapshots',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('mode', sa.Enum('ASTROLOGY', 'NUMEROLOGY', 'BOTH', name='guidancemode')),
        sa.Column('version', sa.Integer(), default=1),
        sa.Column('numerology_data', postgresql.JSONB(), nullable=True),
        sa.Column('astrology_data', postgresql.JSONB(), nullable=True),
        sa.Column('transit_data', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Create indexes for common queries
    op.create_index('ix_messages_created_at', 'messages', ['created_at'])
    op.create_index('ix_conversations_last_message_at', 'conversations', ['last_message_at'])
    op.create_index('ix_chart_snapshots_created_at', 'chart_snapshots', ['created_at'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_chart_snapshots_created_at')
    op.drop_index('ix_conversations_last_message_at')
    op.drop_index('ix_messages_created_at')

    # Drop tables in reverse order (respect foreign keys)
    op.drop_table('chart_snapshots')
    op.drop_table('messages')
    op.drop_table('conversations')
    op.drop_constraint('uq_usage_limits_user_date', 'usage_limits')
    op.drop_table('usage_limits')
    op.drop_table('credits_ledger')
    op.drop_table('subscriptions')
    op.drop_table('users')

    # Drop enums
    op.execute('DROP TYPE IF EXISTS messagerole')
    op.execute('DROP TYPE IF EXISTS credittype')
    op.execute('DROP TYPE IF EXISTS subscriptionstatus')
    op.execute('DROP TYPE IF EXISTS subscriptiontier')
    op.execute('DROP TYPE IF EXISTS language')
    op.execute('DROP TYPE IF EXISTS guidancemode')
