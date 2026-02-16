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
  UserPlus,
  Star,
  Newspaper,
  TrendingUp,
  Award,
  ArrowRight
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

  const highlights = [
    {
      title: "98% Completion Rate",
      description: "Our teams have achieved record-breaking report completion rates this quarter.",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Strategic Alignment",
      description: "Executive oversight has improved departmental alignment by 45% since implementation.",
      icon: Shield,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Top Performer Awards",
      description: "Recognizing our outstanding employees across all four organizational levels.",
      icon: Award,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ];

  const newsItems = [
    {
      date: "Feb 15, 2026",
      title: "New Executive Dashboard Features",
      summary: "Enhanced strategic analytics and real-time organizational health metrics are now live.",
      category: "Platform Update"
    },
    {
      date: "Feb 12, 2026",
      title: "Quarterly Performance Review Cycle",
      summary: "The Q1 review cycle begins next week. Please ensure all reports are submitted by Friday.",
      category: "Announcement"
    },
    {
      date: "Feb 10, 2026",
      title: "Corporate Sustainability Report",
      summary: "THE SUPERVISOR platform helps reduce paper waste by 100% through digital reporting.",
      category: "Sustainability"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-left animate-fadeIn">
              <div className="flex items-center space-x-4 mb-6">
                <Shield className="w-12 h-12 text-primary animate-bounce-gentle" />
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-primary">THE SUPERVISOR</h1>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                Elevating Enterprise Performance Through Structured Feedback
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                A hierarchical reporting and feedback platform designed for modern enterprise organizations. 
                Seamlessly connect employees, supervisors, managers, and executives.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={handleLogin} className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 h-auto shadow-lg hover:scale-105 transition-transform">
                  Sign In Now
                </Button>
                <Button size="lg" variant="outline" onClick={() => setShowRegistration(true)} className="text-lg px-8 py-6 h-auto border-2 hover:bg-gray-50 hover:scale-105 transition-transform">
                  Join Organization
                </Button>
              </div>
            </div>
            <div className="hidden lg:block relative animate-scaleIn">
              <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-2xl transform rotate-3"></div>
              <Card className="glass-card relative overflow-hidden border-2 border-white/50 shadow-2xl">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <TrendingUp className="text-white w-6 h-6" />
                        </div>
                        <span className="font-bold text-gray-800 uppercase tracking-wider text-sm">System Status</span>
                      </div>
                      <Badge className="bg-green-500">Live & Secure</Badge>
                    </div>
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center space-x-4 p-3 bg-gray-50/50 rounded-xl border border-white/50 shadow-sm animate-slideUp" style={{ animationDelay: `${i * 0.2}s` }}>
                          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                            <div className="h-2 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Highlights Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors uppercase tracking-widest px-4 py-1">Highlights</Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Organizational Success</h2>
          <div className="w-24 h-1.5 bg-primary mx-auto rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card key={index} className="glass-card hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-none animate-fadeIn" style={{ animationDelay: `${index * 0.15}s` }}>
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 ${item.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner transform rotate-3 hover:rotate-0 transition-transform`}>
                    <Icon className={`h-8 w-8 ${item.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* News Section */}
      <div className="bg-gray-900 py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-3xl rounded-full translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="text-left">
              <Badge className="mb-4 bg-white/10 text-white border-white/20 uppercase tracking-widest px-4 py-1">Corporate News</Badge>
              <h2 className="text-4xl font-bold text-white">Latest Updates</h2>
            </div>
            <Button variant="link" className="text-primary hover:text-primary/80 p-0 text-lg flex items-center group">
              View All News <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {newsItems.map((news, index) => (
              <Card key={index} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors duration-300 group animate-slideUp" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-bold text-primary tracking-widest uppercase">{news.category}</span>
                    <span className="text-xs text-gray-500 font-medium">{news.date}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-primary transition-colors">{news.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">{news.summary}</p>
                  <Button variant="link" className="text-white/60 hover:text-white p-0 flex items-center group/btn">
                    Read More <ChevronRight className="ml-1 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Login Portals Section */}
      <div id="login-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 uppercase tracking-widest px-4 py-1">Login Portals</Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Access Your Workspace</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Select your professional role below to enter your specialized performance management environment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {roleCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card 
                key={index} 
                className={`hover:shadow-2xl transition-all duration-500 cursor-pointer border-t-4 ${card.borderColor} bg-white group hover:-translate-y-2 animate-fadeIn`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleRoleBasedLogin(card.role)}
              >
                <CardHeader className="text-center pb-6">
                  <div className={`w-20 h-20 ${card.color} bg-opacity-10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className={`h-10 w-10 ${card.textColor}`} />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-center mb-8 leading-relaxed font-medium">{card.description}</p>
                  <Button 
                    className={`w-full ${card.color} text-white hover:opacity-90 shadow-lg group-hover:scale-105 transition-all duration-300 py-6 text-lg font-bold`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRoleBasedLogin(card.role);
                    }}
                  >
                    Enter Portal
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Footer / Registration Section */}
      <div className="bg-white border-t border-gray-200 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Ready to streamline your workflow?</h3>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join the organization and start contributing to our collective success today.
          </p>
          <Button 
            size="lg"
            onClick={() => setShowRegistration(true)}
            className="bg-gray-900 hover:bg-black text-white px-10 py-6 h-auto text-xl font-bold shadow-xl hover:scale-105 transition-transform"
          >
            Create Your Account
          </Button>
        </div>
      </div>

      {/* User Registration Modal */}
      {showRegistration && (
        <UserRegistrationModal onClose={() => setShowRegistration(false)} />
      )}
    </div>
  );
}

