import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface EnhancedCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  iconColor?: string;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  variant?: 'default' | 'gradient' | 'bordered' | 'elevated' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
  'data-testid'?: string;
}

export function EnhancedCard({
  title,
  description,
  children,
  icon: Icon,
  iconColor = 'text-blue-600',
  footer,
  className,
  contentClassName,
  headerClassName,
  variant = 'default',
  size = 'md',
  hover = true,
  onClick,
  'data-testid': testId,
}: EnhancedCardProps) {
  const baseClasses = 'transition-all duration-200';
  
  const variantClasses = {
    default: 'bg-card border border-border',
    gradient: 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-border shadow-md',
    bordered: 'bg-card border-2 border-border',
    elevated: 'bg-card border border-border shadow-lg',
    glass: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 shadow-xl',
  };

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const hoverClasses = hover 
    ? 'hover:shadow-lg hover:scale-[1.02] hover:border-primary/20 dark:hover:border-primary/30'
    : '';

  return (
    <Card
      className={cn(
        baseClasses,
        variantClasses[variant],
        hoverClasses,
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      data-testid={testId}
    >
      {(title || description || Icon) && (
        <CardHeader className={cn('pb-3', headerClassName)}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              {title && (
                <CardTitle className="text-lg font-semibold leading-none tracking-tight">
                  {title}
                </CardTitle>
              )}
              {description && (
                <CardDescription className="text-sm text-muted-foreground">
                  {description}
                </CardDescription>
              )}
            </div>
            {Icon && (
              <div className={cn('p-2 rounded-lg bg-background/50', iconColor)}>
                <Icon className="h-5 w-5" />
              </div>
            )}
          </div>
        </CardHeader>
      )}
      
      <CardContent className={cn(contentClassName)}>
        {children}
      </CardContent>
      
      {footer && (
        <CardFooter className="pt-0">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  className?: string;
  'data-testid'?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = 'text-blue-600',
  trend,
  className,
  'data-testid': testId,
}: StatCardProps) {
  return (
    <EnhancedCard
      variant="elevated"
      hover={true}
      className={className}
      data-testid={testId}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="space-y-1">
            <p className="text-2xl font-bold leading-none">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {trend && (
            <div className={cn(
              'flex items-center text-xs',
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}>
              <span className={cn(
                'mr-1',
                trend.isPositive ? '↗' : '↘'
              )}>
                {trend.isPositive ? '↗' : '↘'}
              </span>
              {trend.value}% {trend.label}
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn('p-3 rounded-full bg-background/50', iconColor)}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </EnhancedCard>
  );
}

interface ActionCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  'data-testid'?: string;
}

export function ActionCard({
  title,
  description,
  icon: Icon,
  iconColor = 'text-blue-600',
  onClick,
  disabled = false,
  className,
  'data-testid': testId,
}: ActionCardProps) {
  return (
    <EnhancedCard
      variant="bordered"
      hover={!disabled}
      className={cn(
        'cursor-pointer group',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={disabled ? undefined : onClick}
      data-testid={testId}
    >
      <div className="flex flex-col items-center text-center space-y-3 p-4">
        {Icon && (
          <div className={cn(
            'p-4 rounded-full transition-colors group-hover:scale-110',
            'bg-gradient-to-br from-primary/10 to-primary/5',
            iconColor
          )}>
            <Icon className="h-8 w-8" />
          </div>
        )}
        <div className="space-y-1">
          <h3 className="font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    </EnhancedCard>
  );
}