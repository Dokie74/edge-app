import React, { useEffect, useState } from 'react';
import { AssessmentService } from '../../services';
import { useApp } from '../../contexts';
import { Save, Send, Edit3, CheckCircle, Clock, ArrowLeft, User, Target, BookOpen } from 'lucide-react';
import { Button, LoadingSpinner, ErrorMessage } from '../ui';

export default function Assessment({ pageProps }) {
  const { setActivePage, userRole } = useApp();
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
            gwc_capacity_feedback: assessmentData.gwc_capacity_feedback || ''
          });
          
          // Auto-enable editing if assessment is in draft/in_progress state
          if (assessmentData.can_edit_self_assessment && 
              (assessmentData.self_assessment_status === 'not_started' || 
               assessmentData.self_assessment_status === 'in_progress')) {
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

  // Admins can always edit assessments, otherwise use normal permissions
  const canEdit = userRole === 'admin' || (assessment.can_edit_self_assessment && !assessment.is_manager_view);
  const isInProgress = assessment.self_assessment_status === 'in_progress';
  const isNotStarted = assessment.self_assessment_status === 'not_started';
  const isSubmitted = assessment.self_assessment_status === 'employee_complete';
  
  // Debug logging for assessment state
  console.log('Assessment Debug:', {
    can_edit_self_assessment: assessment.can_edit_self_assessment,
    is_manager_view: assessment.is_manager_view,
    canEdit,
    isEditing,
    self_assessment_status: assessment.self_assessment_status,
    userRole
  });

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setActivePage({ name: userRole === 'manager' ? 'My Team' : 'My Reviews', props: {} })} 
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
            </>
          )}
          
          {canEdit && !isEditing && (isNotStarted || isInProgress) && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="primary"
              size="sm"
            >
              <Edit3 size={14} className="mr-1" />
              {isNotStarted ? 'Start Self-Assessment' : 'Continue Assessment'}
            </Button>
          )}
        </div>
      </div>

      {/* Assessment Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-3xl font-bold text-white mb-2">{assessment.employee_name}</h2>
        <p className="text-gray-400 mb-4">Review Cycle: {assessment.review_cycle_name}</p>
        
        {/* Status Indicator */}
        <div className="flex items-center space-x-2">
          {isSubmitted && (
            <div className="flex items-center text-green-400">
              <CheckCircle size={16} className="mr-1" />
              <span className="text-sm font-medium">Submitted for Manager Review</span>
            </div>
          )}
          {isInProgress && (
            <div className="flex items-center text-yellow-400">
              <Clock size={16} className="mr-1" />
              <span className="text-sm font-medium">In Progress</span>
            </div>
          )}
          {isNotStarted && canEdit && (
            <div className="flex items-center text-blue-400">
              <Edit3 size={16} className="mr-1" />
              <span className="text-sm font-medium">Ready to Start</span>
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

      {/* Manager Section (if applicable) */}
      {assessment.is_manager_view && (
        <SelfAssessmentSection
          title="Manager Comments"
          subtitle="Manager feedback and development planning"
          icon={User}
        >
          <ManagerSection assessment={assessment} />
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
const CoreValuesSection = ({ assessment, formData, isEditing, onChange }) => {
  const coreValues = [
    { key: 'passionate', label: 'Passionate', color: 'red' },
    { key: 'driven', label: 'Driven', color: 'blue' },
    { key: 'resilient', label: 'Resilient', color: 'green' },
    { key: 'responsive', label: 'Responsive', color: 'purple' }
  ];

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
const GWCSection = ({ assessment, formData, isEditing, onChange }) => {
  const gwcItems = [
    { key: 'gets_it', label: 'Gets It', description: 'Do you understand the role and its requirements?' },
    { key: 'wants_it', label: 'Wants It', description: 'Do you have the passion and desire for this role?' },
    { key: 'capacity', label: 'Has Capacity', description: 'Do you have the time and capability to fulfill this role?' }
  ];

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
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Explain your assessment:
            </label>
            {isEditing ? (
              <textarea
                value={formData[`gwc_${item.key}_feedback`] || ''}
                onChange={(e) => onChange(`gwc_${item.key}_feedback`, e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                rows={2}
                placeholder={`Explain why you ${formData[`gwc_${item.key}`] ? 'do' : 'don\'t'} ${item.label.toLowerCase()}...`}
              />
            ) : (
              <div className="p-3 bg-gray-700 rounded-md text-gray-300 min-h-[60px]">
                {assessment[`gwc_${item.key}_feedback`] || 'No explanation provided yet.'}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Strengths Section Component
const StrengthsSection = ({ assessment, formData, isEditing, onChange }) => (
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

// Manager Section Component
const ManagerSection = ({ assessment }) => (
  <div className="space-y-6">
    <div className="space-y-2">
      <h4 className="text-lg font-medium text-white">Manager Summary</h4>
      <div className="p-3 bg-gray-700 rounded-md text-gray-300 min-h-[100px]">
        {assessment.manager_summary_comments || 'Manager feedback pending.'}
      </div>
    </div>

    <div className="space-y-2">
      <h4 className="text-lg font-medium text-white">Development Plan</h4>
      <div className="p-3 bg-gray-700 rounded-md text-gray-300 min-h-[100px]">
        {assessment.manager_development_plan || 'Development plan pending.'}
      </div>
    </div>
  </div>
);