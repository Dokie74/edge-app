// Assessment-related utility functions

export const getStatusDisplay = (assessment) => {
  // Use self_assessment_status if available, otherwise fall back to status
  const currentStatus = assessment.self_assessment_status || assessment.status;
  
  const statusMap = {
    'not_started': { 
      label: 'Not Started', 
      color: 'text-gray-400',
      bgColor: 'bg-gray-600',
      actionLabel: 'Start',
      description: 'Begin your self-assessment'
    },
    'in_progress': { 
      label: 'In Progress', 
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-600',
      actionLabel: 'Continue',
      description: 'Complete your self-assessment'
    },
    'employee_complete': { 
      label: 'Submitted', 
      color: 'text-blue-400',
      bgColor: 'bg-blue-600',
      actionLabel: 'View',
      description: 'Waiting for manager review'
    },
    'manager_complete': { 
      label: 'Manager Complete', 
      color: 'text-purple-400',
      bgColor: 'bg-purple-600',
      actionLabel: 'View',
      description: 'Review completed by manager'
    },
    'finalized': { 
      label: 'Finalized', 
      color: 'text-green-400',
      bgColor: 'bg-green-600',
      actionLabel: 'View',
      description: 'Review cycle complete'
    }
  };
  
  return statusMap[currentStatus] || { 
    label: 'Unknown Status', 
    color: 'text-gray-400',
    bgColor: 'bg-gray-600',
    actionLabel: 'View',
    description: 'Status unclear'
  };
};

export const isActiveReview = (assessment) => {
  const currentStatus = assessment.self_assessment_status || assessment.status;
  return currentStatus !== 'finalized';
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
    case 'finalized':
      return { percentage: 100, step: 'Finalized' };
    default:
      return { percentage: 0, step: 'Unknown' };
  }
};