import React, { useState, useEffect } from 'react';
import './HelpPages.css';

const ManagerHelpPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('getting-started');

  // Handle hash-based navigation  
  useEffect(() => {
    const hash = window.location.hash.slice(1); // Remove the # symbol
    // Map dashboard widget links to internal section names
    const sectionMap: { [key: string]: string } = {
      'development-planning': 'development-plans', // Dashboard uses 'development-planning', we use 'development-plans'
    };
    
    const mappedHash = sectionMap[hash] || hash;
    const validSections = ['getting-started', 'team-management', 'review-process', 'development-plans', 'analytics', 'communication', 'best-practices', 'troubleshooting'];
    if (mappedHash && validSections.includes(mappedHash)) {
      setActiveSection(mappedHash);
    }
  }, []);

  // Update hash when section changes
  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    window.history.replaceState(null, '', `#${sectionId}`);
  };

  const sections = [
    { id: 'getting-started', title: 'Manager Overview', icon: '👔' },
    { id: 'team-management', title: 'Team Management', icon: '👥' },
    { id: 'review-process', title: 'Review Process', icon: '📋' },
    { id: 'development-plans', title: 'Development Plans', icon: '📈' },
    { id: 'analytics', title: 'Team Analytics', icon: '📊' },
    { id: 'communication', title: 'Communication & Feedback', icon: '💬' },
    { id: 'best-practices', title: 'Best Practices', icon: '⭐' },
    { id: 'troubleshooting', title: 'Troubleshooting', icon: '🔧' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'getting-started':
        return (
          <div className="help-content">
            <h2>👔 Manager Overview</h2>
            <p>As a manager in EDGE, you have access to comprehensive tools for team performance management, review processes, and employee development. This guide covers all manager-specific features and best practices.</p>
            
            <h3>Your Manager Dashboard</h3>
            <p>After logging in, your manager dashboard displays:</p>
            <ul>
              <li><strong>Team Overview</strong>: Summary of your direct reports</li>
              <li><strong>Pending Reviews</strong>: Assessments waiting for your input</li>
              <li><strong>Team Performance</strong>: Analytics and completion rates</li>
              <li><strong>Recent Activity</strong>: Latest team updates and submissions</li>
              <li><strong>Development Plans</strong>: Plans submitted by your team members</li>
              <li><strong>Quick Actions</strong>: Common management tasks</li>
            </ul>

            <h3>Key Responsibilities</h3>
            <ol>
              <li><strong>Monitor Progress</strong>: Track team members' self-assessment completion</li>
              <li><strong>Provide Timely Reviews</strong>: Complete manager evaluations promptly</li>
              <li><strong>Schedule Meetings</strong>: Arrange one-on-one review discussions</li>
              <li><strong>Set Goals</strong>: Establish objectives for the next period</li>
              <li><strong>Support Development</strong>: Guide team members' growth plans</li>
            </ol>

            <div className="help-tip">
              <strong>💡 Manager Tip:</strong> Regular check-ins with your team are more effective than waiting for formal review cycles. Use EDGE to document ongoing conversations and track progress.
            </div>
          </div>
        );

      case 'team-management':
        return (
          <div className="help-content">
            <h2>👥 Team Management</h2>
            
            <h3>Accessing Your Team</h3>
            <ol>
              <li>From the dashboard, click "My Team" or "Team View"</li>
              <li>View all your direct reports in an organized list</li>
              <li>Click on any team member for detailed information</li>
            </ol>

            <h3>Team Information Displayed</h3>
            <ul>
              <li><strong>Employee Names</strong>: All direct reports</li>
              <li><strong>Job Titles</strong>: Current roles</li>
              <li><strong>Assessment Status</strong>: Current review progress</li>
              <li><strong>Development Plan Status</strong>: Plan submission and review status</li>
              <li><strong>Last Activity</strong>: Recent actions taken</li>
            </ul>

            <h3>Team Actions Available</h3>
            <ul>
              <li><strong>View Employee Details</strong>: Comprehensive employee information</li>
              <li><strong>Review Assessments</strong>: Access submitted self-assessments</li>
              <li><strong>Provide Feedback</strong>: Complete manager reviews</li>
              <li><strong>Review Development Plans</strong>: Evaluate and approve development plans</li>
            </ul>

            <h3>Employee Profile Information</h3>
            <p>When viewing individual profiles, you'll see:</p>
            <ul>
              <li><strong>Personal Details</strong>: Name, role, contact information</li>
              <li><strong>Performance History</strong>: Past review scores and feedback</li>
              <li><strong>Current Objectives</strong>: Active goals and priorities</li>
              <li><strong>Development Progress</strong>: Skills being developed</li>
              <li><strong>Recognition</strong>: Kudos and feedback received</li>
            </ul>

            <div className="help-warning">
              <strong>⚠️ Privacy Note:</strong> As a manager, you have access to your direct reports' information for management purposes. Please handle this information responsibly and in accordance with company privacy policies.
            </div>
          </div>
        );

      case 'review-process':
        return (
          <div className="help-content">
            <h2>📋 Performance Review Process</h2>
            
            <h3>Understanding Review Cycles</h3>
            <ul>
              <li>Review cycles are created by administrators</li>
              <li>You'll receive notifications when cycles begin</li>
              <li>Your team members complete self-assessments first</li>
              <li>You then provide manager reviews and ratings</li>
            </ul>

            <h3>Completing Manager Reviews</h3>
            
            <h4>Step 1: Access Pending Reviews</h4>
            <ul>
              <li>From dashboard, click on pending reviews</li>
              <li>Select the employee assessment to review</li>
            </ul>

            <h4>Step 2: Review Self-Assessment</h4>
            <ul>
              <li>Read the employee's self-evaluation carefully</li>
              <li>Note their self-ratings and comments</li>
              <li>Consider their examples and achievements</li>
            </ul>

            <h4>Step 3: Provide Manager Evaluation</h4>
            <ul>
              <li>Rate performance in each competency area</li>
              <li>Provide detailed written feedback</li>
              <li>Be specific and constructive</li>
              <li>Include both strengths and development areas</li>
            </ul>

            <h4>Step 4: Complete Manager Sections</h4>
            <ul>
              <li><strong>Overall Performance Rating</strong>: Holistic assessment</li>
              <li><strong>Key Achievements</strong>: Notable accomplishments</li>
              <li><strong>Areas for Improvement</strong>: Specific development needs</li>
              <li><strong>Goals for Next Period</strong>: Clear, measurable objectives</li>
              <li><strong>Support Needed</strong>: Resources or training required</li>
            </ul>

            <div className="help-example">
              <h4>📝 Example Manager Review Comments:</h4>
              <div className="example-box">
                <p><strong>Strengths:</strong><br/>
                "Sarah consistently delivered high-quality work on the Q3 marketing campaign, resulting in a 15% increase in lead generation. Her attention to detail and ability to meet tight deadlines stood out during our busiest period."</p>
                
                <p><strong>Development Areas:</strong><br/>
                "To advance in her role, Sarah should focus on developing presentation skills. Consider enrolling in the public speaking workshop and practicing with smaller group presentations first."</p>
                
                <p><strong>Goals for Next Period:</strong><br/>
                "1. Lead the Q1 product launch presentation to senior leadership<br/>
                2. Complete advanced Excel training to improve data analysis capabilities<br/>
                3. Mentor one new team member to develop leadership skills"</p>
              </div>
            </div>

            <h3>Review Meeting Best Practices</h3>
            <h4>Preparing for Review Meetings:</h4>
            <ol>
              <li><strong>Schedule Appropriately</strong>: Book adequate time (45-60 minutes)</li>
              <li><strong>Review Documentation</strong>: Re-read both assessments beforehand</li>
              <li><strong>Prepare Discussion Points</strong>: Key topics and development areas</li>
              <li><strong>Plan Goal Setting</strong>: Think about appropriate objectives</li>
            </ol>

            <h4>Conducting Effective Meetings:</h4>
            <ol>
              <li><strong>Start Positively</strong>: Begin with accomplishments and strengths</li>
              <li><strong>Discuss Development</strong>: Address areas for improvement constructively</li>
              <li><strong>Set Clear Goals</strong>: Establish SMART objectives together</li>
              <li><strong>Plan Development</strong>: Discuss training, mentoring, or stretch assignments</li>
              <li><strong>Document Outcomes</strong>: Record agreed-upon goals and action steps</li>
            </ol>
          </div>
        );

      case 'development-plans':
        return (
          <div className="help-content">
            <h2>📈 Development Plan Management</h2>
            
            <h3>When Team Members Submit Plans</h3>
            <ol>
              <li>You'll receive a notification</li>
              <li>Access the plan from your dashboard or team view</li>
              <li>Review the proposed goals and timeline</li>
              <li>Provide feedback and approval decision</li>
            </ol>

            <h3>Evaluating Development Plans</h3>
            <p>Consider these factors when reviewing plans:</p>
            <ul>
              <li><strong>Relevance</strong>: Does the plan align with role requirements and career goals?</li>
              <li><strong>Feasibility</strong>: Are the timelines and goals realistic?</li>
              <li><strong>Business Impact</strong>: Will this development benefit the team/organization?</li>
              <li><strong>Resource Requirements</strong>: What support or resources are needed?</li>
            </ul>

            <h3>Approval Options</h3>
            <ul>
              <li><strong>Approved</strong>: Plan is ready to proceed as submitted</li>
              <li><strong>Needs Revision</strong>: Requires modifications before approval</li>
              <li><strong>Under Review</strong>: More discussion needed</li>
            </ul>

            <div className="help-example">
              <h4>📝 Feedback Examples:</h4>
              <div className="example-box">
                <p><strong>Approved:</strong><br/>
                "Excellent plan! The focus on project management skills aligns perfectly with our upcoming initiatives. I'll support your PMP certification by adjusting your workload during study periods."</p>
                
                <p><strong>Needs Revision:</strong><br/>
                "Great start on identifying development areas. Please revise the timeline - 3 months for certification may be too aggressive given current project demands. Consider 6-9 months instead."</p>
              </div>
            </div>

            <h3>Supporting Employee Development</h3>
            <p>Ways you can support your team's development:</p>
            <ul>
              <li><strong>Provide Stretch Assignments</strong>: Challenging projects that build skills</li>
              <li><strong>Offer Mentoring</strong>: Regular guidance and coaching</li>
              <li><strong>Approve Training</strong>: Support conference attendance, courses, certifications</li>
              <li><strong>Create Learning Opportunities</strong>: Cross-functional projects, job shadowing</li>
              <li><strong>Regular Check-ins</strong>: Monitor progress and provide ongoing feedback</li>
            </ul>

            <div className="help-tip">
              <strong>💡 Development Tip:</strong> The best development plans combine formal training with practical application. Help your team members find opportunities to practice new skills in real work situations.
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="help-content">
            <h2>📊 Team Analytics & Reporting</h2>
            
            <h3>Dashboard Analytics</h3>
            <p>Your manager dashboard provides key metrics:</p>
            <ul>
              <li><strong>Team Completion Rates</strong>: Assessment and development plan progress</li>
              <li><strong>Performance Trends</strong>: Team performance over time</li>
              <li><strong>Development Activity</strong>: Training and skill-building efforts</li>
              <li><strong>Goal Achievement</strong>: Progress on team objectives</li>
            </ul>

            <h3>Using Analytics Effectively</h3>
            <ul>
              <li><strong>Identify Trends</strong>: Spot patterns in team performance</li>
              <li><strong>Address Gaps</strong>: Identify team members needing additional support</li>
              <li><strong>Recognize Excellence</strong>: Identify high performers for recognition</li>
              <li><strong>Plan Resources</strong>: Understand training and development needs</li>
            </ul>

            <h3>Preparing Team Reports</h3>
            <p>When reporting to leadership, include:</p>
            <ul>
              <li><strong>Performance Summary</strong>: Overall team performance trends</li>
              <li><strong>Development Progress</strong>: Skills being built across the team</li>
              <li><strong>Challenges</strong>: Obstacles and resource needs</li>
              <li><strong>Achievements</strong>: Notable team accomplishments</li>
              <li><strong>Future Plans</strong>: Upcoming goals and initiatives</li>
            </ul>

            <div className="help-tip">
              <strong>💡 Analytics Tip:</strong> Look for patterns across your team. If multiple team members are struggling with the same competency, consider team-wide training or process improvements.
            </div>
          </div>
        );

      case 'communication':
        return (
          <div className="help-content">
            <h2>💬 Communication & Feedback</h2>
            
            <h3>Regular Check-ins</h3>
            <p>Establish a rhythm of communication:</p>
            <ul>
              <li><strong>Weekly One-on-ones</strong>: Brief progress and support discussions</li>
              <li><strong>Monthly Development Reviews</strong>: Focus on skill building and growth</li>
              <li><strong>Quarterly Goal Reviews</strong>: Assess progress on major objectives</li>
              <li><strong>Annual Performance Planning</strong>: Comprehensive review and goal setting</li>
            </ul>

            <h3>Providing Ongoing Feedback</h3>
            <p>Effective feedback principles:</p>
            <ul>
              <li><strong>Immediate</strong>: Address performance issues promptly</li>
              <li><strong>Specific</strong>: Use concrete examples and situations</li>
              <li><strong>Constructive</strong>: Focus on improvement and growth</li>
              <li><strong>Regular</strong>: Don't wait for formal review cycles</li>
            </ul>

            <h3>Encouraging Peer Feedback</h3>
            <p>Foster a feedback culture:</p>
            <ul>
              <li><strong>Model Behavior</strong>: Give and receive feedback openly</li>
              <li><strong>Create Safe Environment</strong>: Encourage honest, constructive feedback</li>
              <li><strong>Recognize Good Feedback</strong>: Acknowledge team members who provide helpful input</li>
            </ul>

            <div className="help-example">
              <h4>📝 Effective Feedback Examples:</h4>
              <div className="example-box">
                <p><strong>Specific & Actionable:</strong><br/>
                "In yesterday's client meeting, when you explained the technical solution, the client looked confused. Next time, try using analogies they can relate to, like comparing our database to a filing cabinet."</p>
                
                <p><strong>Positive Recognition:</strong><br/>
                "Your presentation to the steering committee was excellent. The way you anticipated their questions and prepared data to support each point really demonstrated your thorough preparation."</p>
              </div>
            </div>
          </div>
        );

      case 'best-practices':
        return (
          <div className="help-content">
            <h2>⭐ Best Practices for Manager Success</h2>
            
            <h3>Performance Management</h3>
            <ol>
              <li><strong>Be Consistent</strong>: Apply standards fairly across all team members</li>
              <li><strong>Document Everything</strong>: Keep records of performance conversations</li>
              <li><strong>Focus on Development</strong>: Help team members grow and advance</li>
              <li><strong>Communicate Clearly</strong>: Ensure expectations are understood</li>
              <li><strong>Provide Support</strong>: Give team members the resources they need</li>
            </ol>

            <h3>Development Coaching</h3>
            <ol>
              <li><strong>Listen Actively</strong>: Understand team members' career aspirations</li>
              <li><strong>Challenge Appropriately</strong>: Provide stretch opportunities without overwhelming</li>
              <li><strong>Connect Learning</strong>: Link development activities to business needs</li>
              <li><strong>Celebrate Progress</strong>: Recognize growth and improvement</li>
              <li><strong>Be Patient</strong>: Allow time for skills to develop</li>
            </ol>

            <h3>System Usage</h3>
            <ol>
              <li><strong>Stay Current</strong>: Regularly check your dashboard for updates</li>
              <li><strong>Meet Deadlines</strong>: Complete reviews and approvals promptly</li>
              <li><strong>Use Data</strong>: Leverage analytics to make informed decisions</li>
              <li><strong>Provide Feedback</strong>: Give detailed, actionable input</li>
              <li><strong>Support Team</strong>: Help team members navigate the system</li>
            </ol>

            <div className="help-tip">
              <strong>💡 Success Tip:</strong> The most effective managers use EDGE as a tool to enhance their natural management style, not replace it. Use the system to document and track what you're already doing well.
            </div>
          </div>
        );

      case 'troubleshooting':
        return (
          <div className="help-content">
            <h2>🔧 Troubleshooting Common Issues</h2>
            
            <div className="troubleshooting-item">
              <h4>❓ "I can't see my team members"</h4>
              <ul>
                <li>Verify reporting relationships are correctly set up in the system</li>
                <li>Contact HR/Admin to confirm team assignments</li>
                <li>Check that you're logged in with manager-level access</li>
                <li>Ensure team members are marked as active in the system</li>
              </ul>
            </div>

            <div className="troubleshooting-item">
              <h4>❓ "Reviews aren't showing up"</h4>
              <ul>
                <li>Confirm there's an active review cycle</li>
                <li>Check that team members have submitted self-assessments</li>
                <li>Verify your access permissions with the administrator</li>
                <li>Refresh the page and check your notifications</li>
              </ul>
            </div>

            <div className="troubleshooting-item">
              <h4>❓ "Team member needs help with the system"</h4>
              <ul>
                <li>Direct them to the Employee Help section</li>
                <li>Escalate technical issues to HR/Admin</li>
                <li>Schedule time to walk through the process together</li>
                <li>Document common issues to share with other managers</li>
              </ul>
            </div>

            <div className="troubleshooting-item">
              <h4>❓ "Development plan approval isn't working"</h4>
              <ul>
                <li>Check that all required fields in the plan are completed</li>
                <li>Ensure you have manager permissions for the employee</li>
                <li>Try logging out and back in</li>
                <li>Contact IT support if the problem persists</li>
              </ul>
            </div>

            <div className="troubleshooting-item">
              <h4>❓ "Analytics data looks incorrect"</h4>
              <ul>
                <li>Check the date range of the analytics</li>
                <li>Verify that all team members are properly assigned to you</li>
                <li>Confirm that data has been submitted for the time period</li>
                <li>Contact admin if data discrepancies persist</li>
              </ul>
            </div>

            <h3>Getting Additional Help</h3>
            <ul>
              <li><strong>HR Support</strong>: For policy questions or employee issues</li>
              <li><strong>IT Help Desk</strong>: For technical problems</li>
              <li><strong>Admin Users</strong>: For system configuration questions</li>
              <li><strong>Other Managers</strong>: For best practices and tips</li>
            </ul>

            <div className="help-contact">
              <h4>📞 Manager Support Resources</h4>
              <ul>
                <li>Manager Slack Channel: #managers-edge-support</li>
                <li>HR Email: hr-support@company.com</li>
                <li>IT Help Desk: ext. 4357</li>
                <li>Monthly Manager Training: First Tuesday of each month</li>
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
        <h1>Manager Help Center</h1>
        <p>Comprehensive guide for managing your team effectively with EDGE</p>
      </div>

      <div className="help-layout">
        <nav className="help-sidebar">
          <h3>Manager Topics</h3>
          <ul className="help-menu">
            {sections.map(section => (
              <li key={section.id}>
                <button
                  className={`help-menu-item ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => handleSectionChange(section.id)}
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

export default ManagerHelpPage;