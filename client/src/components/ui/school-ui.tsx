import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface SchoolCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  description: string;
  variant?: "default" | "admin" | "student" | "teacher" | "parent";
  onClick?: () => void;
}

export function SchoolCard({ 
  icon: Icon, 
  title, 
  value, 
  description, 
  variant = "default",
  onClick 
}: SchoolCardProps) {
  const variantStyles = {
    default: "from-gray-100 to-gray-200 text-gray-600",
    admin: "from-purple-100 to-indigo-200 text-purple-700",
    student: "from-blue-100 to-indigo-200 text-blue-700", 
    teacher: "from-green-100 to-emerald-200 text-green-700",
    parent: "from-orange-100 to-yellow-200 text-orange-700"
  };

  const iconStyles = {
    default: "bg-gray-200 text-gray-600",
    admin: "bg-purple-200 text-purple-700",
    student: "bg-blue-200 text-blue-700",
    teacher: "bg-green-200 text-green-700", 
    parent: "bg-orange-200 text-orange-700"
  };

  return (
    <Card 
      className={`group hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-white via-gray-50 to-white backdrop-blur-sm ${onClick ? 'hover:scale-[1.02]' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${variantStyles[variant]} group-hover:scale-110 transition-all duration-200`}>
          <Icon className={`h-5 w-5 ${iconStyles[variant]}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold bg-gradient-to-r ${variantStyles[variant]} bg-clip-text text-transparent`}>
          {value}
        </div>
        <p className="text-sm text-gray-600 mt-2 group-hover:text-gray-700 transition-colors">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

interface SchoolHeaderProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  variant?: "admin" | "student" | "teacher" | "parent";
  userName?: string;
}

export function SchoolHeader({ 
  title, 
  subtitle, 
  icon: Icon, 
  variant = "admin",
  userName 
}: SchoolHeaderProps) {
  const gradientStyles = {
    admin: "from-purple-600 via-purple-700 to-indigo-800",
    student: "from-blue-600 via-indigo-600 to-purple-700",
    teacher: "from-green-600 via-emerald-600 to-teal-700",
    parent: "from-orange-600 via-orange-700 to-red-700"
  };

  const textStyles = {
    admin: "text-purple-100",
    student: "text-blue-100", 
    teacher: "text-green-100",
    parent: "text-orange-100"
  };

  const displayTitle = userName ? `Welcome, ${userName}` : title;

  return (
    <div className={`bg-gradient-to-r ${gradientStyles[variant]} shadow-2xl p-8 text-white backdrop-blur-lg`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold mb-2">{displayTitle}</h1>
          <p className={`${textStyles[variant]} text-lg font-medium`}>
            {subtitle}
          </p>
        </div>
        <div className="hidden sm:block">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <Icon className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface SchoolBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
}

export function SchoolBadge({ children, variant = "default" }: SchoolBadgeProps) {
  const variantStyles = {
    default: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    success: "bg-green-100 text-green-800 hover:bg-green-200",
    warning: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    error: "bg-red-100 text-red-800 hover:bg-red-200",
    info: "bg-blue-100 text-blue-800 hover:bg-blue-200"
  };

  return (
    <Badge className={`${variantStyles[variant]} transition-colors duration-200`}>
      {children}
    </Badge>
  );
}

interface ActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  disabled?: boolean;
}

export function ActionButton({ 
  children, 
  onClick, 
  variant = "primary", 
  size = "md",
  icon: Icon,
  disabled 
}: ActionButtonProps) {
  const variantStyles = {
    primary: "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white",
    secondary: "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white",
    success: "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white",
    warning: "bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white",
    error: "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white"
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base", 
    lg: "px-6 py-3 text-lg"
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`${variantStyles[variant]} ${sizeStyles[size]} transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl`}
    >
      {Icon && <Icon className="h-4 w-4 mr-2" />}
      {children}
    </Button>
  );
}