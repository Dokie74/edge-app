// src/components/shared/SidebarRouter.tsx - React Router enabled sidebar
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Target, MessageSquare, BookOpen, LogOut, UserCog } from 'lucide-react';
import { useApp } from '../../contexts';
import EnhancedNotificationCenter from '../ui/EnhancedNotificationCenter';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  roles: string[];
}

const SidebarRouter: React.FC = () => {
  const { userRole, userName, signOut } = useApp();
  const location = useLocation();

  // Define navigation items with their routes and role requirements
  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'employee'] },
    { name: 'My Team', path: '/team', icon: Users, roles: ['admin', 'manager'] },
    { name: 'Manager Playbook', path: '/playbook', icon: BookOpen, roles: ['admin', 'manager'] },
    { name: 'My Reviews', path: '/reviews', icon: FileText, roles: ['admin', 'manager', 'employee'] },
    { name: 'Feedback Wall', path: '/feedback', icon: MessageSquare, roles: ['admin', 'manager', 'employee'] },
    { name: 'My Development', path: '/development', icon: Target, roles: ['admin', 'manager', 'employee'] },
    { name: 'Admin', path: '/admin', icon: UserCog, roles: ['admin'] },
  ];

  // Filter items based on user role
  const visibleItems = navItems.filter(item => 
    !userRole || item.roles.includes(userRole)
  );

  // Check if a nav item is currently active
  const isActiveRoute = (path: string): boolean => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed left-0 top-0 w-64 bg-gray-900 text-white flex flex-col h-screen shadow-2xl z-40">
      <div className="p-6 text-center border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-cyan-400 tracking-wider">EDGE</h1>
          <EnhancedNotificationCenter />
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
          {visibleItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`w-full flex items-center p-3 my-2 rounded-lg transition-all duration-200 text-left ${
                  isActiveRoute(item.path)
                    ? 'bg-cyan-500 text-white shadow-lg'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <item.icon className="mr-4" size={20} />
                <span className="font-semibold">{item.name}</span>
              </Link>
            </li>
          ))}
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

export default SidebarRouter;