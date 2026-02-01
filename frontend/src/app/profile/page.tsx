'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { MobileNav } from '@/components/MobileNav';

interface Profile {
  id: string;
  name: string;
  nickname?: string;
  relationship: string;
  is_primary: boolean;
  avatar_color?: string;
  date_of_birth?: string;
  has_birth_time?: boolean;
  conversation_count?: number;
}

const AVATAR_COLORS = [
  '#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#3B82F6',
  '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16', '#F97316',
];

const RELATIONSHIP_TYPES = [
  { value: 'self', label: 'Self' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'friend', label: 'Friend' },
  { value: 'other', label: 'Other' },
];

export default function ProfilePage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [maxProfiles, setMaxProfiles] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    relation_type: 'self',
    date_of_birth: '',
    time_of_birth: '',
    place_of_birth: '',
    avatar_color: AVATAR_COLORS[0],
  });

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await api.listPersonProfiles();
      const data = response.data as any;
      setProfiles(data.profiles || []);
      setMaxProfiles(data.max_profiles || 1);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login?redirect=/profile');
      } else {
        setError('Failed to load profiles');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingProfile) {
        await api.updatePersonProfile(editingProfile.id, {
          name: formData.name,
          nickname: formData.nickname || undefined,
          relation_type: formData.relation_type,
          date_of_birth: formData.date_of_birth,
          time_of_birth: formData.time_of_birth || undefined,
          place_of_birth: formData.place_of_birth || undefined,
          avatar_color: formData.avatar_color,
        });
      } else {
        await api.createPersonProfile({
          name: formData.name,
          nickname: formData.nickname || undefined,
          relation_type: formData.relation_type,
          date_of_birth: formData.date_of_birth,
          time_of_birth: formData.time_of_birth || undefined,
          place_of_birth: formData.place_of_birth || undefined,
        });
      }

      setShowAddForm(false);
      setEditingProfile(null);
      resetForm();
      fetchProfiles();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save profile');
    }
  };

  const handleEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      nickname: profile.nickname || '',
      relation_type: profile.relationship,
      date_of_birth: profile.date_of_birth || '',
      time_of_birth: '',
      place_of_birth: '',
      avatar_color: profile.avatar_color || AVATAR_COLORS[0],
    });
    setShowAddForm(true);
  };

  const handleDelete = async (profileId: string) => {
    if (!confirm('Are you sure you want to delete this profile? This will also delete all conversations.')) {
      return;
    }

    try {
      await api.deletePersonProfile(profileId);
      fetchProfiles();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete profile');
    }
  };

  const handleSetPrimary = async (profileId: string) => {
    try {
      await api.setPrimaryProfile(profileId);
      fetchProfiles();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to set primary profile');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nickname: '',
      relation_type: 'self',
      date_of_birth: '',
      time_of_birth: '',
      place_of_birth: '',
      avatar_color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    });
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </main>
    );
  }

  return (
    <>
    <main className="min-h-screen py-12 px-4 pb-24 md:pb-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/chat" className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block">
              &larr; Back to Chat
            </Link>
            <h1 className="text-3xl font-bold">Manage Profiles</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {profiles.length} of {maxProfiles} profiles used
            </p>
          </div>
          {profiles.length < maxProfiles && !showAddForm && (
            <button
              onClick={() => {
                resetForm();
                setEditingProfile(null);
                setShowAddForm(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-primary-600 to-cosmic-600 text-white rounded-xl font-medium hover:from-primary-500 hover:to-cosmic-500 transition-all"
            >
              Add Profile
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="mb-8 p-6 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4">
              {editingProfile ? 'Edit Profile' : 'Add New Profile'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nickname</label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="Optional nickname"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Relationship *</label>
                  <select
                    value={formData.relation_type}
                    onChange={(e) => setFormData({ ...formData, relation_type: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    {RELATIONSHIP_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Time of Birth</label>
                  <input
                    type="time"
                    value={formData.time_of_birth}
                    onChange={(e) => setFormData({ ...formData, time_of_birth: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional but recommended for accurate charts</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Place of Birth</label>
                  <input
                    type="text"
                    value={formData.place_of_birth}
                    onChange={(e) => setFormData({ ...formData, place_of_birth: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Avatar Color</label>
                <div className="flex gap-2 flex-wrap">
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar_color: color })}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        formData.avatar_color === color ? 'ring-2 ring-offset-2 ring-primary-500 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-primary-600 to-cosmic-600 text-white rounded-xl font-medium hover:from-primary-500 hover:to-cosmic-500 transition-all"
                >
                  {editingProfile ? 'Save Changes' : 'Add Profile'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingProfile(null);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-200 dark:border-white/10 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Profiles list */}
        <div className="space-y-4">
          {profiles.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl">
              <p className="text-gray-500 mb-4">No profiles yet. Add your first profile to get started.</p>
              <button
                onClick={() => {
                  resetForm();
                  setShowAddForm(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-primary-600 to-cosmic-600 text-white rounded-xl font-medium hover:from-primary-500 hover:to-cosmic-500 transition-all"
              >
                Add Profile
              </button>
            </div>
          ) : (
            profiles.map((profile) => (
              <div
                key={profile.id}
                className="p-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: profile.avatar_color || '#7C3AED' }}
                  >
                    {profile.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{profile.name}</h3>
                      {profile.is_primary && (
                        <span className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 capitalize">
                      {profile.relationship}
                      {profile.nickname && ` - "${profile.nickname}"`}
                    </p>
                    {profile.conversation_count !== undefined && (
                      <p className="text-xs text-gray-400">
                        {profile.conversation_count} conversation{profile.conversation_count !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!profile.is_primary && (
                    <button
                      onClick={() => handleSetPrimary(profile.id)}
                      className="px-3 py-1 text-sm text-gray-500 hover:text-primary-600 transition-colors"
                      title="Set as primary"
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(profile)}
                    className="px-3 py-1 text-sm text-gray-500 hover:text-primary-600 transition-colors"
                  >
                    Edit
                  </button>
                  {profiles.length > 1 && (
                    <button
                      onClick={() => handleDelete(profile.id)}
                      className="px-3 py-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Upgrade prompt */}
        {profiles.length >= maxProfiles && maxProfiles < 10 && (
          <div className="mt-8 p-6 bg-gradient-to-r from-primary-50 to-cosmic-50 dark:from-primary-900/20 dark:to-cosmic-900/20 border border-primary-200 dark:border-primary-800 rounded-2xl text-center">
            <h3 className="font-semibold mb-2">Need more profiles?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Upgrade your plan to add more family members and friends.
            </p>
            <Link
              href="/pricing"
              className="inline-block px-6 py-2 bg-gradient-to-r from-primary-600 to-cosmic-600 text-white rounded-xl font-medium hover:from-primary-500 hover:to-cosmic-500 transition-all"
            >
              View Plans
            </Link>
          </div>
        )}
      </div>
    </main>
    <MobileNav />
    </>
  );
}
