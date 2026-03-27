import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import ResponsiveModal from './ResponsiveModal';

interface Label {
  id: string;
  name: string;
  color: string;
  description: string;
}

interface LabelsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  client: any;
  onLabelsUpdate?: () => void;
}

const labelSchema = z.object({
  name: z.string().min(1, 'Label name is required').max(50),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  description: z.string().max(200).optional().or(z.literal('')),
});

type LabelFormData = z.infer<typeof labelSchema>;

export default function LabelsManager({
  isOpen,
  onClose,
  client,
  onLabelsUpdate,
}: LabelsManagerProps) {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<LabelFormData>({
    resolver: zodResolver(labelSchema),
  });

  const watchColor = watch('color');

  useEffect(() => {
    if (isOpen) {
      fetchLabels();
    }
  }, [isOpen]);

  const fetchLabels = async () => {
    try {
      const { data, error } = await client
        .from('labels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLabels(data || []);
    } catch (error) {
      console.error('Error fetching labels:', error);
      toast.error('Failed to load labels');
    }
  };

  const onSubmit: SubmitHandler<LabelFormData> = async (data) => {
    setLoading(true);
    try {
      if (editingId) {
        // Update existing label
        const { error } = await client
          .from('labels')
          .update(data)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Label updated successfully');
        setEditingId(null);
      } else {
        // Create new label
        const { error } = await client
          .from('labels')
          .insert([data]);

        if (error) throw error;
        toast.success('Label created successfully');
      }

      reset();
      await fetchLabels();
      onLabelsUpdate?.();
    } catch (error) {
      console.error('Error saving label:', error);
      toast.error('Failed to save label');
    } finally {
      setLoading(false);
    }
  };

  const deleteLabel = async (id: string) => {
    try {
      const { error } = await client
        .from('labels')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Label deleted');
      await fetchLabels();
    } catch (error) {
      console.error('Error deleting label:', error);
      toast.error('Failed to delete label');
    }
  };

  const startEdit = (label: Label) => {
    setEditingId(label.id);
    reset({
      name: label.name,
      color: label.color,
      description: label.description || '',
    });
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Labels"
      size="md"
      position="center"
      closeButton={true}
    >
      <div className="px-4 sm:px-5 md:px-6 space-y-4 sm:space-y-6">
        {/* Form Section */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-3 sm:space-y-4 bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 md:p-5"
        >
          {/* Label Name */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2">
              Label Name
            </label>
            <input
              {...register('name')}
              type="text"
              placeholder="e.g., Urgent, Collaboration, Feedback"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 sm:px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white/20 text-sm"
            />
            {errors.name && (
              <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Color and Description - Responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2">
                Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  {...register('color')}
                  type="color"
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg cursor-pointer border border-white/20"
                  defaultValue="#808080"
                />
                <input
                  type="text"
                  value={watchColor || '#808080'}
                  readOnly
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-xs sm:text-sm"
                />
              </div>
              {errors.color && (
                <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.color.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2">
                Description (Optional)
              </label>
              <input
                {...register('description')}
                type="text"
                placeholder="What is this label for?"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 sm:px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Action Buttons - Responsive layout */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold py-2 rounded-lg transition-colors text-sm h-10"
            >
              {loading ? 'Saving...' : editingId ? 'Update Label' : 'Create Label'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  reset();
                }}
                className="px-4 h-10 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </motion.form>

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* Labels List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-sm sm:text-base font-semibold text-white mb-3">
            Existing Labels ({labels.length})
          </h3>

          {labels.length === 0 ? (
            <p className="text-gray-400 text-center py-6 sm:py-8 text-xs sm:text-sm">
              No labels yet. Create your first label above!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
              <AnimatePresence>
                {labels.map((label) => (
                  <motion.div
                    key={label.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-3 h-3 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: label.color }}
                        />
                        <span className="font-semibold text-white text-xs sm:text-sm truncate">
                          {label.name}
                        </span>
                      </div>
                    </div>
                    {label.description && (
                      <p className="text-xs sm:text-sm text-gray-400 mb-3 line-clamp-2">
                        {label.description}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(label)}
                        className="flex-1 text-xs sm:text-sm bg-blue-600/30 hover:bg-blue-600/50 text-blue-400 py-1 sm:py-1.5 rounded transition-colors h-8 sm:h-9"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteLabel(label.id)}
                        className="flex-1 text-xs sm:text-sm bg-red-600/30 hover:bg-red-600/50 text-red-400 py-1 sm:py-1.5 rounded transition-colors h-8 sm:h-9"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </ResponsiveModal>
  );
}

