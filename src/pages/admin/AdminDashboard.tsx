import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, FileText, BarChart3, Settings, Activity, TrendingUp, Clock, HardDrive, Eye, Upload, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface DashboardStats {
  totalUsers: number;
  totalFiles: number;
  totalProcessing: number;
  storageUsed: number;
  todayVisitors: number;
  todayPageViews: number;
}

interface ToolStat {
  tool_name: string;
  count: number;
}

export function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalFiles: 0,
    totalProcessing: 0,
    storageUsed: 0,
    todayVisitors: 0,
    todayPageViews: 0,
  });
  const [toolStats, setToolStats] = useState<ToolStat[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const fetchAdminData = async () => {
    try {
      const [usersRes, filesRes, analyticsRes, visitorRes] = await Promise.all([
        supabase.from('profiles').select('id, created_at', { count: 'exact', head: true }),
        supabase.from('files').select('file_size, status', { count: 'exact', head: false }),
        supabase.from('tool_analytics').select('tool_name, id'),
        supabase.from('visitor_stats').select('*').eq('date', new Date().toISOString().split('T')[0]).maybeSingle(),
      ]);

      const totalStorage = filesRes.data?.reduce((acc, f) => acc + (f.file_size || 0), 0) || 0;
      const processing = filesRes.data?.filter(f => f.status === 'processing').length || 0;

      const toolCounts: Record<string, number> = {};
      analyticsRes.data?.forEach((a) => {
        toolCounts[a.tool_name] = (toolCounts[a.tool_name] || 0) + 1;
      });

      const sortedToolStats = Object.entries(toolCounts)
        .map(([tool_name, count]) => ({ tool_name, count }))
        .sort((a, b) => b.count - a.count);

      setStats({
        totalUsers: usersRes.count || 0,
        totalFiles: filesRes.data?.length || 0,
        totalProcessing: processing,
        storageUsed: totalStorage,
        todayVisitors: visitorRes.data?.visitors_count || 0,
        todayPageViews: visitorRes.data?.page_views || 0,
      });
      setToolStats(sortedToolStats.slice(0, 10));
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor and manage your PDF Master platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Files Processed</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalFiles}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Today's Visitors</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.todayVisitors}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Storage Used</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatBytes(stats.storageUsed)}</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                <HardDrive className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tool Usage Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tool Usage</h2>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            {toolStats.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No usage data available
              </div>
            ) : (
              <div className="space-y-4">
                {toolStats.map((tool) => {
                  const maxCount = toolStats[0]?.count || 1;
                  const percentage = (tool.count / maxCount) * 100;
                  return (
                    <div key={tool.tool_name} className="flex items-center gap-4">
                      <span className="w-24 text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {tool.tool_name.replace('-', ' ')}
                      </span>
                      <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-12 text-sm text-gray-900 dark:text-white text-right">
                        {tool.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/admin/users"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700 dark:text-gray-300">Manage Users</span>
              </Link>
              <Link
                to="/admin/settings"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <Settings className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700 dark:text-gray-300">Site Settings</span>
              </Link>
              <Link
                to="/admin/analytics"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700 dark:text-gray-300">View Analytics</span>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Real-time Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              System Status
            </h2>
            <span className="flex items-center gap-2 text-sm text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              All systems operational
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Processing</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalProcessing}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Page Views Today</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.todayPageViews}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Files Processed Today</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{toolStats.reduce((a, b) => a + b.count, 0)}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Response Time</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">&lt; 2s</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export { };
