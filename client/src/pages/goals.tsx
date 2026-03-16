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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Target,
  Plus,
  Trash2,
  ChevronRight,
  CheckCircle,
  Clock,
  Circle,
  TrendingUp,
  Edit2,
} from "lucide-react";
import type { Goal } from "@shared/schema";

const STATUS_CYCLE: Record<string, string> = {
  not_started: "in_progress",
  in_progress: "completed",
  completed: "not_started",
};

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  not_started: { label: "Not Started", color: "text-gray-500", bg: "bg-gray-100", icon: Circle },
  in_progress: { label: "In Progress", color: "text-blue-600", bg: "bg-blue-50", icon: Clock },
  completed: { label: "Completed", color: "text-green-600", bg: "bg-green-50", icon: CheckCircle },
};

export default function Goals() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, navigate] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [form, setForm] = useState({ title: "", description: "", status: "not_started" });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [isAuthenticated, isLoading]);

  const { data: goals = [], isLoading: goalsLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
    enabled: !!isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/goals", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setDialogOpen(false);
      setForm({ title: "", description: "", status: "not_started" });
      toast({ title: "Goal created successfully" });
    },
    onError: () => toast({ title: "Failed to create goal", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest("PATCH", `/api/goals/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setDialogOpen(false);
      setEditGoal(null);
      toast({ title: "Goal updated" });
    },
    onError: () => toast({ title: "Failed to update goal", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/goals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: "Goal deleted" });
    },
    onError: () => toast({ title: "Failed to delete goal", variant: "destructive" }),
  });

  const advanceStatus = (goal: Goal) => {
    updateMutation.mutate({ id: goal.id, status: STATUS_CYCLE[goal.status ?? "not_started"] });
  };

  const openCreate = () => {
    setEditGoal(null);
    setForm({ title: "", description: "", status: "not_started" });
    setDialogOpen(true);
  };

  const openEdit = (goal: Goal) => {
    setEditGoal(goal);
    setForm({ title: goal.title, description: goal.description ?? "", status: goal.status ?? "not_started" });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) {
      toast({ title: "Goal title is required", variant: "destructive" });
      return;
    }
    if (editGoal) {
      updateMutation.mutate({ id: editGoal.id, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
      </div>
    );
  }

  const counts = {
    all: goals.length,
    not_started: goals.filter(g => g.status === "not_started").length,
    in_progress: goals.filter(g => g.status === "in_progress").length,
    completed: goals.filter(g => g.status === "completed").length,
  };

  const filteredGoals = filterStatus === "all" ? goals : goals.filter(g => g.status === filterStatus);
  const completionRate = goals.length > 0 ? Math.round((counts.completed / goals.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-employee" />
              <div>
                <h2 className="text-3xl font-bold text-gray-900">My Goals</h2>
                <p className="text-gray-600">Track and manage your personal performance goals</p>
              </div>
            </div>
            <Button onClick={openCreate} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Goal
            </Button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Goals", value: counts.all, color: "text-gray-700", bg: "bg-white" },
              { label: "Not Started", value: counts.not_started, color: "text-gray-500", bg: "bg-white" },
              { label: "In Progress", value: counts.in_progress, color: "text-blue-600", bg: "bg-white" },
              { label: "Completed", value: counts.completed, color: "text-green-600", bg: "bg-white" },
            ].map(s => (
              <Card key={s.label} className="shadow-sm border border-gray-100">
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600 font-medium">{s.label}</p>
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Progress bar */}
          {goals.length > 0 && (
            <Card className="shadow-sm border border-gray-100 mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-gray-900">Overall Completion</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {counts.completed} of {goals.length} goals completed
                </p>
              </CardContent>
            </Card>
          )}

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { key: "all", label: `All (${counts.all})` },
              { key: "not_started", label: `Not Started (${counts.not_started})` },
              { key: "in_progress", label: `In Progress (${counts.in_progress})` },
              { key: "completed", label: `Completed (${counts.completed})` },
            ].map(tab => (
              <Button
                key={tab.key}
                variant={filterStatus === tab.key ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus(tab.key)}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Goals List */}
          {goalsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredGoals.length > 0 ? (
            <div className="space-y-3">
              {filteredGoals.map(goal => {
                const meta = STATUS_META[goal.status ?? "not_started"];
                const StatusIcon = meta.icon;
                return (
                  <Card key={goal.id} className="shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <StatusIcon className={`h-5 w-5 mt-0.5 shrink-0 ${meta.color}`} />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1">{goal.title}</h3>
                            {goal.description && (
                              <p className="text-sm text-gray-500">{goal.description}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              Created {new Date(goal.createdAt!).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => advanceStatus(goal)}
                            title="Click to advance status"
                            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${meta.bg} ${meta.color} hover:opacity-80 transition-opacity`}
                          >
                            {meta.label}
                            <ChevronRight className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => openEdit(goal)}
                            className="text-gray-400 hover:text-blue-500 transition-colors p-1"
                            title="Edit goal"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(goal.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            title="Delete goal"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="shadow-sm border border-gray-100">
              <CardContent className="text-center py-16">
                <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {filterStatus === "all" ? "No goals yet" : `No ${STATUS_META[filterStatus]?.label.toLowerCase()} goals`}
                </h3>
                <p className="text-gray-500 mb-6">
                  {filterStatus === "all"
                    ? "Start tracking your progress by adding your first goal."
                    : "Try a different filter or add a new goal."}
                </p>
                {filterStatus === "all" && (
                  <Button onClick={openCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Goal
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={open => { setDialogOpen(open); if (!open) setEditGoal(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editGoal ? "Edit Goal" : "Add New Goal"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Goal Title *</Label>
              <Input
                placeholder="e.g. Complete Q2 performance review"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="Add any details or context for this goal..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editGoal ? "Save Changes" : "Create Goal"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
