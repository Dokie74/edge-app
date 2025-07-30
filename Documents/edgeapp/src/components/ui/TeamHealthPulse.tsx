// src/components/ui/TeamHealthPulse.tsx - Team health monitoring component
import React, { useState, useEffect } from 'react';
import { Heart, ThumbsUp, AlertTriangle, TrendingUp, X, CheckCircle } from 'lucide-react';
import { useApp } from '../../contexts';

interface PulseQuestion {
  id: string;
  question: string;
  type: 'scale' | 'boolean' | 'choice';
  options?: string[];
  category: 'satisfaction' | 'workload' | 'support' | 'engagement';
}

const PULSE_QUESTIONS: PulseQuestion[] = [
  {
    id: 'provide_value',
    question: 'Do you feel you provide value to the company?',
    type: 'scale',
    category: 'satisfaction'
  },
  {
    id: 'happy_to_start_work',
    question: 'Were you happy to start work today?',
    type: 'scale',
    category: 'satisfaction'
  },
  {
    id: 'feel_contribute',
    question: 'Do you feel you contribute meaningfully to your team?',
    type: 'scale',
    category: 'satisfaction'
  },
  {
    id: 'workplace_satisfaction',
    question: 'How satisfied are you with your workplace today?',
    type: 'scale',
    category: 'satisfaction'
  },
  {
    id: 'team_collaboration',
    question: 'How would you rate your team collaboration today?',
    type: 'scale',
    category: 'satisfaction'
  },
  {
    id: 'workload_balance',
    question: 'How manageable is your workload today?',
    type: 'scale',
    category: 'satisfaction'
  },
  {
    id: 'work_environment',
    question: 'How comfortable is your work environment?',
    type: 'scale',
    category: 'satisfaction'
  },
  {
    id: 'job_fulfillment',
    question: 'How fulfilling is your work today?',
    type: 'scale',
    category: 'satisfaction'
  }
];

interface TeamHealthPulseProps {
  onComplete?: (response: any) => void;
  showRandomQuestion?: boolean;
}

export default function TeamHealthPulse({ onComplete, showRandomQuestion = false }: TeamHealthPulseProps) {
  const { user } = useApp();
  const [currentQuestion, setCurrentQuestion] = useState<PulseQuestion | null>(null);
  const [showPulse, setShowPulse] = useState(false);
  const [hasAnsweredToday, setHasAnsweredToday] = useState(false);

  useEffect(() => {
    // Check if user has answered recently (within 50 minutes)
    const lastAnsweredTime = localStorage.getItem(`pulse_last_answered_time_${user?.id}`);
    const now = new Date().getTime();
    const fiftyMinutesInMs = 50 * 60 * 1000; // 50 minutes in milliseconds
    
    if (lastAnsweredTime && (now - parseInt(lastAnsweredTime)) < fiftyMinutesInMs) {
      setHasAnsweredToday(true);
      return;
    }

    // Show random question if enabled and user hasn't answered recently
    if (showRandomQuestion && !hasAnsweredToday) {
      const randomQuestion = PULSE_QUESTIONS[Math.floor(Math.random() * PULSE_QUESTIONS.length)];
      setCurrentQuestion(randomQuestion);
      setShowPulse(true);
    }
  }, [user?.id, showRandomQuestion, hasAnsweredToday]);

  const handleResponse = async (response: any) => {
    if (!currentQuestion || !user) return;

    const pulseResponse = {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      response,
      timestamp: new Date().toISOString(),
      userId: user.id,
      category: currentQuestion.category
    };

    try {
      // Import TeamHealthService dynamically
      const { TeamHealthService } = await import('../../services/TeamHealthService');
      
      // Get user info for alert creation
      const { supabase } = await import('../../services/supabaseClient');
      const { data: employee } = await supabase
        .from('employees')
        .select('name, manager_id, department')
        .eq('user_id', user.id)
        .single();
      
      // Save response with user context for alert creation
      await TeamHealthService.savePulseResponse(
        pulseResponse, 
        employee?.name || user.email?.split('@')[0] || 'Unknown',
        employee?.manager_id,
        employee?.department
      );
      
      // Mark as answered recently (store timestamp)
      localStorage.setItem(`pulse_last_answered_time_${user.id}`, new Date().getTime().toString());
      
      if (onComplete) {
        onComplete(pulseResponse);
      }

      setHasAnsweredToday(true);
      setShowPulse(false);
    } catch (error) {
      console.error('Error saving pulse response:', error);
    }
  };

  const renderQuestionInput = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'scale':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Strongly Disagree</span>
              <span className="text-sm text-gray-400">Strongly Agree</span>
            </div>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map(value => (
                <button
                  key={value}
                  onClick={() => handleResponse(value)}
                  className="w-12 h-12 rounded-full border-2 border-cyan-500 hover:bg-cyan-500 hover:text-white transition-colors flex items-center justify-center font-semibold"
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        );


      default:
        return null;
    }
  };

  const PulseIcon = () => {
    const category = currentQuestion?.category;
    switch (category) {
      case 'satisfaction': return <Heart className="text-red-400" size={24} />;
      case 'workload': return <TrendingUp className="text-yellow-400" size={24} />;
      case 'support': return <ThumbsUp className="text-blue-400" size={24} />;
      case 'engagement': return <CheckCircle className="text-green-400" size={24} />;
      default: return <Heart className="text-cyan-400" size={24} />;
    }
  };

  if (!showPulse || hasAnsweredToday || !currentQuestion) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-600 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <PulseIcon />
            <h3 className="text-lg font-semibold text-white">Team Health Pulse</h3>
          </div>
          <button
            onClick={() => setShowPulse(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-white text-lg mb-4">{currentQuestion.question}</p>
          {renderQuestionInput()}
        </div>

        <div className="text-xs text-gray-500 text-center">
          Your response helps us improve our work environment for everyone
        </div>
      </div>
    </div>
  );
}

