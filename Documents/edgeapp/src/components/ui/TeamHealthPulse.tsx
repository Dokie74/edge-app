// src/components/ui/TeamHealthPulse.tsx - Team health monitoring component
import React, { useState, useEffect } from 'react';
import { Heart, ThumbsUp, AlertTriangle, TrendingUp, X, CheckCircle } from 'lucide-react';
import { useApp } from '../../contexts';
import { supabase } from '../../services/supabaseClient';

interface PulseQuestion {
  id: string;
  question_id: string;
  question_text: string;
  type: 'scale' | 'boolean' | 'choice';
  options?: string[];
  category: 'satisfaction' | 'workload' | 'support' | 'engagement';
  is_active: boolean;
  sort_order: number;
}

interface TeamHealthPulseProps {
  onComplete?: (response: any) => void;
  showRandomQuestion?: boolean;
}

export default function TeamHealthPulse({ onComplete, showRandomQuestion = false }: TeamHealthPulseProps) {
  const { user } = useApp();
  const [currentQuestion, setCurrentQuestion] = useState<PulseQuestion | null>(null);
  const [showPulse, setShowPulse] = useState(false);
  const [hasAnsweredToday, setHasAnsweredToday] = useState(false);
  const [questions, setQuestions] = useState<PulseQuestion[]>([]);

  // Load questions from database
  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('pulse_questions')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      
      console.log('Loaded pulse questions:', data);
      setQuestions(data || []);
    } catch (error) {
      console.error('Error loading pulse questions:', error);
      // Fallback to hardcoded questions if database fails
      const fallbackQuestions = [
        {
          id: '1',
          question_id: 'provide_value',
          question_text: 'Do you feel you provide value to the company?',
          category: 'satisfaction' as const,
          type: 'scale' as const,
          is_active: true,
          sort_order: 1
        },
        {
          id: '2', 
          question_id: 'happy_to_start_work',
          question_text: 'Were you happy to start work today?',
          category: 'satisfaction' as const,
          type: 'scale' as const,
          is_active: true,
          sort_order: 2
        }
      ];
      setQuestions(fallbackQuestions);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadQuestions();
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || questions.length === 0) return;

    // Check if user has answered recently (within 52 minutes)
    const lastAnsweredTime = localStorage.getItem(`pulse_last_answered_time_${user?.id}`);
    const now = new Date().getTime();
    const fiftyTwoMinutesInMs = 52 * 60 * 1000; // 52 minutes in milliseconds
    
    if (lastAnsweredTime && (now - parseInt(lastAnsweredTime)) < fiftyTwoMinutesInMs) {
      setHasAnsweredToday(true);
      return;
    }

    // ALWAYS show question automatically every 52 minutes (no manual trigger needed)
    if (!hasAnsweredToday && questions.length > 0) {
      const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
      setCurrentQuestion(randomQuestion);
      setShowPulse(true);
    }
  }, [user?.id, hasAnsweredToday, questions]);

  const handleResponse = async (response: any) => {
    if (!currentQuestion || !user) return;

    const pulseResponse = {
      questionId: currentQuestion.question_id,
      question: currentQuestion.question_text,
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
          <p className="text-white text-lg mb-4">{currentQuestion.question_text}</p>
          {renderQuestionInput()}
        </div>

        <div className="text-xs text-gray-500 text-center">
          Your response helps us improve our work environment for everyone
        </div>
      </div>
    </div>
  );
}

