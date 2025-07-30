import React, { useState } from 'react';
import './HelpPages.css';

const EmployeeHelpPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: '🚀' },
    { id: 'assessments', title: 'Performance Assessments', icon: '📊' },
    { id: 'development-plans', title: 'Development Plans', icon: '📈' },
    { id: 'navigation', title: 'Navigation & Features', icon: '🧭' },
    { id: 'feedback', title: 'Feedback & Recognition', icon: '⭐' },
    { id: 'troubleshooting', title: 'Troubleshooting', icon: '🔧' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'getting-started':
        return (
          <div className="help-content">
            <h2>🚀 Welcome to EDGE</h2>
            <p>EDGE (Employee Development & Growth Engine) is your comprehensive performance management platform. This guide will help you navigate the system and make the most of your professional development opportunities.</p>
            
            <h3>Your Dashboard</h3>
            <p>After logging in, you'll see your employee dashboard with:</p>
            <ul>
              <li><strong>Welcome Message</strong>: Personal greeting with your name</li>
              <li><strong>Active Assessments</strong>: Current performance reviews requiring your attention</li>
              <li><strong>Development Plans</strong>: Your submitted and in-progress development plans</li>
              <li><strong>Recent Activity</strong>: Latest updates and notifications</li>
              <li><strong>Quick Actions</strong>: Common tasks you can perform</li>
            </ul>

            <div className="help-tip">
              <strong>💡 Tip:</strong> Check your dashboard regularly for updates and new assignments from your manager.
            </div>
          </div>
        );

      case 'assessments':
        return (
          <div className="help-content">
            <h2>📊 Performance Assessments</h2>
            
            <h3>Starting an Assessment</h3>
            <ol>
              <li>Look for "Active Assessments" on your dashboard</li>
              <li>Click on any assessment that shows "Not Started" or "In Progress"</li>
              <li>Review the assessment instructions carefully</li>
            </ol>

            <h3>Completing Your Self-Assessment</h3>
            <ol>
              <li><strong>Read Each Question Carefully</strong>: Take time to understand what's being asked</li>
              <li><strong>Provide Detailed Responses</strong>: Use specific examples and achievements</li>
              <li><strong>Rate Yourself Honestly</strong>: Use the rating scale provided (typically 1-5)</li>
              <li><strong>Save Progress</strong>: Click "Save Draft" to save your work as you go</li>
              <li><strong>Review Before Submitting</strong>: Double-check all responses</li>
              <li><strong>Submit</strong>: Click "Submit Assessment" when complete</li>
            </ol>

            <h3>Assessment Sections</h3>
            <ul>
              <li><strong>Job Performance</strong>: How well you've met your role requirements</li>
              <li><strong>Goal Achievement</strong>: Progress on previously set objectives</li>
              <li><strong>Core Competencies</strong>: Skills relevant to your position</li>
              <li><strong>Development Areas</strong>: Areas where you'd like to grow</li>
              <li><strong>Achievements</strong>: Notable accomplishments during the review period</li>
              <li><strong>Challenges</strong>: Obstacles you've faced and how you addressed them</li>
            </ul>

            <div className="help-example">
              <h4>💡 Example Self-Assessment Response:</h4>
              <p><strong>Achievement:</strong> "I successfully led the Q3 client onboarding project, improving our process efficiency by 25% and reducing client setup time from 2 weeks to 10 days. This resulted in higher client satisfaction scores and faster revenue recognition."</p>
            </div>

            <div className="help-warning">
              <strong>⚠️ Important:</strong> Once submitted, your assessment moves to "Waiting for Manager Review" and cannot be edited. Make sure to review thoroughly before submitting.
            </div>
          </div>
        );

      case 'development-plans':
        return (
          <div className="help-content">
            <h2>📈 Development Plans</h2>
            
            <h3>Creating a Development Plan</h3>
            <ol>
              <li>From your dashboard, click "My Development Center"</li>
              <li>Click "Create New Development Plan"</li>
              <li>Fill out all required sections</li>
            </ol>

            <h3>Development Plan Components</h3>
            <ul>
              <li><strong>Title</strong>: Clear, descriptive name for your plan</li>
              <li><strong>Description</strong>: Overview of what you want to achieve</li>
              <li><strong>Goals</strong>: Specific, measurable objectives</li>
              <li><strong>Skills to Develop</strong>: Areas you want to improve or learn</li>
              <li><strong>Timeline</strong>: When you plan to achieve these goals</li>
              <li><strong>Action Steps</strong>: Specific activities you'll undertake</li>
            </ul>

            <h3>Writing SMART Goals</h3>
            <p>Make your goals <strong>S</strong>pecific, <strong>M</strong>easurable, <strong>A</strong>chievable, <strong>R</strong>elevant, and <strong>T</strong>ime-bound.</p>

            <div className="help-example">
              <h4>📝 Example Development Plan:</h4>
              <div className="example-box">
                <p><strong>Title:</strong> "Improve Project Management Skills"</p>
                <p><strong>Description:</strong> "Develop project management competencies to lead larger initiatives and advance toward a senior role."</p>
                <p><strong>Goals:</strong></p>
                <ul>
                  <li>Complete PMP certification within 6 months</li>
                  <li>Successfully lead 2 cross-functional projects</li>
                  <li>Implement project tracking tools for my team</li>
                </ul>
                <p><strong>Timeline:</strong> 6-12 months</p>
              </div>
            </div>

            <h3>After Submission</h3>
            <p>Your manager will review your development plan and provide feedback. They may:</p>
            <ul>
              <li><strong>Approve</strong>: Plan is ready to proceed as submitted</li>
              <li><strong>Request Revisions</strong>: Modifications needed before approval</li>
              <li><strong>Schedule Discussion</strong>: More conversation needed</li>
            </ul>
          </div>
        );

      case 'navigation':
        return (
          <div className="help-content">
            <h2>🧭 Navigation & Features</h2>
            
            <h3>Main Menu Options</h3>
            <ul>
              <li><strong>Dashboard</strong>: Your home page with overview and quick actions</li>
              <li><strong>My Reviews</strong>: View all your assessments (past and current)</li>
              <li><strong>Development Center</strong>: Create and manage development plans</li>
              <li><strong>Feedback Wall</strong>: View feedback and kudos from colleagues</li>
              <li><strong>Profile</strong>: Update your personal information</li>
              <li><strong>Help</strong>: This help section</li>
            </ul>

            <h3>Notifications</h3>
            <p>You'll receive notifications for:</p>
            <ul>
              <li><strong>Assessment Reminders</strong>: When reviews are due</li>
              <li><strong>Development Plan Updates</strong>: Manager feedback on your plans</li>
              <li><strong>Recognition</strong>: When you receive kudos or feedback</li>
              <li><strong>System Updates</strong>: Important announcements</li>
            </ul>

            <h3>Managing Notifications</h3>
            <ol>
              <li>Click the notification icon to view recent alerts</li>
              <li>Mark notifications as read to keep your list organized</li>
              <li>Important deadlines will persist until addressed</li>
            </ol>

            <div className="help-tip">
              <strong>💡 Quick Tip:</strong> Use the search feature to quickly find specific assessments or development plans.
            </div>
          </div>
        );

      case 'feedback':
        return (
          <div className="help-content">
            <h2>⭐ Feedback & Recognition</h2>
            
            <h3>Receiving Feedback</h3>
            <ul>
              <li>Colleagues and managers can provide feedback on your work</li>
              <li>Feedback appears on your Feedback Wall</li>
              <li>You'll receive notifications when new feedback is submitted</li>
            </ul>

            <h3>Receiving Kudos</h3>
            <p>Kudos are recognition badges for excellent work. Common types include:</p>
            <ul>
              <li><strong>🤝 Teamwork</strong>: Outstanding collaboration</li>
              <li><strong>💡 Innovation</strong>: Creative problem-solving</li>
              <li><strong>👑 Leadership</strong>: Exceptional leadership skills</li>
              <li><strong>🎯 Dedication</strong>: Going above and beyond</li>
              <li><strong>⭐ Excellence</strong>: Consistently high performance</li>
            </ul>

            <h3>Giving Feedback and Kudos</h3>
            <p>You can also recognize your colleagues:</p>
            <ul>
              <li>Give kudos to colleagues for outstanding work</li>
              <li>Provide peer feedback during review cycles</li>
              <li>Participate in 360-degree feedback processes</li>
            </ul>

            <div className="help-tip">
              <strong>💡 Best Practice:</strong> Regularly acknowledge your colleagues' good work. Recognition boosts morale and strengthens team relationships.
            </div>
          </div>
        );

      case 'troubleshooting':
        return (
          <div className="help-content">
            <h2>🔧 Troubleshooting</h2>
            
            <h3>Common Issues & Solutions</h3>
            
            <div className="troubleshooting-item">
              <h4>❓ "I can't see my assessment"</h4>
              <ul>
                <li>Check that you're in an active review cycle</li>
                <li>Contact your manager to confirm you're included in the current cycle</li>
                <li>Ensure you're logged in with the correct account</li>
                <li>Try refreshing the page</li>
              </ul>
            </div>

            <div className="troubleshooting-item">
              <h4>❓ "My development plan won't save"</h4>
              <ul>
                <li>Check that all required fields are completed</li>
                <li>Ensure your internet connection is stable</li>
                <li>Try refreshing the page and re-entering your information</li>
                <li>Contact IT support if the problem persists</li>
              </ul>
            </div>

            <div className="troubleshooting-item">
              <h4>❓ "I submitted by mistake"</h4>
              <ul>
                <li>Contact your manager immediately if you submitted an incomplete assessment</li>
                <li>For development plans, you may be able to create a new version</li>
                <li>Explain the situation to your manager for guidance</li>
              </ul>
            </div>

            <div className="troubleshooting-item">
              <h4>❓ "The page is loading slowly"</h4>
              <ul>
                <li>Check your internet connection</li>
                <li>Close other browser tabs or applications</li>
                <li>Try using a different browser</li>
                <li>Clear your browser cache and cookies</li>
              </ul>
            </div>

            <h3>Getting Additional Help</h3>
            <ul>
              <li><strong>Your Manager</strong>: For assessment questions or career guidance</li>
              <li><strong>HR Support</strong>: For policy questions or account issues</li>
              <li><strong>IT Help Desk</strong>: For technical problems</li>
            </ul>

            <div className="help-contact">
              <h4>📞 Need More Help?</h4>
              <p>If you can't find the answer you're looking for, don't hesitate to reach out:</p>
              <ul>
                <li>Email: hr-support@company.com</li>
                <li>IT Help Desk: ext. 4357</li>
                <li>Manager: Use your regular communication channels</li>
              </ul>
            </div>
          </div>
        );

      default:
        return <div>Select a section from the menu</div>;
    }
  };

  return (
    <div className="help-page">
      <div className="help-header">
        <h1>Employee Help Center</h1>
        <p>Everything you need to know about using EDGE effectively</p>
      </div>

      <div className="help-layout">
        <nav className="help-sidebar">
          <h3>Help Topics</h3>
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
        </nav>

        <main className="help-main">
          {renderContent()}
        </main>
      </div>

    </div>
  );
};

export default EmployeeHelpPage;