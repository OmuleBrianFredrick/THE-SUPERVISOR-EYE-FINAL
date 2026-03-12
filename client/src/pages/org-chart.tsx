import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Crown, Building2, User, Mail, Building } from "lucide-react";
import type { User as UserType } from "@shared/schema";

const ROLE_ORDER = ["executive", "manager", "supervisor", "employee"];

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  executive: {
    label: "Executive",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: Crown,
  },
  manager: {
    label: "Manager",
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
    icon: Building2,
  },
  supervisor: {
    label: "Supervisor",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: Users,
  },
  employee: {
    label: "Employee",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    icon: User,
  },
};

const ROLE_BADGE: Record<string, string> = {
  executive: "bg-red-600",
  manager: "bg-purple-600",
  supervisor: "bg-blue-600",
  employee: "bg-green-600",
};

function getInitials(u: UserType) {
  if (u.firstName && u.lastName) return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
  if (u.email) return u.email.substring(0, 2).toUpperCase();
  return "U";
}

function UserCard({ member }: { member: UserType }) {
  const cfg = ROLE_CONFIG[member.role] || ROLE_CONFIG.employee;
  return (
    <div className={`rounded-xl border ${cfg.border} ${cfg.bg} p-4 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition-shadow min-w-[160px] max-w-[180px]`}>
      <Avatar className="w-12 h-12">
        <AvatarFallback className={`${ROLE_BADGE[member.role] || "bg-gray-500"} text-white font-semibold text-sm`}>
          {getInitials(member)}
        </AvatarFallback>
      </Avatar>
      <div className="text-center">
        <p className="font-semibold text-gray-900 text-sm leading-tight">
          {member.firstName ? `${member.firstName} ${member.lastName || ""}`.trim() : member.email?.split("@")[0]}
        </p>
        <p className="text-xs text-gray-500 truncate max-w-[140px]">{member.email}</p>
      </div>
      {member.department && (
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Building className="h-3 w-3" />
          <span className="capitalize">{member.department.replace("-", " ")}</span>
        </div>
      )}
    </div>
  );
}

export default function OrgChart() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({ title: "Unauthorized", description: "You are logged out. Logging in again...", variant: "destructive" });
      setTimeout(() => { window.location.href = "/api/login"; }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: allUsers, isLoading: usersLoading } = useQuery<UserType[]>({
    queryKey: ["/api/users/all"],
    enabled: !!user && (user.role === "supervisor" || user.role === "manager" || user.role === "executive"),
  });

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user.role === "employee") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
                  <p className="text-gray-600">The organization chart is visible to supervisors and above.</p>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  const byRole: Record<string, UserType[]> = {};
  (allUsers || []).forEach(u => {
    if (!byRole[u.role]) byRole[u.role] = [];
    byRole[u.role].push(u);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold text-gray-900">Organization Chart</h2>
              <Badge className="bg-primary text-white">Live</Badge>
            </div>
            <p className="text-gray-600">
              Your organization hierarchy from executives to employees.
            </p>
          </div>

          {/* Summary row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {ROLE_ORDER.map(role => {
              const cfg = ROLE_CONFIG[role];
              const Icon = cfg.icon;
              const count = (byRole[role] || []).length;
              return (
                <Card key={role} className={`border ${cfg.border} ${cfg.bg} shadow-sm`}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${ROLE_BADGE[role]} bg-opacity-15`}>
                      <Icon className={`h-5 w-5 ${cfg.color}`} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">{cfg.label}s</p>
                      <p className={`text-2xl font-bold ${cfg.color}`}>{count}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {usersLoading ? (
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-24 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {ROLE_ORDER.map(role => {
                const members = byRole[role] || [];
                if (members.length === 0) return null;
                const cfg = ROLE_CONFIG[role];
                const Icon = cfg.icon;
                return (
                  <div key={role}>
                    {/* Level Header */}
                    <div className={`flex items-center gap-3 mb-4 p-3 rounded-lg ${cfg.bg} border ${cfg.border}`}>
                      <div className={`w-8 h-8 rounded-lg ${ROLE_BADGE[role]} flex items-center justify-center`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className={`font-bold text-lg ${cfg.color}`}>{cfg.label} Level</h3>
                        <p className="text-xs text-gray-500">{members.length} {members.length === 1 ? "person" : "people"}</p>
                      </div>
                    </div>

                    {/* Connector line */}
                    {role !== "employee" && (
                      <div className="flex justify-center mb-2">
                        <div className="w-px h-4 bg-gray-300"></div>
                      </div>
                    )}

                    {/* Member cards */}
                    <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                      {members.map(member => (
                        <UserCard key={member.id} member={member} />
                      ))}
                    </div>

                    {/* Arrow down to next level */}
                    {role !== "employee" && (byRole[ROLE_ORDER[ROLE_ORDER.indexOf(role) + 1]] || []).length > 0 && (
                      <div className="flex justify-center mt-4">
                        <div className="flex flex-col items-center">
                          <div className="w-px h-6 bg-gray-300"></div>
                          <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-gray-300"></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {(!allUsers || allUsers.length === 0) && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                      <p className="text-gray-600">Your organization doesn't have any members yet.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
