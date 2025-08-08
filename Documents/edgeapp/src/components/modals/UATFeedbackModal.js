import React, { useState } from 'react';
import { X, AlertTriangle, Bug, Lightbulb, HelpCircle, Upload, Copy, Send } from 'lucide-react';
import { Button } from '../ui';

const UATFeedbackModal = ({ closeModal }) => {
  const [feedbackData, setFeedbackData] = useState({
    category: 'bug',
    priority: 'medium',
    title: '',
    description: '',
    screenshot: null,
    reproductionSteps: '',
    browserInfo: `${navigator.userAgent} | Screen: ${screen.width}x${screen.height}`,
    url: window.location.href
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const categories = [
    { 
      value: 'bug', 
      label: 'Bug Report', 
      icon: Bug, 
      color: 'text-red-400 bg-red-900/20',
      description: 'Something is broken or not working as expected'
    },
    { 
      value: 'ui_ux', 
      label: 'UI/UX Issue', 
      icon: AlertTriangle, 
      color: 'text-orange-400 bg-orange-900/20',
      description: 'Design, layout, or usability problems'
    },
    { 
      value: 'feature_request', 
      label: 'Feature Request', 
      icon: Lightbulb, 
      color: 'text-yellow-400 bg-yellow-900/20',
      description: 'Suggestion for new functionality or improvements'
    },
    { 
      value: 'question', 
      label: 'Question/Help', 
      icon: HelpCircle, 
      color: 'text-blue-400 bg-blue-900/20',
      description: 'Need help understanding how something works'
    },
    { 
      value: 'other', 
      label: 'Other', 
      icon: AlertTriangle, 
      color: 'text-purple-400 bg-purple-900/20',
      description: 'General feedback or other concerns'
    }
  ];

  const priorities = [
    { value: 'low', label: 'Low Priority', color: 'text-gray-400' },
    { value: 'medium', label: 'Medium Priority', color: 'text-yellow-400' },
    { value: 'high', label: 'High Priority', color: 'text-orange-400' },
    { value: 'critical', label: 'Critical - Blocking', color: 'text-red-400' }
  ];

  const handleFileUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image must be smaller than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setFeedbackData(prev => ({
          ...prev,
          screenshot: {
            file,
            dataUrl: e.target.result,
            name: file.name,
            size: file.size
          }
        }));
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload an image file (PNG, JPG, GIF)');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const copySystemInfo = () => {
    const systemInfo = `Browser: ${navigator.userAgent}
Screen Resolution: ${screen.width}x${screen.height}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}`;
    
    navigator.clipboard.writeText(systemInfo).then(() => {
      alert('System information copied to clipboard!');
    });
  };

  const handleSubmit = async () => {
    if (!feedbackData.title.trim()) {
      alert('Please provide a title for your feedback');
      return;
    }
    
    if (!feedbackData.description.trim()) {
      alert('Please provide a description of the issue');
      return;
    }

    try {
      setSubmitting(true);
      
      // Import the service dynamically
      const { default: UATFeedbackService } = await import('../../services/UATFeedbackService');
      
      await UATFeedbackService.submitFeedback({
        ...feedbackData,
        submittedAt: new Date().toISOString()
      });
      
      alert('✅ Thank you! Your feedback has been submitted successfully. The admin team will review it shortly.');
      closeModal();
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('❌ Error submitting feedback. Please try again or contact support directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategory = categories.find(cat => cat.value === feedbackData.category);
  const CategoryIcon = selectedCategory?.icon || Bug;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col border-2 border-red-500">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-red-500/30 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="text-red-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">UAT Feedback & Bug Report</h2>
              <p className="text-red-400 text-sm">Help us improve the system during testing</p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              What type of feedback is this?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.value}
                    onClick={() => setFeedbackData(prev => ({ ...prev, category: category.value }))}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      feedbackData.category === category.value
                        ? `border-cyan-500 ${category.color}`
                        : 'border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon size={20} />
                      <div>
                        <div className="font-medium">{category.label}</div>
                        <div className="text-xs opacity-75">{category.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Priority Level
            </label>
            <select
              value={feedbackData.priority}
              onChange={(e) => setFeedbackData(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {priorities.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Issue Title *
            </label>
            <input
              type="text"
              value={feedbackData.title}
              onChange={(e) => setFeedbackData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Brief description of the issue..."
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              maxLength={100}
            />
            <div className="text-xs text-gray-500 mt-1">{feedbackData.title.length}/100 characters</div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Detailed Description *
            </label>
            <textarea
              value={feedbackData.description}
              onChange={(e) => setFeedbackData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Please describe the issue in detail. What were you trying to do? What happened? What did you expect to happen?"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows={4}
              maxLength={1000}
            />
            <div className="text-xs text-gray-500 mt-1">{feedbackData.description.length}/1000 characters</div>
          </div>

          {/* Reproduction Steps */}
          {feedbackData.category === 'bug' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Steps to Reproduce (Optional)
              </label>
              <textarea
                value={feedbackData.reproductionSteps}
                onChange={(e) => setFeedbackData(prev => ({ ...prev, reproductionSteps: e.target.value }))}
                placeholder="1. Go to... &#10;2. Click on... &#10;3. See error..."
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
              />
            </div>
          )}

          {/* Screenshot Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Screenshot (Optional)
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive 
                  ? 'border-red-500 bg-red-500/10' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              {feedbackData.screenshot ? (
                <div className="space-y-3">
                  <img
                    src={feedbackData.screenshot.dataUrl}
                    alt="Screenshot preview"
                    className="max-w-full max-h-48 mx-auto rounded border border-gray-600"
                  />
                  <div className="text-sm text-gray-300">
                    {feedbackData.screenshot.name} ({(feedbackData.screenshot.size / 1024).toFixed(1)} KB)
                  </div>
                  <button
                    onClick={() => setFeedbackData(prev => ({ ...prev, screenshot: null }))}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove Screenshot
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="mx-auto text-gray-400" size={32} />
                  <div className="text-gray-300">
                    <p>Drag & drop a screenshot here, or</p>
                    <label className="text-red-400 hover:text-red-300 cursor-pointer">
                      browse to upload
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* System Information */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                System Information (Auto-collected)
              </label>
              <button
                onClick={copySystemInfo}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
              >
                <Copy size={12} />
                <span>Copy</span>
              </button>
            </div>
            <div className="bg-gray-700/50 p-3 rounded text-xs text-gray-400 font-mono">
              <div>URL: {feedbackData.url}</div>
              <div>Browser: {navigator.userAgent.split(' ').slice(0, 3).join(' ')}...</div>
              <div>Screen: {screen.width}x{screen.height}</div>
              <div>Time: {new Date().toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-end space-x-3 flex-shrink-0">
          <Button
            onClick={closeModal}
            variant="secondary"
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="primary"
            disabled={submitting}
            className="bg-red-600 hover:bg-red-700"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={16} className="mr-2" />
                Submit Feedback
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UATFeedbackModal;