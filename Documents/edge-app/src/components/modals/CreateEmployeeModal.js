import React, { useState, useEffect } from 'react';
import { X, User, Mail, Briefcase, Shield, Users, Copy, Check } from 'lucide-react';
import { Button, LoadingSpinner } from '../ui';
import { AdminService } from '../../services';

const CreateEmployeeModal = ({ supabase, closeModal, modalProps }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    jobTitle: '',
    role: 'employee',
    managerId: '',
    departmentIds: []
  });
  const [managers, setManagers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchManagers();
    fetchDepartments();
  }, []);

  const fetchManagers = async () => {
    try {
      const managersData = await AdminService.getPotentialManagers();
      setManagers(managersData);
    } catch (err) {
      console.error('Error fetching managers:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await supabase.rpc('get_all_departments');
      if (response.data) {
        setDepartments(response.data);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleDepartmentToggle = (departmentId) => {
    setFormData(prev => ({
      ...prev,
      departmentIds: prev.departmentIds.includes(departmentId)
        ? prev.departmentIds.filter(id => id !== departmentId)
        : [...prev.departmentIds, departmentId]
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Employee name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.jobTitle.trim()) {
      setError('Job title is required');
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

      const result = await AdminService.createEmployee({
        name: formData.name,
        email: formData.email,
        jobTitle: formData.jobTitle,
        role: formData.role,
        managerId: formData.managerId || null
      });

      if (result.success) {
        // If departments are selected, assign them to the employee
        if (formData.departmentIds.length > 0) {
          try {
            await supabase.rpc('set_employee_departments', {
              p_employee_id: result.data.employee_id,
              p_department_ids: formData.departmentIds
            });
          } catch (deptErr) {
            console.error('Error setting employee departments:', deptErr);
            // Still show success, but note the department assignment may have failed
          }
        }
        setSuccess(result);
      } else {
        setError(result.error || 'Failed to create employee');
      }
    } catch (err) {
      console.error('Error creating employee:', err);
      setError(err.message || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  const copyInstructions = () => {
    if (success) {
      const instructions = AdminService.generateInvitationInstructions(
        { ...formData, role: formData.role },
        success.next_steps
      );
      navigator.clipboard.writeText(instructions.copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFinish = () => {
    if (modalProps?.onComplete) {
      modalProps.onComplete();
    }
    closeModal();
  };

  // Success view
  if (success) {
    const instructions = AdminService.generateInvitationInstructions(
      { ...formData, role: formData.role },
      success.next_steps
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <Check className="text-green-400" size={24} />
              <div>
                <h2 className="text-xl font-bold text-white">Employee Created Successfully!</h2>
                <p className="text-gray-400 text-sm">Send invitation instructions to the new employee</p>
              </div>
            </div>
            <button
              onClick={handleFinish}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Employee Summary */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">New Employee Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Name:</span>
                  <span className="text-white ml-2">{formData.name}</span>
                </div>
                <div>
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white ml-2">{formData.email}</span>
                </div>
                <div>
                  <span className="text-gray-400">Role:</span>
                  <span className="text-white ml-2 capitalize">{formData.role}</span>
                </div>
                <div>
                  <span className="text-gray-400">Job Title:</span>
                  <span className="text-white ml-2">{formData.jobTitle}</span>
                </div>
                {formData.departmentIds.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-gray-400">Departments:</span>
                    <span className="text-white ml-2">
                      {departments.filter(d => formData.departmentIds.includes(d.id)).map(d => d.name).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              <h3 className="text-white font-medium">Next Steps:</h3>
              
              <div className="bg-blue-900 bg-opacity-50 rounded-lg p-4 border border-blue-700">
                <h4 className="text-blue-200 font-medium mb-2">📧 Email Template</h4>
                <div className="text-blue-300 text-sm space-y-2">
                  <div><strong>Subject:</strong> {instructions.subject}</div>
                  <div className="bg-blue-800 bg-opacity-50 p-3 rounded text-xs whitespace-pre-line">
                    {instructions.body}
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-gray-200 font-medium mb-2">Quick Copy</h4>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 text-xs bg-gray-800 p-2 rounded text-gray-300">
                    {instructions.copyText}
                  </code>
                  <Button
                    onClick={copyInstructions}
                    variant="secondary"
                    size="sm"
                  >
                    {copied ? (
                      <>
                        <Check size={14} className="mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={14} className="mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end">
              <Button onClick={handleFinish} variant="primary">
                Done
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form view
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <User className="text-cyan-400" size={24} />
            <div>
              <h2 className="text-xl font-bold text-white">Create New Employee</h2>
              <p className="text-gray-400 text-sm">Add a new team member to EDGE</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-900 border border-red-700 rounded-lg p-3">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

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

          {/* Departments */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Departments (Optional)
            </label>
            <div className="grid grid-cols-2 gap-2 p-3 bg-gray-700 border border-gray-600 rounded-md">
              {departments.map((department) => (
                <label
                  key={department.id}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-600 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={formData.departmentIds.includes(department.id)}
                    onChange={() => handleDepartmentToggle(department.id)}
                    className="w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
                    disabled={loading}
                  />
                  <span className="text-white text-sm">{department.name}</span>
                </label>
              ))}
            </div>
            {formData.departmentIds.length > 0 && (
              <p className="text-xs text-gray-400">
                Selected: {departments.filter(d => formData.departmentIds.includes(d.id)).map(d => d.name).join(', ')}
              </p>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-900 bg-opacity-50 rounded-lg p-4 border border-blue-700">
            <h4 className="text-blue-200 font-medium mb-2">What happens next?</h4>
            <ul className="text-blue-300 text-sm space-y-1">
              <li>• Employee record will be created in the system</li>
              <li>• You'll get invitation instructions to send them</li>
              <li>• They'll need to sign up using the provided email</li>
              <li>• Role-based permissions will be automatically applied</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={closeModal}
              variant="secondary"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !formData.name.trim() || !formData.email.trim() || !formData.jobTitle.trim()}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <User size={16} className="mr-2" />
                  Create Employee
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEmployeeModal;