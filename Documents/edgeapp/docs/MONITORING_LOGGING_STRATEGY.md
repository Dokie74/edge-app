# EDGE Application Monitoring & Logging Strategy

## Overview

This document outlines a comprehensive monitoring and logging strategy for the EDGE (Employee Development & Growth Engine) application to ensure optimal performance, security, and reliability.

## Monitoring Architecture

### Multi-Layer Monitoring Approach

```
┌─────────────────────────────────────────────────────────────┐
│                    User Experience Layer                    │
│  • Real User Monitoring (RUM)                              │
│  • Core Web Vitals                                         │
│  • User Journey Tracking                                   │
└─────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                        │
│  • React Performance Monitoring                            │
│  • Error Tracking & Alerting                              │
│  • Feature Usage Analytics                                 │
└─────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────┐
│                   Infrastructure Layer                     │
│  • Supabase Database Monitoring                           │
│  • API Performance Tracking                               │
│  • CDN & Network Monitoring                               │
└─────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                    │
│  • Assessment Completion Rates                            │
│  • User Engagement Metrics                                │
│  • System Usage Patterns                                  │
└─────────────────────────────────────────────────────────────┘
```

## Real User Monitoring (RUM)

### Core Web Vitals Implementation

#### Web Vitals Tracking Setup
```typescript
// src/utils/webVitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals';

interface VitalsData extends Metric {
  userId?: string;
  userRole?: string;
  page?: string;
  sessionId?: string;
}

class WebVitalsTracker {
  private sessionId: string;
  private userId?: string;
  private userRole?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeTracking();
  }

  private initializeTracking() {
    const sendToAnalytics = (metric: Metric) => {
      const vitalsData: VitalsData = {
        ...metric,
        userId: this.userId,
        userRole: this.userRole,
        page: window.location.pathname,
        sessionId: this.sessionId
      };

      this.sendVitalsData(vitalsData);
    };

    // Track all Core Web Vitals
    getCLS(sendToAnalytics);
    getFID(sendToAnalytics);
    getFCP(sendToAnalytics);
    getLCP(sendToAnalytics);
    getTTFB(sendToAnalytics);
  }

  private async sendVitalsData(data: VitalsData) {
    try {
      // Send to Supabase for analysis
      await supabase.from('web_vitals').insert({
        metric_name: data.name,
        metric_value: data.value,
        metric_delta: data.delta,
        metric_id: data.id,
        user_id: data.userId,
        user_role: data.userRole,
        page_url: data.page,
        session_id: data.sessionId,
        timestamp: new Date().toISOString()
      });

      // Also send to external analytics if configured
      if (process.env.REACT_APP_ANALYTICS_ENDPOINT) {
        fetch(process.env.REACT_APP_ANALYTICS_ENDPOINT, {
          method: 'POST',
          body: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      console.error('Failed to send vitals data:', error);
    }
  }

  setUser(userId: string, role: string) {
    this.userId = userId;
    this.userRole = role;
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const webVitalsTracker = new WebVitalsTracker();
```

#### Performance Budget Monitoring
```typescript
// src/utils/performanceBudget.ts
export const PERFORMANCE_BUDGETS = {
  // Core Web Vitals Thresholds
  LCP: { good: 2500, needsImprovement: 4000 }, // ms
  FID: { good: 100, needsImprovement: 300 },   // ms
  CLS: { good: 0.1, needsImprovement: 0.25 },  // ratio
  
  // Custom Metrics
  TIME_TO_INTERACTIVE: { good: 3000, needsImprovement: 5000 },
  FIRST_CONTENTFUL_PAINT: { good: 1500, needsImprovement: 3000 },
  
  // Bundle Size Limits
  MAIN_BUNDLE_SIZE: 250 * 1024,      // 250KB
  CHUNK_SIZE_LIMIT: 100 * 1024,      // 100KB
  TOTAL_BUNDLE_SIZE: 500 * 1024      // 500KB
};

export const checkPerformanceBudget = (metric: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const budget = PERFORMANCE_BUDGETS[metric as keyof typeof PERFORMANCE_BUDGETS];
  if (!budget || typeof budget === 'number') return 'good';
  
  if (value <= budget.good) return 'good';
  if (value <= budget.needsImprovement) return 'needs-improvement';
  return 'poor';
};
```

