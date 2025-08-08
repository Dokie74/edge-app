// src/components/admin/PulseQuestionsManager.tsx - Admin pulse questions management
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  BarChart3, 
  Eye, 
  Save, 
  X,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

interface PulseQuestion {
  id: string;
  question_id: string;
  question_text: string;
  category: 'satisfaction' | 'workload' | 'support' | 'engagement';
  type: 'scale' | 'boolean' | 'choice';
  options?: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

interface QuestionStats {
  question_id: string;
  question_text: string;
  category: string;
  total_responses: number;
  avg_response: number;
  response_1_count: number;
  response_2_count: number;
  response_3_count: number;
  response_4_count: number;
  response_5_count: number;
  satisfaction_percentage: number;
  last_response: string;
}

export default function PulseQuestionsManager() {
  const [questions, setQuestions] = useState<PulseQuestion[]>([]);
  const [questionStats, setQuestionStats] = useState<QuestionStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<PulseQuestion | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'manage' | 'statistics'>('manage');
  const [error, setError] = useState<string | null>(null);

  // New question form state
  const [newQuestion, setNewQuestion] = useState({
    question_id: '',
    question_text: '',
    category: 'satisfaction' as const,
    type: 'scale' as const,
    options: [] as string[]
  });

  // Edit question form state
  const [editForm, setEditForm] = useState({
    question_text: '',
    category: 'satisfaction' as 'satisfaction' | 'workload' | 'support' | 'engagement',
    type: 'scale' as 'scale' | 'boolean' | 'choice',
    options: [] as string[]
  });

  useEffect(() => {
    loadQuestions();
    if (viewMode === 'statistics') {
      loadQuestionStats();
    }
  }, [viewMode]);

  // Populate edit form when editing question changes
  useEffect(() => {
    if (editingQuestion) {
      setEditForm({
        question_text: editingQuestion.question_text,
        category: editingQuestion.category,
        type: editingQuestion.type,
        options: editingQuestion.options || []
      });
    }
  }, [editingQuestion]);

  const loadQuestions = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('pulse_questions')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      setQuestions(data || []);
    } catch (error: any) {
      console.error('Error loading questions:', error);
      setError(error.message || 'Failed to load questions. Make sure the pulse_questions table exists.');
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionStats = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_question_statistics', { days_back: 30 });

      if (error) {
        console.warn('Statistics function not available:', error.message);
        setQuestionStats([]);
        return;
      }
      setQuestionStats(data || []);
    } catch (error) {
      console.error('Error loading question statistics:', error);
      setQuestionStats([]);
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.question_text.trim()) {
      alert('Please fill in the question text');
      return;
    }

