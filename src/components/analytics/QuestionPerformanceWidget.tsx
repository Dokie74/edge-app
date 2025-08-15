// src/components/analytics/QuestionPerformanceWidget.tsx - Top/Bottom questions widget
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Award, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

interface QuestionPerformance {
  question_id: string;
  question_text: string;
  avg_response: number;
  total_responses: number;
  satisfaction_percentage: number;
  performance_rank: 'top' | 'bottom';
}

interface QuestionPerformanceWidgetProps {
  departmentFilter?: string;
  managerIdFilter?: string;
  title?: string;
  className?: string;
}

export default function QuestionPerformanceWidget({ 
  departmentFilter, 
  managerIdFilter, 
  title = "Question Performance",
  className = ""
}: QuestionPerformanceWidgetProps) {
  const [questionData, setQuestionData] = useState<QuestionPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQuestionPerformance = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .rpc('get_question_performance_ranking', {
          department_filter: departmentFilter || null,
          manager_id_filter: managerIdFilter || null,
          days_back: 30
        });

      if (error) throw error;
      setQuestionData(data || []);
    } catch (err: any) {
      console.error('Error loading question performance:', err);
      let errorMessage = 'Failed to load question performance data';
      
      if (err.message && err.message.includes('ambiguous')) {
        errorMessage = 'Database function needs to be updated. Run fix_question_performance_function.sql';
      } else if (err.message && err.message.includes('function') && err.message.includes('does not exist')) {
        errorMessage = 'Database functions not found. Run pulse_questions_management.sql first';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestionPerformance();
  }, [departmentFilter, managerIdFilter]);

  const topQuestions = questionData.filter(q => q.performance_rank === 'top');
  const bottomQuestions = questionData.filter(q => q.performance_rank === 'bottom');

  const truncateText = (text: string, maxLength: number = 80) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getPerformanceColor = (rank: 'top' | 'bottom', avgResponse: number) => {
    if (rank === 'top') {
      return avgResponse >= 4.5 ? 'text-green-400' : 'text-blue-400';
    } else {
      return avgResponse <= 2.5 ? 'text-red-400' : 'text-orange-400';
    }
  };

  const getPerformanceIcon = (rank: 'top' | 'bottom') => {
    return rank === 'top' ? 
      <TrendingUp className="text-green-400" size={16} /> : 
      <TrendingDown className="text-red-400" size={16} />;
  };

  if (loading) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <BarChart3 className="mr-2" size={20} />
            {title}
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400"></div>
          <span className="ml-2 text-gray-400">Loading performance data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <BarChart3 className="mr-2" size={20} />
            {title}
          </h3>
          <button
            onClick={loadQuestionPerformance}
            className="p-1 text-gray-400 hover:text-cyan-400 transition-colors"
            title="Retry"
          >
            <RefreshCw size={16} />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-8">
          <AlertTriangle className="text-red-400 mb-3" size={24} />
          <span className="text-red-400 text-center mb-4">{error}</span>
          {error.includes('fix_question_performance_function.sql') && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-xs text-red-300 max-w-md">
              <p className="font-medium mb-2">To fix this error:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Go to Supabase SQL Editor</li>
                <li>Run the file: <code className="bg-red-800 px-1 rounded">fix_question_performance_function.sql</code></li>
                <li>Refresh this page</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (questionData.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <BarChart3 className="mr-2" size={20} />
            {title}
          </h3>
        </div>
        <div className="text-center py-8">
          <BarChart3 className="mx-auto mb-3 text-gray-500" size={32} />
          <p className="text-gray-400">Not enough response data available</p>
          <p className="text-gray-500 text-sm">Need at least 3 responses per question</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <BarChart3 className="mr-2" size={20} />
          {title}
        </h3>
        <button
          onClick={loadQuestionPerformance}
          className="p-1 text-gray-400 hover:text-cyan-400 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="space-y-6">
        {/* Top Performing Questions */}
        {topQuestions.length > 0 && (
          <div>
            <div className="flex items-center mb-3">
              <Award className="text-green-400 mr-2" size={18} />
              <h4 className="text-green-400 font-medium">Top Performing Questions</h4>
            </div>
            <div className="space-y-3">
              {topQuestions.map((question, index) => (
                <div 
                  key={question.question_id} 
                  className="bg-green-900/20 border border-green-500/30 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-2">
                        {getPerformanceIcon('top')}
                        <span className="ml-1 text-xs text-green-300 font-medium">
                          #{index + 1} Best
                        </span>
                      </div>
                      <p className="text-white text-sm font-medium mb-2">
                        {truncateText(question.question_text)}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>{question.total_responses} responses</span>
                        <span>{question.satisfaction_percentage}% satisfied</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className={`text-xl font-bold ${getPerformanceColor('top', question.avg_response)}`}>
                        {question.avg_response.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-400">/5.0</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Performing Questions */}
        {bottomQuestions.length > 0 && (
          <div>
            <div className="flex items-center mb-3">
              <AlertTriangle className="text-red-400 mr-2" size={18} />
              <h4 className="text-red-400 font-medium">Areas for Improvement</h4>
            </div>
            <div className="space-y-3">
              {bottomQuestions.map((question, index) => (
                <div 
                  key={question.question_id} 
                  className="bg-red-900/20 border border-red-500/30 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-2">
                        {getPerformanceIcon('bottom')}
                        <span className="ml-1 text-xs text-red-300 font-medium">
                          Needs Attention
                        </span>
                      </div>
                      <p className="text-white text-sm font-medium mb-2">
                        {truncateText(question.question_text)}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>{question.total_responses} responses</span>
                        <span>{question.satisfaction_percentage}% satisfied</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className={`text-xl font-bold ${getPerformanceColor('bottom', question.avg_response)}`}>
                        {question.avg_response.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-400">/5.0</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">
            Based on {questionData.reduce((sum, q) => sum + q.total_responses, 0)} total responses
          </span>
          <span className="text-gray-500">Last 30 days</span>
        </div>
      </div>
    </div>
  );
}

// Simplified version for smaller dashboard cards
export function QuestionPerformanceCard({ 
  departmentFilter, 
  managerIdFilter, 
  showOnlyTop = true,
  className = ""
}: QuestionPerformanceWidgetProps & { showOnlyTop?: boolean }) {
  const [questionData, setQuestionData] = useState<QuestionPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_question_performance_ranking', {
            department_filter: departmentFilter || null,
            manager_id_filter: managerIdFilter || null,
            days_back: 30
          });

        if (error) throw error;
        setQuestionData(data || []);
      } catch (err: any) {
        console.error('Error loading question performance:', err);
        // For card view, we'll just show no data instead of detailed errors
        setQuestionData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [departmentFilter, managerIdFilter]);

  const displayQuestions = showOnlyTop 
    ? questionData.filter(q => q.performance_rank === 'top').slice(0, 1)
    : questionData.filter(q => q.performance_rank === 'bottom').slice(0, 1);

  if (loading || displayQuestions.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-center">
          <span className="text-gray-400 text-sm">
            {loading ? 'Loading...' : 'No data'}
          </span>
        </div>
      </div>
    );
  }

  const question = displayQuestions[0];

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center mb-2">
        {showOnlyTop ? (
          <Award className="text-green-400 mr-2" size={16} />
        ) : (
          <AlertTriangle className="text-red-400 mr-2" size={16} />
        )}
        <h4 className={`text-sm font-medium ${
          showOnlyTop ? 'text-green-400' : 'text-red-400'
        }`}>
          {showOnlyTop ? 'Top Question' : 'Needs Improvement'}
        </h4>
      </div>
      
      <p className="text-white text-sm mb-3 line-clamp-2">
        {question.question_text}
      </p>
      
      <div className="flex justify-between items-center">
        <div className={`text-lg font-bold ${
          showOnlyTop ? 'text-green-400' : 'text-red-400'
        }`}>
          {question.avg_response.toFixed(1)}/5.0
        </div>
        <div className="text-xs text-gray-400">
          {question.total_responses} responses
        </div>
      </div>
    </div>
  );
}