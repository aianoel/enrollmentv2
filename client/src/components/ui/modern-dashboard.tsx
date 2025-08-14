import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  Calendar,
  BookOpen,
  GraduationCap,
  Bell,
  DollarSign,
  Activity,
  Clock,
  CheckCircle
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ComponentType<any>;
  variant?: "default" | "success" | "warning" | "error";
}

export function StatCard({ title, value, change, changeLabel, icon: Icon, variant = "default" }: StatCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  
  const variantColors = {
    default: "text-blue-600",
    success: "text-green-600", 
    warning: "text-orange-600",
    error: "text-red-600"
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${variantColors[variant]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {change !== undefined && (
          <div className="flex items-center text-xs mt-1">
            {isPositive && <TrendingUp className="h-3 w-3 text-green-500 mr-1" />}
            {isNegative && <TrendingDown className="h-3 w-3 text-red-500 mr-1" />}
            <span className={isPositive ? "text-green-600" : isNegative ? "text-red-600" : "text-gray-500"}>
              {isPositive ? "+" : ""}{change}%
            </span>
            {changeLabel && <span className="text-gray-500 ml-1">{changeLabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar?: string;
    initials: string;
  };
  action: string;
  timestamp: string;
  type: "assignment" | "grade" | "enrollment" | "meeting";
}

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "assignment": return <FileText className="h-4 w-4" />;
      case "grade": return <GraduationCap className="h-4 w-4" />;
      case "enrollment": return <Users className="h-4 w-4" />;
      case "meeting": return <Calendar className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "assignment": return "text-blue-600 bg-blue-100";
      case "grade": return "text-green-600 bg-green-100";
      case "enrollment": return "text-purple-600 bg-purple-100";
      case "meeting": return "text-orange-600 bg-orange-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        <CardDescription>Latest updates from your school</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.user.avatar} />
                <AvatarFallback className="text-xs">{activity.user.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{activity.user.name}</span>
                  <div className={`p-1 rounded-full ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{activity.action}</p>
                <p className="text-xs text-gray-400 mt-1 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {activity.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, children, className = "" }: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

interface ProgressCardProps {
  title: string;
  items: Array<{
    label: string;
    value: number;
    max: number;
    color?: string;
  }>;
}

export function ProgressCard({ title, items }: ProgressCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{item.label}</span>
                <span className="text-gray-500">{item.value}/{item.max}</span>
              </div>
              <Progress 
                value={(item.value / item.max) * 100} 
                className="h-2"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface SimpleChartProps {
  data: Array<{ label: string; value: number; color: string }>;
}

export function SimpleDonutChart({ data }: SimpleChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Handle case when total is 0 to prevent NaN
  if (total === 0) {
    return (
      <div className="flex items-center justify-center space-x-6">
        <div className="relative">
          <svg width="120" height="120" className="transform -rotate-90">
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm">{item.label}</span>
              <span className="text-sm font-semibold">0.0%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center space-x-6">
      <div className="relative">
        <svg width="120" height="120" className="transform -rotate-90">
          <circle
            cx="60"
            cy="60"
            r="50"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="transparent"
          />
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const strokeDasharray = `${percentage * 3.14} ${314 - percentage * 3.14}`;
            const rotation = data.slice(0, index).reduce((acc, prev) => acc + (prev.value / total) * 314, 0);
            
            return (
              <circle
                key={index}
                cx="60"
                cy="60"
                r="50"
                stroke={item.color}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={-rotation}
                className="transition-all duration-300"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold">{total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm">{item.label}</span>
            <span className="text-sm font-semibold">{((item.value / total) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}