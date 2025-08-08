// src/components/pages/ManagerReview.js - Manager interface for reviewing employee assessments
import React, { useState, useEffect } from 'react';
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

export default function ManagerReview({ pageProps = {} }) {
  const { setActivePage } = useApp();
  const { 
    assessmentId, 
    employeeId, 
    employeeName, 
    cycleId, 
    cycleName 
  } = pageProps;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [managerFeedback, setManagerFeedback] = useState({
    overall_performance: '',
    strengths: '',
    areas_for_improvement: '',
    goals_for_next_period: '',
    development_recommendations: '',
    rating: 3
  });

  // Fetch assessment data
  useEffect(() => {
    if (assessmentId) {
      fetchAssessmentData();
    }
  }, [assessmentId]);

  const fetchAssessmentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch assessment details including employee self-assessment
      const { data, error } = await supabase
        .from('assessments')
        .select(`
          *,
          employee:employees(name, email, job_title),
          review_cycles!review_cycle_id(name, description, start_date, end_date)
        `)
        .eq('id', assessmentId)
        .single();

      if (error) throw error;

      setAssessment(data);

      // Load existing manager feedback if available
      if (data.manager_feedback && Object.keys(data.manager_feedback).length > 0) {
        setManagerFeedback(prev => ({
          ...prev,
          ...data.manager_feedback
        }));
      }
    } catch (err) {
      console.error('Error fetching assessment data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReview = async () => {
    try {
      setSaving(true);
      setError(null);

      // Update assessment with manager feedback
      const { error: updateError } = await supabase
        .from('assessments')
        .update({
          manager_feedback: managerFeedback,
          manager_review_status: 'completed',
          manager_reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', assessmentId);

      if (updateError) throw updateError;

      // Navigate back to My Team
      setActivePage({ name: 'My Team', props: {} });
    } catch (err) {
      console.error('Error saving manager review:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setManagerFeedback(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" message="Loading assessment..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorMessage 
          error={error} 
          title="Error Loading Assessment" 
          onRetry={fetchAssessmentData}
        />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <FileText size={64} className="mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Assessment Not Found</h3>
          <p className="text-gray-400">The requested assessment could not be found.</p>
          <Button 
            onClick={() => setActivePage({ name: 'My Team', props: {} })}
            className="mt-4"
          >
            Return to My Team
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button 
            variant="secondary" 
            onClick={() => setActivePage({ name: 'My Team', props: {} })}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to My Team
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-cyan-400">Manager Review</h1>
            <p className="text-gray-400 mt-1">
              Review assessment for {assessment.employee?.name}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="primary"
            onClick={handleSaveReview}
            disabled={saving}
          >
            <Save size={16} className="mr-2" />
            {saving ? 'Saving...' : 'Complete Review'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Employee Self-Assessment (Left Side) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assessment Info */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center">
                <User className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{assessment.employee?.name}</h2>
                <p className="text-gray-400">{assessment.employee?.job_title}</p>
                <p className="text-gray-500 text-sm">{assessment.employee?.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-400">Review Cycle</p>
                <p className="text-white font-medium">{assessment.review_cycles?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Period</p>
                <p className="text-white">
                  {formatDate(assessment.review_cycles?.start_date)} - {formatDate(assessment.review_cycles?.end_date)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <StatusBadge 
                  status={assessment.self_assessment_status} 
                  color={assessment.self_assessment_status === 'submitted' ? 'green' : 'yellow'}
                />
              </div>
            </div>
          </div>

          {/* Employee Self-Assessment */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FileText className="mr-2 text-cyan-400" size={20} />
              Employee Self-Assessment
            </h3>
            
            {assessment.self_assessment_status === 'submitted' && (
              assessment.value_passionate_rating || assessment.self_assessment_data
            ) ? (
              <div className="space-y-4">
                {/* Core Values Assessment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-b border-gray-700 pb-4">
                    <p className="text-gray-300 font-medium mb-2">Passionate</p>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-cyan-400">Rating:</span>
                      <span className="text-white">{assessment.value_passionate_rating || 'Not rated'}/5</span>
                    </div>
                    <p className="text-gray-400 text-sm">{assessment.value_passionate_examples || 'No examples provided'}</p>
                  </div>
                  
                  <div className="border-b border-gray-700 pb-4">
                    <p className="text-gray-300 font-medium mb-2">Driven</p>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-cyan-400">Rating:</span>
                      <span className="text-white">{assessment.value_driven_rating || 'Not rated'}/5</span>
                    </div>
                    <p className="text-gray-400 text-sm">{assessment.value_driven_examples || 'No examples provided'}</p>
                  </div>
                  
                  <div className="border-b border-gray-700 pb-4">
                    <p className="text-gray-300 font-medium mb-2">Resilient</p>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-cyan-400">Rating:</span>
                      <span className="text-white">{assessment.value_resilient_rating || 'Not rated'}/5</span>
                    </div>
                    <p className="text-gray-400 text-sm">{assessment.value_resilient_examples || 'No examples provided'}</p>
                  </div>
                  
                  <div className="border-b border-gray-700 pb-4">
                    <p className="text-gray-300 font-medium mb-2">Responsive</p>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-cyan-400">Rating:</span>
                      <span className="text-white">{assessment.value_responsive_rating || 'Not rated'}/5</span>
                    </div>
                    <p className="text-gray-400 text-sm">{assessment.value_responsive_examples || 'No examples provided'}</p>
                  </div>
                </div>

                {/* GWC Assessment */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-300 font-medium mb-2">Gets It</p>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs ${assessment.gwc_gets_it ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                        {assessment.gwc_gets_it ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{assessment.gwc_gets_it_feedback || 'No feedback provided'}</p>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-300 font-medium mb-2">Wants It</p>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs ${assessment.gwc_wants_it ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                        {assessment.gwc_wants_it ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{assessment.gwc_wants_it_feedback || 'No feedback provided'}</p>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-300 font-medium mb-2">Capacity</p>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs ${assessment.gwc_capacity ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                        {assessment.gwc_capacity ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{assessment.gwc_capacity_feedback || 'No feedback provided'}</p>
                  </div>
                </div>

                {/* Employee Reflection */}
                {(assessment.employee_strengths || assessment.employee_improvements) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {assessment.employee_strengths && (
                      <div className="bg-gray-700 rounded-lg p-4">
                        <p className="text-gray-300 font-medium mb-2">Strengths</p>
                        <p className="text-gray-400 text-sm">{assessment.employee_strengths}</p>
                      </div>
                    )}
                    {assessment.employee_improvements && (
                      <div className="bg-gray-700 rounded-lg p-4">
                        <p className="text-gray-300 font-medium mb-2">Areas for Improvement</p>
                        <p className="text-gray-400 text-sm">{assessment.employee_improvements}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400">No self-assessment data available.</p>
            )}
          </div>
        </div>

        {/* Manager Review Form (Right Side) */}
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <MessageSquare className="mr-2 text-cyan-400" size={20} />
              Your Review
            </h3>
            
            <div className="space-y-4">
              {/* Overall Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Overall Performance Rating
                </label>
                <select
                  value={managerFeedback.rating}
                  onChange={(e) => handleInputChange('rating', parseInt(e.target.value))}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value={1}>1 - Needs Improvement</option>
                  <option value={2}>2 - Below Expectations</option>
                  <option value={3}>3 - Meets Expectations</option>
                  <option value={4}>4 - Exceeds Expectations</option>
                  <option value={5}>5 - Outstanding</option>
                </select>
              </div>

              {/* Overall Performance */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Overall Performance Summary
                </label>
                <textarea
                  value={managerFeedback.overall_performance}
                  onChange={(e) => handleInputChange('overall_performance', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  rows={3}
                  placeholder="Provide an overall summary of the employee's performance..."
                />
              </div>

              {/* Strengths */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Key Strengths
                </label>
                <textarea
                  value={managerFeedback.strengths}
                  onChange={(e) => handleInputChange('strengths', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  rows={3}
                  placeholder="What are this employee's key strengths?"
                />
              </div>

              {/* Areas for Improvement */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Areas for Improvement
                </label>
                <textarea
                  value={managerFeedback.areas_for_improvement}
                  onChange={(e) => handleInputChange('areas_for_improvement', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  rows={3}
                  placeholder="What areas could this employee focus on improving?"
                />
              </div>

              {/* Goals for Next Period */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Goals for Next Period
                </label>
                <textarea
                  value={managerFeedback.goals_for_next_period}
                  onChange={(e) => handleInputChange('goals_for_next_period', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  rows={3}
                  placeholder="What goals should this employee focus on next?"
                />
              </div>

              {/* Development Recommendations */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Development Recommendations
                </label>
                <textarea
                  value={managerFeedback.development_recommendations}
                  onChange={(e) => handleInputChange('development_recommendations', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  rows={3}
                  placeholder="What development opportunities would you recommend?"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="space-y-3">
              <Button 
                variant="primary"
                onClick={handleSaveReview}
                disabled={saving}
                className="w-full"
              >
                <Save size={16} className="mr-2" />
                {saving ? 'Saving Review...' : 'Complete Review'}
              </Button>
              
              <Button 
                variant="secondary"
                onClick={() => setActivePage({ name: 'My Team', props: {} })}
                className="w-full"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to My Team
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}