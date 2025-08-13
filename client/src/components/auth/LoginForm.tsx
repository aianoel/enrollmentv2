import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent } from '../ui/card';
import { useToast } from '../../hooks/use-toast';

interface LoginFormProps {
  onEnrollmentClick: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onEnrollmentClick }) => {
  const { login, loading } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(formData.email, formData.password);
      toast({
        title: "Login successful",
        description: "Welcome back to EduManage!",
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="absolute inset-0 bg-cover bg-center opacity-10" 
           style={{backgroundImage: "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')"}} />
      
      <div className="relative z-10 max-w-md w-full mx-4">
        <Card className="glass-effect border border-white/20 shadow-2xl">
          <CardContent className="pt-6 p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
                <i className="fas fa-graduation-cap text-white text-2xl" data-testid="logo-icon"></i>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="app-title">EduManage</h1>
              <p className="text-gray-600">School Management System</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Enter your email"
                  className="w-full"
                  required
                  data-testid="input-email"
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Enter your password"
                  className="w-full"
                  required
                  data-testid="input-password"
                />
              </div>

              <div>
                <Label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Login As
                </Label>
                <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
                  <SelectTrigger data-testid="select-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="registrar">Registrar</SelectItem>
                    <SelectItem value="accounting">Accounting</SelectItem>
                    <SelectItem value="guidance">Guidance Counselor</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary-600 hover:bg-primary-700"
                disabled={loading}
                data-testid="button-login"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button 
                variant="link" 
                onClick={onEnrollmentClick}
                className="text-primary-600 hover:text-primary-700 font-medium"
                data-testid="link-enrollment"
              >
                New Student? Apply for Enrollment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
