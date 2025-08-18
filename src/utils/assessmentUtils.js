// Assessment-related utility functions
import { Calendar, Clock, CheckCircle, Award, User } from 'lucide-react';

export const getStatusDisplay = (assessment) => {
  // Use self_assessment_status if available, otherwise fall back to status
  const selfAssessmentStatus = assessment.self_assessment_status || assessment.status;
  const cycleStatus = assessment.cycle_status || assessment.cycle?.status || assessment.review_cycle_status;
  const managerReviewStatus = assessment.manager_review_status;
  const employeeAcknowledgedAt = assessment.employee_acknowledged_at || assessment.employee_acknowledgment;
  
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
  

  // Handle acknowledged reviews - these are always considered complete regardless of cycle status
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
  
  // Handle completed assessments without acknowledgment - these are also complete
  if (selfAssessmentStatus === 'employee_complete' && managerReviewStatus === 'completed') {
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
  
  // Default handling for missing or null status
  const finalStatus = selfAssessmentStatus || 'not_started';
  
  return statusMap[finalStatus] || { 
    label: 'Unknown Status', 
    color: 'text-gray-400',
    bgColor: 'bg-gray-600',
    actionLabel: 'View',
    description: `Status unclear: ${finalStatus}`,
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

/**
 * Calculates a numerical score (1-5) from an assessment
 * FOR INDIVIDUAL ASSESSMENT TRENDS ONLY - uses GWC and satisfaction
 * NOTE: Department/Company satisfaction uses popup survey responses, not this function
 */
export const calculateAssessmentScore = (assessment) => {
  if (!assessment) return null;
  
  const scores = [];
  
  // Overall satisfaction (already 1-5 scale)
  if (assessment.overall_satisfaction) {
    const satisfaction = typeof assessment.overall_satisfaction === 'string' 
      ? parseInt(assessment.overall_satisfaction) 
      : assessment.overall_satisfaction;
    if (satisfaction >= 1 && satisfaction <= 5) {
      scores.push(satisfaction);
    }
  }
  
  // GWC fields: convert boolean to 1-5 scale (FOR INDIVIDUAL ASSESSMENT TRENDS ONLY)
  // true = 5 (excellent), false = 1 (poor), null/undefined = 3 (neutral)
  const gwcFields = ['gwc_gets_it', 'gwc_wants_it', 'gwc_capacity'];
  gwcFields.forEach(field => {
    if (assessment[field] === true) {
      scores.push(5);
    } else if (assessment[field] === false) {
      scores.push(1);
    } else if (assessment[field] !== undefined && assessment[field] !== null) {
      scores.push(3); // neutral for any other defined value
    }
  });
  
  // If no scores available, return null
  if (scores.length === 0) return null;
  
  // Calculate average and round to 1 decimal place
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return Math.round(average * 10) / 10;
};

/**
 * Gets historical scores for trend analysis
 * Groups assessments by cycle and calculates scores
 */
export const getAssessmentTrends = (assessments) => {
  if (!assessments || assessments.length === 0) return [];
  
  return assessments
    .map(assessment => ({
      cycleName: assessment.cycle_name,
      cycleEndDate: assessment.cycle_end_date,
      selfScore: calculateAssessmentScore(assessment),
      managerScore: assessment.manager_overall_rating ? 
        (typeof assessment.manager_overall_rating === 'string' ? 
          parseInt(assessment.manager_overall_rating) : 
          assessment.manager_overall_rating) : null,
      isComplete: assessment.employee_acknowledged_at !== null || assessment.employee_acknowledgment === true
    }))
    .filter(trend => trend.selfScore !== null || trend.managerScore !== null)
    .sort((a, b) => new Date(a.cycleEndDate) - new Date(b.cycleEndDate));
};