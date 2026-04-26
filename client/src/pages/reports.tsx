import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import ReportModal from "@/components/reports/report-modal";
import ReportReview from "@/components/reports/report-review";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  X,
  MapPin,
  Download,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ReportWithRelations } from "@shared/schema";

const STATUS_BADGE: Record<string, JSX.Element> = {
  pending: <Badge className="bg-yellow-100 text-yellow-800 border-0 flex items-center gap-1"><Clock className="w-3 h-3" />Pending</Badge>,
  approved: <Badge className="bg-green-100 text-green-800 border-0 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Approved</Badge>,
  needs_revision: <Badge className="bg-orange-100 text-orange-800 border-0 flex items-center gap-1"><XCircle className="w-3 h-3" />Needs Revision</Badge>,
  rejected: <Badge className="bg-red-100 text-red-800 border-0 flex items-center gap-1"><XCircle className="w-3 h-3" />Rejected</Badge>,
};

const ROLE_COLOR: Record<string, string> = {
  employee: "bg-blue-500",
  supervisor: "bg-green-500",
  manager: "bg-purple-500",
  executive: "bg-amber-500",
};

const TYPE_LABELS: Record<string, string> = {
  weekly: "Weekly",
  project: "Project Update",
  goal_review: "Goal Review",
  special: "Special Assignment",
};

function initials(firstName?: string, lastName?: string, email?: string) {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (email) return email.substring(0, 2).toUpperCase();
  return "U";
}

