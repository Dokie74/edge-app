import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AssessmentService } from '../../services';
import { useApp } from '../../contexts';
import { Save, Send, Edit3, CheckCircle, Clock, ArrowLeft, User, Target, BookOpen } from 'lucide-react';
import { Button, LoadingSpinner, ErrorMessage } from '../ui';

export default function Assessment({ pageProps }) {
  const navigate = useNavigate();
  const { userRole } = useApp();
  const { assessmentId } = pageProps;
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        if (!assessmentId) {
          throw new Error('No assessment ID provided');
        }
        const data = await AssessmentService.getAssessmentById(assessmentId);
        const assessmentData = data?.[0];
        setAssessment(assessmentData);
        
        // Initialize form data with current assessment values
        if (assessmentData) {
          setFormData({
            employee_strengths: assessmentData.employee_strengths || '',
            employee_improvements: assessmentData.employee_improvements || '',
            value_passionate_examples: assessmentData.value_passionate_examples || '',
            value_driven_examples: assessmentData.value_driven_examples || '',
            value_resilient_examples: assessmentData.value_resilient_examples || '',
            value_responsive_examples: assessmentData.value_responsive_examples || '',
            gwc_gets_it: assessmentData.gwc_gets_it || false,
            gwc_gets_it_feedback: assessmentData.gwc_gets_it_feedback || '',
            gwc_wants_it: assessmentData.gwc_wants_it || false,
            gwc_wants_it_feedback: assessmentData.gwc_wants_it_feedback || '',
            gwc_capacity: assessmentData.gwc_capacity || false,
            gwc_capacity_feedback: assessmentData.gwc_capacity_feedback || '',
            // Manager GWC fields
            manager_gwc_gets_it: assessmentData.manager_gwc_gets_it || false,
            manager_gwc_gets_it_feedback: assessmentData.manager_gwc_gets_it_feedback || '',
            manager_gwc_wants_it: assessmentData.manager_gwc_wants_it || false,
            manager_gwc_wants_it_feedback: assessmentData.manager_gwc_wants_it_feedback || '',
            manager_gwc_capacity: assessmentData.manager_gwc_capacity || false,
            manager_gwc_capacity_feedback: assessmentData.manager_gwc_capacity_feedback || '',
            // Manager fields
            manager_performance_rating: assessmentData.manager_performance_rating || '',
            manager_summary_comments: assessmentData.manager_summary_comments || '',
            manager_core_values_feedback: assessmentData.manager_core_values_feedback || '',
            manager_development_plan: assessmentData.manager_development_plan || '',
            manager_action_items: assessmentData.manager_action_items || ''
          });
          
          // Auto-enable editing based on user role and assessment state
          if (assessmentData.can_edit_self_assessment && 
              (assessmentData.self_assessment_status === 'not_started' || 
               assessmentData.self_assessment_status === 'in_progress')) {
            setIsEditing(true);
          }
          
          // Auto-enable editing for managers when employee has submitted
          if (userRole === 'manager' && 
              assessmentData.self_assessment_status === 'employee_complete' &&
              assessmentData.manager_review_status === 'pending') {
            setIsEditing(true);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [assessmentId]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      await AssessmentService.updateAssessment(assessmentId, formData);
      
      // Refresh the assessment data
      const updatedData = await AssessmentService.getAssessmentById(assessmentId);
      setAssessment(updatedData?.[0]);
      
      alert('Assessment saved successfully!');
    } catch (err) {
      console.error('Error saving assessment:', err);
      alert('Error saving assessment: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await AssessmentService.submitAssessment(assessmentId);
      
      // Refresh the assessment data
      const updatedData = await AssessmentService.getAssessmentById(assessmentId);
      setAssessment(updatedData?.[0]);
      setIsEditing(false);
      
      alert('Self-assessment submitted successfully! Your manager will now review it.');
    } catch (err) {
      alert('Error submitting assessment: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleManagerSubmit = async () => {
    try {
      setSubmitting(true);
      
      // FIXED: Single atomic call to submit all manager feedback and update status
      await AssessmentService.submitManagerReview(assessmentId, formData);
      
      // Refresh the assessment data to reflect the changes
      const updatedData = await AssessmentService.getAssessmentById(assessmentId);
      
      setAssessment(updatedData?.[0]);
      setIsEditing(false);
      
      alert('Manager review submitted successfully! The employee will be notified.');
    } catch (err) {
      console.error('Error submitting manager review:', err);
      alert('Error submitting manager review: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmployeeAcknowledgment = async () => {
    try {
      setSubmitting(true);
      
      // Mark the review as acknowledged by employee
      await AssessmentService.acknowledgeReview(assessmentId);
      
      // Refresh the assessment data
      const updatedData = await AssessmentService.getAssessmentById(assessmentId);
      setAssessment(updatedData?.[0]);
      
      alert('Review acknowledged successfully! The review process is now complete.');
    } catch (err) {
      alert('Error acknowledging review: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="p-8">
      <LoadingSpinner size="lg" message="Loading assessment..." />
    </div>
  );
  
  if (error) return (
    <div className="p-8">
      <ErrorMessage error={error} title="Assessment Error" />
    </div>
  );
  
  if (!assessment) return (
    <div className="p-8">
      <div className="text-center py-12">
        <p className="text-gray-400">Assessment not found.</p>
      </div>
    </div>
  );

  // Permission logic for different user roles
  const canEditSelfAssessment = userRole === 'admin' || (assessment.can_edit_self_assessment && !assessment.is_manager_view);
  const canEditManagerReview = userRole === 'admin' || (userRole === 'manager' && assessment.self_assessment_status === 'employee_complete' && assessment.manager_review_status === 'pending');
  const canAcknowledgeReview = (userRole === 'employee' || userRole === 'admin') && assessment.manager_review_status === 'completed' && !assessment.employee_acknowledgment;
  const canEdit = canEditSelfAssessment || canEditManagerReview;
  
  const isInProgress = assessment.self_assessment_status === 'in_progress';
  const isNotStarted = assessment.self_assessment_status === 'not_started';
  const isSubmitted = assessment.self_assessment_status === 'employee_complete';
  const isManagerReview = userRole === 'manager' && assessment.self_assessment_status === 'employee_complete';
  const isReviewComplete = assessment.manager_review_status === 'completed';
  const isFullyComplete = assessment.employee_acknowledgment;
  

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(userRole === 'manager' ? '/team' : '/reviews')} 
            className="text-cyan-400 hover:underline flex items-center"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to {userRole === 'manager' ? 'My Team' : 'My Reviews'}
          </button>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {canEdit && isEditing && (
            <>
              <Button
                onClick={handleSave}
                disabled={saving}
                variant="secondary"
                size="sm"
              >
                {saving ? (
                  <><Clock size={14} className="mr-1" /> Saving...</>
                ) : (
                  <><Save size={14} className="mr-1" /> Save Draft</>
                )}
              </Button>
              
              {/* Employee Submit Button */}
              {canEditSelfAssessment && !isManagerReview && (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  variant="primary"
                  size="sm"
                >
                  {submitting ? (
                    <><Clock size={14} className="mr-1" /> Submitting...</>
                  ) : (
                    <><Send size={14} className="mr-1" /> Submit for Review</>
                  )}
                </Button>
              )}

              {/* Manager Submit Button */}
              {canEditManagerReview && (
                <Button
                  onClick={handleManagerSubmit}
                  disabled={submitting}
                  variant="primary"
                  size="sm"
                >
                  {submitting ? (
                    <><Clock size={14} className="mr-1" /> Submitting...</>
                  ) : (
                    <><Send size={14} className="mr-1" /> Complete Manager Review</>
                  )}
                </Button>
              )}
            </>
          )}
          
          {/* Start/Continue Buttons */}
          {canEditSelfAssessment && !isEditing && (isNotStarted || isInProgress) && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="primary"
              size="sm"
            >
              <Edit3 size={14} className="mr-1" />
              {isNotStarted ? 'Start Self-Assessment' : 'Continue Assessment'}
            </Button>
          )}

          {/* Manager Review Button */}
          {canEditManagerReview && !isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="primary"
              size="sm"
            >
              <Edit3 size={14} className="mr-1" />
              Start Manager Review
            </Button>
          )}

          {/* Employee Acknowledgment Button */}
          {canAcknowledgeReview && (
            <Button
              onClick={handleEmployeeAcknowledgment}
              disabled={submitting}
              variant="primary"
              size="sm"
              className="bg-green-600 hover:bg-green-700 border-green-600"
            >
              {submitting ? (
                <><Clock size={14} className="mr-1" /> Processing...</>
              ) : (
                <><CheckCircle size={14} className="mr-1" /> Acknowledge Review</>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Assessment Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-3xl font-bold text-white mb-2">{assessment.employee_name}</h2>
        <p className="text-gray-400 mb-4">Review Cycle: {assessment.review_cycle_name}</p>
        
        {/* Status Indicator */}
        <div className="flex items-center space-x-4">
          {/* Employee Status */}
          {isSubmitted && (
            <div className="flex items-center text-green-400">
              <CheckCircle size={16} className="mr-1" />
              <span className="text-sm font-medium">Employee Assessment Complete</span>
            </div>
          )}
          {isInProgress && (
            <div className="flex items-center text-yellow-400">
              <Clock size={16} className="mr-1" />
              <span className="text-sm font-medium">Self-Assessment In Progress</span>
            </div>
          )}
          {isNotStarted && canEdit && (
            <div className="flex items-center text-blue-400">
              <Edit3 size={16} className="mr-1" />
              <span className="text-sm font-medium">Ready to Start</span>
            </div>
          )}

          {/* Manager Status */}
          {assessment.manager_review_status === 'completed' && (
            <div className="flex items-center text-green-400">
              <CheckCircle size={16} className="mr-1" />
              <span className="text-sm font-medium">Manager Review Complete</span>
            </div>
          )}
          {assessment.manager_review_status === 'pending' && isSubmitted && (
            <div className="flex items-center text-yellow-400">
              <Clock size={16} className="mr-1" />
              <span className="text-sm font-medium">Awaiting Manager Review</span>
            </div>
          )}

          {/* Final Status */}
          {isFullyComplete && (
            <div className="flex items-center text-green-400">
              <CheckCircle size={16} className="mr-1" />
              <span className="text-sm font-medium">Review Process Complete</span>
            </div>
          )}
          {canAcknowledgeReview && (
            <div className="flex items-center text-blue-400">
              <Clock size={16} className="mr-1" />
              <span className="text-sm font-medium">Awaiting Employee Acknowledgment</span>
            </div>
          )}
        </div>
      </div>

      {/* Core Values Section */}
      <SelfAssessmentSection
        title="Core Values Examples"
        subtitle="Provide specific examples of how you've demonstrated our core values"
        icon={User}
      >
        <CoreValuesSection 
          assessment={assessment}
          formData={formData}
          isEditing={isEditing}
          onChange={handleInputChange}
          isManagerReview={isManagerReview}
          canEditManagerReview={canEditManagerReview}
        />
      </SelfAssessmentSection>

      {/* GWC Section */}
      <SelfAssessmentSection
        title="GWC Assessment"
        subtitle="Evaluate your alignment with your role's requirements"
        icon={Target}
      >
        <GWCSection 
          assessment={assessment}
          formData={formData}
          isEditing={isEditing}
          onChange={handleInputChange}
          isManagerReview={isManagerReview}
          canEditManagerReview={canEditManagerReview}
        />
      </SelfAssessmentSection>

      {/* Strengths & Improvements */}
      <SelfAssessmentSection
        title="Self-Reflection"
        subtitle="Reflect on your strengths and areas for improvement"
        icon={BookOpen}
      >
        <StrengthsSection 
          assessment={assessment}
          formData={formData}
          isEditing={isEditing}
          onChange={handleInputChange}
          isManagerReview={isManagerReview}
          canEditManagerReview={canEditManagerReview}
        />
      </SelfAssessmentSection>

      {/* Rocks Section */}
      <SelfAssessmentSection
        title="Quarterly Rocks"
        subtitle="Your key objectives for this quarter"
        icon={Target}
      >
        <RocksSection assessment={assessment} />
      </SelfAssessmentSection>

      {/* Manager Section (show when employee has submitted or when manager is reviewing) */}
      {(assessment.self_assessment_status === 'employee_complete' || assessment.manager_review_status === 'completed') && (
        <SelfAssessmentSection
          title="Manager Review & Feedback"
          subtitle="Manager assessment, development planning, and feedback"
          icon={User}
        >
          <ManagerOnlySection 
            assessment={assessment}
            formData={formData}
            isEditing={isEditing && canEditManagerReview}
            onChange={handleInputChange}
          />
        </SelfAssessmentSection>
      )}

      {/* Fixed Bottom Action Bar - Always visible when editing */}
      {canEdit && isEditing && (
        <div className="fixed bottom-0 left-64 right-0 bg-gray-800 border-t border-gray-700 p-4 shadow-2xl z-30">
          <div className="flex justify-end space-x-3 max-w-4xl mx-auto">
            <Button
              onClick={handleSave}
              disabled={saving}
              variant="secondary"
            >
              {saving ? (
                <><Clock size={16} className="mr-2" /> Saving...</>
              ) : (
                <><Save size={16} className="mr-2" /> Save Draft</>
              )}
            </Button>
            
            {/* Employee Submit Button */}
            {canEditSelfAssessment && !isManagerReview && (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                variant="primary"
              >
                {submitting ? (
                  <><Clock size={16} className="mr-2" /> Submitting...</>
                ) : (
                  <><Send size={16} className="mr-2" /> Submit for Review</>
                )}
              </Button>
            )}

            {/* Manager Submit Button */}
            {canEditManagerReview && (
              <Button
                onClick={handleManagerSubmit}
                disabled={submitting}
                variant="primary"
              >
                {submitting ? (
                  <><Clock size={16} className="mr-2" /> Submitting...</>
                ) : (
                  <><Send size={16} className="mr-2" /> Complete Manager Review</>
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Add padding to prevent content from being hidden behind fixed bottom bar */}
      {canEdit && isEditing && <div className="h-20" />}
    </div>
  );
}

// Section Container Component
const SelfAssessmentSection = ({ title, subtitle, icon: Icon, children }) => (
  <div className="bg-gray-800 rounded-lg shadow-2xl">
    <div className="p-6 border-b border-gray-700">
      <div className="flex items-center mb-2">
        {Icon && <Icon size={24} className="text-cyan-400 mr-3" />}
        <h3 className="text-xl font-semibold text-white">{title}</h3>
      </div>
      <p className="text-gray-400 text-sm">{subtitle}</p>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

// Core Values Section Component
const CoreValuesSection = ({ assessment, formData, isEditing, onChange, isManagerReview, canEditManagerReview }) => {
  const coreValues = [
    { key: 'passionate', label: 'Passionate', color: 'red' },
    { key: 'driven', label: 'Driven', color: 'blue' },
    { key: 'resilient', label: 'Resilient', color: 'green' },
    { key: 'responsive', label: 'Responsive', color: 'purple' }
  ];

  // If this is manager review mode OR manager has completed review, show two-column layout
  if (isManagerReview || (assessment.self_assessment_status === 'employee_complete' && (canEditManagerReview || assessment.manager_review_status === 'completed'))) {
    return (
      <div className="space-y-8">
        {coreValues.map(value => (
          <div key={value.key} className="border border-gray-600 rounded-lg p-4">
            <h4 className="text-lg font-medium text-white mb-4 border-b border-gray-600 pb-2">
              {value.label}
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Employee Column */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-300">
                  Employee Examples
                </label>
                <div className="p-3 bg-gray-700 rounded-md text-gray-300 min-h-[80px] border-l-4 border-blue-500">
                  {assessment[`value_${value.key}_examples`] || 'No examples provided by employee.'}
                </div>
              </div>
              
              {/* Manager Column */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-green-300">
                  Manager Feedback
                </label>
                {isEditing && canEditManagerReview ? (
                  <textarea
                    value={formData[`manager_${value.key}_feedback`] || ''}
                    onChange={(e) => onChange(`manager_${value.key}_feedback`, e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-green-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    placeholder={`Provide feedback on employee's ${value.label.toLowerCase()} examples...`}
                  />
                ) : (
                  <div className="p-3 bg-gray-700 rounded-md text-gray-300 min-h-[80px] border-l-4 border-green-500">
                    {assessment[`manager_${value.key}_feedback`] || 'Manager feedback pending.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Regular employee view (single column)
  return (
    <div className="space-y-6">
      {coreValues.map(value => (
        <div key={value.key} className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            {value.label} - Provide specific examples
          </label>
          {isEditing ? (
            <textarea
              value={formData[`value_${value.key}_examples`] || ''}
              onChange={(e) => onChange(`value_${value.key}_examples`, e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              rows={3}
              placeholder={`Describe specific situations where you demonstrated being ${value.label.toLowerCase()}...`}
            />
          ) : (
            <div className="p-3 bg-gray-700 rounded-md text-gray-300 min-h-[80px]">
              {assessment[`value_${value.key}_examples`] || 'No examples provided yet.'}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// GWC Section Component
const GWCSection = ({ assessment, formData, isEditing, onChange, isManagerReview, canEditManagerReview }) => {
  const gwcItems = [
    { key: 'gets_it', label: 'Gets It', description: 'Do you understand the role and its requirements?' },
    { key: 'wants_it', label: 'Wants It', description: 'Do you have the passion and desire for this role?' },
    { key: 'capacity', label: 'Has Capacity', description: 'Do you have the time and capability to fulfill this role?' }
  ];

  // If this is manager review mode OR manager has completed review, show two-column layout
  if (isManagerReview || (assessment.self_assessment_status === 'employee_complete' && (canEditManagerReview || assessment.manager_review_status === 'completed'))) {
    return (
      <div className="space-y-8">
        {gwcItems.map(item => (
          <div key={item.key} className="border border-gray-600 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-4 border-b border-gray-600 pb-2">
              <span className="text-2xl">
                {assessment[`gwc_${item.key}`] ? '✅' : '❌'}
              </span>
              <div>
                <h4 className="text-lg font-medium text-white">{item.label}</h4>
                <p className="text-sm text-gray-400">{item.description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Employee Column */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-300">
                  Employee Assessment
                </label>
                <div className="p-3 bg-gray-700 rounded-md text-gray-300 min-h-[60px] border-l-4 border-blue-500">
                  {/* Show employee feedback only if they answered No or provided explanation */}
                  {!assessment[`gwc_${item.key}`] || assessment[`gwc_${item.key}_feedback`] ? (
                    assessment[`gwc_${item.key}_feedback`] || 'No explanation provided by employee.'
                  ) : (
                    'Employee answered Yes - no explanation needed.'
                  )}
                </div>
              </div>
              
              {/* Manager Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-green-300 mb-2">
                    Manager Assessment
                  </label>
                  {isEditing && canEditManagerReview ? (
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData[`manager_gwc_${item.key}`] || false}
                        onChange={(e) => onChange(`manager_gwc_${item.key}`, e.target.checked)}
                        className="w-5 h-5 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                      />
                      <span className="text-white">Manager agrees: {item.label}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {assessment[`manager_gwc_${item.key}`] ? '✅' : '❌'}
                      </span>
                      <span className="text-white">Manager agrees: {item.label}</span>
                    </div>
                  )}
                </div>
                
                {/* Manager Feedback - only show if No or existing feedback */}
                {(isEditing && canEditManagerReview && !(formData[`manager_gwc_${item.key}`] || false)) || 
                 (!isEditing && (assessment[`manager_gwc_${item.key}_feedback`] || !assessment[`manager_gwc_${item.key}`])) ? (
                  <div>
                    <label className="block text-sm font-medium text-green-300 mb-2">
                      {!(formData[`manager_gwc_${item.key}`] || assessment[`manager_gwc_${item.key}`]) ? 'Manager explanation why not:' : 'Manager feedback:'}
                    </label>
                    {isEditing && canEditManagerReview ? (
                      <textarea
                        value={formData[`manager_gwc_${item.key}_feedback`] || ''}
                        onChange={(e) => onChange(`manager_gwc_${item.key}_feedback`, e.target.value)}
                        className="w-full p-3 bg-gray-700 border border-green-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        rows={2}
                        placeholder={`Explain why you don't agree the employee ${item.label.toLowerCase()}...`}
                      />
                    ) : (
                      <div className="p-3 bg-gray-700 rounded-md text-gray-300 min-h-[60px] border-l-4 border-green-500">
                        {assessment[`manager_gwc_${item.key}_feedback`] || 'Manager feedback pending.'}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Regular employee view (single column)
  return (
    <div className="space-y-6">
      {gwcItems.map(item => (
        <div key={item.key} className="space-y-3">
          <div className="flex items-center space-x-3">
            {isEditing ? (
              <input
                type="checkbox"
                checked={formData[`gwc_${item.key}`] || false}
                onChange={(e) => onChange(`gwc_${item.key}`, e.target.checked)}
                className="w-5 h-5 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
              />
            ) : (
              <span className="text-2xl">
                {assessment[`gwc_${item.key}`] ? '✅' : '❌'}
              </span>
            )}
            <div>
              <h4 className="text-lg font-medium text-white">{item.label}</h4>
              <p className="text-sm text-gray-400">{item.description}</p>
            </div>
          </div>
          
          {/* Only show comment box if answer is No (unchecked) or if there's existing feedback */}
          {(isEditing && !(formData[`gwc_${item.key}`] || false)) || 
           (!isEditing && (assessment[`gwc_${item.key}_feedback`] || !assessment[`gwc_${item.key}`])) ? (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {!(formData[`gwc_${item.key}`] || assessment[`gwc_${item.key}`]) ? 'Please explain why not:' : 'Explanation:'}
              </label>
              {isEditing ? (
                <textarea
                  value={formData[`gwc_${item.key}_feedback`] || ''}
                  onChange={(e) => onChange(`gwc_${item.key}_feedback`, e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  rows={2}
                  placeholder={`Explain why you don't ${item.label.toLowerCase()}...`}
                />
              ) : (
                <div className="p-3 bg-gray-700 rounded-md text-gray-300 min-h-[60px]">
                  {assessment[`gwc_${item.key}_feedback`] || 'No explanation provided yet.'}
                </div>
              )}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
};

// Strengths Section Component
const StrengthsSection = ({ assessment, formData, isEditing, onChange, isManagerReview, canEditManagerReview }) => {
  const sections = [
    { key: 'strengths', label: 'Key Strengths', question: 'What are your key strengths?' },
    { key: 'improvements', label: 'Areas for Improvement', question: 'What areas would you like to improve?' }
  ];

  // If this is manager review mode OR manager has completed review, show two-column layout
  if (isManagerReview || (assessment.self_assessment_status === 'employee_complete' && (canEditManagerReview || assessment.manager_review_status === 'completed'))) {
    return (
      <div className="space-y-8">
        {sections.map(section => (
          <div key={section.key} className="border border-gray-600 rounded-lg p-4">
            <h4 className="text-lg font-medium text-white mb-4 border-b border-gray-600 pb-2">
              {section.label}
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Employee Column */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-300">
                  Employee Response
                </label>
                <div className="p-3 bg-gray-700 rounded-md text-gray-300 min-h-[100px] border-l-4 border-blue-500">
                  {assessment[`employee_${section.key}`] || `No ${section.label.toLowerCase()} provided by employee.`}
                </div>
              </div>
              
              {/* Manager Column */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-green-300">
                  Manager Feedback
                </label>
                {isEditing && canEditManagerReview ? (
                  <textarea
                    value={formData[`manager_${section.key}_feedback`] || ''}
                    onChange={(e) => onChange(`manager_${section.key}_feedback`, e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-green-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={4}
                    placeholder={`Provide feedback on employee's ${section.label.toLowerCase()}...`}
                  />
                ) : (
                  <div className="p-3 bg-gray-700 rounded-md text-gray-300 min-h-[100px] border-l-4 border-green-500">
                    {assessment[`manager_${section.key}_feedback`] || 'Manager feedback pending.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Regular employee view (single column)
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          What are your key strengths?
        </label>
        {isEditing ? (
          <textarea
            value={formData.employee_strengths || ''}
            onChange={(e) => onChange('employee_strengths', e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            rows={4}
            placeholder="Describe your key strengths and what you excel at..."
          />
        ) : (
          <div className="p-3 bg-gray-700 rounded-md text-gray-300 min-h-[100px]">
            {assessment.employee_strengths || 'No strengths identified yet.'}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          What areas would you like to improve?
        </label>
        {isEditing ? (
          <textarea
            value={formData.employee_improvements || ''}
            onChange={(e) => onChange('employee_improvements', e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            rows={4}
            placeholder="Describe areas where you'd like to grow and improve..."
          />
        ) : (
          <div className="p-3 bg-gray-700 rounded-md text-gray-300 min-h-[100px]">
            {assessment.employee_improvements || 'No improvement areas identified yet.'}
          </div>
        )}
      </div>
    </div>
  );
};

// Rocks Section Component
const RocksSection = ({ assessment }) => (
  <div className="space-y-4">
    {assessment.rocks && assessment.rocks.length > 0 ? (
      assessment.rocks.map((rock, index) => (
        <div key={rock.id || index} className="bg-gray-700 p-4 rounded-lg">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="text-lg font-medium text-white mb-2">{rock.description}</h4>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded ${
                  rock.status === 'completed' ? 'bg-green-600 text-green-100' :
                  rock.status === 'in_progress' ? 'bg-yellow-600 text-yellow-100' :
                  'bg-gray-600 text-gray-100'
                }`}>
                  {rock.status?.replace('_', ' ') || 'Not Started'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))
    ) : (
      <div className="text-center py-8 text-gray-500">
        <Target size={48} className="mx-auto mb-4 text-gray-600" />
        <p>No rocks assigned for this review cycle.</p>
      </div>
    )}
  </div>
);

// Manager Only Section Component (without duplicate Core Values)
const ManagerOnlySection = ({ assessment, formData, isEditing, onChange }) => (
  <div className="space-y-6">
    {/* Overall Performance Rating */}
    <div className="space-y-2">
      <h4 className="text-lg font-medium text-white">Overall Performance Rating</h4>
      {isEditing ? (
        <select
          value={formData.manager_performance_rating || ''}
          onChange={(e) => onChange('manager_performance_rating', e.target.value)}
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        >
          <option value="">Select Rating</option>
          <option value="exceeds">Exceeds Expectations</option>
          <option value="meets">Meets Expectations</option>
          <option value="below">Below Expectations</option>
          <option value="unsatisfactory">Unsatisfactory</option>
        </select>
      ) : (
        <div className="p-3 bg-gray-700 rounded-md text-gray-300">
          {assessment.manager_performance_rating ? (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              assessment.manager_performance_rating === 'exceeds' ? 'bg-green-600 text-green-100' :
              assessment.manager_performance_rating === 'meets' ? 'bg-blue-600 text-blue-100' :
              assessment.manager_performance_rating === 'below' ? 'bg-yellow-600 text-yellow-100' :
              'bg-red-600 text-red-100'
            }`}>
              {assessment.manager_performance_rating === 'exceeds' ? 'Exceeds Expectations' :
               assessment.manager_performance_rating === 'meets' ? 'Meets Expectations' :
               assessment.manager_performance_rating === 'below' ? 'Below Expectations' :
               'Unsatisfactory'}
            </span>
          ) : (
            'Performance rating pending.'
          )}
        </div>
      )}
    </div>

    {/* Manager Summary Comments */}
    <div className="space-y-2">
      <h4 className="text-lg font-medium text-white">Manager Summary & Feedback</h4>
      {isEditing ? (
        <textarea
          value={formData.manager_summary_comments || ''}
          onChange={(e) => onChange('manager_summary_comments', e.target.value)}
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          rows={4}
          placeholder="Provide overall feedback on the employee's performance, strengths, and areas for improvement..."
        />
      ) : (
        <div className="p-3 bg-gray-700 rounded-md text-gray-300 min-h-[100px]">
          {assessment.manager_summary_comments || 'Manager feedback pending.'}
        </div>
      )}
    </div>

    {/* Development Plan */}
    <div className="space-y-2">
      <h4 className="text-lg font-medium text-white">Development Plan & Goals</h4>
      {isEditing ? (
        <textarea
          value={formData.manager_development_plan || ''}
          onChange={(e) => onChange('manager_development_plan', e.target.value)}
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          rows={4}
          placeholder="Outline specific development goals, training opportunities, and growth path for the next quarter..."
        />
      ) : (
        <div className="p-3 bg-gray-700 rounded-md text-gray-300 min-h-[100px]">
          {assessment.manager_development_plan || 'Development plan pending.'}
        </div>
      )}
    </div>

    {/* Action Items */}
    <div className="space-y-2">
      <h4 className="text-lg font-medium text-white">Action Items & Next Steps</h4>
      {isEditing ? (
        <textarea
          value={formData.manager_action_items || ''}
          onChange={(e) => onChange('manager_action_items', e.target.value)}
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          rows={3}
          placeholder="List specific action items, deadlines, and follow-up meetings..."
        />
      ) : (
        <div className="p-3 bg-gray-700 rounded-md text-gray-300 min-h-[80px]">
          {assessment.manager_action_items || 'Action items pending.'}
        </div>
      )}
    </div>
  </div>
);