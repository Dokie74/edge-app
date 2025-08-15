import React, { useState } from 'react';
import { X, Calendar, Plus } from 'lucide-react';
import { Button, LoadingSpinner } from '../ui';

const CreateReviewCycleModal = ({ supabase, closeModal, modalProps }) => {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error when user types
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Review cycle name is required');
      return false;
    }
    if (!formData.startDate) {
      setError('Start date is required');
      return false;
    }
    if (!formData.endDate) {
      setError('End date is required');
      return false;
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError('End date must be after start date');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

      // Step 1: Create the review cycle
      const { data: createData, error: createError } = await supabase.rpc('create_simple_review_cycle', {
        p_name: formData.name.trim(),
        p_start_date: formData.startDate,
        p_end_date: formData.endDate
      });

      if (createError) throw createError;

      if (createData?.error) {
        setError(createData.error);
        return;
      }

      // Step 2: Activate the review cycle using the new reliable function
      const cycleId = createData?.cycle_id;
      if (cycleId) {
        try {
          console.log('Activating review cycle with reliable function:', cycleId);
          const { data: activateData, error: activateError } = await supabase.rpc('activate_review_cycle', {
            p_cycle_id: cycleId
          });
          
          if (activateError) throw activateError;
          
          if (activateData?.error) {
            console.error('Activation error:', activateData.error);
            alert(`Review cycle created but failed to activate: ${activateData.error}`);
          } else {
            alert(`Review cycle activated successfully! Created ${activateData.assessments_created} assessments for all employees.`);
          }
        } catch (err) {
          console.error('Error activating review cycle:', err);
          alert(`Review cycle created but failed to activate: ${err.message}`);
        }
      }

      // Success - call completion callback and close modal
      if (modalProps?.onComplete) {
        modalProps.onComplete();
      }
      
      closeModal();
      
    } catch (err) {
      console.error('Error creating review cycle:', err);
      setError(err.message || 'Failed to create review cycle');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    closeModal();
  };

  // Set default dates (current quarter)
  React.useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Default to current quarter
    let startMonth, endMonth;
    if (currentMonth < 3) { // Q1
      startMonth = 0; endMonth = 2;
    } else if (currentMonth < 6) { // Q2
      startMonth = 3; endMonth = 5;
    } else if (currentMonth < 9) { // Q3
      startMonth = 6; endMonth = 8;
    } else { // Q4
      startMonth = 9; endMonth = 11;
    }

    const startDate = new Date(currentYear, startMonth, 1).toISOString().split('T')[0];
    const endDate = new Date(currentYear, endMonth + 1, 0).toISOString().split('T')[0];
    
    setFormData(prev => ({
      ...prev,
      startDate: prev.startDate || startDate,
      endDate: prev.endDate || endDate
    }));
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Calendar className="text-cyan-400" size={24} />
            <div>
              <h2 className="text-xl font-bold text-white">Create Review Cycle</h2>
              <p className="text-gray-400 text-sm">Set up a new quarterly review period</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-900 border border-red-700 rounded-lg p-3">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Review Cycle Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Review Cycle Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="e.g., Q4 2024 Performance Review"
              disabled={loading}
            />
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Start Date *
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              End Date *
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-900 bg-opacity-50 rounded-lg p-4 border border-blue-700">
            <h4 className="text-blue-200 font-medium mb-2">Review Cycle Info:</h4>
            <ul className="text-blue-300 text-sm space-y-1">
              <li>• Creates a new performance review period</li>
              <li>• Employees can complete self-assessments</li>
              <li>• Managers can review and provide feedback</li>
              <li>• Cycle starts in "upcoming" status</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={handleCancel}
              variant="secondary"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !formData.name.trim() || !formData.startDate || !formData.endDate}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={16} className="mr-2" />
                  Create Cycle
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReviewCycleModal;