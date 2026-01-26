"""Add person_profiles table and related columns

Revision ID: 20260126_add_person_profiles
Revises: 20260126_add_response_style
Create Date: 2026-01-26

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20260126_add_person_profiles'
down_revision = '20260126_add_response_style'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create the relationship enum type (checkfirst handles if it already exists)
    relationship_enum = sa.Enum(
        'self', 'spouse', 'partner', 'child', 'parent',
        'sibling', 'friend', 'relative', 'other',
        name='relationship'
    )
    relationship_enum.create(op.get_bind(), checkfirst=True)

    # Create person_profiles table
    # Use create_type=False since we created the enum above
    op.create_table(
        'person_profiles',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('nickname', sa.String(100), nullable=True),
        sa.Column('relation_type', sa.Enum(
            'self', 'spouse', 'partner', 'child', 'parent',
            'sibling', 'friend', 'relative', 'other',
            name='relationship', create_type=False
        ), nullable=False, server_default='self'),
        sa.Column('is_primary', sa.Boolean(), default=False),
        sa.Column('date_of_birth', sa.Date(), nullable=False),
        sa.Column('time_of_birth', sa.Time(), nullable=True),
        sa.Column('place_of_birth', sa.String(255), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('timezone', sa.String(50), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('avatar_color', sa.String(7), nullable=True),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Create index for faster lookups
    op.create_index('ix_person_profiles_user_id_is_primary', 'person_profiles', ['user_id', 'is_primary'])

    # Add person_profile_id to conversations table
    op.add_column(
        'conversations',
        sa.Column('person_profile_id', sa.String(36), nullable=True)
    )
    op.create_foreign_key(
        'fk_conversations_person_profile_id',
        'conversations', 'person_profiles',
        ['person_profile_id'], ['id'],
        ondelete='CASCADE'
    )
    op.create_index('ix_conversations_person_profile_id', 'conversations', ['person_profile_id'])

    # Add language and title columns to conversations table (missing from initial)
    op.add_column(
        'conversations',
        sa.Column('language', sa.Enum('ENGLISH', 'HINDI', 'HINGLISH', name='language', create_type=False), nullable=True)
    )
    op.add_column(
        'conversations',
        sa.Column('title', sa.String(255), nullable=True)
    )

    # Add person_profile_id to chart_snapshots table
    op.add_column(
        'chart_snapshots',
        sa.Column('person_profile_id', sa.String(36), nullable=True)
    )
    op.create_foreign_key(
        'fk_chart_snapshots_person_profile_id',
        'chart_snapshots', 'person_profiles',
        ['person_profile_id'], ['id'],
        ondelete='CASCADE'
    )
    op.create_index('ix_chart_snapshots_person_profile_id', 'chart_snapshots', ['person_profile_id'])

    # Add input_hash and notes columns to chart_snapshots table (missing from initial)
    op.add_column(
        'chart_snapshots',
        sa.Column('input_hash', sa.String(64), nullable=True)
    )
    op.add_column(
        'chart_snapshots',
        sa.Column('notes', sa.String(500), nullable=True)
    )


def downgrade() -> None:
    # Remove columns from chart_snapshots
    op.drop_column('chart_snapshots', 'notes')
    op.drop_column('chart_snapshots', 'input_hash')
    op.drop_index('ix_chart_snapshots_person_profile_id', 'chart_snapshots')
    op.drop_constraint('fk_chart_snapshots_person_profile_id', 'chart_snapshots', type_='foreignkey')
    op.drop_column('chart_snapshots', 'person_profile_id')

    # Remove columns from conversations
    op.drop_column('conversations', 'title')
    op.drop_column('conversations', 'language')
    op.drop_index('ix_conversations_person_profile_id', 'conversations')
    op.drop_constraint('fk_conversations_person_profile_id', 'conversations', type_='foreignkey')
    op.drop_column('conversations', 'person_profile_id')

    # Drop index
    op.drop_index('ix_person_profiles_user_id_is_primary', 'person_profiles')

    # Drop table
    op.drop_table('person_profiles')

    # Drop the enum type
    sa.Enum(name='relationship').drop(op.get_bind(), checkfirst=True)