function exportToCSV(reports: ReportWithRelations[]) {
  const headers = ["ID", "Title", "Type", "Status", "Priority", "Employee", "Submitted", "Rating", "GPS"];
  const rows = reports.map(r => [
    r.id,
    `"${(r.title || "").replace(/"/g, '""')}"`,
    r.type || "",
    r.status || "",
    r.priority || "",
    `"${r.employee?.firstName || ""} ${r.employee?.lastName || ""}".trim()`,
    r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : "",
    r.rating || "",
    r.location || "",
  ]);
  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `reports-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function exportToPDF(reports: ReportWithRelations[]) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor(30, 58, 95);
  doc.text("THE SUPERVISOR", 14, 18);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text("Performance & Reporting Platform — Reports Export", 14, 26);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);

  doc.setDrawColor(200);
  doc.line(14, 35, 196, 35);

  let y = 42;
  const lineHeight = 7;

  const colWidths = [10, 58, 22, 22, 20, 34, 18];
  const headers = ["#", "Title", "Type", "Status", "Priority", "Employee", "Rating"];

  doc.setFontSize(8);
  doc.setTextColor(255);
  doc.setFillColor(37, 99, 235);
  doc.rect(14, y - 4, 182, 7, "F");
  let x = 14;
  headers.forEach((h, i) => {
    doc.text(h, x + 2, y);
    x += colWidths[i];
  });

  y += lineHeight;
  doc.setTextColor(40);

  reports.forEach((r, idx) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    if (idx % 2 === 0) {
      doc.setFillColor(245, 247, 250);
      doc.rect(14, y - 4, 182, 7, "F");
    }
    const cols = [
      String(r.id),
      (r.title || "").substring(0, 30),
      (r.type || "").replace("_", " "),
      r.status || "",
      r.priority || "",
      `${r.employee?.firstName || ""} ${r.employee?.lastName || ""}`.trim().substring(0, 20),
      r.rating ? `${r.rating}/5` : "-",
    ];
    x = 14;
    cols.forEach((c, i) => {
      doc.text(c, x + 2, y);
      x += colWidths[i];
    });
    y += lineHeight;
  });

  doc.save(`reports-${new Date().toISOString().split("T")[0]}.pdf`);
}

export default function Reports() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportWithRelations | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setTimeout(() => { window.location.href = "/login"; }, 500);
    }
  }, [isAuthenticated, isLoading]);

  const { data: reports = [], isLoading: reportsLoading, error } = useQuery<ReportWithRelations[]>({
    queryKey: ["/api/reports"],
    retry: false,
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      setTimeout(() => { window.location.href = "/login"; }, 500);
    }
  }, [error]);

  const hasFilters = search || statusFilter !== "all" || typeFilter !== "all" || dateFilter !== "all";

  const filtered = useMemo(() => {
    let list = reports;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.title?.toLowerCase().includes(q) ||
        r.tasksCompleted?.toLowerCase().includes(q) ||
        r.employee?.firstName?.toLowerCase().includes(q) ||
        r.employee?.lastName?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      list = list.filter(r => r.status === statusFilter);
    }

    if (typeFilter !== "all") {
      list = list.filter(r => r.type === typeFilter);
    }

    if (dateFilter !== "all") {
      const now = new Date();
      list = list.filter(r => {
        const d = new Date(r.submittedAt);
        if (dateFilter === "week") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return d >= weekAgo;
        }
        if (dateFilter === "month") {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return d >= monthAgo;
        }
        return true;
      });
    }

    return list;
  }, [reports, search, statusFilter, typeFilter, dateFilter]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setTypeFilter("all");
    setDateFilter("all");
  };

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (selectedReport) {
    return <ReportReview report={selectedReport} onBack={() => setSelectedReport(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
              <p className="text-gray-500 text-sm mt-1">
                {user.role === "employee"
                  ? "Your submitted performance reports"
                  : "Reports from your team members"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {filtered.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="w-4 h-4" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => exportToCSV(filtered)}>
                      <FileText className="w-4 h-4 mr-2 text-green-600" />
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportToPDF(filtered)}>
                      <FileText className="w-4 h-4 mr-2 text-red-600" />
                      Export as PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {user.role === "employee" && (
                <Button
                  onClick={() => setShowReportModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Report
                </Button>
              )}
            </div>
          </div>

          {/* Filter bar */}
          <Card className="mb-6 shadow-none border border-gray-200">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3 items-center">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by title or name..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>

                {/* Status */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36 h-9 text-sm">
                    <Filter className="h-3.5 w-3.5 mr-1 text-gray-400" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="needs_revision">Needs Revision</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                {/* Type */}
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40 h-9 text-sm">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="project">Project Update</SelectItem>
                    <SelectItem value="goal_review">Goal Review</SelectItem>
                    <SelectItem value="special">Special Assignment</SelectItem>
                  </SelectContent>
                </Select>

                {/* Date range */}
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-36 h-9 text-sm">
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>

                {hasFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-9 text-gray-500 hover:text-gray-700 gap-1"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>

              {hasFilters && (
                <p className="text-xs text-gray-500 mt-2">
                  Showing {filtered.length} of {reports.length} reports
                </p>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          {reportsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
                    <div className="h-8 bg-gray-200 rounded w-1/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((report: ReportWithRelations) => (
                <Card
                  key={report.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200"
                  onClick={() => setSelectedReport(report)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base leading-tight flex items-start gap-2">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{report.title}</span>
                      </CardTitle>
                      {STATUS_BADGE[report.status || "pending"] || <Badge variant="outline">{report.status}</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="w-9 h-9">
                        <AvatarFallback className={`${ROLE_COLOR[report.employee?.role || "employee"]} text-white text-xs`}>
                          {initials(report.employee?.firstName, report.employee?.lastName, report.employee?.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {report.employee?.firstName} {report.employee?.lastName || report.employee?.email}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {TYPE_LABELS[report.type] || report.type}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {report.location && (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <MapPin className="h-3 w-3" />
                            <span>GPS</span>
                          </div>
                        )}
                        {report.priority && report.priority !== "normal" && (
                          <Badge className={`text-xs border-0 ${report.priority === "urgent" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                            {report.priority}
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(report.submittedAt).toLocaleDateString()}
                        </p>
                        {report.rating && (
                          <p className="text-xs font-medium text-gray-700">
                            ⭐ {report.rating}/5
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <FileText className="w-14 w-14 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-1">
                    {hasFilters ? "No reports match your filters" : "No reports yet"}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    {hasFilters
                      ? "Try adjusting or clearing the filters above."
                      : user.role === "employee"
                      ? "Submit your first performance report to get started."
                      : "No reports have been submitted yet."}
                  </p>
                  {hasFilters && (
                    <Button variant="outline" onClick={clearFilters}>
                      <X className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                  {!hasFilters && user.role === "employee" && (
                    <Button onClick={() => setShowReportModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Report
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {showReportModal && (
        <ReportModal onClose={() => setShowReportModal(false)} />
      )}
    </div>
  );
}
