import React, { useState, useEffect } from 'react';
import { X, User, Mail, Briefcase, Shield, Users, Save, Trash2 } from 'lucide-react';
import { Button, LoadingSpinner } from '../ui';
import { AdminService } from '../../services';
import { validateEmployeeForm } from '../../utils/validation';

const EditEmployeeModal = ({ supabase, closeModal, modalProps }) => {
  const { employee, onComplete } = modalProps;
  
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    email: employee?.email || '',
    jobTitle: employee?.job_title || '',
    role: employee?.role || 'employee',
    managerId: employee?.manager_id || '',
    isActive: employee?.is_active !== false
  });
  
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchManagers();
  }, []);

  useEffect(() => {
    // Check if form data has changed from original
    const original = {
      name: employee?.name || '',
      email: employee?.email || '',
      jobTitle: employee?.job_title || '',
      role: employee?.role || 'employee',
      managerId: employee?.manager_id || '',
      isActive: employee?.is_active !== false
    };
    
    const changed = Object.keys(formData).some(key => formData[key] !== original[key]);
    setHasChanges(changed);
  }, [formData, employee]);

  const fetchManagers = async () => {
    try {
      const managersData = await AdminService.getPotentialManagers();
      setManagers(managersData);
    } catch (err) {
      console.error('Error fetching managers:', err);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    // Only validate changed fields
    const validation = validateEmployeeForm(formData);
    if (!validation.isValid) {
      setError(Object.values(validation.errors).join(', '));
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    if (!hasChanges) {
      setError('No changes to save');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Prepare update data - only include changed fields
      const updateData = {};
      const original = {
        name: employee?.name || '',
        email: employee?.email || '',
        jobTitle: employee?.job_title || '',
        role: employee?.role || 'employee',
        managerId: employee?.manager_id || '',
        isActive: employee?.is_active !== false
      };

      Object.keys(formData).forEach(key => {
        if (formData[key] !== original[key]) {
          updateData[key] = formData[key];
        }
      });

      const result = await AdminService.updateEmployee(employee.id, updateData);

      if (result.success) {
        if (onComplete) onComplete();
        closeModal();
        // Show success message
        setTimeout(() => {
          alert('Employee updated successfully!');
        }, 100);
      } else {
        setError(result.error || 'Failed to update employee');
      }
    } catch (err) {
      console.error('Error updating employee:', err);
      setError(err.message || 'Failed to update employee');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm(`Are you sure you want to ${formData.isActive ? 'deactivate' : 'reactivate'} ${employee.name}?`)) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const result = await AdminService.updateEmployee(employee.id, {
        isActive: !formData.isActive
      });

      if (result.success) {
        setFormData(prev => ({ ...prev, isActive: !prev.isActive }));
        if (onComplete) onComplete();
        alert(`Employee ${!formData.isActive ? 'reactivated' : 'deactivated'} successfully!`);
      } else {
        setError(result.error || 'Failed to update employee status');
      }
    } catch (err) {
      console.error('Error updating employee status:', err);
      setError(err.message || 'Failed to update employee status');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges && !confirm('You have unsaved changes. Are you sure you want to close?')) {
      return;
    }
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <User className="text-cyan-400" size={24} />
            <div>
              <h2 className="text-xl font-bold text-white">Edit Employee</h2>
              <p className="text-gray-400 text-sm">Update {employee?.name}'s information</p>
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
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-900 border border-red-700 rounded-lg p-3">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Current Status */}
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Status:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                formData.isActive 
                  ? 'bg-green-900 text-green-200' 
                  : 'bg-red-900 text-red-200'
              }`}>
                {formData.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="John Doe"
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="john.doe@company.com"
              disabled={loading}
            />
          </div>

          {/* Job Title */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Job Title *
            </label>
            <input
              type="text"
              value={formData.jobTitle}
              onChange={(e) => handleInputChange('jobTitle', e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Software Developer"
              disabled={loading}
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Role *
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Manager */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Manager (Optional)
            </label>
            <select
              value={formData.managerId}
              onChange={(e) => handleInputChange('managerId', e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="">No Manager</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.name} ({manager.job_title})
                </option>
              ))}
            </select>
          </div>

          {/* Change Indicator */}
          {hasChanges && (
            <div className="bg-blue-900 bg-opacity-50 rounded-lg p-3 border border-blue-700">
              <p className="text-blue-200 text-sm">
                ⚠️ You have unsaved changes
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col space-y-3 pt-4">
            {/* Save Button */}
            <Button
              onClick={handleSave}
              variant="primary"
              disabled={loading || !hasChanges}
              className="w-full"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Changes
                </>
              )}
            </Button>

            {/* Secondary Actions */}
            <div className="flex space-x-3">
              <Button
                onClick={handleDeactivate}
                variant={formData.isActive ? "danger" : "success"}
                disabled={loading}
                className="flex-1"
              >
                {formData.isActive ? (
                  <>
                    <Trash2 size={16} className="mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <User size={16} className="mr-2" />
                    Reactivate
                  </>
                )}
              </Button>

              <Button
                onClick={handleCancel}
                variant="secondary"
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEmployeeModal;