import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Reports from "@/pages/reports";
import Team from "@/pages/team";
import Settings from "@/pages/settings";
import Analytics from "@/pages/analytics";
import OrgChart from "@/pages/org-chart";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminUsers from "@/pages/admin-users";
import EmployeeDashboard from "@/pages/employee-dashboard";
import SupervisorDashboard from "@/pages/supervisor-dashboard";
import ManagerDashboard from "@/pages/manager-dashboard";
import ExecutiveDashboard from "@/pages/executive-dashboard";
import Goals from "@/pages/goals";
import Performance from "@/pages/performance";
import Reviews from "@/pages/reviews";
import Department from "@/pages/department";
import Resources from "@/pages/resources";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import Tasks from "@/pages/tasks";
import Timeline from "@/pages/timeline";
import CompleteProfile from "@/pages/complete-profile";
import NotFound from "@/pages/not-found";
import SessionWarning from "@/components/session-warning";

function RoleRedirect() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (user) {
      const routes: Record<string, string> = {
        employee: "/employee-dashboard",
        supervisor: "/supervisor-dashboard",
        manager: "/manager-dashboard",
        executive: "/executive-dashboard",
      };
      navigate(routes[user.role] || "/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600" />
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <Switch>
      {/* Auth pages — always accessible */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/complete-profile" component={CompleteProfile} />

      {/* Public landing */}
      <Route path="/landing" component={Landing} />

      {isAuthenticated ? (
        <>
          <Route path="/" component={RoleRedirect} />

          {/* Role dashboards */}
          <Route path="/employee-dashboard" component={EmployeeDashboard} />
          <Route path="/supervisor-dashboard" component={SupervisorDashboard} />
          <Route path="/manager-dashboard" component={ManagerDashboard} />
          <Route path="/executive-dashboard" component={ExecutiveDashboard} />
          <Route path="/admin-dashboard" component={AdminDashboard} />
          <Route path="/admin-users" component={AdminUsers} />

          {/* Role-specific feature pages */}
          <Route path="/goals" component={Goals} />
          <Route path="/performance" component={Performance} />
          <Route path="/reviews" component={Reviews} />
          <Route path="/department" component={Department} />
          <Route path="/resources" component={Resources} />

          {/* Common pages */}
          <Route path="/reports" component={Reports} />
          <Route path="/tasks" component={Tasks} />
          <Route path="/timeline" component={Timeline} />
          <Route path="/team" component={Team} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/settings" component={Settings} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/org-chart" component={OrgChart} />
        </>
      ) : (
        <Route path="/" component={Login} />
      )}

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <SessionWarning />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
