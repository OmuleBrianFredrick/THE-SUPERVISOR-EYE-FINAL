import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Shield, 
  Users, 
  Building, 
  Crown,
  UserCheck,
  BarChart3,
  Settings,
  Database,
  Activity
} from "lucide-react";

export default function AdminDashboard() {
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

  // Check if user has admin privileges (executive role)
  useEffect(() => {
    if (user && user.role !== 'executive') {
      toast({
        title: "Access Denied",
        description: "Admin dashboard is only accessible to executives.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [user, toast]);

  const { data: allUsers } = useQuery({
    queryKey: ["/api/admin/users"],
    retry: false,
  });

  const { data: systemStats } = useQuery({
    queryKey: ["/api/admin/stats"],
    retry: false,
  });

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user.role !== 'executive') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need executive privileges to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  const dashboardCards = [
    {
      title: "Employee Dashboard",
      description: "View employee-level performance and reports",
      icon: UserCheck,
      color: "role-employee",
      textColor: "text-employee",
      href: "/employee-dashboard",
      count: systemStats?.employeeCount || 0
    },
    {
      title: "Supervisor Dashboard", 
      description: "Manage team reports and performance reviews",
      icon: Users,
      color: "role-supervisor", 
      textColor: "text-supervisor",
      href: "/supervisor-dashboard",
      count: systemStats?.supervisorCount || 0
    },
    {
      title: "Manager Dashboard",
      description: "Oversee multiple teams and departments",
      icon: Building,
      color: "role-manager",
      textColor: "text-manager", 
      href: "/manager-dashboard",
      count: systemStats?.managerCount || 0
    },
    {
      title: "Executive Dashboard",
      description: "Strategic overview and organizational insights",
      icon: Crown,
      color: "role-executive",
      textColor: "text-executive",
      href: "/executive-dashboard", 
      count: systemStats?.executiveCount || 0
    }
  ];

  const adminActions = [
    {
      title: "User Management",
      description: "Manage user roles and permissions",
      icon: Users,
      action: () => window.location.href = "/admin/users"
    },
    {
      title: "System Analytics",
      description: "View comprehensive system metrics",
      icon: BarChart3,
      action: () => window.location.href = "/admin/analytics"
    },
    {
      title: "Database Management",
      description: "Monitor and manage database operations",
      icon: Database,
      action: () => window.location.href = "/admin/database"
    },
    {
      title: "System Settings",
      description: "Configure system-wide settings",
      icon: Settings,
      action: () => window.location.href = "/admin/settings"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-8 h-8 text-executive" />
              <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
              <Badge className="role-executive text-white">Executive Access</Badge>
            </div>
            <p className="text-gray-600">
              Central administration hub for THE SUPERVISOR platform. Monitor all organizational levels and system operations.
            </p>
          </div>

          {/* System Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-sm border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900">{systemStats?.totalUsers || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="text-blue-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Reports</p>
                    <p className="text-3xl font-bold text-gray-900">{systemStats?.activeReports || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Activity className="text-green-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                    <p className="text-3xl font-bold text-gray-900">{systemStats?.pendingReviews || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="text-orange-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">System Health</p>
                    <p className="text-3xl font-bold text-green-600">Excellent</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="text-green-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Role-based Dashboard Access */}
          <Card className="shadow-sm border border-gray-100 mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Role-based Dashboard Access</CardTitle>
              <p className="text-gray-600">Access dashboards for different organizational levels</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {dashboardCards.map((dashboard, index) => {
                  const Icon = dashboard.icon;
                  return (
                    <Card key={index} className="border-2 border-gray-200 hover:border-primary transition-colors cursor-pointer">
                      <CardContent className="p-6">
                        <div className="text-center">
                          <div className={`w-16 h-16 ${dashboard.color} bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4`}>
                            <Icon className={`h-8 w-8 ${dashboard.textColor}`} />
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2">{dashboard.title}</h3>
                          <p className="text-sm text-gray-600 mb-4">{dashboard.description}</p>
                          <Badge variant="outline" className="mb-4">{dashboard.count} Users</Badge>
                          <Button 
                            className="w-full" 
                            onClick={() => window.location.href = dashboard.href}
                          >
                            Access Dashboard
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Admin Actions */}
          <Card className="shadow-sm border border-gray-100">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Administrative Actions</CardTitle>
              <p className="text-gray-600">System management and configuration tools</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {adminActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className="flex flex-col items-center space-y-3 p-6 h-auto hover:border-primary hover:bg-blue-50"
                      onClick={action.action}
                    >
                      <Icon className="h-8 w-8 text-primary" />
                      <div className="text-center">
                        <p className="font-medium text-gray-900">{action.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}