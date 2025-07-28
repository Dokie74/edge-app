import React, { useState, useEffect } from 'react';
import { X, Send, MessageSquare, User, Star, AlertCircle } from 'lucide-react';
import { Button, LoadingSpinner } from '../ui';
import { useApp } from '../../contexts';

const GiveFeedbackModal = ({ supabase, closeModal, modalProps }) => {
  const { userName } = useApp();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    recipientId: modalProps?.recipientId || '',
    feedbackType: 'positive',
    message: '',
    category: 'general',
    anonymous: false
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase.rpc('get_employees_for_feedback');
      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.recipientId) {
      newErrors.recipientId = 'Please select a recipient';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Please provide feedback message';
    }
    if (formData.message.trim().length < 10) {
      newErrors.message = 'Feedback should be at least 10 characters';
    }
    if (formData.message.trim().length > 500) {
      newErrors.message = 'Feedback should be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      
      const { error } = await supabase.rpc('give_peer_feedback', {
        p_recipient_id: formData.recipientId,
        p_feedback_type: formData.feedbackType,
        p_message: formData.message.trim(),
        p_category: formData.category,
        p_is_anonymous: formData.anonymous
      });

      if (error) throw error;

      // Call completion callback
      if (modalProps?.onComplete) {
        modalProps.onComplete();
      }

      closeModal();
      
      // Show success message
      alert('Feedback sent successfully! This will help foster continuous dialogue and growth.');
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error sending feedback: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const feedbackTypes = [
    { value: 'positive', label: 'Positive Recognition', icon: Star, color: 'text-yellow-400' },
    { value: 'constructive', label: 'Constructive Feedback', icon: MessageSquare, color: 'text-blue-400' },
    { value: 'appreciation', label: 'Thank You', icon: User, color: 'text-green-400' }
  ];

  const categories = [
    { value: 'general', label: 'General Feedback' },
    { value: 'teamwork', label: 'Teamwork & Collaboration' },
    { value: 'communication', label: 'Communication' },
    { value: 'core_values', label: 'Core Values Demonstration' },
    { value: 'innovation', label: 'Innovation & Problem Solving' },
    { value: 'leadership', label: 'Leadership & Initiative' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <MessageSquare className="text-cyan-400" size={24} />
            <div>
              <h2 className="text-xl font-bold text-white">Give Real-Time Feedback</h2>
              <p className="text-gray-400 text-sm">Foster continuous dialogue and growth</p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <LoadingSpinner size="md" message="Loading employees..." />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Recipient Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Give feedback to: *
                </label>
                <select
                  value={formData.recipientId}
                  onChange={(e) => handleInputChange('recipientId', e.target.value)}
                  className={`w-full p-3 bg-gray-700 border rounded-md text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                    errors.recipientId ? 'border-red-500' : 'border-gray-600'
                  }`}
                >
                  <option value="">Select a colleague...</option>
                  {employees.map(employee => (
                    <option key={employee.employee_id} value={employee.employee_id}>
                      {employee.name} - {employee.job_title || 'Employee'}
                    </option>
                  ))}
                </select>
                {errors.recipientId && (
                  <p className="text-red-400 text-sm flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.recipientId}
                  </p>
                )}
              </div>

              {/* Feedback Type */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  Feedback Type: *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {feedbackTypes.map(type => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleInputChange('feedbackType', type.value)}
                        className={`p-3 border rounded-lg text-left transition-colors ${
                          formData.feedbackType === type.value
                            ? 'border-cyan-500 bg-cyan-900 bg-opacity-50'
                            : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Icon size={18} className={type.color} />
                          <span className="text-white text-sm font-medium">{type.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Category:
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Feedback Message */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Your Feedback: *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className={`w-full p-3 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                    errors.message ? 'border-red-500' : 'border-gray-600'
                  }`}
                  rows={4}
                  placeholder={
                    formData.feedbackType === 'positive' 
                      ? "Share what they did well and how it made a positive impact..."
                      : formData.feedbackType === 'constructive'
                      ? "Provide specific, actionable feedback to help them grow..."
                      : "Express your appreciation for their help, support, or collaboration..."
                  }
                />
                <div className="flex justify-between items-center">
                  {errors.message ? (
                    <p className="text-red-400 text-sm flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.message}
                    </p>
                  ) : (
                    <p className="text-gray-400 text-xs">
                      {formData.message.length}/500 characters
                    </p>
                  )}
                </div>
              </div>

              {/* Anonymous Option */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={formData.anonymous}
                  onChange={(e) => handleInputChange('anonymous', e.target.checked)}
                  className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                />
                <label htmlFor="anonymous" className="text-sm text-gray-300">
                  Send this feedback anonymously
                </label>
              </div>

              {/* Guidelines */}
              <div className="bg-blue-900 bg-opacity-50 rounded-lg p-4 border border-blue-700">
                <h4 className="text-blue-200 font-medium mb-2">Feedback Guidelines:</h4>
                <ul className="text-blue-300 text-xs space-y-1">
                  <li>• Be specific and focus on behaviors, not personality</li>
                  <li>• Provide actionable insights when giving constructive feedback</li>
                  <li>• Celebrate wins and recognize great work with positive feedback</li>
                  <li>• Keep it professional and respectful</li>
                  <li>• Focus on growth and improvement opportunities</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                <Button
                  type="button"
                  onClick={closeModal}
                  variant="secondary"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting || !formData.recipientId || !formData.message.trim()}
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} className="mr-2" />
                      Send Feedback
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default GiveFeedbackModal;