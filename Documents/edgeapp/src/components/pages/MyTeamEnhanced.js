// src/components/pages/MyTeamEnhanced.js - Enhanced with pending reviews workflow
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
  Save
} from 'lucide-react';
import { useTeam } from '../../hooks';
import { useApp } from '../../contexts';
import { LoadingSpinner, ErrorMessage, Button, StatusBadge } from '../ui';
import { formatDate } from '../../utils';
import NotificationService from '../../services/NotificationService';

export default function MyTeamEnhanced() {
  const navigate = useNavigate();
  const { openModal } = useApp();
  const { 
    team, 
    teamAssessments, 
    loading, 
    error, 
    refresh 
  } = useTeam();
  
  const [selectedTab, setSelectedTab] = useState('overview');
  const [pendingReviews, setPendingReviews] = useState([]);
  const [completedReviews, setCompletedReviews] = useState([]);
  const [developmentPlans, setDevelopmentPlans] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  // Process assessments for workflow display
  useEffect(() => {
    if (teamAssessments) {
      console.log('Team assessments received:', teamAssessments);
      
      const pending = teamAssessments.filter(assessment => 
        assessment.self_assessment_status === 'employee_complete' && 
        assessment.manager_review_status === 'pending' &&
        assessment.cycle_status === 'active'  // Only show active cycles
      );
      const completed = teamAssessments.filter(assessment => 
        assessment.manager_review_status === 'completed'
      );
      
      console.log('Pending reviews filtered:', pending);
      console.log('Completed reviews filtered:', completed);
      
      setPendingReviews(pending);
      setCompletedReviews(completed);
    }
  }, [teamAssessments]);

  // Fetch development plans for review
  useEffect(() => {
    fetchDevelopmentPlans();
  }, []);

  const fetchDevelopmentPlans = async () => {
    try {
      const plans = await NotificationService.getDevelopmentPlansForReview();
      setDevelopmentPlans(plans);
    } catch (error) {
      console.error('Error fetching development plans:', error);
    }
  };

  const handleReviewAssessment = (assessment) => {
    // Navigate to manager review page with assessment details as search params
    navigate(`/review/${assessment.employee_id}?assessmentId=${assessment.assessment_id}&employeeName=${encodeURIComponent(assessment.employee_name)}&cycleId=${assessment.cycle_id}&cycleName=${encodeURIComponent(assessment.cycle_name)}`);
  };

  const handleReviewDevelopmentPlan = async (planId, status, feedback) => {
    try {
      await NotificationService.reviewDevelopmentPlan(planId, status, feedback);
      // Refresh development plans after review
      await fetchDevelopmentPlans();
    } catch (error) {
      console.error('Error reviewing development plan:', error);
      // You could show a toast notification here
    }
  };

  const getAssessmentStatusColor = (status) => {
    const colorMap = {
      'not_started': 'gray',
      'in_progress': 'yellow',
      'submitted': 'blue',
      'completed': 'green',
      'overdue': 'red'
    };
    return colorMap[status] || 'gray';
  };

  const getManagerReviewStatusColor = (status) => {
    const colorMap = {
      'pending': 'yellow',
      'in_progress': 'blue',
      'completed': 'green'
    };
    return colorMap[status] || 'gray';
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

  const tabs = [
    { id: 'overview', name: 'Team Overview', icon: Users },
    { id: 'pending', name: `Pending Reviews (${pendingReviews.length})`, icon: Clock },
    { id: 'completed', name: 'Completed Reviews', icon: CheckCircle },
    { id: 'development', name: `Development Plans (${developmentPlans.filter(p => p.status === 'submitted').length})`, icon: Target }
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400">My Team</h1>
          <p className="text-gray-400 mt-2">Manage your direct reports and their assessments</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={refresh} variant="secondary">
            <Calendar className="mr-2" size={16} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <Users className="text-cyan-400 mr-3" size={24} />
            <div>
              <p className="text-2xl font-bold text-white">{team.length}</p>
              <p className="text-gray-400 text-sm">Team Members</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <Clock className="text-yellow-400 mr-3" size={24} />
            <div>
              <p className="text-2xl font-bold text-white">{pendingReviews.length}</p>
              <p className="text-gray-400 text-sm">Pending Reviews</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <CheckCircle className="text-green-400 mr-3" size={24} />
            <div>
              <p className="text-2xl font-bold text-white">{completedReviews.length}</p>
              <p className="text-gray-400 text-sm">Completed Reviews</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <Target className="text-purple-400 mr-3" size={24} />
            <div>
              <p className="text-2xl font-bold text-white">{developmentPlans.filter(p => p.status === 'submitted').length}</p>
              <p className="text-gray-400 text-sm">Plans for Review</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedTab(tab.id);
                // Reset employee filter when switching tabs
                if (tab.id === 'overview' || tab.id === 'development') {
                  setSelectedEmployeeId(null);
                }
              }}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === tab.id
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <tab.icon className="mr-2" size={16} />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white mb-4">Team Overview</h2>
          {team.length === 0 ? (
            <div className="text-center py-12">
              <Users size={64} className="mx-auto text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Team Members</h3>
              <p className="text-gray-400">No direct reports are currently assigned to you.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {team.map((member) => (
                <div key={member.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                        <p className="text-gray-400">{member.job_title}</p>
                        <p className="text-gray-500 text-sm">{member.email}</p>
                      </div>
                    </div>
                    <StatusBadge 
                      status={member.is_active ? 'active' : 'inactive'} 
                      color={member.is_active ? 'green' : 'gray'} 
                    />
                  </div>
                  
                  {/* Member Actions */}
                  <div className="mt-4 flex space-x-2">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => {
                        // Navigate to manager playbook for this employee
                        navigate(`/playbook?employeeId=${member.id}`);
                      }}
                    >
                      <MessageSquare size={14} className="mr-1" />
                      Notes
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => {
                        // Filter to show this employee's reviews and switch to appropriate tab
                        setSelectedEmployeeId(member.id);
                        const employeePendingReviews = pendingReviews.filter(assessment => 
                          assessment.employee_id === member.id
                        );
                        const employeeCompletedReviews = completedReviews.filter(assessment => 
                          assessment.employee_id === member.id
                        );
                        
                        // Switch to the tab that has reviews for this employee, or pending by default
                        if (employeePendingReviews.length > 0) {
                          setSelectedTab('pending');
                        } else if (employeeCompletedReviews.length > 0) {
                          setSelectedTab('completed');
                        } else {
                          setSelectedTab('pending');
                        }
                      }}
                    >
                      <FileText size={14} className="mr-1" />
                      Reviews
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedTab === 'pending' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              Pending Reviews
              {selectedEmployeeId && (
                <span className="text-gray-400 text-sm ml-2">
                  (Filtered for {team.find(m => m.id === selectedEmployeeId)?.name})
                </span>
              )}
            </h2>
            {selectedEmployeeId && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedEmployeeId(null)}
              >
                Show All
              </Button>
            )}
          </div>
          {(selectedEmployeeId ? pendingReviews.filter(r => r.employee_id === selectedEmployeeId) : pendingReviews).length === 0 ? (
            <div className="text-center py-12">
              <Clock size={64} className="mx-auto text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Pending Reviews</h3>
              <p className="text-gray-400">All team member assessments are up to date!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(selectedEmployeeId ? pendingReviews.filter(r => r.employee_id === selectedEmployeeId) : pendingReviews).map((assessment) => (
                <div key={assessment.assessment_id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 border-l-4 border-l-yellow-500">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {assessment.employee_name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{assessment.employee_name}</h3>
                          <p className="text-gray-400">{assessment.employee_job_title}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-400">Review Cycle</p>
                          <p className="text-white font-medium">{assessment.cycle_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Employee Status</p>
                          <StatusBadge 
                            status={assessment.self_assessment_status} 
                            color={getAssessmentStatusColor(assessment.self_assessment_status)}
                          />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Due Date</p>
                          <p className="text-white">{formatDate(assessment.due_date)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Button 
                        variant="primary"
                        onClick={() => handleReviewAssessment(assessment)}
                        className="bg-yellow-600 hover:bg-yellow-700 border-yellow-600"
                      >
                        <Edit className="mr-2" size={16} />
                        Start Manager Review
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedTab === 'completed' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              Completed Reviews
              {selectedEmployeeId && (
                <span className="text-gray-400 text-sm ml-2">
                  (Filtered for {team.find(m => m.id === selectedEmployeeId)?.name})
                </span>
              )}
            </h2>
            {selectedEmployeeId && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedEmployeeId(null)}
              >
                Show All
              </Button>
            )}
          </div>
          {(selectedEmployeeId ? completedReviews.filter(r => r.employee_id === selectedEmployeeId) : completedReviews).length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle size={64} className="mx-auto text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Completed Reviews</h3>
              <p className="text-gray-400">Completed reviews will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(selectedEmployeeId ? completedReviews.filter(r => r.employee_id === selectedEmployeeId) : completedReviews).map((assessment) => (
                <div key={assessment.assessment_id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 border-l-4 border-l-green-500">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {assessment.employee_name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{assessment.employee_name}</h3>
                          <p className="text-gray-400">{assessment.employee_job_title}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-400">Review Cycle</p>
                          <p className="text-white font-medium">{assessment.cycle_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Manager Review</p>
                          <StatusBadge 
                            status={assessment.manager_review_status} 
                            color={getManagerReviewStatusColor(assessment.manager_review_status)}
                          />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Completed</p>
                          <p className="text-white">{formatDate(assessment.updated_at)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Button 
                        variant="secondary"
                        onClick={() => handleReviewAssessment(assessment)}
                      >
                        <Eye className="mr-2" size={16} />
                        View Review
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedTab === 'development' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white mb-4">Development Plans for Review</h2>
          {developmentPlans.length === 0 ? (
            <div className="text-center py-12">
              <Target size={64} className="mx-auto text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Development Plans</h3>
              <p className="text-gray-400">Your team members haven't submitted any development plans yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {developmentPlans.map((plan) => (
                <DevelopmentPlanCard
                  key={plan.id}
                  plan={plan}
                  onReview={(planId, status, feedback) => handleReviewDevelopmentPlan(planId, status, feedback)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Development Plan Card Component for Manager Review
const DevelopmentPlanCard = ({ plan, onReview }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewStatus, setReviewStatus] = useState('under_review');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    try {
      setSubmitting(true);
      await onReview(plan.id, reviewStatus, feedback);
      setShowReviewForm(false);
      setFeedback('');
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'submitted': 'yellow',
      'under_review': 'blue',
      'approved': 'green',
      'needs_revision': 'red'
    };
    return colors[status] || 'gray';
  };

  const formatGoals = (goals) => {
    try {
      const goalArray = typeof goals === 'string' ? JSON.parse(goals) : goals;
      return Array.isArray(goalArray) ? goalArray : [];
    } catch {
      return [];
    }
  };

  const formatSkills = (skills) => {
    try {
      const skillArray = typeof skills === 'string' ? JSON.parse(skills) : skills;
      return Array.isArray(skillArray) ? skillArray : [];
    } catch {
      return [];
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-3">
            <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {plan.employee_name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{plan.employee_name}</h3>
              <p className="text-gray-400">{plan.employee_job_title}</p>
            </div>
          </div>
          
          <h4 className="text-xl font-semibold text-white mb-2">{plan.title}</h4>
          {plan.description && (
            <p className="text-gray-300 mb-4">{plan.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-400">Status</p>
              <StatusBadge 
                status={plan.status} 
                color={getStatusColor(plan.status)}
              />
            </div>
            <div>
              <p className="text-sm text-gray-400">Timeline</p>
              <p className="text-white">{plan.timeline}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Submitted</p>
              <p className="text-white">{formatDate(plan.created_at)}</p>
            </div>
          </div>

          {/* Goals */}
          {formatGoals(plan.goals).length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">Goals ({formatGoals(plan.goals).length})</p>
              <div className="space-y-2">
                {formatGoals(plan.goals).slice(0, 3).map((goal, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-3">
                    <p className="text-gray-300 font-medium">{goal.goal}</p>
                    {goal.timeline && (
                      <p className="text-gray-500 text-sm mt-1">Timeline: {goal.timeline}</p>
                    )}
                    {goal.priority && (
                      <span className={`inline-block px-2 py-1 text-xs rounded mt-1 ${
                        goal.priority === 'high' ? 'bg-red-600 text-white' :
                        goal.priority === 'medium' ? 'bg-yellow-600 text-white' :
                        'bg-gray-600 text-gray-300'
                      }`}>
                        {goal.priority} priority
                      </span>
                    )}
                  </div>
                ))}
                {formatGoals(plan.goals).length > 3 && (
                  <p className="text-gray-500 text-sm">... and {formatGoals(plan.goals).length - 3} more goals</p>
                )}
              </div>
            </div>
          )}

          {/* Skills */}
          {formatSkills(plan.skills_to_develop).length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">Skills to Develop ({formatSkills(plan.skills_to_develop).length})</p>
              <div className="space-y-2">
                {formatSkills(plan.skills_to_develop).slice(0, 2).map((skill, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-3">
                    <p className="text-gray-300 font-medium">{skill.skill}</p>
                    {skill.reason && (
                      <p className="text-gray-400 text-sm mt-1">{skill.reason}</p>
                    )}
                  </div>
                ))}
                {formatSkills(plan.skills_to_develop).length > 2 && (
                  <p className="text-gray-500 text-sm">... and {formatSkills(plan.skills_to_develop).length - 2} more skills</p>
                )}
              </div>
            </div>
          )}

          {/* Existing Manager Feedback */}
          {plan.manager_feedback && (
            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-400 mb-2">Previous Manager Feedback</p>
              <p className="text-gray-300">{plan.manager_feedback}</p>
              <p className="text-xs text-gray-500 mt-2">
                Reviewed on {formatDate(plan.manager_reviewed_at)}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex flex-col space-y-2 ml-6">
          {plan.status === 'submitted' && (
            <Button 
              variant="primary"
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              <MessageSquare className="mr-2" size={16} />
              Review Plan
            </Button>
          )}
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="border-t border-gray-700 pt-4 mt-4">
          <h5 className="text-lg font-semibold text-white mb-4">Review Development Plan</h5>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Review Decision
              </label>
              <select
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="under_review">Keep Under Review</option>
                <option value="approved">Approve Plan</option>
                <option value="needs_revision">Needs Revision</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Manager Feedback
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                rows={4}
                placeholder="Provide feedback on this development plan..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button 
                variant="secondary"
                onClick={() => setShowReviewForm(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="primary"
                onClick={handleSubmitReview}
                disabled={submitting}
              >
                <Save size={16} className="mr-2" />
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};