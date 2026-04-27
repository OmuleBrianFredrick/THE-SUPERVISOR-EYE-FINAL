import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User, Users, Building, Crown, Shield, ChevronRight, ChevronDown,
  UserPlus, Star, TrendingUp, Award, ArrowRight, FileText, Target,
  Bell, BarChart3, CheckCircle, Lock, ClipboardList, Network,
  Activity, Briefcase, CalendarCheck, Quote, Handshake, Menu, X,
  MapPin, Globe, Check, HelpCircle, Zap, PieChart,
} from "lucide-react";
import UserRegistrationModal from "@/components/auth/user-registration-modal";

/* ─── Scroll-reveal hook ─── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── Animated wrapper ─── */
function Reveal({
  children, delay = 0, direction = "up", className = "",
}: {
  children: React.ReactNode; delay?: number; direction?: "up" | "left" | "right" | "none"; className?: string;
}) {
  const { ref, visible } = useReveal();
  const base = "transition-all duration-700 ease-out";
  const hidden =
    direction === "up" ? "opacity-0 translate-y-10"
    : direction === "left" ? "opacity-0 -translate-x-10"
    : direction === "right" ? "opacity-0 translate-x-10"
    : "opacity-0";
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`${base} ${visible ? "opacity-100 translate-x-0 translate-y-0" : hidden} ${className}`}
    >
      {children}
    </div>
  );
}

