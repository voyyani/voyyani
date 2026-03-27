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
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header - responsive typography */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">Welcome back!</h1>
        <p className="text-sm sm:text-base text-gray-400">Here's what's happening with your submissions today.</p>
      </motion.div>

      {/* Stats Grid - responsive: 1 col mobile → 2 col tablet → 4 col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className={`bg-gradient-to-br ${card.color} backdrop-blur border border-white/10 rounded-lg p-4 sm:p-5 md:p-6 hover:border-white/20 transition-colors group cursor-default`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-400 mb-2 font-medium">{card.label}</p>
                <p className={`text-2xl sm:text-3xl md:text-4xl font-bold ${card.textColor} truncate`}>{card.value}</p>
              </div>
              <div className="text-3xl sm:text-4xl opacity-40 flex-shrink-0">{card.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Submissions - responsive card view on mobile, table on desktop */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="bg-white/5 backdrop-blur border border-white/10 rounded-lg overflow-hidden"
      >
        <div className="p-4 sm:p-6 border-b border-white/10">
          <h2 className="text-lg sm:text-xl font-bold text-white">Recent Submissions</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin text-3xl mb-3">⌛</div>
              <p className="text-gray-400 text-sm">Loading submissions...</p>
            </div>
          </div>
        ) : recentSubmissions.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-gray-400 text-sm">No submissions yet</p>
          </div>
        ) : (
          <>
            {/* Mobile card view */}
            <div className="md:hidden space-y-3 p-4">
              {recentSubmissions.map((submission) => (
                <div key={submission.id} className="bg-white/5 rounded-lg p-4 border border-white/5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm truncate">{submission.name}</p>
                      <p className="text-xs text-gray-500 truncate">{submission.email}</p>
                    </div>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium text-nowrap ${
                      submission.status === 'new'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : submission.status === 'responded'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {submission.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-2">{submission.subject}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(submission.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Desktop table view */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-gray-400">From</th>
                    <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-gray-400">Subject</th>
                    <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSubmissions.map((submission) => (
                    <tr key={submission.id} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-white text-sm font-medium">{submission.name}</p>
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
          </>
        )}
      </motion.div>

      {/* Quick Actions - responsive: full-width mobile → 3 col desktop */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-4 sm:p-6"
      >
        <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <motion.a
            href="/admin/submissions"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-br from-[#61DAFB]/20 to-[#005792]/20 hover:from-[#61DAFB]/30 hover:to-[#005792]/30 border border-[#61DAFB]/30 rounded-lg p-4 sm:p-5 transition group cursor-pointer"
          >
            <div className="text-2xl sm:text-3xl mb-3">📨</div>
            <p className="text-white font-medium text-sm sm:text-base group-hover:text-[#61DAFB] transition">View All Submissions</p>
            <p className="text-gray-400 text-xs sm:text-sm mt-2">Manage all contact inquiries</p>
          </motion.a>
          <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-lg p-4 sm:p-5 opacity-50">
            <div className="text-2xl sm:text-3xl mb-3">📊</div>
            <p className="text-white font-medium text-sm sm:text-base">Analytics</p>
            <p className="text-gray-400 text-xs sm:text-sm mt-2">Coming soon</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-4 sm:p-5 opacity-50">
            <div className="text-2xl sm:text-3xl mb-3">⚙️</div>
            <p className="text-white font-medium text-sm sm:text-base">Settings</p>
            <p className="text-gray-400 text-xs sm:text-sm mt-2">Coming soon</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
