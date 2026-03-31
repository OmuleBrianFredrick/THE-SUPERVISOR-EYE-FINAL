import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User2,
  Trash2,
  ArrowRight,
  Flame,
} from "lucide-react";
import type { TaskWithRelations } from "@shared/schema";

const STATUS_META: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-800", icon: ArrowRight },
  completed: { label: "Completed", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-600", icon: AlertCircle },
};

const PRIORITY_META: Record<string, { label: string; color: string }> = {
  normal: { label: "Normal", color: "bg-gray-100 text-gray-700" },
  high: { label: "High", color: "bg-orange-100 text-orange-700" },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-700" },
};

const NEXT_STATUS: Record<string, string> = {
  pending: "in_progress",
  in_progress: "completed",
};

function CreateTaskModal({ onClose, subordinates }: { onClose: () => void; subordinates: any[] }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "normal",
    deadline: "",
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/tasks", data),
    onSuccess: () => {
      toast({ title: "Task assigned successfully" });
      qc.invalidateQueries({ queryKey: ["/api/tasks"] });
      qc.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      onClose();
    },
    onError: (err: any) => {
      toast({ title: "Failed to create task", description: err.message, variant: "destructive" });
    },
  });

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.assignedTo) {
      toast({ title: "Title and assignee are required", variant: "destructive" });
      return;
    }
    createMutation.mutate(form);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-blue-600" />
            Assign New Task
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Task Title *</Label>
            <Input
              placeholder="e.g. Complete Q3 sales report"
              value={form.title}
              onChange={e => set("title", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              placeholder="Describe what needs to be done..."
              rows={3}
              value={form.description}
              onChange={e => set("description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Assign To *</Label>
              <Select value={form.assignedTo} onValueChange={v => set("assignedTo", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {subordinates.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={v => set("priority", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Deadline</Label>
            <Input
              type="date"
              value={form.deadline}
              onChange={e => set("deadline", e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Assigning..." : "Assign Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TaskCard({
  task,
  canManage,
  userId,
}: {
  task: TaskWithRelations;
  canManage: boolean;
  userId: string;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const statusMeta = STATUS_META[task.status || "pending"];
  const priorityMeta = PRIORITY_META[task.priority || "normal"];
  const StatusIcon = statusMeta.icon;
  const nextStatus = NEXT_STATUS[task.status || "pending"];

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", `/api/tasks/${task.id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Task updated" });
    },
    onError: () => toast({ title: "Failed to update task", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/tasks/${task.id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Task removed" });
    },
    onError: () => toast({ title: "Failed to delete task", variant: "destructive" }),
  });

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{task.title}</h3>
            {task.description && (
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{task.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {task.priority !== "normal" && (
              <Flame className={`h-4 w-4 ${task.priority === "urgent" ? "text-red-500" : "text-orange-500"}`} />
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <Badge className={`${statusMeta.color} border-0 text-xs flex items-center gap-1`}>
            <StatusIcon className="h-3 w-3" />
            {statusMeta.label}
          </Badge>
          <Badge className={`${priorityMeta.color} border-0 text-xs`}>{priorityMeta.label}</Badge>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          {(task.assignee || task.assigner) && (
            <div className="flex items-center gap-1">
              <User2 className="h-3.5 w-3.5" />
              {canManage
                ? `${task.assignee?.firstName || ""} ${task.assignee?.lastName || ""}`.trim() || "Unassigned"
                : `From: ${task.assigner?.firstName || ""} ${task.assigner?.lastName || ""}`.trim()}
            </div>
          )}
          {task.deadline && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Due: {new Date(task.deadline).toLocaleDateString()}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {/* Employee: advance status */}
          {!canManage && nextStatus && task.status !== "completed" && task.status !== "cancelled" && (
            <Button
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs"
              onClick={() => updateMutation.mutate({ status: nextStatus })}
              disabled={updateMutation.isPending}
            >
              {nextStatus === "in_progress" ? "Start Task" : "Mark Complete"}
            </Button>
          )}

          {/* Supervisor: cancel or delete */}
          {canManage && task.assignedBy === userId && (
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Remove
            </Button>
          )}

          {task.status === "completed" && (
            <div className="flex items-center gap-1 text-green-600 text-xs">
              <CheckCircle2 className="h-4 w-4" />
              Done
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Tasks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: taskList = [], isLoading } = useQuery<TaskWithRelations[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: subordinates = [] } = useQuery<any[]>({
    queryKey: ["/api/team"],
    enabled: user?.role !== "employee",
  });

  if (!user) return null;

  const canManage = user.role !== "employee";

  const filtered = statusFilter === "all"
    ? taskList
    : taskList.filter(t => t.status === statusFilter);

  const counts = {
    all: taskList.length,
    pending: taskList.filter(t => t.status === "pending").length,
    in_progress: taskList.filter(t => t.status === "in_progress").length,
    completed: taskList.filter(t => t.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {canManage ? "Task Management" : "My Tasks"}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {canManage
                  ? "Assign and track tasks across your team"
                  : "Tasks assigned to you by your supervisor"}
              </p>
            </div>
            {canManage && (
              <Button
                onClick={() => {
                  if (subordinates.length === 0) {
                    toast({ title: "No team members found", description: "You need team members linked to you to assign tasks.", variant: "destructive" });
                    return;
                  }
                  setShowCreateModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Assign Task
              </Button>
            )}
          </div>

          {/* Status filter tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {(["all", "pending", "in_progress", "completed"] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  statusFilter === s
                    ? "bg-blue-600 text-white shadow"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
                }`}
              >
                {s === "all" ? "All" : s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
                <span className="ml-1.5 text-xs opacity-70">({counts[s as keyof typeof counts] ?? 0})</span>
              </button>
            ))}
          </div>

          {/* Task grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-5">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
                    <div className="h-6 bg-gray-200 rounded w-1/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  canManage={canManage}
                  userId={user.id}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <ClipboardList className="h-14 w-14 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-1">
                  {statusFilter === "all" ? "No tasks yet" : `No ${statusFilter.replace("_", " ")} tasks`}
                </h3>
                <p className="text-gray-500 text-sm">
                  {canManage
                    ? "Click 'Assign Task' to create and delegate work to your team."
                    : "Tasks assigned by your supervisor will appear here."}
                </p>
                {canManage && (
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Assign First Task
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {showCreateModal && (
        <CreateTaskModal onClose={() => setShowCreateModal(false)} subordinates={subordinates} />
      )}
    </div>
  );
}