export default function Landing() {
  const [showRegistration, setShowRegistration] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  /* ─── DATA ─── */
  const pricingTiers = [
    {
      name: "Starter", price: "$49", period: "/month",
      tagline: "Perfect for small teams getting started", users: "Up to 15 users",
      highlight: false,
      features: ["All 4 organizational roles","Report submission & review","Task assignment workflow","Basic analytics dashboard","Email notifications","Email support"],
    },
    {
      name: "Growth", price: "$149", period: "/month",
      tagline: "For growing teams that need more insight", users: "Up to 75 users",
      highlight: true,
      features: ["Everything in Starter","Performance ratings & history","Goals tracking system","Activity timelines per user","CSV export","Priority support"],
    },
    {
      name: "Business", price: "$399", period: "/month",
      tagline: "Built for multi-department organizations", users: "Up to 300 users",
      highlight: false,
      features: ["Everything in Growth","PDF export & reporting","Org chart visualization","Advanced cross-team analytics","Department comparisons","Dedicated onboarding support"],
    },
    {
      name: "Enterprise", price: "Custom", period: "",
      tagline: "Unlimited scale with dedicated support", users: "Unlimited users",
      highlight: false,
      features: ["Everything in Business","Custom integrations & API","SLA uptime guarantee","Custom reporting templates","Dedicated account manager","White-label option"],
    },
  ];

  const roleSections = [
    {
      role: "Employee", tagline: "The Foundation of Every Report", icon: User,
      color: "from-blue-500 to-blue-700", ring: "ring-blue-200", textColor: "text-blue-700", dot: "bg-blue-500",
      description: "Employees are the starting point of every accountability cycle. Their dashboard is focused and personal — they see only their own workspace, tasks, and performance history.",
      responsibilities: ["Submit structured performance reports each work period","Document tasks completed, challenges faced, and pending work","Track personal goals from Not Started through to Completed","Respond to revision requests from their supervisor","View performance ratings and written feedback received","Monitor their full activity timeline and history"],
      cannot: ["See other employees' reports or personal data","Access team analytics or management dashboards","Assign tasks or review anyone else's submissions"],
    },
    {
      role: "Supervisor", tagline: "The Core of Day-to-Day Accountability", icon: Users,
      color: "from-emerald-500 to-emerald-700", ring: "ring-emerald-200", textColor: "text-emerald-700", dot: "bg-emerald-500",
      description: "Supervisors carry the most active administrative role. They sit between employees doing the work and managers overseeing outcomes — acting as both task-givers and quality verifiers.",
      responsibilities: ["Assign tasks to team members with deadlines and priority levels","Review every employee report in their team's submission queue","Approve, request revision, or reject reports with written feedback","Rate employee performance on a 1–5 star scale per report","Monitor which team members have submitted or are pending","View the full activity timeline for any employee on their team"],
      cannot: ["Access reports or data from employees outside their team","See cross-department analytics or other supervisors' teams","Modify user accounts or configure system settings"],
    },
    {
      role: "Manager", tagline: "Strategic Oversight Across Teams", icon: Briefcase,
      color: "from-violet-500 to-violet-700", ring: "ring-violet-200", textColor: "text-violet-700", dot: "bg-violet-500",
      description: "Managers do not review individual reports — they see the aggregated picture across all teams under their departments to identify patterns, bottlenecks, and opportunities.",
      responsibilities: ["Monitor submission and review rates across all supervised teams","Compare performance across multiple supervisors' teams","Identify high performers and underperformers by department","Track task completion rates and overdue assignments","Access cross-team visibility for resource planning","Generate department-level performance summaries"],
      cannot: ["Review or act on individual employee reports directly","Access departments or teams outside their assigned scope","Manage user accounts or system-level configurations"],
    },
    {
      role: "Executive", tagline: "Full Organizational Control", icon: Crown,
      color: "from-amber-500 to-orange-600", ring: "ring-amber-200", textColor: "text-amber-700", dot: "bg-amber-500",
      description: "Executives have access to every layer of the platform — both operational data and system administration. They see the entire organization at once.",
      responsibilities: ["Access a full org-wide command dashboard with live performance data","Manage all user accounts — add, edit, assign roles, or deactivate","Define and update the organizational hierarchy and reporting chain","View the complete activity and audit trail for any user or team","Export org-wide reports to CSV or PDF for board reporting","Configure system-wide settings and platform preferences"],
      cannot: ["No restrictions — Executives have full system access"],
    },
  ];

  const howToSteps = [
    { step: "01", title: "Register Your Organization", description: "An executive sets up the account and defines the department structure.", icon: Building, color: "from-blue-500 to-blue-700" },
    { step: "02", title: "Onboard Your Team", description: "Employees, supervisors, and managers join via email or Google sign-in.", icon: UserPlus, color: "from-emerald-500 to-emerald-700" },
    { step: "03", title: "Assign Tasks & Submit Reports", description: "Supervisors assign tasks. Employees submit structured reports each period.", icon: ClipboardList, color: "from-violet-500 to-violet-700" },
    { step: "04", title: "Review & Provide Feedback", description: "Supervisors review, rate performance, and approve or request revisions.", icon: CheckCircle, color: "from-amber-500 to-orange-600" },
    { step: "05", title: "Track Analytics & Growth", description: "Managers and executives access org-wide dashboards and trend data.", icon: TrendingUp, color: "from-rose-500 to-rose-700" },
  ];

  const features = [
    { icon: FileText, title: "Structured Report Submission", description: "Submit detailed reports with tasks, challenges, pending work, and evidence." },
    { icon: ClipboardList, title: "Task Assignment Workflow", description: "Assign tasks with deadlines. Employees complete, supervisors verify." },
    { icon: CheckCircle, title: "Approval & Verification", description: "Approve / Reject / Request Revision — a full accountable review trail." },
    { icon: BarChart3, title: "Analytics & Insights", description: "Completion rates, top performers, bottlenecks — all in real time." },
    { icon: Target, title: "Goals Tracking", description: "Set and track personal goals: Not Started → In Progress → Completed." },
    { icon: Activity, title: "Activity Timelines", description: "Full chronological history for every user — every action logged." },
    { icon: Lock, title: "Role-Based Permissions", description: "Strict boundaries — each role only sees what they're authorized for." },
    { icon: CalendarCheck, title: "Performance Reviews", description: "Supervisor ratings (1–5) and written feedback stored permanently." },
  ];

  const highlights = [
    { stat: "Evidence-Based", title: "Accountability at Every Level", description: "Workers prove their work. Structured submissions with supporting evidence create a trusted record.", icon: CheckCircle, gradient: "from-emerald-400 to-teal-500" },
    { stat: "4-Tier Hierarchy", title: "Structured Reporting Chain", description: "A seamless chain from Employee → Supervisor → Manager → Executive ensures the right data reaches the right eyes.", icon: Network, gradient: "from-blue-400 to-indigo-500" },
    { stat: "Real-Time", title: "Instant Notification System", description: "Every submission, approval, revision request, and task assignment triggers an instant notification.", icon: Bell, gradient: "from-violet-400 to-purple-600" },
  ];

  const partners = [
    { name: "Nexus Corp", industry: "Technology", location: "New York, USA", initials: "NC", gradient: "from-blue-500 to-blue-700" },
    { name: "Pinnacle Group", industry: "Finance", location: "London, UK", initials: "PG", gradient: "from-emerald-500 to-emerald-700" },
    { name: "Orbis Solutions", industry: "Consulting", location: "Dubai, UAE", initials: "OS", gradient: "from-violet-500 to-violet-700" },
    { name: "Meridian Health", industry: "Healthcare", location: "Toronto, CA", initials: "MH", gradient: "from-rose-500 to-rose-700" },
    { name: "Vantage Retail", industry: "Retail", location: "Lagos, NG", initials: "VR", gradient: "from-amber-500 to-orange-600" },
    { name: "Stratum Energy", industry: "Energy", location: "Nairobi, KE", initials: "SE", gradient: "from-teal-500 to-cyan-600" },
    { name: "Apex Logistics", industry: "Logistics", location: "Singapore", initials: "AL", gradient: "from-indigo-500 to-blue-700" },
    { name: "Crest Media", industry: "Media", location: "Johannesburg, SA", initials: "CM", gradient: "from-pink-500 to-rose-600" },
  ];

  const testimonials = [
    { quote: "THE SUPERVISOR completely transformed how we handle performance reporting. Every submission is tracked, reviewed, and archived automatically. Our team accountability is at an all-time high.", name: "Amara Okafor", title: "Chief Operations Officer", company: "Nexus Corp", initials: "AO", gradient: "from-blue-500 to-blue-700", rating: 5 },
    { quote: "The four-tier hierarchy is exactly what a company our size needed. The task assignment and verification workflow has cut missed deadlines by 60%.", name: "James Whitfield", title: "Regional Director", company: "Pinnacle Group", initials: "JW", gradient: "from-emerald-500 to-emerald-700", rating: 5 },
    { quote: "The GPS location tagging and evidence-based submissions gave us the transparency we had been looking for across our field teams.", name: "Fatima Al-Hassan", title: "Head of Human Resources", company: "Meridian Health", initials: "FH", gradient: "from-rose-500 to-rose-700", rating: 5 },
    { quote: "THE SUPERVISOR's role-based access control and org chart views have made it simple to onboard new staff and immediately integrate them into our review cycle.", name: "Kwame Asante", title: "Managing Partner", company: "Orbis Solutions", initials: "KA", gradient: "from-violet-500 to-violet-700", rating: 5 },
    { quote: "Our executive team now walks into board meetings with real data on team performance and completion rates. No more guesswork — just clear, live numbers.", name: "Chidinma Eze", title: "Executive Director", company: "Vantage Retail", initials: "CE", gradient: "from-amber-500 to-orange-600", rating: 5 },
    { quote: "Our field supervisors love the instant notifications. When an employee submits a report, supervisors are alerted immediately and can review on the go.", name: "Sipho Ndlovu", title: "Operations Manager", company: "Stratum Energy", initials: "SN", gradient: "from-teal-500 to-cyan-600", rating: 5 },
  ];

  const faqs = [
    { q: "How long does it take to set up the platform for our organization?", a: "Most organizations are fully set up and have their first reports submitted within one business day. The onboarding flow is designed to be completed without any IT help." },
    { q: "Can employees sign in with Google instead of creating a separate password?", a: "Yes. The platform supports both email/password and Google sign-in. Team members can use whichever method they prefer, and both connect to the same account." },
    { q: "What happens if an employee submits a report to the wrong supervisor?", a: "Reports are automatically routed to the designated supervisor set at account creation. An executive can update supervisor assignments at any time." },
    { q: "Is our organization's data kept private from other organizations?", a: "Completely. Each organization's data is fully isolated. No employee from one organization can see any data from another organization." },
    { q: "What happens when someone leaves the organization?", a: "An executive can deactivate any user account immediately. Access is lost right away, but all historical reports and activity remain for your records." },
    { q: "Can reports be exported for audits or board presentations?", a: "Yes. Reports export to CSV for spreadsheet analysis or PDF for formal presentation. Export is available from the Reports section." },
    { q: "Do we need IT staff to maintain the platform after setup?", a: "No. THE SUPERVISOR is fully cloud-hosted. No server maintenance or infrastructure management is required. All updates deploy automatically." },
    { q: "Can we have multiple departments within one organization account?", a: "Yes. The platform is built for multi-department organizations. Managers are scoped to their departments, and executives see across all of them." },
    { q: "Is there a free trial available?", a: "Yes. All plans include a 14-day free trial with no credit card required. You get full access to the selected plan's features during the trial." },
    { q: "Can the platform scale as our organization grows?", a: "Absolutely. You can upgrade your plan at any time. The Enterprise plan supports unlimited users and can be customized to your exact structure." },
  ];

  const stats = [
    { value: "4", label: "Org Levels" },
    { value: "100%", label: "Paperless" },
    { value: "Real-Time", label: "Verification" },
    { value: "Secure", label: "Role Access" },
  ];

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Roles", href: "#roles" },
    { label: "Pricing", href: "#pricing" },
    { label: "Partners", href: "#partners" },
    { label: "FAQ", href: "#faq" },
  ];

  const handleRoleBasedLogin = (role: string) => {
    sessionStorage.setItem("intended_role", role);
    window.location.href = "/login";
  };

  const roleCards = [
    { title: "Employee Portal", description: "Submit reports, track goals, and view feedback", icon: User, gradient: "from-blue-500 to-blue-700", role: "employee", features: ["Submit performance reports","Track personal goals","View ratings & feedback","Activity timeline"] },
    { title: "Supervisor Portal", description: "Review team reports, assign tasks, provide feedback", icon: Users, gradient: "from-emerald-500 to-emerald-700", role: "supervisor", features: ["Review & approve reports","Assign tasks to team","Rate performance","Manage direct reports"] },
    { title: "Manager Portal", description: "Oversee departments and monitor team performance", icon: Building, gradient: "from-violet-500 to-violet-700", role: "manager", features: ["Department analytics","Resource planning","Team composition","Cross-team visibility"] },
    { title: "Executive Portal", description: "Strategic oversight, org-wide analytics, admin control", icon: Crown, gradient: "from-amber-500 to-orange-600", role: "executive", features: ["Org-wide dashboards","Executive analytics","User management","System administration"] },
  ];

  return (
    <>
      <style>{`
        @keyframes floatA {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-24px) scale(1.04); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(18px) scale(0.97); }
        }
        @keyframes floatC {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(16px); }
        }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmerMove {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
          50% { box-shadow: 0 0 32px 8px rgba(59,130,246,0.35); }
        }
        @keyframes marqueeX {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes rotateOrb {
          0% { transform: rotate(0deg) translateX(80px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(80px) rotate(-360deg); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .float-a { animation: floatA 7s ease-in-out infinite; }
        .float-b { animation: floatB 9s ease-in-out infinite; }
        .float-c { animation: floatC 6s ease-in-out infinite; }
        .hero-line-1 { animation: heroFadeUp 0.7s ease-out both; animation-delay: 0.1s; }
        .hero-line-2 { animation: heroFadeUp 0.7s ease-out both; animation-delay: 0.25s; }
        .hero-line-3 { animation: heroFadeUp 0.7s ease-out both; animation-delay: 0.4s; }
        .hero-line-4 { animation: heroFadeUp 0.7s ease-out both; animation-delay: 0.55s; }
        .hero-line-5 { animation: heroFadeUp 0.7s ease-out both; animation-delay: 0.7s; }
        .shimmer-card {
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%);
          background-size: 400px 100%;
          animation: shimmerMove 2.5s linear infinite;
        }
        .glow-pulse { animation: pulseGlow 2.5s ease-in-out infinite; }
        .marquee-track { animation: marqueeX 22s linear infinite; }
        .gradient-text {
          background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #34d399 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 4s ease infinite;
        }
        .card-hover-lift {
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
        }
        .card-hover-lift:hover {
          transform: translateY(-8px) scale(1.01);
          box-shadow: 0 24px 48px -12px rgba(0,0,0,0.18);
        }
        .pricing-popular-glow {
          box-shadow: 0 0 0 2px #3b82f6, 0 20px 60px -10px rgba(59,130,246,0.4);
        }
        .faq-answer {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease;
          opacity: 0;
        }
        .faq-answer.open {
          max-height: 200px;
          opacity: 1;
        }
      `}</style>

      <div className="min-h-screen bg-[#0b0f1a] text-white overflow-x-hidden">

        {/* ── STICKY NAV ── */}
        <nav className="sticky top-0 z-50 bg-[#0b0f1a]/90 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Shield className="w-4.5 h-4.5 text-white w-5 h-5" />
                </div>
                <span className="text-lg font-black text-white tracking-tight">THE SUPERVISOR</span>
              </div>

              <div className="hidden md:flex items-center gap-7">
                {navLinks.map(link => (
                  <a key={link.label} href={link.href}
                    className="text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200 relative group">
                    {link.label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-blue-500 group-hover:w-full transition-all duration-300" />
                  </a>
                ))}
              </div>

              <div className="hidden md:flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => window.location.href = "/login"}
                  className="text-slate-300 hover:text-white hover:bg-white/5 font-medium text-sm">
                  Sign In
                </Button>
                <Button size="sm" onClick={() => setShowRegistration(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 shadow-lg shadow-blue-500/25 transition-all duration-200">
                  Get Started
                </Button>
              </div>

              <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-6 h-6 text-slate-300" /> : <Menu className="w-6 h-6 text-slate-300" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t border-white/5 bg-[#0b0f1a] px-4 py-4 space-y-3">
              {navLinks.map(link => (
                <a key={link.label} href={link.href}
                  className="block text-sm font-medium text-slate-400 hover:text-white py-2 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}>{link.label}</a>
              ))}
              <div className="flex gap-3 pt-3 border-t border-white/5">
                <Button variant="outline" size="sm" className="flex-1 border-white/10 text-white hover:bg-white/5"
                  onClick={() => window.location.href = "/login"}>Sign In</Button>
                <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white"
                  onClick={() => { setShowRegistration(true); setMobileMenuOpen(false); }}>Get Started</Button>
              </div>
            </div>
          )}
        </nav>

        {/* ── HERO ── */}
        <div className="relative min-h-[90vh] flex items-center overflow-hidden">
          {/* Animated background orbs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="float-a absolute top-20 left-[10%] w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
            <div className="float-b absolute bottom-20 right-[8%] w-96 h-96 bg-violet-600/15 rounded-full blur-3xl" />
            <div className="float-c absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-3xl" />
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="hero-line-1">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-widest mb-6">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                    Enterprise Performance Platform
                  </span>
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] mb-6">
                  <div className="hero-line-2 text-white">Where Teams</div>
                  <div className="hero-line-3">
                    <span className="gradient-text">Prove</span>
                    <span className="text-white"> Their Work</span>
                  </div>
                </h1>
                <p className="hero-line-4 text-lg text-slate-400 mb-10 leading-relaxed max-w-lg">
                  THE SUPERVISOR is a hierarchical performance reporting and accountability platform built for modern organizations. Workers prove it. Supervisors verify it. Managers track it. Executives see it all.
                </p>
                <div className="hero-line-5 flex flex-wrap gap-4">
                  <Button size="lg" onClick={() => window.location.href = "/login"}
                    className="glow-pulse bg-blue-600 hover:bg-blue-500 text-white text-base px-8 py-6 h-auto font-bold shadow-xl shadow-blue-500/30 transition-all duration-300 hover:scale-105">
                    Sign In to Your Portal <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => setShowRegistration(true)}
                    className="border-white/15 text-white hover:bg-white/5 text-base px-8 py-6 h-auto font-semibold backdrop-blur transition-all duration-300">
                    Create Account
                  </Button>
                </div>
              </div>

              {/* Stat cards */}
              <div className="hidden lg:grid grid-cols-2 gap-4">
                {stats.map((s, i) => (
                  <div key={i}
                    className="hero-line-3 bg-white/5 border border-white/8 rounded-2xl p-6 text-center backdrop-blur-sm hover:bg-white/8 transition-colors card-hover-lift"
                    style={{ animationDelay: `${0.6 + i * 0.1}s` }}>
                    <p className="text-3xl font-black text-blue-400 mb-1">{s.value}</p>
                    <p className="text-sm text-slate-400">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0b0f1a] to-transparent pointer-events-none" />
        </div>

        {/* ── TRUST BAR — scrolling marquee ── */}
        <div className="border-y border-white/5 bg-white/[0.02] py-5 overflow-hidden">
          <div className="flex items-center gap-1">
            <div className="marquee-track flex items-center gap-12 whitespace-nowrap">
              {["Nigeria","Kenya","South Africa","UAE","United Kingdom","United States","Canada","Singapore","Ghana","India","Australia","Germany","France","Brazil","Japan","Netherlands"].concat(
               ["Nigeria","Kenya","South Africa","UAE","United Kingdom","United States","Canada","Singapore","Ghana","India","Australia","Germany","France","Brazil","Japan","Netherlands"]
              ).map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-500">
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-sm font-medium">{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
          <Reveal className="text-center mb-16">
            <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20 uppercase tracking-widest px-4 py-1 text-xs">
              How It Works
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Up and Running in 5 Steps</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">A straightforward onboarding flow gets your entire organization onto the platform quickly.</p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
            {howToSteps.map((step, i) => (
              <Reveal key={i} delay={i * 100} direction="up">
                <div className="flex flex-col items-center text-center group card-hover-lift">
                  <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}>
                    <step.icon className="w-9 h-9 text-white" />
                  </div>
                  <div className="w-8 h-8 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-3 text-xs font-black text-slate-500">
                    {step.step}
                  </div>
                  <h3 className="font-bold text-white mb-2 text-sm leading-tight">{step.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{step.description}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Reporting chain visual */}
          <Reveal>
            <div className="bg-gradient-to-br from-blue-950/50 to-violet-950/30 rounded-3xl border border-white/5 p-10">
              <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-500 mb-8">The Reporting Chain</p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {[
                  { label: "Employee", sub: "Submits Report", icon: User, gradient: "from-blue-500 to-blue-700" },
                  { label: "Supervisor", sub: "Reviews & Rates", icon: Users, gradient: "from-emerald-500 to-emerald-700" },
                  { label: "Manager", sub: "Monitors Team", icon: Briefcase, gradient: "from-violet-500 to-violet-700" },
                  { label: "Executive", sub: "Sees Full Picture", icon: Crown, gradient: "from-amber-500 to-orange-600" },
                ].map((step, i, arr) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="flex flex-col items-center text-center w-24">
                      <div className={`w-14 h-14 bg-gradient-to-br ${step.gradient} rounded-xl flex items-center justify-center mb-2 shadow-lg`}>
                        <step.icon className="h-6 w-6 text-white" />
                      </div>
                      <p className="font-semibold text-white text-xs">{step.label}</p>
                      <p className="text-xs text-slate-500">{step.sub}</p>
                    </div>
                    {i < arr.length - 1 && (
                      <ArrowRight className="h-5 w-5 text-slate-600 shrink-0 hidden sm:block" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* ── HIGHLIGHTS ── */}
        <div className="bg-white/[0.02] border-y border-white/5 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-14">
              <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20 uppercase tracking-widest px-4 py-1 text-xs">
                Platform Highlights
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">Why Organizations Choose Us</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-violet-500 mx-auto rounded-full" />
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {highlights.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Reveal key={i} delay={i * 120} direction="up">
                    <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-8 card-hover-lift h-full">
                      <div className={`w-14 h-14 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mb-5 shadow-lg`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">{item.stat}</p>
                      <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                      <p className="text-slate-400 leading-relaxed text-sm">{item.description}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── FEATURES GRID ── */}
        <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
          <Reveal className="text-center mb-14">
            <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20 uppercase tracking-widest px-4 py-1 text-xs">
              Full Feature Set
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">Everything Your Team Needs</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">A complete workflow engine for structured accountability at every level.</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <Reveal key={i} delay={i * 60} direction="up">
                <div className="flex gap-4 p-5 bg-white/[0.03] rounded-xl border border-white/8 card-hover-lift group h-full">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-500/20 transition-colors">
                    <f.icon className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm mb-1">{f.title}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">{f.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ── ROLES ── */}
        <div id="roles" className="bg-white/[0.02] border-y border-white/5 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-16">
              <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20 uppercase tracking-widest px-4 py-1 text-xs">
                Role Breakdown
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">What Each Position Does</h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">Every role has a clearly defined scope. Here is exactly what each level can see, do, and access.</p>
            </Reveal>

            <div className="space-y-6">
              {roleSections.map((r, i) => {
                const Icon = r.icon;
                return (
                  <Reveal key={i} delay={i * 100} direction="left">
                    <div className={`bg-white/[0.03] border border-white/8 rounded-2xl p-8 card-hover-lift ring-1 ${r.ring}`}>
                      <div className="flex flex-col lg:flex-row gap-8">
                        <div className="lg:w-64 shrink-0">
                          <div className="flex items-center gap-4 mb-4">
                            <div className={`w-14 h-14 bg-gradient-to-br ${r.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                              <Icon className="w-7 h-7 text-white" />
                            </div>
                            <div>
                              <h3 className={`text-xl font-black ${r.textColor}`}>{r.role}</h3>
                              <p className="text-xs text-slate-500 font-medium">{r.tagline}</p>
                            </div>
                          </div>
                          <p className="text-slate-400 text-sm leading-relaxed">{r.description}</p>
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <p className={`text-xs font-bold uppercase tracking-widest ${r.textColor} mb-3 flex items-center gap-1.5`}>
                              <CheckCircle className="w-3.5 h-3.5" /> Responsibilities
                            </p>
                            <ul className="space-y-2">
                              {r.responsibilities.map((item, j) => (
                                <li key={j} className="flex items-start gap-2 text-sm text-slate-300">
                                  <div className={`w-1.5 h-1.5 ${r.dot} rounded-full mt-2 shrink-0`} />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-3 flex items-center gap-1.5">
                              <Lock className="w-3.5 h-3.5" /> Access Restrictions
                            </p>
                            <ul className="space-y-2">
                              {r.cannot.map((item, j) => (
                                <li key={j} className="flex items-start gap-2 text-sm text-slate-500">
                                  <X className="w-4 h-4 mt-0.5 shrink-0 text-red-500/50" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── PRICING ── */}
        <div id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
          <Reveal className="text-center mb-16">
            <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20 uppercase tracking-widest px-4 py-1 text-xs">
              Pricing
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">All plans include a 14-day free trial — no credit card required.</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {pricingTiers.map((tier, i) => (
              <Reveal key={i} delay={i * 100} direction="up">
                <div className={`relative rounded-2xl p-6 border transition-all duration-300
                  ${tier.highlight
                    ? "bg-blue-600 border-blue-500 pricing-popular-glow"
                    : "bg-white/[0.03] border-white/8 hover:border-white/15"}`}>
                  {tier.highlight && (
                    <>
                      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                        <div className="shimmer-card absolute inset-0" />
                      </div>
                      <div className="absolute -top-4 left-0 right-0 flex justify-center">
                        <span className="inline-flex items-center gap-1 bg-white text-blue-700 text-xs font-black px-3 py-1 rounded-full shadow-lg">
                          <Zap className="w-3 h-3" /> Most Popular
                        </span>
                      </div>
                    </>
                  )}
                  <div className="relative">
                    <h3 className={`text-lg font-black mb-1 ${tier.highlight ? "text-white" : "text-white"}`}>{tier.name}</h3>
                    <p className={`text-xs mb-5 leading-snug ${tier.highlight ? "text-blue-100" : "text-slate-500"}`}>{tier.tagline}</p>
                    <div className="flex items-end gap-1 mb-1">
                      <span className={`text-4xl font-black ${tier.highlight ? "text-white" : "text-white"}`}>{tier.price}</span>
                      <span className={`text-sm mb-1.5 ${tier.highlight ? "text-blue-200" : "text-slate-500"}`}>{tier.period}</span>
                    </div>
                    <p className={`text-xs mb-6 ${tier.highlight ? "text-blue-200" : "text-slate-500"}`}>{tier.users}</p>

                    <Button className={`w-full mb-6 font-semibold transition-all duration-200 hover:scale-[1.02]
                      ${tier.highlight
                        ? "bg-white text-blue-700 hover:bg-blue-50"
                        : "bg-blue-600 hover:bg-blue-500 text-white border-0"}`}
                      onClick={() => setShowRegistration(true)}>
                      {tier.price === "Custom" ? "Contact Us" : "Start Free Trial"}
                    </Button>

                    <ul className="space-y-2.5">
                      {tier.features.map((f, j) => (
                        <li key={j} className={`flex items-start gap-2 text-sm ${tier.highlight ? "text-blue-100" : "text-slate-400"}`}>
                          <Check className={`w-4 h-4 shrink-0 mt-0.5 ${tier.highlight ? "text-white" : "text-blue-500"}`} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={400}>
            <div className="mt-10 bg-white/[0.03] border border-white/8 rounded-2xl p-8 text-center">
              <PieChart className="w-10 h-10 text-blue-400 mx-auto mb-3" />
              <h4 className="text-xl font-bold text-white mb-2">Need a custom arrangement?</h4>
              <p className="text-slate-400 text-sm mb-5 max-w-xl mx-auto">Government bodies, NGOs, and enterprise organizations with specific compliance requirements can reach out for a tailored package.</p>
              <Button variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 font-semibold">
                Contact Our Team
              </Button>
            </div>
          </Reveal>
        </div>

        {/* ── PARTNERS ── */}
        <div id="partners" className="bg-white/[0.02] border-y border-white/5 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-16">
              <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20 uppercase tracking-widest px-4 py-1 text-xs">
                Partner Organizations
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Organizations on the Platform</h2>
              <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">Leading companies across industries and continents use THE SUPERVISOR to drive accountability and build high-performing teams.</p>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
              {partners.map((p, i) => (
                <Reveal key={i} delay={i * 70} direction="up">
                  <div className="bg-white/[0.03] border border-white/8 rounded-xl p-5 card-hover-lift">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 bg-gradient-to-br ${p.gradient} rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg shrink-0`}>
                        {p.initials}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.industry}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin className="w-3 h-3" />
                      <span className="text-xs">{p.location}</span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <div className="text-center">
                <p className="text-slate-600 text-sm mb-5">And many more organizations across 30+ countries</p>
                <Button onClick={() => setShowRegistration(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 shadow-xl shadow-blue-500/20 hover:scale-105 transition-all duration-300">
                  <Handshake className="w-4 h-4 mr-2" /> Join as a Partner Organization
                </Button>
              </div>
            </Reveal>
          </div>
        </div>

        {/* ── TESTIMONIALS ── */}
        <div id="testimonials" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
          <Reveal className="text-center mb-16">
            <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20 uppercase tracking-widest px-4 py-1 text-xs">
              Testimonials
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">What Leaders Are Saying</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">Real feedback from executives, managers, and operations leaders who rely on THE SUPERVISOR every day.</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Reveal key={i} delay={i * 80} direction="up">
                <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-7 card-hover-lift flex flex-col h-full">
                  <Quote className="w-7 h-7 text-blue-500/30 mb-4 shrink-0" />
                  <p className="text-slate-300 text-sm leading-relaxed mb-6 flex-1">"{t.quote}"</p>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(t.rating)].map((_, s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <div className={`w-10 h-10 bg-gradient-to-br ${t.gradient} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                      {t.initials}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.title}, {t.company}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ── FAQ ── */}
        <div id="faq" className="bg-white/[0.02] border-y border-white/5 py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-14">
              <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20 uppercase tracking-widest px-4 py-1 text-xs">
                FAQ
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-slate-400 max-w-xl mx-auto">Everything you need to know before bringing THE SUPERVISOR to your organization.</p>
            </Reveal>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <Reveal key={i} delay={i * 40} direction="up">
                  <div className={`bg-white/[0.03] border rounded-xl overflow-hidden transition-colors duration-300 ${openFaq === i ? "border-blue-500/30" : "border-white/8 hover:border-white/15"}`}>
                    <button
                      className="w-full flex items-center justify-between gap-4 p-5 text-left"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                      <div className="flex items-start gap-3">
                        <HelpCircle className="w-4.5 h-4.5 text-blue-500 shrink-0 mt-0.5 w-5 h-5" />
                        <span className="font-semibold text-white text-sm leading-snug">{faq.q}</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180 text-blue-400" : ""}`} />
                    </button>
                    <div className={`faq-answer ${openFaq === i ? "open" : ""}`}>
                      <div className="px-5 pb-5 ml-8 text-slate-400 text-sm leading-relaxed">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={300} className="mt-10 text-center">
              <p className="text-slate-500 text-sm mb-4">Still have questions? We're happy to help.</p>
              <Button variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 font-semibold"
                onClick={() => window.location.href = "/login"}>
                Sign In & Explore the Platform
              </Button>
            </Reveal>
          </div>
        </div>

        {/* ── LOGIN PORTALS ── */}
        <div id="login-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
          <Reveal className="text-center mb-14">
            <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20 uppercase tracking-widest px-4 py-1 text-xs">
              Access Your Workspace
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Login Portals</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">Select your role to enter your specialized performance management environment.</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roleCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <Reveal key={i} delay={i * 100} direction="up">
                  <div
                    className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 card-hover-lift cursor-pointer group"
                    onClick={() => handleRoleBasedLogin(card.role)}>
                    <div className={`w-14 h-14 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{card.title}</h3>
                    <p className="text-slate-400 text-xs mb-5 leading-relaxed">{card.description}</p>
                    <ul className="space-y-1.5 mb-6">
                      {card.features.map((f, fi) => (
                        <li key={fi} className="flex items-center gap-2 text-xs text-slate-400">
                          <div className="w-1 h-1 bg-blue-500 rounded-full shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button className={`w-full bg-gradient-to-r ${card.gradient} text-white font-bold hover:opacity-90 group-hover:scale-[1.02] transition-all duration-300 shadow-lg`}
                      onClick={(e) => { e.stopPropagation(); handleRoleBasedLogin(card.role); }}>
                      Enter Portal <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* ── FOOTER CTA ── */}
        <div className="relative overflow-hidden py-24">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-[#0b0f1a] to-violet-950" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="float-a absolute top-10 left-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
            <div className="float-b absolute bottom-10 right-20 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
          </div>
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <Reveal>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20">
                <Award className="w-9 h-9 text-white" />
              </div>
              <h3 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                Ready to bring accountability<br className="hidden sm:block" /> to your team?
              </h3>
              <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join your organization's reporting platform and start contributing to a structured, transparent, and evidence-based workflow today.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" onClick={() => setShowRegistration(true)}
                  className="glow-pulse bg-blue-600 hover:bg-blue-500 text-white px-10 py-6 h-auto text-lg font-bold shadow-xl shadow-blue-500/30 hover:scale-105 transition-all duration-300">
                  Create Your Account
                </Button>
                <Button size="lg" variant="outline" onClick={() => window.location.href = "/login"}
                  className="border-white/15 text-white hover:bg-white/5 px-10 py-6 h-auto text-lg font-semibold">
                  Sign In
                </Button>
              </div>
            </Reveal>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="border-t border-white/5 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-black text-white text-sm">THE SUPERVISOR</span>
              </div>
              <div className="flex flex-wrap gap-6 text-sm text-slate-600">
                <a href="/login" className="hover:text-white transition-colors">Sign In</a>
                <button onClick={() => setShowRegistration(true)} className="hover:text-white transition-colors">Register</button>
                <span>Performance & Reporting Platform</span>
              </div>
              <p className="text-xs text-slate-700">© 2026 THE SUPERVISOR. All rights reserved.</p>
            </div>
          </div>
        </footer>

      </div>

      {showRegistration && <UserRegistrationModal onClose={() => setShowRegistration(false)} />}
    </>
  );
}
