import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  BarChart3,
  Users,
  Activity,
  Zap,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Clock,
  Eye,
} from 'lucide-react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface DashboardStats {
  total_users: number;
  active_users_today: number;
  total_chat_requests: number;
  total_api_requests: number;
  avg_response_time_ms: number;
  total_recommendations: number;
  error_count: number;
  peak_concurrent_users: number;
}

interface ActivityRecord {
  id: number;
  user_id: number | null;
  activity_type: string;
  timestamp: string;
  session_id: string | null;
  activity_data: any;
}

interface MetricsData {
  metric_date: string;
  total_users: number;
  active_users_today: number;
  total_chat_requests: number;
  total_api_requests: number;
  avg_response_time_ms: number;
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [metricsData, setMetricsData] = useState<MetricsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'analytics'>('overview');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // Fetch stats
      const statsResponse = await axios.get(`${API_BASE_URL}/admin/dashboard/stats`, { headers });
      setStats(statsResponse.data);

      // Fetch recent activities
      const activitiesResponse = await axios.get(`${API_BASE_URL}/admin/activity/timeline?limit=20`, { headers });
      setActivities(activitiesResponse.data);

      // Fetch metrics history
      const metricsResponse = await axios.get(`${API_BASE_URL}/admin/metrics/history?days=7`, { headers });
      setMetricsData(metricsResponse.data.metrics);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(
        err.response?.data?.detail ||
        'Failed to load dashboard data. Please try again.'
      );
      
      // If unauthorized, redirect to login
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUsername');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if admin is logged in
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }

    fetchDashboardData();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    navigate('/admin/login');
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    trend,
    color,
    delay,
  }: {
    icon: any;
    label: string;
    value: number | string;
    trend?: string;
    color: string;
    delay: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600/50 hover:border-purple-500/50 transition"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-2">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {trend && (
            <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {trend}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-800/80 backdrop-blur border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">CinePal Admin</h1>
                <p className="text-xs text-slate-400">Analytics Dashboard</p>
              </div>
            </motion.div>

            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{localStorage.getItem('adminUsername')}</p>
                <p className="text-xs text-slate-400">Administrator</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg flex items-center gap-2 transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 mb-8 overflow-x-auto pb-2"
        >
          {(['overview', 'activity', 'analytics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition capitalize whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </motion.div>

        {/* Overview Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && stats && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={Users}
                  label="Total Users"
                  value={stats.total_users}
                  color="bg-blue-500/20"
                  delay={0}
                />
                <StatCard
                  icon={Activity}
                  label="Active Today"
                  value={stats.active_users_today}
                  color="bg-green-500/20"
                  delay={0.1}
                />
                <StatCard
                  icon={MessageSquare}
                  label="Chat Requests"
                  value={stats.total_chat_requests}
                  color="bg-purple-500/20"
                  delay={0.2}
                />
                <StatCard
                  icon={Zap}
                  label="API Requests"
                  value={stats.total_api_requests}
                  color="bg-yellow-500/20"
                  delay={0.3}
                />
                <StatCard
                  icon={Clock}
                  label="Avg Response Time"
                  value={`${stats.avg_response_time_ms.toFixed(0)}ms`}
                  color="bg-cyan-500/20"
                  delay={0.4}
                />
                <StatCard
                  icon={Eye}
                  label="Recommendations"
                  value={stats.total_recommendations}
                  color="bg-pink-500/20"
                  delay={0.5}
                />
                <StatCard
                  icon={AlertCircle}
                  label="Errors"
                  value={stats.error_count}
                  color="bg-red-500/20"
                  delay={0.6}
                />
              </div>

              {/* Metrics Chart */}
              {metricsData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600/50"
                >
                  <h3 className="text-lg font-semibold text-white mb-4">7-Day Trends</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={metricsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis
                        dataKey="metric_date"
                        stroke="#94a3b8"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #475569',
                          borderRadius: '8px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="total_api_requests"
                        stroke="#a78bfa"
                        strokeWidth={2}
                        dot={{ fill: '#a78bfa', r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="active_users_today"
                        stroke="#60a5fa"
                        strokeWidth={2}
                        dot={{ fill: '#60a5fa', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-slate-700/50 backdrop-blur rounded-lg border border-slate-600/50 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-600/50 bg-slate-800/50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                        User ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((activity, index) => (
                      <motion.tr
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-slate-600/30 hover:bg-slate-600/20 transition"
                      >
                        <td className="px-6 py-4">
                          <span className="inline-block px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs font-medium">
                            {activity.activity_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {activity.user_id || 'Guest'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {new Date(activity.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {activity.session_id || '-'}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && metricsData.length > 0 && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* API Requests Chart */}
              <div className="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600/50">
                <h3 className="text-lg font-semibold text-white mb-4">API Requests</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metricsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="metric_date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="total_api_requests" fill="#a78bfa" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Response Time Chart */}
              <div className="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600/50">
                <h3 className="text-lg font-semibold text-white mb-4">Response Time (ms)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metricsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="metric_date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avg_response_time_ms"
                      stroke="#60a5fa"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Chat Requests Chart */}
              <div className="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600/50">
                <h3 className="text-lg font-semibold text-white mb-4">Chat Requests</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metricsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="metric_date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="total_chat_requests" fill="#f472b6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* User Growth Chart */}
              <div className="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600/50">
                <h3 className="text-lg font-semibold text-white mb-4">User Growth</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metricsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="metric_date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="total_users" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
