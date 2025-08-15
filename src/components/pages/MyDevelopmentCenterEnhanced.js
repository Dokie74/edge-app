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
  Lightbulb,
  Edit3,
  AlertCircle,
  Check,
  MessageCircle
} from 'lucide-react';
import { useApp } from '../../contexts';
import { LoadingSpinner, ErrorMessage, Button, StatusBadge } from '../ui';
import { formatDate } from '../../utils';
import NotificationService from '../../services/NotificationService';

export default function MyDevelopmentCenterEnhanced() {
  const { userName, userRole, user } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [developmentPlans, setDevelopmentPlans] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // New state for enhanced functionality
  const [editingPlan, setEditingPlan] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [currentCompletionItem, setCurrentCompletionItem] = useState(null);
  const [completionComment, setCompletionComment] = useState('');
  const [managerReplyMode, setManagerReplyMode] = useState(null); // planId when in reply mode
  const [managerReply, setManagerReply] = useState('');
  
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

  // New functions for enhanced functionality
  const canEditPlan = (plan) => {
    // Only managers can edit plans, and only if they're the manager of the employee who created it
    return userRole === 'manager' || userRole === 'admin';
  };

  const canRequestModification = (plan) => {
    // Employees can request modifications to their own plans
    return userRole === 'employee' && plan.created_by === user?.id;
  };

  const handleRequestModification = async (planId) => {
    try {
      // Create a notification for the manager
      await NotificationService.createNotification({
        recipient_id: developmentPlans.find(p => p.id === planId)?.manager_id,
        title: 'Development Plan Modification Request',
        message: `${userName} has requested modifications to their development plan`,
        type: 'plan_modification_request',
        metadata: { plan_id: planId, employee_name: userName }
      });
      
      // Show success message
      alert('Modification request sent to your manager');
    } catch (error) {
      console.error('Error requesting modification:', error);
      alert('Failed to send modification request');
    }
  };

  const handleGoalSkillCompletion = (planId, itemType, itemIndex, isCompleted) => {
    if (isCompleted) {
      // Open comment modal
      setCurrentCompletionItem({ planId, itemType, itemIndex });
      setShowCommentModal(true);
    } else {
      // Mark as incomplete directly
      updatePlanProgress(planId, itemType, itemIndex, false, '');
    }
  };

  const updatePlanProgress = async (planId, itemType, itemIndex, isCompleted, comment = '') => {
    try {
      const planIndex = developmentPlans.findIndex(p => p.id === planId);
      if (planIndex === -1) return;

      const updatedPlans = [...developmentPlans];
      const plan = updatedPlans[planIndex];
      
      // Update the specific goal or skill
      if (itemType === 'goal') {
        if (!plan.goals[itemIndex].progress) {
          plan.goals[itemIndex].progress = {};
        }
        plan.goals[itemIndex].progress.completed = isCompleted;
        plan.goals[itemIndex].progress.completion_comment = comment;
        plan.goals[itemIndex].progress.completed_at = isCompleted ? new Date().toISOString() : null;
      } else if (itemType === 'skill') {
        if (!plan.skills_to_develop[itemIndex].progress) {
          plan.skills_to_develop[itemIndex].progress = {};
        }
        plan.skills_to_develop[itemIndex].progress.completed = isCompleted;
        plan.skills_to_develop[itemIndex].progress.completion_comment = comment;
        plan.skills_to_develop[itemIndex].progress.completed_at = isCompleted ? new Date().toISOString() : null;
      }

      setDevelopmentPlans(updatedPlans);

      // If marking as complete, notify manager (if they have one)
      if (isCompleted && plan.manager_id) {
        try {
          await NotificationService.createNotification({
            recipient_id: plan.manager_id,
            title: 'Development Plan Progress Update',
            message: `${userName} has completed a ${itemType} in their development plan: "${comment}"`,
            type: 'plan_progress_update',
            metadata: { 
              plan_id: planId, 
              item_type: itemType, 
              item_index: itemIndex,
              employee_name: userName,
              comment: comment
            }
          });
          console.log('✅ Manager notification sent successfully');
        } catch (notificationError) {
          console.error('⚠️ Failed to notify manager:', notificationError);
          // Don't fail the entire operation if notification fails
        }
      } else if (isCompleted && !plan.manager_id) {
        console.log('ℹ️ No manager assigned - skipping manager notification');
      }

      // TODO: Save to backend
      console.log('Plan progress updated:', { planId, itemType, itemIndex, isCompleted, comment });

    } catch (error) {
      console.error('Error updating plan progress:', error);
      alert('Failed to update progress');
    }
  };

  const submitCompletionComment = async () => {
    if (!currentCompletionItem || !completionComment.trim()) {
      alert('Please enter a comment about your completion');
      return;
    }

    const { planId, itemType, itemIndex } = currentCompletionItem;
    await updatePlanProgress(planId, itemType, itemIndex, true, completionComment);
    
    // Reset modal state
    setShowCommentModal(false);
    setCurrentCompletionItem(null);
    setCompletionComment('');
  };

  const submitManagerReply = async (planId) => {
    if (!managerReply.trim()) {
      alert('Please enter a reply comment');
      return;
    }

    try {
      const planIndex = developmentPlans.findIndex(p => p.id === planId);
      if (planIndex === -1) return;

      const updatedPlans = [...developmentPlans];
      const plan = updatedPlans[planIndex];
      
      // Add manager reply to the plan
      if (!plan.manager_replies) {
        plan.manager_replies = [];
      }
      
      plan.manager_replies.push({
        reply: managerReply,
        replied_at: new Date().toISOString(),
        replied_by: userName
      });

      setDevelopmentPlans(updatedPlans);

      // Notify the employee
      await NotificationService.createNotification({
        recipient_id: plan.created_by,
        title: 'Manager Response to Development Plan',
        message: `Your manager has responded to your development plan progress`,
        type: 'plan_manager_response',
        metadata: { 
          plan_id: planId, 
          manager_name: userName,
          reply: managerReply
        }
      });

      // Reset reply state
      setManagerReplyMode(null);
      setManagerReply('');

      // TODO: Save to backend
      console.log('Manager reply submitted:', { planId, reply: managerReply });

    } catch (error) {
      console.error('Error submitting manager reply:', error);
      alert('Failed to submit reply');
    }
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
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400">My Development Center</h1>
          <p className="text-gray-400 mt-2">Plan and track your professional development journey</p>
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

                      {/* Enhanced Goals with Progress Tracking - Hidden when editing */}
                      {!editingPlan && plan.goals && plan.goals.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-400 mb-3">Development Goals ({plan.goals.length})</p>
                          <div className="space-y-3">
                            {plan.goals.map((goal, index) => (
                              <div key={index} className="bg-gray-700 rounded-lg p-3">
                                <div className="flex items-start space-x-3">
                                  <input
                                    type="checkbox"
                                    checked={goal.progress?.completed || false}
                                    onChange={(e) => handleGoalSkillCompletion(plan.id, 'goal', index, e.target.checked)}
                                    className="mt-1 h-4 w-4 text-cyan-500 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500"
                                  />
                                  <div className="flex-1">
                                    <p className={`text-sm font-medium ${goal.progress?.completed ? 'text-green-400 line-through' : 'text-white'}`}>
                                      {goal.goal}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      Priority: {goal.priority} | Timeline: {goal.timeline}
                                    </p>
                                    
                                    {goal.progress?.completed && goal.progress?.completion_comment && (
                                      <div className="mt-2 p-2 bg-gray-600 rounded text-xs">
                                        <p className="text-green-400 font-medium">Completion Note:</p>
                                        <p className="text-gray-300">{goal.progress.completion_comment}</p>
                                        <p className="text-gray-500 mt-1">
                                          Completed: {formatDate(goal.progress.completed_at)}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Enhanced Skills with Progress Tracking - Hidden when editing */}
                      {!editingPlan && plan.skills_to_develop && plan.skills_to_develop.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-400 mb-3">Skills to Develop ({plan.skills_to_develop.length})</p>
                          <div className="space-y-3">
                            {plan.skills_to_develop.map((skill, index) => (
                              <div key={index} className="bg-gray-700 rounded-lg p-3">
                                <div className="flex items-start space-x-3">
                                  <input
                                    type="checkbox"
                                    checked={skill.progress?.completed || false}
                                    onChange={(e) => handleGoalSkillCompletion(plan.id, 'skill', index, e.target.checked)}
                                    className="mt-1 h-4 w-4 text-cyan-500 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500"
                                  />
                                  <div className="flex-1">
                                    <p className={`text-sm font-medium ${skill.progress?.completed ? 'text-green-400 line-through' : 'text-white'}`}>
                                      {skill.skill}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      Method: {skill.method}
                                    </p>
                                    
                                    {skill.progress?.completed && skill.progress?.completion_comment && (
                                      <div className="mt-2 p-2 bg-gray-600 rounded text-xs">
                                        <p className="text-green-400 font-medium">Completion Note:</p>
                                        <p className="text-gray-300">{skill.progress.completion_comment}</p>
                                        <p className="text-gray-500 mt-1">
                                          Completed: {formatDate(skill.progress.completed_at)}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Manager Feedback and Replies Section - Hidden when editing */}
                      {!editingPlan && plan.manager_feedback && (
                        <div className="bg-gray-700 rounded-lg p-3 mt-4">
                          <p className="text-sm text-gray-400 mb-1">Manager Feedback</p>
                          <p className="text-gray-300 text-sm">{plan.manager_feedback}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Reviewed on {formatDate(plan.manager_reviewed_at)}
                          </p>
                        </div>
                      )}

                      {/* Edit Plan Interface (when editing) */}
                      {editingPlan === plan.id && (
                        <div className="mt-4 bg-gray-700 rounded-lg p-4 border-2 border-cyan-500">
                          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                            <Edit3 className="mr-2 text-cyan-400" size={18} />
                            Edit Development Plan
                          </h4>
                          
                          <div className="space-y-4">
                            {/* Edit Title */}
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Plan Title</label>
                              <input
                                type="text"
                                value={plan.title}
                                onChange={(e) => {
                                  const updatedPlans = developmentPlans.map(p => 
                                    p.id === plan.id ? { ...p, title: e.target.value } : p
                                  );
                                  setDevelopmentPlans(updatedPlans);
                                }}
                                className="w-full p-3 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                              />
                            </div>
                            
                            {/* Edit Description */}
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                              <textarea
                                value={plan.description || ''}
                                onChange={(e) => {
                                  const updatedPlans = developmentPlans.map(p => 
                                    p.id === plan.id ? { ...p, description: e.target.value } : p
                                  );
                                  setDevelopmentPlans(updatedPlans);
                                }}
                                rows={3}
                                className="w-full p-3 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                              />
                            </div>
                            
                            {/* Edit Goals */}
                            {plan.goals && plan.goals.length > 0 && (
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-3">Goals</label>
                                <div className="space-y-2">
                                  {plan.goals.map((goal, goalIndex) => (
                                    <div key={goalIndex} className="bg-gray-600 rounded p-3">
                                      <input
                                        type="text"
                                        value={goal.goal || ''}
                                        onChange={(e) => {
                                          const updatedPlans = developmentPlans.map(p => {
                                            if (p.id === plan.id) {
                                              const updatedGoals = p.goals.map((g, i) => 
                                                i === goalIndex ? { ...g, goal: e.target.value } : g
                                              );
                                              return { ...p, goals: updatedGoals };
                                            }
                                            return p;
                                          });
                                          setDevelopmentPlans(updatedPlans);
                                        }}
                                        className="w-full p-2 bg-gray-500 border border-gray-400 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                        placeholder="Goal description"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Save/Cancel Buttons */}
                            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-600">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  setEditingPlan(null);
                                  fetchDevelopmentPlans(); // Refresh to undo changes
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    // Here you would typically save to backend
                                    // For now, just close the editor
                                    setEditingPlan(null);
                                    alert('Plan updated successfully (Note: Backend save not yet implemented)');
                                  } catch (error) {
                                    console.error('Error saving plan:', error);
                                    alert('Failed to save plan changes');
                                  }
                                }}
                              >
                                <Save size={14} className="mr-1" />
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Manager Replies */}
                      {plan.manager_replies && plan.manager_replies.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {plan.manager_replies.map((reply, index) => (
                            <div key={index} className="bg-blue-900 bg-opacity-50 rounded-lg p-3 border-l-4 border-blue-400">
                              <div className="flex items-start justify-between mb-1">
                                <p className="text-sm text-blue-300 font-medium">Manager Response</p>
                                <p className="text-xs text-blue-400">{formatDate(reply.replied_at)}</p>
                              </div>
                              <p className="text-gray-300 text-sm">{reply.reply}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Manager Reply Interface (for managers only) - Hidden when editing */}
                      {!editingPlan && userRole === 'manager' && (
                        <div className="mt-4">
                          {managerReplyMode === plan.id ? (
                            <div className="bg-gray-700 rounded-lg p-3">
                              <p className="text-sm text-gray-400 mb-2">Add your response:</p>
                              <textarea
                                value={managerReply}
                                onChange={(e) => setManagerReply(e.target.value)}
                                placeholder="Provide feedback, guidance, or acknowledgment of their progress..."
                                className="w-full h-24 p-3 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                              />
                              <div className="flex justify-end space-x-2 mt-2">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    setManagerReplyMode(null);
                                    setManagerReply('');
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => submitManagerReply(plan.id)}
                                  disabled={!managerReply.trim()}
                                >
                                  <MessageCircle size={14} className="mr-1" />
                                  Send Response
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setManagerReplyMode(plan.id)}
                            >
                              <MessageCircle size={14} className="mr-1" />
                              Respond to Progress
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons - Only show when not editing */}
                    {!editingPlan && (
                      <div className="flex space-x-2">
                        {canEditPlan(plan) && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setEditingPlan(plan.id)}
                          >
                            <Edit3 size={14} className="mr-1" />
                            Edit Plan
                          </Button>
                        )}
                        {canRequestModification(plan) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRequestModification(plan.id)}
                          >
                            <AlertCircle size={14} className="mr-1" />
                            Request Modification
                          </Button>
                        )}
                      </div>
                    )}
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

      {/* Completion Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Check className="mr-2 text-green-400" size={20} />
                Mark as Complete
              </h3>
              <button
                onClick={() => {
                  setShowCommentModal(false);
                  setCurrentCompletionItem(null);
                  setCompletionComment('');
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-gray-300 mb-4">
              Please add a comment about what you accomplished and how you completed this {currentCompletionItem?.itemType}:
            </p>

            <textarea
              value={completionComment}
              onChange={(e) => setCompletionComment(e.target.value)}
              placeholder="Describe what you learned, what you accomplished, or how you completed this item..."
              className="w-full h-32 p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
              autoFocus
            />

            <div className="flex justify-end space-x-3 mt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCommentModal(false);
                  setCurrentCompletionItem(null);
                  setCompletionComment('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={submitCompletionComment}
                disabled={!completionComment.trim()}
              >
                <Check size={16} className="mr-2" />
                Mark Complete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}