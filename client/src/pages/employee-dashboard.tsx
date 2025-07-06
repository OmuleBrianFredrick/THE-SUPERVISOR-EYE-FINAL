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
  User, 
  FileText, 
  Clock, 
  CheckCircle,
  Star,
  TrendingUp,
  Calendar,
  Award
} from "lucide-react";

export default function EmployeeDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

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

  const { data: recentReports } = useQuery({
    queryKey: ["/api/reports", { limit: 5 }],
  });

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const performanceLevel = stats?.myAverageRating > 4 ? "Excellent" : 
                          stats?.myAverageRating > 3 ? "Good" : 
                          stats?.myAverageRating > 2 ? "Average" : "Improving";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <User className="w-8 h-8 text-employee" />
              <h2 className="text-3xl font-bold text-gray-900">Employee Dashboard</h2>
              <Badge className="role-employee text-white">Employee View</Badge>
            </div>
            <p className="text-gray-600">
              Welcome {user.firstName || user.email}! Track your performance, submit reports, and monitor your progress.
            </p>
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-sm border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">My Reports</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.myReports || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-employee bg-opacity-10 rounded-lg flex items-center justify-center">
                    <FileText className="text-employee h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.myAverageRating?.toFixed(1) || "0.0"}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Star className="text-yellow-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Performance</p>
                    <p className="text-3xl font-bold text-green-600">{performanceLevel}</p>
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
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <p className="text-3xl font-bold text-gray-900">Active</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="text-blue-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Reports */}
            <Card className="shadow-sm border border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg">My Recent Reports</CardTitle>
              </CardHeader>
              <CardContent>
                {recentReports && recentReports.length > 0 ? (
                  <div className="space-y-4">
                    {recentReports.slice(0, 3).map((report: any) => (
                      <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{report.title}</p>
                          <p className="text-sm text-gray-600 capitalize">{report.type.replace('_', ' ')}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={report.status === 'approved' ? 'default' : 'secondary'}>
                            {report.status}
                          </Badge>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(report.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No reports submitted yet</p>
                    <Button className="mt-4" onClick={() => window.location.href = "/reports"}>
                      Create Your First Report
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Goals */}
            <Card className="shadow-sm border border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg">Performance Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Award className="h-6 w-6 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">Submit Weekly Reports</p>
                        <p className="text-sm text-gray-600">Keep your supervisor updated</p>
                      </div>
                    </div>
                    <Badge variant="outline">On Track</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Star className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">Maintain 4+ Rating</p>
                        <p className="text-sm text-gray-600">Achieve excellent performance</p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {stats?.myAverageRating > 4 ? "Achieved" : "In Progress"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-6 w-6 text-orange-600" />
                      <div>
                        <p className="font-medium text-gray-900">Complete Projects</p>
                        <p className="text-sm text-gray-600">Meet all deadlines</p>
                      </div>
                    </div>
                    <Badge variant="outline">Ongoing</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="shadow-sm border border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  className="flex flex-col items-center space-y-2 p-6 h-auto"
                  onClick={() => window.location.href = "/reports"}
                >
                  <FileText className="h-8 w-8" />
                  <span>Create Report</span>
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex flex-col items-center space-y-2 p-6 h-auto"
                  onClick={() => window.location.href = "/reports"}
                >
                  <Clock className="h-8 w-8" />
                  <span>View Reports</span>
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex flex-col items-center space-y-2 p-6 h-auto"
                >
                  <TrendingUp className="h-8 w-8" />
                  <span>Performance</span>
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex flex-col items-center space-y-2 p-6 h-auto"
                >
                  <Award className="h-8 w-8" />
                  <span>Goals</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}