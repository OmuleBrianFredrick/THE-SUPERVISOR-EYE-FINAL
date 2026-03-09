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
  Crown, 
  Building2, 
  TrendingUp, 
  DollarSign,
  Users,
  BarChart3,
  Shield,
  Globe,
  Award,
  Target
} from "lucide-react";

export default function ExecutiveDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  const { data: systemStats } = useQuery({
    queryKey: ["/api/admin/stats"],
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
            {/* Strategic Objectives */}
            <Card className="shadow-sm border border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg">Strategic Objectives</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <Target className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">Q4 Revenue Target</p>
                        <p className="text-sm text-gray-600">$2.5M milestone</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600">On Track</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <Users className="h-6 w-6 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">Team Expansion</p>
                        <p className="text-sm text-gray-600">Hire 25 new employees</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-blue-600">In Progress</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-3">
                      <Globe className="h-6 w-6 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">Market Expansion</p>
                        <p className="text-sm text-gray-600">Enter 3 new markets</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-purple-600">Planning</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center space-x-3">
                      <Award className="h-6 w-6 text-orange-600" />
                      <div>
                        <p className="font-medium text-gray-900">Innovation Initiative</p>
                        <p className="text-sm text-gray-600">Launch 2 new products</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-orange-600">Research</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Organizational Health */}
            <Card className="shadow-sm border border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg">Organizational Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Leadership Effectiveness</span>
                      <span className="font-medium">96%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Innovation Index</span>
                      <span className="font-medium">88%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '88%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Culture Alignment</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Digital Transformation</span>
                      <span className="font-medium">84%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-executive h-2 rounded-full" style={{ width: '84%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Risk Management</span>
                      <span className="font-medium">98%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '98%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Executive Actions */}
          <Card className="shadow-sm border border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg">Executive Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  className="flex flex-col items-center space-y-2 p-6 h-auto bg-executive hover:bg-red-600"
                  onClick={() => window.location.href = "/admin-dashboard"}
                >
                  <Shield className="h-8 w-8" />
                  <span>Admin Dashboard</span>
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex flex-col items-center space-y-2 p-6 h-auto"
                >
                  <BarChart3 className="h-8 w-8" />
                  <span>Strategic Analytics</span>
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex flex-col items-center space-y-2 p-6 h-auto"
                >
                  <Building2 className="h-8 w-8" />
                  <span>Organizational Design</span>
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex flex-col items-center space-y-2 p-6 h-auto"
                >
                  <TrendingUp className="h-8 w-8" />
                  <span>Growth Strategy</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}