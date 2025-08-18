# EDGE Application API Documentation

**Version: 5.0 - Production Ready**  
**Date: July 30, 2025**  
**Status: Complete API Coverage**

## Overview

The EDGE (Employee Development & Growth Engine) application provides a comprehensive performance management system with advanced analytics, team health monitoring, and pulse question management. This production-ready API serves role-based access for employees, managers, and administrators with real-time data processing and comprehensive security features.

## Authentication & Security

### Authentication System
The application uses Supabase Authentication with JWT tokens and comprehensive session management:

**User Roles & Permissions:**
- **Employee**: Personal assessments, development plans, team health pulse participation, and recognition
- **Manager**: Team management, enhanced My Team view, manager reviews, team health analytics, and approval workflows
- **Admin**: Full system administration, pulse questions management, manager review approvals, and comprehensive analytics

### Security Features
- **Row Level Security (RLS)**: Database-level access control on all tables
- **JWT Token Management**: Secure authentication with automatic refresh
- **Role-Based Access Control**: Granular permissions based on user roles
- **Input Validation**: Comprehensive sanitization and validation on all endpoints
- **Audit Logging**: Complete activity tracking for security and compliance

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

### Employee (Enhanced)
```typescript
interface Employee {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  job_title?: string;
  role: 'employee' | 'manager' | 'admin';
  manager_id?: string;
  department_ids?: string[]; // Multi-department support
  is_active: boolean;
  start_date?: string;
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}
```

### Assessment (Enhanced)
```typescript
interface Assessment {
  id: string;
  employee_id: string;
  cycle_id: string;
  self_assessment_status: 'not_started' | 'in_progress' | 'submitted';
  manager_review_status: 'pending' | 'in_progress' | 'completed' | 'approved';
  admin_approval_status?: 'pending' | 'approved' | 'needs_revision';
  self_assessment_data?: Record<string, any>;
  manager_review_data?: Record<string, any>;
  admin_feedback?: string;
  quality_score?: number;
  due_date: string;
  submitted_date?: string;
  manager_review_date?: string;
  admin_approval_date?: string;
  created_at: string;
  updated_at: string;
}
```

### Development Plan (Enhanced)
```typescript
interface DevelopmentPlan {
  id: string;
  employee_id: string;
  title: string;
  description?: string;
  goals: string; // JSON string with SMART goals
  skills_to_develop: string; // JSON string with skill matrix
  resources_needed?: string; // Training, budget, tools
  success_metrics?: string; // Measurable outcomes
  timeline?: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'needs_revision' | 'in_progress' | 'completed';
  manager_feedback?: string;
  progress_updates?: string; // JSON string with milestone tracking
  completion_percentage?: number;
  manager_reviewed_at?: string;
  manager_reviewed_by?: string;
  created_at: string;
  updated_at: string;
}
```

### Pulse Questions (NEW)
```typescript
interface PulseQuestion {
  id: string;
  question_text: string;
  category: 'satisfaction' | 'workload' | 'support' | 'development' | 'balance' | 'communication';
  response_scale: 'rating_5' | 'rating_10' | 'yes_no' | 'text';
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}
```

### Team Health Pulse Response
```typescript
interface TeamHealthPulseResponse {
  id: string;
  employee_id: string;
  question_id: string;
  response_value: number | string;
  response_date: string;
  is_anonymous: boolean;
  created_at: string;
}
```

