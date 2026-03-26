import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0a1929] border border-white/10 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">Manage Labels</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Label Name
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    placeholder="e.g., Urgent, Collaboration, Feedback"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white/20"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        {...register('color')}
                        type="color"
                        className="w-12 h-12 rounded-lg cursor-pointer border border-white/20"
                        defaultValue="#808080"
                      />
                      <input
                        type="text"
                        value={watchColor || '#808080'}
                        readOnly
                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                    {errors.color && (
                      <p className="text-red-400 text-sm mt-1">{errors.color.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Description (Optional)
                    </label>
                    <input
                      {...register('description')}
                      type="text"
                      placeholder="What is this label for?"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold py-2 rounded-lg transition-colors"
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
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              {/* Divider */}
              <div className="border-t border-white/10" />

              {/* Labels List */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Existing Labels ({labels.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {labels.map((label) => (
                    <motion.div
                      key={label.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="bg-white/5 border border-white/10 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: label.color }}
                          />
                          <span className="font-semibold text-white">{label.name}</span>
                        </div>
                      </div>
                      {label.description && (
                        <p className="text-sm text-gray-400 mb-3">{label.description}</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(label)}
                          className="flex-1 text-sm bg-blue-600/30 hover:bg-blue-600/50 text-blue-400 py-1 rounded transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteLabel(label.id)}
                          className="flex-1 text-sm bg-red-600/30 hover:bg-red-600/50 text-red-400 py-1 rounded transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {labels.length === 0 && (
                  <p className="text-gray-400 text-center py-8">No labels yet. Create your first label above!</p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
