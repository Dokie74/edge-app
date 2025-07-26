// ManagerDashboard.tsx - Manager-specific dashboard component
import React from 'react';
import { Users, CheckCircle, Clock, FileText } from 'lucide-react';

interface ManagerDashboardProps {
  stats: any;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Manager Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <Users className="text-blue-400 mr-3" size={24} />
            <div>
              <p className="text-2xl font-bold text-white">{stats.team_members || 0}</p>
              <p className="text-gray-400 text-sm font-medium">Team Members</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <Clock className="text-yellow-400 mr-3" size={24} />
            <div>
              <p className="text-2xl font-bold text-white">{stats.pending_reviews || 0}</p>
              <p className="text-gray-400 text-sm font-medium">Pending Reviews</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <CheckCircle className="text-green-400 mr-3" size={24} />
            <div>
              <p className="text-2xl font-bold text-white">{stats.completed_reviews || 0}</p>
              <p className="text-gray-400 text-sm font-medium">Completed Reviews</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <FileText className="text-purple-400 mr-3" size={24} />
            <div>
              <p className="text-2xl font-bold text-white">{stats.development_plans_to_review || 0}</p>
              <p className="text-gray-400 text-sm font-medium">Dev Plans to Review</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Performance Section */}
      {stats.team_performance && stats.team_performance.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Team Performance</h3>
          <div className="space-y-3">
            {stats.team_performance.slice(0, 5).map((member: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                <span className="text-white font-medium">{member.employee_name}</span>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 text-xs rounded ${
                    member.assessment_status === 'completed' 
                      ? 'bg-green-600 text-green-100' 
                      : 'bg-yellow-600 text-yellow-100'
                  }`}>
                    Self: {member.assessment_status || 'pending'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    member.manager_review_status === 'completed' 
                      ? 'bg-green-600 text-green-100' 
                      : 'bg-yellow-600 text-yellow-100'
                  }`}>
                    Review: {member.manager_review_status || 'pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;