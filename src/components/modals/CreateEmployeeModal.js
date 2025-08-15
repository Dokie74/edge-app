import React, { useState, useEffect } from 'react';
import { X, User, Mail, Briefcase, Shield, Users, Copy, Check } from 'lucide-react';
import { Button, LoadingSpinner } from '../ui';
import { AdminService } from '../../services';
import DepartmentService from '../../services/DepartmentService';

const CreateEmployeeModal = ({ supabase, closeModal, modalProps }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    jobTitle: '',
    role: 'employee',
    managerId: '',
    primaryDepartmentId: '',
    secondaryDepartmentId: '',
    password: ''
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
      const departmentsData = await DepartmentService.getAllDepartments();
      setDepartments(departmentsData);
    } catch (err) {
      console.error('Error fetching departments:', err);
      // Fallback to default departments if service fails
      setDepartments([
        { id: 'general', name: 'General' },
        { id: 'accounting', name: 'Accounting' },
        { id: 'purchasing', name: 'Purchasing' },
        { id: 'engineering', name: 'Engineering' },
        { id: 'executive', name: 'Executive' },
        { id: 'quality', name: 'Quality' },
        { id: 'production', name: 'Production' },
        { id: 'machining', name: 'Machining' },
        { id: 'program-management', name: 'Program Management' },
        { id: 'sales', name: 'Sales' }
      ]);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handlePrimaryDepartmentChange = (departmentId) => {
    setFormData(prev => ({ 
      ...prev, 
      primaryDepartmentId: departmentId,
      // Clear secondary if it's the same as primary
      secondaryDepartmentId: prev.secondaryDepartmentId === departmentId ? '' : prev.secondaryDepartmentId
    }));
    if (error) setError('');
  };

  const handleSecondaryDepartmentChange = (departmentId) => {
    setFormData(prev => ({ ...prev, secondaryDepartmentId: departmentId }));
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
    if (!formData.password.trim()) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (!formData.primaryDepartmentId) {
      setError('Primary department is required');
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
        managerId: formData.managerId || null,
        password: formData.password
      });

      if (result.success && result.data?.employee_id) {
        try {
          // Assign primary department (required)
          await DepartmentService.assignPrimaryDepartment(
            result.data.employee_id, 
            formData.primaryDepartmentId
          );
          
          // Assign secondary department if selected
          if (formData.secondaryDepartmentId) {
            await DepartmentService.addSecondaryDepartment(
              result.data.employee_id,
              formData.secondaryDepartmentId
            );
          }
        } catch (deptError) {
          console.warn('Error assigning departments:', deptError);
          // Don't fail the entire process for department assignment errors
        }
        
        const selectedDepartments = [];
        if (formData.primaryDepartmentId) {
          selectedDepartments.push(departments.find(d => d.id === parseInt(formData.primaryDepartmentId))?.name);
        }
        if (formData.secondaryDepartmentId) {
          selectedDepartments.push(departments.find(d => d.id === parseInt(formData.secondaryDepartmentId))?.name);
        }
        
        setSuccess({
          ...result,
          selectedDepartments: selectedDepartments.filter(Boolean)
        });
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
        <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
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

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                {success.selectedDepartments && success.selectedDepartments.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-gray-400">Departments:</span>
                    <span className="text-white ml-2">
                      {success.selectedDepartments.join(', ')}
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
          </div>

          {/* Actions - Fixed at bottom */}
          <div className="flex justify-end p-6 border-t border-gray-700 flex-shrink-0">
            <Button onClick={handleFinish} variant="primary">
              Done
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Form view
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
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

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
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

          {/* Password */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Initial Password *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Minimum 6 characters"
              disabled={loading}
            />
            <p className="text-xs text-gray-400">
              Employee can change this password after first login
            </p>
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

          {/* Primary Department */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Primary Department *
            </label>
            <div className="grid grid-cols-1 gap-2 p-3 bg-gray-700 border border-gray-600 rounded-md max-h-48 overflow-y-auto">
              {departments.map((department) => (
                <label
                  key={department.id}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-600 p-2 rounded transition-colors"
                >
                  <input
                    type="radio"
                    name="primaryDepartment"
                    value={department.id}
                    checked={formData.primaryDepartmentId === department.id.toString()}
                    onChange={() => handlePrimaryDepartmentChange(department.id.toString())}
                    className="w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600 focus:ring-cyan-500 focus:ring-2"
                    disabled={loading}
                  />
                  <span className="text-white text-sm flex-1">{department.name}</span>
                </label>
              ))}
            </div>
            {formData.primaryDepartmentId && (
              <p className="text-xs text-green-400">
                Primary: {departments.find(d => d.id.toString() === formData.primaryDepartmentId)?.name}
              </p>
            )}
          </div>

          {/* Secondary Department */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Secondary Department (Optional)
            </label>
            <select
              value={formData.secondaryDepartmentId}
              onChange={(e) => handleSecondaryDepartmentChange(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="">No Secondary Department</option>
              {departments
                .filter(dept => dept.id.toString() !== formData.primaryDepartmentId)
                .map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
            {formData.secondaryDepartmentId && (
              <p className="text-xs text-blue-400">
                Secondary: {departments.find(d => d.id.toString() === formData.secondaryDepartmentId)?.name}
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

          </form>
        </div>

        {/* Actions - Fixed at bottom */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-700 flex-shrink-0">
          <Button
            type="button"
            onClick={closeModal}
            variant="secondary"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="primary"
            disabled={loading || !formData.name.trim() || !formData.email.trim() || !formData.jobTitle.trim() || !formData.password.trim() || !formData.primaryDepartmentId}
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
      </div>
    </div>
  );
};

export default CreateEmployeeModal;