import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Clock, Download, Star, Settings, User, CreditCard, BarChart3, ChevronRight, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { PDF_TOOLS } from '../../types';
import { getIcon } from '../../lib/icons';
import type { FileRecord, UserFavorite, ToolAnalytics } from '../../types';

export function DashboardPage() {
  const { user, profile, subscription } = useAuth();
  const [recentFiles, setRecentFiles] = useState<FileRecord[]>([]);
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [stats, setStats] = useState({ totalFiles: 0, toolUsage: {} as Record<string, number> });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      const [filesRes, favoritesRes, analyticsRes] = await Promise.all([
        supabase
          .from('files')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('user_favorites')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('tool_analytics')
          .select('tool_name, id')
          .eq('user_id', user.id),
      ]);

      if (filesRes.data) setRecentFiles(filesRes.data);
      if (favoritesRes.data) setFavorites(favoritesRes.data);

      if (analyticsRes.data) {
        const toolUsage: Record<string, number> = {};
        analyticsRes.data.forEach((item) => {
          toolUsage[item.tool_name] = (toolUsage[item.tool_name] || 0) + 1;
        });
        setStats({
          totalFiles: analyticsRes.data.length,
          toolUsage,
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const favoriteTools = favorites.map(f => PDF_TOOLS.find(t => t.id === f.tool_name)).filter(Boolean);
  const recentTools = Object.entries(stats.toolUsage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {profile?.full_name || user?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your PDF files and account settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {PDF_TOOLS.slice(0, 8).map((tool) => {
                  const IconComponent = getIcon(tool.icon);
                  return (
                    <Link
                      key={tool.id}
                      to={tool.path}
                      className="flex flex-col items-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
                    >
                      <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm group-hover:shadow transition-shadow">
                        <IconComponent className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                        {tool.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>

            {/* Recent Files */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Files</h2>
                <Link to="/dashboard/files" className="text-sm text-blue-600 hover:text-blue-700">
                  View All
                </Link>
              </div>
              {recentFiles.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">No recent files</p>
                  <Link
                    to="/tools"
                    className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700"
                  >
                    Start processing PDFs
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm truncate max-w-xs">
                            {file.original_name}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <span>{formatFileSize(file.file_size)}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(file.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          file.status === 'completed'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : file.status === 'processing'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}
                      >
                        {file.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Usage Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Activity</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalFiles}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Files Processed</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{favorites.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Favorite Tools</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{Object.keys(stats.toolUsage).length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tools Used</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-2xl font-bold text-blue-600">
                    {subscription?.plan_type === 'premium' ? 'Pro' : 'Free'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Plan</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white"
            >
              {subscription?.plan_type === 'premium' ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5" />
                    <span className="font-semibold">Premium Member</span>
                  </div>
                  <p className="text-blue-100 text-sm mb-4">
                    Enjoy unlimited uploads and priority processing
                  </p>
                  <div className="flex items-center gap-2 text-blue-100 text-sm">
                    <CreditCard className="w-4 h-4" />
                    <span>Next billing: {subscription.current_period_end ? formatDate(subscription.current_period_end) : 'N/A'}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5" />
                    <span className="font-semibold">Free Plan</span>
                  </div>
                  <p className="text-blue-100 text-sm mb-4">
                    Upgrade to unlock unlimited uploads and priority processing
                  </p>
                  <Link
                    to="/premium"
                    className="block w-full py-2 bg-white text-blue-600 rounded-lg text-center font-medium hover:bg-blue-50 transition-colors"
                  >
                    Upgrade Now
                  </Link>
                </>
              )}
            </motion.div>

            {/* Favorite Tools */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Favorite Tools</h3>
                <Star className="w-4 h-4 text-yellow-500" />
              </div>
              {favoriteTools.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No favorites yet. Star tools to add them here.
                </p>
              ) : (
                <div className="space-y-2">
                  {favoriteTools.slice(0, 5).map((tool) => (
                    tool && (
                      <Link
                        key={tool.id}
                        to={tool.path}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300">{tool.name}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </Link>
                    )
                  ))}
                </div>
              )}
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Account</h3>
              <div className="space-y-2">
                <Link
                  to="/profile"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Profile</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Settings</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  to="/premium"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Subscription</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { user, profile, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await updateProfile({ full_name: fullName });
    setLoading(false);
    if (!error) {
      alert('Profile updated successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile Settings</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-bold text-white">
                {(fullName || user?.email)?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{fullName || 'Your Name'}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
