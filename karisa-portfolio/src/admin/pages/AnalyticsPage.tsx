import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { AnalyticsService, AnalyticsMetrics, exportToCSV } from '../../utils/analyticsService';

interface AnalyticsPageProps {
  client: any;
}

export default function AnalyticsPage({ client }: AnalyticsPageProps) {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  const getDateFilter = () => {
    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        startDate = new Date(0);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return { startDate, endDate: now };
  };

  useEffect(() => {
    fetchMetrics();
  }, [dateRange]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const analyticsService = new AnalyticsService(client);
      const filter = getDateFilter();
      const data = await analyticsService.getMetrics(filter);
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const { data: submissions } = await client
        .from('submissions')
        .select('*')
        .gte('created_at', getDateFilter().startDate.toISOString())
        .lte('created_at', new Date().toISOString());

      if (submissions) {
        exportToCSV(submissions, `submissions-${new Date().toISOString().split('T')[0]}.csv`);
        toast.success('Submissions exported to CSV');
      }
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export data');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⌛</div>
          <p className="text-gray-300">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-4 sm:space-y-6 md:space-y-8 p-4 sm:p-6 md:p-0"
    >
      {/* Header - responsive layout */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4"
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Analytics & Insights</h1>
        <button
          onClick={handleExport}
          className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base rounded-lg transition-colors font-medium flex-shrink-0"
        >
          📥 Export to CSV
        </button>
      </motion.div>

      {/* Date Range Filter - responsive wrapping */}
      <motion.div variants={itemVariants} className="flex gap-2 flex-wrap">
        {(['7d', '30d', '90d', 'all'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg transition-colors ${
              dateRange === range
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            {range === '7d' ? '7 days' : range === '30d' ? '30 days' : range === '90d' ? '90 days' : 'All time'}
          </button>
        ))}
      </motion.div>

      {/* Main Metrics Grid - responsive: 1 col mobile → 2 col tablet → 4 col desktop */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Submissions */}
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-4 sm:p-5 md:p-6 hover:border-blue-500/50 transition-colors">
          <p className="text-xs sm:text-sm text-gray-400 font-semibold">Total Submissions</p>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mt-2">{metrics?.totalSubmissions || 0}</p>
          <p className="text-green-400 text-xs sm:text-sm mt-2">+12% vs last period</p>
        </div>

        {/* Total Replies */}
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-4 sm:p-5 md:p-6 hover:border-purple-500/50 transition-colors">
          <p className="text-xs sm:text-sm text-gray-400 font-semibold">Total Replies</p>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mt-2">{metrics?.totalReplies || 0}</p>
          <p className="text-cyan-400 text-xs sm:text-sm mt-2">Rate: {metrics?.totalSubmissions ? Math.round((metrics.totalReplies / metrics.totalSubmissions) * 100) : 0}%</p>
        </div>

        {/* Avg Response Time */}
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-4 sm:p-5 md:p-6 hover:border-green-500/50 transition-colors">
          <p className="text-xs sm:text-sm text-gray-400 font-semibold">Avg Response Time</p>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mt-2">{metrics?.averageResponseTime || 0}m</p>
          <p className="text-amber-400 text-xs sm:text-sm mt-2">Minutes to reply</p>
        </div>

        {/* Email Delivery Rate */}
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-lg p-4 sm:p-5 md:p-6 hover:border-orange-500/50 transition-colors">
          <p className="text-xs sm:text-sm text-gray-400 font-semibold">Email Delivery</p>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mt-2">{metrics?.emailDeliveryRate || 0}%</p>
          <p className="text-red-400 text-xs sm:text-sm mt-2">Delivered</p>
        </div>
      </motion.div>

      {/* Status & Priority Breakdown - responsive: 1 col mobile → 2 col desktop */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Status Breakdown */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Status Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(metrics?.statusBreakdown || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-gray-300 capitalize text-sm">{status}</span>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-16 sm:w-24 bg-white/10 rounded-full h-2">
                    <div
                      className={`h-full rounded-full transition-all ${
                        status === 'new' ? 'bg-emerald-500' :
                        status === 'in_progress' ? 'bg-amber-500' :
                        status === 'responded' ? 'bg-blue-500' :
                        'bg-gray-500'
                      }`}
                      style={{
                        width: `${((count / (metrics?.totalSubmissions || 1)) * 100).toFixed(0)}%`,
                      }}
                    />
                  </div>
                  <span className="text-white font-semibold text-sm w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Priority Distribution</h3>
          <div className="space-y-3">
            {Object.entries(metrics?.priorityBreakdown || {}).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-gray-300 capitalize text-sm">{priority}</span>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-16 sm:w-24 bg-white/10 rounded-full h-2">
                    <div
                      className={`h-full rounded-full transition-all ${
                        priority === 'urgent' ? 'bg-red-600' :
                        priority === 'high' ? 'bg-orange-500' :
                        priority === 'normal' ? 'bg-blue-500' :
                        'bg-gray-500'
                      }`}
                      style={{
                        width: `${((count / (metrics?.totalSubmissions || 1)) * 100).toFixed(0)}%`,
                      }}
                    />
                  </div>
                  <span className="text-white font-semibold text-sm w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Email Performance - responsive: 1 col mobile → 3 col desktop */}
      <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Email Performance</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-lg p-4">
            <p className="text-xs sm:text-sm text-gray-400">Open Rate</p>
            <p className="text-2xl sm:text-3xl font-bold text-cyan-400 mt-2">{metrics?.emailOpenRate || 0}%</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-4">
            <p className="text-xs sm:text-sm text-gray-400">Total Sent</p>
            <p className="text-2xl sm:text-3xl font-bold text-purple-400 mt-2">{metrics?.totalReplies || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-lg p-4">
            <p className="text-xs sm:text-sm text-gray-400">Avg Response</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-400 mt-2">{metrics?.averageResponseTime || 0}m</p>
          </div>
        </div>
      </motion.div>

      {/* Activity Timeline */}
      <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="h-48 sm:h-64 flex items-center justify-center text-gray-400">
          <p className="text-xs sm:text-sm">Chart visualization coming in next update</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
