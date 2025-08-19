// src/components/analytics/QuestionPerformanceWidget.tsx - Top/Bottom questions widget with dual views
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Award, 
  AlertTriangle,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Building2,
  HelpCircle
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

interface DepartmentResponse {
  department: string;
  category: string;
  avg_response: number;
  total_responses: number;
  satisfaction_percentage: number;
  question_count: number;
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
  const [viewMode, setViewMode] = useState<'questions' | 'departments'>('questions');
  const [questionData, setQuestionData] = useState<QuestionPerformance[]>([]);
  const [departmentData, setDepartmentData] = useState<DepartmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQuestionPerformance = async () => {
    try {
      setLoading(true);
      setError(null);

      if (viewMode === 'questions') {
        // Load question performance data
        const { data, error } = await supabase
          .rpc('get_question_performance_ranking', {
            department_filter: departmentFilter || null,
            manager_id_filter: managerIdFilter || null,
            days_back: 30
          });

        if (error) {
          console.error('Error from get_question_performance_ranking:', error);
          throw error;
        }
        
        // Debug: Log what we received from the database
        console.log('📊 [NEW CODE v2] Raw data from get_question_performance_ranking:', data);
        console.log('📊 Data type:', typeof data);
        console.log('📊 Is array:', Array.isArray(data));
        
        // Ensure data is always an array with comprehensive safety checks
        let processedData = [];
        
        if (Array.isArray(data)) {
          console.log('✅ Data is array, setting questionData with', data.length, 'items');
          processedData = data;
        } else if (data && typeof data === 'object') {
          if (Array.isArray(data.data)) {
            console.log('✅ Data is wrapped object, setting questionData with', data.data.length, 'items');
            processedData = data.data;
          } else if (data.error) {
            console.error('❌ Database function returned error:', data.message || 'Unknown error');
            throw new Error(data.message || 'Database function error');
          } else {
            console.warn('❌ Unexpected data format from get_question_performance_ranking:', data);
            processedData = [];
          }
        } else if (data === null || data === undefined) {
          console.log('📭 No data returned from get_question_performance_ranking');
          processedData = [];
        } else {
          console.warn('❌ Completely unexpected data type from get_question_performance_ranking:', typeof data, data);
          processedData = [];
        }
        
        // Final safety check before setting state
        setQuestionData(Array.isArray(processedData) ? processedData : []);
      } else {
        // Load department response data
        await loadDepartmentResponses();
      }
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

  const loadDepartmentResponses = async () => {
    try {
      // Use the database function to get processed department data
      const { data, error } = await supabase
        .rpc('get_department_pulse_responses');

      if (error) throw error;
      
      // Convert the JSON response to our expected format
      if (data && Array.isArray(data)) {
        setDepartmentData(data.map(item => ({
          department: item.department || 'Unknown',
          category: item.category || 'Unknown',
          avg_response: item.avg_response || 0,
          total_responses: item.total_responses || 0,
          satisfaction_percentage: item.satisfaction_percentage || 0,
          question_count: item.question_count || 1
        })));
      } else {
        setDepartmentData([]);
      }
    } catch (err: any) {
      console.error('Error loading department responses:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadQuestionPerformance();
  }, [departmentFilter, managerIdFilter, viewMode]);

  // Extra safety checks for filter operations
  const safeQuestionData = Array.isArray(questionData) ? questionData : [];
  const topQuestions = safeQuestionData.filter(q => q && q.performance_rank === 'top');
  const bottomQuestions = safeQuestionData.filter(q => q && q.performance_rank === 'bottom');

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

  const getCategoryColor = (category: string) => {
    const categoryColors: { [key: string]: string } = {
      satisfaction: 'text-green-400',
      engagement: 'text-blue-400',
      communication: 'text-purple-400',
      workload: 'text-orange-400',
      leadership: 'text-yellow-400',
      development: 'text-cyan-400',
      work_life_balance: 'text-pink-400',
      culture: 'text-indigo-400',
      recognition: 'text-emerald-400'
    };
    return categoryColors[category] || 'text-gray-400';
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

  if ((viewMode === 'questions' && questionData.length === 0) || 
      (viewMode === 'departments' && departmentData.length === 0)) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <BarChart3 className="mr-2" size={20} />
            {title}
          </h3>
          <div className="flex items-center space-x-4">
            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('questions')}
                className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  viewMode === 'questions' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-gray-700 text-gray-400 hover:text-cyan-400'
                }`}
              >
                <HelpCircle size={14} className="mr-1" />
                Questions
              </button>
              <button
                onClick={() => setViewMode('departments')}
                className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  viewMode === 'departments' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-gray-700 text-gray-400 hover:text-cyan-400'
                }`}
              >
                <Building2 size={14} className="mr-1" />
                Departments
              </button>
            </div>
            <button
              onClick={loadQuestionPerformance}
              className="p-1 text-gray-400 hover:text-cyan-400 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
        <div className="text-center py-8">
          <BarChart3 className="mx-auto mb-3 text-gray-500" size={32} />
          <p className="text-gray-400">
            {viewMode === 'questions' 
              ? 'Not enough response data available' 
              : 'No department response data available'
            }
          </p>
          <p className="text-gray-500 text-sm">
            {viewMode === 'questions' 
              ? 'Need at least 3 responses per question' 
              : 'Need pulse survey responses to show department breakdown'
            }
          </p>
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
        <div className="flex items-center space-x-4">
          {/* View Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('questions')}
              className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                viewMode === 'questions' 
                  ? 'bg-cyan-500 text-white' 
                  : 'bg-gray-700 text-gray-400 hover:text-cyan-400'
              }`}
            >
              <HelpCircle size={14} className="mr-1" />
              Questions
            </button>
            <button
              onClick={() => setViewMode('departments')}
              className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                viewMode === 'departments' 
                  ? 'bg-cyan-500 text-white' 
                  : 'bg-gray-700 text-gray-400 hover:text-cyan-400'
              }`}
            >
              <Building2 size={14} className="mr-1" />
              Departments
            </button>
          </div>
          <button
            onClick={loadQuestionPerformance}
            className="p-1 text-gray-400 hover:text-cyan-400 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Conditional Content Based on View Mode */}
      {viewMode === 'questions' ? (
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
      ) : (
        /* Department View */
        <div className="space-y-6">
          {departmentData.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="mx-auto mb-3 text-gray-500" size={32} />
              <p className="text-gray-400">No department response data available</p>
              <p className="text-gray-500 text-sm">Need pulse survey responses to show department breakdown</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center mb-4">
                <Building2 className="text-cyan-400 mr-2" size={18} />
                <h4 className="text-cyan-400 font-medium">Responses by Department & Category</h4>
              </div>
              
              {/* Group by category */}
              {Array.from(new Set(departmentData.map(d => d.category))).map(category => {
                const categoryData = departmentData.filter(d => d.category === category);
                const categoryColor = getCategoryColor(category);
                
                return (
                  <div key={category} className="mb-6">
                    <h5 className={`text-sm font-medium mb-3 ${categoryColor} capitalize`}>
                      📊 {category.replace('_', ' ')} Category
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {categoryData.map(dept => (
                        <div 
                          key={`${dept.department}-${dept.category}`}
                          className="bg-gray-700/50 border border-gray-600 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h6 className="text-white font-medium text-sm">
                              {dept.department}
                            </h6>
                            <div className="text-right">
                              <div className={`text-lg font-bold ${
                                dept.avg_response >= 4 ? 'text-green-400' : 
                                dept.avg_response >= 3 ? 'text-yellow-400' : 'text-red-400'
                              }`}>
                                {dept.avg_response.toFixed(1)}
                              </div>
                              <div className="text-xs text-gray-400">/5.0</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>{dept.total_responses} responses</span>
                            <span>{Math.round(dept.satisfaction_percentage)}% satisfied</span>
                          </div>
                          {/* Progress bar */}
                          <div className="mt-2 bg-gray-600 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                dept.avg_response >= 4 ? 'bg-green-500' : 
                                dept.avg_response >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${(dept.avg_response / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Summary Footer */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">
            {viewMode === 'questions' ? (
              `Based on ${Array.isArray(questionData) ? questionData.reduce((sum, q) => sum + q.total_responses, 0) : 0} total responses`
            ) : (
              `${departmentData.length} department-category combinations`
            )}
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

  const safeData = Array.isArray(questionData) ? questionData : [];
  const displayQuestions = showOnlyTop 
    ? safeData.filter(q => q && q.performance_rank === 'top').slice(0, 1)
    : safeData.filter(q => q && q.performance_rank === 'bottom').slice(0, 1);

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