// src/components/pages/MyDevelopmentCenterEnhanced.js - Enhanced with development plan submission workflow
import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Plus, 
  Calendar, 
  User, 
  BookOpen, 
  TrendingUp, 
  Save, 
  X,
  CheckCircle,
  Clock,
  MessageSquare,
  Award,
  Lightbulb
} from 'lucide-react';
import { useApp } from '../../contexts';
import { LoadingSpinner, ErrorMessage, Button, StatusBadge } from '../ui';
import { formatDate } from '../../utils';
import NotificationService from '../../services/NotificationService';

export default function MyDevelopmentCenterEnhanced() {
  const { userName } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [developmentPlans, setDevelopmentPlans] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [newPlan, setNewPlan] = useState({
    title: '',
    description: '',
    goals: [{ goal: '', timeline: '', priority: 'medium' }],
    skills_to_develop: [{ skill: '', reason: '', method: '' }],
    timeline: '3-6 months'
  });

  // Fetch development plans on component mount
  useEffect(() => {
    fetchDevelopmentPlans();
  }, []);

  const fetchDevelopmentPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const plans = await NotificationService.getDevelopmentPlans();
      setDevelopmentPlans(plans);
    } catch (err) {
      console.error('Error fetching development plans:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPlan = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      // Validate required fields
      if (!newPlan.title.trim()) {
        throw new Error('Plan title is required');
      }
      if (newPlan.goals.length === 0 || !newPlan.goals[0].goal.trim()) {
        throw new Error('At least one goal is required');
      }

      await NotificationService.submitDevelopmentPlan(newPlan);
      
      // Reset form and refresh plans
      setNewPlan({
        title: '',
        description: '',
        goals: [{ goal: '', timeline: '', priority: 'medium' }],
        skills_to_develop: [{ skill: '', reason: '', method: '' }],
        timeline: '3-6 months'
      });
      setShowCreateForm(false);
      await fetchDevelopmentPlans();
      
    } catch (err) {
      console.error('Error submitting development plan:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const addGoal = () => {
    setNewPlan(prev => ({
      ...prev,
      goals: [...prev.goals, { goal: '', timeline: '', priority: 'medium' }]
    }));
  };

  const removeGoal = (index) => {
    setNewPlan(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  const updateGoal = (index, field, value) => {
    setNewPlan(prev => ({
      ...prev,
      goals: prev.goals.map((goal, i) => 
        i === index ? { ...goal, [field]: value } : goal
      )
    }));
  };

  const addSkill = () => {
    setNewPlan(prev => ({
      ...prev,
      skills_to_develop: [...prev.skills_to_develop, { skill: '', reason: '', method: '' }]
    }));
  };

  const removeSkill = (index) => {
    setNewPlan(prev => ({
      ...prev,
      skills_to_develop: prev.skills_to_develop.filter((_, i) => i !== index)
    }));
  };

  const updateSkill = (index, field, value) => {
    setNewPlan(prev => ({
      ...prev,
      skills_to_develop: prev.skills_to_develop.map((skill, i) => 
        i === index ? { ...skill, [field]: value } : skill
      )
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'gray',
      'submitted': 'blue',
      'under_review': 'yellow',
      'approved': 'green',
      'needs_revision': 'red'
    };
    return colors[status] || 'gray';
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Target },
    { id: 'plans', name: 'My Development Plans', icon: BookOpen },
    { id: 'create', name: 'Create New Plan', icon: Plus }
  ];

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-cyan-400 mb-8">My Development Center</h1>
        <LoadingSpinner size="lg" message="Loading your development center..." />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400">My Development Center</h1>
          <p className="text-gray-400 mt-2">Plan and track your professional development journey</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="primary"
            onClick={() => setActiveTab('create')}
            data-testid="create-development-plan-button"
          >
            <Plus size={16} className="mr-2" />
            Create Development Plan
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6">
          <ErrorMessage 
            error={error} 
            title="Development Center Error" 
            onRetry={() => setError(null)}
          />
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <tab.icon className="mr-2" size={16} />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center">
                <BookOpen className="text-blue-400 mr-3" size={24} />
                <div>
                  <p className="text-2xl font-bold text-white">{developmentPlans.length}</p>
                  <p className="text-gray-400 text-sm">Development Plans</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center">
                <CheckCircle className="text-green-400 mr-3" size={24} />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {developmentPlans.filter(p => p.status === 'approved').length}
                  </p>
                  <p className="text-gray-400 text-sm">Approved Plans</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center">
                <Clock className="text-yellow-400 mr-3" size={24} />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {developmentPlans.filter(p => p.status === 'under_review').length}
                  </p>
                  <p className="text-gray-400 text-sm">Under Review</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Lightbulb className="mr-2 text-yellow-400" size={20} />
              Development Tips
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-cyan-400 mb-2">Set SMART Goals</h3>
                <p className="text-gray-300 text-sm">Make your goals Specific, Measurable, Achievable, Relevant, and Time-bound.</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-cyan-400 mb-2">Regular Review</h3>
                <p className="text-gray-300 text-sm">Schedule regular check-ins with your manager to discuss progress and adjustments.</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-cyan-400 mb-2">Skill Diversity</h3>
                <p className="text-gray-300 text-sm">Balance technical skills with soft skills for comprehensive growth.</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-cyan-400 mb-2">Document Progress</h3>
                <p className="text-gray-300 text-sm">Keep track of your achievements and lessons learned along the way.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'plans' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">My Development Plans</h2>
          
          {developmentPlans.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen size={64} className="mx-auto text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Development Plans Yet</h3>
              <p className="text-gray-400 mb-6">Start your development journey by creating your first plan.</p>
              <Button 
                variant="primary"
                onClick={() => setActiveTab('create')}
              >
                <Plus size={16} className="mr-2" />
                Create Your First Plan
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {developmentPlans.map((plan) => (
                <div key={plan.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{plan.title}</h3>
                      <p className="text-gray-400 mb-3">{plan.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-400">Status</p>
                          <StatusBadge 
                            status={plan.status} 
                            color={getStatusColor(plan.status)}
                          />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Timeline</p>
                          <p className="text-white">{plan.timeline}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Created</p>
                          <p className="text-white">{formatDate(plan.created_at)}</p>
                        </div>
                      </div>

                      {plan.goals && plan.goals.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-400 mb-2">Goals ({plan.goals.length})</p>
                          <div className="space-y-1">
                            {plan.goals.slice(0, 2).map((goal, index) => (
                              <p key={index} className="text-gray-300 text-sm">• {goal.goal}</p>
                            ))}
                            {plan.goals.length > 2 && (
                              <p className="text-gray-500 text-sm">... and {plan.goals.length - 2} more</p>
                            )}
                          </div>
                        </div>
                      )}

                      {plan.manager_feedback && (
                        <div className="bg-gray-700 rounded-lg p-3 mt-4">
                          <p className="text-sm text-gray-400 mb-1">Manager Feedback</p>
                          <p className="text-gray-300 text-sm">{plan.manager_feedback}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Reviewed on {formatDate(plan.manager_reviewed_at)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'create' && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Create Development Plan</h2>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Plan Title *
                  </label>
                  <input
                    type="text"
                    value={newPlan.title}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="e.g., Leadership Skills Development"
                    data-testid="development-plan-title-input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Timeline
                  </label>
                  <select
                    value={newPlan.timeline}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, timeline: e.target.value }))}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    data-testid="development-plan-timeline-select"
                  >
                    <option value="1-3 months">1-3 months</option>
                    <option value="3-6 months">3-6 months</option>
                    <option value="6-12 months">6-12 months</option>
                    <option value="1+ years">1+ years</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newPlan.description}
                  onChange={(e) => setNewPlan(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe your development objectives and what you hope to achieve..."
                  data-testid="development-plan-description-textarea"
                />
              </div>

              {/* Goals Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-300">
                    Development Goals *
                  </label>
                  <Button variant="secondary" size="sm" onClick={addGoal}>
                    <Plus size={14} className="mr-1" />
                    Add Goal
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {newPlan.goals.map((goal, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-sm font-medium text-gray-300">Goal {index + 1}</span>
                        {newPlan.goals.length > 1 && (
                          <button
                            onClick={() => removeGoal(index)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="lg:col-span-2">
                          <input
                            type="text"
                            value={goal.goal}
                            onChange={(e) => updateGoal(index, 'goal', e.target.value)}
                            className="w-full p-3 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            placeholder="Describe your specific goal..."
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={goal.timeline}
                            onChange={(e) => updateGoal(index, 'timeline', e.target.value)}
                            className="w-full p-3 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            placeholder="Timeline (e.g., 3 months)"
                          />
                        </div>
                        <div>
                          <select
                            value={goal.priority}
                            onChange={(e) => updateGoal(index, 'priority', e.target.value)}
                            className="w-full p-3 bg-gray-600 border border-gray-500 rounded-md text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-300">
                    Skills to Develop
                  </label>
                  <Button variant="secondary" size="sm" onClick={addSkill}>
                    <Plus size={14} className="mr-1" />
                    Add Skill
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {newPlan.skills_to_develop.map((skill, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-sm font-medium text-gray-300">Skill {index + 1}</span>
                        <button
                          onClick={() => removeSkill(index)}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={skill.skill}
                          onChange={(e) => updateSkill(index, 'skill', e.target.value)}
                          className="w-full p-3 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="Skill name (e.g., Public Speaking)"
                        />
                        <input
                          type="text"
                          value={skill.reason}
                          onChange={(e) => updateSkill(index, 'reason', e.target.value)}
                          className="w-full p-3 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="Why is this skill important for your role?"
                        />
                        <input
                          type="text"
                          value={skill.method}
                          onChange={(e) => updateSkill(index, 'method', e.target.value)}
                          className="w-full p-3 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="How will you develop this skill?"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="secondary"
                  onClick={() => {
                    setNewPlan({
                      title: '',
                      description: '',
                      goals: [{ goal: '', timeline: '', priority: 'medium' }],
                      skills_to_develop: [{ skill: '', reason: '', method: '' }],
                      timeline: '3-6 months'
                    });
                    setActiveTab('plans');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary"
                  onClick={handleSubmitPlan}
                  disabled={submitting}
                  data-testid="submit-development-plan-button"
                >
                  <Save size={16} className="mr-2" />
                  {submitting ? 'Submitting...' : 'Submit Plan'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}