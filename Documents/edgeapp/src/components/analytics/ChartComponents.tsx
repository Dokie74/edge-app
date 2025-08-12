// src/components/analytics/ChartComponents.tsx - Reusable chart components
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar
} from 'recharts';

// Color palette for consistent theming
export const CHART_COLORS = {
  primary: '#0891b2',
  secondary: '#67e8f9',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899',
  gradient: ['#0891b2', '#67e8f9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
};

// Custom tooltip for dark theme
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
        <p className="text-gray-300 text-sm font-medium">{label}</p>
        {payload.map((pld: any, index: number) => (
          <div key={index} className="flex items-center space-x-2 mt-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: pld.color }}
            />
            <span className="text-white text-sm">
              {pld.name}: {typeof pld.value === 'number' ? pld.value.toLocaleString() : pld.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Performance Overview Bar Chart
interface PerformanceBarChartProps {
  data: Array<{
    name: string;
    completed: number;
    pending: number;
    overdue: number;
  }>;
  height?: number;
}

export const PerformanceBarChart: React.FC<PerformanceBarChartProps> = ({ 
  data, 
  height = 300 
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
      <XAxis 
        dataKey="name" 
        tick={{ fill: '#9ca3af', fontSize: 12 }}
        axisLine={{ stroke: '#4b5563' }}
      />
      <YAxis 
        tick={{ fill: '#9ca3af', fontSize: 12 }}
        axisLine={{ stroke: '#4b5563' }}
      />
      <Tooltip content={<CustomTooltip />} />
      <Legend 
        wrapperStyle={{ color: '#9ca3af' }}
      />
      <Bar dataKey="completed" fill={CHART_COLORS.success} name="Completed" />
      <Bar dataKey="pending" fill={CHART_COLORS.warning} name="Pending" />
      <Bar dataKey="overdue" fill={CHART_COLORS.danger} name="Overdue" />
    </BarChart>
  </ResponsiveContainer>
);

// Trend Analysis Line Chart
interface TrendLineChartProps {
  data: Array<{
    date: string;
    assessments: number;
    reviews: number;
    satisfaction: number | null;
  }>;
  height?: number;
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({ 
  data, 
  height = 300 
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
      <XAxis 
        dataKey="date" 
        tick={{ fill: '#9ca3af', fontSize: 12 }}
        axisLine={{ stroke: '#4b5563' }}
      />
      <YAxis 
        tick={{ fill: '#9ca3af', fontSize: 12 }}
        axisLine={{ stroke: '#4b5563' }}
      />
      <Tooltip content={<CustomTooltip />} />
      <Legend wrapperStyle={{ color: '#9ca3af' }} />
      <Line 
        type="monotone" 
        dataKey="assessments" 
        stroke={CHART_COLORS.primary} 
        strokeWidth={3}
        dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: 4 }}
        name="Assessments"
      />
      <Line 
        type="monotone" 
        dataKey="reviews" 
        stroke={CHART_COLORS.secondary} 
        strokeWidth={3}
        dot={{ fill: CHART_COLORS.secondary, strokeWidth: 2, r: 4 }}
        name="Reviews"
      />
      <Line 
        type="monotone" 
        dataKey="satisfaction" 
        stroke={CHART_COLORS.success} 
        strokeWidth={3}
        dot={{ fill: CHART_COLORS.success, strokeWidth: 2, r: 4 }}
        name="Satisfaction %"
      />
    </LineChart>
  </ResponsiveContainer>
);

// Department Distribution Pie Chart
interface DepartmentPieChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  height?: number;
}

export const DepartmentPieChart: React.FC<DepartmentPieChartProps> = ({ 
  data, 
  height = 300 
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
        outerRadius={80}
        fill="#8884d8"
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell 
            key={`cell-${index}`} 
            fill={entry.color || CHART_COLORS.gradient[index % CHART_COLORS.gradient.length]} 
          />
        ))}
      </Pie>
      <Tooltip content={<CustomTooltip />} />
      <Legend wrapperStyle={{ color: '#9ca3af' }} />
    </PieChart>
  </ResponsiveContainer>
);

// Engagement Area Chart
interface EngagementAreaChartProps {
  data: Array<{
    month: string;
    engagement: number;
    satisfaction: number;
    participation: number;
  }>;
  height?: number;
}

export const EngagementAreaChart: React.FC<EngagementAreaChartProps> = ({ 
  data, 
  height = 300 
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
      <defs>
        <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.8}/>
          <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.1}/>
        </linearGradient>
        <linearGradient id="satisfactionGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.8}/>
          <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0.1}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
      <XAxis 
        dataKey="month" 
        tick={{ fill: '#9ca3af', fontSize: 12 }}
        axisLine={{ stroke: '#4b5563' }}
      />
      <YAxis 
        tick={{ fill: '#9ca3af', fontSize: 12 }}
        axisLine={{ stroke: '#4b5563' }}
      />
      <Tooltip content={<CustomTooltip />} />
      <Legend wrapperStyle={{ color: '#9ca3af' }} />
      <Area
        type="monotone"
        dataKey="engagement"
        stackId="1"
        stroke={CHART_COLORS.primary}
        fill="url(#engagementGradient)"
        name="Engagement Score"
      />
      <Area
        type="monotone"
        dataKey="satisfaction"
        stackId="2"
        stroke={CHART_COLORS.success}
        fill="url(#satisfactionGradient)"
        name="Satisfaction Score"
      />
    </AreaChart>
  </ResponsiveContainer>
);

// Goal Progress Radial Chart
interface GoalProgressRadialProps {
  data: Array<{
    name: string;
    value: number;
    fill: string;
  }>;
  height?: number;
}

export const GoalProgressRadial: React.FC<GoalProgressRadialProps> = ({ 
  data, 
  height = 300 
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={data}>
      <RadialBar
        label={{ position: 'insideStart', fill: '#fff', fontSize: 12 }}
        background
        dataKey="value"
      />
      <Legend 
        iconSize={10} 
        wrapperStyle={{ color: '#9ca3af', fontSize: '12px' }} 
        verticalAlign="bottom" 
        align="center"
      />
      <Tooltip content={<CustomTooltip />} />
    </RadialBarChart>
  </ResponsiveContainer>
);

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  children?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color = 'blue',
  children
}) => {
  const colorClasses = {
    blue: { bg: 'bg-blue-500', text: 'text-blue-400', ring: 'ring-blue-500/20' },
    green: { bg: 'bg-green-500', text: 'text-green-400', ring: 'ring-green-500/20' },
    yellow: { bg: 'bg-yellow-500', text: 'text-yellow-400', ring: 'ring-yellow-500/20' },
    red: { bg: 'bg-red-500', text: 'text-red-400', ring: 'ring-red-500/20' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-400', ring: 'ring-purple-500/20' }
  };

  const colors = colorClasses[color];

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${
                change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {change >= 0 ? '+' : ''}{change}%
              </span>
              <span className="text-gray-500 text-sm ml-1">vs last period</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${colors.bg}/10 ${colors.ring} ring-1`}>
          <Icon size={24} className={colors.text} />
        </div>
      </div>
      {children && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          {children}
        </div>
      )}
    </div>
  );
};