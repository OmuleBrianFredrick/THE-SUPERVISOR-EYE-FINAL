import { useState, useEffect } from "react";
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
import { Plus, FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import type { ReportWithRelations } from "@shared/schema";

export default function Reports() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportWithRelations | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: reports, isLoading: reportsLoading, error } = useQuery({
    queryKey: ["/api/reports"],
    retry: false,
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [error, toast]);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "needs_revision":
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Needs Revision</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "employee": return "role-employee";
      case "supervisor": return "role-supervisor";
      case "manager": return "role-manager";
      case "executive": return "role-executive";
      default: return "bg-gray-500";
    }
  };

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  if (selectedReport) {
    return (
      <ReportReview 
        report={selectedReport} 
        onBack={() => setSelectedReport(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Reports</h2>
                <p className="text-gray-600">
                  {user.role === 'employee' 
                    ? "Manage your performance reports and feedback." 
                    : "Review and manage team reports."}
                </p>
              </div>
              {user.role === 'employee' && (
                <Button 
                  onClick={() => setShowReportModal(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Report
                </Button>
              )}
            </div>
          </div>

          {reportsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : reports && reports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.map((report: ReportWithRelations) => (
                <Card 
                  key={report.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedReport(report)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-primary" />
                        {report.title}
                      </CardTitle>
                      {getStatusBadge(report.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-3 mb-4">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className={`${getRoleColor(report.employee?.role || 'employee')} text-white text-sm font-medium`}>
                          {getInitials(report.employee?.firstName, report.employee?.lastName, report.employee?.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">
                          {report.employee?.firstName} {report.employee?.lastName || report.employee?.email}
                        </p>
                        <p className="text-sm text-gray-600 capitalize">{report.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(report.submittedAt).toLocaleDateString()}
                      </p>
                      {report.rating && (
                        <p className="text-sm font-medium text-gray-900">
                          Rating: {report.rating}/5
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                  <p className="text-gray-600 mb-6">
                    {user.role === 'employee' 
                      ? "You haven't submitted any reports yet." 
                      : "No reports have been submitted to you yet."}
                  </p>
                  {user.role === 'employee' && (
                    <Button 
                      onClick={() => setShowReportModal(true)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Report
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
