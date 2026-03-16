import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  User, 
  FileText, 
  Clock, 
  CheckCircle,
  Star,
  TrendingUp,
  Calendar,
  Award,
  Plus,
  Trash2,
  ChevronRight,
  Target,
} from "lucide-react";
import type { Goal } from "@shared/schema";

const STATUS_CYCLE: Record<string, string> = {
  not_started: "in_progress",
  in_progress: "completed",
  completed: "not_started",
};

const STATUS_LABELS: Record<string, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
};

const STATUS_COLORS: Record<string, string> = {
  not_started: "bg-gray-50 border-gray-200 text-gray-600",
  in_progress: "bg-blue-50 border-blue-200 text-blue-600",
  completed: "bg-green-50 border-green-200 text-green-600",
};

const STATUS_BADGE: Record<string, string> = {
  not_started: "text-gray-500",
  in_progress: "text-blue-600",
  completed: "text-green-600",
};

export default function EmployeeDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, navigate] = useLocation();
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [addingGoal, setAddingGoal] = useState(false);

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

  const { data: myGoals, isLoading: goalsLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
    enabled: !!isAuthenticated,
  });

  const createGoalMutation = useMutation({
    mutationFn: (title: string) =>
      apiRequest("POST", "/api/goals", { title, status: "not_started" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setNewGoalTitle("");
      setAddingGoal(false);
    },
    onError: () => {
      toast({ title: "Failed to create goal", variant: "destructive" });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest("PATCH", `/api/goals/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
    onError: () => {
      toast({ title: "Failed to update goal", variant: "destructive" });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/goals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
    onError: () => {
      toast({ title: "Failed to delete goal", variant: "destructive" });
    },
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

  const completedGoals = myGoals?.filter(g => g.status === "completed").length ?? 0;
  const totalGoals = myGoals?.length ?? 0;

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
                    <p className="text-3xl font-bold text-gray-900">
                      {stats?.myAverageRating ? stats.myAverageRating.toFixed(1) : "—"}
                    </p>
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
                    <p className="text-sm font-medium text-gray-600">Goals Completed</p>
                    <p className="text-3xl font-bold text-gray-900">{completedGoals}/{totalGoals}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Target className="text-green-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Performance</p>
                    <p className="text-3xl font-bold text-gray-900">{performanceLevel}</p>
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
                    <Button className="mt-4" onClick={() => navigate("/reports")}>
                      Create Your First Report
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Goals — fully data-driven */}
            <Card className="shadow-sm border border-gray-100">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">My Goals</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAddingGoal(true)}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Goal
                </Button>
              </CardHeader>
              <CardContent>
                {/* Add goal inline form */}
                {addingGoal && (
                  <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Input
                      placeholder="Enter goal title..."
                      value={newGoalTitle}
                      onChange={e => setNewGoalTitle(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" && newGoalTitle.trim()) {
                          createGoalMutation.mutate(newGoalTitle.trim());
                        }
                        if (e.key === "Escape") {
                          setAddingGoal(false);
                          setNewGoalTitle("");
                        }
                      }}
                      autoFocus
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      disabled={!newGoalTitle.trim() || createGoalMutation.isPending}
                      onClick={() => {
                        if (newGoalTitle.trim()) createGoalMutation.mutate(newGoalTitle.trim());
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { setAddingGoal(false); setNewGoalTitle(""); }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                {goalsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : myGoals && myGoals.length > 0 ? (
                  <div className="space-y-3">
                    {myGoals.map((goal) => (
                      <div
                        key={goal.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${STATUS_COLORS[goal.status ?? "not_started"]}`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Award className="h-5 w-5 shrink-0" />
                          <p className="font-medium text-gray-900 truncate">{goal.title}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            title="Click to advance status"
                            onClick={() =>
                              updateGoalMutation.mutate({
                                id: goal.id,
                                status: STATUS_CYCLE[goal.status ?? "not_started"],
                              })
                            }
                            className="flex items-center gap-1"
                          >
                            <Badge
                              variant="outline"
                              className={`cursor-pointer hover:opacity-80 ${STATUS_BADGE[goal.status ?? "not_started"]}`}
                            >
                              {STATUS_LABELS[goal.status ?? "not_started"]}
                              <ChevronRight className="h-3 w-3 ml-1" />
                            </Badge>
                          </button>
                          <button
                            title="Delete goal"
                            onClick={() => deleteGoalMutation.mutate(goal.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-3">No goals set yet</p>
                    <Button variant="outline" onClick={() => setAddingGoal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Goal
                    </Button>
                  </div>
                )}
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
                  onClick={() => navigate("/reports")}
                >
                  <FileText className="h-8 w-8" />
                  <span>Submit Report</span>
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex flex-col items-center space-y-2 p-6 h-auto"
                  onClick={() => navigate("/reports")}
                >
                  <Clock className="h-8 w-8" />
                  <span>View My Reports</span>
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex flex-col items-center space-y-2 p-6 h-auto"
                  onClick={() => navigate("/reports")}
                >
                  <TrendingUp className="h-8 w-8" />
                  <span>My Performance</span>
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex flex-col items-center space-y-2 p-6 h-auto"
                  onClick={() => navigate("/settings")}
                >
                  <Award className="h-8 w-8" />
                  <span>My Profile</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
