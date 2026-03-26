import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import SubmissionDetailPanel from '../components/SubmissionDetailPanel';
import BulkActionsBar from '../components/BulkActionsBar';
import LabelsManager from '../components/LabelsManager';

export const SubmissionsPage = ({ client }) => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showLabelsManager, setShowLabelsManager] = useState(false);
  const [labels, setLabels] = useState([]);
  const [archiveFilter, setArchiveFilter] = useState('active');

  // Fetch submissions
  useEffect(() => {
    fetchLabels();
    fetchSubmissions();
    // Refresh every 10 seconds
    const interval = setInterval(fetchSubmissions, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchLabels = async () => {
    try {
      const { data, error } = await client.from('labels').select('*');
      if (error) throw error;
      setLabels(data || []);
    } catch (error) {
      console.error('Error fetching labels:', error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      if (!client) return;

      const { data, error } = await client
        .from('submissions')
        .select(`
          *,
          submission_replies:submission_replies(count),
          submission_labels(label_id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  // Filter and search
  useEffect(() => {
    let result = submissions;

    // Apply archive filter
    if (archiveFilter === 'active') {
      result = result.filter(s => !s.archived);
    } else if (archiveFilter === 'archived') {
      result = result.filter(s => s.archived);
    }

    // Apply status filter
    if (filter !== 'all') {
      result = result.filter(s => s.status === filter);
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        s.subject.toLowerCase().includes(term)
      );
    }

    // Apply sort
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortBy === 'unanswered') {
      result = result.filter(s => s.status === 'new');
    }

    setFilteredSubmissions(result);
  }, [submissions, filter, searchTerm, sortBy, archiveFilter]);

  const getStatusColor = (status) => {
    const colors = {
      'new': 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      'in_progress': 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      'responded': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      'closed': 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
    };
    return colors[status] || colors.new;
  };

  const getStatusLabel = (status) => {
    const labels = {
      'new': 'New',
      'in_progress': 'In Progress',
      'responded': 'Responded',
      'closed': 'Closed',
    };
    return labels[status] || status;
  };

  // Multi-select handlers
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(new Set(filteredSubmissions.map(s => s.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id, checked) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  // Bulk action handlers
  const handleBulkStatusChange = async (status) => {
    try {
      const ids = Array.from(selectedIds);
      const { error } = await client
        .from('submissions')
        .update({ status })
        .in('id', ids);

      if (error) throw error;
      await fetchSubmissions();
      setSelectedIds(new Set());
      toast.success(`Updated ${ids.length} submissions`);
    } catch (error) {
      console.error('Error updating submissions:', error);
      toast.error('Failed to update submissions');
    }
  };

  const handleBulkArchive = async () => {
    try {
      const ids = Array.from(selectedIds);
      const { error } = await client
        .from('submissions')
        .update({ archived: true, archived_at: new Date().toISOString() })
        .in('id', ids);

      if (error) throw error;
      await fetchSubmissions();
      setSelectedIds(new Set());
      toast.success(`Archived ${ids.length} submissions`);
    } catch (error) {
      console.error('Error archiving submissions:', error);
      toast.error('Failed to archive submissions');
    }
  };

  const handleBulkDelete = async () => {
    try {
      const ids = Array.from(selectedIds);
      const { error } = await client
        .from('submissions')
        .delete()
        .in('id', ids);

      if (error) throw error;
      await fetchSubmissions();
      setSelectedIds(new Set());
      toast.success(`Deleted ${ids.length} submissions`);
    } catch (error) {
      console.error('Error deleting submissions:', error);
      toast.error('Failed to delete submissions');
    }
  };

  const handleBulkAddLabel = async (labelId) => {
    try {
      const ids = Array.from(selectedIds);
      const labelInserts = ids.map(id => ({ submission_id: id, label_id: labelId }));

      const { error } = await client
        .from('submission_labels')
        .insert(labelInserts);

      if (error) throw error;
      await fetchSubmissions();
      toast.success(`Added label to ${ids.length} submissions`);
    } catch (error) {
      console.error('Error adding label:', error);
      toast.error('Failed to add label');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⌛</div>
          <p className="text-gray-300">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      {/* Header with Labels Manager Button */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Submissions</h1>
          <p className="text-gray-400">Manage and respond to contact inquiries</p>
        </div>
        <button
          onClick={() => setShowLabelsManager(true)}
          className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-400 rounded-lg transition-colors"
        >
          🏷️ Manage Labels
        </button>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <input
          type="text"
          placeholder="Search by name, email, or subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="col-span-1 md:col-span-2 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#61DAFB]/50"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#61DAFB]/50"
        >
          <option value="all" className="bg-[#0a1929]">All Statuses</option>
          <option value="new" className="bg-[#0a1929]">New</option>
          <option value="in_progress" className="bg-[#0a1929]">In Progress</option>
          <option value="responded" className="bg-[#0a1929]">Responded</option>
          <option value="closed" className="bg-[#0a1929]">Closed</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#61DAFB]/50"
        >
          <option value="newest" className="bg-[#0a1929]">Newest First</option>
          <option value="oldest" className="bg-[#0a1929]">Oldest First</option>
          <option value="unanswered" className="bg-[#0a1929]">Unanswered</option>
        </select>

        <select
          value={archiveFilter}
          onChange={(e) => setArchiveFilter(e.target.value)}
          className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#61DAFB]/50"
        >
          <option value="active" className="bg-[#0a1929]">Active</option>
          <option value="archived" className="bg-[#0a1929]">Archived</option>
          <option value="all" className="bg-[#0a1929]">All</option>
        </select>
      </div>

      {/* Submissions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur border border-white/10 rounded-lg overflow-hidden"
      >
        {filteredSubmissions.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p className="text-lg mb-2">No submissions found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-4 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredSubmissions.length && filteredSubmissions.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Subject</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Priority</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Labels</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Replies</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredSubmissions.map((submission) => {
                    const submissionLabels = labels.filter(
                      l => submission.submission_labels?.some(sl => sl.label_id === l.id)
                    );

                    return (
                      <motion.tr
                        key={submission.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(submission.id)}
                            onChange={(e) => handleSelectOne(submission.id, e.target.checked)}
                            className="w-4 h-4 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-white">{submission.name}</span>
                            <span className="text-sm text-gray-400">{submission.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-200 truncate max-w-xs">{submission.subject}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(submission.status)}`}>
                            {getStatusLabel(submission.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            submission.priority === 'urgent' ? 'bg-red-600/30 text-red-400' :
                            submission.priority === 'high' ? 'bg-orange-600/30 text-orange-400' :
                            submission.priority === 'normal' ? 'bg-blue-600/30 text-blue-400' :
                            'bg-gray-600/30 text-gray-400'
                          }`}>
                            {submission.priority || 'normal'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1 flex-wrap">
                            {submissionLabels.slice(0, 2).map((label) => (
                              <span
                                key={label.id}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white"
                                style={{ backgroundColor: label.color + '33' }}
                              >
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: label.color }}
                                />
                                {label.name}
                              </span>
                            ))}
                            {submissionLabels.length > 2 && (
                              <span className="text-xs text-gray-400">+{submissionLabels.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {submission.submission_replies?.[0]?.count || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {new Date(submission.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedSubmission(submission)}
                            className="text-[#61DAFB] hover:text-[#61DAFB]/80 text-sm font-medium transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', count: submissions.filter(s => !s.archived).length, color: 'from-blue-500/20 to-blue-600/20', accent: 'text-blue-400' },
          { label: 'New', count: submissions.filter(s => s.status === 'new' && !s.archived).length, color: 'from-emerald-500/20 to-emerald-600/20', accent: 'text-emerald-400' },
          { label: 'In Progress', count: submissions.filter(s => s.status === 'in_progress' && !s.archived).length, color: 'from-amber-500/20 to-amber-600/20', accent: 'text-amber-400' },
          { label: 'Responded', count: submissions.filter(s => s.status === 'responded' && !s.archived).length, color: 'from-purple-500/20 to-purple-600/20', accent: 'text-purple-400' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br ${stat.color} backdrop-blur border border-white/10 rounded-lg p-4`}
          >
            <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.accent}`}>{stat.count}</p>
          </motion.div>
        ))}
      </div>

      {/* Detail Panel */}
      {selectedSubmission && (
        <SubmissionDetailPanel
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          client={client}
          onRefresh={fetchSubmissions}
        />
      )}

      {/* Labels Manager Modal */}
      <LabelsManager
        isOpen={showLabelsManager}
        onClose={() => {
          setShowLabelsManager(false);
          fetchLabels();
        }}
        client={client}
        onLabelsUpdate={fetchLabels}
      />

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <BulkActionsBar
          selectedCount={selectedIds.size}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkArchive={handleBulkArchive}
          onBulkDelete={handleBulkDelete}
          onBulkAddLabel={handleBulkAddLabel}
          labels={labels}
          onClose={() => setSelectedIds(new Set())}
        />
      )}
    </div>
  );
};

export default SubmissionsPage;
