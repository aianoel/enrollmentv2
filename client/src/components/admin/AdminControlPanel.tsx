import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Settings, Palette, Upload, Calendar, FileImage, Users, School } from 'lucide-react';

interface SystemSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  bannerImages: string[];
  organizationChartUrl: string;
  schoolYear: string;
  schoolName: string;
  schoolAddress: string;
  schoolMotto: string;
  principalMessage: string;
  visionStatement: string;
  missionStatement: string;
}

interface SchoolYear {
  id: string;
  year: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export function AdminControlPanel() {
  const [activeTab, setActiveTab] = useState('appearance');
  const [newSchoolYear, setNewSchoolYear] = useState('');
  const [colorSettings, setColorSettings] = useState({
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    accentColor: '#10b981'
  });
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current system settings
  const { data: settings, isLoading: settingsLoading } = useQuery<SystemSettings>({
    queryKey: ['/api/admin/settings'],
    queryFn: () => apiRequest('/api/admin/settings')
  });

  // Fetch school years
  const { data: schoolYears = [], isLoading: yearsLoading } = useQuery<SchoolYear[]>({
    queryKey: ['/api/admin/school-years'],
    queryFn: () => apiRequest('/api/admin/school-years')
  });

  // Update system settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (updatedSettings: Partial<SystemSettings>) =>
      apiRequest('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(updatedSettings)
      }),
    onSuccess: () => {
      toast({
        title: 'Settings Updated',
        description: 'System settings have been updated successfully.'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
    }
  });

