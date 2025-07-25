// validation.js - Comprehensive input validation and sanitization utilities

/**
 * Validation schema for different input types
 */
export const ValidationRules = {
  email: {
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: 'Please enter a valid email address'
  },
  name: {
    pattern: /^[a-zA-Z\s'-]{2,50}$/,
    message: 'Name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes'
  },
  jobTitle: {
    pattern: /^[a-zA-Z0-9\s\-&().,]{2,100}$/,
    message: 'Job title must be 2-100 characters and contain only letters, numbers, and basic punctuation'
  },
  role: {
    allowed: ['employee', 'manager', 'admin'],
    message: 'Role must be employee, manager, or admin'
  },
  password: {
    minLength: 6,
    pattern: /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/,
    message: 'Password must be at least 6 characters and contain at least one letter and one number'
  },
  cycleName: {
    pattern: /^[a-zA-Z0-9\s\-_.()]{3,100}$/,
    message: 'Cycle name must be 3-100 characters and contain only letters, numbers, spaces, and basic punctuation'
  }
};

/**
 * Sanitize string input by removing potentially dangerous characters
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove HTML/script injection chars
    .replace(/\s+/g, ' ') // Normalize whitespace
    .substring(0, 1000); // Limit length
};

/**
 * Sanitize email input
 */
export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return '';
  
  return email
    .trim()
    .toLowerCase()
    .replace(/[^\w@.-]/g, '') // Only allow valid email characters
    .substring(0, 254); // RFC 5321 limit
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const sanitized = sanitizeEmail(email);
  
  if (!sanitized) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!ValidationRules.email.pattern.test(sanitized)) {
    return { isValid: false, error: ValidationRules.email.message };
  }
  
  return { isValid: true, value: sanitized };
};

/**
 * Validate name input
 */
export const validateName = (name) => {
  const sanitized = sanitizeString(name);
  
  if (!sanitized) {
    return { isValid: false, error: 'Name is required' };
  }
  
  if (!ValidationRules.name.pattern.test(sanitized)) {
    return { isValid: false, error: ValidationRules.name.message };
  }
  
  return { isValid: true, value: sanitized };
};

/**
 * Validate job title
 */
export const validateJobTitle = (jobTitle) => {
  const sanitized = sanitizeString(jobTitle);
  
  if (!sanitized) {
    return { isValid: false, error: 'Job title is required' };
  }
  
  if (!ValidationRules.jobTitle.pattern.test(sanitized)) {
    return { isValid: false, error: ValidationRules.jobTitle.message };
  }
  
  return { isValid: true, value: sanitized };
};

/**
 * Validate role
 */
export const validateRole = (role) => {
  if (!role) {
    return { isValid: false, error: 'Role is required' };
  }
  
  if (!ValidationRules.role.allowed.includes(role)) {
    return { isValid: false, error: ValidationRules.role.message };
  }
  
  return { isValid: true, value: role };
};

/**
 * Validate password
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < ValidationRules.password.minLength) {
    return { isValid: false, error: `Password must be at least ${ValidationRules.password.minLength} characters` };
  }
  
  if (!ValidationRules.password.pattern.test(password)) {
    return { isValid: false, error: ValidationRules.password.message };
  }
  
  return { isValid: true, value: password };
};

/**
 * Validate review cycle name
 */
export const validateCycleName = (name) => {
  const sanitized = sanitizeString(name);
  
  if (!sanitized) {
    return { isValid: false, error: 'Cycle name is required' };
  }
  
  if (!ValidationRules.cycleName.pattern.test(sanitized)) {
    return { isValid: false, error: ValidationRules.cycleName.message };
  }
  
  return { isValid: true, value: sanitized };
};

/**
 * Validate date input
 */
export const validateDate = (date, fieldName = 'Date') => {
  if (!date) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: `${fieldName} is not a valid date` };
  }
  
  return { isValid: true, value: date };
};

/**
 * Validate date range
 */
export const validateDateRange = (startDate, endDate) => {
  const startValidation = validateDate(startDate, 'Start date');
  if (!startValidation.isValid) return startValidation;
  
  const endValidation = validateDate(endDate, 'End date');
  if (!endValidation.isValid) return endValidation;
  
  if (new Date(startDate) >= new Date(endDate)) {
    return { isValid: false, error: 'End date must be after start date' };
  }
  
  return { isValid: true, startDate, endDate };
};

/**
 * Validate UUID
 */
export const validateUUID = (uuid, fieldName = 'ID') => {
  if (!uuid) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(uuid)) {
    return { isValid: false, error: `${fieldName} is not a valid ID` };
  }
  
  return { isValid: true, value: uuid };
};

/**
 * Comprehensive form validation
 */
export const validateForm = (data, rules) => {
  const errors = {};
  const sanitizedData = {};
  
  for (const [field, value] of Object.entries(data)) {
    if (rules[field]) {
      const validation = rules[field](value);
      if (!validation.isValid) {
        errors[field] = validation.error;
      } else {
        sanitizedData[field] = validation.value;
      }
    } else {
      // Default sanitization for unknown fields
      sanitizedData[field] = sanitizeString(value);
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: sanitizedData
  };
};

/**
 * Employee creation form validation
 */
export const validateEmployeeForm = (formData) => {
  return validateForm(formData, {
    name: validateName,
    email: validateEmail,
    jobTitle: validateJobTitle,
    role: validateRole,
    managerId: (id) => id ? validateUUID(id, 'Manager ID') : { isValid: true, value: null }
  });
};

/**
 * Review cycle form validation
 */
export const validateReviewCycleForm = (formData) => {
  const basicValidation = validateForm(formData, {
    name: validateCycleName,
    startDate: (date) => validateDate(date, 'Start date'),
    endDate: (date) => validateDate(date, 'End date')
  });
  
  if (!basicValidation.isValid) {
    return basicValidation;
  }
  
  // Additional date range validation
  const dateRangeValidation = validateDateRange(
    basicValidation.data.startDate,
    basicValidation.data.endDate
  );
  
  if (!dateRangeValidation.isValid) {
    return {
      isValid: false,
      errors: { dateRange: dateRangeValidation.error },
      data: basicValidation.data
    };
  }
  
  return basicValidation;
};

/**
 * Authentication form validation
 */
export const validateAuthForm = (formData) => {
  return validateForm(formData, {
    email: validateEmail,
    password: validatePassword
  });
};

export default {
  sanitizeString,
  sanitizeEmail,
  validateEmail,
  validateName,
  validateJobTitle,
  validateRole,
  validatePassword,
  validateCycleName,
  validateDate,
  validateDateRange,
  validateUUID,
  validateForm,
  validateEmployeeForm,
  validateReviewCycleForm,
  validateAuthForm,
  ValidationRules
};