// EmployeeDashboard.tsx - Employee-specific dashboard component
import React from 'react';
import { CheckCircle, Clock, FileText, Star } from 'lucide-react';

interface EmployeeDashboardProps {
  stats: any;
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">My Performance</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <Clock className="text-yellow-400 mr-3" size={24} />
            <div>
              <p className="text-2xl font-bold text-white">{stats.pending_assessments || 0}</p>
              <p className="text-gray-400 text-sm font-medium">Pending Assessments</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <CheckCircle className="text-green-400 mr-3" size={24} />
            <div>
              <p className="text-2xl font-bold text-white">{stats.completed_assessments || 0}</p>
              <p className="text-gray-400 text-sm font-medium">Completed Assessments</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <Star className="text-blue-400 mr-3" size={24} />
            <div>
              <p className="text-2xl font-bold text-white">{stats.awaiting_manager_review || 0}</p>
              <p className="text-gray-400 text-sm font-medium">Awaiting Review</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <FileText className="text-purple-400 mr-3" size={24} />
            <div>
              <p className="text-2xl font-bold text-white">{stats.development_plans_approved || 0}</p>
              <p className="text-gray-400 text-sm font-medium">Approved Dev Plans</p>
            </div>
          </div>
        </div>
      </div>

      {/* Development Plans Section */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Development Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-400">{stats.development_plans_draft || 0}</p>
            <p className="text-gray-400 text-sm">Draft</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">{stats.development_plans_submitted || 0}</p>
            <p className="text-gray-400 text-sm">Submitted</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">{stats.development_plans_approved || 0}</p>
            <p className="text-gray-400 text-sm">Approved</p>
          </div>
        </div>
      </div>

      {/* Recent Feedback Section */}
      {stats.recent_feedback && stats.recent_feedback.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Feedback</h3>
          <div className="space-y-3">
            {stats.recent_feedback.slice(0, 3).map((feedback: any, index: number) => (
              <div key={index} className="p-3 bg-gray-700 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{feedback.cycle_name}</span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    feedback.status === 'completed' 
                      ? 'bg-green-600 text-green-100' 
                      : 'bg-yellow-600 text-yellow-100'
                  }`}>
                    {feedback.status}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">
                  Reviewed: {new Date(feedback.reviewed_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;