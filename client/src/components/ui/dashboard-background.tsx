import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Upload, X, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DashboardBackgroundProps {
  children: React.ReactNode;
  userRole: string;
  className?: string;
}

interface BackgroundSettings {
  imageUrl: string;
  opacity: number;
  enabled: boolean;
}

const defaultBackgrounds = [
  {
    name: 'School Campus',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
  },
  {
    name: 'Library Books',
    url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
  },
  {
    name: 'Classroom',
    url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
  },
  {
    name: 'Study Space',
    url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
  },
  {
    name: 'Academic',
    url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
  },
  {
    name: 'Modern Office',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
  }
];

export function DashboardBackground({ children, userRole, className = '' }: DashboardBackgroundProps) {
  const [settings, setSettings] = useState<BackgroundSettings>({
    imageUrl: '',
    opacity: 0.1,
    enabled: false
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { toast } = useToast();

  // Load saved settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem(`dashboard-bg-${userRole}`);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (error) {
        console.error('Error parsing background settings:', error);
      }
    }
  }, [userRole]);

  // Save settings to localStorage
  const saveSettings = (newSettings: BackgroundSettings) => {
    setSettings(newSettings);
    localStorage.setItem(`dashboard-bg-${userRole}`, JSON.stringify(newSettings));
    toast({
      title: "Background Updated",
      description: "Your dashboard background settings have been saved.",
    });
  };

  const handleOpacityChange = (value: number[]) => {
    const newSettings = { ...settings, opacity: value[0] };
    saveSettings(newSettings);
  };

  const handleBackgroundSelect = (imageUrl: string) => {
    const newSettings = { ...settings, imageUrl, enabled: true };
    saveSettings(newSettings);
  };

  const handleToggleBackground = () => {
    const newSettings = { ...settings, enabled: !settings.enabled };
    saveSettings(newSettings);
  };

  const handleRemoveBackground = () => {
    const newSettings = { ...settings, enabled: false, imageUrl: '' };
    saveSettings(newSettings);
  };

  const backgroundStyle = settings.enabled && settings.imageUrl ? {
    backgroundImage: `url(${settings.imageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    position: 'relative' as const,
    minHeight: '100vh',
    minWidth: '100vw',
  } : {};

  return (
    <div 
      className={`min-h-screen ${className}`}
      style={backgroundStyle}
      data-testid="dashboard-background"
    >
      {/* Background Overlay */}
      {settings.enabled && settings.imageUrl && (
        <div 
          className="absolute inset-0 bg-white dark:bg-gray-900"
          style={{ opacity: 1 - settings.opacity }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {/* Background Settings Button */}
        <div className="fixed top-20 right-4 z-50">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800"
                data-testid="background-settings-trigger"
              >
                <Palette className="h-4 w-4 mr-2" />
                Customize
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Dashboard Background</DialogTitle>
                <DialogDescription>
                  Customize your dashboard appearance with background images and opacity settings.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Background Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Enable Background</span>
                  <Button
                    size="sm"
                    variant={settings.enabled ? "default" : "outline"}
                    onClick={handleToggleBackground}
                    data-testid="background-toggle"
                  >
                    {settings.enabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                {settings.enabled && (
                  <>
                    {/* Opacity Slider */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Background Opacity</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(settings.opacity * 100)}%
                        </span>
                      </div>
                      <Slider
                        value={[settings.opacity]}
                        onValueChange={handleOpacityChange}
                        max={0.8}
                        min={0.05}
                        step={0.05}
                        className="w-full"
                        data-testid="opacity-slider"
                      />
                    </div>

                    {/* Background Selection */}
                    <div className="space-y-3">
                      <span className="text-sm font-medium">Select Background</span>
                      <div className="grid grid-cols-2 gap-2">
                        {defaultBackgrounds.map((bg, index) => (
                          <div
                            key={index}
                            className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                              settings.imageUrl === bg.url 
                                ? 'border-blue-500 ring-2 ring-blue-200' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleBackgroundSelect(bg.url)}
                            data-testid={`background-option-${index}`}
                          >
                            <img
                              src={bg.url}
                              alt={bg.name}
                              className="w-full h-16 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <span className="text-white text-xs font-medium text-center px-1">
                                {bg.name}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Remove Background */}
                    {settings.imageUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveBackground}
                        className="w-full"
                        data-testid="remove-background"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove Background
                      </Button>
                    )}
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {children}
      </div>
    </div>
  );
}