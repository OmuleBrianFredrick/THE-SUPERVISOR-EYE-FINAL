import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CalendarClock, Plus, Trash2, Edit2, CheckCircle2, Circle } from "lucide-react";

type Meeting = {
  id: number;
  organizationId: number | null;
  organizerUserId: string;
  attendeeUserId: string;
  title: string;
  agenda: string | null;
  notes: string | null;
  scheduledAt: string;
  status: string;
  createdAt: string;
};

type TeamMember = { id: string; firstName?: string; lastName?: string; email?: string };

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  scheduled: { label: "Scheduled", color: "text-blue-700", bg: "bg-blue-100" },
  completed: { label: "Completed", color: "text-green-700", bg: "bg-green-100" },
  canceled: { label: "Canceled", color: "text-gray-700", bg: "bg-gray-100" },
};

export default function MeetingsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [isLoading, isAuthenticated]);

  const meetingsQuery = useQuery<Meeting[]>({
    queryKey: ["/api/meetings"],
    enabled: isAuthenticated,
  });

  const teamQuery = useQuery<TeamMember[]>({
    queryKey: ["/api/team"],
    enabled: isAuthenticated,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Meeting | null>(null);
  const [form, setForm] = useState({
    attendeeUserId: "",
    title: "",
    agenda: "",
    notes: "",
    scheduledAt: "",
    status: "scheduled",
  });

  const resetForm = () =>
    setForm({ attendeeUserId: "", title: "", agenda: "", notes: "", scheduledAt: "", status: "scheduled" });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/meetings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meetings"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Meeting scheduled" });
    },
    onError: (e: any) => toast({ title: "Failed to schedule", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest("PATCH", `/api/meetings/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meetings"] });
      setDialogOpen(false);
      setEditing(null);
      resetForm();
      toast({ title: "Meeting updated" });
    },
    onError: (e: any) => toast({ title: "Failed to update", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/meetings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meetings"] });
      toast({ title: "Meeting removed" });
    },
  });

  const openCreate = () => {
    setEditing(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (m: Meeting) => {
    setEditing(m);
    setForm({
      attendeeUserId: m.attendeeUserId,
      title: m.title,
      agenda: m.agenda || "",
      notes: m.notes || "",
      scheduledAt: m.scheduledAt ? new Date(m.scheduledAt).toISOString().slice(0, 16) : "",
      status: m.status,
    });
    setDialogOpen(true);
  };

  const submit = () => {
    if (!form.title.trim()) return toast({ title: "Title is required", variant: "destructive" });
    if (!form.attendeeUserId) return toast({ title: "Pick a teammate", variant: "destructive" });
    if (!form.scheduledAt) return toast({ title: "Pick a date and time", variant: "destructive" });

    const payload = {
      ...form,
      scheduledAt: new Date(form.scheduledAt).toISOString(),
    };
    if (editing) updateMutation.mutate({ id: editing.id, ...payload });
    else createMutation.mutate(payload);
  };

  const meetings = meetingsQuery.data || [];
  const team = (teamQuery.data || []).filter((m) => m.id !== user?.id);
  const memberName = (id: string) => {
    const m = team.find((t) => t.id === id) || (id === user?.id ? user : null);
    if (!m) return "Unknown";
    const name = `${m.firstName || ""} ${m.lastName || ""}`.trim();
    return name || m.email || "Teammate";
  };

  const upcoming = meetings.filter((m) => new Date(m.scheduledAt) >= new Date() && m.status === "scheduled");
  const past = meetings.filter((m) => !(new Date(m.scheduledAt) >= new Date() && m.status === "scheduled"));

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <CalendarClock className="w-7 h-7 text-primary" />
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">1-on-1 Meetings</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Schedule, track, and take notes on your one-on-ones.
                </p>
              </div>
            </div>
            <Button onClick={openCreate} data-testid="button-schedule-meeting">
              <Plus className="w-4 h-4 mr-2" />
              Schedule meeting
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Stat label="Upcoming" value={upcoming.length} />
            <Stat label="Completed" value={meetings.filter((m) => m.status === "completed").length} />
            <Stat label="Total" value={meetings.length} />
          </div>

          <Section title="Upcoming">
            {meetingsQuery.isLoading ? (
              <Skeleton />
            ) : upcoming.length === 0 ? (
              <Empty text="No upcoming meetings. Schedule one to get started." />
            ) : (
              <div className="space-y-3">
                {upcoming.map((m) => (
                  <Row
                    key={m.id}
                    m={m}
                    name={memberName(m.attendeeUserId === user?.id ? m.organizerUserId : m.attendeeUserId)}
                    onEdit={() => openEdit(m)}
                    onDelete={() => deleteMutation.mutate(m.id)}
                  />
                ))}
              </div>
            )}
          </Section>

          <div className="mt-8">
            <Section title="Past & Other">
              {past.length === 0 ? (
                <Empty text="No past meetings yet." />
              ) : (
                <div className="space-y-3">
                  {past.map((m) => (
                    <Row
                      key={m.id}
                      m={m}
                      name={memberName(m.attendeeUserId === user?.id ? m.organizerUserId : m.attendeeUserId)}
                      onEdit={() => openEdit(m)}
                      onDelete={() => deleteMutation.mutate(m.id)}
                    />
                  ))}
                </div>
              )}
            </Section>
          </div>
        </main>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditing(null); resetForm(); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit meeting" : "Schedule a 1-on-1"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input
                placeholder="Weekly check-in"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                data-testid="input-meeting-title"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Teammate *</Label>
              <Select value={form.attendeeUserId} onValueChange={(v) => setForm({ ...form, attendeeUserId: v })}>
                <SelectTrigger data-testid="select-meeting-attendee">
                  <SelectValue placeholder="Pick a teammate" />
                </SelectTrigger>
                <SelectContent>
                  {team.length === 0 ? (
                    <SelectItem value="no-team" disabled>No teammates available</SelectItem>
                  ) : (
                    team.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {`${t.firstName || ""} ${t.lastName || ""}`.trim() || t.email || "Teammate"}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Date & time *</Label>
                <Input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                  data-testid="input-meeting-datetime"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Agenda</Label>
              <Textarea
                rows={3}
                placeholder="What's on the agenda?"
                value={form.agenda}
                onChange={(e) => setForm({ ...form, agenda: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea
                rows={3}
                placeholder="Notes or action items from the meeting"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={submit}
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-meeting"
              >
                {editing ? "Save changes" : "Schedule"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="shadow-sm border border-gray-100">
      <CardContent className="p-5">
        <p className="text-sm text-gray-600 font-medium">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Row({
  m,
  name,
  onEdit,
  onDelete,
}: {
  m: Meeting;
  name: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const meta = STATUS_META[m.status] || STATUS_META.scheduled;
  const Icon = m.status === "completed" ? CheckCircle2 : Circle;
  return (
    <Card className="shadow-sm border border-gray-100 hover:shadow-md transition-shadow" data-testid={`card-meeting-${m.id}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Icon className={`w-5 h-5 mt-0.5 ${meta.color}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-gray-900">{m.title}</h4>
                <Badge variant="outline" className={`${meta.bg} ${meta.color} border-none text-xs`}>
                  {meta.label}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                With <span className="font-medium text-gray-700">{name}</span> ·{" "}
                {new Date(m.scheduledAt).toLocaleString()}
              </p>
              {m.agenda && <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{m.agenda}</p>}
              {m.notes && (
                <p className="text-xs text-gray-500 mt-2 border-l-2 border-gray-200 pl-3 whitespace-pre-wrap">
                  Notes: {m.notes}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onEdit}
              className="text-gray-400 hover:text-blue-500 transition-colors p-1"
              data-testid={`button-edit-meeting-${m.id}`}
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
              data-testid={`button-delete-meeting-${m.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <Card className="shadow-sm border border-gray-100">
      <CardContent className="text-center py-12">
        <CalendarClock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">{text}</p>
      </CardContent>
    </Card>
  );
}