### Feedback & Kudos (Enhanced)
```typescript
interface Feedback {
  id: string;
  from_employee_id: string;
  to_employee_id: string;
  feedback_type: 'recognition' | 'constructive' | 'developmental';
  message: string;
  is_public: boolean;
  created_at: string;
}

interface Kudo {
  id: string;
  from_employee_id: string;
  to_employee_id: string;
  core_value: string;
  message: string;
  badge_type?: string;
  is_public: boolean;
  created_at: string;
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
Retrieves all team members with enhanced profile data
- **Parameters**: `managerId: string`
- **Returns**: `Promise<EmployeeWithMetrics[]>`
- **Access**: Manager (own team), Admin (any team)
- **Features**: Performance metrics, completion rates, team health participation

#### `getTeamAssessments(managerId)`
Retrieves all assessments for a manager's team with analytics
- **Parameters**: `managerId: string`
- **Returns**: `Promise<AssessmentWithAnalytics[]>`
- **Access**: Manager, Admin
- **Features**: Priority indicators, completion tracking, quality scores

#### `getTeamHealthMetrics(managerId)`
Retrieves team health pulse analytics for a manager's team
- **Parameters**: `managerId: string`
- **Returns**: `Promise<TeamHealthMetrics>`
- **Access**: Manager (own team), Admin
- **Features**: Satisfaction scores, participation rates, trend analysis

#### `getMyTeamData(managerId)`
Retrieves comprehensive team data for the enhanced My Team view
- **Parameters**: `managerId: string`
- **Returns**: `Promise<ComprehensiveTeamData>`
- **Access**: Manager (own team), Admin
- **Features**: Employee widgets data, performance summaries, action items

### Admin Service (`AdminService.ts`)

#### `getDashboardStats()`
Retrieves comprehensive dashboard statistics with 100% real data
- **Returns**: `Promise<DashboardStats>`
- **Access**: Admin only
- **Features**: Real-time analytics, department breakdowns, pulse question performance

#### `getPulseQuestions()`
Retrieves all pulse questions for employee surveys
- **Returns**: `Promise<PulseQuestion[]>`
- **Access**: Admin only

#### `createPulseQuestion(questionData)`
Creates a new pulse survey question
- **Parameters**: `questionData: Omit<PulseQuestion, 'id' | 'created_at' | 'updated_at'>`
- **Returns**: `Promise<PulseQuestion>`
- **Access**: Admin only

#### `deletePulseQuestion(questionId)`
Deletes a pulse survey question
- **Parameters**: `questionId: string`
- **Returns**: `Promise<void>`
- **Access**: Admin only

#### `getQuestionPerformanceAnalytics()`
Retrieves analytics on pulse question performance
- **Returns**: `Promise<QuestionPerformanceData>`
- **Access**: Admin only
- **Features**: Top/bottom performing questions, response distributions, trend analysis

#### `getPendingManagerReviews()`
Retrieves manager reviews awaiting admin approval
- **Returns**: `Promise<Assessment[]>`
- **Access**: Admin only

#### `approveManagerReview(assessmentId, approvalData)`
Approves or requests revision for manager reviews
- **Parameters**: 
  - `assessmentId: string`
  - `approvalData: { status: 'approved' | 'needs_revision', feedback?: string }`
- **Returns**: `Promise<Assessment>`
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

### Analytics Service (Enhanced) (`AnalyticsService.ts`)

#### `getCompanyAnalytics()`
Retrieves company-wide analytics with real-time data processing
- **Returns**: `Promise<CompanyAnalytics>`
- **Access**: Admin only
- **Features**: Department performance, pulse question analytics, 6-month trends

#### `getManagerAnalytics(managerId)`
Retrieves comprehensive analytics for a manager's team
- **Parameters**: `managerId: string`
- **Returns**: `Promise<ManagerAnalytics>`
- **Access**: Manager (own team), Admin
- **Features**: Team performance trends, peer comparisons, development tracking

#### `getPulseQuestionAnalytics()`
Retrieves detailed analytics on pulse question performance
- **Returns**: `Promise<PulseQuestionAnalytics>`
- **Access**: Admin only
- **Features**: Response distributions, top/bottom performers, category analysis

#### `getDepartmentAnalytics(departmentId?)`
Retrieves analytics by department
- **Parameters**: `departmentId?: string` (optional, returns all if not specified)
- **Returns**: `Promise<DepartmentAnalytics[]>`
- **Access**: Admin only
- **Features**: Cross-department comparisons, satisfaction trends, performance metrics

#### `getPerformanceTrends(timeframe)`
Retrieves historical performance trends
- **Parameters**: `timeframe: '3m' | '6m' | '1y'`
- **Returns**: `Promise<PerformanceTrends>`
- **Access**: Manager (own team), Admin
- **Features**: Predictive insights, trend analysis, early warning indicators

### Team Health Pulse Service (NEW) (`TeamHealthService.ts`)

#### `submitPulseResponse(employeeId, responses)`
Submits employee responses to pulse survey questions
- **Parameters**: 
  - `employeeId: string`
  - `responses: PulseResponse[]`
- **Returns**: `Promise<TeamHealthPulseResponse[]>`
- **Access**: Employee (own responses), Manager (team oversight), Admin

#### `getPulseQuestionsForEmployee(employeeId)`
Retrieves active pulse questions for an employee
- **Parameters**: `employeeId: string`
- **Returns**: `Promise<PulseQuestion[]>`
- **Access**: Employee (own), Manager (team), Admin

#### `getTeamHealthInsights(managerId)`
Retrieves team health insights for managers
- **Parameters**: `managerId: string`
- **Returns**: `Promise<TeamHealthInsights>`
- **Access**: Manager (own team), Admin
- **Features**: Team satisfaction trends, alert notifications, improvement recommendations

## Enhanced Notification System

### Notification Service (Enhanced) (`NotificationService.js`)

#### `sendNotification(recipientId, type, data)`
Sends enhanced notifications with priority levels
- **Parameters**: 
  - `recipientId: string`
  - `type: NotificationType`
  - `data: Record<string, any>`
  - `priority?: 'low' | 'medium' | 'high' | 'urgent'`
- **Returns**: `Promise<Notification>`
- **Features**: Priority-based delivery, action integration, achievement celebrations

#### `getUserNotifications(userId, filters?)`
Retrieves notifications with advanced filtering
- **Parameters**: 
  - `userId: string`
  - `filters?: { type?: string[], priority?: string[], unread_only?: boolean }`
- **Returns**: `Promise<Notification[]>`
- **Features**: Categorized notifications, priority filtering, bulk actions

#### `markNotificationAsRead(notificationId)`
Marks a notification as read with analytics tracking
- **Parameters**: `notificationId: string`
- **Returns**: `Promise<void>`
- **Features**: Engagement tracking, response analytics

#### `sendTeamHealthAlert(managerId, alertData)`
Sends team health alerts to managers
- **Parameters**: 
  - `managerId: string`
  - `alertData: TeamHealthAlert`
- **Returns**: `Promise<Notification>`
- **Access**: System automated, Admin manual trigger

## Enhanced Feedback & Recognition System

### Feedback Service (Enhanced) (`feedbackService.js`)

#### `submitFeedback(feedbackData)`
Submits categorized feedback between employees
- **Parameters**: `feedbackData: Omit<Feedback, 'id' | 'created_at'>`
- **Returns**: `Promise<Feedback>`
- **Features**: Feedback categorization, impact tracking, integration with development plans

#### `getFeedbackReceived(employeeId, filters?)`
Retrieves feedback with advanced filtering and analytics
- **Parameters**: 
  - `employeeId: string`
  - `filters?: { type?: string[], dateRange?: { start: string, end: string } }`
- **Returns**: `Promise<FeedbackWithAnalytics[]>`
- **Features**: Trend analysis, pattern recognition, development insights

#### `getFeedbackAnalytics(employeeId)`
Retrieves feedback analytics and patterns
- **Parameters**: `employeeId: string`
- **Returns**: `Promise<FeedbackAnalytics>`
- **Access**: Employee (own), Manager (team), Admin
- **Features**: Feedback trends, strength/development patterns, peer insights

### Kudos Service (Enhanced) (`kudosService.js`)

#### `giveKudo(kudoData)`
Gives values-based recognition to another employee
- **Parameters**: `kudoData: Omit<Kudo, 'id' | 'created_at'>`
- **Returns**: `Promise<Kudo>`
- **Features**: Core values integration, badge system, impact measurement

#### `getKudosReceived(employeeId, includeAnalytics?)`
Retrieves kudos with optional analytics
- **Parameters**: 
  - `employeeId: string`
  - `includeAnalytics?: boolean`
- **Returns**: `Promise<KudoWithAnalytics[]>`
- **Features**: Recognition trends, values alignment, peer comparison

#### `getRecognitionWall(limit?, filters?)`
Retrieves public recognition for company-wide visibility
- **Parameters**: 
  - `limit?: number`
  - `filters?: { department?: string, coreValue?: string, dateRange?: DateRange }`
- **Returns**: `Promise<PublicRecognition[]>`
- **Access**: All users
- **Features**: Company culture visibility, values reinforcement, peer inspiration

## Enhanced Error Handling & Response Format

### Standardized Response Structure
All services return comprehensive response objects with enhanced error information:

```typescript
interface ServiceResponse<T> {
  data?: T;
  error?: ServiceError;
  success: boolean;
  metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

interface ServiceError {
  code: string;
  message: string;
  details?: Record<string, any>;
  suggestion?: string;
  retryable: boolean;
}
```

### Enhanced Error Codes
- `UNAUTHORIZED`: User lacks permission for the operation
- `FORBIDDEN`: Access denied for specific resource
- `NOT_FOUND`: Requested resource doesn't exist
- `VALIDATION_ERROR`: Input data validation failed with detailed field errors
- `CONFLICT`: Resource conflict (e.g., duplicate email)
- `RATE_LIMITED`: Too many requests, retry after specified time
- `SERVER_ERROR`: Internal server error with tracking ID
- `DATABASE_ERROR`: Database operation failed
- `EXTERNAL_SERVICE_ERROR`: Third-party service unavailable
- `FEATURE_DISABLED`: Requested feature is disabled
- `INSUFFICIENT_PERMISSIONS`: Role lacks specific permission

### Error Response Examples
```typescript
// Validation Error
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Input validation failed',
    details: {
      fields: {
        email: 'Invalid email format',
        password: 'Password must be at least 8 characters'
      }
    },
    suggestion: 'Please correct the highlighted fields and try again',
    retryable: true
  },
  metadata: {
    timestamp: '2025-07-30T10:30:00Z',
    requestId: 'req_abc123',
    version: '5.0'
  }
}
```

## Enhanced Rate Limiting & Performance

### Rate Limiting Rules
- **General API**: 100 requests per minute per user
- **Authentication**: 10 login attempts per 15 minutes per IP
- **Pulse Questions**: 50 submissions per hour per employee
- **File Uploads**: 10MB per file, 5 files per minute
- **Bulk Operations**: 100 records per request, 10 bulk operations per hour
- **Analytics Queries**: 20 complex queries per minute per user
- **Search Operations**: 50 searches per minute per user

### Performance Optimization
- **Caching**: Redis-based caching for frequently accessed data
- **Connection Pooling**: Optimized database connections
- **Query Optimization**: Indexed queries for analytics operations
- **CDN Integration**: Static asset optimization
- **Response Compression**: Gzip compression for all responses

### Real-Time Features
- **WebSocket Connections**: Live updates for dashboards and notifications
- **Event Streaming**: Real-time analytics updates
- **Push Notifications**: Instant alerts for critical events
- **Live Collaboration**: Real-time feedback and recognition updates

## Enhanced Security Features

### Authentication Security
- **JWT Token Management**: Secure tokens with automatic refresh and expiration
- **Multi-Factor Authentication**: Optional MFA for admin accounts
- **Session Security**: Encrypted session storage with secure cookies
- **Password Security**: Bcrypt hashing with configurable complexity

### Authorization & Access Control
- **Row Level Security (RLS)**: Database-level access control on all tables
- **Role-Based Permissions**: Granular permissions for each user role
- **Resource-Level Security**: Fine-grained access control for specific data
- **API Endpoint Protection**: Role validation on every endpoint

### Data Protection
- **Input Validation**: Comprehensive sanitization using `validationUtils.js` and `validation.ts`
- **SQL Injection Prevention**: Parameterized queries and input escaping
- **XSS Protection**: Content Security Policy and output encoding
- **CSRF Protection**: Token-based protection via `csrfProtection.js`
- **Data Encryption**: Sensitive data encrypted at rest and in transit

### Monitoring & Compliance
- **Security Logging**: Comprehensive audit trails via `secureLogger.js`
- **Activity Monitoring**: Real-time security event tracking
- **Compliance Features**: GDPR-compliant data handling and retention
- **Vulnerability Scanning**: Automated security assessments
- **Performance Monitoring**: Security-aware performance tracking via `performanceUtils.ts`

### Privacy Protection
- **Data Anonymization**: Anonymous pulse survey responses
- **PII Protection**: Personal information encryption and access controls
- **Data Retention**: Configurable data lifecycle management
- **User Consent**: Granular privacy controls and consent management

## Development Tools

### Test Utilities (`testUtils.js`)
Helper functions for testing components and services

### Date Utilities (`dateUtils.js`)
Standardized date formatting and manipulation

### UI Utilities (`uiUtils.js`)
Common UI helper functions and constants

## Enhanced Database Schema

The application uses Supabase with PostgreSQL and advanced schema design:

### Core Tables
- `users` - Supabase authentication data with enhanced profiles
- `employees` - Employee profiles with multi-department support and analytics
- `departments` - Organizational structure with hierarchy support
- `employee_departments` - Many-to-many relationship for multi-department assignments

### Performance Management
- `review_cycles` - Performance review periods with flexible configuration
- `assessments` - Self-assessments and manager reviews with approval workflows
- `development_plans` - Enhanced development planning with progress tracking
- `assessment_approvals` - Admin approval workflow for manager reviews

### Team Health & Pulse Surveys
- `pulse_questions` - Configurable employee wellbeing survey questions
- `team_health_pulse_responses` - Employee survey responses with analytics
- `question_categories` - Categorization system for pulse questions

### Recognition & Feedback
- `feedback` - Enhanced peer feedback system with categorization
- `kudos` - Values-based recognition system with badges
- `core_values` - Company core values for recognition alignment
- `recognition_badges` - Achievement badges and recognition types

### Analytics & Insights
- `analytics_snapshots` - Historical performance data for trend analysis
- `team_health_metrics` - Aggregated team wellbeing insights
- `performance_trends` - Calculated performance trends and predictions
- `dashboard_widgets` - Configurable dashboard components

### System Management
- `notifications` - Enhanced notification system with priorities
- `audit_logs` - Comprehensive activity tracking
- `system_settings` - Application configuration and feature flags
- `user_preferences` - Individual user settings and preferences

### Advanced Features
- `manager_playbooks` - Private manager notes and coaching records
- `skill_assessments` - Skill tracking and development mapping
- `mentorship_relationships` - Formal mentoring program support
- `succession_planning` - Leadership development and succession tracking

## Environment Configuration

### Required Environment Variables
```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application Configuration
REACT_APP_ENVIRONMENT=production|staging|development
REACT_APP_VERSION=5.0
REACT_APP_API_BASE_URL=your_api_base_url

