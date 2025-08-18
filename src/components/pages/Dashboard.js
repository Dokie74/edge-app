// src/components/pages/Dashboard.js - Enhanced V2.5
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, Clock, Award, TrendingUp, MessageSquare, Inbox, Star, ThumbsUp, X } from 'lucide-react';
import { useAssessments, useKudos } from '../../hooks';
import { useApp } from '../../contexts';
import { getStatusDisplay, filterActiveReviews, filterCompletedReviews, formatDate } from '../../utils';
import { LoadingSpinner, ErrorMessage, StatusBadge, Button, Card } from '../ui';
import { FeedbackService } from '../../services';

const Dashboard = () => {
    const navigate = useNavigate();
    const { openModal } = useApp();
    const { assessments, loading: assessmentsLoading, error: assessmentsError } = useAssessments();
    const { kudos, loading: kudosLoading, error: kudosError } = useKudos();
    const [feedbackReceived, setFeedbackReceived] = useState([]);
    const [feedbackLoading, setFeedbackLoading] = useState(true);
    
    const loading = assessmentsLoading || kudosLoading || feedbackLoading;
    const error = assessmentsError || kudosError;

    useEffect(() => {
        fetchRecentFeedback();
    }, []);

    const fetchRecentFeedback = async () => {
        try {
            setFeedbackLoading(true);
            const data = await FeedbackService.getMyFeedbackReceived(3); // Get 3 most recent
            setFeedbackReceived(data || []);
        } catch (err) {
            console.error('Error fetching feedback:', err);
        } finally {
            setFeedbackLoading(false);
        }
    };

    const handleDismissFeedback = (feedbackId) => {
        setFeedbackReceived(prev => prev.filter(f => f.feedback_id !== feedbackId));
    };

    const handleViewAssessment = (assessment) => {
        navigate(`/assessment/${assessment.assessment_id}`);
    };

    if (loading) {
        return (
            <div className="p-8">
                <LoadingSpinner size="lg" message="Loading your dashboard..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <ErrorMessage error={error} title="Dashboard Error" />
            </div>
        );
    }

    const activeReviews = filterActiveReviews(assessments);
    const completedReviews = filterCompletedReviews(assessments);
    const recentKudos = kudos.slice(0, 5);

    return (
        <div className="p-8">
            {/* Header */}
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400 mt-2">
                    Welcome back! Here's your summary.
                </p>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Active Reviews</p>
                            <p className="text-2xl font-bold text-cyan-400">{activeReviews.length}</p>
                        </div>
                        <Calendar className="text-cyan-400" size={24} />
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Reviews</p>
                            <p className="text-2xl font-bold text-green-400">{assessments.length}</p>
                        </div>
                        <CheckCircle className="text-green-400" size={24} />
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Recent Kudos</p>
                            <p className="text-2xl font-bold text-purple-400">{recentKudos.length}</p>
                        </div>
                        <Award className="text-purple-400" size={24} />
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Feedback Received</p>
                            <p className="text-2xl font-bold text-orange-400">{feedbackReceived.length}</p>
                        </div>
                        <Inbox className="text-orange-400" size={24} />
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className={`grid grid-cols-1 ${feedbackReceived.length > 0 ? 'lg:grid-cols-2' : ''} gap-8 mb-8`}>
                {/* Active Reviews */}
                <div className="bg-gray-800 rounded-lg shadow-2xl p-6">
                    <h2 className="text-2xl font-semibold mb-6 text-cyan-400 flex items-center">
                        <Calendar className="mr-3" size={24} />
                        Active Reviews
                    </h2>
                    <div className="space-y-4">
                        {activeReviews.length > 0 ? (
                            activeReviews.map(assessment => {
                                const statusInfo = getStatusDisplay(assessment);
                                
                                return (
                                    <div key={assessment.assessment_id} className="bg-gray-700 p-4 rounded-lg">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="text-lg font-semibold text-white">{assessment.cycle?.name || assessment.cycle_name || 'Unnamed Cycle'}</h3>
                                                <div className="flex items-center mt-1">
                                                    <StatusBadge status={assessment.self_assessment_status || assessment.status} />
                                                </div>
                                            </div>
                                            <Button 
                                                onClick={() => handleViewAssessment(assessment)}
                                                variant="primary"
                                                size="sm"
                                            >
                                                {statusInfo.actionLabel}
                                            </Button>
                                        </div>
                                        
                                        {/* Enhanced Progress indicator */}
{assessment.self_assessment_status === 'in_progress' && (
    <div className="mt-3 p-2 bg-yellow-900 rounded text-yellow-200 text-sm flex items-center">
        <Clock size={14} className="mr-2" />
        <div>
            <div className="font-medium">Continue your self-assessment</div>
            <div className="text-xs text-yellow-300">Complete all sections to submit for review</div>
        </div>
    </div>
)}

                                      {assessment.self_assessment_status === 'employee_complete' && (
                                          <div className="mt-3 p-2 bg-blue-900 rounded text-blue-200 text-sm flex items-center">
                                              <CheckCircle size={14} className="mr-2" />
                                              <div>
                                                  <div className="font-medium">Submitted for manager review</div>
                                                  <div className="text-xs text-blue-300">Your manager will review and provide feedback</div>
                                              </div>
                                          </div>
                                      )}

                                      {assessment.self_assessment_status === 'manager_complete' && (
                                          <div className="mt-3 p-2 bg-purple-900 rounded text-purple-200 text-sm flex items-center">
                                              <Award size={14} className="mr-2" />
                                              <div>
                                                  <div className="font-medium">Manager review complete</div>
                                                  <div className="text-xs text-purple-300">Review the feedback and development plan</div>
                                              </div>
                                          </div>
                                      )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Calendar size={48} className="mx-auto mb-4 text-gray-600" />
                                <p>No active reviews at this time.</p>
                            </div>
                        )}
                    </div>
                </div>


                {/* Recent Feedback - Only show if feedback exists */}
                {feedbackReceived.length > 0 && (
                    <div className="bg-gray-800 rounded-lg shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-orange-400 flex items-center">
                                <Inbox className="mr-3" size={24} />
                                Recent Feedback
                            </h2>
                            <div className="flex space-x-2">
                                <button
                                    onClick={fetchRecentFeedback}
                                    className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-3 rounded-lg transition text-sm"
                                    title="Refresh feedback"
                                >
                                    🔄
                                </button>
                                <button
                                    onClick={() => navigate('/feedback')}
                                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition text-sm"
                                >
                                    View All
                                </button>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            {feedbackReceived.map(feedback => (
                                <FeedbackCard 
                                    key={feedback.feedback_id} 
                                    feedback={feedback} 
                                    onDismiss={handleDismissFeedback}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-lg shadow-2xl p-6">
                <h2 className="text-2xl font-semibold mb-6 text-white flex items-center">
                    <TrendingUp className="mr-3" size={24} />
                    Quick Actions
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => navigate('/reviews')}
                        className="bg-blue-700 hover:bg-blue-600 text-left p-4 rounded-lg transition group"
                    >
                        <div className="flex items-center">
                            <Calendar size={20} className="text-blue-400 mr-3" />
                            <div>
                                <p className="text-white font-medium">View All Reviews</p>
                                <p className="text-blue-300 text-sm">See your review history</p>
                            </div>
                        </div>
                    </button>

                    {openModal && (
                        <button
                            onClick={() => navigate('/feedback')}
                            className="bg-orange-700 hover:bg-orange-600 text-left p-4 rounded-lg transition group"
                        >
                            <div className="flex items-center">
                                <MessageSquare size={20} className="text-orange-400 mr-3" />
                                <div>
                                    <p className="text-white font-medium">Give Feedback</p>
                                    <p className="text-orange-300 text-sm">Share feedback with colleagues</p>
                                </div>
                            </div>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Feedback type configuration
const feedbackTypeConfig = {
    positive: { 
        icon: Star, 
        color: 'text-yellow-400', 
        bgColor: 'bg-yellow-900', 
        label: 'Recognition' 
    },
    constructive: { 
        icon: MessageSquare, 
        color: 'text-blue-400', 
        bgColor: 'bg-blue-900', 
        label: 'Growth' 
    },
    appreciation: { 
        icon: ThumbsUp, 
        color: 'text-green-400', 
        bgColor: 'bg-green-900', 
        label: 'Thanks' 
    }
};

// Feedback Card Component for Dashboard
const FeedbackCard = ({ feedback, onDismiss }) => {
    const typeConfig = feedbackTypeConfig[feedback.feedback_type] || feedbackTypeConfig.positive;
    const Icon = typeConfig.icon;

    return (
        <div className="bg-gray-700 p-4 rounded-lg group hover:bg-gray-600 transition-colors">
            <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${typeConfig.bgColor} bg-opacity-50 flex-shrink-0`}>
                    <Icon size={16} className={typeConfig.color} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                            <span className="text-white font-medium">You</span>
                            <span className="text-gray-400 text-sm">received</span>
                            <span className={`px-2 py-1 text-xs rounded ${typeConfig.bgColor} ${typeConfig.color}`}>
                                {typeConfig.label}
                            </span>
                        </div>
                        <button
                            onClick={() => onDismiss(feedback.feedback_id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-all duration-200"
                            title="Dismiss"
                        >
                            <X size={14} />
                        </button>
                    </div>
                    <p className="text-gray-300 text-sm mb-2 line-clamp-2">{feedback.message}</p>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-xs">
                            from {feedback.is_anonymous ? 'Anonymous' : feedback.giver_name}
                        </span>
                        <span className="text-gray-500 text-xs">
                            {formatDate(feedback.created_at)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;