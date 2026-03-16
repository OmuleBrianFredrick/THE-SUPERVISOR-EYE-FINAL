import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  Users,
  BarChart3,
  TrendingUp,
  FileText,
  Star,
  CheckCircle,
  Network,
} from "lucide-react";
import type { User } from "@shared/schema";

export default function ManagerDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, navigate] = useLocation();

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

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
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
    enabled: !!user,
  });

  const { data: allUsers } = useQuery<User[]>({
    queryKey: ["/api/users/all"],
    enabled: !!user,
  });

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Compute real department stats from user list
  const departmentMap: Record<string, { employees: number; supervisors: number; managers: number }> = {};
  (allUsers || []).forEach(u => {
    if (!u.department) return;
    if (!departmentMap[u.department]) departmentMap[u.department] = { employees: 0, supervisors: 0, managers: 0 };
    if (u.role === "employee") departmentMap[u.department].employees++;
    if (u.role === "supervisor") departmentMap[u.department].supervisors++;
    if (u.role === "manager") departmentMap[u.department].managers++;
  });
  const departments = Object.entries(departmentMap).map(([name, counts]) => ({ name, ...counts }));
  const departmentCount = departments.length || Object.keys(departmentMap).length;

  // Real computed metrics
  const approvalRate = analytics && analytics.totalReports > 0
    ? Math.round((analytics.approvedReports / analytics.totalReports) * 100)
    : 0;

  const avgRatingPct = analytics && analytics.avgRating > 0
    ? Math.round((analytics.avgRating / 5) * 100)
    : 0;

  const completionRate = stats && (stats.completedReports + stats.pendingReviews) > 0
    ? Math.round((stats.completedReports / (stats.completedReports + stats.pendingReviews)) * 100)
    : 0;

  const DEPT_COLORS = [
    { bg: "bg-blue-50", border: "border-blue-100", badge: "text-blue-600" },
    { bg: "bg-green-50", border: "border-green-100", badge: "text-green-600" },
    { bg: "bg-purple-50", border: "border-purple-100", badge: "text-purple-600" },
    { bg: "bg-orange-50", border: "border-orange-100", badge: "text-orange-600" },
    { bg: "bg-pink-50", border: "border-pink-100", badge: "text-pink-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Building className="w-8 h-8 text-manager" />
              <h2 className="text-3xl font-bold text-gray-900">Manager Dashboard</h2>
              <Badge className="role-manager text-white">Manager View</Badge>
            </div>
            <p className="text-gray-600">
              Welcome {user.firstName || user.email}! Oversee multiple teams, departments, and strategic initiatives.
            </p>
          </div>

          {/* Manager Stats — all real */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-sm border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Departments</p>
                    <p className="text-3xl font-bold text-gray-900">{departmentCount || (allUsers ? "—" : "…")}</p>
                    <p className="text-xs text-gray-400 mt-1">with assigned members</p>
                  </div>
                  <div className="w-12 h-12 bg-manager bg-opacity-10 rounded-lg flex items-center justify-center">
                    <Building className="text-manager h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Reports</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics?.totalReports ?? 0}</p>
                    <p className="text-xs text-gray-400 mt-1">{analytics?.approvedReports ?? 0} approved</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="text-blue-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Team Members</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.teamMembers ?? 0}</p>
                    <p className="text-xs text-gray-400 mt-1">direct reports</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="text-green-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approval Rate</p>
                    <p className={`text-3xl font-bold ${approvalRate >= 75 ? "text-green-600" : approvalRate >= 50 ? "text-orange-500" : "text-red-500"}`}>
                      {analytics ? `${approvalRate}%` : "—"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">reports approved</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-green-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Department Overview — real data */}
            <Card className="shadow-sm border border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg">Department Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {departments.length > 0 ? (
                  <div className="space-y-3">
                    {departments.slice(0, 5).map((dept, i) => {
                      const c = DEPT_COLORS[i % DEPT_COLORS.length];
                      const total = dept.employees + dept.supervisors + dept.managers;
                      return (
                        <div key={dept.name} className={`flex items-center justify-between p-4 ${c.bg} rounded-lg border ${c.border}`}>
                          <div>
                            <p className="font-medium text-gray-900 capitalize">{dept.name.replace("-", " ")}</p>
                            <p className="text-sm text-gray-600">
                              {dept.employees} {dept.employees === 1 ? "employee" : "employees"}
                              {dept.supervisors > 0 && `, ${dept.supervisors} supervisor${dept.supervisors > 1 ? "s" : ""}`}
                            </p>
                          </div>
                          <Badge variant="outline" className={c.badge}>{total} total</Badge>
                        </div>
                      );
                    })}
                    {departments.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No departments assigned yet</p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Building className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <p>No department data available yet.</p>
                    <p className="text-sm text-gray-400 mt-1">Assign departments to users in User Management.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Strategic Metrics — computed from real data */}
            <Card className="shadow-sm border border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Report Approval Rate</span>
                      <span className="font-medium">{analytics ? `${approvalRate}%` : "—"}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full transition-all" style={{ width: `${approvalRate}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Average Team Rating</span>
                      <span className="font-medium">
                        {analytics?.avgRating ? `${analytics.avgRating.toFixed(1)} / 5.0` : "—"}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${avgRatingPct}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Review Completion</span>
                      <span className="font-medium">{stats ? `${completionRate}%` : "—"}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full transition-all" style={{ width: `${completionRate}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Pending Reviews</span>
                      <span className="font-medium">{stats?.pendingReviews ?? "—"}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all"
                        style={{ width: stats?.pendingReviews ? `${Math.min((stats.pendingReviews / Math.max(analytics?.totalReports || 1, 1)) * 100, 100)}%` : "0%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Manager Actions — all wired to real pages */}
          <Card className="shadow-sm border border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg">Manager Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  className="flex flex-col items-center space-y-2 p-6 h-auto bg-manager hover:bg-orange-600"
                  onClick={() => navigate("/team")}
                >
                  <Users className="h-8 w-8" />
                  <span>Team Overview</span>
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
                  onClick={() => navigate("/reports")}
                >
                  <CheckCircle className="h-8 w-8" />
                  <span>Review Reports</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
