import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const AdminDashboard = ({ supabaseClient }) => {
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    newSubmissions: 0,
    pendingReplies: 0,
    totalReplies: 0,
  });
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      if (!supabaseClient) return;

      // Fetch stats
      const { data: submissions, error: submissionsError } = await supabaseClient
        .from('submissions')
        .select('id, status, created_at');

      if (submissionsError) throw submissionsError;

      // Fetch recent submissions
      const { data: recent, error: recentError } = await supabaseClient
        .from('submissions')
        .select('id, name, email, subject, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentError) throw recentError;

      // Calculate stats
      const newCount = submissions?.filter(s => s.status === 'new').length || 0;
      const respondedCount = submissions?.filter(s => s.status === 'responded').length || 0;

      setStats({
        totalSubmissions: submissions?.length || 0,
        newSubmissions: newCount,
        pendingReplies: newCount,
        totalReplies: respondedCount,
      });

      setRecentSubmissions(recent || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Submissions',
      value: stats.totalSubmissions,
      icon: '📨',
      color: 'from-blue-500/20 to-blue-600/20',
      textColor: 'text-blue-400',
    },
    {
      label: 'New Submissions',
      value: stats.newSubmissions,
      icon: '🆕',
      color: 'from-emerald-500/20 to-emerald-600/20',
      textColor: 'text-emerald-400',
    },
    {
      label: 'Pending Replies',
      value: stats.pendingReplies,
      icon: '⏳',
      color: 'from-amber-500/20 to-amber-600/20',
      textColor: 'text-amber-400',
    },
    {
      label: 'Responded',
      value: stats.totalReplies,
      icon: '✅',
      color: 'from-purple-500/20 to-purple-600/20',
      textColor: 'text-purple-400',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back!</h1>
        <p className="text-gray-400">Here's what's happening with your submissions today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-br ${card.color} backdrop-blur border border-white/10 rounded-lg p-6`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">{card.label}</p>
                <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
              </div>
              <div className="text-4xl opacity-50">{card.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Submissions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4">Recent Submissions</h2>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-400">Loading submissions...</div>
          </div>
        ) : recentSubmissions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No submissions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">From</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Subject</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentSubmissions.map((submission) => (
                  <tr key={submission.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-white text-sm">{submission.name}</p>
                        <p className="text-gray-500 text-xs">{submission.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-white text-sm truncate">{submission.subject}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        submission.status === 'new'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : submission.status === 'responded'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {submission.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-sm">
                      {new Date(submission.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/submissions"
            className="bg-gradient-to-br from-[#61DAFB]/20 to-[#005792]/20 hover:from-[#61DAFB]/30 hover:to-[#005792]/30 border border-[#61DAFB]/30 rounded-lg p-4 transition group"
          >
            <div className="text-2xl mb-2">📨</div>
            <p className="text-white font-medium group-hover:text-[#61DAFB] transition">View All Submissions</p>
            <p className="text-gray-400 text-sm mt-1">Manage all contact inquiries</p>
          </a>
          <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-lg p-4 opacity-50">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-white font-medium">Analytics</p>
            <p className="text-gray-400 text-sm mt-1">Coming soon</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-4 opacity-50">
            <div className="text-2xl mb-2">⚙️</div>
            <p className="text-white font-medium">Settings</p>
            <p className="text-gray-400 text-sm mt-1">Coming soon</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