### User Journey Tracking

#### User Interaction Analytics
```typescript
// src/utils/userJourneyTracker.ts
interface UserAction {
  action: string;
  component: string;
  page: string;
  timestamp: string;
  userId?: string;
  metadata?: Record<string, any>;
}

class UserJourneyTracker {
  private actions: UserAction[] = [];
  private maxActions = 100;

  trackAction(action: string, component: string, metadata?: Record<string, any>) {
    const userAction: UserAction = {
      action,
      component,
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUserId(),
      metadata
    };

    this.actions.push(userAction);
    
    // Keep only recent actions in memory
    if (this.actions.length > this.maxActions) {
      this.actions = this.actions.slice(-this.maxActions);
    }

    // Send to analytics asynchronously
    this.sendActionData(userAction);
  }

  private async sendActionData(action: UserAction) {
    try {
      await supabase.from('user_actions').insert(action);
    } catch (error) {
      console.error('Failed to track user action:', error);
    }
  }

  // Track specific EDGE app events
  trackAssessmentStarted(assessmentId: string) {
    this.trackAction('assessment_started', 'Assessment', { assessmentId });
  }

  trackAssessmentCompleted(assessmentId: string, completionTime: number) {
    this.trackAction('assessment_completed', 'Assessment', { 
      assessmentId, 
      completionTime 
    });
  }

  trackDevelopmentPlanCreated(planId: string) {
    this.trackAction('development_plan_created', 'DevelopmentPlan', { planId });
  }

  private getCurrentUserId(): string | undefined {
    // Get from auth context or storage
    return localStorage.getItem('userId') || undefined;
  }
}

export const userJourneyTracker = new UserJourneyTracker();
```

## Application Performance Monitoring

### React Performance Monitoring

#### Component Performance Profiler
```typescript
// src/utils/componentProfiler.tsx
import React, { Profiler, ProfilerOnRenderCallback } from 'react';

interface PerformanceData {
  componentId: string;
  phase: 'mount' | 'update';
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
}

const onRenderCallback: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  const performanceData: PerformanceData = {
    componentId: id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime
  };

  // Only log slow components in production
  if (actualDuration > 16 && process.env.NODE_ENV === 'production') {
    logComponentPerformance(performanceData);
  }
};

const logComponentPerformance = async (data: PerformanceData) => {
  try {
    await supabase.from('component_performance').insert({
      component_id: data.componentId,
      phase: data.phase,
      actual_duration: data.actualDuration,
      base_duration: data.baseDuration,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log component performance:', error);
  }
};

export const PerformanceProfiler: React.FC<{ id: string; children: React.ReactNode }> = ({ 
  id, 
  children 
}) => (
  <Profiler id={id} onRender={onRenderCallback}>
    {children}
  </Profiler>
);
```

#### Memory Usage Monitoring
```typescript
// src/utils/memoryMonitor.ts
class MemoryMonitor {
  private intervalId?: number;
  private monitoringInterval = 30000; // 30 seconds

  startMonitoring() {
    if ('memory' in performance) {
      this.intervalId = window.setInterval(() => {
        this.checkMemoryUsage();
      }, this.monitoringInterval);
    }
  }

  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private checkMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryData = {
        used_js_heap_size: memory.usedJSHeapSize,
        total_js_heap_size: memory.totalJSHeapSize,
        js_heap_size_limit: memory.jsHeapSizeLimit,
        timestamp: new Date().toISOString()
      };

      // Alert if memory usage is high
      const usagePercentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      if (usagePercentage > 80) {
        this.logMemoryAlert(memoryData, usagePercentage);
      }

      this.logMemoryUsage(memoryData);
    }
  }

  private async logMemoryUsage(data: any) {
    try {
      await supabase.from('memory_usage').insert(data);
    } catch (error) {
      console.error('Failed to log memory usage:', error);
    }
  }

  private logMemoryAlert(data: any, percentage: number) {
    console.warn(`High memory usage detected: ${percentage.toFixed(2)}%`);
    // Could trigger alert to monitoring system
  }
}

export const memoryMonitor = new MemoryMonitor();
```

