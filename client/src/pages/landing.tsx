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
  TrendingUp,
  Award,
  ArrowRight,
  FileText,
  Target,
  Bell,
  BarChart3,
  CheckCircle,
  Lock,
  ClipboardList,
  Network,
  Activity,
  Briefcase,
  CalendarCheck,
} from "lucide-react";
import UserRegistrationModal from "@/components/auth/user-registration-modal";

export default function Landing() {
  const [showRegistration, setShowRegistration] = useState(false);

  const handleRoleBasedLogin = (role: string) => {
    sessionStorage.setItem("intended_role", role);
    window.location.href = "/login";
  };

  const roleCards = [
    {
      title: "Employee Portal",
      description: "Submit reports, track your goals, and view performance feedback",
      icon: User,
      color: "role-employee",
      textColor: "text-employee",
      borderColor: "border-employee",
      role: "employee",
      features: ["Submit performance reports", "Track personal goals", "View ratings & feedback", "Activity timeline"],
    },
    {
      title: "Supervisor Portal",
      description: "Review team reports, assign tasks, and provide structured feedback",
      icon: Users,
      color: "role-supervisor",
      textColor: "text-supervisor",
      borderColor: "border-supervisor",
      role: "supervisor",
      features: ["Review & approve reports", "Assign tasks to team", "Rate performance", "Manage direct reports"],
    },
    {
      title: "Manager Portal",
      description: "Oversee departments, plan resources, and monitor team performance",
      icon: Building,
      color: "role-manager",
      textColor: "text-manager",
      borderColor: "border-manager",
      role: "manager",
      features: ["Department analytics", "Resource planning", "Team composition", "Cross-team visibility"],
    },
    {
      title: "Executive Portal",
      description: "Strategic oversight, org-wide analytics, and admin control",
      icon: Crown,
      color: "role-executive",
      textColor: "text-executive",
      borderColor: "border-executive",
      role: "executive",
      features: ["Org-wide dashboards", "Executive analytics", "User management", "System administration"],
    },
  ];

  const highlights = [
    {
      stat: "Evidence-Based",
      title: "Accountability at Every Level",
      description:
        "Workers don't just report work — they prove it. Structured submissions with supporting evidence create a trusted record of activity.",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      stat: "4-Tier Hierarchy",
      title: "Structured Reporting Chain",
      description:
        "A seamless chain from Employee → Supervisor → Manager → Executive ensures the right eyes see the right information at all times.",
      icon: Network,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      stat: "Real-Time",
      title: "Instant Notification System",
      description:
        "Every report submission, approval, revision request, and task assignment triggers an instant notification to the right person.",
      icon: Bell,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const features = [
    {
      icon: FileText,
      title: "Structured Report Submission",
      description: "Submit detailed reports with tasks completed, challenges faced, pending work, and file evidence attachments.",
    },
    {
      icon: ClipboardList,
      title: "Task Assignment Workflow",
      description: "Supervisors assign tasks with deadlines. Workers execute, submit, and supervisors verify — a complete workflow engine.",
    },
    {
      icon: CheckCircle,
      title: "Approval & Verification System",
      description: "Every report goes through Approve / Reject / Request Revision, creating an accountable review trail.",
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Reports per week, completion vs pending tasks, top performers, and bottleneck identification — all in one place.",
    },
    {
      icon: Target,
      title: "Goals Tracking",
      description: "Employees set and track personal goals with status stages: Not Started → In Progress → Completed.",
    },
    {
      icon: Activity,
      title: "Activity Timelines",
      description: "A full historical timeline for every user — reports submitted, tasks completed, reviews given, and more.",
    },
    {
      icon: Lock,
      title: "Role-Based Permissions",
      description: "Strict permission boundaries ensure each role only sees and acts on what they're authorized for.",
    },
    {
      icon: CalendarCheck,
      title: "Performance Reviews",
      description: "Supervisors provide structured ratings (1–5) and written feedback that feed directly into performance records.",
    },
  ];

  const newsItems = [
    {
      date: "Mar 20, 2026",
      title: "Task Assignment System is Now Live",
      summary:
        "Supervisors can now create, assign, and track tasks directly within the platform — closing the loop between assignment and verification.",
      category: "New Feature",
      categoryColor: "text-green-400",
    },
    {
      date: "Mar 15, 2026",
      title: "Q1 Performance Review Cycle",
      summary:
        "The Q1 review cycle is underway. All employees should ensure their reports are submitted and up to date before the end of the month.",
      category: "Announcement",
      categoryColor: "text-yellow-400",
    },
    {
      date: "Mar 10, 2026",
      title: "Enhanced Executive Analytics Dashboard",
      summary:
        "Executives now see richer org-wide summaries: productivity trends, department comparisons, and approval rate breakdowns.",
      category: "Platform Update",
      categoryColor: "text-blue-400",
    },
  ];

  const stats = [
    { value: "4", label: "Organizational Levels" },
    { value: "100%", label: "Digital & Paperless" },
    { value: "Real-Time", label: "Report Verification" },
    { value: "Secure", label: "Role-Based Access" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      {/* ── HERO ── */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-22">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div className="text-left">
              <div className="flex items-center space-x-3 mb-5">
                <Shield className="w-11 h-11 text-primary" />
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-primary">THE SUPERVISOR</h1>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-5 leading-snug">
                Hierarchical Reporting &amp; Accountability — Built for Modern Organizations
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Workers prove their work. Supervisors verify it. Managers track it. Executives see the whole picture.
                A complete, evidence-based performance management platform for teams of any size.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => (window.location.href = "/login")}
                  className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 h-auto shadow-lg hover:scale-105 transition-transform"
                >
                  Sign In
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setShowRegistration(true)}
                  className="text-lg px-8 py-6 h-auto border-2 hover:bg-gray-50 hover:scale-105 transition-transform"
                >
                  Create Account
                </Button>
              </div>
            </div>

            {/* Hero Stat Tiles */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {stats.map((s, i) => (
                <Card key={i} className="border border-gray-100 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <p className="text-3xl font-black text-primary mb-1">{s.value}</p>
                    <p className="text-sm text-gray-600 font-medium">{s.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS (Hierarchy Flow) ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 uppercase tracking-widest px-4 py-1">
            How It Works
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">The Reporting Chain</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Every report travels up the hierarchy, verified at each level.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {[
            { label: "Employee", sub: "Submits Report", icon: User, color: "role-employee" },
            { label: "Supervisor", sub: "Reviews & Rates", icon: Users, color: "role-supervisor" },
            { label: "Manager", sub: "Monitors Team", icon: Briefcase, color: "role-manager" },
            { label: "Executive", sub: "Sees Full Picture", icon: Crown, color: "role-executive" },
          ].map((step, i, arr) => (
            <div key={i} className="flex items-center gap-4">
              <div className="flex flex-col items-center text-center w-28">
                <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mb-2 shadow-md`}>
                  <step.icon className="h-7 w-7 text-white" />
                </div>
                <p className="font-semibold text-gray-900 text-sm">{step.label}</p>
                <p className="text-xs text-gray-500">{step.sub}</p>
              </div>
              {i < arr.length - 1 && (
                <ArrowRight className="h-6 w-6 text-gray-400 shrink-0 hidden sm:block" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── HIGHLIGHTS ── */}
      <div className="bg-gray-50 border-y border-gray-200 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 uppercase tracking-widest px-4 py-1">
              Platform Highlights
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Why Organizations Choose Us</h2>
            <div className="w-24 h-1.5 bg-primary mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card
                  key={index}
                  className="bg-white hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-gray-100"
                >
                  <CardContent className="p-8">
                    <div className={`w-14 h-14 ${item.bgColor} rounded-2xl flex items-center justify-center mb-5 shadow-sm`}>
                      <Icon className={`h-7 w-7 ${item.color}`} />
                    </div>
                    <p className={`text-xs font-bold uppercase tracking-widest ${item.color} mb-2`}>{item.stat}</p>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── FEATURES GRID ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 uppercase tracking-widest px-4 py-1">
            Full Feature Set
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Everything Your Team Needs</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A complete workflow engine for structured accountability at every level.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="flex gap-4 p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">{f.title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── NEWS ── */}
      <div className="bg-gray-900 py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-3xl rounded-full translate-x-1/2 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <Badge className="mb-4 bg-white/10 text-white border-white/20 uppercase tracking-widest px-4 py-1">
                Corporate News
              </Badge>
              <h2 className="text-4xl font-bold text-white">Latest Platform Updates</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {newsItems.map((news, index) => (
              <Card
                key={index}
                className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors duration-300 group"
              >
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-5">
                    <span className={`text-xs font-bold tracking-widest uppercase ${news.categoryColor}`}>
                      {news.category}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">{news.date}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-primary transition-colors leading-snug">
                    {news.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{news.summary}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* ── LOGIN PORTALS ── */}
      <div id="login-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-14">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 uppercase tracking-widest px-4 py-1">
            Login Portals
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Access Your Workspace</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Select your role to enter your specialized performance management environment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {roleCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card
                key={index}
                className={`hover:shadow-2xl transition-all duration-500 cursor-pointer border-t-4 ${card.borderColor} bg-white group hover:-translate-y-2`}
                onClick={() => handleRoleBasedLogin(card.role)}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`w-18 h-18 ${card.color} rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-md group-hover:scale-110 transition-transform duration-300 w-16 h-16`}>
                    <Icon className={`h-8 w-8 ${card.textColor}`} />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-center mb-5 text-sm leading-relaxed">{card.description}</p>
                  <ul className="space-y-1.5 mb-6">
                    {card.features.map((f, fi) => (
                      <li key={fi} className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircle className={`h-3.5 w-3.5 shrink-0 ${card.textColor}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${card.color} text-white hover:opacity-90 shadow-md group-hover:scale-105 transition-all duration-300 font-bold`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRoleBasedLogin(card.role);
                    }}
                  >
                    Enter Portal
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── FOOTER CTA ── */}
      <div className="bg-white border-t border-gray-200 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
            Ready to bring accountability to your team?
          </h3>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join your organization's reporting platform and start contributing to a structured, transparent, and evidence-based workflow today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              onClick={() => setShowRegistration(true)}
              className="bg-gray-900 hover:bg-black text-white px-10 py-6 h-auto text-xl font-bold shadow-xl hover:scale-105 transition-transform"
            >
              Create Your Account
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => (window.location.href = "/login")}
              className="px-10 py-6 h-auto text-xl font-bold hover:scale-105 transition-transform"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>

      {showRegistration && <UserRegistrationModal onClose={() => setShowRegistration(false)} />}
    </div>
  );
}
