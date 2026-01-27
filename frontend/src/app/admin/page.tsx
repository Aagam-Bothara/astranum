'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { AdminStats } from '@/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.getAdminStats();
        setStats(response.data || null);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (!stats) return null;

  const formatCurrency = (paise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(paise / 100);
  };

  const statCards = [
    {
      label: 'Total Users',
      value: stats.total_users.toLocaleString(),
      subtext: `${stats.active_users_30d} active (30d)`,
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      color: 'bg-blue-500',
    },
    {
      label: 'Active Subscriptions',
      value: stats.active_subscriptions.toLocaleString(),
      subtext: `${stats.total_subscriptions} total paid`,
      icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
      color: 'bg-green-500',
    },
    {
      label: 'Revenue This Month',
      value: formatCurrency(stats.revenue_this_month_paise),
      subtext: `${formatCurrency(stats.revenue_total_paise)} total`,
      icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
      color: 'bg-yellow-500',
    },
    {
      label: 'Questions Today',
      value: stats.questions_today.toLocaleString(),
      subtext: `${stats.questions_this_month.toLocaleString()} this month`,
      icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'bg-purple-500',
    },
  ];

  const tierColors: Record<string, string> = {
    FREE: 'bg-gray-500',
    STARTER: 'bg-blue-500',
    PRO: 'bg-purple-500',
    MAX: 'bg-yellow-500',
  };

  const totalTierCount = stats.tier_breakdown.reduce((sum, t) => sum + t.count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <p className="text-gray-500 mt-1">Overview of AstraVaani metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-white/10 p-6"
          >
            <div className="flex items-center gap-4">
              <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{card.subtext}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tier Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-white/10 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tier Breakdown</h3>
        <div className="space-y-4">
          {stats.tier_breakdown.map((tier) => {
            const percentage = totalTierCount > 0 ? (tier.count / totalTierCount) * 100 : 0;
            return (
              <div key={tier.tier}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{tier.tier}</span>
                  <span className="text-sm text-gray-500">
                    {tier.count} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`${tierColors[tier.tier] || 'bg-gray-500'} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href="/admin/users"
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-white/10 p-6 hover:border-primary-500 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600">
                Manage Users
              </h3>
              <p className="text-sm text-gray-500 mt-1">View users, change tiers, toggle active status</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </a>
        <a
          href="/admin/payments"
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-white/10 p-6 hover:border-primary-500 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600">
                View Payments
              </h3>
              <p className="text-sm text-gray-500 mt-1">Track subscriptions, payment history, revenue</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </a>
      </div>
    </div>
  );
}
