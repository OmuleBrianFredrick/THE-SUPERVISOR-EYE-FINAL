import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  CheckCircle,
  AlertCircle,
  Clipboard,
  CheckSquare,
  Send,
  Star,
  Activity,
} from "lucide-react";

const ACTIVITY_META: Record<string, { icon: any; color: string; dotColor: string; label: string }> = {
  report_submitted: { icon: FileText, color: "text-blue-600", dotColor: "bg-blue-500", label: "Report Submitted" },
  report_approved: { icon: CheckCircle, color: "text-green-600", dotColor: "bg-green-500", label: "Report Approved" },
  report_revised: { icon: AlertCircle, color: "text-orange-600", dotColor: "bg-orange-500", label: "Revision Requested" },
  task_assigned: { icon: Clipboard, color: "text-purple-600", dotColor: "bg-purple-500", label: "Task Assigned" },
  task_completed: { icon: CheckSquare, color: "text-emerald-600", dotColor: "bg-emerald-500", label: "Task Completed" },
  task_created: { icon: Send, color: "text-blue-500", dotColor: "bg-blue-400", label: "Task Sent to Team" },
  report_reviewed_by_me: { icon: Star, color: "text-yellow-600", dotColor: "bg-yellow-500", label: "Report Reviewed" },
};

function groupByDay(activities: any[]): Record<string, any[]> {
  const groups: Record<string, any[]> = {};
  for (const a of activities) {
    const date = new Date(a.timestamp);
    const key = date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(a);
  }
  return groups;
}

function formatTime(ts: string | Date) {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  needs_revision: "bg-orange-100 text-orange-800",
  rejected: "bg-red-100 text-red-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-gray-100 text-gray-600",
};

export default function Timeline() {
  const { user } = useAuth();

  const { data: activities = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/timeline"],
  });

  if (!user) return null;

  const grouped = groupByDay(activities);
  const days = Object.keys(grouped);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="h-6 w-6 text-blue-600" />
              Activity Timeline
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Your complete history of reports, tasks, and reviews
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-40 mb-3" />
                  <div className="space-y-3">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="flex gap-3">
                        <div className="w-3 h-3 rounded-full bg-gray-200 mt-2 shrink-0" />
                        <div className="flex-1 h-16 bg-gray-200 rounded-lg" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : days.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Activity className="h-14 w-14 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-1">No activity yet</h3>
                <p className="text-gray-500 text-sm">
                  Your activities will appear here as you submit reports and complete tasks.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {days.map(day => (
                <div key={day}>
                  {/* Day heading */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {day}
                    </span>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>

                  {/* Activities for that day */}
                  <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-[7px] top-0 bottom-0 w-0.5 bg-gray-200" />

                    <div className="space-y-3">
                      {grouped[day].map((activity: any) => {
                        const meta = ACTIVITY_META[activity.type] || {
                          icon: Activity,
                          color: "text-gray-600",
                          dotColor: "bg-gray-400",
                          label: activity.type,
                        };
                        const Icon = meta.icon;

                        return (
                          <div key={activity.id} className="flex gap-4 relative">
                            {/* Dot */}
                            <div className={`w-4 h-4 rounded-full ${meta.dotColor} border-2 border-white shadow-sm mt-3 shrink-0 z-10`} />

                            {/* Card */}
                            <Card className="flex-1 shadow-none border border-gray-100 hover:border-gray-200 transition-colors">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Icon className={`h-4 w-4 shrink-0 ${meta.color}`} />
                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold text-gray-800">{meta.label}</p>
                                      <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {activity.status && STATUS_COLORS[activity.status] && (
                                      <Badge className={`${STATUS_COLORS[activity.status]} border-0 text-xs`}>
                                        {activity.status.replace("_", " ")}
                                      </Badge>
                                    )}
                                    <span className="text-xs text-gray-400">
                                      {formatTime(activity.timestamp)}
                                    </span>
                                  </div>
                                </div>

                                {/* Extra info */}
                                {activity.rating && (
                                  <p className="text-xs text-yellow-600 mt-1 ml-6">
                                    ⭐ Rating: {activity.rating}/5
                                  </p>
                                )}
                                {activity.deadline && (
                                  <p className="text-xs text-gray-400 mt-1 ml-6">
                                    Due: {new Date(activity.deadline).toLocaleDateString()}
                                  </p>
                                )}
                                {activity.priority && activity.priority !== "normal" && (
                                  <p className={`text-xs mt-1 ml-6 ${activity.priority === "urgent" ? "text-red-500" : "text-orange-500"}`}>
                                    🔥 {activity.priority.charAt(0).toUpperCase() + activity.priority.slice(1)} priority
                                  </p>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
