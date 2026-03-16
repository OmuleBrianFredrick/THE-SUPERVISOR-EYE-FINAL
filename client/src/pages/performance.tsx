import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  TrendingUp,
  Star,
  FileText,
  CheckCircle,
  Clock,
  Award,
  BarChart3,
  Target,
} from "lucide-react";
import type { Report } from "@shared/schema";

const RATING_COLORS: Record<number, string> = {
  5: "text-green-600 bg-green-50",
  4: "text-blue-600 bg-blue-50",
  3: "text-yellow-600 bg-yellow-50",
  2: "text-orange-600 bg-orange-50",
  1: "text-red-600 bg-red-50",
};

const STATUS_BADGE: Record<string, string> = {
  approved: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  needs_revision: "bg-orange-100 text-orange-700",
  rejected: "bg-red-100 text-red-700",
};

export default function Performance() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [isAuthenticated, isLoading]);

  const { data: stats } = useQuery<{
    myReports?: number;
    myAverageRating?: number;
    completedReports?: number;
  }>({
    queryKey: ["/api/dashboard/stats"],
    enabled: !!isAuthenticated,
  });

  const { data: allReports = [] } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
    enabled: !!isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
      </div>
    );
  }

  const approvedReports = allReports.filter(r => r.status === "approved");
  const pendingReports = allReports.filter(r => r.status === "pending");
  const needsRevision = allReports.filter(r => r.status === "needs_revision");
  const totalRated = approvedReports.filter(r => r.rating != null);
  const avgRating = totalRated.length > 0
    ? totalRated.reduce((sum, r) => sum + (r.rating ?? 0), 0) / totalRated.length
    : 0;
  const approvalRate = allReports.length > 0
    ? Math.round((approvedReports.length / allReports.length) * 100) : 0;

  const performanceLevel =
    avgRating >= 4.5 ? "Outstanding" :
    avgRating >= 4 ? "Excellent" :
    avgRating >= 3 ? "Good" :
    avgRating >= 2 ? "Developing" : "Needs Improvement";

  const performanceColor =
    avgRating >= 4 ? "text-green-600" :
    avgRating >= 3 ? "text-blue-600" :
    avgRating >= 2 ? "text-yellow-600" : "text-red-600";

  // Rating distribution
  const ratingDist = [5, 4, 3, 2, 1].map(r => ({
    rating: r,
    count: totalRated.filter(rep => rep.rating === r).length,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <TrendingUp className="w-8 h-8 text-employee" />
              <h2 className="text-3xl font-bold text-gray-900">My Performance</h2>
              <Badge className="role-employee text-white">Employee View</Badge>
            </div>
            <p className="text-gray-600">
              Welcome {user?.firstName}! Here's a complete view of your performance history.
            </p>
          </div>

          {/* Performance Level Banner */}
          <Card className="mb-8 shadow-sm border border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow flex items-center justify-center">
                    <Award className={`h-8 w-8 ${performanceColor}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Overall Performance Level</p>
                    <p className={`text-3xl font-bold ${performanceColor}`}>{avgRating > 0 ? performanceLevel : "No ratings yet"}</p>
                    {avgRating > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star
                            key={s}
                            className={`h-4 w-4 ${s <= Math.round(avgRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-1">{avgRating.toFixed(1)} / 5.0</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button onClick={() => navigate("/reports")} className="shrink-0">
                  <FileText className="h-4 w-4 mr-2" />
                  Submit Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Reports", value: allReports.length, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Approved", value: approvedReports.length, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
              { label: "Pending Review", value: pendingReports.length, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
              { label: "Approval Rate", value: `${approvalRate}%`, icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Rating Distribution */}
            <Card className="shadow-sm border border-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-gray-600" />
                  Rating Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {totalRated.length > 0 ? (
                  <div className="space-y-3">
                    {ratingDist.map(({ rating, count }) => (
                      <div key={rating} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-20 shrink-0">
                          {[1, 2, 3, 4, 5].filter(s => s <= rating).map(s => (
                            <Star key={s} className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                          ))}
                        </div>
                        <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                          <div
                            className="bg-blue-500 h-2.5 rounded-full transition-all"
                            style={{ width: totalRated.length > 0 ? `${(count / totalRated.length) * 100}%` : "0%" }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No rated reports yet</p>
                    <p className="text-sm text-gray-400">Ratings appear after your supervisor reviews your reports</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Report Status Breakdown */}
            <Card className="shadow-sm border border-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-gray-600" />
                  Report Status Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {allReports.length > 0 ? (
                  <div className="space-y-3">
                    {[
                      { status: "approved", label: "Approved", count: approvedReports.length },
                      { status: "pending", label: "Pending Review", count: pendingReports.length },
                      { status: "needs_revision", label: "Needs Revision", count: needsRevision.length },
                      { status: "rejected", label: "Rejected", count: allReports.filter(r => r.status === "rejected").length },
                    ].filter(s => s.count > 0).map(({ status, label, count }) => (
                      <div key={status} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[status]}`}>
                            {label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full"
                              style={{ width: `${(count / allReports.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700 w-6 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No reports submitted yet</p>
                    <Button className="mt-4" size="sm" onClick={() => navigate("/reports")}>
                      Submit Your First Report
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Rated Reports */}
          <Card className="shadow-sm border border-gray-100">
            <CardHeader>
              <CardTitle>Recent Performance Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {approvedReports.length > 0 ? (
                <div className="space-y-3">
                  {approvedReports.slice(0, 8).map(report => (
                    <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{report.title}</p>
                        <p className="text-sm text-gray-500 capitalize">
                          {report.type.replace("_", " ")} · {new Date(report.submittedAt!).toLocaleDateString()}
                        </p>
                        {report.supervisorFeedback && (
                          <p className="text-sm text-gray-600 mt-1 italic line-clamp-1">"{report.supervisorFeedback}"</p>
                        )}
                      </div>
                      {report.rating != null && (
                        <div className={`ml-4 px-3 py-1 rounded-full text-sm font-bold shrink-0 ${RATING_COLORS[report.rating] ?? "text-gray-600 bg-gray-50"}`}>
                          {report.rating}/5
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No reviewed reports yet</p>
                  <p className="text-sm text-gray-400">Reviews will appear here after your supervisor approves your reports</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
