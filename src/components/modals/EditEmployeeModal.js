import React, { useState, useEffect } from 'react';
import { X, User, Mail, Briefcase, Shield, Users, Save, Trash2 } from 'lucide-react';
import { Button, LoadingSpinner } from '../ui';
import { AdminService, DepartmentService } from '../../services';
import { validateEmployeeForm } from '../../utils/validation';

const EditEmployeeModal = ({ supabase, closeModal, modalProps }) => {
  const { employee, onComplete } = modalProps;
  
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    email: employee?.email || '',
    jobTitle: employee?.job_title || '',
    role: employee?.role || 'employee',
    managerId: employee?.manager_id || '',
    isActive: employee?.is_active !== false,
    primaryDepartmentId: '',
    secondaryDepartmentId: ''
  });
  
  const [managers, setManagers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchManagers();
    fetchDepartments();
    fetchEmployeeDetails();
  }, []);

  useEffect(() => {
    // Check if form data has changed from original
    const original = {
      name: employee?.name || '',
      email: employee?.email || '',
      jobTitle: employee?.job_title || '',
      role: employee?.role || 'employee',
      managerId: employee?.manager_id || '',
      isActive: employee?.is_active !== false,
      primaryDepartmentId: '', // Will be set by fetchEmployeeDetails
      secondaryDepartmentId: '' // Will be set by fetchEmployeeDetails
    };
    
    const changed = Object.keys(formData).some(key => {
      if (key === 'primaryDepartmentId' || key === 'secondaryDepartmentId') {
        // For department fields, any change from initial loading counts
        return true; // We'll let the save logic handle department changes
      }
      return formData[key] !== original[key];
    });
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

  const fetchDepartments = async () => {
    try {
      const departmentsData = await DepartmentService.getAllDepartments();
      console.log('📋 EditEmployeeModal: Departments loaded:', departmentsData);
      setDepartments(departmentsData || []);
    } catch (err) {
      console.error('❌ Error fetching departments:', err);
      // Fallback to direct Supabase query if service fails
      try {
        const { data, error } = await supabase
          .from('departments')
          .select('*')
          .order('name');
        
        if (error) throw error;
        console.log('📋 EditEmployeeModal: Fallback departments loaded:', data);
        setDepartments(data || []);
      } catch (fallbackErr) {
        console.error('❌ Fallback department fetch failed:', fallbackErr);
        setDepartments([]);
      }
    }
  };

  const fetchEmployeeDetails = async () => {
    try {
      const employeeDepartments = await DepartmentService.getEmployeeDepartments(employee.id);
      console.log('👤 EditEmployeeModal: Employee departments loaded:', employeeDepartments);
      
      const primaryDept = employeeDepartments.find(ed => ed.is_primary);
      const secondaryDept = employeeDepartments.find(ed => !ed.is_primary);
      
      console.log('🎯 Primary dept:', primaryDept);
      console.log('📌 Secondary dept:', secondaryDept);
      
      setFormData(prev => ({
        ...prev,
        primaryDepartmentId: primaryDept ? primaryDept.department_id.toString() : '',
        secondaryDepartmentId: secondaryDept ? secondaryDept.department_id.toString() : ''
      }));
    } catch (err) {
      console.error('❌ Error fetching employee details:', err);
      // Try fallback approach
      try {
        const { data, error } = await supabase
          .from('employee_departments')
          .select(`
            *,
            department:departments(*)
          `)
          .eq('employee_id', employee.id);
        
        if (error) throw error;
        console.log('👤 Fallback employee departments:', data);
        
        const primaryDept = data.find(ed => ed.is_primary);
        const secondaryDept = data.find(ed => !ed.is_primary);
        
        setFormData(prev => ({
          ...prev,
          primaryDepartmentId: primaryDept ? primaryDept.department_id.toString() : '',
          secondaryDepartmentId: secondaryDept ? secondaryDept.department_id.toString() : ''
        }));
      } catch (fallbackErr) {
        console.error('❌ Fallback employee details fetch failed:', fallbackErr);
      }
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
    // Only validate changed fields
    const validation = validateEmployeeForm(formData);
    if (!validation.isValid) {
      setError(Object.values(validation.errors).join(', '));
      return false;
    }
    
    // Additional validation for primary department
    if (!formData.primaryDepartmentId) {
      setError('Primary department is required');
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
        // Update departments using the new service
        try {
          // Assign primary department (required)
          if (formData.primaryDepartmentId) {
            await DepartmentService.assignPrimaryDepartment(
              employee.id, 
              formData.primaryDepartmentId
            );
          }
          
          // Handle secondary department
          const currentDepts = await DepartmentService.getEmployeeDepartments(employee.id);
          const currentSecondary = currentDepts.find(ed => !ed.is_primary);
          
          // Remove old secondary if exists and different from new
          if (currentSecondary && currentSecondary.department_id.toString() !== formData.secondaryDepartmentId) {
            await DepartmentService.removeDepartmentAssignment(employee.id, currentSecondary.department_id);
          }
          
          // Add new secondary if selected
          if (formData.secondaryDepartmentId && 
              (!currentSecondary || currentSecondary.department_id.toString() !== formData.secondaryDepartmentId)) {
            await DepartmentService.addSecondaryDepartment(
              employee.id,
              formData.secondaryDepartmentId
            );
          }
        } catch (deptErr) {
          console.error('Error updating employee departments:', deptErr);
          // Still proceed with success, but note the department update may have failed
        }

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
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
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

        {/* Scrollable Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
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

          {/* Primary Department */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Primary Department *
            </label>
            <select
              value={formData.primaryDepartmentId}
              onChange={(e) => handlePrimaryDepartmentChange(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="">Select Primary Department</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
            {formData.primaryDepartmentId && (
              <p className="text-xs text-green-400">
                Primary: {departments.find(d => d.id.toString() === formData.primaryDepartmentId)?.name}
              </p>
            )}
            {departments.length === 0 && (
              <p className="text-xs text-red-400">
                ⚠️ No departments available. Check console for errors.
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