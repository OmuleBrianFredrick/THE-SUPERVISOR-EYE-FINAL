import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users, Search, Edit, Check } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export default function AdminUsers() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState("");
  const [newSupervisor, setNewSupervisor] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (user && user.role !== "executive") {
      toast({
        title: "Access Denied",
        description: "Only executives can access user management.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  }, [user, toast]);

  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    retry: false,
  });

  const { data: supervisors } = useQuery({
    queryKey: ["/api/users/supervisors/employee"],
    retry: false,
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: { userId: string; role: string; supervisorId?: string }) => {
      return await apiRequest("PATCH", `/api/users/${data.userId}/role`, {
        role: data.role,
        supervisorId: data.supervisorId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      setShowDialog(false);
      setSelectedUser(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user.role !== "executive") {
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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Access Denied
                  </h3>
                  <p className="text-gray-600">
                    Executive privileges required for user management.
                  </p>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  const filteredUsers = (allUsers || []).filter(
    (u: User) =>
      u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case "employee":
        return "role-employee";
      case "supervisor":
        return "role-supervisor";
      case "manager":
        return "role-manager";
      case "executive":
        return "role-executive";
      default:
        return "bg-gray-500";
    }
  };

  const getRoleTextColor = (role: string) => {
    switch (role) {
      case "employee":
        return "text-employee";
      case "supervisor":
        return "text-supervisor";
      case "manager":
        return "text-manager";
      case "executive":
        return "text-executive";
      default:
        return "text-gray-500";
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

  const handleEditUser = (u: User) => {
    setSelectedUser(u);
    setNewRole(u.role);
    setNewSupervisor(u.supervisorId || "");
    setShowDialog(true);
  };

  const handleSaveRole = () => {
    if (!selectedUser) return;
    updateUserMutation.mutate({
      userId: selectedUser.id,
      role: newRole,
      supervisorId: newSupervisor || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
                <p className="text-gray-600 mt-1">
                  Manage user roles, assignments, and organizational hierarchy
                </p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Search by name or email..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {usersLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">
                            User
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">
                            Email
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">
                            Role
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">
                            Department
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u: User) => (
                          <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarFallback
                                    className={`${getRoleColor(u.role)} text-white text-sm font-medium`}
                                  >
                                    {getInitials(u.firstName, u.lastName, u.email)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {u.firstName} {u.lastName}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-gray-600">{u.email}</td>
                            <td className="py-4 px-4">
                              <Badge
                                variant="outline"
                                className={`${getRoleTextColor(u.role)} border-current capitalize`}
                              >
                                {u.role}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-gray-600">
                              {u.department || "-"}
                            </td>
                            <td className="py-4 px-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditUser(u)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div>
                <p className="font-medium text-gray-900 mb-2">
                  {selectedUser.firstName} {selectedUser.lastName}
                </p>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Role</label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newRole !== "executive" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Supervisor</label>
                  <Select value={newSupervisor} onValueChange={setNewSupervisor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a supervisor" />
                    </SelectTrigger>
                    <SelectContent>
                      {supervisors?.map((sup: User) => (
                        <SelectItem key={sup.id} value={sup.id}>
                          {sup.firstName} {sup.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveRole}
                  disabled={updateUserMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {updateUserMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
