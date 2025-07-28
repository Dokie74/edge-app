// src/components/pages/Admin.js - SIMPLIFIED VERSION FOR TESTING
import React, { useState, useEffect } from 'react';
import { Users, Calendar, Plus, Play, AlertTriangle, Edit, UserPlus, Square } from 'lucide-react';
import { useAdmin } from '../../hooks';
import { useApp } from '../../contexts';
import { AdminService } from '../../services';
import { getStatusBadgeColor, formatDate, validateRequired, validateDateRange } from '../../utils';

export default function Admin() {
  const { 
    employees, 
    cycles, 
    loading, 
    error, 
    createReviewCycle, 
    activateReviewCycle, 
    refresh 
  } = useAdmin();
  
  const { openModal } = useApp();
  const [allEmployees, setAllEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState(null);

  useEffect(() => {
    fetchEmployees();
    checkRole();
  }, []);

  const fetchEmployees = async () => {
    try {
      setEmployeesLoading(true);
      const employeesData = await AdminService.getAllEmployees();
      setAllEmployees(employeesData);
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setEmployeesLoading(false);
    }
  };

  const checkRole = async () => {
    try {
      const role = await AdminService.checkCurrentRole();
      setCurrentRole(role);
    } catch (err) {
      console.error('Error checking role:', err);
    }
  };


  const handleActivateCycle = async (cycleId) => {
    try {
      const data = await activateReviewCycle(cycleId);
      
      if (data && data.success) {
        alert('✅ ' + data.message);
      } else {
        alert('⚠️ ' + (data?.error || 'Unknown error'));
      }
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  const handleCloseCycle = async (cycleId) => {
    // Confirm before closing
    if (!window.confirm('Are you sure you want to close this review cycle? This action cannot be undone.')) {
      return;
    }

    try {
      const data = await AdminService.closeReviewCycle(cycleId);
      
      if (data && data.success) {
        alert('✅ ' + data.message);
        refresh(); // Refresh the data to show updated status
      } else {
        alert('⚠️ ' + (data?.error || 'Unknown error'));
      }
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-cyan-400 mb-8">Admin Panel</h1>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <div className="text-gray-400">Loading admin data...</div>
        </div>
      </div>
    );
  }


  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400">Admin Panel</h1>
          <p className="text-gray-400 mt-2">Manage employees and review cycles</p>
          <p className="text-xs text-yellow-400 mt-1">Simplified version for testing</p>
        </div>
        <button
          onClick={() => openModal('createReviewCycle', { onComplete: refresh })}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus size={16} className="mr-2" />
          Create Review Cycle
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg">
          <div className="flex items-center text-red-200">
            <AlertTriangle size={16} className="mr-2" />
            <span>Error: {error}</span>
          </div>
          <button 
            onClick={refresh}
            className="mt-2 px-3 py-1 bg-red-800 hover:bg-red-700 rounded text-red-100 text-sm"
          >
            Retry
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Employees Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Users className="mr-2 text-cyan-400" size={24} />
              <h2 className="text-xl font-semibold">Employees ({employees.length})</h2>
            </div>
            <button 
              onClick={refresh}
              className="text-cyan-400 hover:text-cyan-300 text-sm"
            >
              Refresh
            </button>
          </div>
          
          {employees.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {employees.map((employee) => (
                <div key={employee.id} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                  <div>
                    <p className="font-medium text-white">{employee.name}</p>
                    <p className="text-sm text-gray-400">{employee.email}</p>
                    <p className="text-xs text-gray-500">
                      {employee.job_title || 'No Title'} • 
                      {employee.manager_id ? ' Has Manager' : ' No Manager'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2 py-1 rounded bg-green-600 text-white">
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              {error ? (
                <div className="text-red-400">
                  <AlertTriangle size={48} className="mx-auto mb-4" />
                  <p>Failed to load employees</p>
                </div>
              ) : (
                <div className="text-gray-500">
                  <Users size={48} className="mx-auto mb-4" />
                  <p>No employees found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Review Cycles Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Calendar className="mr-2 text-cyan-400" size={24} />
              <h2 className="text-xl font-semibold">Review Cycles ({cycles.length})</h2>
            </div>
          </div>
          
          {cycles.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {cycles.map((cycle) => (
                <div key={cycle.id} className="p-3 bg-gray-700 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-white">{cycle.name}</p>
                      <p className="text-sm text-gray-400">
                        {formatDate(cycle.start_date)} - {formatDate(cycle.end_date)}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusBadgeColor(cycle.status)}`}>
                      {cycle.status}
                    </span>
                  </div>
                  
                  <div className="flex gap-2 mt-2">
                    {cycle.status === 'upcoming' && (
                      <button
                        onClick={() => handleActivateCycle(cycle.id)}
                        className="text-green-400 hover:text-green-300 flex items-center text-sm"
                      >
                        <Play size={14} className="mr-1" />
                        Activate
                      </button>
                    )}
                    {cycle.status === 'active' && (
                      <button
                        onClick={() => handleCloseCycle(cycle.id)}
                        className="text-red-400 hover:text-red-300 flex items-center text-sm"
                      >
                        <Square size={14} className="mr-1" />
                        Close
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar size={48} className="mx-auto mb-4 text-gray-500" />
              <p className="text-gray-400 mb-4">No review cycles found</p>
              <p className="text-sm text-gray-500">Create your first review cycle to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-cyan-400">{employees.length}</p>
          <p className="text-gray-400">Total Employees</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-400">{employees.length}</p>
          <p className="text-gray-400">Active Employees</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-yellow-400">
            {cycles.filter(c => c.status === 'active').length}
          </p>
          <p className="text-gray-400">Active Cycles</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-purple-400">0</p>
          <p className="text-gray-400">Manager Relations</p>
        </div>
      </div>

      {/* Employee Management Section */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-cyan-400 flex items-center">
              <Users className="mr-3" size={24} />
              Employee Management
            </h2>
            <p className="text-gray-400 mt-1">Manage team members and their roles</p>
            {currentRole && (
              <p className="text-xs text-yellow-400 mt-1">Your role: {currentRole}</p>
            )}
          </div>
          <button
            onClick={() => openModal('createEmployee', { onComplete: () => { fetchEmployees(); refresh(); } })}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <UserPlus size={16} className="mr-2" />
            Add Employee
          </button>
        </div>

        {/* Employee Table */}
        {employeesLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading employees...</p>
          </div>
        ) : allEmployees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Name</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Email</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Role</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Job Title</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Manager</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Reports</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allEmployees.map((employee) => (
                  <tr key={employee.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-3 px-2">
                      <div className="text-white font-medium">{employee.name}</div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="text-gray-300 text-sm">{employee.email}</div>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        employee.role === 'admin' 
                          ? 'bg-red-900 text-red-200' 
                          : employee.role === 'manager'
                          ? 'bg-blue-900 text-blue-200'
                          : 'bg-gray-600 text-gray-200'
                      }`}>
                        {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="text-gray-300 text-sm">{employee.job_title}</div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="text-gray-300 text-sm">
                        {employee.manager_name || '—'}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="text-gray-300 text-sm">
                        {employee.direct_reports_count}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        employee.is_active 
                          ? 'bg-green-900 text-green-200' 
                          : 'bg-red-900 text-red-200'
                      }`}>
                        {employee.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <button
                        onClick={() => openModal('editEmployee', { 
                          employee: employee,
                          onComplete: () => { fetchEmployees(); refresh(); }
                        })}
                        className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center"
                      >
                        <Edit size={14} className="mr-1" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Users size={48} className="mx-auto mb-4 text-gray-500" />
            <p className="text-gray-400 mb-4">No employees found</p>
            <p className="text-sm text-gray-500">Add your first employee to get started</p>
          </div>
        )}
      </div>

    </div>
  );
}

