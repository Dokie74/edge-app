import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts';
import './HelpPages.css';

const TechnicalDocsPage: React.FC = () => {
  const { userRole } = useApp();
  const [activeDoc, setActiveDoc] = useState('api');
  const [docContent, setDocContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only allow admin access
  if (userRole !== 'admin') {
    return (
      <div className="p-8">
        <div className="bg-red-900 border border-red-700 rounded-lg p-6 text-center">
          <h2 className="text-red-200 font-bold text-xl mb-2">Access Denied</h2>
          <p className="text-red-300">Technical documentation is only available to administrators.</p>
        </div>
      </div>
    );
  }

  const docs = [
    { 
      id: 'api', 
      title: 'API Documentation', 
      file: 'API_DOCUMENTATION.md',
      icon: '📚',
      description: 'Complete API reference and endpoint documentation'
    },
    { 
      id: 'dev-setup', 
      title: 'Developer Setup Guide', 
      file: 'DEVELOPER_SETUP_GUIDE.md',
      icon: '⚙️',
      description: 'Environment setup and development workflow'
    },
    { 
      id: 'deployment', 
      title: 'Deployment & CI/CD', 
      file: 'DEPLOYMENT_CICD_GUIDE.md',
      icon: '🚀',
      description: 'Production deployment and pipeline configuration'
    },
    { 
      id: 'monitoring', 
      title: 'Monitoring & Logging', 
      file: 'MONITORING_LOGGING_STRATEGY.md',
      icon: '📊',
      description: 'System monitoring, alerting, and log management'
    }
  ];

  useEffect(() => {
    loadDocumentation(activeDoc);
  }, [activeDoc]);

  const loadDocumentation = async (docId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const doc = docs.find(d => d.id === docId);
      if (!doc) {
        throw new Error('Documentation not found');
      }

      // In a real implementation, you would fetch from your docs API or static files
      // For now, we'll show a placeholder indicating the content would be loaded
      const response = await fetch(`/docs/${doc.file}`);
      
      if (!response.ok) {
        // If file doesn't exist, show structured content instead
        setDocContent(generateDocumentationContent(docId));
      } else {
        const content = await response.text();
        setDocContent(content);
      }
    } catch (err) {
      console.error('Error loading documentation:', err);
      // Show structured content as fallback
      setDocContent(generateDocumentationContent(docId));
    } finally {
      setLoading(false);
    }
  };

  const generateDocumentationContent = (docId: string) => {
    switch (docId) {
      case 'api':
        return `# EDGE Application API Documentation

## Overview
The EDGE (Employee Development & Growth Engine) application provides a comprehensive performance management system with role-based access for employees, managers, and administrators.

## Authentication
The application uses Supabase Authentication with the following user roles:
- **Employee**: Basic access to personal assessments and development plans
- **Manager**: Team management and review capabilities  
- **Admin**: Full system administration

## Core Data Models

### User
\`\`\`typescript
interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}
\`\`\`

### Employee
\`\`\`typescript
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
\`\`\`

## Service Endpoints

### Authentication Service
- \`getCurrentUser()\`: Returns the currently authenticated user
- \`signIn(email, password)\`: Authenticates a user with email and password
- \`signOut()\`: Signs out the current user

### Assessment Service
- \`getUserAssessments(employeeId)\`: Retrieves all assessments for a specific employee
- \`submitSelfAssessment(assessmentId, data)\`: Submits self-assessment data
- \`submitManagerReview(assessmentId, reviewData)\`: Submits manager review for an assessment

### Admin Service
- \`getDashboardStats()\`: Retrieves comprehensive dashboard statistics
- \`createEmployee(employeeData)\`: Creates a new employee record
- \`updateEmployee(employeeId, updates)\`: Updates an existing employee record

For complete API documentation, refer to the files in the /docs directory.`;

      case 'dev-setup':
        return `# EDGE Application Developer Setup Guide

## Prerequisites
Before setting up the EDGE application, ensure you have the following installed:

### Required Software
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git**
- **VS Code** (recommended)

## Project Setup

### 1. Clone the Repository
\`\`\`bash
git clone [repository-url]
cd edgeapp
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Environment Configuration
Create \`.env.local\` file:
\`\`\`env
REACT_APP_SUPABASE_URL=your_supabase_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
REACT_APP_ENVIRONMENT=development
\`\`\`

### 4. Start Development Server
\`\`\`bash
npm start
\`\`\`

## Development Workflow
- Use TypeScript for new components
- Follow the existing component structure
- Run tests before committing: \`npm test\`
- Use ESLint and Prettier for code formatting

For detailed setup instructions, refer to the complete developer guide in /docs.`;

      case 'deployment':
        return `# EDGE Application Deployment & CI/CD Guide

## Deployment Architecture

### Production Environment
- **CDN**: CloudFlare for static assets and global cache
- **Frontend**: React SPA deployed on Vercel/Netlify
- **Backend**: Supabase for database and authentication
- **Monitoring**: Application performance monitoring

### CI/CD Pipeline
The application uses GitHub Actions for automated deployment:

\`\`\`yaml
name: Deploy EDGE Application

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm run test:ci
\`\`\`

### Environment Variables
- \`REACT_APP_SUPABASE_URL\`: Supabase project URL
- \`REACT_APP_SUPABASE_ANON_KEY\`: Supabase anonymous key
- \`REACT_APP_ENVIRONMENT\`: Application environment

### Deployment Process
1. Code changes pushed to repository
2. Automated tests run
3. Security scanning performed
4. Build artifacts created
5. Deployment to staging/production
6. Health checks performed
7. Notifications sent

For complete deployment configuration, refer to the deployment guide in /docs.`;

      case 'monitoring':
        return `# EDGE Application Monitoring & Logging Strategy

## Monitoring Architecture

### Multi-Layer Monitoring
1. **User Experience Layer**: Real User Monitoring (RUM), Core Web Vitals
2. **Application Layer**: React Performance, Error Tracking
3. **Infrastructure Layer**: Database Performance, API Monitoring
4. **Business Logic Layer**: Assessment Completion Rates, User Engagement

### Key Metrics
- **Performance**: Response times, throughput, error rates
- **Business**: Assessment completion rates, user engagement, system adoption
- **Security**: Login attempts, access patterns, failed authentications
- **System**: Database performance, memory usage, resource utilization

### Real-Time Monitoring
- Active user sessions
- Error tracking and alerting
- Performance metrics dashboard
- Security event monitoring

### Logging Strategy
- **Application Logs**: User actions and system events
- **Error Logs**: Detailed error information and stack traces
- **Audit Logs**: Security and compliance tracking
- **Performance Logs**: System performance metrics

### Alerting System
- Performance alerts for slow response times
- Security alerts for suspicious activity
- System alerts for database connectivity issues
- Business alerts for review cycle deadlines

### Dashboard Features
- Real-time metrics visualization
- Custom reporting capabilities
- Alert management interface
- Performance trend analysis

For detailed monitoring setup and configuration, refer to the monitoring strategy guide in /docs.`;

      default:
        return 'Documentation not available.';
    }
  };

  const downloadDoc = (docId: string) => {
    const doc = docs.find(d => d.id === docId);
    if (!doc) return;

    const element = document.createElement('a');
    const file = new Blob([docContent], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = doc.file;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="tech-docs-page">
      <div className="help-header">
        <h1>Technical Documentation</h1>
        <p>Administrative access to system documentation and guides</p>
      </div>

      <div className="tech-docs-layout">
        <nav className="tech-docs-sidebar">
          <h3>Documentation</h3>
          <ul className="tech-docs-menu">
            {docs.map(doc => (
              <li key={doc.id}>
                <button
                  className={`tech-docs-menu-item ${activeDoc === doc.id ? 'active' : ''}`}
                  onClick={() => setActiveDoc(doc.id)}
                >
                  <span className="doc-icon">{doc.icon}</span>
                  <div className="doc-info">
                    <div className="doc-title">{doc.title}</div>
                    <div className="doc-description">{doc.description}</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="tech-docs-main">
          <div className="tech-docs-toolbar">
            <h2>{docs.find(d => d.id === activeDoc)?.title}</h2>
            <button
              onClick={() => downloadDoc(activeDoc)}
              className="download-btn"
              disabled={loading}
            >
              📄 Download
            </button>
          </div>

          <div className="tech-docs-content">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading documentation...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p>Error loading documentation: {error}</p>
                <button onClick={() => loadDocumentation(activeDoc)}>Retry</button>
              </div>
            ) : (
              <div className="markdown-content">
                <pre>{docContent}</pre>
              </div>
            )}
          </div>
        </main>
      </div>

    </div>
  );
};

export default TechnicalDocsPage;