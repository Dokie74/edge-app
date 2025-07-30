// src/components/pages/Admin.js - SIMPLIFIED VERSION FOR TESTING
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Plus, Play, AlertTriangle, Edit, UserPlus, Square } from 'lucide-react';
import PulseQuestionsManager from '../admin/PulseQuestionsManager';
import { useAdmin } from '../../hooks';
import { useApp } from '../../contexts';
import { AdminService, supabase, DepartmentService } from '../../services';
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
      
      // Enrich employee data with primary department information
      const enrichedEmployees = await Promise.all(
        employeesData.map(async (employee) => {
          try {
            // Get primary department for each employee
            const { data: primaryDeptData, error: deptError } = await supabase
              .rpc('get_employee_primary_department', { emp_id: employee.id });
            
            if (!deptError && primaryDeptData && primaryDeptData.length > 0) {
              return {
                ...employee,
                primary_department: primaryDeptData[0].dept_name
              };
            }
            
            // Fallback: if no primary department found, use the backward compatibility column
            return {
              ...employee,
              primary_department: employee.department || 'General'
            };
          } catch (deptErr) {
            console.warn(`Error fetching department for employee ${employee.name}:`, deptErr);
            return {
              ...employee,
              primary_department: employee.department || 'General'
            };
          }
        })
      );
      
      setAllEmployees(enrichedEmployees);
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
      
      {/* Review Cycles Section */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
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

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-cyan-400">{allEmployees.length}</p>
          <p className="text-gray-400">Total Employees</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-400">{allEmployees.filter(e => e.is_active).length}</p>
          <p className="text-gray-400">Active Employees</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-yellow-400">
            {cycles.filter(c => c.status === 'active').length}
          </p>
          <p className="text-gray-400">Active Cycles</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-purple-400">{allEmployees.filter(e => e.manager_id).length}</p>
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
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Primary Department</th>
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
                        {employee.primary_department || employee.department || '—'}
                      </div>
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

      {/* Review Oversight Section */}
      <ReviewOversightSection />

    </div>
  );
}

// Review Oversight Component for Admin Dashboard
const ReviewOversightSection = () => {
  const navigate = useNavigate();
  const [reviewStats, setReviewStats] = useState({
    total: 0,
    pending_employee: 0,
    pending_manager: 0,
    completed: 0,
    overdue: 0
  });
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviewOversight();
  }, []);

  const fetchReviewOversight = async () => {
    try {
      setLoading(true);
      
      // Get real assessment data for review stats
      const { data: assessments, error: assessError } = await supabase
        .from('assessments')
        .select(`
          *,
          employee:employees(name, job_title),
          cycle:review_cycles(name)
        `)
        .order('created_at', { ascending: false });
      
      if (assessError) {
        console.error('Error fetching assessments:', assessError);
        setReviewStats({
          total: 0,
          pending_employee: 0,
          pending_manager: 0,
          completed: 0,
          overdue: 0
        });
        setRecentReviews([]);
        return;
      }
      
      // Calculate real stats from assessment data
      const total = assessments?.length || 0;
      const pending_employee = assessments?.filter(a => 
        a.self_assessment_status === 'not_started' || a.self_assessment_status === 'in_progress'
      ).length || 0;
      const pending_manager = assessments?.filter(a => 
        a.self_assessment_status === 'employee_complete' && a.manager_review_status === 'pending'
      ).length || 0;
      const completed = assessments?.filter(a => 
        a.manager_review_status === 'completed'
      ).length || 0;
      const overdue = assessments?.filter(a => {
        const dueDate = new Date(a.due_date);
        const now = new Date();
        return dueDate < now && (a.self_assessment_status !== 'employee_complete' || a.manager_review_status !== 'completed');
      }).length || 0;
      
      setReviewStats({
        total,
        pending_employee,
        pending_manager,
        completed,
        overdue
      });
      
      // Get recent assessment activity (last 10 assessments with recent updates)
      const recentActivity = assessments?.filter(a => 
        a.updated_at && new Date(a.updated_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      ).slice(0, 10).map(a => ({
        assessment_id: a.id,
        employee_name: a.employee?.name || 'Unknown',
        cycle_name: a.cycle?.name || 'Unknown Cycle',
        self_assessment_status: a.self_assessment_status,
        manager_review_status: a.manager_review_status,
        updated_at: a.updated_at
      })) || [];
      
      setRecentReviews(recentActivity);
      
    } catch (err) {
      console.error('Error fetching review oversight:', err);
      setReviewStats({
        total: 0,
        pending_employee: 0,
        pending_manager: 0,
        completed: 0,
        overdue: 0
      });
      setRecentReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAssessment = (assessmentId) => {
    navigate(`/assessment/${assessmentId}`);
  };

  if (loading) {
    return (
      <div className="mt-8 bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Review Process Oversight</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Square className="mr-2 text-cyan-400" size={24} />
          <h2 className="text-xl font-semibold text-white">Review Process Oversight</h2>
        </div>
        <button 
          onClick={fetchReviewOversight}
          className="text-cyan-400 hover:text-cyan-300 text-sm"
        >
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{reviewStats.total}</div>
          <div className="text-sm text-gray-400">Total Reviews</div>
        </div>
        <div className="bg-yellow-900 bg-opacity-50 rounded-lg p-4 text-center border border-yellow-700">
          <div className="text-2xl font-bold text-yellow-400">{reviewStats.pending_employee}</div>
          <div className="text-sm text-yellow-300">Employee Pending</div>
        </div>
        <div className="bg-orange-900 bg-opacity-50 rounded-lg p-4 text-center border border-orange-700">
          <div className="text-2xl font-bold text-orange-400">{reviewStats.pending_manager}</div>
          <div className="text-sm text-orange-300">Manager Pending</div>
        </div>
        <div className="bg-green-900 bg-opacity-50 rounded-lg p-4 text-center border border-green-700">
          <div className="text-2xl font-bold text-green-400">{reviewStats.completed}</div>
          <div className="text-sm text-green-300">Completed</div>
        </div>
        <div className="bg-red-900 bg-opacity-50 rounded-lg p-4 text-center border border-red-700">
          <div className="text-2xl font-bold text-red-400">{reviewStats.overdue}</div>
          <div className="text-sm text-red-300">Overdue</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Recent Review Activity</h3>
        {recentReviews.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentReviews.map((review, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-xs">
                        {review.employee_name?.split(' ').map(n => n[0]).join('') || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <div className="text-white font-medium">{review.employee_name}</div>
                      <div className="text-sm text-gray-400">{review.cycle_name}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-center">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      review.self_assessment_status === 'employee_complete' ? 'bg-green-600 text-green-100' :
                      review.self_assessment_status === 'in_progress' ? 'bg-yellow-600 text-yellow-100' :
                      'bg-gray-600 text-gray-100'
                    }`}>
                      {review.self_assessment_status?.replace('_', ' ') || 'Not Started'}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Employee</div>
                  </div>
                  <div className="text-center">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      review.manager_review_status === 'completed' ? 'bg-green-600 text-green-100' :
                      review.manager_review_status === 'pending' ? 'bg-orange-600 text-orange-100' :
                      'bg-gray-600 text-gray-100'
                    }`}>
                      {review.manager_review_status || 'Not Started'}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Manager</div>
                  </div>
                  <button
                    onClick={() => handleViewAssessment(review.assessment_id)}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded text-sm"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Square size={48} className="mx-auto mb-4 text-gray-500" />
            <p className="text-gray-400">No recent review activity</p>
          </div>
        )}
      </div>

      {/* Pulse Questions Management Section */}
      <PulseQuestionsManager />
    </div>
  );
};

