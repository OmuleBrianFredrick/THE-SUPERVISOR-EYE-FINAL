import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Reports from "@/pages/reports";
import Team from "@/pages/team";
import Settings from "@/pages/settings";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminUsers from "@/pages/admin-users";
import EmployeeDashboard from "@/pages/employee-dashboard";
import SupervisorDashboard from "@/pages/supervisor-dashboard";
import ManagerDashboard from "@/pages/manager-dashboard";
import ExecutiveDashboard from "@/pages/executive-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Post-login routing based on intended role
  const getInitialRoute = () => {
    const intendedRole = sessionStorage.getItem('intended_role');
    sessionStorage.removeItem('intended_role'); // Clear after use
    
    if (intendedRole) {
      switch (intendedRole) {
        case 'employee': return '/employee-dashboard';
        case 'supervisor': return '/supervisor-dashboard';
        case 'manager': return '/manager-dashboard';
        case 'executive': return '/executive-dashboard';
        default: return '/';
      }
    }
    
    // Default routing based on user role
    if (user) {
      switch (user.role) {
        case 'employee': return '/employee-dashboard';
        case 'supervisor': return '/supervisor-dashboard';
        case 'manager': return '/manager-dashboard';
        case 'executive': return '/executive-dashboard';
        default: return '/';
      }
    }
    
    return '/';
  };

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={() => {
            const route = getInitialRoute();
            if (route !== '/') {
              window.location.href = route;
              return <div>Redirecting...</div>;
            }
            return <Dashboard />;
          }} />
          
          {/* Role-specific Dashboards */}
          <Route path="/admin-dashboard" component={AdminDashboard} />
          <Route path="/admin-users" component={AdminUsers} />
          <Route path="/employee-dashboard" component={EmployeeDashboard} />
          <Route path="/supervisor-dashboard" component={SupervisorDashboard} />
          <Route path="/manager-dashboard" component={ManagerDashboard} />
          <Route path="/executive-dashboard" component={ExecutiveDashboard} />
          
          {/* Common Pages */}
          <Route path="/reports" component={Reports} />
          <Route path="/team" component={Team} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/settings" component={Settings} />
        </>
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
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
