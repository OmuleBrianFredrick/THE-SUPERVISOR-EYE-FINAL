import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
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
  Shield,
  Award,
  Settings
} from "lucide-react";

export default function ManagerDashboard() {
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
              <Building className="w-8 h-8 text-manager" />
              <h2 className="text-3xl font-bold text-gray-900">Manager Dashboard</h2>
              <Badge className="role-manager text-white">Manager View</Badge>
            </div>
            <p className="text-gray-600">
              Welcome {user.firstName || user.email}! Oversee multiple teams, departments, and strategic initiatives.
            </p>
          </div>

          {/* Manager Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-sm border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Departments</p>
                    <p className="text-3xl font-bold text-gray-900">3</p>
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
                    <p className="text-3xl font-bold text-gray-900">{stats?.completedReports || 0}</p>
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
                    <p className="text-3xl font-bold text-gray-900">{stats?.teamMembers || 0}</p>
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
                    <p className="text-sm font-medium text-gray-600">Efficiency</p>
                    <p className="text-3xl font-bold text-green-600">94%</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-green-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Department Overview */}
            <Card className="shadow-sm border border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg">Department Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Engineering</p>
                      <p className="text-sm text-gray-600">12 employees, 5 supervisors</p>
                    </div>
                    <Badge variant="outline" className="text-blue-600">Excellent</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Sales</p>
                      <p className="text-sm text-gray-600">8 employees, 3 supervisors</p>
                    </div>
                    <Badge variant="outline" className="text-green-600">Good</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Marketing</p>
                      <p className="text-sm text-gray-600">6 employees, 2 supervisors</p>
                    </div>
                    <Badge variant="outline" className="text-orange-600">Improving</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strategic Metrics */}
            <Card className="shadow-sm border border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg">Strategic Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Goal Achievement</span>
                      <span className="font-medium">87%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Team Satisfaction</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Project Delivery</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Budget Efficiency</span>
                      <span className="font-medium">94%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Manager Actions */}
          <Card className="shadow-sm border border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg">Manager Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  className="flex flex-col items-center space-y-2 p-6 h-auto bg-manager hover:bg-orange-600"
                  onClick={() => window.location.href = "/team"}
                >
                  <Users className="h-8 w-8" />
                  <span>Department Overview</span>
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex flex-col items-center space-y-2 p-6 h-auto"
                >
                  <BarChart3 className="h-8 w-8" />
                  <span>Analytics</span>
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex flex-col items-center space-y-2 p-6 h-auto"
                >
                  <Shield className="h-8 w-8" />
                  <span>Resource Allocation</span>
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex flex-col items-center space-y-2 p-6 h-auto"
                >
                  <Settings className="h-8 w-8" />
                  <span>Strategic Planning</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}