### Error Tracking & Alerting

#### Comprehensive Error Handling
```typescript
// src/utils/errorTracker.ts
interface ErrorData {
  message: string;
  stack?: string;
  componentStack?: string;
  userId?: string;
  userRole?: string;
  page: string;
  userAgent: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  errorType: 'javascript' | 'react' | 'network' | 'auth' | 'database';
}

class ErrorTracker {
  constructor() {
    this.setupGlobalErrorHandlers();
  }

  private setupGlobalErrorHandlers() {
    // Catch unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        stack: event.error?.stack,
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        severity: 'high',
        errorType: 'javascript'
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        severity: 'high',
        errorType: 'javascript'
      });
    });
  }

  logError(errorData: ErrorData) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error tracked:', errorData);
    }

    // Send to monitoring service
    this.sendErrorToService(errorData);

    // Alert on critical errors
    if (errorData.severity === 'critical') {
      this.triggerCriticalAlert(errorData);
    }
  }

  private async sendErrorToService(errorData: ErrorData) {
    try {
      await supabase.from('error_logs').insert(errorData);
    } catch (error) {
      console.error('Failed to log error to service:', error);
    }
  }

  private triggerCriticalAlert(errorData: ErrorData) {
    // Could integrate with PagerDuty, Slack, etc.
    console.error('CRITICAL ERROR:', errorData);
  }

  // Specific error tracking methods
  trackAuthError(message: string, details?: any) {
    this.logError({
      message: `Authentication Error: ${message}`,
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      severity: 'high',
      errorType: 'auth'
    });
  }

  trackDatabaseError(message: string, query?: string) {
    this.logError({
      message: `Database Error: ${message}`,
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      severity: 'high',
      errorType: 'database'
    });
  }
}

export const errorTracker = new ErrorTracker();

// React Error Boundary
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ComponentType<any> },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    errorTracker.logError({
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      severity: 'high',
      errorType: 'react'
    });
  }

  render() {
    if (this.state.hasError) {
      return <this.props.fallback />;
    }

    return this.props.children;
  }
}
```

## Infrastructure Monitoring

### Database Performance Monitoring

#### Supabase Query Performance Tracking
```sql
-- Database monitoring views and functions
-- File: supabase/functions/database-monitoring.sql

-- Query performance monitoring
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows,
  100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC;

-- Table size monitoring
CREATE OR REPLACE VIEW table_sizes AS
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as size,
  pg_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage monitoring
CREATE OR REPLACE VIEW index_usage AS
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_tup_read,
  idx_tup_fetch,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
ORDER BY idx_tup_read DESC;

-- Database health check function
CREATE OR REPLACE FUNCTION database_health_check()
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  result jsonb;
  connection_count int;
  slow_query_count int;
  bloat_ratio numeric;
BEGIN
  -- Check connection count
  SELECT count(*) INTO connection_count FROM pg_stat_activity;
  
  -- Check slow queries
  SELECT count(*) INTO slow_query_count FROM slow_queries;
  
  -- Calculate table bloat (simplified)
  SELECT avg(100.0 * (1 - pg_relation_size(oid) / (8192.0 * relpages))) 
  INTO bloat_ratio
  FROM pg_class 
  WHERE relkind = 'r' AND relpages > 0;
  
  result := jsonb_build_object(
    'timestamp', now(),
    'status', CASE 
      WHEN connection_count > 80 OR slow_query_count > 10 OR bloat_ratio > 30 
      THEN 'warning' 
      ELSE 'healthy' 
    END,
    'metrics', jsonb_build_object(
      'active_connections', connection_count,
      'slow_queries', slow_query_count,
      'table_bloat_percentage', round(bloat_ratio, 2)
    )
  );
  
  RETURN result;
END;
$$;
```

