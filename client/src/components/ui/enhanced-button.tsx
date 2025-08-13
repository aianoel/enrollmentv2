import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface EnhancedButtonProps extends ButtonProps {
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  loadingText?: string;
  gradient?: boolean;
  glow?: boolean;
  iconOnly?: boolean;
  'data-testid'?: string;
}

export function EnhancedButton({
  children,
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  loadingText,
  gradient = false,
  glow = false,
  iconOnly = false,
  className,
  disabled,
  variant = 'default',
  size = 'default',
  'data-testid': testId,
  ...props
}: EnhancedButtonProps) {
  const isDisabled = disabled || loading;
  
  const gradientClasses = gradient 
    ? 'bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-primary-foreground border-0'
    : '';
    
  const glowClasses = glow 
    ? 'shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40'
    : '';

  const iconOnlyClasses = iconOnly 
    ? 'w-10 h-10 p-0'
    : '';

  const content = loading ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin mr-2" />
      {loadingText || (typeof children === 'string' ? children : 'Loading...')}
    </>
  ) : (
    <>
      {Icon && iconPosition === 'left' && !iconOnly && (
        <Icon className="h-4 w-4 mr-2" />
      )}
      {Icon && iconOnly && (
        <Icon className="h-4 w-4" />
      )}
      {!iconOnly && children}
      {Icon && iconPosition === 'right' && !iconOnly && (
        <Icon className="h-4 w-4 ml-2" />
      )}
    </>
  );

  return (
    <Button
      className={cn(
        'transition-all duration-200 transform',
        'hover:scale-105 active:scale-95',
        gradientClasses,
        glowClasses,
        iconOnlyClasses,
        className
      )}
      disabled={isDisabled}
      variant={gradient ? undefined : variant}
      size={size}
      data-testid={testId}
      {...props}
    >
      {content}
    </Button>
  );
}

interface QuickActionButtonProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal' | 'indigo';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  'data-testid'?: string;
}

export function QuickActionButton({
  title,
  description,
  icon: Icon,
  color = 'blue',
  onClick,
  disabled = false,
  loading = false,
  className,
  'data-testid': testId,
}: QuickActionButtonProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
    red: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
    teal: 'from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700',
    indigo: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'group relative overflow-hidden rounded-xl p-6 text-white transition-all duration-300',
        'transform hover:scale-105 hover:shadow-xl active:scale-95',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'bg-gradient-to-br',
        colorClasses[color],
        className
      )}
      data-testid={testId}
    >
      <div className="relative z-10 flex flex-col items-center text-center space-y-3">
        {loading ? (
          <Loader2 className="h-8 w-8 animate-spin" />
        ) : (
          <div className="p-3 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors">
            <Icon className="h-8 w-8" />
          </div>
        )}
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && (
            <p className="text-sm opacity-90">{description}</p>
          )}
        </div>
      </div>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </button>
  );
}

interface FloatingActionButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
  className?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  'data-testid'?: string;
}

export function FloatingActionButton({
  icon: Icon,
  onClick,
  className,
  color = 'primary',
  size = 'md',
  'data-testid': testId,
}: FloatingActionButtonProps) {
  const colorClasses = {
    primary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
    secondary: 'bg-secondary hover:bg-secondary/90 text-secondary-foreground',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    warning: 'bg-orange-600 hover:bg-orange-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-7 w-7',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 z-50 rounded-full shadow-lg',
        'transition-all duration-200 transform hover:scale-110 active:scale-95',
        'hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2',
        colorClasses[color],
        sizeClasses[size],
        className
      )}
      data-testid={testId}
    >
      <Icon className={cn('mx-auto', iconSizes[size])} />
    </button>
  );
}