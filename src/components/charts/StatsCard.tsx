import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  onClick?: () => void;
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon,
  iconColor = 'text-red-600',
  onClick
}: StatsCardProps) {
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <div 
      className="apple-card p-6 group cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {change && (
            <p className={`text-xs ${changeColors[changeType]} font-medium`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 ${iconColor} group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="h-7 w-7" />
        </div>
      </div>
    </div>
  );
}