#### Automated Performance Alerts
```typescript
// src/utils/databaseMonitor.ts
class DatabaseMonitor {
  private alertThresholds = {
    slowQueryTime: 1000,      // ms
    connectionCount: 80,       // percentage of max
    errorRate: 5,             // percentage
    responseTime: 500         // ms
  };

  async checkDatabaseHealth(): Promise<void> {
    try {
      const { data: healthData } = await supabase
        .rpc('database_health_check');

      if (healthData?.status === 'warning') {
        await this.triggerDatabaseAlert(healthData);
      }

      // Log metrics for trending
      await this.logDatabaseMetrics(healthData);
    } catch (error) {
      console.error('Database health check failed:', error);
      await this.triggerCriticalAlert('Database health check failed');
    }
  }

  private async triggerDatabaseAlert(healthData: any) {
    await supabase.from('alerts').insert({
      type: 'database_performance',
      severity: 'warning',
      message: 'Database performance degradation detected',
      data: healthData,
      timestamp: new Date().toISOString()
    });
  }

  private async logDatabaseMetrics(data: any) {
    await supabase.from('database_metrics').insert({
      metrics: data.metrics,
      timestamp: new Date().toISOString()
    });
  }

  private async triggerCriticalAlert(message: string) {
    await supabase.from('alerts').insert({
      type: 'database_critical',
      severity: 'critical',
      message,
      timestamp: new Date().toISOString()
    });
  }
}

export const databaseMonitor = new DatabaseMonitor();
```

## Business Metrics Monitoring

### Application-Specific KPIs

#### EDGE Performance Metrics
```typescript
// src/utils/businessMetrics.ts
interface BusinessMetrics {
  assessmentCompletionRate: number;
  developmentPlanSubmissionRate: number;
  managerReviewLatency: number;
  userEngagementScore: number;
  systemAdoptionRate: number;
}

class BusinessMetricsTracker {
  async calculateMetrics(): Promise<BusinessMetrics> {
    const [
      assessmentMetrics,
      developmentPlanMetrics,
      reviewMetrics,
      engagementMetrics,
      adoptionMetrics
    ] = await Promise.all([
      this.getAssessmentMetrics(),
      this.getDevelopmentPlanMetrics(),
      this.getReviewMetrics(),
      this.getEngagementMetrics(),
      this.getAdoptionMetrics()
    ]);

    return {
      assessmentCompletionRate: assessmentMetrics.completionRate,
      developmentPlanSubmissionRate: developmentPlanMetrics.submissionRate,
      managerReviewLatency: reviewMetrics.averageLatency,
      userEngagementScore: engagementMetrics.score,
      systemAdoptionRate: adoptionMetrics.rate
    };
  }

  private async getAssessmentMetrics() {
    const { data } = await supabase
      .from('assessments')
      .select('self_assessment_status, created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const total = data?.length || 0;
    const completed = data?.filter(a => a.self_assessment_status === 'submitted').length || 0;

    return {
      completionRate: total > 0 ? (completed / total) * 100 : 0
    };
  }

  private async getDevelopmentPlanMetrics() {
    const { data } = await supabase
      .from('development_plans')
      .select('status, created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const total = data?.length || 0;
    const submitted = data?.filter(p => p.status !== 'draft').length || 0;

    return {
      submissionRate: total > 0 ? (submitted / total) * 100 : 0
    };
  }

  private async getReviewMetrics() {
    const { data } = await supabase
      .from('assessments')
      .select('submitted_at, manager_reviewed_at')
      .not('submitted_at', 'is', null)
      .not('manager_reviewed_at', 'is', null);

    if (!data || data.length === 0) return { averageLatency: 0 };

    const latencies = data.map(assessment => {
      const submitted = new Date(assessment.submitted_at!);
      const reviewed = new Date(assessment.manager_reviewed_at!);
      return reviewed.getTime() - submitted.getTime();
    });

    const averageLatency = latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length;
    return { averageLatency: averageLatency / (1000 * 60 * 60 * 24) }; // Convert to days
  }

  private async getEngagementMetrics() {
    const { data } = await supabase
      .from('user_actions')
      .select('user_id, timestamp')
      .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const uniqueUsers = new Set(data?.map(action => action.user_id)).size;
    const totalActions = data?.length || 0;

    return {
      score: uniqueUsers * (totalActions / (uniqueUsers || 1))
    };
  }

  private async getAdoptionMetrics() {
    const { data: totalUsers } = await supabase
      .from('employees')
      .select('id')
      .eq('is_active', true);

    const { data: activeUsers } = await supabase
      .from('user_actions')
      .select('user_id')
      .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const total = totalUsers?.length || 0;
    const active = new Set(activeUsers?.map(u => u.user_id)).size;

    return {
      rate: total > 0 ? (active / total) * 100 : 0
    };
  }
}

export const businessMetricsTracker = new BusinessMetricsTracker();
```

