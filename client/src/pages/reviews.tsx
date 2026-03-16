import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Star, Clock, CheckCircle, XCircle, AlertCircle, FileText, Users } from "lucide-react";
import type { ReportWithRelations } from "@shared/schema";

const STATUS_META: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending Review", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  approved: { label: "Approved", color: "bg-green-100 text-green-700", icon: CheckCircle },
  needs_revision: { label: "Needs Revision", color: "bg-orange-100 text-orange-700", icon: AlertCircle },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700", icon: XCircle },
};

export default function Reviews() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [filterStatus, setFilterStatus] = useState("pending");
  const [selectedReport, setSelectedReport] = useState<ReportWithRelations | null>(null);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState("5");
  const [reviewStatus, setReviewStatus] = useState("approved");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [isAuthenticated, isLoading]);

  const { data: reports = [], isLoading: reportsLoading } = useQuery<ReportWithRelations[]>({
    queryKey: ["/api/reports"],
    enabled: !!isAuthenticated,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, ...data }: any) =>
      apiRequest("PATCH", `/api/reports/${id}/review`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      setSelectedReport(null);
      toast({ title: "Review submitted successfully" });
    },
    onError: () => toast({ title: "Failed to submit review", variant: "destructive" }),
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
      </div>
    );
  }

  const pending = reports.filter(r => r.status === "pending");
  const approved = reports.filter(r => r.status === "approved");
  const needsRevision = reports.filter(r => r.status === "needs_revision");

  const filtered = filterStatus === "all" ? reports : reports.filter(r => r.status === filterStatus);

  const openReview = (report: ReportWithRelations) => {
    setSelectedReport(report);
    setFeedback(report.supervisorFeedback ?? "");
    setRating(report.rating?.toString() ?? "5");
    setReviewStatus("approved");
  };

  const handleSubmitReview = () => {
    if (!selectedReport) return;
    if (!feedback.trim()) {
      toast({ title: "Please provide feedback", variant: "destructive" });
      return;
    }
    reviewMutation.mutate({
      id: selectedReport.id,
      feedback,
      rating: parseInt(rating),
      status: reviewStatus,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <Star className="w-8 h-8 text-supervisor" />
              <h2 className="text-3xl font-bold text-gray-900">Performance Reviews</h2>
              <Badge className="role-supervisor text-white">Supervisor View</Badge>
            </div>
            <p className="text-gray-600">Review your team's submitted reports and provide feedback</p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Pending Reviews", value: pending.length, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
              { label: "Approved Reports", value: approved.length, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
              { label: "Needs Revision", value: needsRevision.length, icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-50" },
            ].map(stat => (
              <Card key={stat.label} className="shadow-sm border border-gray-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                      <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {[
              { key: "pending", label: `Pending (${pending.length})` },
              { key: "approved", label: `Approved (${approved.length})` },
              { key: "needs_revision", label: `Needs Revision (${needsRevision.length})` },
              { key: "all", label: `All (${reports.length})` },
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

          {/* Reports List */}
          {reportsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map(report => {
                const meta = STATUS_META[report.status ?? "pending"];
                const StatusIcon = meta.icon;
                return (
                  <Card key={report.id} className="shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-gray-900">{report.title}</h3>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${meta.color}`}>
                                <StatusIcon className="h-3 w-3" />
                                {meta.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {(report as any).employee?.firstName} {(report as any).employee?.lastName}
                              </span>
                              <span className="capitalize">{report.type.replace("_", " ")}</span>
                              <span>{new Date(report.submittedAt!).toLocaleDateString()}</span>
                            </div>
                            {report.rating != null && (
                              <div className="flex items-center gap-1 mt-1">
                                {[1, 2, 3, 4, 5].map(s => (
                                  <Star key={s} className={`h-3 w-3 ${s <= report.rating! ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                                ))}
                                <span className="text-xs text-gray-500 ml-1">Rating: {report.rating}/5</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={report.status === "pending" ? "default" : "outline"}
                          onClick={() => openReview(report)}
                          className="shrink-0"
                        >
                          {report.status === "pending" ? "Review Now" : "View / Edit"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="shadow-sm border border-gray-100">
              <CardContent className="text-center py-16">
                <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No {filterStatus === "all" ? "" : STATUS_META[filterStatus]?.label.toLowerCase()} reports
                </h3>
                <p className="text-gray-500">
                  {filterStatus === "pending"
                    ? "You're all caught up! No pending reports to review."
                    : "Try a different filter to see other reports."}
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* Review Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={open => { if (!open) setSelectedReport(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Report</DialogTitle>
            <DialogDescription>
              {selectedReport?.title}
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4 pt-2">
              {/* Report summary */}
              <div className="p-4 bg-gray-50 rounded-lg text-sm space-y-2">
                <p><span className="font-medium">Employee:</span> {(selectedReport as any).employee?.firstName} {(selectedReport as any).employee?.lastName}</p>
                <p><span className="font-medium">Type:</span> {selectedReport.type.replace("_", " ")}</p>
                {selectedReport.tasksCompleted && (
                  <p><span className="font-medium">Tasks Completed:</span> {selectedReport.tasksCompleted}</p>
                )}
                {selectedReport.challengesFaced && (
                  <p><span className="font-medium">Challenges:</span> {selectedReport.challengesFaced}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Rating (1–5) *</Label>
                <Select value={rating} onValueChange={setRating}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 — Outstanding</SelectItem>
                    <SelectItem value="4">4 — Excellent</SelectItem>
                    <SelectItem value="3">3 — Good</SelectItem>
                    <SelectItem value="2">2 — Needs Improvement</SelectItem>
                    <SelectItem value="1">1 — Unsatisfactory</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Decision *</Label>
                <Select value={reviewStatus} onValueChange={setReviewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approve</SelectItem>
                    <SelectItem value="needs_revision">Request Revision</SelectItem>
                    <SelectItem value="rejected">Reject</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Feedback *</Label>
                <Textarea
                  placeholder="Provide detailed feedback for the employee..."
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedReport(null)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmitReview}
                  disabled={reviewMutation.isPending}
                >
                  {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