    try {
      // Auto-generate unique question ID
      const timestamp = Date.now();
      const categoryPrefix = newQuestion.category.substring(0, 3);
      const autoQuestionId = `${categoryPrefix}_${timestamp}`;

      const { error } = await supabase
        .rpc('add_pulse_question', {
          question_id_param: autoQuestionId,
          question_text_param: newQuestion.question_text,
          category_param: newQuestion.category,
          type_param: newQuestion.type,
          options_param: newQuestion.options.length > 0 ? newQuestion.options : null
        });

      if (error) throw error;

      // Reset form and reload
      setNewQuestion({
        question_id: '',
        question_text: '',
        category: 'satisfaction',
        type: 'scale',
        options: []
      });
      setShowAddForm(false);
      loadQuestions();
    } catch (error: any) {
      console.error('Error adding question:', error);
      alert(error.message || 'Failed to add question');
    }
  };

  const handleEditQuestion = async () => {
    if (!editForm.question_text.trim() || !editingQuestion) {
      alert('Please fill in the question text');
      return;
    }

    try {
      const { error } = await supabase
        .from('pulse_questions')
        .update({
          question_text: editForm.question_text,
          category: editForm.category,
          type: editForm.type,
          options: editForm.options.length > 0 ? editForm.options : null
        })
        .eq('question_id', editingQuestion.question_id);

      if (error) throw error;

      // Reset and reload
      setEditingQuestion(null);
      loadQuestions();
      alert('Question updated successfully!');
    } catch (error: any) {
      console.error('Error updating question:', error);
      alert(error.message || 'Failed to update question');
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to deactivate this question? This will hide it from employees but preserve historical data.')) {
      return;
    }

    try {
      const { error } = await supabase
        .rpc('deactivate_pulse_question', {
          question_id_param: questionId
        });

      if (error) throw error;
      loadQuestions();
    } catch (error: any) {
      console.error('Error deactivating question:', error);
      alert(error.message || 'Failed to deactivate question');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'satisfaction': return <TrendingUp className="text-green-400" size={16} />;
      case 'workload': return <Activity className="text-yellow-400" size={16} />;
      case 'support': return <BarChart3 className="text-blue-400" size={16} />;
      case 'engagement': return <TrendingUp className="text-purple-400" size={16} />;
      default: return <Activity className="text-gray-400" size={16} />;
    }
  };

  const getResponseDistributionBar = (stats: QuestionStats) => {
    const total = stats.total_responses || 0;
    if (total === 0) return null;

    const responses = [
      { count: stats.response_1_count || 0, color: 'bg-red-500', label: '1' },
      { count: stats.response_2_count || 0, color: 'bg-orange-500', label: '2' },
      { count: stats.response_3_count || 0, color: 'bg-yellow-500', label: '3' },
      { count: stats.response_4_count || 0, color: 'bg-blue-500', label: '4' },
      { count: stats.response_5_count || 0, color: 'bg-green-500', label: '5' }
    ];

    return (
      <div className="w-full">
        <div className="flex h-4 bg-gray-700 rounded overflow-hidden mb-1">
          {responses.map((resp, idx) => (
            <div
              key={idx}
              className={resp.color}
              style={{ width: `${(resp.count / total) * 100}%` }}
              title={`${resp.label}: ${resp.count} responses (${((resp.count / total) * 100).toFixed(1)}%)`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Poor (1)</span>
          <span>Excellent (5)</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          <span className="ml-2 text-gray-300">Loading questions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <BarChart3 className="mr-2" size={24} />
            Pulse Questions Management
          </h2>
        </div>
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="text-red-400" size={20} />
            <h3 className="text-red-400 font-medium">Database Error</h3>
          </div>
          <p className="text-red-300 text-sm mb-4">{error}</p>
          <div className="bg-gray-700 rounded p-3 text-xs text-gray-300">
            <p className="font-medium mb-2">To fix this issue:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Run the SQL file: <code className="bg-gray-600 px-1 rounded">pulse_questions_management.sql</code></li>
              <li>Check Supabase console for any errors</li>
              <li>Verify table permissions are set correctly</li>
            </ol>
          </div>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              loadQuestions();
            }}
            className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <BarChart3 className="mr-2" size={24} />
          Pulse Questions Management
        </h2>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-700 rounded-lg">
            <button
              onClick={() => setViewMode('manage')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                viewMode === 'manage' 
                  ? 'bg-cyan-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Manage
            </button>
            <button
              onClick={() => setViewMode('statistics')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                viewMode === 'statistics' 
                  ? 'bg-cyan-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Statistics
            </button>
          </div>
          {viewMode === 'manage' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={16} />
              <span>Add Question</span>
            </button>
          )}
        </div>
      </div>

      {viewMode === 'manage' ? (
        <>
          {/* Questions List */}
          <div className="space-y-4">
            {questions.map(question => (
              <div key={question.id} className={`border rounded-lg p-4 ${
                question.is_active ? 'border-gray-600 bg-gray-750' : 'border-gray-700 bg-gray-800 opacity-60'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getCategoryIcon(question.category)}
                      <span className="text-xs text-gray-400 uppercase font-medium">
                        {question.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        ID: {question.question_id}
                      </span>
                      {!question.is_active && (
                        <span className="text-xs bg-red-900 text-red-300 px-2 py-1 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-white font-medium mb-2">{question.question_text}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>Type: {question.type}</span>
                      <span>Order: {question.sort_order}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedQuestion(
                        selectedQuestion === question.question_id ? null : question.question_id
                      )}
                      className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
                      title="View Statistics"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => setEditingQuestion(question)}
                      className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                      title="Edit Question"
                    >
                      <Edit3 size={16} />
                    </button>
                    {question.is_active && (
                      <button
                        onClick={() => handleDeleteQuestion(question.question_id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        title="Deactivate Question"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Stats Preview */}
                {selectedQuestion === question.question_id && (
                  <div className="mt-4 pt-4 border-t border-gray-600">
                    {questionStats.find(s => s.question_id === question.question_id) ? (
                      (() => {
                        const stats = questionStats.find(s => s.question_id === question.question_id)!;
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Response Stats</p>
                              <p className="text-lg font-semibold text-white">
                                {(stats.avg_response || 0).toFixed(1)}/5.0
                              </p>
                              <p className="text-xs text-gray-400">
                                {stats.total_responses} responses
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Satisfaction Rate</p>
                              <p className="text-lg font-semibold text-green-400">
                                {stats.satisfaction_percentage || 0}%
                              </p>
                              <p className="text-xs text-gray-400">4+ rating</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Distribution</p>
                              {getResponseDistributionBar(stats)}
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <p className="text-gray-400 text-sm">No response data available</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Question Form */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Add New Question</h3>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Question Text
                    </label>
                    <textarea
                      value={newQuestion.question_text}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, question_text: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      rows={3}
                      placeholder="How would you rate..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Category
                      </label>
                      <select
                        value={newQuestion.category}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, category: e.target.value as any }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      >
                        <option value="satisfaction">Satisfaction</option>
                        <option value="workload">Workload</option>
                        <option value="support">Support</option>
                        <option value="engagement">Engagement</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Type
                      </label>
                      <select
                        value={newQuestion.type}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      >
                        <option value="scale">Scale (1-5)</option>
                        <option value="boolean">Yes/No</option>
                        <option value="choice">Multiple Choice</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddQuestion}
                      className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded transition-colors"
                    >
                      <Save size={16} />
                      <span>Add Question</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Question Form */}
          {editingQuestion && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Edit Question</h3>
                  <button
                    onClick={() => setEditingQuestion(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Question Text
                    </label>
                    <textarea
                      value={editForm.question_text}
                      onChange={(e) => setEditForm(prev => ({ ...prev, question_text: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      rows={3}
                      placeholder="How would you rate..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Category
                      </label>
                      <select
                        value={editForm.category}
                        onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value as any }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      >
                        <option value="satisfaction">Satisfaction</option>
                        <option value="workload">Workload</option>
                        <option value="support">Support</option>
                        <option value="engagement">Engagement</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Type
                      </label>
                      <select
                        value={editForm.type}
                        onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      >
                        <option value="scale">Scale (1-5)</option>
                        <option value="boolean">Yes/No</option>
                        <option value="choice">Multiple Choice</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setEditingQuestion(null)}
                      className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEditQuestion}
                      className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded transition-colors"
                    >
                      <Save size={16} />
                      <span>Update Question</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Statistics View */
        <div className="space-y-6">
          {questionStats.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="mx-auto mb-4 text-gray-500" size={48} />
              <p className="text-gray-400 mb-2">No statistics available</p>
              <p className="text-gray-500 text-sm">
                Statistics will show once the database statistics function is configured and there are employee responses.
              </p>
              <div className="mt-4 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-left max-w-lg mx-auto">
                <h4 className="text-blue-400 font-medium mb-2">Setup Required:</h4>
                <p className="text-blue-300 text-sm">
                  The <code className="bg-gray-700 px-1 rounded">get_question_statistics</code> database function needs to be created to display pulse question analytics.
                </p>
              </div>
            </div>
          ) : (
            questionStats.map(stats => (
              <div key={stats.question_id} className="border border-gray-600 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      {getCategoryIcon(stats.category)}
                      <span className="text-xs text-gray-400 uppercase font-medium">
                        {stats.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {stats.question_text}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-cyan-400">
                      {(stats.avg_response || 0).toFixed(1)}/5.0
                    </p>
                    <p className="text-sm text-gray-400">
                      {stats.total_responses} responses
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Response Distribution</h4>
                    {getResponseDistributionBar(stats)}
                    <div className="mt-2 space-y-1">
                      {[
                        { label: 'Excellent (5)', count: stats.response_5_count, color: 'text-green-400' },
                        { label: 'Good (4)', count: stats.response_4_count, color: 'text-blue-400' },
                        { label: 'Neutral (3)', count: stats.response_3_count, color: 'text-yellow-400' },
                        { label: 'Poor (2)', count: stats.response_2_count, color: 'text-orange-400' },
                        { label: 'Very Poor (1)', count: stats.response_1_count, color: 'text-red-400' }
                      ].map(item => (
                        <div key={item.label} className="flex justify-between text-xs">
                          <span className="text-gray-400">{item.label}</span>
                          <span className={item.color}>{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Key Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Satisfaction Rate</span>
                        <span className="text-green-400 font-medium">
                          {stats.satisfaction_percentage || 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Responses</span>
                        <span className="text-white font-medium">
                          {stats.total_responses || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Last Response</span>
                        <span className="text-gray-300">
                          {stats.last_response ? 
                            new Date(stats.last_response).toLocaleDateString() : 
                            'Never'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}