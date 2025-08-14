import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Settings, Palette, Upload, Calendar, FileImage, Users, School } from 'lucide-react';

export function AdminControlPanel() {
  const [activeTab, setActiveTab] = useState('appearance');
  const [newSchoolYear, setNewSchoolYear] = useState('');
  const [colorSettings, setColorSettings] = useState({
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    accentColor: '#10b981'
  });
  const [schoolInfo, setSchoolInfo] = useState({
    schoolName: 'EduManage School',
    schoolAddress: '',
    schoolMotto: 'Excellence in Education',
    principalMessage: '',
    visionStatement: '',
    missionStatement: ''
  });
  
  const { toast } = useToast();

  const handleColorChange = (colorType: keyof typeof colorSettings, value: string) => {
    setColorSettings(prev => ({ ...prev, [colorType]: value }));
  };

  const handleSaveColors = () => {
    // Apply colors to CSS variables
    const root = document.documentElement;
    root.style.setProperty('--primary', colorSettings.primaryColor);
    root.style.setProperty('--secondary', colorSettings.secondaryColor);
    root.style.setProperty('--accent', colorSettings.accentColor);
    
    toast({
      title: 'Colors Updated',
      description: 'System colors have been updated successfully.'
    });
  };

  const handleSchoolInfoUpdate = (field: keyof typeof schoolInfo, value: string) => {
    setSchoolInfo(prev => ({ ...prev, [field]: value }));
    toast({
      title: 'Information Updated',
      description: `${field} has been updated successfully.`
    });
  };

  const handleCreateSchoolYear = () => {
    if (!newSchoolYear) return;
    
    toast({
      title: 'School Year Created',
      description: `New school year ${newSchoolYear} has been created and activated. Student dashboards have been reset.`,
      variant: 'default'
    });
    setNewSchoolYear('');
  };

  const handleImageUpload = (type: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        toast({
          title: 'Image Uploaded',
          description: `${type} has been uploaded successfully.`
        });
      }
    };
    input.click();
  };

  return (
    <div className="p-6 space-y-6">
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
              
              <Button onClick={handleSaveColors}>
                Save Color Settings
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
                  value={schoolInfo.schoolName}
                  onChange={(e) => setSchoolInfo(prev => ({ ...prev, schoolName: e.target.value }))}
                  onBlur={() => handleSchoolInfoUpdate('schoolName', schoolInfo.schoolName)}
                />
              </div>
              
              <div>
                <Label htmlFor="school-address">School Address</Label>
                <Textarea
                  id="school-address"
                  value={schoolInfo.schoolAddress}
                  onChange={(e) => setSchoolInfo(prev => ({ ...prev, schoolAddress: e.target.value }))}
                  onBlur={() => handleSchoolInfoUpdate('schoolAddress', schoolInfo.schoolAddress)}
                />
              </div>
              
              <div>
                <Label htmlFor="school-motto">School Motto</Label>
                <Input
                  id="school-motto"
                  value={schoolInfo.schoolMotto}
                  onChange={(e) => setSchoolInfo(prev => ({ ...prev, schoolMotto: e.target.value }))}
                  onBlur={() => handleSchoolInfoUpdate('schoolMotto', schoolInfo.schoolMotto)}
                />
              </div>
              
              <div>
                <Label htmlFor="principal-message">Principal's Message</Label>
                <Textarea
                  id="principal-message"
                  value={schoolInfo.principalMessage}
                  onChange={(e) => setSchoolInfo(prev => ({ ...prev, principalMessage: e.target.value }))}
                  onBlur={() => handleSchoolInfoUpdate('principalMessage', schoolInfo.principalMessage)}
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="vision-statement">Vision Statement</Label>
                <Textarea
                  id="vision-statement"
                  value={schoolInfo.visionStatement}
                  onChange={(e) => setSchoolInfo(prev => ({ ...prev, visionStatement: e.target.value }))}
                  onBlur={() => handleSchoolInfoUpdate('visionStatement', schoolInfo.visionStatement)}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="mission-statement">Mission Statement</Label>
                <Textarea
                  id="mission-statement"
                  value={schoolInfo.missionStatement}
                  onChange={(e) => setSchoolInfo(prev => ({ ...prev, missionStatement: e.target.value }))}
                  onBlur={() => handleSchoolInfoUpdate('missionStatement', schoolInfo.missionStatement)}
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
                  <Label>School Logo</Label>
                  <div className="mt-2">
                    <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center mb-2">
                      <span className="text-gray-500">No Logo</span>
                    </div>
                    <Button onClick={() => handleImageUpload('logo')} variant="outline">
                      Upload Logo
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label>Sliding Banner Images</Label>
                  <div className="mt-2">
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-full h-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-500">Banner {i}</span>
                        </div>
                      ))}
                    </div>
                    <Button onClick={() => handleImageUpload('banner')} variant="outline">
                      Upload Banner Images
                    </Button>
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
                <Label>Upload Organization Chart</Label>
                <div className="mt-2">
                  <div className="w-full h-64 border-2 border-dashed border-gray-300 rounded flex items-center justify-center mb-4">
                    <span className="text-gray-500">No Organization Chart</span>
                  </div>
                  <Button onClick={() => handleImageUpload('organization-chart')} variant="outline">
                    Upload Organization Chart
                  </Button>
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
                    disabled={!newSchoolYear}
                  >
                    Create & Activate
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Creating a new school year will reset student dashboards but preserve historical data.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">School Year History</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">2024-2025</span>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        2024-08-01 to 2025-07-31
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Created: {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}