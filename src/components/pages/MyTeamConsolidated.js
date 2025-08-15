// src/components/pages/MyTeamConsolidated.js - Comprehensive single-page team view
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  Edit, 
  MessageSquare,
  FileText,
  Target,
  Award,
  Save,
  RefreshCw,
  Play,
  Star,
  TrendingUp,
  AlertCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Hash
} from 'lucide-react';
import { useTeam } from '../../hooks';
import { useApp } from '../../contexts';
import { LoadingSpinner, ErrorMessage, Button, StatusBadge } from '../ui';
import { formatDate } from '../../utils';
import NotificationService from '../../services/NotificationService';

export default function MyTeamConsolidated() {
  const navigate = useNavigate();
  const { openModal, setActivePage } = useApp();
  const { 
    team, 
    teamAssessments, 
    loading, 
    error, 
    refresh 
  } = useTeam();
  
  const [developmentPlans, setDevelopmentPlans] = useState([]);
  const [employeePerformance, setEmployeePerformance] = useState({});
  const [expandedEmployees, setExpandedEmployees] = useState(new Set());

  // Process all team data for comprehensive view
  useEffect(() => {
    if (teamAssessments) {
      // Group assessments by employee
      const performanceData = {};
      teamAssessments.forEach(assessment => {
        if (!performanceData[assessment.employee_id]) {
          performanceData[assessment.employee_id] = {
            assessments: [],
            pending_reviews: 0,
            completed_reviews: 0,
            latest_assessment: null,
            performance_trend: 'stable'
          };
        }
        
        performanceData[assessment.employee_id].assessments.push(assessment);
        
        if (assessment.self_assessment_status === 'employee_complete' && 
            assessment.manager_review_status === 'pending') {
          performanceData[assessment.employee_id].pending_reviews++;
        }
        
        if (assessment.manager_review_status === 'completed') {
          performanceData[assessment.employee_id].completed_reviews++;
        }
        
        // Track latest assessment
        if (!performanceData[assessment.employee_id].latest_assessment ||
            new Date(assessment.created_at) > new Date(performanceData[assessment.employee_id].latest_assessment.created_at)) {
          performanceData[assessment.employee_id].latest_assessment = assessment;
        }
      });
      
      setEmployeePerformance(performanceData);
    }
  }, [teamAssessments]);

  const toggleEmployeeExpansion = (employeeId) => {
    const newExpanded = new Set(expandedEmployees);
    if (newExpanded.has(employeeId)) {
      newExpanded.delete(employeeId);
    } else {
      newExpanded.add(employeeId);
    }
    setExpandedEmployees(newExpanded);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-600 text-green-100 border-green-500';
      case 'employee_complete': return 'bg-yellow-600 text-yellow-100 border-yellow-500';
      case 'in_progress': return 'bg-blue-600 text-blue-100 border-blue-500';
      case 'pending': return 'bg-orange-600 text-orange-100 border-orange-500';
      case 'not_started': return 'bg-gray-600 text-gray-100 border-gray-500';
      default: return 'bg-gray-600 text-gray-100 border-gray-500';
    }
  };

  const getPriorityIcon = (pendingCount) => {
    if (pendingCount > 2) return <AlertCircle className="text-red-400" size={16} />;
    if (pendingCount > 0) return <Clock className="text-yellow-400" size={16} />;
    return <CheckCircle className="text-green-400" size={16} />;
  };

  const calculateCompletionRate = (employeeId) => {
    const performance = employeePerformance[employeeId];
    if (!performance || performance.assessments.length === 0) return 0;
    
    const completedCount = performance.assessments.filter(
      a => a.manager_review_status === 'completed'
    ).length;
    
    return Math.round((completedCount / performance.assessments.length) * 100);
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-cyan-400 mb-8">My Team</h1>
        <LoadingSpinner size="lg" message="Loading your team..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-cyan-400 mb-8">My Team</h1>
        <ErrorMessage 
          error={error} 
          title="Error Loading Team" 
          onRetry={refresh}
        />
      </div>
    );
  }

  // Get unique team members from assessments
  const teamMembers = teamAssessments.reduce((acc, assessment) => {
    if (!acc.find(member => member.employee_id === assessment.employee_id)) {
      acc.push({
        employee_id: assessment.employee_id,
        employee_name: assessment.employee_name,
        job_title: assessment.job_title,
        department: assessment.department,
        email: assessment.email || `${assessment.employee_name.toLowerCase().replace(' ', '.')}@company.com`,
        hire_date: assessment.hire_date,
        manager_id: assessment.manager_id
      });
    }
    return acc;
  }, []);

  const totalPending = Object.values(employeePerformance).reduce(
    (sum, perf) => sum + perf.pending_reviews, 0
  );
  
  const totalCompleted = Object.values(employeePerformance).reduce(
    (sum, perf) => sum + perf.completed_reviews, 0
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400">My Team</h1>
          <p className="text-gray-400 mt-2">Comprehensive team management and review oversight</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refresh}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </button>
          <button
            onClick={() => openModal('startReviewCycle', { afterSave: refresh })}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Play size={16} className="mr-2" />
            Start Review Cycle
          </button>
        </div>
      </div>

      {/* Team Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Team Members</p>
              <p className="text-2xl font-bold text-cyan-400">{teamMembers.length}</p>
            </div>
            <Users className="text-cyan-400" size={24} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending Reviews</p>
              <p className="text-2xl font-bold text-yellow-400">{totalPending}</p>
            </div>
            <Clock className="text-yellow-400" size={24} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Completed Reviews</p>
              <p className="text-2xl font-bold text-green-400">{totalCompleted}</p>
            </div>
            <CheckCircle className="text-green-400" size={24} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Completion</p>
              <p className="text-2xl font-bold text-purple-400">
                {teamMembers.length > 0 
                  ? Math.round(teamMembers.reduce((sum, member) => 
                      sum + calculateCompletionRate(member.employee_id), 0) / teamMembers.length)
                  : 0}%
              </p>
            </div>
            <TrendingUp className="text-purple-400" size={24} />
          </div>
        </div>
      </div>

      {/* Employee Widgets */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Users className="mr-2" size={20} />
          Team Members ({teamMembers.length})
        </h2>
        
        {teamMembers.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {teamMembers.map((member) => {
              const performance = employeePerformance[member.employee_id] || {};
              const isExpanded = expandedEmployees.has(member.employee_id);
              const completionRate = calculateCompletionRate(member.employee_id);
              const latestAssessment = performance.latest_assessment;
              
              return (
                <div key={member.employee_id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                  {/* Employee Header */}
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                          <User className="text-white" size={20} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{member.employee_name}</h3>
                          <p className="text-gray-400">{member.job_title || 'No Title'}</p>
                          <p className="text-gray-500 text-sm">{member.department || 'No Department'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {/* Priority Indicator */}
                        <div className="flex items-center space-x-2">
                          {getPriorityIcon(performance.pending_reviews || 0)}
                          <span className="text-sm text-gray-400">
                            {performance.pending_reviews > 0 
                              ? `${performance.pending_reviews} pending` 
                              : 'Up to date'}
                          </span>
                        </div>

                        {/* Completion Rate */}
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Completion Rate</p>
                          <p className={`text-lg font-bold ${
                            completionRate >= 80 ? 'text-green-400' :
                            completionRate >= 60 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {completionRate}%
                          </p>
                        </div>

                        {/* Expand Button */}
                        <button
                          onClick={() => toggleEmployeeExpansion(member.employee_id)}
                          className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                          <Eye size={20} />
                        </button>
                      </div>
                    </div>

                    {/* Status Row */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Current Status */}
                        {latestAssessment ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-400">Status:</span>
                            <span className={`px-2 py-1 text-xs rounded-full border ${
                              getStatusColor(latestAssessment.manager_review_status)
                            }`}>
                              {latestAssessment.manager_review_status === 'employee_complete' 
                                ? 'Ready for Review' 
                                : latestAssessment.manager_review_status?.replace('_', ' ') || 'Not Started'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">No active assessments</span>
                        )}

                        {/* Last Activity */}
                        {latestAssessment && (
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <Calendar size={14} />
                            <span>Last activity: {formatDate(latestAssessment.updated_at)}</span>
                          </div>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center space-x-2">
                        {latestAssessment?.assessment_id && (
                          <button
                            onClick={() => setActivePage({ 
                              name: 'Assessment', 
                              props: { assessmentId: latestAssessment.assessment_id } 
                            })}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded text-sm flex items-center"
                          >
                            <Eye size={14} className="mr-1" />
                            Review
                          </button>
                        )}
                        
                        <button
                          onClick={() => openModal('giveFeedback', { 
                            employeeId: member.employee_id,
                            employeeName: member.employee_name 
                          })}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center"
                        >
                          <MessageSquare size={14} className="mr-1" />
                          Feedback
                        </button>
                        
                        <button
                          onClick={() => openModal('giveKudo', { 
                            employeeId: member.employee_id,
                            employeeName: member.employee_name 
                          })}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center"
                        >
                          <Star size={14} className="mr-1" />
                          Kudos
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-700 bg-gray-750">
                      <div className="p-6 space-y-6">
                        {/* Contact Info */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-3">Contact Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <Mail className="text-gray-400" size={14} />
                              <span className="text-gray-300">{member.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Hash className="text-gray-400" size={14} />
                              <span className="text-gray-300">ID: {member.employee_id.slice(0, 8)}...</span>
                            </div>
                          </div>
                        </div>

                        {/* Assessment History */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-3">Assessment History</h4>
                          {performance.assessments && performance.assessments.length > 0 ? (
                            <div className="space-y-3">
                              {performance.assessments.slice(0, 3).map((assessment) => (
                                <div key={assessment.assessment_id} className="bg-gray-700 rounded-lg p-3">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-white font-medium">{assessment.cycle_name}</p>
                                      <p className="text-gray-400 text-sm">
                                        Created: {formatDate(assessment.created_at)}
                                      </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className={`px-2 py-1 text-xs rounded-full border ${
                                        getStatusColor(assessment.manager_review_status)
                                      }`}>
                                        {assessment.manager_review_status?.replace('_', ' ') || 'Not Started'}
                                      </span>
                                      <button
                                        onClick={() => setActivePage({ 
                                          name: 'Assessment', 
                                          props: { assessmentId: assessment.assessment_id } 
                                        })}
                                        className="text-cyan-400 hover:text-cyan-300 text-sm"
                                      >
                                        View
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {performance.assessments.length > 3 && (
                                <p className="text-gray-400 text-sm text-center">
                                  +{performance.assessments.length - 3} more assessments
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">No assessments found</p>
                          )}
                        </div>

                        {/* Performance Metrics */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-3">Performance Metrics</h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="bg-gray-700 rounded-lg p-3 text-center">
                              <p className="text-2xl font-bold text-green-400">
                                {performance.completed_reviews || 0}
                              </p>
                              <p className="text-gray-400 text-xs">Completed</p>
                            </div>
                            <div className="bg-gray-700 rounded-lg p-3 text-center">
                              <p className="text-2xl font-bold text-yellow-400">
                                {performance.pending_reviews || 0}
                              </p>
                              <p className="text-gray-400 text-xs">Pending</p>
                            </div>
                            <div className="bg-gray-700 rounded-lg p-3 text-center">
                              <p className="text-2xl font-bold text-cyan-400">
                                {performance.assessments?.length || 0}
                              </p>
                              <p className="text-gray-400 text-xs">Total</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <Users size={48} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-white text-lg mb-2">No Team Members Found</h3>
            <div className="text-gray-400 space-y-1">
              <p>This could mean:</p>
              <ul className="text-sm text-gray-500 mt-2">
                <li>• You don't have any direct reports assigned</li>
                <li>• You're not set up as a manager in the system</li>
                <li>• No active review cycles have been started</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}