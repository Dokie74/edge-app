import React from 'react';
import { LayoutDashboard, Users, FileText, Settings, LogOut } from 'lucide-react';

const Sidebar = ({ activePage, setActivePage, handleSignOut }) => {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'My Team', icon: Users },
    { name: 'My Reviews', icon: FileText },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen shadow-2xl">
      <div className="p-6 text-center border-b border-gray-700">
        <h1 className="text-3xl font-bold text-cyan-400 tracking-wider">EDGE</h1>
      </div>
      <nav className="flex-grow p-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => setActivePage({ name: item.name, props: {} })}
                className={`w-full flex items-center p-3 my-2 rounded-lg transition-all duration-200 text-left ${
                  activePage.name === item.name
                    ? 'bg-cyan-500 text-white shadow-lg'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <item.icon className="mr-4" size={20} />
                <span className="font-semibold">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleSignOut}
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