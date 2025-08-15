// src/components/pages/ManagerReviewRouter.tsx - Router-enabled manager review
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  User, 
  Calendar, 
  Clock, 
  Save, 
  ArrowLeft, 
  FileText, 
  MessageSquare,
  Star,
  Target,
  TrendingUp,
  Award
} from 'lucide-react';
import { useApp } from '../../contexts';
import { LoadingSpinner, ErrorMessage, Button, StatusBadge } from '../ui';
import { formatDate } from '../../utils';
import { supabase } from '../../services';

export default function ManagerReviewRouter() {
  const navigate = useNavigate();
  const { employeeId } = useParams<{ employeeId?: string }>();
  const [searchParams] = useSearchParams();
  
  // Get additional parameters from URL search params
  const assessmentId = searchParams.get('assessmentId');
  const employeeName = searchParams.get('employeeName');
  const cycleId = searchParams.get('cycleId');
  const cycleName = searchParams.get('cycleName');

  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [reviewData, setReviewData] = useState<{
    overall_rating: string;
    strengths: string;
    areas_of_improvement: string;
    goals_for_next_period: string;
    manager_comments: string;
    development_priorities: string;
    
    // Employee response feedback fields
    key_accomplishments_feedback: string;
    challenges_feedback: string;
    skills_feedback: string;
    goals_feedback: string;
    support_response: string;
    satisfaction_feedback: string;
    
    // Core values feedback
    passion_feedback: string;
    excellence_feedback: string;
    resilience_feedback: string;
    responsiveness_feedback: string;
    
    // Manager GWC assessments - allow null or boolean
    manager_gwc_gets_it: boolean | null;
    manager_gwc_gets_it_feedback: string;
    manager_gwc_wants_it: boolean | null;
    manager_gwc_wants_it_feedback: string;
    manager_gwc_capacity: boolean | null;
    manager_gwc_capacity_feedback: string;
    
    // Additional comments
    additional_manager_comments: string;
  }>({
    overall_rating: '',
    strengths: '',
    areas_of_improvement: '',
    goals_for_next_period: '',
    manager_comments: '',
    development_priorities: '',
    
    // Employee response feedback fields
    key_accomplishments_feedback: '',
    challenges_feedback: '',
    skills_feedback: '',
    goals_feedback: '',
    support_response: '',
    satisfaction_feedback: '',
    
    // Core values feedback
    passion_feedback: '',
    excellence_feedback: '',
    resilience_feedback: '',
    responsiveness_feedback: '',
    
    // Manager GWC assessments
    manager_gwc_gets_it: null,
    manager_gwc_gets_it_feedback: '',
    manager_gwc_wants_it: null,
    manager_gwc_wants_it_feedback: '',
    manager_gwc_capacity: null,
    manager_gwc_capacity_feedback: '',
    
    // Additional comments
    additional_manager_comments: ''
  });

  // Load assessment data
  useEffect(() => {
    const loadAssessment = async () => {
      console.log('🔍 ManagerReviewRouter loading assessment with:', {
        assessmentId,
        employeeId,
        searchParams: Object.fromEntries(searchParams.entries())
      });

      if (!assessmentId && !employeeId) {
        setError('No assessment or employee specified');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        let query = supabase
          .from('assessments')
          .select(`
            *,
            employee:employees!employee_id(*),
            cycle:review_cycles(*)
          `);

        if (assessmentId) {
          console.log('🔍 Querying by assessment ID:', assessmentId);
          query = query.eq('id', assessmentId);
        } else if (employeeId) {
          console.log('🔍 Querying by employee ID:', employeeId);
          query = query.eq('employee_id', employeeId);
        }

        console.log('🔍 About to execute query...');
        
        // For assessment ID queries, try the database function first
        if (assessmentId) {
          console.log('🔍 Trying get_assessment_for_manager_review function first...');
          try {
            const { data: functionData, error: functionError } = await supabase.rpc('get_assessment_for_manager_review', {
              p_assessment_id: parseInt(assessmentId)
            });
            
            console.log('🔍 Function result:', { functionData, functionError });
            
            if (functionError) {
              console.log('🔍 Function failed:', functionError);
              throw new Error(`Database function error: ${functionError.message}`);
            }
            
            if (functionData && functionData.length > 0) {
              const assessment = functionData[0];
              const transformedAssessment = {
                ...assessment,
                employee: {
                  id: assessment.employee_id,
                  name: assessment.employee_name,
                  email: assessment.employee_email,
                  job_title: assessment.employee_job_title
                },
                cycle: {
                  id: assessment.review_cycle_id,
                  name: assessment.cycle_name,
                  status: assessment.cycle_status
                }
              };
              
              console.log('🔍 Successfully loaded assessment via function:', transformedAssessment);
              setAssessment(transformedAssessment);
              
              // Pre-populate form if manager review data exists
              if (assessment.manager_review_data) {
                setReviewData(prev => ({
                  ...prev,
                  ...assessment.manager_review_data
                }));
              }
              return; // Success, exit early
            } else {
              throw new Error('Assessment function returned no data');
            }
          } catch (functionError) {
            console.error('🔍 Function approach failed:', functionError);
            // Continue to fallback approaches below
          }
        }
        
        // Fallback: Try direct query approaches
        console.log('🔍 Trying direct query as fallback...');
        try {
          const { data, error: fetchError } = await query.single();
          console.log('🔍 Direct query result:', { data, fetchError });
          
          if (fetchError) {
            // If direct query fails, try alternative approaches
            if (fetchError.code === 'PGRST116') {
              console.log('🔍 No rows returned - trying basic query...');
              
              // Try querying without joins first
              const { data: basicData, error: basicError } = await supabase
                .from('assessments')
                .select('*')
                .eq('id', assessmentId)
                .single();
                
              console.log('🔍 Basic query result:', { basicData, basicError });
              
              if (basicError) {
                throw new Error(`Assessment ID ${assessmentId} not found or access denied. This may be due to Row Level Security policies preventing direct table access.`);
              }
              
              // If basic query works, get related data separately
              const [employeeResult, cycleResult] = await Promise.all([
                supabase
                  .from('employees')
                  .select('*')
                  .eq('id', basicData.employee_id)
                  .single(),
                supabase
                  .from('review_cycles')
                  .select('*')
                  .eq('id', basicData.review_cycle_id)
                  .single()
              ]);
              
              console.log('🔍 Related data:', { employeeResult, cycleResult });
              
              const assessment = {
                ...basicData,
                employee: employeeResult.data,
                cycle: cycleResult.data
              };
              
              setAssessment(assessment);
              
              // Pre-populate form if manager review data exists
              if (assessment.manager_review_data) {
                setReviewData(prev => ({
                  ...prev,
                  ...assessment.manager_review_data
                }));
              }
            } else {
              throw fetchError;
            }
          } else {
            setAssessment(data);
            
            // Pre-populate form if manager review data exists
            if (data.manager_review_data) {
              setReviewData(prev => ({
                ...prev,
                ...data.manager_review_data
              }));
            }
          }
        } catch (queryError) {
          console.error('🔍 All query attempts failed:', queryError);
          throw queryError;
        }

      } catch (err: any) {
        console.error('Error loading assessment:', err);
        setError(`Failed to load assessment: ${err?.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    loadAssessment();
  }, [assessmentId, employeeId]);

  // Save manager review
  const handleSave = async () => {
    if (!assessment) return;

    try {
      setSaving(true);
      setError('');

      // Use the submit_manager_review function if available, otherwise direct update
      try {
        const { data, error: functionError } = await supabase.rpc('submit_manager_review', {
          p_assessment_id: assessment.id,
          p_manager_review_data: reviewData,
          p_overall_rating: reviewData.overall_rating,
          p_manager_comments: reviewData.manager_comments || ''
        });

        if (functionError) {
          console.log('Function submit failed, using direct update:', functionError);
          throw functionError;
        }

        console.log('Manager review submitted via function:', data);
        alert('Manager review submitted successfully!');
        navigate('/team');
        return;
      } catch (functionError) {
        console.log('Falling back to direct update...');
      }

      // Fallback to direct update
      const { error: updateError } = await supabase
        .from('assessments')
        .update({
          manager_review_data: reviewData,
          manager_review_status: 'completed',
          manager_reviewed_at: new Date().toISOString(),
          
          // Save individual GWC manager assessments
          manager_gwc_gets_it: reviewData.manager_gwc_gets_it,
          manager_gwc_gets_it_feedback: reviewData.manager_gwc_gets_it_feedback,
          manager_gwc_wants_it: reviewData.manager_gwc_wants_it,
          manager_gwc_wants_it_feedback: reviewData.manager_gwc_wants_it_feedback,
          manager_gwc_capacity: reviewData.manager_gwc_capacity,
          manager_gwc_capacity_feedback: reviewData.manager_gwc_capacity_feedback,
          
          // Save manager performance rating and summary
          manager_performance_rating: reviewData.overall_rating,
          manager_summary_comments: reviewData.manager_comments,
          
          updated_at: new Date().toISOString()
        })
        .eq('id', assessment.id);

      if (updateError) throw updateError;

      alert('Manager review saved successfully!');
      
      // Navigate back to team page
      navigate('/team');

    } catch (err: any) {
      console.error('Error saving review:', err);
      setError(`Failed to save review: ${err?.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/team');
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
            <span>Back to Team</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Manager Review</h1>
            <p className="text-gray-400">
              {assessment.employee?.name || employeeName} - {assessment.cycle?.name || cycleName}
            </p>
          </div>
        </div>
        <StatusBadge 
          status={assessment.manager_review_status} 
        />
      </div>

      {/* Employee Self-Assessment with Manager Feedback - Two Column Layout */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
          <User className="mr-2" size={20} />
          Employee Assessment & Manager Feedback
        </h2>

        {assessment.self_assessment_data ? (
          <div className="space-y-8">
            {/* Key Accomplishments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-cyan-300 mb-3">Employee Response: Key Accomplishments</h3>
                <div className="bg-gray-700 p-4 rounded-lg min-h-[120px]">
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">
                    {assessment.self_assessment_data.key_accomplishments || 'No response provided'}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-yellow-300 mb-3">Manager Feedback: Key Accomplishments</h3>
                <textarea
                  value={reviewData.key_accomplishments_feedback || ''}
                  onChange={(e) => setReviewData(prev => ({ ...prev, key_accomplishments_feedback: e.target.value }))}
                  rows={6}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
                  placeholder="Provide feedback on the employee's key accomplishments..."
                />
              </div>
            </div>

            {/* Challenges Faced */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-cyan-300 mb-3">Employee Response: Challenges Faced</h3>
                <div className="bg-gray-700 p-4 rounded-lg min-h-[120px]">
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">
                    {assessment.self_assessment_data.challenges_faced || 'No response provided'}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-yellow-300 mb-3">Manager Feedback: Challenges</h3>
                <textarea
                  value={reviewData.challenges_feedback || ''}
                  onChange={(e) => setReviewData(prev => ({ ...prev, challenges_feedback: e.target.value }))}
                  rows={6}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
                  placeholder="Provide feedback on how the employee handled challenges..."
                />
              </div>
            </div>

            {/* Skills Developed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-cyan-300 mb-3">Employee Response: Skills Developed</h3>
                <div className="bg-gray-700 p-4 rounded-lg min-h-[100px]">
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">
                    {assessment.self_assessment_data.skills_developed || 'No response provided'}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-yellow-300 mb-3">Manager Feedback: Skills Development</h3>
                <textarea
                  value={reviewData.skills_feedback || ''}
                  onChange={(e) => setReviewData(prev => ({ ...prev, skills_feedback: e.target.value }))}
                  rows={5}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
                  placeholder="Acknowledge skills development and suggest areas for growth..."
                />
              </div>
            </div>

            {/* Goals for Next Period */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-cyan-300 mb-3">Employee Response: Goals for Next Period</h3>
                <div className="bg-gray-700 p-4 rounded-lg min-h-[120px]">
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">
                    {assessment.self_assessment_data.goals_next_period || 'No response provided'}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-yellow-300 mb-3">Manager Feedback: Goals Alignment</h3>
                <textarea
                  value={reviewData.goals_feedback || ''}
                  onChange={(e) => setReviewData(prev => ({ ...prev, goals_feedback: e.target.value }))}
                  rows={6}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
                  placeholder="Provide feedback on proposed goals and suggest modifications or additions..."
                />
              </div>
            </div>

            {/* Support Needed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-cyan-300 mb-3">Employee Response: Support Needed</h3>
                <div className="bg-gray-700 p-4 rounded-lg min-h-[100px]">
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">
                    {assessment.self_assessment_data.support_needed || 'No response provided'}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-yellow-300 mb-3">Manager Response: Support & Resources</h3>
                <textarea
                  value={reviewData.support_response || ''}
                  onChange={(e) => setReviewData(prev => ({ ...prev, support_response: e.target.value }))}
                  rows={5}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
                  placeholder="Address support requests and identify additional resources you can provide..."
                />
              </div>
            </div>

            {/* Overall Satisfaction */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-cyan-300 mb-3">Employee Response: Overall Satisfaction</h3>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong>Level:</strong> {assessment.self_assessment_data.overall_satisfaction?.replace(/_/g, ' ').toUpperCase() || 'Not provided'}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-yellow-300 mb-3">Manager Comments: Satisfaction</h3>
                <textarea
                  value={reviewData.satisfaction_feedback || ''}
                  onChange={(e) => setReviewData(prev => ({ ...prev, satisfaction_feedback: e.target.value }))}
                  rows={4}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
                  placeholder="Comment on the employee's satisfaction level and discuss how to improve engagement..."
                />
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
                    <h4 className="font-medium text-cyan-300 mb-3">Employee: Passionate about our purpose</h4>
                    <div className="bg-gray-700 p-4 rounded-lg min-h-[120px]">
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">
                        {assessment.self_assessment_data.core_values_passionate_purpose || assessment.value_passionate_examples || 'No response provided'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-300 mb-3">Manager Feedback: Passion</h4>
                    <textarea
                      value={reviewData.passion_feedback || ''}
                      onChange={(e) => setReviewData(prev => ({ ...prev, passion_feedback: e.target.value }))}
                      rows={6}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
                      placeholder="Provide feedback on how the employee demonstrates passion for our purpose..."
                    />
                  </div>
                </div>

                {/* Driven to be the best */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-cyan-300 mb-3">Employee: Driven to be the best</h4>
                    <div className="bg-gray-700 p-4 rounded-lg min-h-[120px]">
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">
                        {assessment.self_assessment_data.core_values_driven_best || assessment.value_driven_examples || 'No response provided'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-300 mb-3">Manager Feedback: Excellence</h4>
                    <textarea
                      value={reviewData.excellence_feedback || ''}
                      onChange={(e) => setReviewData(prev => ({ ...prev, excellence_feedback: e.target.value }))}
                      rows={6}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
                      placeholder="Comment on the employee's drive for excellence and continuous improvement..."
                    />
                  </div>
                </div>

                {/* Resilient, rising stronger together */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-cyan-300 mb-3">Employee: Resilient, rising stronger together</h4>
                    <div className="bg-gray-700 p-4 rounded-lg min-h-[120px]">
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">
                        {assessment.self_assessment_data.core_values_resilient_together || assessment.value_resilient_examples || 'No response provided'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-300 mb-3">Manager Feedback: Resilience</h4>
                    <textarea
                      value={reviewData.resilience_feedback || ''}
                      onChange={(e) => setReviewData(prev => ({ ...prev, resilience_feedback: e.target.value }))}
                      rows={6}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
                      placeholder="Provide feedback on the employee's resilience and teamwork..."
                    />
                  </div>
                </div>

                {/* Respond swiftly and positively */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-cyan-300 mb-3">Employee: Respond swiftly and positively</h4>
                    <div className="bg-gray-700 p-4 rounded-lg min-h-[120px]">
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">
                        {assessment.self_assessment_data.core_values_respond_swiftly || assessment.value_responsive_examples || 'No response provided'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-300 mb-3">Manager Feedback: Responsiveness</h4>
                    <textarea
                      value={reviewData.responsiveness_feedback || ''}
                      onChange={(e) => setReviewData(prev => ({ ...prev, responsiveness_feedback: e.target.value }))}
                      rows={6}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
                      placeholder="Comment on the employee's responsiveness and customer focus..."
                    />
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
                    <h4 className="font-medium text-cyan-300 mb-3">Employee: Get It</h4>
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
                    <h4 className="font-medium text-yellow-300 mb-3">Manager Assessment: Get It</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="manager_gwc_gets_it"
                            value="true"
                            checked={reviewData.manager_gwc_gets_it === true}
                            onChange={(e) => setReviewData(prev => ({ ...prev, manager_gwc_gets_it: true }))}
                            className="text-green-600"
                          />
                          <span className="text-green-400">Yes - Gets it</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="manager_gwc_gets_it"
                            value="false"
                            checked={reviewData.manager_gwc_gets_it === false}
                            onChange={(e) => setReviewData(prev => ({ ...prev, manager_gwc_gets_it: false }))}
                            className="text-red-600"
                          />
                          <span className="text-red-400">No - Doesn't get it</span>
                        </label>
                      </div>
                      <textarea
                        value={reviewData.manager_gwc_gets_it_feedback || ''}
                        onChange={(e) => setReviewData(prev => ({ ...prev, manager_gwc_gets_it_feedback: e.target.value }))}
                        rows={4}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
                        placeholder="Explain your assessment of whether the employee truly 'gets' their role..."
                      />
                    </div>
                  </div>
                </div>

                {/* Want It */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-cyan-300 mb-3">Employee: Want It</h4>
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
                    <h4 className="font-medium text-yellow-300 mb-3">Manager Assessment: Want It</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="manager_gwc_wants_it"
                            value="true"
                            checked={reviewData.manager_gwc_wants_it === true}
                            onChange={(e) => setReviewData(prev => ({ ...prev, manager_gwc_wants_it: true }))}
                            className="text-green-600"
                          />
                          <span className="text-green-400">Yes - Wants it</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="manager_gwc_wants_it"
                            value="false"
                            checked={reviewData.manager_gwc_wants_it === false}
                            onChange={(e) => setReviewData(prev => ({ ...prev, manager_gwc_wants_it: false }))}
                            className="text-red-600"
                          />
                          <span className="text-red-400">No - Doesn't want it</span>
                        </label>
                      </div>
                      <textarea
                        value={reviewData.manager_gwc_wants_it_feedback || ''}
                        onChange={(e) => setReviewData(prev => ({ ...prev, manager_gwc_wants_it_feedback: e.target.value }))}
                        rows={4}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
                        placeholder="Explain your assessment of the employee's genuine desire for this role..."
                      />
                    </div>
                  </div>
                </div>

                {/* Capacity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-cyan-300 mb-3">Employee: Has Capacity</h4>
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
                    <h4 className="font-medium text-yellow-300 mb-3">Manager Assessment: Has Capacity</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="manager_gwc_capacity"
                            value="true"
                            checked={reviewData.manager_gwc_capacity === true}
                            onChange={(e) => setReviewData(prev => ({ ...prev, manager_gwc_capacity: true }))}
                            className="text-green-600"
                          />
                          <span className="text-green-400">Yes - Has capacity</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="manager_gwc_capacity"
                            value="false"
                            checked={reviewData.manager_gwc_capacity === false}
                            onChange={(e) => setReviewData(prev => ({ ...prev, manager_gwc_capacity: false }))}
                            className="text-red-600"
                          />
                          <span className="text-red-400">No - Lacks capacity</span>
                        </label>
                      </div>
                      <textarea
                        value={reviewData.manager_gwc_capacity_feedback || ''}
                        onChange={(e) => setReviewData(prev => ({ ...prev, manager_gwc_capacity_feedback: e.target.value }))}
                        rows={4}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
                        placeholder="Explain your assessment of the employee's capacity and ability to excel in this role..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Comments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-cyan-300 mb-3">Employee: Additional Comments</h3>
                <div className="bg-gray-700 p-4 rounded-lg min-h-[120px]">
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">
                    {assessment.self_assessment_data.additional_comments || 'No additional comments provided'}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-yellow-300 mb-3">Manager: Additional Comments</h3>
                <textarea
                  value={reviewData.additional_manager_comments || ''}
                  onChange={(e) => setReviewData(prev => ({ ...prev, additional_manager_comments: e.target.value }))}
                  rows={6}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
                  placeholder="Any additional thoughts, observations, or feedback..."
                />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-400">Employee has not completed their self-assessment yet.</p>
        )}
      </div>

      {/* Manager Review Form */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <MessageSquare className="mr-2" size={20} />
          Manager Review
        </h2>

        <div className="space-y-6">
          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Overall Performance Rating
            </label>
            <select
              value={reviewData.overall_rating}
              onChange={(e) => setReviewData(prev => ({ ...prev, overall_rating: e.target.value }))}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="">Select Rating</option>
              <option value="exceeds_expectations">Exceeds Expectations</option>
              <option value="meets_expectations">Meets Expectations</option>
              <option value="partially_meets">Partially Meets Expectations</option>
              <option value="does_not_meet">Does Not Meet Expectations</option>
            </select>
          </div>

          {/* Strengths */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Key Strengths & Accomplishments
            </label>
            <textarea
              value={reviewData.strengths}
              onChange={(e) => setReviewData(prev => ({ ...prev, strengths: e.target.value }))}
              rows={4}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
              placeholder="Highlight the employee's key strengths and notable accomplishments..."
            />
          </div>

          {/* Areas of Improvement */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Areas for Development
            </label>
            <textarea
              value={reviewData.areas_of_improvement}
              onChange={(e) => setReviewData(prev => ({ ...prev, areas_of_improvement: e.target.value }))}
              rows={4}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
              placeholder="Identify specific areas where the employee can grow and improve..."
            />
          </div>

          {/* Goals for Next Period */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Goals for Next Review Period
            </label>
            <textarea
              value={reviewData.goals_for_next_period}
              onChange={(e) => setReviewData(prev => ({ ...prev, goals_for_next_period: e.target.value }))}
              rows={4}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
              placeholder="Set clear, measurable goals for the upcoming period..."
            />
          </div>

          {/* Development Priorities */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Development Priorities
            </label>
            <textarea
              value={reviewData.development_priorities}
              onChange={(e) => setReviewData(prev => ({ ...prev, development_priorities: e.target.value }))}
              rows={3}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
              placeholder="Identify key skills or competencies to focus on..."
            />
          </div>

          {/* Manager Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Manager Comments
            </label>
            <textarea
              value={reviewData.manager_comments}
              onChange={(e) => setReviewData(prev => ({ ...prev, manager_comments: e.target.value }))}
              rows={4}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
              placeholder="Any additional feedback, observations, or comments..."
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button
          variant="secondary"
          onClick={handleBack}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          loading={saving}
          className="flex items-center space-x-2"
        >
          <Save size={16} />
          <span>Save Manager Review</span>
        </Button>
      </div>

      {error && (
        <ErrorMessage error={error} title="Save Error" />
      )}
    </div>
  );
}