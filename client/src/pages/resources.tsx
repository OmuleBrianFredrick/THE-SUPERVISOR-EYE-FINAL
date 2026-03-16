import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Briefcase, Users, FileText, CheckCircle, Clock, AlertCircle, TrendingUp } from "lucide-react";
import type { User } from "@shared/schema";

export default function Resources() {
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
    usersByRole: { role: string; count: number }[];
    totalReports: number;
    approvedReports: number;
    avgRating: number;
    reportsByStatus: { status: string; count: number }[];
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

  const employees = allUsers.filter(u => u.role === "employee");
  const supervisors = allUsers.filter(u => u.role === "supervisor");
  const managers = allUsers.filter(u => u.role === "manager");

  const pendingCount = analytics?.reportsByStatus.find(s => s.status === "pending")?.count ?? 0;
  const approvedCount = analytics?.approvedReports ?? 0;
  const totalReports = analytics?.totalReports ?? 0;

  const ROLE_COLORS: Record<string, string> = {
    executive: "bg-red-100 text-red-700",
    manager: "bg-purple-100 text-purple-700",
    supervisor: "bg-blue-100 text-blue-700",
    employee: "bg-green-100 text-green-700",
  };

  // Supervisor → their employees mapping
  const supervisorTeams: Record<string, User[]> = {};
  employees.forEach(emp => {
    const supId = emp.supervisorId ?? "unassigned";
    if (!supervisorTeams[supId]) supervisorTeams[supId] = [];
    supervisorTeams[supId].push(emp);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <Briefcase className="w-8 h-8 text-manager" />
              <h2 className="text-3xl font-bold text-gray-900">Resource Planning</h2>
              <Badge className="role-manager text-white">Manager View</Badge>
            </div>
            <p className="text-gray-600">Team capacity, workload distribution, and reporting activity</p>
          </div>

          {/* Capacity Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Employees", value: employees.length, icon: Users, color: "text-green-600", bg: "bg-green-50" },
              { label: "Supervisors", value: supervisors.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Pending Reports", value: pendingCount, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
              { label: "Avg. Rating", value: analytics?.avgRating ? analytics.avgRating.toFixed(1) : "—", icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Team Distribution */}
            <Card className="shadow-sm border border-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-600" />
                  Team Distribution by Role
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(analytics?.usersByRole ?? []).map(({ role, count }) => (
                    <div key={role} className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize w-24 text-center shrink-0 ${ROLE_COLORS[role] ?? "bg-gray-100 text-gray-600"}`}>
                        {role}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3">
                        <div
                          className="bg-blue-500 h-3 rounded-full transition-all"
                          style={{ width: allUsers.length > 0 ? `${(count / allUsers.length) * 100}%` : "0%" }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 w-8 text-right shrink-0">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Report Workload */}
            <Card className="shadow-sm border border-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  Reporting Workload
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(analytics?.reportsByStatus ?? []).map(({ status, count }) => {
                    const icons: Record<string, any> = {
                      pending: Clock,
                      approved: CheckCircle,
                      needs_revision: AlertCircle,
                    };
                    const colors: Record<string, string> = {
                      pending: "text-yellow-600",
                      approved: "text-green-600",
                      needs_revision: "text-orange-600",
                      rejected: "text-red-600",
                    };
                    const Icon = icons[status] ?? FileText;
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 shrink-0 ${colors[status] ?? "text-gray-600"}`} />
                        <span className="text-sm text-gray-600 capitalize w-28 shrink-0">{status.replace("_", " ")}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                          <div
                            className="bg-blue-500 h-2.5 rounded-full"
                            style={{ width: totalReports > 0 ? `${(count / totalReports) * 100}%` : "0%" }}
                          />
                        </div>
                        <span className="text-sm font-medium w-6 text-right shrink-0">{count}</span>
                      </div>
                    );
                  })}
                  {(analytics?.reportsByStatus ?? []).length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">No report data yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Supervisor Team Breakdown */}
          <Card className="shadow-sm border border-gray-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-gray-600" />
                Supervisor Team Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {supervisors.length > 0 ? (
                <div className="space-y-4">
                  {supervisors.map(sup => {
                    const team = supervisorTeams[sup.id] ?? [];
                    return (
                      <div key={sup.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-semibold text-gray-900">{sup.firstName} {sup.lastName}</p>
                            <p className="text-sm text-gray-500">{sup.department ?? "No dept."} · Supervisor</p>
                          </div>
                          <Badge variant="outline" className="text-blue-600">
                            {team.length} direct report{team.length !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                        {team.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {team.map(emp => (
                              <span key={emp.id} className="px-2 py-0.5 bg-white border border-gray-200 rounded-full text-xs text-gray-700">
                                {emp.firstName} {emp.lastName}
                              </span>
                            ))}
                          </div>
                        )}
                        {team.length === 0 && (
                          <p className="text-sm text-gray-400 italic">No direct reports assigned</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No supervisors in the system yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