# Feature Flags
REACT_APP_ENABLE_PULSE_QUESTIONS=true
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_TEAM_HEALTH=true
REACT_APP_ENABLE_MANAGER_APPROVALS=true
REACT_APP_DEBUG_MODE=false

# Security Configuration
REACT_APP_CSP_NONCE=your_csp_nonce
REACT_APP_ENCRYPTION_KEY=your_encryption_key

# External Services (Optional)
REACT_APP_SENTRY_DSN=your_sentry_dsn
REACT_APP_ANALYTICS_ID=your_analytics_id
REACT_APP_SLACK_WEBHOOK=your_slack_webhook
```

### Environment-Specific Configurations
- **Production**: Optimized for performance, security-hardened, analytics enabled
- **Staging**: Mirror of production with test data and debug features
- **Development**: Full debugging, mock services, relaxed security for development

## Production Deployment

### Deployment Architecture
- **Frontend**: React SPA deployed on Vercel with edge optimization
- **Backend**: Supabase managed PostgreSQL with serverless functions
- **CDN**: Global content delivery with CloudFlare integration
- **Security**: HTTPS enforcement, CSP headers, and security monitoring

### Build Process
```bash
# Production build with optimizations
npm run build:prod
npm run type-check
npm run lint
npm run test:ci
```

### Database Migrations
```bash
# Apply database schema updates
npx supabase db push --linked
npx supabase db seed --linked
```

### Health Checks
- **Application Health**: `/api/health` endpoint with comprehensive system checks
- **Database Health**: Connection pooling and query performance monitoring
- **External Services**: Third-party service availability checks
- **Security Status**: Authentication service and permission validation

### Monitoring & Alerting
- **Performance Monitoring**: Real-time application performance tracking
- **Error Tracking**: Comprehensive error logging and alerting
- **Security Monitoring**: Authentication failures and suspicious activity detection
- **Business Metrics**: User engagement and feature adoption tracking

### Backup & Recovery
- **Database Backups**: Automated daily backups with point-in-time recovery
- **Application State**: Configuration and settings backup procedures
- **Disaster Recovery**: Multi-region failover capabilities
- **Data Retention**: Configurable data lifecycle management

---

**🎉 EDGE API is production-ready with comprehensive features and enterprise-grade security! 🎉**