## Logging Strategy

### Structured Logging Implementation

#### Centralized Logger
```typescript
// src/utils/logger.ts
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  component?: string;
}

class Logger {
  private logLevel: LogLevel;
  private sessionId: string;

  constructor() {
    this.logLevel = this.getLogLevel();
    this.sessionId = this.generateSessionId();
  }

  private getLogLevel(): LogLevel {
    const env = process.env.NODE_ENV;
    if (env === 'development') return LogLevel.DEBUG;
    if (env === 'staging') return LogLevel.INFO;
    return LogLevel.WARN; // production
  }

  debug(message: string, context?: Record<string, any>, component?: string) {
    this.log(LogLevel.DEBUG, message, context, component);
  }

  info(message: string, context?: Record<string, any>, component?: string) {
    this.log(LogLevel.INFO, message, context, component);
  }

  warn(message: string, context?: Record<string, any>, component?: string) {
    this.log(LogLevel.WARN, message, context, component);
  }

  error(message: string, context?: Record<string, any>, component?: string) {
    this.log(LogLevel.ERROR, message, context, component);
  }

  critical(message: string, context?: Record<string, any>, component?: string) {
    this.log(LogLevel.CRITICAL, message, context, component);
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, component?: string) {
    if (level < this.logLevel) return;

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.sanitizeContext(context),
      userId: this.getCurrentUserId(),
      sessionId: this.sessionId,
      component
    };

    // Console logging
    this.logToConsole(logEntry);

    // Remote logging
    if (level >= LogLevel.WARN) {
      this.logToRemote(logEntry);
    }
  }

  private sanitizeContext(context?: Record<string, any>): Record<string, any> | undefined {
    if (!context) return undefined;

    const sanitized = { ...context };
    
    // Remove sensitive data
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'auth'];
    sensitiveKeys.forEach(key => {
      if (key in sanitized) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private logToConsole(entry: LogEntry) {
    const methods = {
      [LogLevel.DEBUG]: console.debug,
      [LogLevel.INFO]: console.info,
      [LogLevel.WARN]: console.warn,
      [LogLevel.ERROR]: console.error,
      [LogLevel.CRITICAL]: console.error
    };

    methods[entry.level](`[${entry.timestamp}] ${entry.message}`, entry.context);
  }

  private async logToRemote(entry: LogEntry) {
    try {
      await supabase.from('application_logs').insert({
        timestamp: entry.timestamp,
        level: LogLevel[entry.level],
        message: entry.message,
        context: entry.context,
        user_id: entry.userId,
        session_id: entry.sessionId,
        component: entry.component
      });
    } catch (error) {
      console.error('Failed to send log to remote service:', error);
    }
  }

  private getCurrentUserId(): string | undefined {
    // Implement based on your auth system
    return localStorage.getItem('userId') || undefined;
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const logger = new Logger();
```

### Log Aggregation and Analysis

