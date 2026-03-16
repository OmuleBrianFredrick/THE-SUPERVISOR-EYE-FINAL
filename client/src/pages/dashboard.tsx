import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import StatsCards from "@/components/dashboard/stats-cards";
import RecentReports from "@/components/dashboard/recent-reports";
import QuickActions from "@/components/dashboard/quick-actions";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {user.firstName || user.email}
            </h2>
            <p className="text-gray-600">
              {user.role === 'employee' 
                ? "Here's your performance overview." 
                : "Here's what's happening with your team today."}
            </p>
          </div>

          {/* Quick Stats */}
          <StatsCards />

          {/* Recent Reports & Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <RecentReports />
            
            {/* Performance Chart Placeholder */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
              </div>
              <div className="p-6">
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <i className="fas fa-chart-line text-4xl mb-4"></i>
                    <p>Performance Chart</p>
                    <p className="text-sm mt-2">Coming Soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <QuickActions />
        </main>
      </div>
    </div>
  );
}
