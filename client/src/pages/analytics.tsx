import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart3,
  FileText,
  CheckCircle,
  Star,
  Users,
  TrendingUp,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  approved: "#10b981",
  needs_revision: "#3b82f6",
  rejected: "#ef4444",
};

const TYPE_COLORS: Record<string, string> = {
  weekly: "#6366f1",
  project: "#8b5cf6",
  goal_review: "#10b981",
  special: "#f59e0b",
};

const ROLE_COLORS: Record<string, string> = {
  employee: "#10b981",
  supervisor: "#3b82f6",
  manager: "#8b5cf6",
  executive: "#ef4444",
};

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  sub,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  sub?: string;
}) {
  return (
    <Card className="shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function Analytics() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({ title: "Unauthorized", description: "You are logged out. Logging in again...", variant: "destructive" });
      setTimeout(() => { window.location.href = "/api/login"; }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: analytics, isLoading: analyticsLoading } = useQuery<{
    reportsByStatus: { status: string; count: number }[];
    reportsByType: { type: string; count: number }[];
    usersByRole: { role: string; count: number }[];
    totalReports: number;
    approvedReports: number;
    avgRating: number;
  }>({
    queryKey: ["/api/analytics"],
    enabled: !!user && (user.role === 'supervisor' || user.role === 'manager' || user.role === 'executive'),
  });

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user.role === 'employee') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
                  <p className="text-gray-600">Analytics are available to supervisors, managers, and executives.</p>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  const approvalRate = analytics && analytics.totalReports > 0
    ? Math.round((analytics.approvedReports / analytics.totalReports) * 100)
    : 0;

  const statusData = (analytics?.reportsByStatus || []).map(d => ({
    ...d,
    name: d.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
    fill: STATUS_COLORS[d.status] || "#94a3b8",
  }));

  const typeData = (analytics?.reportsByType || []).map(d => ({
    ...d,
    name: d.type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
  }));

  const roleData = (analytics?.usersByRole || []).map(d => ({
    ...d,
    name: d.role.charAt(0).toUpperCase() + d.role.slice(1),
    fill: ROLE_COLORS[d.role] || "#94a3b8",
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold text-gray-900">Analytics</h2>
              <Badge className="bg-primary text-white">Live Data</Badge>
            </div>
            <p className="text-gray-600">
              Performance insights and reporting trends across your organization.
            </p>
          </div>

          {analyticsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  title="Total Reports"
                  value={analytics?.totalReports || 0}
                  icon={FileText}
                  color="bg-blue-100 text-blue-600"
                />
                <StatCard
                  title="Approved Reports"
                  value={analytics?.approvedReports || 0}
                  icon={CheckCircle}
                  color="bg-green-100 text-green-600"
                />
                <StatCard
                  title="Approval Rate"
                  value={`${approvalRate}%`}
                  icon={TrendingUp}
                  color="bg-purple-100 text-purple-600"
                />
                <StatCard
                  title="Avg Rating"
                  value={analytics?.avgRating ? analytics.avgRating.toFixed(1) : "N/A"}
                  icon={Star}
                  color="bg-amber-100 text-amber-600"
                  sub="out of 5.0"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Reports by Type */}
                <Card className="shadow-sm border border-gray-100">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Reports by Type
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {typeData.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <BarChart3 className="h-12 w-12 mb-3 opacity-40" />
                        <p>No report data yet</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={typeData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
                          />
                          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {typeData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={Object.values(TYPE_COLORS)[index % Object.values(TYPE_COLORS).length]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                {/* Reports by Status */}
                <Card className="shadow-sm border border-gray-100">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Report Status Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {statusData.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <CheckCircle className="h-12 w-12 mb-3 opacity-40" />
                        <p>No report data yet</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={CustomPieLabel}
                            outerRadius={100}
                            dataKey="count"
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value, name) => [value, name]}
                            contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
                          />
                          <Legend
                            formatter={(value) => <span style={{ fontSize: 13 }}>{value}</span>}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* User Distribution by Role */}
              <Card className="shadow-sm border border-gray-100">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Workforce Distribution by Role
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {roleData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                      <Users className="h-12 w-12 mb-3 opacity-40" />
                      <p>No user data yet</p>
                    </div>
                  ) : (
                    <div className="flex flex-col lg:flex-row items-center gap-8">
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={roleData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" tick={{ fontSize: 13 }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
                          <Tooltip
                            contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
                          />
                          <Bar dataKey="count" name="Users" radius={[4, 4, 0, 0]}>
                            {roleData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>

                      <div className="flex flex-col gap-3 min-w-[180px]">
                        {roleData.map((d) => (
                          <div key={d.role} className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: ROLE_COLORS[d.role.toLowerCase()] || "#94a3b8" }} />
                            <span className="text-sm text-gray-700 capitalize flex-1">{d.name}</span>
                            <span className="text-sm font-semibold text-gray-900">{d.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