  // Create new school year mutation
  const createSchoolYearMutation = useMutation({
    mutationFn: (yearData: { year: string; startDate: string; endDate: string }) =>
      apiRequest('/api/admin/school-years', {
        method: 'POST',
        body: JSON.stringify(yearData)
      }),
    onSuccess: () => {
      toast({
        title: 'School Year Created',
        description: 'New school year has been created and activated. Student dashboards have been reset.',
        variant: 'default'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/school-years'] });
      setNewSchoolYear('');
    }
  });

  // Image upload mutation
  const uploadImageMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File; type: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      return apiRequest('/api/admin/upload-image', {
        method: 'POST',
        body: formData
      });
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'Image Uploaded',
        description: `${variables.type} has been uploaded successfully.`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      setUploadingImage(null);
    }
  });

  const handleColorChange = (colorType: keyof typeof colorSettings, value: string) => {
    setColorSettings(prev => ({ ...prev, [colorType]: value }));
  };

  const handleSaveColors = () => {
    updateSettingsMutation.mutate(colorSettings);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadingImage(type);
      uploadImageMutation.mutate({ file, type });
    }
  };

  const handleContentUpdate = (field: keyof SystemSettings, value: string) => {
    updateSettingsMutation.mutate({ [field]: value });
  };

  const handleCreateSchoolYear = () => {
    if (!newSchoolYear) return;
    
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    
    createSchoolYearMutation.mutate({
      year: newSchoolYear,
      startDate: `${currentYear}-08-01`,
      endDate: `${nextYear}-07-31`
    });
  };

  if (settingsLoading || yearsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading admin controls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Admin Control Panel</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileImage className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Images
          </TabsTrigger>
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="school-year" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            School Year
          </TabsTrigger>
        </TabsList>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Color Theme Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="primary-color"
                      type="color"
                      value={colorSettings.primaryColor}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      className="w-16 h-10 p-0 border-0"
                    />
                    <Input
                      value={colorSettings.primaryColor}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={colorSettings.secondaryColor}
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                      className="w-16 h-10 p-0 border-0"
                    />
                    <Input
                      value={colorSettings.secondaryColor}
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                      placeholder="#64748b"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="accent-color"
                      type="color"
                      value={colorSettings.accentColor}
                      onChange={(e) => handleColorChange('accentColor', e.target.value)}
                      className="w-16 h-10 p-0 border-0"
                    />
                    <Input
                      value={colorSettings.accentColor}
                      onChange={(e) => handleColorChange('accentColor', e.target.value)}
                      placeholder="#10b981"
                    />
                  </div>
                </div>
              </div>
              
              <Button onClick={handleSaveColors} disabled={updateSettingsMutation.isPending}>
                {updateSettingsMutation.isPending ? 'Saving...' : 'Save Color Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Management */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                School Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="school-name">School Name</Label>
                <Input
                  id="school-name"
                  defaultValue={settings?.schoolName || ''}
                  onBlur={(e) => handleContentUpdate('schoolName', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="school-address">School Address</Label>
                <Textarea
                  id="school-address"
                  defaultValue={settings?.schoolAddress || ''}
                  onBlur={(e) => handleContentUpdate('schoolAddress', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="school-motto">School Motto</Label>
                <Input
                  id="school-motto"
                  defaultValue={settings?.schoolMotto || ''}
                  onBlur={(e) => handleContentUpdate('schoolMotto', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="principal-message">Principal's Message</Label>
                <Textarea
                  id="principal-message"
                  defaultValue={settings?.principalMessage || ''}
                  onBlur={(e) => handleContentUpdate('principalMessage', e.target.value)}
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="vision-statement">Vision Statement</Label>
                <Textarea
                  id="vision-statement"
                  defaultValue={settings?.visionStatement || ''}
                  onBlur={(e) => handleContentUpdate('visionStatement', e.target.value)}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="mission-statement">Mission Statement</Label>
                <Textarea
                  id="mission-statement"
                  defaultValue={settings?.missionStatement || ''}
                  onBlur={(e) => handleContentUpdate('missionStatement', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Image Management */}
        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload System Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="logo-upload">School Logo</Label>
                  <div className="mt-2">
                    {settings?.logoUrl && (
                      <img 
                        src={settings.logoUrl} 
                        alt="School Logo" 
                        className="w-24 h-24 object-contain mb-2 border rounded"
                      />
                    )}
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'logo')}
                      disabled={uploadingImage === 'logo'}
                    />
                    {uploadingImage === 'logo' && (
                      <p className="text-sm text-muted-foreground mt-1">Uploading logo...</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="banner-upload">Sliding Banner Images</Label>
                  <div className="mt-2">
                    {settings?.bannerImages && settings.bannerImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {settings.bannerImages.slice(0, 6).map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Banner ${index + 1}`}
                            className="w-full h-16 object-cover rounded border"
                          />
                        ))}
                      </div>
                    )}
                    <Input
                      id="banner-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageUpload(e, 'banner')}
                      disabled={uploadingImage === 'banner'}
                    />
                    {uploadingImage === 'banner' && (
                      <p className="text-sm text-muted-foreground mt-1">Uploading banner images...</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization Chart */}
        <TabsContent value="organization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Organization Chart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="org-chart-upload">Upload Organization Chart</Label>
                <div className="mt-2">
                  {settings?.organizationChartUrl && (
                    <img 
                      src={settings.organizationChartUrl} 
                      alt="Organization Chart" 
                      className="w-full max-w-2xl h-auto mb-4 border rounded"
                    />
                  )}
                  <Input
                    id="org-chart-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'organization-chart')}
                    disabled={uploadingImage === 'organization-chart'}
                  />
                  {uploadingImage === 'organization-chart' && (
                    <p className="text-sm text-muted-foreground mt-1">Uploading organization chart...</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* School Year Management */}
        <TabsContent value="school-year" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                School Year Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="new-school-year">Create New School Year</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    id="new-school-year"
                    placeholder="e.g., 2024-2025"
                    value={newSchoolYear}
                    onChange={(e) => setNewSchoolYear(e.target.value)}
                  />
                  <Button 
                    onClick={handleCreateSchoolYear} 
                    disabled={!newSchoolYear || createSchoolYearMutation.isPending}
                  >
                    {createSchoolYearMutation.isPending ? 'Creating...' : 'Create & Activate'}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Creating a new school year will reset student dashboards but preserve historical data.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">School Year History</h3>
                <div className="space-y-2">
                  {schoolYears.map((year) => (
                    <div key={year.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{year.year}</span>
                          {year.isActive && (
                            <Badge variant="default">Active</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {year.startDate} to {year.endDate}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Created: {new Date(year.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}