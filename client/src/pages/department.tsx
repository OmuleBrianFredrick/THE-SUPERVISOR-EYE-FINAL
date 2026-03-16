import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { PieChart, Users, FileText, TrendingUp, Building2 } from "lucide-react";
import type { User, Report } from "@shared/schema";

export default function Department() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) window.location.href = "/login";
  }, [isAuthenticated, isLoading]);

  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/users/all"],
    enabled: !!isAuthenticated,
  });

  const { data: analytics } = useQuery<{
    reportsByStatus: { status: string; count: number }[];
    reportsByType: { type: string; count: number }[];
    totalReports: number;
    approvedReports: number;
    avgRating: number;
  }>({
    queryKey: ["/api/analytics"],
    enabled: !!isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
      </div>
    );
  }

  // Group users by department
  const deptMap: Record<string, User[]> = {};
  allUsers.forEach(u => {
    const dept = u.department || "Unassigned";
    if (!deptMap[dept]) deptMap[dept] = [];
    deptMap[dept].push(u);
  });

  const departments = Object.entries(deptMap).sort((a, b) => b[1].length - a[1].length);

  const roleColors: Record<string, string> = {
    executive: "bg-red-100 text-red-700",
    manager: "bg-purple-100 text-purple-700",
    supervisor: "bg-blue-100 text-blue-700",
    employee: "bg-green-100 text-green-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <PieChart className="w-8 h-8 text-manager" />
              <h2 className="text-3xl font-bold text-gray-900">Department Overview</h2>
              <Badge className="role-manager text-white">Manager View</Badge>
            </div>
            <p className="text-gray-600">Team composition and department-level performance breakdown</p>
          </div>

          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Staff", value: allUsers.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Departments", value: departments.length, icon: Building2, color: "text-purple-600", bg: "bg-purple-50" },
              { label: "Total Reports", value: analytics?.totalReports ?? 0, icon: FileText, color: "text-gray-600", bg: "bg-gray-50" },
              { label: "Approval Rate", value: analytics && analytics.totalReports > 0 ? `${Math.round((analytics.approvedReports / analytics.totalReports) * 100)}%` : "—", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
            ].map(stat => (
              <Card key={stat.label} className="shadow-sm border border-gray-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                      <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Department Cards */}
          {departments.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {departments.map(([dept, members]) => {
                const roleSummary: Record<string, number> = {};
                members.forEach(m => {
                  roleSummary[m.role] = (roleSummary[m.role] ?? 0) + 1;
                });

                return (
                  <Card key={dept} className="shadow-sm border border-gray-100">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-gray-500" />
                          {dept}
                        </CardTitle>
                        <Badge variant="outline" className="text-gray-600">
                          {members.length} {members.length === 1 ? "member" : "members"}
                        </Badge>
                      </div>
                      {/* Role breakdown pills */}
                      <div className="flex gap-2 flex-wrap pt-1">
                        {Object.entries(roleSummary).map(([role, cnt]) => (
                          <span key={role} className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors[role] ?? "bg-gray-100 text-gray-600"}`}>
                            {cnt} {role}{cnt > 1 ? "s" : ""}
                          </span>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {members.map(member => (
                          <div key={member.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {member.firstName} {member.lastName}
                              </p>
                              <p className="text-xs text-gray-500">{member.email}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors[member.role] ?? "bg-gray-100 text-gray-600"}`}>
                              {member.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="shadow-sm border border-gray-100">
              <CardContent className="text-center py-16">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No department data available yet</p>
                <p className="text-sm text-gray-400">Users will appear here once they've set their department</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