#### SQL Queries for Log Analysis
```sql
-- Log analysis queries
-- File: supabase/functions/log-analysis.sql

-- Error rate by component
CREATE OR REPLACE VIEW error_rates_by_component AS
SELECT 
  component,
  COUNT(*) as total_logs,
  COUNT(*) FILTER (WHERE level IN ('ERROR', 'CRITICAL')) as error_count,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE level IN ('ERROR', 'CRITICAL')) / COUNT(*),
    2
  ) as error_rate_percentage
FROM application_logs
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY component
ORDER BY error_rate_percentage DESC;

-- User activity patterns
CREATE OR REPLACE VIEW user_activity_patterns AS
SELECT 
  user_id,
  DATE_TRUNC('hour', timestamp) as hour_bucket,
  COUNT(*) as activity_count,
  COUNT(DISTINCT session_id) as session_count
FROM application_logs
WHERE user_id IS NOT NULL
  AND timestamp >= NOW() - INTERVAL '7 days'
GROUP BY user_id, hour_bucket
ORDER BY hour_bucket DESC;

-- Performance bottlenecks
CREATE OR REPLACE VIEW performance_bottlenecks AS
SELECT 
  component,
  message,
  COUNT(*) as occurrence_count,
  AVG((context->>'duration')::numeric) as avg_duration
FROM application_logs
WHERE level = 'WARN'
  AND context ? 'duration'
  AND timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY component, message
HAVING COUNT(*) > 10
ORDER BY avg_duration DESC;
```

## Alerting & Notification System

### Alert Configuration

#### Alert Rules Engine
```typescript
// src/utils/alertsEngine.ts
interface AlertRule {
  id: string;
  name: string;
  condition: (data: any) => boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cooldown: number; // minutes
  channels: ('email' | 'slack' | 'pagerduty')[];
}

class AlertsEngine {
  private alertRules: AlertRule[] = [
    {
      id: 'high_error_rate',
      name: 'High Error Rate',
      condition: (data) => data.errorRate > 5,
      severity: 'high',
      cooldown: 15,
      channels: ['email', 'slack']
    },
    {
      id: 'slow_performance',
      name: 'Slow Performance',
      condition: (data) => data.averageResponseTime > 2000,
      severity: 'medium',
      cooldown: 30,
      channels: ['slack']
    },
    {
      id: 'database_issues',
      name: 'Database Performance Issues',
      condition: (data) => data.slowQueryCount > 10,
      severity: 'high',
      cooldown: 10,
      channels: ['email', 'slack', 'pagerduty']
    },
    {
      id: 'critical_error',
      name: 'Critical Application Error',
      condition: (data) => data.criticalErrorCount > 0,
      severity: 'critical',
      cooldown: 0,
      channels: ['email', 'slack', 'pagerduty']
    }
  ];

  private lastAlertTimes: Map<string, number> = new Map();

  async evaluateAlerts(data: any) {
    for (const rule of this.alertRules) {
      if (rule.condition(data)) {
        await this.triggerAlert(rule, data);
      }
    }
  }

  private async triggerAlert(rule: AlertRule, data: any) {
    const now = Date.now();
    const lastAlert = this.lastAlertTimes.get(rule.id) || 0;
    const cooldownMs = rule.cooldown * 60 * 1000;

    if (now - lastAlert < cooldownMs) {
      return; // Still in cooldown period
    }

    this.lastAlertTimes.set(rule.id, now);

    const alert = {
      rule_id: rule.id,
      rule_name: rule.name,
      severity: rule.severity,
      data,
      timestamp: new Date().toISOString()
    };

    // Log alert
    await supabase.from('alerts').insert(alert);

    // Send notifications
    for (const channel of rule.channels) {
      await this.sendNotification(channel, alert);
    }
  }

  private async sendNotification(channel: string, alert: any) {
    switch (channel) {
      case 'email':
        await this.sendEmailAlert(alert);
        break;
      case 'slack':
        await this.sendSlackAlert(alert);
        break;
      case 'pagerduty':
        await this.sendPagerDutyAlert(alert);
        break;
    }
  }

  private async sendEmailAlert(alert: any) {
    // Implement email notification
    console.log('Email alert sent:', alert);
  }

  private async sendSlackAlert(alert: any) {
    const webhookUrl = process.env.REACT_APP_SLACK_WEBHOOK_URL;
    if (!webhookUrl) return;

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 ${alert.severity.toUpperCase()}: ${alert.rule_name}`,
          attachments: [{
            color: this.getSeverityColor(alert.severity),
            fields: [
              { title: 'Severity', value: alert.severity, short: true },
              { title: 'Timestamp', value: alert.timestamp, short: true },
              { title: 'Data', value: JSON.stringify(alert.data, null, 2), short: false }
            ]
          }]
        })
      });
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }

  private async sendPagerDutyAlert(alert: any) {
    // Implement PagerDuty integration
    console.log('PagerDuty alert sent:', alert);
  }

  private getSeverityColor(severity: string): string {
    const colors = {
      low: '#36a64f',
      medium: '#ff9500',
      high: '#ff0000',
      critical: '#990000'
    };
    return colors[severity as keyof typeof colors] || '#999999';
  }
}

