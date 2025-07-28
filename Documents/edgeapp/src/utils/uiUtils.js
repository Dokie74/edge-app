// UI-related utility functions

export const getStatusBadgeColor = (status) => {
  const colors = {
    'upcoming': 'bg-yellow-600 text-white',
    'active': 'bg-green-600 text-white', 
    'completed': 'bg-blue-600 text-white',
    'finalized': 'bg-purple-600 text-white',
    'not_started': 'bg-gray-600 text-white',
    'in_progress': 'bg-orange-600 text-white',
    'employee_complete': 'bg-blue-600 text-white',
    'manager_complete': 'bg-purple-600 text-white'
  };
  return colors[status] || 'bg-gray-600 text-white';
};

export const getProgressBarColor = (percentage) => {
  if (percentage >= 100) return 'bg-green-500';
  if (percentage >= 75) return 'bg-blue-500';
  if (percentage >= 50) return 'bg-yellow-500';
  if (percentage >= 25) return 'bg-orange-500';
  return 'bg-gray-500';
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatUserRole = (role) => {
  if (!role) return '';
  return role.charAt(0).toUpperCase() + role.slice(1);
};

export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export const generateAvatarColor = (name) => {
  if (!name) return 'bg-gray-500';
  
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  
  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
};