// Persistent dashboard org health widget
export function OrgHealthWidget() {
  const { user } = useApp();
  const [currentQuestion, setCurrentQuestion] = useState<PulseQuestion | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isNewQuestion, setIsNewQuestion] = useState(false);
  const [questions, setQuestions] = useState<PulseQuestion[]>([]);

  // Load questions from database
  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('pulse_questions')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error loading pulse questions for OrgHealthWidget:', error);
      // Fallback to hardcoded questions if database fails
      const fallbackQuestions = [
        {
          id: '1',
          question_id: 'provide_value',
          question_text: 'Do you feel you provide value to the company?',
          category: 'satisfaction' as const,
          type: 'scale' as const,
          is_active: true,
          sort_order: 1
        },
        {
          id: '2', 
          question_id: 'workplace_satisfaction',
          question_text: 'How satisfied are you with your workplace today?',
          category: 'satisfaction' as const,
          type: 'scale' as const,
          is_active: true,
          sort_order: 2
        }
      ];
      setQuestions(fallbackQuestions);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadQuestions();
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || questions.length === 0) return;

    const checkForNewQuestion = () => {
      const lastAnsweredTime = localStorage.getItem(`pulse_last_answered_time_${user.id}`);
      const lastQuestionId = localStorage.getItem(`pulse_last_question_id_${user.id}`);
      const now = new Date().getTime();
      
      // Random interval between 10 minutes and 52 minutes (gamified randomness)
      const minInterval = 10 * 60 * 1000; // 10 minutes
      const maxInterval = 52 * 60 * 1000; // 52 minutes
      const randomInterval = Math.random() * (maxInterval - minInterval) + minInterval;
      
      if (!lastAnsweredTime || (now - parseInt(lastAnsweredTime)) > randomInterval) {
        // Time for a new question
        const availableQuestions = questions.filter(q => q.question_id !== lastQuestionId);
        const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        
        setCurrentQuestion(randomQuestion);
        setHasAnswered(false);
        setIsNewQuestion(true);
        localStorage.setItem(`pulse_current_question_${user.id}`, JSON.stringify(randomQuestion));
      } else {
        // Check if there's a current unanswered question
        const storedQuestion = localStorage.getItem(`pulse_current_question_${user.id}`);
        const storedAnswered = localStorage.getItem(`pulse_question_answered_${user.id}`);
        
        if (storedQuestion) {
          setCurrentQuestion(JSON.parse(storedQuestion));
          setHasAnswered(storedAnswered === 'true');
          setIsNewQuestion(false);
        }
      }
    };

    checkForNewQuestion();
    
    // Check for new questions every minute
    const interval = setInterval(checkForNewQuestion, 60000);
    return () => clearInterval(interval);
  }, [user?.id, questions]);

  const handleResponse = async (response: any) => {
    if (!currentQuestion || !user) return;

    const pulseResponse = {
      questionId: currentQuestion.question_id,
      question: currentQuestion.question_text,
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
      
      // Save response with user context
      await TeamHealthService.savePulseResponse(
        pulseResponse, 
        employee?.name || user.email?.split('@')[0] || 'Unknown',
        employee?.manager_id,
        employee?.department
      );
      
      // Mark as answered
      localStorage.setItem(`pulse_last_answered_time_${user.id}`, new Date().getTime().toString());
      localStorage.setItem(`pulse_last_question_id_${user.id}`, currentQuestion.question_id);
      localStorage.setItem(`pulse_question_answered_${user.id}`, 'true');
      
      setHasAnswered(true);
      setIsNewQuestion(false);
      
    } catch (error) {
      console.error('Error saving pulse response:', error);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <Heart className="text-gray-500" size={20} />
          <div>
            <h4 className="text-gray-400 font-medium">Org Health Pulse</h4>
            <p className="text-gray-500 text-sm">
              {questions.length === 0 ? 'Setting up questions...' : 'Loading next question...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-4 transition-all duration-500 ${
      hasAnswered 
        ? 'bg-green-900/30 border border-green-500/40' 
        : isNewQuestion 
          ? 'bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-400/50 shadow-lg shadow-cyan-500/20' 
          : 'bg-cyan-900/20 border border-cyan-500/30'
    }`}>
      <div className="flex items-start space-x-3">
        {hasAnswered ? (
          <CheckCircle className="text-green-400 animate-pulse" size={20} />
        ) : (
          <Heart className={`${isNewQuestion ? 'text-cyan-300 animate-bounce' : 'text-cyan-400'}`} size={20} />
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h4 className={`font-medium ${
              hasAnswered ? 'text-green-200' : 'text-cyan-200'
            }`}>
              Org Health Pulse {isNewQuestion && !hasAnswered && '✨ NEW!'}
            </h4>
            {isNewQuestion && !hasAnswered && (
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
            )}
          </div>
          
          <p className={`text-sm mb-4 ${
            hasAnswered ? 'text-green-300' : 'text-white'
          }`}>
            {currentQuestion.question_text}
          </p>
          
          {hasAnswered ? (
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-400" size={16} />
              <span className="text-green-300 text-sm font-medium">
                Thanks for your feedback! 🎉
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Strongly Disagree</span>
                <span>Strongly Agree</span>
              </div>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map(value => (
                  <button
                    key={value}
                    onClick={() => handleResponse(value)}
                    className="w-10 h-10 rounded-full border-2 border-cyan-500 hover:bg-cyan-500 hover:text-white transition-all duration-200 flex items-center justify-center font-semibold text-sm hover:scale-110"
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}