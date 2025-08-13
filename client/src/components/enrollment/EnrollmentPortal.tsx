import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent } from '../ui/card';
import { useToast } from '../../hooks/use-toast';
// Firebase enrollment replaced with PostgreSQL placeholder
import { EnrollmentApplication } from '@shared/schema';

interface EnrollmentPortalProps {
  onBackToLogin: () => void;
}

export const EnrollmentPortal: React.FC<EnrollmentPortalProps> = ({ onBackToLogin }) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    desiredGradeLevel: '',
    desiredStrand: '',
    previousSchool: '',
    previousGPA: ''
  });

  const steps = [
    { step: 1, title: 'Personal Info', completed: currentStep > 1 },
    { step: 2, title: 'Academic Info', completed: currentStep > 2 },
    { step: 3, title: 'Documents', completed: currentStep > 3 },
    { step: 4, title: 'Payment', completed: currentStep > 4 },
    { step: 5, title: 'Review', completed: false },
  ];

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const enrollmentData: Omit<EnrollmentApplication, 'id' | 'createdAt' | 'updatedAt'> = {
        ...formData,
        gender: formData.gender as 'male' | 'female' | 'other',
        previousGPA: formData.previousGPA ? parseFloat(formData.previousGPA) : undefined,
        documents: [],
        paymentStatus: 'unpaid' as const,
        status: 'pending' as const,
      };

      // TODO: Implement PostgreSQL enrollment submission
      console.log('Enrollment data (PostgreSQL not yet implemented):', enrollmentData);
      
      // Simulate successful submission for now
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Application submitted successfully!",
        description: "You will receive an email confirmation shortly.",
      });

      onBackToLogin();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.step}>
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step.step === currentStep 
                  ? 'bg-primary-600 text-white' 
                  : step.completed
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {step.completed ? <i className="fas fa-check"></i> : step.step}
              </div>
              <span className={`${
                step.step === currentStep ? 'text-primary-600 font-medium' : 'text-gray-600'
              }`}>
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 ${step.completed ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="w-full bg-gray-300 rounded-full h-2">
        <div 
          className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
          style={{ width: `${(currentStep / 5) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                  required
                  data-testid="input-firstName"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                  required
                  data-testid="input-lastName"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  required
                  data-testid="input-dateOfBirth"
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
                  <SelectTrigger data-testid="select-gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Enter email address"
                required
                data-testid="input-email"
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                placeholder="Enter phone number"
                required
                data-testid="input-phoneNumber"
              />
            </div>

            <div>
              <Label htmlFor="address">Complete Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Enter complete address"
                rows={3}
                required
                data-testid="input-address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="parentName">Parent/Guardian Name *</Label>
                <Input
                  id="parentName"
                  value={formData.parentName}
                  onChange={(e) => handleChange('parentName', e.target.value)}
                  placeholder="Enter parent/guardian name"
                  required
                  data-testid="input-parentName"
                />
              </div>
              <div>
                <Label htmlFor="parentPhone">Parent/Guardian Phone *</Label>
                <Input
                  id="parentPhone"
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => handleChange('parentPhone', e.target.value)}
                  placeholder="Enter parent/guardian phone"
                  required
                  data-testid="input-parentPhone"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Academic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="desiredGradeLevel">Desired Grade Level *</Label>
                <Select value={formData.desiredGradeLevel} onValueChange={(value) => handleChange('desiredGradeLevel', value)}>
                  <SelectTrigger data-testid="select-gradeLevel">
                    <SelectValue placeholder="Select grade level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grade7">Grade 7</SelectItem>
                    <SelectItem value="grade8">Grade 8</SelectItem>
                    <SelectItem value="grade9">Grade 9</SelectItem>
                    <SelectItem value="grade10">Grade 10</SelectItem>
                    <SelectItem value="grade11">Grade 11</SelectItem>
                    <SelectItem value="grade12">Grade 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="desiredStrand">Desired Strand (for SHS)</Label>
                <Select value={formData.desiredStrand} onValueChange={(value) => handleChange('desiredStrand', value)}>
                  <SelectTrigger data-testid="select-strand">
                    <SelectValue placeholder="Select strand (if applicable)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stem">STEM</SelectItem>
                    <SelectItem value="abm">ABM</SelectItem>
                    <SelectItem value="humss">HUMSS</SelectItem>
                    <SelectItem value="gas">GAS</SelectItem>
                    <SelectItem value="tvl">TVL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="previousSchool">Previous School</Label>
              <Input
                id="previousSchool"
                value={formData.previousSchool}
                onChange={(e) => handleChange('previousSchool', e.target.value)}
                placeholder="Enter previous school name"
                data-testid="input-previousSchool"
              />
            </div>

            <div>
              <Label htmlFor="previousGPA">Previous GPA (if applicable)</Label>
              <Input
                id="previousGPA"
                type="number"
                step="0.01"
                min="0"
                max="4.0"
                value={formData.previousGPA}
                onChange={(e) => handleChange('previousGPA', e.target.value)}
                placeholder="Enter previous GPA"
                data-testid="input-previousGPA"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Required Documents</h2>
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <i className="fas fa-upload text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-600">Document upload feature coming soon</p>
              <p className="text-sm text-gray-500 mt-2">Please prepare: Birth Certificate, Report Card, Valid ID</p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Information</h2>
            <div className="text-center py-8 border border-gray-200 rounded-lg bg-gray-50">
              <i className="fas fa-credit-card text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-600">Payment processing will be handled by the accounting department</p>
              <p className="text-sm text-gray-500 mt-2">You will receive payment instructions via email</p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Review Application</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-600">Name:</span>
                  <p className="text-gray-900">{formData.firstName} {formData.lastName}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Email:</span>
                  <p className="text-gray-900">{formData.email}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Grade Level:</span>
                  <p className="text-gray-900">{formData.desiredGradeLevel}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Parent/Guardian:</span>
                  <p className="text-gray-900">{formData.parentName}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="absolute inset-0 bg-cover bg-center opacity-5" 
           style={{backgroundImage: "url('https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')"}} />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                  <i className="fas fa-graduation-cap text-white text-lg"></i>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Student Enrollment Portal</h1>
                  <p className="text-gray-600">Apply for admission to our school</p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={onBackToLogin}
                className="text-gray-600 hover:text-primary-600"
                data-testid="button-close"
              >
                <i className="fas fa-times text-xl"></i>
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderProgressBar()}

          {/* Form */}
          <Card className="shadow-sm">
            <CardContent className="p-8">
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 mt-6 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={currentStep === 1 ? onBackToLogin : handlePrevious}
                  data-testid="button-previous"
                >
                  {currentStep === 1 ? 'Cancel' : 'Previous'}
                </Button>
                
                {currentStep < 5 ? (
                  <Button 
                    onClick={handleNext}
                    className="bg-primary-600 hover:bg-primary-700"
                    data-testid="button-next"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    className="bg-primary-600 hover:bg-primary-700"
                    disabled={loading}
                    data-testid="button-submit"
                  >
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Tracking */}
          <Card className="mt-8 border-l-4 border-blue-500">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Already Applied?</h3>
              <p className="text-gray-600 mb-4">Track your application status using your application ID.</p>
              <div className="flex space-x-3">
                <Input 
                  placeholder="Enter Application ID" 
                  className="flex-1"
                  data-testid="input-trackingId"
                />
                <Button 
                  variant="secondary"
                  className="bg-secondary-600 hover:bg-secondary-700 text-white"
                  data-testid="button-track"
                >
                  Track Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