export const alertsEngine = new AlertsEngine();
```

## Dashboard & Visualization

### Monitoring Dashboard Components

#### Real-time Metrics Dashboard
```typescript
// src/components/admin/MonitoringDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

interface DashboardMetrics {
  performanceMetrics: {
    responseTime: number[];
    errorRate: number[];
    throughput: number[];
  };
  businessMetrics: {
    activeUsers: number;
    assessmentCompletionRate: number;
    systemAdoptionRate: number;
  };
  systemHealth: {
    databaseHealth: 'healthy' | 'warning' | 'critical';
    memoryUsage: number;
    errorCount: number;
  };
}

export const MonitoringDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [performance, business, system] = await Promise.all([
          fetchPerformanceMetrics(timeRange),
          fetchBusinessMetrics(timeRange),
          fetchSystemHealth()
        ]);

        setMetrics({
          performanceMetrics: performance,
          businessMetrics: business,
          systemHealth: system
        });
      } catch (error) {
        logger.error('Failed to fetch dashboard metrics', { error });
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [timeRange]);

  if (!metrics) {
    return <div>Loading monitoring dashboard...</div>;
  }

  return (
    <div className="monitoring-dashboard">
      <div className="dashboard-header">
        <h1>System Monitoring</h1>
        <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Response Time</h3>
          <Line
            data={{
              labels: metrics.performanceMetrics.responseTime.map((_, i) => i),
              datasets: [{
                label: 'Response Time (ms)',
                data: metrics.performanceMetrics.responseTime,
                borderColor: '#3b82f6',
                tension: 0.1
              }]
            }}
          />
        </div>

        <div className="metric-card">
          <h3>Error Rate</h3>
          <Bar
            data={{
              labels: ['Errors', 'Success'],
              datasets: [{
                label: 'Request Status',
                data: [
                  metrics.performanceMetrics.errorRate[0],
                  100 - metrics.performanceMetrics.errorRate[0]
                ],
                backgroundColor: ['#ef4444', '#10b981']
              }]
            }}
          />
        </div>

        <div className="metric-card">
          <h3>System Health</h3>
          <div className={`health-indicator ${metrics.systemHealth.databaseHealth}`}>
            Database: {metrics.systemHealth.databaseHealth}
          </div>
          <div className="memory-usage">
            Memory Usage: {metrics.systemHealth.memoryUsage}%
          </div>
          <div className="error-count">
            Error Count: {metrics.systemHealth.errorCount}
          </div>
        </div>
      </div>
    </div>
  );
};
```

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Implement basic logging system
- [ ] Set up error tracking
- [ ] Configure Web Vitals monitoring
- [ ] Create database monitoring views

### Phase 2: Enhanced Monitoring (Week 3-4)
- [ ] Implement business metrics tracking
- [ ] Set up alerting system
- [ ] Create monitoring dashboard
- [ ] Configure automated health checks

### Phase 3: Advanced Analytics (Week 5-6)
- [ ] Implement user journey tracking
- [ ] Set up performance profiling
- [ ] Create custom alert rules
- [ ] Integrate with external monitoring services

### Phase 4: Optimization (Week 7-8)
- [ ] Fine-tune alert thresholds
- [ ] Optimize logging performance
- [ ] Create automated reporting
- [ ] Implement predictive analytics

This comprehensive monitoring and logging strategy will provide full visibility into the EDGE application's performance, reliability, and business metrics, enabling proactive issue resolution and continuous improvement.