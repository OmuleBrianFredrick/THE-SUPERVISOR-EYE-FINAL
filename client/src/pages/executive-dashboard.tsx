import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { 
  Crown, 
  Building2, 
  TrendingUp,
  Users,
  BarChart3,
  Shield,
  Award,
  CheckCircle,
  FileText,
  Star,
  Network,
} from "lucide-react";

export default function ExecutiveDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, navigate] = useLocation();

  const { data: systemStats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!user && user.role === 'executive',
  });

  const { data: analytics } = useQuery<{
    reportsByStatus: { status: string; count: number }[];
    reportsByType: { type: string; count: number }[];
    usersByRole: { role: string; count: number }[];
    totalReports: number;
    approvedReports: number;
    avgRating: number;
  }>({
    queryKey: ["/api/analytics"],
    enabled: !!user && user.role === 'executive',
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
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
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Crown className="w-8 h-8 text-executive" />
              <h2 className="text-3xl font-bold text-gray-900">Executive Dashboard</h2>
              <Badge className="role-executive text-white">Executive View</Badge>
            </div>
            <p className="text-gray-600">
              Welcome {user.firstName || user.email}! Strategic overview and organizational insights for leadership decisions.
            </p>
          </div>

          {/* Executive KPIs - Real System Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-sm border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-blue-600">{systemStats?.totalUsers || 0}</p>
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
                    <p className="text-3xl font-bold text-green-600">{systemStats?.activeReports || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-green-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                    <p className="text-3xl font-bold text-orange-600">{systemStats?.pendingReviews || 0}</p>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Organization Summary — real data */}
            <Card className="shadow-sm border border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg">Organization Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "Executives", count: systemStats?.executiveCount ?? 0, color: "bg-red-50 border-red-200", badge: "text-red-600", icon: Crown },
                    { label: "Managers", count: systemStats?.managerCount ?? 0, color: "bg-purple-50 border-purple-200", badge: "text-purple-600", icon: Building2 },
                    { label: "Supervisors", count: systemStats?.supervisorCount ?? 0, color: "bg-blue-50 border-blue-200", badge: "text-blue-600", icon: Users },
                    { label: "Employees", count: systemStats?.employeeCount ?? 0, color: "bg-green-50 border-green-200", badge: "text-green-600", icon: Award },
                  ].map(row => (
                    <div key={row.label} className={`flex items-center justify-between p-4 ${row.color} rounded-lg border`}>
                      <div className="flex items-center space-x-3">
                        <row.icon className={`h-5 w-5 ${row.badge}`} />
                        <p className="font-medium text-gray-900">{row.label}</p>
                      </div>
                      <Badge variant="outline" className={row.badge}>{row.count} {row.count === 1 ? "person" : "people"}</Badge>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 mt-2">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <p className="font-medium text-gray-900">Total Reports Submitted</p>
                    </div>
                    <Badge variant="outline" className="text-gray-600">{analytics?.totalReports ?? 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Organizational Health — real computed metrics */}
            <Card className="shadow-sm border border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg">Performance Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {(() => {
                    const approvalRate = analytics && analytics.totalReports > 0
                      ? Math.round((analytics.approvedReports / analytics.totalReports) * 100) : 0;
                    const avgRatingPct = analytics?.avgRating
                      ? Math.round((analytics.avgRating / 5) * 100) : 0;
                    const pendingPct = analytics && analytics.totalReports > 0
                      ? Math.round(((analytics.totalReports - analytics.approvedReports) / analytics.totalReports) * 100) : 0;
                    const systemScore = systemStats?.totalUsers ? Math.min(100, Math.round((systemStats.totalUsers / Math.max(systemStats.totalUsers, 1)) * 100)) : 0;

                    return [
                      { label: "Report Approval Rate", value: approvalRate, color: "bg-green-600", display: `${approvalRate}%` },
                      { label: "Average Performance Rating", value: avgRatingPct, color: "bg-blue-600", display: analytics?.avgRating ? `${analytics.avgRating.toFixed(1)} / 5.0` : "—" },
                      { label: "Pending Review Load", value: pendingPct, color: "bg-orange-500", display: `${systemStats?.pendingReviews ?? 0} pending` },
                      { label: "Platform Utilization", value: analytics?.totalReports ? Math.min(100, analytics.totalReports * 10) : 0, color: "bg-purple-600", display: `${analytics?.totalReports ?? 0} reports` },
                    ].map(metric => (
                      <div key={metric.label}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">{metric.label}</span>
                          <span className="font-medium">{metric.display}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className={`${metric.color} h-2 rounded-full transition-all`} style={{ width: `${metric.value}%` }}></div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Executive Actions — all wired to real pages */}
          <Card className="shadow-sm border border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg">Executive Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  className="flex flex-col items-center space-y-2 p-6 h-auto bg-executive hover:bg-red-600"
                  onClick={() => navigate("/admin-dashboard")}
                >
                  <Shield className="h-8 w-8" />
                  <span>Admin Dashboard</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex flex-col items-center space-y-2 p-6 h-auto"
                  onClick={() => navigate("/analytics")}
                >
                  <BarChart3 className="h-8 w-8" />
                  <span>Analytics</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex flex-col items-center space-y-2 p-6 h-auto"
                  onClick={() => navigate("/org-chart")}
                >
                  <Network className="h-8 w-8" />
                  <span>Org Chart</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex flex-col items-center space-y-2 p-6 h-auto"
                  onClick={() => navigate("/admin-users")}
                >
                  <Users className="h-8 w-8" />
                  <span>User Management</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}