// src/components/shared/Sidebar.js - Updated with React Router navigation
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Target, MessageSquare, BookOpen, LogOut, UserCog, HelpCircle } from 'lucide-react';
import { useApp } from '../../contexts';
import NotificationCenter from '../ui/NotificationCenter';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole, userName, signOut } = useApp();
  
  // Define navigation items with role requirements and routes
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'employee'], route: '/dashboard' },
    { name: 'My Team', icon: Users, roles: ['admin', 'manager'], route: '/team' },
    { name: 'Manager Playbook', icon: BookOpen, roles: ['admin', 'manager'], route: '/playbook' },
    { name: 'My Reviews', icon: FileText, roles: ['admin', 'manager', 'employee'], route: '/reviews' },
    { name: 'Feedback Wall', icon: MessageSquare, roles: ['admin', 'manager', 'employee'], route: '/feedback' },
    { name: 'My Development', icon: Target, roles: ['admin', 'manager', 'employee'], route: '/development' },
    { name: 'Admin', icon: UserCog, roles: ['admin'], route: '/admin' },
    { name: 'Help', icon: HelpCircle, roles: ['admin', 'manager', 'employee'], route: '/help' },
  ];

  // Filter items based on user role
  const visibleItems = navItems.filter(item => 
    !userRole || item.roles.includes(userRole)
  );

    return (
    <div className="fixed left-0 top-0 w-64 bg-gray-900 text-white flex flex-col h-screen shadow-2xl z-40">
      <div className="p-6 text-center border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-cyan-400 tracking-wider">EDGE</h1>
          <NotificationCenter />
        </div>
        {userName && (
          <div className="mt-2">
            <p className="text-sm text-gray-300">Welcome, {userName}</p>
            {userRole && (
              <p className="text-xs text-gray-500 capitalize">({userRole})</p>
            )}
          </div>
        )}
      </div>
      
      <nav className="flex-grow overflow-y-auto p-4">
        <ul>
          {visibleItems.map((item) => {
            const isActive = location.pathname === item.route || 
                           (item.route === '/dashboard' && location.pathname === '/');
            
            return (
              <li key={item.name}>
                <button
                  onClick={() => navigate(item.route)}
                  className={`w-full flex items-center p-3 my-2 rounded-lg transition-all duration-200 text-left ${
                    isActive
                      ? 'bg-cyan-500 text-white shadow-lg'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <item.icon className="mr-4" size={20} />
                  <span className="font-semibold">{item.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-700 flex-shrink-0">
        <button
          onClick={signOut}
          className="w-full flex items-center p-3 rounded-lg text-gray-400 hover:bg-red-600 hover:text-white transition-all duration-200"
        >
          <LogOut className="mr-4" size={20} />
          <span className="font-semibold">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;