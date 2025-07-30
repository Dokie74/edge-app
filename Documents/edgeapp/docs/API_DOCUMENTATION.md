# EDGE Application API Documentation

## Overview

The EDGE (Employee Development & Growth Engine) application provides a comprehensive performance management system with role-based access for employees, managers, and administrators.

## Authentication

The application uses Supabase Authentication with the following user roles:
- **Employee**: Basic access to personal assessments and development plans
- **Manager**: Team management and review capabilities
- **Admin**: Full system administration

## Core Data Models

### User
```typescript
interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}
```

### Employee
```typescript
interface Employee {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  job_title?: string;
  role: 'employee' | 'manager' | 'admin';
  manager_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### Assessment
```typescript
interface Assessment {
  id: string;
  employee_id: string;
  cycle_id: string;
  self_assessment_status: 'not_started' | 'in_progress' | 'submitted';
  manager_review_status: 'pending' | 'in_progress' | 'completed';
  self_assessment_data?: Record<string, any>;
  manager_review_data?: Record<string, any>;
  due_date: string;
  created_at: string;
  updated_at: string;
}
```

### Development Plan
```typescript
interface DevelopmentPlan {
  id: string;
  employee_id: string;
  title: string;
  description?: string;
  goals: string; // JSON string
  skills_to_develop: string; // JSON string
  timeline?: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'needs_revision';
  manager_feedback?: string;
  manager_reviewed_at?: string;
  manager_reviewed_by?: string;
  created_at: string;
  updated_at: string;
}
```

## Service Endpoints

### Authentication Service (`authService.js`)

#### `getCurrentUser()`
Returns the currently authenticated user
- **Returns**: `Promise<User | null>`
- **Usage**: Used throughout the application to check authentication status

#### `signIn(email, password)`
Authenticates a user with email and password
- **Parameters**: 
  - `email: string`
  - `password: string`
- **Returns**: `Promise<AuthResponse>`

#### `signOut()`
Signs out the current user
- **Returns**: `Promise<void>`

### Assessment Service (`assessmentService.js`)

#### `getUserAssessments(employeeId)`
Retrieves all assessments for a specific employee
- **Parameters**: `employeeId: string`
- **Returns**: `Promise<Assessment[]>`
- **Access**: Employee (own assessments), Manager (team assessments), Admin (all)

#### `submitSelfAssessment(assessmentId, data)`
Submits self-assessment data
- **Parameters**: 
  - `assessmentId: string`
  - `data: Record<string, any>`
- **Returns**: `Promise<Assessment>`
- **Access**: Employee only

#### `submitManagerReview(assessmentId, reviewData)`
Submits manager review for an assessment
- **Parameters**: 
  - `assessmentId: string`
  - `reviewData: Record<string, any>`
- **Returns**: `Promise<Assessment>`
- **Access**: Manager, Admin

### Team Service (`teamService.js`)

#### `getTeamMembers(managerId)`
Retrieves all team members for a manager
- **Parameters**: `managerId: string`
- **Returns**: `Promise<Employee[]>`
- **Access**: Manager (own team), Admin (any team)

#### `getTeamAssessments(managerId)`
Retrieves all assessments for a manager's team
- **Parameters**: `managerId: string`
- **Returns**: `Promise<Assessment[]>`
- **Access**: Manager, Admin

### Admin Service (`AdminService.ts`)

#### `getDashboardStats()`
Retrieves comprehensive dashboard statistics
- **Returns**: `Promise<DashboardStats>`
- **Access**: Admin only

#### `createEmployee(employeeData)`
Creates a new employee record
- **Parameters**: `employeeData: EmployeeFormData`
- **Returns**: `Promise<Employee>`
- **Access**: Admin only

#### `updateEmployee(employeeId, updates)`
Updates an existing employee record
- **Parameters**: 
  - `employeeId: string`
  - `updates: Partial<EmployeeFormData>`
- **Returns**: `Promise<Employee>`
- **Access**: Admin only

#### `createReviewCycle(cycleData)`
Creates a new review cycle
- **Parameters**: `cycleData: ReviewCycleFormData`
- **Returns**: `Promise<ReviewCycle>`
- **Access**: Admin only

### Analytics Service (`AnalyticsService.ts`)

#### `getCompanyAnalytics()`
Retrieves company-wide analytics
- **Returns**: `Promise<CompanyAnalytics>`
- **Access**: Admin only

#### `getManagerAnalytics(managerId)`
Retrieves analytics for a specific manager's team
- **Parameters**: `managerId: string`
- **Returns**: `Promise<ManagerAnalytics>`
- **Access**: Manager (own team), Admin

## Notification System

### Notification Service (`NotificationService.js`)

#### `sendNotification(recipientId, type, data)`
Sends a notification to a user
- **Parameters**: 
  - `recipientId: string`
  - `type: NotificationType`
  - `data: Record<string, any>`
- **Returns**: `Promise<Notification>`

#### `getUserNotifications(userId)`
Retrieves notifications for a user
- **Parameters**: `userId: string`
- **Returns**: `Promise<Notification[]>`

#### `markNotificationAsRead(notificationId)`
Marks a notification as read
- **Parameters**: `notificationId: string`
- **Returns**: `Promise<void>`

## Feedback & Kudos System

### Feedback Service (`feedbackService.js`)

#### `submitFeedback(feedbackData)`
Submits feedback between employees
- **Parameters**: `feedbackData: Omit<Feedback, 'id' | 'created_at'>`
- **Returns**: `Promise<Feedback>`

#### `getFeedbackReceived(employeeId)`
Retrieves feedback received by an employee
- **Parameters**: `employeeId: string`
- **Returns**: `Promise<Feedback[]>`

### Kudos Service (`kudosService.js`)

#### `giveKudo(kudoData)`
Gives a kudo to another employee
- **Parameters**: `kudoData: Omit<Kudo, 'id' | 'created_at'>`
- **Returns**: `Promise<Kudo>`

#### `getKudosReceived(employeeId)`
Retrieves kudos received by an employee
- **Parameters**: `employeeId: string`
- **Returns**: `Promise<Kudo[]>`

## Error Handling

All services return standardized error responses:

```typescript
interface ServiceResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}
```

Common error codes:
- `UNAUTHORIZED`: User lacks permission for the operation
- `NOT_FOUND`: Requested resource doesn't exist
- `VALIDATION_ERROR`: Input data validation failed
- `SERVER_ERROR`: Internal server error

## Rate Limiting

- API calls are limited to 100 requests per minute per user
- File uploads are limited to 10MB
- Bulk operations are limited to 100 records per request

## Security Features

### CSRF Protection
All state-changing requests include CSRF tokens via `csrfProtection.js`

### Input Validation
All inputs are validated using `validationUtils.js` and `validation.ts`

### Secure Logging
Sensitive data is redacted in logs via `secureLogger.js`

### Performance Monitoring
Application performance is tracked via `performanceUtils.ts`

## Development Tools

### Test Utilities (`testUtils.js`)
Helper functions for testing components and services

### Date Utilities (`dateUtils.js`)
Standardized date formatting and manipulation

### UI Utilities (`uiUtils.js`)
Common UI helper functions and constants

## Database Schema

The application uses Supabase with PostgreSQL. Key tables:
- `users` - Authentication data
- `employees` - Employee profiles and roles
- `review_cycles` - Performance review periods
- `assessments` - Self-assessments and manager reviews
- `development_plans` - Employee development planning
- `notifications` - System notifications
- `feedback` - Peer feedback system
- `kudos` - Recognition system

## Environment Variables

Required environment variables:
- `REACT_APP_SUPABASE_URL` - Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY` - Supabase anonymous key

## Deployment

The application is designed for deployment with:
- React build process
- Supabase backend
- Environment-specific configuration
- HTTPS required for production