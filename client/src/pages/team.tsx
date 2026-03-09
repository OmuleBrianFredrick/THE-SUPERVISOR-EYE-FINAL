import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Mail, Calendar, BarChart3, FileText, Star } from "lucide-react";
import type { User } from "@shared/schema";

export default function Team() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: teamMembers, isLoading: teamLoading, error } = useQuery({
    queryKey: ["/api/team"],
    retry: false,
    enabled: !!user && (user.role === 'supervisor' || user.role === 'manager' || user.role === 'executive'),
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: !!user,
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
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

  if (user.role === 'employee') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="flex">
          <Sidebar />
          
          <main className="flex-1 p-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Team</h2>
              <p className="text-gray-600">Team management is not available for employees.</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
                  <p className="text-gray-600">
                    You need supervisor, manager, or executive privileges to view team information.
                  </p>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "employee": return "role-employee";
      case "supervisor": return "role-supervisor";
      case "manager": return "role-manager";
      case "executive": return "role-executive";
      default: return "bg-gray-500";
    }
  };

  const getRoleTextColor = (role: string) => {
    switch (role) {
      case "employee": return "text-employee";
      case "supervisor": return "text-supervisor";
      case "manager": return "text-manager";
      case "executive": return "text-executive";
      default: return "text-gray-500";
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Team Management</h2>
            <p className="text-gray-600">
              Manage your team members and monitor their performance.
            </p>
          </div>

          {/* Team Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="shadow-sm border border-gray-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Team Members</p>
                    <p className="text-2xl font-bold text-gray-900">{teamMembers?.length || 0}</p>
                  </div>
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-gray-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.pendingReviews || 0}</p>
                  </div>
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-gray-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.averageRating?.toFixed(1) || "0.0"}</p>
                  </div>
                  <Star className="h-6 w-6 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {teamLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : teamMembers && teamMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map((member: User) => (
                <Card key={member.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className={`${getRoleColor(member.role)} text-white font-medium`}>
                          {getInitials(member.firstName, member.lastName, member.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {member.firstName} {member.lastName || member.email}
                        </CardTitle>
                        <Badge variant="outline" className={`${getRoleTextColor(member.role)} border-current`}>
                          {member.role}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {member.email}
                      </div>
                      {member.department && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          {member.department}
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        Joined {new Date(member.createdAt).toLocaleDateString()}
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
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
                  <p className="text-gray-600">
                    You don't have any team members reporting to you yet.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
