import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface LoginFormProps {
  onLogin: (user: any) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use AuthContext login method which properly sets user state
      await login(email, password);
      
      toast({
        title: "Login successful", 
        description: `Redirecting to your dashboard...`,
      });

      // The AuthContext login method will set the user state
      // which will trigger the App component to render MainLayout
      // and the appropriate role-based dashboard
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    { role: 'Admin', email: 'admin@school.edu', password: 'admin123456' },
    { role: 'Teacher', email: 'teacher@school.edu', password: 'teacher123' },
    { role: 'Student', email: 'student@school.edu', password: 'student123' },
    { role: 'Parent', email: 'parent@school.edu', password: 'parent123' },
    { role: 'Guidance', email: 'guidance@school.edu', password: 'guidance123' },
    { role: 'Registrar', email: 'registrar@school.edu', password: 'registrar123' },
    { role: 'Accounting', email: 'accounting@school.edu', password: 'accounting123' },
  ];

  const handleQuickLogin = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your School Management System account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium text-center mb-3">Demo Accounts</p>
            <div className="grid grid-cols-1 gap-2">
              {demoAccounts.map((account) => (
                <Button 
                  key={account.role}
                  variant="outline" 
                  className="w-full text-xs h-8" 
                  onClick={() => handleQuickLogin(account.email, account.password)}
                  type="button"
                  data-testid={`login-${account.role.toLowerCase()}`}
                >
                  {account.role} - {account.email}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}