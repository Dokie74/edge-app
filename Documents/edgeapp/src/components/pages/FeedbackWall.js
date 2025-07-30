import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, User, Filter, Plus, Clock, ThumbsUp, Send, Inbox } from 'lucide-react';
import { useApp } from '../../contexts';
import { Button, LoadingSpinner, ErrorMessage } from '../ui';
import { formatDate } from '../../utils';
import { FeedbackService } from '../../services';

// Define feedback type configuration outside component for global access
const feedbackTypeConfig = {
  positive: { 
    icon: Star, 
    color: 'text-yellow-400', 
    bgColor: 'bg-yellow-900', 
    label: 'Positive Recognition' 
  },
  constructive: { 
    icon: MessageSquare, 
    color: 'text-blue-400', 
    bgColor: 'bg-blue-900', 
    label: 'Constructive Feedback' 
  },
  appreciation: { 
    icon: ThumbsUp, 
    color: 'text-green-400', 
    bgColor: 'bg-green-900', 
    label: 'Appreciation' 
  }
};

const FeedbackWall = () => {
  const { openModal } = useApp();
  const [feedback, setFeedback] = useState([]);
  const [feedbackGiven, setFeedbackGiven] = useState([]);
  const [feedbackReceived, setFeedbackReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('wall'); // 'wall', 'given', 'received'
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const [wallData, givenData, receivedData] = await Promise.all([
        FeedbackService.getFeedbackWall(50, filter === 'all' ? null : filter),
        FeedbackService.getMyFeedbackGiven(20),
        FeedbackService.getMyFeedbackReceived(20)
      ]);
      setFeedback(wallData);
      setFeedbackGiven(givenData);
      setFeedbackReceived(receivedData);
    } catch (err) {
      console.error('FeedbackWall error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFeedback();
    setRefreshing(false);
  };

  const getCurrentData = () => {
    switch (view) {
      case 'given':
        return feedbackGiven.filter(item => filter === 'all' || item.feedback_type === filter);
      case 'received':
        return feedbackReceived.filter(item => filter === 'all' || item.feedback_type === filter);
      default:
        return feedback.filter(item => filter === 'all' || item.feedback_type === filter);
    }
  };

  const currentData = getCurrentData();


  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" message="Loading feedback wall..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorMessage error={error} title="Feedback Wall Error" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">
              {view === 'wall' ? 'Feedback Wall' : 
               view === 'given' ? 'Feedback Given' : 'Feedback Received'}
            </h1>
            <p className="text-gray-400 mt-2">
              {view === 'wall' ? 'Real-time peer feedback fostering continuous dialogue and growth' :
               view === 'given' ? 'Feedback you\'ve shared with colleagues' : 'Feedback you\'ve received from colleagues'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => openModal('giveFeedback')}
              variant="primary"
            >
              <Plus size={18} className="mr-2" />
              Give Feedback
            </Button>
          </div>
        </div>
      </header>

      {/* View Toggle */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg border border-gray-700 max-w-md">
          <button
            onClick={() => setView('wall')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
              view === 'wall' 
                ? 'bg-cyan-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <MessageSquare size={16} />
            <span>Public Wall</span>
          </button>
          <button
            onClick={() => setView('received')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
              view === 'received' 
                ? 'bg-cyan-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Inbox size={16} />
            <span>Received ({feedbackReceived.length})</span>
          </button>
          <button
            onClick={() => setView('given')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
              view === 'given' 
                ? 'bg-cyan-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Send size={16} />
            <span>Given ({feedbackGiven.length})</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {(() => {
              const baseData = view === 'given' ? feedbackGiven : 
                              view === 'received' ? feedbackReceived : 
                              feedback;
              return [
                { key: 'all', label: 'All Feedback', count: baseData.length },
                { key: 'positive', label: 'Recognition', count: baseData.filter(f => f.feedback_type === 'positive').length },
                { key: 'constructive', label: 'Growth', count: baseData.filter(f => f.feedback_type === 'constructive').length },
                { key: 'appreciation', label: 'Thanks', count: baseData.filter(f => f.feedback_type === 'appreciation').length }
              ];
            })().map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  filter === tab.key
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <span>{tab.label}</span>
                <span className="bg-gray-600 text-gray-300 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-gray-400 text-sm">
            Showing {currentData.length} feedback items
          </p>
          <Button
            onClick={handleRefresh}
            variant="secondary"
            size="sm"
            disabled={refreshing}
          >
            {refreshing ? (
              <Clock size={14} className="mr-1 animate-spin" />
            ) : (
              <Filter size={14} className="mr-1" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Feedback Content */}
      {currentData.length === 0 ? (
        <EmptyState filter={filter} view={view} onGiveFeedback={() => openModal('giveFeedback')} />
      ) : (
        <div className="space-y-4">
          {currentData.map(item => (
            <FeedbackCard key={item.feedback_id} feedback={item} view={view} />
          ))}
        </div>
      )}

      {/* Usage Guidelines */}
      <div className="mt-12 bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">How to Use the Feedback Wall</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Star className="text-yellow-400" size={20} />
              <h4 className="text-yellow-400 font-medium">Recognition</h4>
            </div>
            <p className="text-gray-300 text-sm">
              Celebrate colleagues' achievements, great work, and positive behaviors. 
              Public recognition boosts morale and reinforces core values.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <MessageSquare className="text-blue-400" size={20} />
              <h4 className="text-blue-400 font-medium">Growth Feedback</h4>
            </div>
            <p className="text-gray-300 text-sm">
              Provide constructive feedback to help colleagues improve and develop. 
              Focus on specific behaviors and actionable suggestions.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <ThumbsUp className="text-green-400" size={20} />
              <h4 className="text-green-400 font-medium">Appreciation</h4>
            </div>
            <p className="text-gray-300 text-sm">
              Thank colleagues for their help, support, or collaboration. 
              Expressing gratitude strengthens team relationships.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ filter, view, onGiveFeedback }) => {
  const getEmptyMessage = () => {
    if (view === 'given') {
      return {
        title: filter === 'all' ? 'No feedback given yet' : `No ${filter} feedback given yet`,
        message: "Start sharing feedback with your colleagues to help them grow and improve.",
        buttonText: "Give First Feedback"
      };
    } else if (view === 'received') {
      return {
        title: filter === 'all' ? 'No feedback received yet' : `No ${filter} feedback received yet`,
        message: "Feedback from colleagues will appear here. Encourage others to share feedback!",
        buttonText: "Give Feedback to Others"
      };
    }
    return {
      title: filter === 'all' ? 'No feedback yet' : `No ${filter} feedback yet`,
      message: "Be the first to share feedback with your colleagues! Continuous dialogue helps everyone grow.",
      buttonText: "Give First Feedback"
    };
  };

  const emptyState = getEmptyMessage();
  const Icon = view === 'given' ? Send : view === 'received' ? Inbox : MessageSquare;

  return (
    <div className="text-center py-16">
      <Icon size={64} className="mx-auto text-gray-500 mb-6" />
      <h3 className="text-xl font-semibold text-white mb-2">
        {emptyState.title}
      </h3>
      <p className="text-gray-400 mb-8 max-w-md mx-auto">
        {emptyState.message}
      </p>
      <Button onClick={onGiveFeedback} variant="primary">
        <Plus size={18} className="mr-2" />
        {emptyState.buttonText}
      </Button>
    </div>
  );
};

// Feedback Card Component
const FeedbackCard = ({ feedback, view = 'wall' }) => {
  const typeConfig = feedbackTypeConfig[feedback.feedback_type] || feedbackTypeConfig.positive;
  const Icon = typeConfig.icon;

  const getDisplayText = () => {
    if (view === 'given') {
      return {
        name: feedback.recipient_name,
        action: 'received your',
        from: null
      };
    } else if (view === 'received') {
      return {
        name: 'You',
        action: 'received',
        from: feedback.is_anonymous ? 'Anonymous' : feedback.giver_name
      };
    }
    return {
      name: feedback.recipient_name,
      action: 'received',
      from: feedback.is_anonymous ? 'Anonymous' : feedback.giver_name
    };
  };

  const displayText = getDisplayText();

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-start space-x-4">
        <div className={`p-2 rounded-lg ${typeConfig.bgColor} bg-opacity-50`}>
          <Icon size={20} className={typeConfig.color} />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <h4 className="text-white font-medium">{displayText.name}</h4>
              <span className="text-gray-400">{displayText.action}</span>
              <span className={`px-2 py-1 text-xs rounded ${typeConfig.bgColor} ${typeConfig.color}`}>
                {typeConfig.label}
              </span>
            </div>
            <span className="text-gray-500 text-sm">
              {formatDate(feedback.created_at)}
            </span>
          </div>
          
          <p className="text-gray-300 mb-3">{feedback.message}</p>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              {displayText.from && (
                <span className="text-gray-400">
                  from {displayText.from}
                </span>
              )}
              {view === 'given' && (
                <span className="text-gray-400">
                  to {feedback.recipient_name}
                </span>
              )}
              {feedback.category && feedback.category !== 'general' && (
                <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                  {feedback.category.replace('_', ' ')}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="text-gray-400 hover:text-cyan-400 transition-colors">
                <ThumbsUp size={16} />
              </button>
              <span className="text-gray-500 text-xs">{feedback.helpful_count || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackWall;