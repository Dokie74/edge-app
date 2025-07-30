// src/components/ui/TeamHealthAlerts.tsx - Team health alerts component
import React, { useState, useEffect } from 'react';
import { AlertTriangle, User, Clock, CheckCircle, X, Heart } from 'lucide-react';
import { TeamHealthService, TeamHealthAlert } from '../../services/TeamHealthService';
import { useApp } from '../../contexts';

interface TeamHealthAlertsProps {
  role: 'manager' | 'admin';
  managerId?: string;
  showInline?: boolean;
}

export default function TeamHealthAlerts({ role, managerId, showInline = false }: TeamHealthAlertsProps) {
  const [alerts, setAlerts] = useState<TeamHealthAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
    
    // Refresh alerts every 30 seconds
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
  }, [role, managerId]);

  const loadAlerts = () => {
    try {
      setLoading(true);
      let alertsData: TeamHealthAlert[] = [];
      
      if (role === 'manager' && managerId) {
        alertsData = TeamHealthService.getManagerAlerts(managerId);
      } else if (role === 'admin') {
        alertsData = TeamHealthService.getAdminAlerts();
      }
      
      // Sort by severity and timestamp
      alertsData.sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
        if (severityDiff !== 0) return severityDiff;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
      
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading team health alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = (alertId: string) => {
    TeamHealthService.acknowledgeAlert(alertId);
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-l-red-500 bg-red-900/10 text-red-200';
      case 'medium': return 'border-l-yellow-500 bg-yellow-900/10 text-yellow-200';
      case 'low': return 'border-l-blue-500 bg-blue-900/10 text-blue-200';
      default: return 'border-l-gray-500 bg-gray-900/10 text-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="text-red-400" size={16} />;
      case 'medium': return <AlertTriangle className="text-yellow-400" size={16} />;
      case 'low': return <AlertTriangle className="text-blue-400" size={16} />;
      default: return <AlertTriangle className="text-gray-400" size={16} />;
    }
  };

  const formatResponse = (response: any) => {
    if (typeof response === 'boolean') {
      return response ? 'Yes' : 'No';
    }
    if (typeof response === 'number') {
      return `${response}/5`;
    }
    return response;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-gray-400">Loading alerts...</div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return showInline ? null : (
      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <CheckCircle className="text-green-400" size={20} />
          <div>
            <h4 className="text-green-200 font-medium">No Health Concerns</h4>
            <p className="text-green-300 text-sm">Your team members are reporting positive feedback</p>
          </div>
        </div>
      </div>
    );
  }

  const alertsList = (
    <div className="space-y-3">
      {alerts.slice(0, showInline ? 3 : alerts.length).map(alert => (
        <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${getSeverityColor(alert.severity)}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {getSeverityIcon(alert.severity)}
                <span className="font-medium capitalize">{alert.severity} Priority</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-400 text-sm">{new Date(alert.timestamp).toLocaleDateString()}</span>
              </div>
              
              <div className="mb-2">
                <div className="flex items-center space-x-2 mb-1">
                  <User size={14} className="text-gray-400" />
                  <span className="font-medium">{alert.userName}</span>
                  {alert.department && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-400 text-sm">{alert.department}</span>
                    </>
                  )}
                </div>
                <p className="text-sm">{alert.question}</p>
                <p className="text-sm font-medium mt-1">Response: {formatResponse(alert.response)}</p>
              </div>
            </div>
            
            <button
              onClick={() => handleAcknowledge(alert.id)}
              className="ml-3 text-gray-400 hover:text-white transition-colors"
              title="Acknowledge and dismiss"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  if (showInline) {
    return alerts.length > 0 ? (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Heart className="mr-2 text-red-400" size={18} />
            Team Health Alerts ({alerts.length})
          </h3>
        </div>
        {alertsList}
        {alerts.length > 3 && (
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Showing 3 of {alerts.length} alerts
            </p>
          </div>
        )}
      </div>
    ) : null;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Heart className="mr-2 text-red-400" size={20} />
          Team Health Alerts
        </h2>
        <div className="text-sm text-gray-400">
          {alerts.length} unacknowledged
        </div>
      </div>
      
      {alertsList}
    </div>
  );
}

// Compact version for notification center
export function TeamHealthNotificationBadge({ role, managerId }: { role: 'manager' | 'admin', managerId?: string }) {
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      let alerts: TeamHealthAlert[] = [];
      if (role === 'manager' && managerId) {
        alerts = TeamHealthService.getManagerAlerts(managerId);
      } else if (role === 'admin') {
        alerts = TeamHealthService.getAdminAlerts();
      }
      setAlertCount(alerts.length);
    };

    updateCount();
    const interval = setInterval(updateCount, 30000);
    return () => clearInterval(interval);
  }, [role, managerId]);

  if (alertCount === 0) return null;

  return (
    <div className="relative">
      <Heart className="text-red-400" size={20} />
      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
        {alertCount > 9 ? '9+' : alertCount}
      </div>
    </div>
  );
}