// src/components/pages/MyTeamEnhancedRouter.tsx - Router-enabled team management
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

export default function MyTeamEnhancedRouter() {
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
      
      const pending = teamAssessments.filter((assessment: any) => 
        assessment.self_assessment_status === 'employee_complete' && 
        assessment.manager_review_status === 'pending' &&
        assessment.cycle_status === 'active'  // Only show active cycles
      );
      const completed = teamAssessments.filter((assessment: any) => 
        assessment.manager_review_status === 'completed'
      );

      setPendingReviews(pending);
      setCompletedReviews(completed);
    }
  }, [teamAssessments]);

  // Fetch development plans
  const fetchDevelopmentPlans = async () => {
    try {
      // This should be implemented in your service layer
      // For now, using a placeholder
      setDevelopmentPlans([]);
    } catch (error) {
      console.error('Error fetching development plans:', error);
    }
  };

  const handleReviewAssessment = (assessment: any) => {
    // Navigate to manager review page with assessment details
    const searchParams = new URLSearchParams({
      assessmentId: assessment.assessment_id,
      employeeName: assessment.employee_name,
      cycleId: assessment.cycle_id,
      cycleName: assessment.cycle_name
    });
    
    navigate(`/review/${assessment.employee_id}?${searchParams.toString()}`);
  };

  const handleViewManagerPlaybook = (employeeId: string) => {
    // Navigate to manager playbook with selected employee
    navigate(`/playbook?selectedEmployeeId=${employeeId}`);
  };

  const handleEditEmployee = (employee: any) => {
    openModal('editEmployee', { 
      employee,
      onComplete: refresh 
    });
  };

  const handleReviewDevelopmentPlan = async (planId: string, status: string, feedback: string) => {
    try {
      await NotificationService.reviewDevelopmentPlan(planId, status, feedback);
      // Refresh development plans after review
      await fetchDevelopmentPlans();
      alert('Development plan review completed!');
    } catch (error) {
      console.error('Error reviewing development plan:', error);
      alert('Failed to review development plan. Please try again.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your team..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        error={error}
        title="Team Loading Error"
        onRetry={refresh}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <Users className="mr-3" size={28} />
          My Team
        </h1>
        <div className="flex space-x-3">
          <Button
            onClick={() => openModal('createEmployee', { onComplete: refresh })}
            className="flex items-center space-x-2"
          >
            <Users size={16} />
            <span>Add Team Member</span>
          </Button>
        </div>
      </div>

      {/* Team Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Team Members</p>
              <p className="text-2xl font-bold text-white">{team?.length || 0}</p>
            </div>
            <Users className="text-cyan-400" size={24} />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending Reviews</p>
              <p className="text-2xl font-bold text-yellow-400">{pendingReviews.length}</p>
            </div>
            <Clock className="text-yellow-400" size={24} />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Completed Reviews</p>
              <p className="text-2xl font-bold text-green-400">{completedReviews.length}</p>
            </div>
            <CheckCircle className="text-green-400" size={24} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Cycles</p>
              <p className="text-2xl font-bold text-cyan-400">
                {teamAssessments?.filter((a: any) => a.cycle_status === 'active').length || 0}
              </p>
            </div>
            <Calendar className="text-cyan-400" size={24} />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', name: 'Team Overview', count: team?.length || 0 },
            { id: 'pending', name: 'Pending Reviews', count: pendingReviews.length },
            { id: 'completed', name: 'Completed Reviews', count: completedReviews.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === tab.id
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.name} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Team Members</h2>
          </div>
          
          <div className="divide-y divide-gray-700">
            {team?.map((member: any) => (
              <div key={member.id} className="p-6 hover:bg-gray-750 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {member.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{member.name}</h3>
                      <p className="text-gray-400 text-sm">{member.job_title}</p>
                      <p className="text-gray-500 text-xs">{member.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <StatusBadge 
                      status={member.is_active ? 'active' : 'inactive'} 
                    />
                    
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleViewManagerPlaybook(member.id)}
                    >
                      <MessageSquare size={14} className="mr-1" />
                      Notes
                    </Button>
                    
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleEditEmployee(member)}
                    >
                      <Edit size={14} className="mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(!team || team.length === 0) && (
            <div className="p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-300">No team members</h3>
              <p className="mt-1 text-sm text-gray-400">
                Get started by adding your first team member.
              </p>
              <div className="mt-6">
                <Button onClick={() => openModal('createEmployee', { onComplete: refresh })}>
                  <Users size={16} className="mr-2" />
                  Add Team Member
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedTab === 'pending' && (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Clock className="mr-2" size={20} />
              Pending Manager Reviews
            </h2>
          </div>
          
          <div className="divide-y divide-gray-700">
            {pendingReviews.map((assessment: any) => (
              <div key={assessment.assessment_id} className="p-6 hover:bg-gray-750 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">{assessment.employee_name}</h3>
                    <p className="text-gray-400 text-sm">{assessment.cycle_name}</p>
                    <p className="text-gray-500 text-xs">
                      Submitted: {formatDate(assessment.self_assessment_submitted_at)}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <StatusBadge status="pending" />
                    <Button 
                      onClick={() => handleReviewAssessment(assessment)}
                      className="flex items-center space-x-2"
                    >
                      <Eye size={16} />
                      <span>Review</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pendingReviews.length === 0 && (
            <div className="p-12 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-300">No pending reviews</h3>
              <p className="mt-1 text-sm text-gray-400">
                All team member assessments have been reviewed.
              </p>
            </div>
          )}
        </div>
      )}

      {selectedTab === 'completed' && (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <CheckCircle className="mr-2" size={20} />
              Completed Reviews
            </h2>
          </div>
          
          <div className="divide-y divide-gray-700">
            {completedReviews.map((assessment: any) => (
              <div key={assessment.assessment_id} className="p-6 hover:bg-gray-750 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">{assessment.employee_name}</h3>
                    <p className="text-gray-400 text-sm">{assessment.cycle_name}</p>
                    <p className="text-gray-500 text-xs">
                      Completed: {formatDate(assessment.manager_review_completed_at)}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <StatusBadge status="completed" />
                    <Button 
                      variant="secondary"
                      onClick={() => handleReviewAssessment(assessment)}
                      className="flex items-center space-x-2"
                    >
                      <Eye size={16} />
                      <span>View</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {completedReviews.length === 0 && (
            <div className="p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-300">No completed reviews</h3>
              <p className="mt-1 text-sm text-gray-400">
                Completed reviews will appear here.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}