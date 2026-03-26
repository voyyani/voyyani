import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface BulkActionsBarProps {
  selectedCount: number;
  onBulkStatusChange: (status: string) => Promise<void>;
  onBulkArchive: () => Promise<void>;
  onBulkDelete: () => Promise<void>;
  onBulkAddLabel: (labelId: string) => Promise<void>;
  labels: Array<{ id: string; name: string; color: string }>;
  onClose: () => void;
}

export default function BulkActionsBar({
  selectedCount,
  onBulkStatusChange,
  onBulkArchive,
  onBulkDelete,
  onBulkAddLabel,
  labels,
  onClose,
}: BulkActionsBarProps) {
  const [loading, setLoading] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showLabelMenu, setShowLabelMenu] = useState(false);

  const statuses = ['new', 'in_progress', 'responded', 'closed'];

  const handleStatusChange = async (status: string) => {
    setLoading(true);
    try {
      await onBulkStatusChange(status);
      toast.success(`Updated ${selectedCount} submission(s)`);
      setShowStatusMenu(false);
    } catch (error) {
      toast.error('Failed to update submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    const confirmed = window.confirm(`Archive ${selectedCount} submission(s)?`);
    if (!confirmed) return;

    setLoading(true);
    try {
      await onBulkArchive();
      toast.success(`Archived ${selectedCount} submission(s)`);
      onClose();
    } catch (error) {
      toast.error('Failed to archive submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete ${selectedCount} submission(s)? This cannot be undone.`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      await onBulkDelete();
      toast.success(`Deleted ${selectedCount} submission(s)`);
      onClose();
    } catch (error) {
      toast.error('Failed to delete submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLabel = async (labelId: string) => {
    setLoading(true);
    try {
      await onBulkAddLabel(labelId);
      toast.success(`Added label to ${selectedCount} submission(s)`);
      setShowLabelMenu(false);
    } catch (error) {
      toast.error('Failed to add label');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#061220] to-[#0a1929] border-t border-white/10 shadow-lg z-40"
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Info */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white px-3 py-1 rounded-full font-semibold">
              {selectedCount}
            </div>
            <span className="text-gray-300">
              {selectedCount === 1 ? 'submission' : 'submissions'} selected
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Status Change */}
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                disabled={loading}
                className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                📋 Status
              </button>
              {showStatusMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-[#0a1929] border border-white/10 rounded-lg shadow-lg overflow-hidden">
                  {statuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={loading}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors capitalize disabled:opacity-50"
                    >
                      {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Add Label */}
            {labels.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowLabelMenu(!showLabelMenu)}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-400 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  🏷️ Label
                </button>
                {showLabelMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-[#0a1929] border border-white/10 rounded-lg shadow-lg overflow-hidden">
                    {labels.map((label) => (
                      <button
                        key={label.id}
                        onClick={() => handleAddLabel(label.id)}
                        disabled={loading}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: label.color }}
                        />
                        {label.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Archive */}
            <button
              onClick={handleArchive}
              disabled={loading}
              className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-400 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              📦 Archive
            </button>

            {/* Delete */}
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              🗑️ Delete
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 border border-gray-500/30 text-gray-400 rounded-lg transition-colors disabled:opacity-50"
            >
              ✕ Close
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
