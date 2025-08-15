// src/components/pages/AssessmentRouter.tsx - Router-enabled assessment component
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  User, 
  Calendar, 
  Clock, 
  Save, 
  ArrowLeft, 
  FileText,
  Star,
  Target,
  CheckCircle
} from 'lucide-react';
import { useApp } from '../../contexts';
import { LoadingSpinner, ErrorMessage, Button, StatusBadge } from '../ui';
import { formatDate } from '../../utils';
import { supabase } from '../../services';

export default function AssessmentRouter() {
  const navigate = useNavigate();
  const { assessmentId } = useParams<{ assessmentId?: string }>();
  const [searchParams] = useSearchParams();
  
  // Get additional parameters from URL search params if needed
  const cycleId = searchParams.get('cycleId');
  const cycleName = searchParams.get('cycleName');

  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    key_accomplishments: '',
    challenges_faced: '',
    skills_developed: '',
    goals_next_period: '',
    support_needed: '',
    overall_satisfaction: '',
    // Core Values Assessment - Company Specific
    core_values_passionate_purpose: '',
    core_values_driven_best: '',
    core_values_resilient_together: '',
    core_values_respond_swiftly: '',
    // GWC Assessment
    gwc_gets_it: false,
    gwc_gets_it_feedback: '',
    gwc_wants_it: false,
    gwc_wants_it_feedback: '',
    gwc_capacity: false,
    gwc_capacity_feedback: '',
    additional_comments: ''
  });

  // Load assessment data
  useEffect(() => {
    const loadAssessment = async () => {
      if (!assessmentId) {
        setError('No assessment ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const { data, error: fetchError } = await supabase
          .from('assessments')
          .select(`
            *,
            employee:employees!employee_id(*),
            cycle:review_cycles(*)
          `)
          .eq('id', assessmentId)
          .single();

        if (fetchError) throw fetchError;

        setAssessment(data);
        
        // Pre-populate form with existing data
        setFormData(prev => ({
          ...prev,
          // Core values from individual fields
          core_values_passionate_purpose: data.value_passionate_examples || '',
          core_values_driven_best: data.value_driven_examples || '',
          core_values_resilient_together: data.value_resilient_examples || '',
          core_values_respond_swiftly: data.value_responsive_examples || '',
          
          // GWC from individual fields
          gwc_gets_it: data.gwc_gets_it || false,
          gwc_gets_it_feedback: data.gwc_gets_it_feedback || '',
          gwc_wants_it: data.gwc_wants_it || false,
          gwc_wants_it_feedback: data.gwc_wants_it_feedback || '',
          gwc_capacity: data.gwc_capacity || false,
          gwc_capacity_feedback: data.gwc_capacity_feedback || '',
          
          // Additional data from self_assessment_data if available
          ...(data.self_assessment_data || {})
        }));

      } catch (err: any) {
        console.error('Error loading assessment:', err);
        setError(`Failed to load assessment: ${err?.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    loadAssessment();
  }, [assessmentId]);

  // Save self-assessment
  const handleSave = async () => {
    if (!assessment) return;

    try {
      setSaving(true);
      setError('');

      const { error: updateError } = await supabase
        .from('assessments')
        .update({
          // Save core values examples
          value_passionate_examples: formData.core_values_passionate_purpose,
          value_driven_examples: formData.core_values_driven_best,
          value_resilient_examples: formData.core_values_resilient_together,
          value_responsive_examples: formData.core_values_respond_swiftly,
          
          // Save GWC assessments
          gwc_gets_it: formData.gwc_gets_it,
          gwc_gets_it_feedback: formData.gwc_gets_it_feedback,
          gwc_wants_it: formData.gwc_wants_it,
          gwc_wants_it_feedback: formData.gwc_wants_it_feedback,
          gwc_capacity: formData.gwc_capacity,
          gwc_capacity_feedback: formData.gwc_capacity_feedback,
          
          // Additional assessment data
          self_assessment_data: formData,
          self_assessment_status: 'employee_complete',
          employee_submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', assessment.id);

      if (updateError) throw updateError;

      alert('Self-assessment submitted successfully!');
      
      // Navigate back to reviews page
      navigate('/reviews');

    } catch (err: any) {
      console.error('Error saving assessment:', err);
      setError(`Failed to save assessment: ${err?.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/reviews');
  };

  // Handle employee acknowledgment of manager review
  const handleAcknowledge = async () => {
    if (!assessment) return;

    try {
      setSaving(true);
      setError('');

      const { error: updateError } = await supabase
        .from('assessments')
        .update({
          self_assessment_status: 'acknowledged',
          employee_acknowledged_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', assessment.id);

      if (updateError) throw updateError;

      alert('Manager review acknowledged successfully!');
      
      // Navigate back to My Reviews since the process is complete
      navigate('/reviews');

    } catch (err: any) {
      console.error('Error acknowledging review:', err);
      setError(`Failed to acknowledge review: ${err?.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading assessment..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        error={error}
        title="Assessment Error"
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!assessment) {
    return (
      <ErrorMessage
        error="Assessment not found"
        title="Not Found"
        onRetry={handleBack}
      />
    );
  }

  const isCompleted = assessment.self_assessment_status === 'submitted' || assessment.self_assessment_status === 'employee_complete';
  const isManagerReviewComplete = assessment.manager_review_status === 'completed' && !assessment.employee_acknowledged_at;
  const isFullyComplete = !!assessment.employee_acknowledged_at;
  
  // For acknowledged assessments, always show the two-column format (no editing)
  const showTwoColumnFormat = assessment.manager_review_status === 'completed';
  const allowEditing = !isCompleted && !isFullyComplete;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft size={20} />
            <span>Back to Reviews</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Self-Assessment</h1>
            <p className="text-gray-400">
              {assessment.cycle?.name || cycleName} - Due: {formatDate(assessment.due_date)}
            </p>
          </div>
        </div>
        <StatusBadge 
          status={assessment.self_assessment_status} 
        />
      </div>

      {/* Assessment Info */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center">
              <FileText className="mr-2" size={20} />
              Assessment Details
            </h2>
            <p className="text-gray-400 mt-2">
              Complete your self-assessment for the {assessment.cycle?.name} review cycle
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Due Date</p>
            <p className="text-white font-medium">{formatDate(assessment.due_date)}</p>
          </div>
        </div>
      </div>

      {/* Self-Assessment Form - Only show if editing is allowed and not showing two-column format */}
      {allowEditing && !showTwoColumnFormat && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <User className="mr-2" size={20} />
            Self-Assessment Questions
          </h2>

          <div className="space-y-6">
            {/* Key Accomplishments */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What were your key accomplishments this period?
              </label>
              <textarea
                value={formData.key_accomplishments}
                onChange={(e) => setFormData(prev => ({ ...prev, key_accomplishments: e.target.value }))}
                rows={4}
                disabled={isCompleted}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none disabled:opacity-50"
                placeholder="Describe your major achievements in manufacturing/assembly, projects completed, production goals met, quality improvements, etc..."
              />
            </div>

            {/* Challenges Faced */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What challenges did you face and how did you overcome them?
              </label>
              <textarea
                value={formData.challenges_faced}
                onChange={(e) => setFormData(prev => ({ ...prev, challenges_faced: e.target.value }))}
                rows={4}
                disabled={isCompleted}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none disabled:opacity-50"
                placeholder="Discuss production challenges, equipment issues, quality problems encountered and how you solved them in our manufacturing environment..."
              />
            </div>

            {/* Skills Developed */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What new skills or knowledge did you develop?
              </label>
              <textarea
                value={formData.skills_developed}
                onChange={(e) => setFormData(prev => ({ ...prev, skills_developed: e.target.value }))}
                rows={3}
                disabled={isCompleted}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none disabled:opacity-50"
                placeholder="Highlight new manufacturing skills, technical training completed, safety certifications, equipment proficiencies gained..."
              />
            </div>

            {/* Goals for Next Period */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What are your goals for the next review period?
              </label>
              <textarea
                value={formData.goals_next_period}
                onChange={(e) => setFormData(prev => ({ ...prev, goals_next_period: e.target.value }))}
                rows={4}
                disabled={isCompleted}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none disabled:opacity-50"
                placeholder="Outline your goals for production efficiency, quality improvements, skill development, or process optimization for the next period..."
              />
            </div>

            {/* Support Needed */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What support or resources do you need to succeed?
              </label>
              <textarea
                value={formData.support_needed}
                onChange={(e) => setFormData(prev => ({ ...prev, support_needed: e.target.value }))}
                rows={3}
                disabled={isCompleted}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none disabled:opacity-50"
                placeholder="Identify manufacturing tools, technical training, equipment access, mentorship, or process improvements needed to excel..."
              />
            </div>

            {/* Overall Satisfaction */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Overall job satisfaction and engagement level
              </label>
              <select
                value={formData.overall_satisfaction}
                onChange={(e) => setFormData(prev => ({ ...prev, overall_satisfaction: e.target.value }))}
                disabled={isCompleted}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50"
              >
                <option value="">Select satisfaction level</option>
                <option value="very_satisfied">Very Satisfied</option>
                <option value="satisfied">Satisfied</option>
                <option value="neutral">Neutral</option>
                <option value="dissatisfied">Dissatisfied</option>
                <option value="very_dissatisfied">Very Dissatisfied</option>
              </select>
            </div>

            {/* Core Values Assessment */}
            <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Star className="mr-2" size={18} />
                Core Values Assessment
              </h3>
              <p className="text-gray-400 text-sm mb-2">
                <strong>Our Passion:</strong> Empowering Passionate People to Make a Difference
              </p>
              <p className="text-gray-400 text-sm mb-6">
                Demonstrate how you've lived our core values this period. Provide specific examples from your work in manufacturing and assembly solutions.
              </p>
              
              <div className="space-y-6">
                {/* 1. Passionate about our purpose */}
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-3">
                    1. Passionate about our purpose
                  </label>
                  <div className="ml-4 mb-3 space-y-1 text-xs text-gray-400">
                    <div>• We treat it like it's our own</div>
                    <div>• We find strength in our roots</div>
                    <div>• We find fun in what we do</div>
                  </div>
                  <textarea
                    value={formData.core_values_passionate_purpose}
                    onChange={(e) => setFormData(prev => ({ ...prev, core_values_passionate_purpose: e.target.value }))}
                    rows={4}
                    disabled={isCompleted}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none disabled:opacity-50"
                    placeholder="Share examples of how you treated projects like your own, drew strength from our company heritage, or brought passion and fun to your manufacturing/assembly work..."
                  />
                </div>

                {/* 2. Driven to be the best */}
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-3">
                    2. Driven to be the best
                  </label>
                  <div className="ml-4 mb-3 space-y-1 text-xs text-gray-400">
                    <div>• We cultivate an energetic environment</div>
                    <div>• Strive for continuous improvement</div>
                    <div>• We go further when we row together</div>
                  </div>
                  <textarea
                    value={formData.core_values_driven_best}
                    onChange={(e) => setFormData(prev => ({ ...prev, core_values_driven_best: e.target.value }))}
                    rows={4}
                    disabled={isCompleted}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none disabled:opacity-50"
                    placeholder="Describe how you energized your team, implemented process improvements in forging/casting/machining, or collaborated to achieve better results together..."
                  />
                </div>

                {/* 3. Resilient, rising stronger together */}
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-3">
                    3. Resilient, rising stronger together
                  </label>
                  <div className="ml-4 mb-3 space-y-1 text-xs text-gray-400">
                    <div>• We haven't come this far to only go this far</div>
                    <div>• Adapting and thriving, through challenges and change</div>
                    <div>• We keep going when others quit</div>
                  </div>
                  <textarea
                    value={formData.core_values_resilient_together}
                    onChange={(e) => setFormData(prev => ({ ...prev, core_values_resilient_together: e.target.value }))}
                    rows={4}
                    disabled={isCompleted}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none disabled:opacity-50"
                    placeholder="Share examples of persevering through production challenges, adapting to new manufacturing requirements, or helping your team overcome obstacles..."
                  />
                </div>

                {/* 4. Respond swiftly and positively */}
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-3">
                    4. Respond swiftly and positively
                  </label>
                  <div className="ml-4 mb-3 space-y-1 text-xs text-gray-400">
                    <div>• We put our customers first</div>
                    <div>• Above and beyond is our standard</div>
                    <div>• We listen carefully and understand before solving</div>
                  </div>
                  <textarea
                    value={formData.core_values_respond_swiftly}
                    onChange={(e) => setFormData(prev => ({ ...prev, core_values_respond_swiftly: e.target.value }))}
                    rows={4}
                    disabled={isCompleted}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none disabled:opacity-50"
                    placeholder="Provide examples of prioritizing customer needs, exceeding expectations in delivery/quality, or taking time to understand problems before implementing solutions..."
                  />
                </div>
              </div>
            </div>

            {/* GWC Assessment */}
            <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Target className="mr-2" size={18} />
                GWC Assessment (Get it, Want it, Capacity to do it)
              </h3>
              <p className="text-gray-400 text-sm mb-2">
                <strong>Our Niche:</strong> Optimized manufacturing and assembly solutions: From forging and casting to machining and final assembly, we handle it all
              </p>
              <p className="text-gray-400 text-sm mb-6">
                Assess your role fit using the GWC framework. Be honest about your alignment with your position in our manufacturing environment.
              </p>
              
              <div className="space-y-6">
                {/* Get It */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.gwc_gets_it}
                      onChange={(e) => setFormData(prev => ({ ...prev, gwc_gets_it: e.target.checked }))}
                      disabled={isCompleted}
                      className="w-5 h-5 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 disabled:opacity-50"
                    />
                    <div>
                      <h4 className="text-lg font-medium text-white">Get It</h4>
                      <p className="text-sm text-gray-400">Do you understand and grasp your role, responsibilities, and our culture?</p>
                    </div>
                  </div>
                  
                  {/* Only show comment box if answer is No (unchecked) */}
                  {!formData.gwc_gets_it && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Please explain why not:
                      </label>
                      <textarea
                        value={formData.gwc_gets_it_feedback}
                        onChange={(e) => setFormData(prev => ({ ...prev, gwc_gets_it_feedback: e.target.value }))}
                        rows={2}
                        disabled={isCompleted}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none disabled:opacity-50"
                        placeholder="Explain what aspects of your role or our culture you don't understand..."
                      />
                    </div>
                  )}
                </div>

                {/* Want It */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.gwc_wants_it}
                      onChange={(e) => setFormData(prev => ({ ...prev, gwc_wants_it: e.target.checked }))}
                      disabled={isCompleted}
                      className="w-5 h-5 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 disabled:opacity-50"
                    />
                    <div>
                      <h4 className="text-lg font-medium text-white">Want It</h4>
                      <p className="text-sm text-gray-400">Do you genuinely enjoy and want to do this role?</p>
                    </div>
                  </div>
                  
                  {/* Only show comment box if answer is No (unchecked) */}
                  {!formData.gwc_wants_it && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Please explain why not:
                      </label>
                      <textarea
                        value={formData.gwc_wants_it_feedback}
                        onChange={(e) => setFormData(prev => ({ ...prev, gwc_wants_it_feedback: e.target.value }))}
                        rows={2}
                        disabled={isCompleted}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none disabled:opacity-50"
                        placeholder="Explain why you don't enjoy or want this role..."
                      />
                    </div>
                  )}
                </div>

                {/* Capacity */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.gwc_capacity}
                      onChange={(e) => setFormData(prev => ({ ...prev, gwc_capacity: e.target.checked }))}
                      disabled={isCompleted}
                      className="w-5 h-5 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 disabled:opacity-50"
                    />
                    <div>
                      <h4 className="text-lg font-medium text-white">Has Capacity</h4>
                      <p className="text-sm text-gray-400">Do you have the time, skills, and ability to excel in this role?</p>
                    </div>
                  </div>
                  
                  {/* Only show comment box if answer is No (unchecked) */}
                  {!formData.gwc_capacity && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Please explain why not:
                      </label>
                      <textarea
                        value={formData.gwc_capacity_feedback}
                        onChange={(e) => setFormData(prev => ({ ...prev, gwc_capacity_feedback: e.target.value }))}
                        rows={2}
                        disabled={isCompleted}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none disabled:opacity-50"
                        placeholder="Explain what capacity limitations you have..."
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Additional comments or feedback
              </label>
              <textarea
                value={formData.additional_comments}
                onChange={(e) => setFormData(prev => ({ ...prev, additional_comments: e.target.value }))}
                rows={4}
                disabled={isCompleted}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none disabled:opacity-50"
                placeholder="Any other thoughts, suggestions, or feedback you'd like to share..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Manager Feedback Section - Two Column Format when review is complete */}
      {showTwoColumnFormat && assessment.manager_review_data && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <User className="mr-2" size={20} />
            Your Assessment & Manager Feedback
          </h2>

          <div className="space-y-8">
            {/* Key Accomplishments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-cyan-300 mb-3">Your Response: Key Accomplishments</h3>
                <div className="bg-gray-700 p-4 rounded-lg min-h-[120px]">
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">
                    {assessment.self_assessment_data?.key_accomplishments || 'No response provided'}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-blue-300 mb-3">Manager Feedback: Key Accomplishments</h3>
                <div className="bg-blue-900/30 p-4 rounded-lg min-h-[120px] border border-blue-700/50">
                  <p className="text-blue-100 text-sm whitespace-pre-wrap">
                    {assessment.manager_review_data.key_accomplishments_feedback || 'No feedback provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Challenges Faced */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-cyan-300 mb-3">Your Response: Challenges Faced</h3>
                <div className="bg-gray-700 p-4 rounded-lg min-h-[120px]">
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">
                    {assessment.self_assessment_data?.challenges_faced || 'No response provided'}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-blue-300 mb-3">Manager Feedback: Challenges</h3>
                <div className="bg-blue-900/30 p-4 rounded-lg min-h-[120px] border border-blue-700/50">
                  <p className="text-blue-100 text-sm whitespace-pre-wrap">
                    {assessment.manager_review_data.challenges_feedback || 'No feedback provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Skills Developed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-cyan-300 mb-3">Your Response: Skills Developed</h3>
                <div className="bg-gray-700 p-4 rounded-lg min-h-[100px]">
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">
                    {assessment.self_assessment_data?.skills_developed || 'No response provided'}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-blue-300 mb-3">Manager Feedback: Skills Development</h3>
                <div className="bg-blue-900/30 p-4 rounded-lg min-h-[100px] border border-blue-700/50">
                  <p className="text-blue-100 text-sm whitespace-pre-wrap">
                    {assessment.manager_review_data.skills_feedback || 'No feedback provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Goals for Next Period */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-cyan-300 mb-3">Your Response: Goals for Next Period</h3>
                <div className="bg-gray-700 p-4 rounded-lg min-h-[120px]">
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">
                    {assessment.self_assessment_data?.goals_next_period || 'No response provided'}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-blue-300 mb-3">Manager Feedback: Goals Alignment</h3>
                <div className="bg-blue-900/30 p-4 rounded-lg min-h-[120px] border border-blue-700/50">
                  <p className="text-blue-100 text-sm whitespace-pre-wrap">
                    {assessment.manager_review_data.goals_feedback || 'No feedback provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Support Needed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-cyan-300 mb-3">Your Response: Support Needed</h3>
                <div className="bg-gray-700 p-4 rounded-lg min-h-[100px]">
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">
                    {assessment.self_assessment_data?.support_needed || 'No response provided'}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-blue-300 mb-3">Manager Response: Support & Resources</h3>
                <div className="bg-blue-900/30 p-4 rounded-lg min-h-[100px] border border-blue-700/50">
                  <p className="text-blue-100 text-sm whitespace-pre-wrap">
                    {assessment.manager_review_data.support_response || 'No feedback provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Overall Satisfaction */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-cyan-300 mb-3">Your Response: Overall Satisfaction</h3>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong>Level:</strong> {assessment.self_assessment_data?.overall_satisfaction?.replace(/_/g, ' ').toUpperCase() || 'Not provided'}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-blue-300 mb-3">Manager Comments: Satisfaction</h3>
                <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                  <p className="text-blue-100 text-sm whitespace-pre-wrap">
                    {assessment.manager_review_data.satisfaction_feedback || 'No feedback provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Core Values Assessment */}
            <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                <Star className="mr-2" size={18} />
                Core Values Assessment
              </h3>
              
              <div className="space-y-8">
                {/* Passionate about our purpose */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-cyan-300 mb-3">Your Response: Passionate about our purpose</h4>
                    <div className="bg-gray-700 p-4 rounded-lg min-h-[120px]">
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">
                        {assessment.self_assessment_data?.core_values_passionate_purpose || assessment.value_passionate_examples || 'No response provided'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-300 mb-3">Manager Feedback: Passion</h4>
                    <div className="bg-blue-900/30 p-4 rounded-lg min-h-[120px] border border-blue-700/50">
                      <p className="text-blue-100 text-sm whitespace-pre-wrap">
                        {assessment.manager_review_data.passion_feedback || 'No feedback provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Driven to be the best */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-cyan-300 mb-3">Your Response: Driven to be the best</h4>
                    <div className="bg-gray-700 p-4 rounded-lg min-h-[120px]">
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">
                        {assessment.self_assessment_data?.core_values_driven_best || assessment.value_driven_examples || 'No response provided'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-300 mb-3">Manager Feedback: Excellence</h4>
                    <div className="bg-blue-900/30 p-4 rounded-lg min-h-[120px] border border-blue-700/50">
                      <p className="text-blue-100 text-sm whitespace-pre-wrap">
                        {assessment.manager_review_data.excellence_feedback || 'No feedback provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Resilient, rising stronger together */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-cyan-300 mb-3">Your Response: Resilient, rising stronger together</h4>
                    <div className="bg-gray-700 p-4 rounded-lg min-h-[120px]">
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">
                        {assessment.self_assessment_data?.core_values_resilient_together || assessment.value_resilient_examples || 'No response provided'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-300 mb-3">Manager Feedback: Resilience</h4>
                    <div className="bg-blue-900/30 p-4 rounded-lg min-h-[120px] border border-blue-700/50">
                      <p className="text-blue-100 text-sm whitespace-pre-wrap">
                        {assessment.manager_review_data.resilience_feedback || 'No feedback provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Respond swiftly and positively */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-cyan-300 mb-3">Your Response: Respond swiftly and positively</h4>
                    <div className="bg-gray-700 p-4 rounded-lg min-h-[120px]">
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">
                        {assessment.self_assessment_data?.core_values_respond_swiftly || assessment.value_responsive_examples || 'No response provided'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-300 mb-3">Manager Feedback: Responsiveness</h4>
                    <div className="bg-blue-900/30 p-4 rounded-lg min-h-[120px] border border-blue-700/50">
                      <p className="text-blue-100 text-sm whitespace-pre-wrap">
                        {assessment.manager_review_data.responsiveness_feedback || 'No feedback provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* GWC Assessment */}
            <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                <Target className="mr-2" size={18} />
                GWC Assessment (Get it, Want it, Capacity to do it)
              </h3>
              
              <div className="space-y-8">
                {/* Get It */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-cyan-300 mb-3">Your Response: Get It</h4>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          assessment.gwc_gets_it ? 'bg-green-600 border-green-600' : 'bg-red-600 border-red-600'
                        }`}>
                          {assessment.gwc_gets_it ? '✓' : '✗'}
                        </div>
                        <span className="text-gray-300">
                          {assessment.gwc_gets_it ? 'Yes - Gets the role' : 'No - Does not get the role'}
                        </span>
                      </div>
                      {assessment.gwc_gets_it_feedback && (
                        <p className="text-gray-300 text-sm whitespace-pre-wrap">
                          <strong>Explanation:</strong> {assessment.gwc_gets_it_feedback}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-300 mb-3">Manager Assessment: Get It</h4>
                    <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          assessment.manager_gwc_gets_it ? 'bg-green-600 border-green-600' : 'bg-red-600 border-red-600'
                        }`}>
                          {assessment.manager_gwc_gets_it ? '✓' : '✗'}
                        </div>
                        <span className="text-blue-100">
                          {assessment.manager_gwc_gets_it ? 'Yes - Gets the role' : 'No - Does not get the role'}
                        </span>
                      </div>
                      {assessment.manager_gwc_gets_it_feedback && (
                        <p className="text-blue-100 text-sm whitespace-pre-wrap">
                          <strong>Manager's Assessment:</strong> {assessment.manager_gwc_gets_it_feedback}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Want It */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-cyan-300 mb-3">Your Response: Want It</h4>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          assessment.gwc_wants_it ? 'bg-green-600 border-green-600' : 'bg-red-600 border-red-600'
                        }`}>
                          {assessment.gwc_wants_it ? '✓' : '✗'}
                        </div>
                        <span className="text-gray-300">
                          {assessment.gwc_wants_it ? 'Yes - Wants the role' : 'No - Does not want the role'}
                        </span>
                      </div>
                      {assessment.gwc_wants_it_feedback && (
                        <p className="text-gray-300 text-sm whitespace-pre-wrap">
                          <strong>Explanation:</strong> {assessment.gwc_wants_it_feedback}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-300 mb-3">Manager Assessment: Want It</h4>
                    <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          assessment.manager_gwc_wants_it ? 'bg-green-600 border-green-600' : 'bg-red-600 border-red-600'
                        }`}>
                          {assessment.manager_gwc_wants_it ? '✓' : '✗'}
                        </div>
                        <span className="text-blue-100">
                          {assessment.manager_gwc_wants_it ? 'Yes - Wants the role' : 'No - Does not want the role'}
                        </span>
                      </div>
                      {assessment.manager_gwc_wants_it_feedback && (
                        <p className="text-blue-100 text-sm whitespace-pre-wrap">
                          <strong>Manager's Assessment:</strong> {assessment.manager_gwc_wants_it_feedback}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Capacity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-cyan-300 mb-3">Your Response: Has Capacity</h4>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          assessment.gwc_capacity ? 'bg-green-600 border-green-600' : 'bg-red-600 border-red-600'
                        }`}>
                          {assessment.gwc_capacity ? '✓' : '✗'}
                        </div>
                        <span className="text-gray-300">
                          {assessment.gwc_capacity ? 'Yes - Has capacity' : 'No - Lacks capacity'}
                        </span>
                      </div>
                      {assessment.gwc_capacity_feedback && (
                        <p className="text-gray-300 text-sm whitespace-pre-wrap">
                          <strong>Explanation:</strong> {assessment.gwc_capacity_feedback}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-300 mb-3">Manager Assessment: Has Capacity</h4>
                    <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          assessment.manager_gwc_capacity ? 'bg-green-600 border-green-600' : 'bg-red-600 border-red-600'
                        }`}>
                          {assessment.manager_gwc_capacity ? '✓' : '✗'}
                        </div>
                        <span className="text-blue-100">
                          {assessment.manager_gwc_capacity ? 'Yes - Has capacity' : 'No - Lacks capacity'}
                        </span>
                      </div>
                      {assessment.manager_gwc_capacity_feedback && (
                        <p className="text-blue-100 text-sm whitespace-pre-wrap">
                          <strong>Manager's Assessment:</strong> {assessment.manager_gwc_capacity_feedback}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Comments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-cyan-300 mb-3">Your Additional Comments</h3>
                <div className="bg-gray-700 p-4 rounded-lg min-h-[120px]">
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">
                    {assessment.self_assessment_data?.additional_comments || 'No additional comments provided'}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-blue-300 mb-3">Manager Additional Comments</h3>
                <div className="bg-blue-900/30 p-4 rounded-lg min-h-[120px] border border-blue-700/50">
                  <p className="text-blue-100 text-sm whitespace-pre-wrap">
                    {assessment.manager_review_data.additional_manager_comments || 'No additional comments provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Action Buttons - Only show for assessments that allow editing */}
      {allowEditing && (
        <div className="flex justify-end space-x-4">
          <Button
            variant="secondary"
            onClick={handleBack}
          >
            Save Draft & Exit
          </Button>
          <Button
            onClick={handleSave}
            loading={saving}
            className="flex items-center space-x-2"
          >
            <Save size={16} />
            <span>Submit Assessment</span>
          </Button>
        </div>
      )}

      {/* Acknowledgment Button - Only show if manager review is complete but not yet acknowledged */}
      {isManagerReviewComplete && (
        <div className="bg-blue-900 border border-blue-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-blue-200 font-semibold text-lg">Manager Review Complete</h3>
              <p className="text-blue-300 text-sm mt-1">
                Please review your manager's feedback above and acknowledge that you have read and understood it.
              </p>
            </div>
            <Button
              onClick={handleAcknowledge}
              loading={saving}
              className="bg-blue-600 hover:bg-blue-700 border-blue-600 flex items-center space-x-2"
            >
              <CheckCircle size={16} />
              <span>Acknowledge Review</span>
            </Button>
          </div>
        </div>
      )}

      {isCompleted && !showTwoColumnFormat && !isFullyComplete && (
        <div className="bg-green-900 border border-green-700 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="text-green-400" size={24} />
            <div>
              <h3 className="text-green-200 font-semibold">Assessment Completed</h3>
              <p className="text-green-300 text-sm">
                You have successfully submitted your self-assessment. Your manager will review it soon.
              </p>
            </div>
          </div>
        </div>
      )}

      {isFullyComplete && (
        <div className="bg-green-900 border border-green-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="text-green-400" size={24} />
              <div>
                <h3 className="text-green-200 font-semibold">Review Process Complete</h3>
                <p className="text-green-300 text-sm">
                  You have successfully acknowledged your manager's review. The review process is now complete.
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={handleBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft size={16} />
              <span>Back to Reviews</span>
            </Button>
          </div>
        </div>
      )}

      {error && (
        <ErrorMessage error={error} title="Save Error" />
      )}
    </div>
  );
}