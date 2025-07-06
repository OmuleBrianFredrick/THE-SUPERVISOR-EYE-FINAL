import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Clock, 
  Users, 
  CheckCircle, 
  Star,
  FileText,
  TrendingUp
} from "lucide-react";

export default function StatsCards() {
  const { user } = useAuth();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const renderSupervisorStats = () => (
    <>
      <Card className="shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.pendingReviews || 0}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="text-orange-600 text-xl h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.teamMembers || 0}</p>
            </div>
            <div className="w-12 h-12 bg-supervisor bg-opacity-10 rounded-lg flex items-center justify-center">
              <Users className="text-supervisor text-xl h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Reviews</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.completedReports || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600 text-xl h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Team Avg Rating</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.averageRating?.toFixed(1) || "0.0"}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="text-yellow-600 text-xl h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );

  const renderEmployeeStats = () => (
    <>
      <Card className="shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">My Reports</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.myReports || 0}</p>
            </div>
            <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
              <FileText className="text-primary text-xl h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">My Avg Rating</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.myAverageRating?.toFixed(1) || "0.0"}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="text-yellow-600 text-xl h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Performance</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.myAverageRating > 4 ? "Excellent" : 
                 stats?.myAverageRating > 3 ? "Good" : 
                 stats?.myAverageRating > 2 ? "Average" : "Improving"}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-green-600 text-xl h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <p className="text-3xl font-bold text-gray-900">Active</p>
            </div>
            <div className="w-12 h-12 bg-employee bg-opacity-10 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-employee text-xl h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {user?.role === 'employee' ? renderEmployeeStats() : renderSupervisorStats()}
    </div>
  );
}
