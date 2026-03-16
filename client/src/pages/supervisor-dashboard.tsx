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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  Clock, 
  CheckCircle, 
  Star,
  FileText,
  AlertCircle,
  TrendingUp,
  Award
} from "lucide-react";

export default function SupervisorDashboard() {
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

  const { data: teamMembers } = useQuery({
    queryKey: ["/api/team"],
    enabled: !!user && (user.role === 'supervisor' || user.role === 'manager' || user.role === 'executive'),
  });

  const { data: pendingReports } = useQuery({
    queryKey: ["/api/reports", { status: 'pending' }],
  });

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "employee": return "role-employee";
      case "supervisor": return "role-supervisor";
      case "manager": return "role-manager";
      case "executive": return "role-executive";
      default: return "bg-gray-500";
    }
  };

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-8 h-8 text-supervisor" />
              <h2 className="text-3xl font-bold text-gray-900">Supervisor Dashboard</h2>
              <Badge className="role-supervisor text-white">Supervisor View</Badge>
            </div>
            <p className="text-gray-600">
              Welcome {user.firstName || user.email}! Manage your team, review reports, and track performance metrics.
            </p>
          </div>

          {/* Supervisor Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-sm border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.pendingReviews || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="text-orange-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Team Members</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.teamMembers || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-supervisor bg-opacity-10 rounded-lg flex items-center justify-center">
                    <Users className="text-supervisor h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed Reviews</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.completedReports || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="text-green-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Team Avg Rating</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.averageRating?.toFixed(1) || "0.0"}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Star className="text-yellow-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Pending Reports */}
            <Card className="shadow-sm border border-gray-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Pending Reports</CardTitle>
                  <Badge variant="outline" className="text-orange-600">
                    {pendingReports?.length || 0} Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {pendingReports && pendingReports.length > 0 ? (
                  <div className="space-y-4">
                    {pendingReports.slice(0, 4).map((report: any) => (
                      <div key={report.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className={`${getRoleColor(report.employee?.role || 'employee')} text-white text-sm font-medium`}>
                              {getInitials(report.employee?.firstName, report.employee?.lastName, report.employee?.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">
                              {report.employee?.firstName} {report.employee?.lastName || report.employee?.email}
                            </p>
                            <p className="text-sm text-gray-600">{report.title}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Review Needed
                          </Badge>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(report.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <Button 
                      className="w-full mt-4" 
                      onClick={() => window.location.href = "/reports"}
                    >
                      Review All Reports
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-500">All reports are up to date!</p>
                    <p className="text-sm text-gray-400 mt-2">No pending reviews at the moment</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team Performance */}
            <Card className="shadow-sm border border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg">Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                {teamMembers && teamMembers.length > 0 ? (
                  <div className="space-y-4">
                    {teamMembers.slice(0, 4).map((member: any) => (
                      <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className={`${getRoleColor(member.role)} text-white text-sm font-medium`}>
                              {getInitials(member.firstName, member.lastName, member.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">
                              {member.firstName} {member.lastName || member.email}
                            </p>
                            <p className="text-sm text-gray-600 capitalize">{member.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-green-600">
                            Active
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      className="w-full mt-4" 
                      onClick={() => window.location.href = "/team"}
                    >
                      Manage Team
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No team members assigned</p>
                    <p className="text-sm text-gray-400 mt-2">Contact admin to assign team members</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="shadow-sm border border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg">Supervisor Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  className="flex flex-col items-center space-y-2 p-6 h-auto bg-orange-600 hover:bg-orange-700"
                  onClick={() => navigate("/reports")}
                >
                  <Clock className="h-8 w-8" />
                  <span>Review Reports</span>
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex flex-col items-center space-y-2 p-6 h-auto"
                  onClick={() => navigate("/team")}
                >
                  <Users className="h-8 w-8" />
                  <span>Manage Team</span>
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex flex-col items-center space-y-2 p-6 h-auto"
                  onClick={() => navigate("/analytics")}
                >
                  <TrendingUp className="h-8 w-8" />
                  <span>Team Analytics</span>
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex flex-col items-center space-y-2 p-6 h-auto"
                  onClick={() => navigate("/org-chart")}
                >
                  <Award className="h-8 w-8" />
                  <span>Org Chart</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}