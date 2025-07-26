// AdminDashboard.tsx - Admin-specific dashboard component
import React from 'react';
import { Users, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

interface AdminDashboardProps {
  stats: any;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Admin Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <Users className="text-blue-400 mr-3" size={24} />
            <div>
              <p className="text-2xl font-bold text-white">{stats.total_employees || 0}</p>
              <p className="text-gray-400 text-sm font-medium">Total Employees</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <Calendar className="text-green-400 mr-3" size={24} />
            <div>
              <p className="text-2xl font-bold text-white">{stats.active_review_cycles || 0}</p>
              <p className="text-gray-400 text-sm font-medium">Active Review Cycles</p>
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
            <AlertCircle className="text-yellow-400 mr-3" size={24} />
            <div>
              <p className="text-2xl font-bold text-white">{stats.pending_assessments || 0}</p>
              <p className="text-gray-400 text-sm font-medium">Pending Assessments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Development Plans Section */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Development Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.development_plans_submitted || 0}</p>
            <p className="text-gray-400 text-sm">Submitted</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">{stats.development_plans_under_review || 0}</p>
            <p className="text-gray-400 text-sm">Under Review</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">{stats.development_plans_approved || 0}</p>
            <p className="text-gray-400 text-sm">Approved</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;