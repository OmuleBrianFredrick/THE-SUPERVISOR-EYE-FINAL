import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Quote,
  Handshake,
  Menu,
  X,
  MapPin,
  Globe,
} from "lucide-react";
import UserRegistrationModal from "@/components/auth/user-registration-modal";

export default function Landing() {
  const [showRegistration, setShowRegistration] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      description: "Workers don't just report work — they prove it. Structured submissions with supporting evidence create a trusted record of activity.",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      stat: "4-Tier Hierarchy",
      title: "Structured Reporting Chain",
      description: "A seamless chain from Employee → Supervisor → Manager → Executive ensures the right eyes see the right information at all times.",
      icon: Network,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      stat: "Real-Time",
      title: "Instant Notification System",
      description: "Every report submission, approval, revision request, and task assignment triggers an instant notification to the right person.",
      icon: Bell,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const features = [
    { icon: FileText, title: "Structured Report Submission", description: "Submit detailed reports with tasks completed, challenges faced, pending work, and file evidence attachments." },
    { icon: ClipboardList, title: "Task Assignment Workflow", description: "Supervisors assign tasks with deadlines. Workers execute, submit, and supervisors verify — a complete workflow engine." },
    { icon: CheckCircle, title: "Approval & Verification System", description: "Every report goes through Approve / Reject / Request Revision, creating an accountable review trail." },
    { icon: BarChart3, title: "Analytics & Insights", description: "Reports per week, completion vs pending tasks, top performers, and bottleneck identification — all in one place." },
    { icon: Target, title: "Goals Tracking", description: "Employees set and track personal goals with status stages: Not Started → In Progress → Completed." },
    { icon: Activity, title: "Activity Timelines", description: "A full historical timeline for every user — reports submitted, tasks completed, reviews given, and more." },
    { icon: Lock, title: "Role-Based Permissions", description: "Strict permission boundaries ensure each role only sees and acts on what they're authorized for." },
    { icon: CalendarCheck, title: "Performance Reviews", description: "Supervisors provide structured ratings (1–5) and written feedback that feed directly into performance records." },
  ];

  const howToSteps = [
    {
      step: "01",
      title: "Register Your Organization",
      description: "An executive sets up the organization account and defines the department structure and reporting hierarchy.",
      icon: Building,
      color: "bg-blue-600",
    },
    {
      step: "02",
      title: "Onboard Your Team",
      description: "Employees, supervisors, and managers join through email or Google sign-in and are assigned to their roles.",
      icon: UserPlus,
      color: "bg-green-600",
    },
    {
      step: "03",
      title: "Assign Tasks & Submit Reports",
      description: "Supervisors assign tasks with deadlines. Employees submit structured performance reports at the end of each period.",
      icon: ClipboardList,
      color: "bg-purple-600",
    },
    {
      step: "04",
      title: "Review & Provide Feedback",
      description: "Supervisors review each report, rate performance (1–5), and provide written feedback. Employees are notified instantly.",
      icon: CheckCircle,
      color: "bg-amber-600",
    },
    {
      step: "05",
      title: "Track Analytics & Growth",
      description: "Managers and executives view org-wide dashboards, track trends, and make data-driven decisions on performance.",
      icon: TrendingUp,
      color: "bg-red-600",
    },
  ];

  const partners = [
    { name: "Nexus Corp", industry: "Technology", location: "New York, USA", initials: "NC", color: "bg-blue-600" },
    { name: "Pinnacle Group", industry: "Finance", location: "London, UK", initials: "PG", color: "bg-green-600" },
    { name: "Orbis Solutions", industry: "Consulting", location: "Dubai, UAE", initials: "OS", color: "bg-purple-600" },
    { name: "Meridian Health", industry: "Healthcare", location: "Toronto, CA", initials: "MH", color: "bg-red-600" },
    { name: "Vantage Retail", industry: "Retail", location: "Lagos, NG", initials: "VR", color: "bg-amber-600" },
    { name: "Stratum Energy", industry: "Energy", location: "Nairobi, KE", initials: "SE", color: "bg-teal-600" },
    { name: "Apex Logistics", industry: "Logistics", location: "Singapore", initials: "AL", color: "bg-indigo-600" },
    { name: "Crest Media", industry: "Media", location: "Johannesburg, SA", initials: "CM", color: "bg-pink-600" },
  ];

  const testimonials = [
    {
      quote: "THE SUPERVISOR completely transformed how we handle performance reporting. Before, everything was on emails and spreadsheets. Now every submission is tracked, reviewed, and archived automatically. Our team accountability is at an all-time high.",
      name: "Amara Okafor",
      title: "Chief Operations Officer",
      company: "Nexus Corp",
      initials: "AO",
      color: "bg-blue-600",
      rating: 5,
    },
    {
      quote: "The four-tier hierarchy is exactly what a company our size needed. Our supervisors now have clear visibility over their teams without managers being overwhelmed. The task assignment and verification workflow has cut missed deadlines by 60%.",
      name: "James Whitfield",
      title: "Regional Director",
      company: "Pinnacle Group",
      initials: "JW",
      color: "bg-green-600",
      rating: 5,
    },
    {
      quote: "We evaluated several performance management platforms and nothing came close to the depth of THE SUPERVISOR's reporting chain. The GPS location tagging and evidence-based submissions gave us the transparency we had been looking for across our field teams.",
      name: "Fatima Al-Hassan",
      title: "Head of Human Resources",
      company: "Meridian Health",
      initials: "FH",
      color: "bg-red-600",
      rating: 5,
    },
    {
      quote: "As a fast-growing consulting firm, we needed a platform that could scale with our team structure. THE SUPERVISOR's role-based access control and org chart views have made it simple to onboard new staff and immediately integrate them into our review cycle.",
      name: "Kwame Asante",
      title: "Managing Partner",
      company: "Orbis Solutions",
      initials: "KA",
      color: "bg-purple-600",
      rating: 5,
    },
    {
      quote: "The analytics dashboard alone is worth every penny. Our executive team now walks into board meetings with real data on team performance, completion rates, and review trends. No more guesswork — just clear, live numbers.",
      name: "Chidinma Eze",
      title: "Executive Director",
      company: "Vantage Retail",
      initials: "CE",
      color: "bg-amber-600",
      rating: 5,
    },
    {
      quote: "Our field supervisors love the mobile-friendly interface and the instant notifications. When an employee submits a report, supervisors are alerted immediately and can review on the go. This speed was unheard of with our old paper-based system.",
      name: "Sipho Ndlovu",
      title: "Operations Manager",
      company: "Stratum Energy",
      initials: "SN",
      color: "bg-teal-600",
      rating: 5,
    },
  ];

  const newsItems = [
    {
      date: "Apr 20, 2026",
      title: "Task Assignment System is Now Live",
      summary: "Supervisors can now create, assign, and track tasks directly within the platform — closing the loop between assignment and verification.",
      category: "New Feature",
      categoryColor: "text-green-400",
    },
    {
      date: "Apr 10, 2026",
      title: "Google Sign-In Now Available",
      summary: "Team members can now join and sign in using their Google accounts, making onboarding faster and more seamless for organizations.",
      category: "Platform Update",
      categoryColor: "text-blue-400",
    },
    {
      date: "Apr 01, 2026",
      title: "Q1 Performance Review Cycle",
      summary: "The Q1 review cycle is underway. All employees should ensure their reports are submitted and up to date before the end of the month.",
      category: "Announcement",
      categoryColor: "text-yellow-400",
    },
  ];

  const stats = [
    { value: "4", label: "Organizational Levels" },
    { value: "100%", label: "Digital & Paperless" },
    { value: "Real-Time", label: "Report Verification" },
    { value: "Secure", label: "Role-Based Access" },
  ];

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Partners", href: "#partners" },
    { label: "Testimonials", href: "#testimonials" },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* ── STICKY NAVBAR ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-gray-900 tracking-tight">THE SUPERVISOR</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <a key={link.label} href={link.href} className="text-sm font-medium text-gray-600 hover:text-blue-700 transition-colors">
                  {link.label}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => window.location.href = "/login"} className="text-gray-700 font-semibold">
                Sign In
              </Button>
              <Button size="sm" onClick={() => setShowRegistration(true)} className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5">
                Get Started
              </Button>
            </div>

            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
            {navLinks.map(link => (
              <a key={link.label} href={link.href} className="block text-sm font-medium text-gray-600 hover:text-blue-700 py-2" onClick={() => setMobileMenuOpen(false)}>
                {link.label}
              </a>
            ))}
            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => window.location.href = "/login"}>Sign In</Button>
              <Button size="sm" className="flex-1 bg-blue-700 hover:bg-blue-800 text-white" onClick={() => { setShowRegistration(true); setMobileMenuOpen(false); }}>Get Started</Button>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-6 bg-blue-600/20 text-blue-300 border-blue-500/30 uppercase tracking-widest px-4 py-1.5 text-xs">
                Enterprise Performance Platform
              </Badge>
              <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-6">
                Where Teams
                <span className="text-blue-400"> Prove</span> Their Work
              </h1>
              <p className="text-lg text-slate-300 mb-10 leading-relaxed max-w-xl">
                THE SUPERVISOR is a hierarchical performance reporting and accountability platform built for modern organizations. Workers prove their work. Supervisors verify it. Managers track it. Executives see the full picture.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => window.location.href = "/login"}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 h-auto shadow-xl hover:scale-105 transition-transform font-bold"
                >
                  Sign In to Your Portal
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setShowRegistration(true)}
                  className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6 h-auto font-bold"
                >
                  Create Account
                </Button>
              </div>
            </div>

            <div className="hidden lg:grid grid-cols-2 gap-4">
              {stats.map((s, i) => (
                <Card key={i} className="bg-white/5 border-white/10 backdrop-blur hover:bg-white/10 transition-colors">
                  <CardContent className="p-6 text-center">
                    <p className="text-3xl font-black text-blue-400 mb-2">{s.value}</p>
                    <p className="text-sm text-slate-400 font-medium">{s.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── TRUST BAR ── */}
      <div className="bg-gray-50 border-y border-gray-200 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Trusted by organizations across</p>
            {["Nigeria", "Kenya", "South Africa", "UAE", "UK", "USA", "Canada", "Singapore"].map(c => (
              <div key={c} className="flex items-center gap-1.5 text-gray-500">
                <Globe className="w-3.5 h-3.5" />
                <span className="text-sm font-medium">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-200 uppercase tracking-widest px-4 py-1 text-xs">
            How It Works
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Up and Running in 5 Steps</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            A straightforward onboarding flow gets your entire organization onto the platform quickly.
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-32" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {howToSteps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center relative">
                <div className={`w-20 h-20 ${step.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg relative z-10`}>
                  <step.icon className="w-9 h-9 text-white" />
                </div>
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-xs font-black text-gray-500">
                  {step.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm leading-tight">{step.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 bg-blue-50 rounded-2xl p-8">
          <p className="text-center font-semibold text-blue-900 mb-5 text-sm uppercase tracking-widest">The Reporting Chain</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              { label: "Employee", sub: "Submits Report", icon: User, color: "bg-blue-500" },
              { label: "Supervisor", sub: "Reviews & Rates", icon: Users, color: "bg-green-500" },
              { label: "Manager", sub: "Monitors Team", icon: Briefcase, color: "bg-purple-500" },
              { label: "Executive", sub: "Sees Full Picture", icon: Crown, color: "bg-amber-500" },
            ].map((step, i, arr) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex flex-col items-center text-center w-24">
                  <div className={`w-14 h-14 ${step.color} rounded-xl flex items-center justify-center mb-2 shadow-md`}>
                    <step.icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-semibold text-gray-900 text-xs">{step.label}</p>
                  <p className="text-xs text-gray-500">{step.sub}</p>
                </div>
                {i < arr.length - 1 && <ArrowRight className="h-5 w-5 text-gray-400 shrink-0 hidden sm:block" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HIGHLIGHTS ── */}
      <div className="bg-gray-50 border-y border-gray-200 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-200 uppercase tracking-widest px-4 py-1 text-xs">
              Platform Highlights
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Why Organizations Choose Us</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index} className="bg-white hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-gray-100">
                  <CardContent className="p-8">
                    <div className={`w-14 h-14 ${item.bgColor} rounded-2xl flex items-center justify-center mb-5`}>
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
      <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-14">
          <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-200 uppercase tracking-widest px-4 py-1 text-xs">
            Full Feature Set
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Everything Your Team Needs</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">A complete workflow engine for structured accountability at every level.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="flex gap-4 p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow hover:-translate-y-0.5 duration-300">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <f.icon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">{f.title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PARTNER ORGANIZATIONS ── */}
      <div id="partners" className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-white/10 text-blue-300 border-white/20 uppercase tracking-widest px-4 py-1 text-xs">
              Partner Organizations
            </Badge>
            <h2 className="text-4xl font-bold text-white mb-4">Organizations on the Platform</h2>
            <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Leading companies across industries and continents use THE SUPERVISOR to manage performance, drive accountability, and build high-performing teams.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {partners.map((p, i) => (
              <Card key={i} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 group">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 ${p.color} rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md`}>
                      {p.initials}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.industry}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-3 h-3" />
                    <span className="text-xs">{p.location}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <p className="text-slate-500 text-sm mb-6">And many more organizations across 30+ countries</p>
            <Button
              onClick={() => setShowRegistration(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 shadow-xl hover:scale-105 transition-transform"
            >
              <Handshake className="w-4 h-4 mr-2" />
              Join as a Partner Organization
            </Button>
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div id="testimonials" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-200 uppercase tracking-widest px-4 py-1 text-xs">
            Testimonials
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">What Leaders Are Saying</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Real feedback from executives, managers, and operations leaders who rely on THE SUPERVISOR every day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <Card key={i} className="bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col">
              <CardContent className="p-8 flex flex-col flex-1">
                <Quote className="w-8 h-8 text-blue-200 mb-4 shrink-0" />
                <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(t.rating)].map((_, s) => (
                    <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className={`${t.color} text-white text-xs font-bold`}>{t.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.title}, {t.company}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ── NEWS / UPDATES ── */}
      <div className="bg-gray-900 py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/5 blur-3xl rounded-full translate-x-1/2 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <Badge className="mb-4 bg-white/10 text-white border-white/20 uppercase tracking-widest px-4 py-1 text-xs">
                Platform News
              </Badge>
              <h2 className="text-4xl font-bold text-white">Latest Updates</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {newsItems.map((news, index) => (
              <Card key={index} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors duration-300 group">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-5">
                    <span className={`text-xs font-bold tracking-widest uppercase ${news.categoryColor}`}>{news.category}</span>
                    <span className="text-xs text-gray-500 font-medium">{news.date}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-blue-400 transition-colors leading-snug">{news.title}</h3>
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
          <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-200 uppercase tracking-widest px-4 py-1 text-xs">
            Access Your Workspace
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Login Portals</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
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
                  <div className={`w-16 h-16 ${card.color} rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-8 w-8 ${card.textColor}`} />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{card.title}</CardTitle>
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
                    onClick={(e) => { e.stopPropagation(); handleRoleBasedLogin(card.role); }}
                  >
                    Enter Portal <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── FOOTER CTA ── */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Award className="w-9 h-9 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-4">Ready to bring accountability to your team?</h3>
          <p className="text-lg text-blue-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join your organization's reporting platform and start contributing to a structured, transparent, and evidence-based workflow today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              onClick={() => setShowRegistration(true)}
              className="bg-white text-blue-800 hover:bg-gray-100 px-10 py-6 h-auto text-lg font-bold shadow-xl hover:scale-105 transition-transform"
            >
              Create Your Account
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => window.location.href = "/login"}
              className="border-white/40 text-white hover:bg-white/10 px-10 py-6 h-auto text-lg font-bold"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-white">THE SUPERVISOR</span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-gray-500">
              <a href="/login" className="hover:text-white transition-colors">Sign In</a>
              <button onClick={() => setShowRegistration(true)} className="hover:text-white transition-colors">Register</button>
              <span>Performance & Reporting Platform</span>
            </div>
            <p className="text-xs text-gray-600">© 2026 THE SUPERVISOR. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {showRegistration && <UserRegistrationModal onClose={() => setShowRegistration(false)} />}
    </div>
  );
}