// Quick pulse component for dashboard integration
export function QuickHealthCheck() {
  const [showModal, setShowModal] = useState(false);
  const { user } = useApp();

  const hasAnsweredRecently = () => {
    const lastAnsweredTime = localStorage.getItem(`pulse_last_answered_time_${user?.id}`);
    if (!lastAnsweredTime) return false;
    
    const now = new Date().getTime();
    const fiftyMinutesInMs = 50 * 60 * 1000; // 50 minutes in milliseconds
    
    return (now - parseInt(lastAnsweredTime)) < fiftyMinutesInMs;
  };

  const getTimeUntilNext = () => {
    const lastAnsweredTime = localStorage.getItem(`pulse_last_answered_time_${user?.id}`);
    if (!lastAnsweredTime) return 0;
    
    const nextQuestionTime = parseInt(lastAnsweredTime) + (50 * 60 * 1000);
    const timeUntilNext = Math.max(0, nextQuestionTime - new Date().getTime());
    return Math.ceil(timeUntilNext / (60 * 1000));
  };

  if (hasAnsweredRecently()) {
    const minutesLeft = getTimeUntilNext();
    
    return (
      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <CheckCircle className="text-green-400" size={20} />
          <div>
            <h4 className="text-green-200 font-medium">Thanks for your feedback!</h4>
            <p className="text-green-300 text-sm">
              Next pulse check available in {minutesLeft} minutes
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4 cursor-pointer hover:bg-cyan-900/30 transition-colors"
           onClick={() => setShowModal(true)}>
        <div className="flex items-center space-x-3">
          <Heart className="text-cyan-400" size={20} />
          <div>
            <h4 className="text-cyan-200 font-medium">How are you today?</h4>
            <p className="text-cyan-300 text-sm">Quick health check • 30 seconds</p>
          </div>
          <TrendingUp className="text-cyan-400" size={16} />
        </div>
      </div>

      {showModal && (
        <TeamHealthPulse 
          showRandomQuestion={true}
          onComplete={() => setShowModal(false)}
        />
      )}
    </>
  );
}