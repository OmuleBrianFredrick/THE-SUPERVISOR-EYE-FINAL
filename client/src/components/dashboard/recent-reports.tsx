import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import type { ReportWithRelations } from "@shared/schema";

export default function RecentReports() {
  const { user } = useAuth();
  
  const { data: reports, isLoading } = useQuery({
    queryKey: ["/api/reports", { limit: 5 }],
  });

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

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-gray-100">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-lg">Recent Reports</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-6 bg-gray-200 rounded w-20 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-gray-100">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recent Reports</CardTitle>
          <Link href="/reports">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {reports && reports.length > 0 ? (
          <div className="space-y-4">
            {reports.slice(0, 3).map((report: ReportWithRelations) => (
              <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className={`${getRoleColor(report.employee?.role || 'employee')} text-white text-sm font-medium`}>
                      {getInitials(report.employee?.firstName, report.employee?.lastName, report.employee?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">
                      {user?.role === 'employee' ? 'My Report' : `${report.employee?.firstName} ${report.employee?.lastName || report.employee?.email}`}
                    </p>
                    <p className="text-sm text-gray-600">{report.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(report.status)}
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(report.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No reports found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
