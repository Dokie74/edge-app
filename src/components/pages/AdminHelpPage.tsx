import React, { useState } from 'react';
import TechnicalDocsPage from './TechnicalDocsPage';
import './HelpPages.css';

const AdminHelpPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    { id: 'getting-started', title: 'Administrator Overview', icon: '⚙️' },
    { id: 'employee-management', title: 'Employee Management', icon: '👥' },
    { id: 'review-cycles', title: 'Review Cycle Management', icon: '📋' },
    { id: 'system-analytics', title: 'System Analytics', icon: '📊' },
    { id: 'system-config', title: 'System Configuration', icon: '🔧' },
    { id: 'technical-docs', title: 'Technical Documentation', icon: '📚' },
    { id: 'monitoring', title: 'Monitoring & Logging', icon: '📈' },
    { id: 'security', title: 'Security & Compliance', icon: '🔒' },
    { id: 'troubleshooting', title: 'Troubleshooting', icon: '🚨' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'technical-docs':
        return <TechnicalDocsPage />;
      case 'getting-started':
        return (
          <div className="help-content">
            <h2>⚙️ Administrator Overview</h2>
            <p>As an EDGE administrator, you have comprehensive system access and responsibility for managing the entire performance management platform. This guide covers all administrative features, best practices, and system management procedures.</p>
            
            <h3>Admin Dashboard</h3>
            <p>Your administrator dashboard provides system-wide visibility:</p>
            
            <h4>System-Wide Statistics</h4>
            <ul>
              <li><strong>Total Employees</strong>: Count by role (employee/manager/admin)</li>
              <li><strong>Active Review Cycles</strong>: Current performance review periods</li>
              <li><strong>Overall Completion Rate</strong>: System-wide assessment progress</li>
              <li><strong>Development Plans</strong>: Organization-wide development activity</li>
              <li><strong>System Statistics</strong>: Performance metrics and usage data</li>
            </ul>

            <h4>Recent Activity</h4>
            <ul>
              <li><strong>User Actions</strong>: Latest system activity across all users</li>
              <li><strong>Performance Trends</strong>: Organization-wide performance indicators</li>
              <li><strong>System Health</strong>: Technical performance and status</li>
            </ul>

            <h3>Key Administrative Responsibilities</h3>
            <ol>
              <li><strong>User Management</strong>: Create, update, and manage employee accounts</li>
              <li><strong>Review Cycle Administration</strong>: Create and manage performance review periods</li>
              <li><strong>System Configuration</strong>: Configure platform settings and features</li>
              <li><strong>Data Integrity</strong>: Ensure system data quality and consistency</li>
              <li><strong>Security Oversight</strong>: Monitor system security and access controls</li>
              <li><strong>Performance Monitoring</strong>: Track system performance and usage</li>
            </ol>

            <div className="help-warning">
              <strong>⚠️ Administrator Responsibility:</strong> As an admin, you have access to sensitive employee data and system controls. Always follow security best practices and company data handling policies.
            </div>
          </div>
        );

      case 'employee-management':
        return (
          <div className="help-content">
            <h2>👥 Employee Management</h2>
            
            <h3>Creating New Employees</h3>
            <ol>
              <li><strong>Access Employee Management</strong>: From admin dashboard, click "Employee Management"</li>
              <li><strong>Click "Create New Employee"</strong>: Start the employee creation process</li>
              <li><strong>Fill Required Information</strong>:
                <ul>
                  <li><strong>Name</strong>: Full legal name</li>
                  <li><strong>Email</strong>: Primary work email (becomes username)</li>
                  <li><strong>Job Title</strong>: Current position</li>
                  <li><strong>Role</strong>: Employee, Manager, or Admin</li>
                  <li><strong>Manager</strong>: Select reporting manager (if applicable)</li>
                  <li><strong>Department</strong>: Organizational unit</li>
                  <li><strong>Start Date</strong>: Employment begin date</li>
                  <li><strong>Temporary Password</strong>: Initial login credentials</li>
                </ul>
              </li>
            </ol>

            <h3>Role Assignments</h3>
            <ul>
              <li><strong>Employee</strong>: Basic access to personal assessments and development</li>
              <li><strong>Manager</strong>: Team management capabilities + employee features</li>
              <li><strong>Admin</strong>: Full system administration + all other features</li>
            </ul>

            <h3>Managing Existing Employees</h3>
            
            <h4>Employee Search and Filtering</h4>
            <ul>
              <li>Search by name, email, or department</li>
              <li>Filter by role, manager, or status</li>
              <li>Sort by various criteria</li>
              <li>Export employee lists</li>
            </ul>

            <h4>Employee Profile Management</h4>
            <ul>
              <li><strong>View Details</strong>: Comprehensive employee information</li>
              <li><strong>Edit Information</strong>: Update contact details, roles, reporting relationships</li>
              <li><strong>Role Changes</strong>: Promote employees to manager or admin roles</li>
              <li><strong>Status Management</strong>: Activate/deactivate accounts</li>
              <li><strong>Password Reset</strong>: Generate new temporary passwords</li>
            </ul>

            <h3>Bulk Operations</h3>
            <ul>
              <li><strong>Import Employees</strong>: Upload CSV files for mass employee creation</li>
              <li><strong>Export Data</strong>: Download employee information for reporting</li>
              <li><strong>Bulk Updates</strong>: Change multiple employee records simultaneously</li>
            </ul>

            <div className="help-tip">
              <strong>💡 Best Practice:</strong> Always verify reporting relationships when creating or updating employees. Incorrect manager assignments can affect review cycles and access permissions.
            </div>
          </div>
        );

      case 'review-cycles':
        return (
          <div className="help-content">
            <h2>📋 Review Cycle Management</h2>
            
            <h3>Creating Review Cycles</h3>
            <ol>
              <li><strong>Access Cycle Management</strong>: From admin dashboard, click "Review Cycles"</li>
              <li><strong>Click "Create New Review Cycle"</strong>: Start the cycle creation process</li>
              <li><strong>Configure Cycle Settings</strong>:
                <ul>
                  <li><strong>Name</strong>: Descriptive cycle name (e.g., "Q4 2024 Performance Review")</li>
                  <li><strong>Description</strong>: Purpose and scope of the review</li>
                  <li><strong>Start Date</strong>: When employees can begin self-assessments</li>
                  <li><strong>End Date</strong>: Final deadline for all reviews</li>
                  <li><strong>Participants</strong>: Select departments or individuals included</li>
                  <li><strong>Assessment Template</strong>: Choose review form template</li>
                </ul>
              </li>
            </ol>

            <h3>Cycle Participants</h3>
            <ul>
              <li><strong>All Employees</strong>: Include entire organization</li>
              <li><strong>By Department</strong>: Select specific departments</li>
              <li><strong>By Manager</strong>: Include specific teams</li>
              <li><strong>Individual Selection</strong>: Choose specific employees</li>
            </ul>

            <h3>Cycle Lifecycle Management</h3>
            
            <h4>Cycle Status Management</h4>
            <ul>
              <li><strong>Upcoming</strong>: Cycle created but not yet active</li>
              <li><strong>Active</strong>: Cycle open for assessments and reviews</li>
              <li><strong>Closed</strong>: Cycle completed, read-only status</li>
            </ul>

            <h4>Cycle Operations</h4>
            <ul>
              <li><strong>Activate Cycle</strong>: Open cycle for employee participation</li>
              <li><strong>Monitor Progress</strong>: Track completion rates and pending reviews</li>
              <li><strong>Send Reminders</strong>: Notify participants of deadlines</li>
              <li><strong>Extend Deadlines</strong>: Modify cycle dates if needed</li>
              <li><strong>Close Cycle</strong>: Finalize and lock all assessments</li>
            </ul>

            <h3>Progress Monitoring</h3>
            <ul>
              <li><strong>Self-Assessment Progress</strong>: Employee completion rates</li>
              <li><strong>Manager Review Progress</strong>: Manager completion rates</li>
              <li><strong>Overall Cycle Status</strong>: System-wide progress indicators</li>
              <li><strong>Bottleneck Identification</strong>: Find areas needing attention</li>
            </ul>

            <div className="help-example">
              <h4>📊 Example Cycle Timeline:</h4>
              <div className="example-box">
                <p><strong>Week 1-2</strong>: Cycle announcement and employee self-assessments</p>
                <p><strong>Week 3-4</strong>: Manager reviews and feedback</p>
                <p><strong>Week 5</strong>: Review meetings and goal setting</p>
                <p><strong>Week 6</strong>: Development plan submissions</p>
              </div>
            </div>
          </div>
        );

      case 'system-analytics':
        return (
          <div className="help-content">
            <h2>📊 System Analytics & Reporting</h2>
            
            <h3>Key Performance Indicators</h3>
            <ul>
              <li><strong>Participation Rates</strong>: Engagement across the organization</li>
              <li><strong>Completion Rates</strong>: Assessment and review timeliness</li>
              <li><strong>Performance Trends</strong>: Organization performance over time</li>
              <li><strong>Development Activity</strong>: Skills being developed across teams</li>
              <li><strong>Goal Achievement</strong>: Progress on organizational objectives</li>
            </ul>

            <h3>Advanced Analytics</h3>
            
            <h4>Performance Analysis</h4>
            <ul>
              <li><strong>Department Comparisons</strong>: Cross-department performance metrics</li>
              <li><strong>Manager Effectiveness</strong>: Manager review quality and timeliness</li>
              <li><strong>Employee Engagement</strong>: Participation and satisfaction indicators</li>
              <li><strong>Trend Analysis</strong>: Multi-period performance comparisons</li>
            </ul>

            <h4>Predictive Analytics</h4>
            <ul>
              <li><strong>Risk Indicators</strong>: Identify potential performance issues</li>
              <li><strong>Development Gaps</strong>: Skill shortage identification</li>
              <li><strong>Succession Planning</strong>: Leadership pipeline analysis</li>
              <li><strong>Retention Factors</strong>: Employee engagement predictors</li>
            </ul>

            <h3>Reporting Capabilities</h3>
            
            <h4>Standard Reports</h4>
            <ul>
              <li><strong>Employee Performance Summary</strong>: Individual and aggregate performance</li>
              <li><strong>Department Performance</strong>: Team-level analytics</li>
              <li><strong>Review Cycle Results</strong>: Cycle completion and outcomes</li>
              <li><strong>Development Plan Status</strong>: Organization-wide development activity</li>
              <li><strong>Manager Effectiveness</strong>: Manager performance in reviews</li>
            </ul>

            <h4>Custom Reporting</h4>
            <ul>
              <li><strong>Ad-Hoc Queries</strong>: Create custom data views</li>
              <li><strong>Export Capabilities</strong>: Download data for external analysis</li>
              <li><strong>Scheduled Reports</strong>: Automated report generation</li>
              <li><strong>Dashboard Customization</strong>: Tailor admin dashboard views</li>
            </ul>
          </div>
        );

      case 'system-config':
        return (
          <div className="help-content">
            <h2>🔧 System Configuration</h2>
            
            <h3>General System Settings</h3>
            <ul>
              <li><strong>Notification Preferences</strong>: System-wide notification rules</li>
              <li><strong>Email Templates</strong>: Customize automated communications</li>
              <li><strong>Assessment Templates</strong>: Create and modify review forms</li>
              <li><strong>UI Customization</strong>: Company branding and appearance</li>
              <li><strong>Feature Toggles</strong>: Enable/disable system features</li>
            </ul>

            <h3>Security Configuration</h3>
            <ul>
              <li><strong>Password Policies</strong>: Set organization password requirements</li>
              <li><strong>Session Timeouts</strong>: Configure automatic logout timing</li>
              <li><strong>IP Restrictions</strong>: Limit access by location (if needed)</li>
              <li><strong>Audit Logging</strong>: Configure system activity tracking</li>
              <li><strong>Data Retention</strong>: Set data archival and deletion policies</li>
            </ul>

            <h3>Integration Management</h3>
            <ul>
              <li><strong>HRIS Integration</strong>: Connect with HR information systems</li>
              <li><strong>SSO Configuration</strong>: Single sign-on setup and management</li>
              <li><strong>Directory Services</strong>: Active Directory or LDAP integration</li>
              <li><strong>API Management</strong>: External system connections</li>
              <li><strong>Data Synchronization</strong>: Automated data updates</li>
            </ul>

            <div className="help-warning">
              <strong>⚠️ Configuration Warning:</strong> Changes to system configuration can affect all users. Always test configuration changes in a staging environment before applying to production.
            </div>
          </div>
        );

      case 'technical-docs':
        return (
          <div className="help-content">
            <h2>📚 Technical Documentation</h2>
            
            <h3>Developer Resources</h3>
            <ul>
              <li><strong>API Documentation</strong>: Complete reference for all system APIs</li>
              <li><strong>Database Schema</strong>: Table structures and relationships</li>
              <li><strong>Development Setup</strong>: Local environment configuration</li>
              <li><strong>Deployment Guide</strong>: Production deployment procedures</li>
            </ul>

            <h3>API Documentation</h3>
            <p>Access comprehensive API documentation covering:</p>
            <ul>
              <li><strong>Authentication Endpoints</strong>: User login and session management</li>
              <li><strong>Employee Management APIs</strong>: CRUD operations for employee data</li>
              <li><strong>Assessment APIs</strong>: Performance review data management</li>
              <li><strong>Analytics APIs</strong>: Reporting and metrics endpoints</li>
              <li><strong>Admin APIs</strong>: System administration functions</li>
            </ul>

            <h3>Database Information</h3>
            <ul>
              <li><strong>Schema Overview</strong>: Table relationships and constraints</li>
              <li><strong>Performance Optimization</strong>: Query optimization and indexing</li>
              <li><strong>Backup Procedures</strong>: Data backup and recovery processes</li>
              <li><strong>Migration Scripts</strong>: Database schema update procedures</li>
            </ul>

            <h3>System Architecture</h3>
            <ul>
              <li><strong>Frontend Architecture</strong>: React component structure</li>
              <li><strong>Backend Services</strong>: Supabase configuration and functions</li>
              <li><strong>Security Model</strong>: Authentication and authorization flows</li>
              <li><strong>Performance Considerations</strong>: Optimization strategies</li>
            </ul>

            <div className="help-tip">
              <strong>💡 Developer Tip:</strong> The API documentation includes interactive examples and test endpoints for easier integration and troubleshooting.
            </div>
          </div>
        );

      case 'monitoring':
        return (
          <div className="help-content">
            <h2>📈 Monitoring & Logging</h2>
            
            <h3>System Health Monitoring</h3>
            <ul>
              <li><strong>Database Performance</strong>: Query performance and connection health</li>
              <li><strong>Application Performance</strong>: Response times and error rates</li>
              <li><strong>User Activity</strong>: Login patterns and feature usage</li>
              <li><strong>System Resources</strong>: Memory usage and processing capacity</li>
            </ul>

            <h3>Real-Time Monitoring</h3>
            <ul>
              <li><strong>Active Users</strong>: Current system usage</li>
              <li><strong>Error Tracking</strong>: Real-time error monitoring and alerts</li>
              <li><strong>Performance Metrics</strong>: Response time and throughput monitoring</li>
              <li><strong>Security Events</strong>: Login attempts and access patterns</li>
            </ul>

            <h3>Logging Strategy</h3>
            <ul>
              <li><strong>Application Logs</strong>: User actions and system events</li>
              <li><strong>Error Logs</strong>: Detailed error information and stack traces</li>
              <li><strong>Audit Logs</strong>: Security and compliance tracking</li>
              <li><strong>Performance Logs</strong>: System performance metrics</li>
            </ul>

            <h3>Alerting System</h3>
            <ul>
              <li><strong>Performance Alerts</strong>: Slow response times and high error rates</li>
              <li><strong>Security Alerts</strong>: Suspicious login activity</li>
              <li><strong>System Alerts</strong>: Database connectivity and resource issues</li>
              <li><strong>Business Alerts</strong>: Review cycle deadlines and completion rates</li>
            </ul>

            <div className="help-example">
              <h4>🚨 Example Alert Scenarios:</h4>
              <div className="example-box">
                <p><strong>Performance Alert:</strong> Response time &gt; 2 seconds for 5 consecutive minutes</p>
                <p><strong>Security Alert:</strong> More than 5 failed login attempts from same IP</p>
                <p><strong>Business Alert:</strong> Review cycle completion rate below 50% with 3 days remaining</p>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="help-content">
            <h2>🔒 Security & Compliance</h2>
            
            <h3>Access Control</h3>
            <ul>
              <li><strong>Role-Based Permissions</strong>: Enforce proper access levels</li>
              <li><strong>Account Status Management</strong>: Enable/disable user accounts</li>
              <li><strong>Session Management</strong>: Monitor active user sessions</li>
              <li><strong>Login Monitoring</strong>: Track authentication events</li>
            </ul>

            <h3>Data Privacy</h3>
            <ul>
              <li><strong>Data Classification</strong>: Identify and protect sensitive information</li>
              <li><strong>Access Controls</strong>: Limit data access to authorized personnel</li>
              <li><strong>Consent Management</strong>: Handle employee data consent</li>
              <li><strong>Data Subject Rights</strong>: Manage data access and deletion requests</li>
            </ul>

            <h3>Compliance Features</h3>
            <ul>
              <li><strong>Audit Trails</strong>: Maintain comprehensive activity logs</li>
              <li><strong>Compliance Reports</strong>: Generate reports for regulatory requirements</li>
              <li><strong>Data Inventory</strong>: Catalog all data types and locations</li>
              <li><strong>Risk Assessments</strong>: Regular privacy impact assessments</li>
            </ul>

            <h3>Security Best Practices</h3>
            <ol>
              <li><strong>Regular Monitoring</strong>: Check system health and security daily</li>
              <li><strong>Access Reviews</strong>: Regularly audit user permissions</li>
              <li><strong>Data Quality</strong>: Regularly audit and clean system data</li>
              <li><strong>Security Updates</strong>: Keep system software current</li>
              <li><strong>Backup Verification</strong>: Regularly test backup and recovery procedures</li>
            </ol>

            <div className="help-warning">
              <strong>⚠️ Security Alert:</strong> Immediately report any suspected security incidents to the IT security team. Do not attempt to investigate security breaches independently.
            </div>
          </div>
        );

      case 'troubleshooting':
        return (
          <div className="help-content">
            <h2>🚨 Troubleshooting Common Issues</h2>
            
            <div className="troubleshooting-item">
              <h4>❓ "Users can't log in"</h4>
              <ul>
                <li>Check user account status (active/inactive)</li>
                <li>Verify email address is correct in the system</li>
                <li>Reset user password if needed</li>
                <li>Check for system-wide authentication issues</li>
                <li>Verify Supabase connection status</li>
              </ul>
            </div>

            <div className="troubleshooting-item">
              <h4>❓ "Performance is slow"</h4>
              <ul>
                <li>Check database query performance</li>
                <li>Monitor active user count</li>
                <li>Review error logs for issues</li>
                <li>Check network connectivity</li>
                <li>Monitor system resource usage</li>
              </ul>
            </div>

            <div className="troubleshooting-item">
              <h4>❓ "Data not appearing correctly"</h4>
              <ul>
                <li>Check data synchronization status</li>
                <li>Verify user permissions and access levels</li>
                <li>Review recent data imports or updates</li>
                <li>Check for database connectivity issues</li>
                <li>Validate data integrity checks</li>
              </ul>
            </div>

            <div className="troubleshooting-item">
              <h4>❓ "Review cycles not working"</h4>
              <ul>
                <li>Verify cycle dates and status</li>
                <li>Check participant selection criteria</li>
                <li>Ensure manager-employee relationships are correct</li>
                <li>Review cycle configuration settings</li>
                <li>Check notification settings</li>
              </ul>
            </div>

            <div className="troubleshooting-item">
              <h4>❓ "Reports showing incorrect data"</h4>
              <ul>
                <li>Verify report date ranges</li>
                <li>Check data filters and selection criteria</li>
                <li>Ensure data has been properly submitted</li>
                <li>Review calculation logic</li>
                <li>Check for data corruption issues</li>
              </ul>
            </div>

            <h3>Emergency Procedures</h3>
            
            <h4>System Outages</h4>
            <ol>
              <li><strong>Incident Response</strong>: Follow established incident response procedures</li>
              <li><strong>User Communication</strong>: Notify users of outages and expected resolution</li>
              <li><strong>Data Protection</strong>: Ensure data integrity during outages</li>
              <li><strong>Recovery Procedures</strong>: Execute recovery plans systematically</li>
              <li><strong>Post-Incident Review</strong>: Analyze and improve incident response</li>
            </ol>

            <h4>Data Security Incidents</h4>
            <ol>
              <li><strong>Immediate Response</strong>: Contain and assess the incident</li>
              <li><strong>Stakeholder Notification</strong>: Inform appropriate parties promptly</li>
              <li><strong>Investigation</strong>: Conduct thorough incident investigation</li>
              <li><strong>Remediation</strong>: Implement fixes and improvements</li>
              <li><strong>Documentation</strong>: Maintain detailed incident records</li>
            </ol>

            <div className="help-contact">
              <h4>📞 Emergency Contacts</h4>
              <ul>
                <li><strong>IT Security Team</strong>: security@company.com</li>
                <li><strong>Database Administrator</strong>: dba@company.com</li>
                <li><strong>System Administrator</strong>: sysadmin@company.com</li>
                <li><strong>Incident Response</strong>: ext. 911 (internal emergency)</li>
              </ul>
            </div>
          </div>
        );

      default:
        return <div>Select a section from the menu</div>;
    }
  };

  return (
    <div className="help-page admin-help">
      <div className="help-header">
        <h1>Administrator Help Center</h1>
        <p>Comprehensive system administration guide for EDGE platform management</p>
      </div>

      <div className="help-layout">
        <nav className="help-sidebar">
          <h3>Admin Topics</h3>
          <ul className="help-menu">
            {sections.map(section => (
              <li key={section.id}>
                <button
                  className={`help-menu-item ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <span className="help-icon">{section.icon}</span>
                  {section.title}
                </button>
              </li>
            ))}
          </ul>
          
          <div className="quick-links">
            <h4>Quick Links</h4>
            <ul>
              <li><button onClick={() => setActiveSection('technical-docs')} className="link-button">📚 Technical Documentation</button></li>
              <li><a href="/docs/API_DOCUMENTATION.md" target="_blank">📄 API Documentation</a></li>
              <li><a href="/docs/DEVELOPER_SETUP_GUIDE.md" target="_blank">⚙️ Developer Guide</a></li>
              <li><a href="/docs/DEPLOYMENT_CICD_GUIDE.md" target="_blank">🚀 Deployment Guide</a></li>
              <li><a href="/docs/MONITORING_LOGGING_STRATEGY.md" target="_blank">📊 Monitoring Guide</a></li>
            </ul>
          </div>
        </nav>

        <main className="help-main">
          {renderContent()}
        </main>
      </div>

    </div>
  );
};

export default AdminHelpPage;