import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Users, 
  Building, 
  Crown,
  Shield,
  ChevronRight,
  UserPlus
} from "lucide-react";
import UserRegistrationModal from "@/components/auth/user-registration-modal";

export default function Landing() {
  const [showRegistration, setShowRegistration] = useState(false);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleRoleBasedLogin = (role: string) => {
    // Store intended role in session storage for post-login routing
    sessionStorage.setItem('intended_role', role);
    window.location.href = "/api/login";
  };

  const roleCards = [
    {
      title: "Employee Portal",
      description: "Submit reports, track performance, and view feedback",
      icon: User,
      color: "role-employee",
      textColor: "text-employee",
      borderColor: "border-employee",
      role: "employee",
      features: ["Submit performance reports", "View feedback & ratings", "Track personal goals", "Access training resources"]
    },
    {
      title: "Supervisor Portal", 
      description: "Review team reports and manage performance",
      icon: Users,
      color: "role-supervisor",
      textColor: "text-supervisor",
      borderColor: "border-supervisor",
      role: "supervisor", 
      features: ["Review team reports", "Provide feedback & ratings", "Manage team members", "Track team performance"]
    },
    {
      title: "Manager Portal",
      description: "Oversee departments and strategic planning",
      icon: Building,
      color: "role-manager",
      textColor: "text-manager", 
      borderColor: "border-manager",
      role: "manager",
      features: ["Department overview", "Strategic planning", "Resource allocation", "Cross-team analytics"]
    },
    {
      title: "Executive Portal",
      description: "Strategic oversight and organizational insights",
      icon: Crown,
      color: "role-executive",
      textColor: "text-executive",
      borderColor: "border-executive", 
      role: "executive",
      features: ["Organization-wide insights", "Strategic decision making", "Executive reporting", "Admin access"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="w-10 h-10 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-primary">THE SUPERVISOR</h1>
                <p className="text-gray-600">Enterprise Performance Management Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline"
                onClick={() => setShowRegistration(true)}
                className="flex items-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>New Employee</span>
              </Button>
              <Button 
                onClick={handleLogin}
                className="bg-primary hover:bg-primary/90"
              >
                Quick Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Access Your Organizational Dashboard
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose your role-specific portal to access tailored dashboards, reports, and management tools 
            designed for your organizational level.
          </p>
        </div>

        {/* Role-based Login Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {roleCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card 
                key={index} 
                className={`hover:shadow-xl transition-all duration-300 cursor-pointer border-2 ${card.borderColor} bg-white hover:scale-105 animate-fade-in glass-card`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleRoleBasedLogin(card.role)}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 ${card.color} bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce-gentle`}>
                    <Icon className={`h-8 w-8 ${card.textColor}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {card.title}
                  </CardTitle>
                  <p className="text-gray-600 text-sm">{card.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2 mb-6">
                    {card.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600 animate-slide-up" style={{ animationDelay: `${(index * 0.1) + (idx * 0.05)}s` }}>
                        <ChevronRight className="w-4 h-4 mr-2 text-gray-400 transition-transform group-hover:translate-x-1" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${card.color} text-white hover:opacity-90 transition-all duration-200 hover:scale-105`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRoleBasedLogin(card.role);
                    }}
                  >
                    Access {card.role} Portal
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Platform Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Secure Authentication</h4>
              <p className="text-gray-600 text-sm">
                Enterprise-grade security with role-based access control and encrypted data transmission.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Hierarchical Management</h4>
              <p className="text-gray-600 text-sm">
                Structured reporting chains from employees to executives with clear accountability.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Performance Analytics</h4>
              <p className="text-gray-600 text-sm">
                Real-time dashboards and comprehensive reporting for data-driven decisions.
              </p>
            </div>
          </div>
        </div>

        {/* New Employee Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-8 text-center">
            <UserPlus className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">New to the Organization?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              If you're a new employee, complete your profile setup to get started with THE SUPERVISOR platform. 
              Select your supervisor and department to establish your reporting hierarchy.
            </p>
            <Button 
              size="lg"
              onClick={() => setShowRegistration(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Complete Employee Setup
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* User Registration Modal */}
      {showRegistration && (
        <UserRegistrationModal onClose={() => setShowRegistration(false)} />
      )}
    </div>
  );
}
