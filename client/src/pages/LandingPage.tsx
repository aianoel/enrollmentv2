import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { GraduationCap, Users, BookOpen, MessageCircle, FileText, CreditCard, UserCheck, Building2, Phone, Mail, MapPin } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  onEnrollmentClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onEnrollmentClick }) => {
  const features = [
    { icon: Users, title: 'Multi-Role Portals', description: 'Separate dashboards for students, teachers, parents, and staff' },
    { icon: UserCheck, title: 'Advanced Enrollment', description: 'Complete online enrollment with document upload and payment' },
    { icon: BookOpen, title: 'Grades & Assignments', description: 'Real-time grade tracking and assignment management' },
    { icon: MessageCircle, title: 'Chat & Meetings', description: 'Integrated communication and virtual meetings' },
    { icon: FileText, title: 'Document Sharing', description: 'Secure file sharing and learning modules' },
    { icon: CreditCard, title: 'Payment Tracking', description: 'Automated payment processing and financial records' }
  ];

  const orgChart = {
    top: { title: 'School Director / Principal', name: 'Principal Office' },
    vicePrincipals: [
      { title: 'Vice Principal', department: 'Academic Affairs' },
      { title: 'Vice Principal', department: 'Administration' }
    ],
    departments: {
      academic: [
        { title: 'Department Heads', count: 'Multiple' },
        { title: 'Teachers', count: 'Faculty' }
      ],
      admin: [
        { title: 'Registrar', department: 'Student Records' },
        { title: 'Accounting', department: 'Financial Services' },
        { title: 'Guidance', department: 'Student Support' },
        { title: 'IT Support', department: 'Technology' }
      ]
    },
    other: [
      { title: 'Student Council', type: 'Student Body' },
      { title: 'Parent-Teacher Association', type: 'Community' }
    ]
  };

  const enrollmentSteps = [
    { step: '1', title: 'Fill Application', description: 'Complete the online enrollment form' },
    { step: '2', title: 'Upload Documents', description: 'Submit required academic documents' },
    { step: '3', title: 'Payment', description: 'Process enrollment fees securely' },
    { step: '4', title: 'Review', description: 'Application review and approval' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-gray-900">EduManage</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 hover:text-primary">Home</a>
              <a href="#about" className="text-gray-700 hover:text-primary">About Us</a>
              <a href="#features" className="text-gray-700 hover:text-primary">Features</a>
              <a href="#enrollment" className="text-gray-700 hover:text-primary">Enrollment</a>
              <a href="#org-chart" className="text-gray-700 hover:text-primary">Org Chart</a>
              <a href="#contact" className="text-gray-700 hover:text-primary">Contact</a>
              <Button onClick={onLoginClick} variant="outline">Login</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Manage Your School <span className="text-primary">Smarter</span>.<br />
            Learn Anywhere, Anytime.
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A complete digital platform for students, teachers, parents, and administrators — powered by real-time technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={onLoginClick} className="px-8 py-3">
              Login to Portal
            </Button>
            <Button size="lg" variant="outline" onClick={onEnrollmentClick} className="px-8 py-3">
              Enroll Now
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Key Features</h2>
            <p className="text-lg text-gray-600">Everything you need for modern school management</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">About EduManage</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            EduManage is a comprehensive school management system designed to streamline educational processes 
            and enhance communication between all stakeholders. Our platform brings together students, teachers, 
            parents, and administrators in a unified digital environment that promotes collaboration, transparency, 
            and academic excellence.
          </p>
        </div>
      </section>

      {/* Enrollment Process */}
      <section id="enrollment" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How to Enroll Online</h2>
            <p className="text-lg text-gray-600">Simple 4-step enrollment process</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {enrollmentSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" onClick={onEnrollmentClick}>Start Enrollment</Button>
          </div>
        </div>
      </section>

      {/* Organizational Chart */}
      <section id="org-chart" className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Organizational Structure</h2>
            <p className="text-lg text-gray-600">
              Our school's leadership and staff work together to provide quality education and seamless operations.
            </p>
          </div>
          
          <div className="space-y-8">
            {/* Top Level */}
            <div className="flex justify-center">
              <Card className="w-64 text-center bg-blue-100 border-blue-300">
                <CardContent className="p-6">
                  <Building2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-bold text-lg">{orgChart.top.title}</h3>
                  <p className="text-sm text-gray-600">{orgChart.top.name}</p>
                </CardContent>
              </Card>
            </div>

            {/* Connection Line */}
            <div className="flex justify-center">
              <div className="w-px h-8 bg-gray-300"></div>
            </div>

            {/* Vice Principals */}
            <div className="flex justify-center gap-8">
              {orgChart.vicePrincipals.map((vp, index) => (
                <Card key={index} className="w-48 text-center bg-green-100 border-green-300">
                  <CardContent className="p-4">
                    <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <h4 className="font-semibold">{vp.title}</h4>
                    <p className="text-sm text-gray-600">{vp.department}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Connection Lines */}
            <div className="flex justify-center">
              <div className="w-32 h-px bg-gray-300"></div>
            </div>

            {/* Departments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h4 className="text-center font-bold text-lg mb-6 text-blue-600">Academic Affairs</h4>
                <div className="space-y-4">
                  {orgChart.departments.academic.map((dept, index) => (
                    <Card key={index} className="text-center bg-yellow-50 border-yellow-200">
                      <CardContent className="p-4">
                        <BookOpen className="h-5 w-5 text-yellow-600 mx-auto mb-2" />
                        <h5 className="font-medium">{dept.title}</h5>
                        <p className="text-sm text-gray-600">{dept.count}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-center font-bold text-lg mb-6 text-purple-600">Administration</h4>
                <div className="space-y-4">
                  {orgChart.departments.admin.map((dept, index) => (
                    <Card key={index} className="text-center bg-purple-50 border-purple-200">
                      <CardContent className="p-4">
                        <FileText className="h-5 w-5 text-purple-600 mx-auto mb-2" />
                        <h5 className="font-medium">{dept.title}</h5>
                        <p className="text-sm text-gray-600">{dept.department}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Other Roles */}
            <div>
              <h4 className="text-center font-bold text-lg mb-6 text-gray-700">Community & Support</h4>
              <div className="flex justify-center gap-8">
                {orgChart.other.map((role, index) => (
                  <Card key={index} className="w-48 text-center bg-gray-100 border-gray-300">
                    <CardContent className="p-4">
                      <Users className="h-5 w-5 text-gray-600 mx-auto mb-2" />
                      <h5 className="font-medium">{role.title}</h5>
                      <p className="text-sm text-gray-600">{role.type}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portal Access Preview */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Portal Access</h2>
            <p className="text-lg text-gray-600">Dedicated portals for each role</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { role: 'Student', icon: GraduationCap, description: 'View grades, assignments, and class schedules' },
              { role: 'Teacher', icon: BookOpen, description: 'Manage classes, grade assignments, and communicate' },
              { role: 'Parent', icon: Users, description: 'Monitor child\'s progress and school communication' },
              { role: 'Admin', icon: Building2, description: 'Oversee school operations and user management' }
            ].map((portal, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <portal.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">{portal.role} Portal</h3>
                  <p className="text-gray-600 text-sm">{portal.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-lg text-gray-600">Get in touch with our school administration</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <Phone className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-bold mb-2">Phone</h3>
                <p className="text-gray-600">+1 (555) 123-4567</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-bold mb-2">Email</h3>
                <p className="text-gray-600">info@edumanage.school</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <MapPin className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-bold mb-2">Address</h3>
                <p className="text-gray-600">123 Education Street<br />Learning City, LC 12345</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <GraduationCap className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">EduManage</span>
              </div>
              <p className="text-gray-400">
                Empowering education through technology. Building the future of school management.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#enrollment" className="hover:text-white transition-colors">Enrollment</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Facebook</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 EduManage. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};