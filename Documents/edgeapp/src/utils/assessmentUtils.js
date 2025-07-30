// Assessment-related utility functions
import { Calendar, Clock, CheckCircle, Award, User } from 'lucide-react';

export const getStatusDisplay = (assessment) => {
  // Use self_assessment_status if available, otherwise fall back to status
  const selfAssessmentStatus = assessment.self_assessment_status || assessment.status;
  const cycleStatus = assessment.review_cycle_status;
  const managerReviewStatus = assessment.manager_review_status;
  const employeeAcknowledgedAt = assessment.employee_acknowledged_at;
  
  // If the review cycle is closed, none of the assessments should be considered "active"
  const isCycleClosed = cycleStatus === 'closed';
  
  // Special handling for different workflow states
  if (isCycleClosed) {
    return {
      label: 'Review Cycle Closed', 
      color: 'text-gray-400',
      bgColor: 'bg-gray-600',
      actionLabel: 'View History',
      description: 'This review cycle has been closed',
      icon: Calendar,
      isActive: false
    };
  }
  
  // Handle manager review completion and employee acknowledgment workflow
  if (managerReviewStatus === 'completed' && !employeeAcknowledgedAt) {
    return {
      label: 'Manager Review Complete - Acknowledge Required', 
      color: 'text-blue-400',
      bgColor: 'bg-blue-600',
      actionLabel: 'Review & Acknowledge',
      description: 'Your manager has completed their review. Please review and acknowledge.',
      icon: Award,
      isActive: cycleStatus === 'active'
    };
  }

  // Handle acknowledged reviews
  if (employeeAcknowledgedAt) {
    return {
      label: 'Review Process Complete', 
      color: 'text-green-400',
      bgColor: 'bg-green-600',
      actionLabel: 'View Review',
      description: 'You have acknowledged your manager\'s review. The review process is complete.',
      icon: CheckCircle,
      isActive: false
    };
  }
  
  const statusMap = {
    'not_started': { 
      label: 'Not Started', 
      color: 'text-gray-400',
      bgColor: 'bg-gray-600',
      actionLabel: 'Start',
      description: 'Begin your self-assessment',
      icon: Calendar,
      isActive: cycleStatus === 'active'  // Only active if cycle is active
    },
    'in_progress': { 
      label: 'In Progress', 
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-600',
      actionLabel: 'Continue',
      description: 'Complete your self-assessment',
      icon: Clock,
      isActive: cycleStatus === 'active'  // Only active if cycle is active
    },
    'employee_complete': { 
      label: 'Waiting for Manager Review', 
      color: 'text-blue-400',
      bgColor: 'bg-blue-600',
      actionLabel: 'View',
      description: 'Your manager is reviewing your assessment',
      icon: User,
      isActive: cycleStatus === 'active'  // Only active if cycle is active
    },
    'manager_complete': { 
      label: 'Manager Review Complete', 
      color: 'text-purple-400',
      bgColor: 'bg-purple-600',
      actionLabel: 'View',
      description: 'Review completed by manager',
      icon: Award,
      isActive: cycleStatus === 'active'  // Only active if cycle is active
    },
    'pending_admin_approval': { 
      label: 'Pending Admin Approval', 
      color: 'text-orange-400',
      bgColor: 'bg-orange-600',
      actionLabel: 'View',
      description: 'Awaiting final approval from administrator',
      icon: User,
      isActive: cycleStatus === 'active'  // Only active if cycle is active
    },
    'finalized': { 
      label: 'Finalized', 
      color: 'text-green-400',
      bgColor: 'bg-green-600',
      actionLabel: 'View',
      description: 'Review cycle complete',
      icon: CheckCircle,
      isActive: false
    }
  };
  
  return statusMap[selfAssessmentStatus] || { 
    label: 'Unknown Status', 
    color: 'text-gray-400',
    bgColor: 'bg-gray-600',
    actionLabel: 'View',
    description: 'Status unclear',
    icon: Calendar,
    isActive: false
  };
};

export const isActiveReview = (assessment) => {
  const statusInfo = getStatusDisplay(assessment);
  return statusInfo.isActive;
};

export const filterActiveReviews = (assessments) => {
  return assessments.filter(assessment => isActiveReview(assessment));
};

export const filterCompletedReviews = (assessments) => {
  return assessments.filter(assessment => !isActiveReview(assessment));
};

export const getAssessmentProgress = (assessment) => {
  const status = assessment.self_assessment_status || assessment.status;
  
  switch (status) {
    case 'not_started':
      return { percentage: 0, step: 'Not Started' };
    case 'in_progress':
      return { percentage: 25, step: 'In Progress' };
    case 'employee_complete':
      return { percentage: 50, step: 'Submitted' };
    case 'manager_complete':
      return { percentage: 75, step: 'Manager Review Complete' };
    case 'pending_admin_approval':
      return { percentage: 85, step: 'Pending Admin Approval' };
    case 'finalized':
      return { percentage: 100, step: 'Finalized' };
    default:
      return { percentage: 0, step: 'Unknown' };
  }
};