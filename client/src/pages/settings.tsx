import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import { User, Shield, Bell, Building, Save, LogOut, CheckCircle } from "lucide-react";

const DEPARTMENTS = [
  { value: "engineering", label: "Engineering" },
  { value: "product", label: "Product" },
  { value: "design", label: "Design" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "hr", label: "Human Resources" },
  { value: "finance", label: "Finance" },
  { value: "operations", label: "Operations" },
  { value: "legal", label: "Legal" },
  { value: "customer-success", label: "Customer Success" },
];

const ROLE_COLORS: Record<string, string> = {
  employee: "bg-green-600",
  supervisor: "bg-blue-600",
  manager: "bg-purple-600",
  executive: "bg-red-600",
};

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [department, setDepartment] = useState(user?.department || "");

  const updateProfile = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; department: string }) => {
      return apiRequest("PATCH", "/api/users/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfile.mutate({ firstName, lastName, department });
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
              <p className="text-muted-foreground">Manage your account settings and preferences.</p>
            </div>

            <div className="grid gap-6">
              {/* Profile Information */}
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-4 py-4 border-b">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Profile Information</CardTitle>
                    <p className="text-sm text-muted-foreground">Update your personal details</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-muted/40 cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">Email is managed by Replit authentication and cannot be changed here.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select value={department} onValueChange={setDepartment}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map(d => (
                          <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleSave}
                    disabled={updateProfile.isPending}
                    className="w-full md:w-auto"
                  >
                    {updateProfile.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Role & Organization */}
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-4 py-4 border-b">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Building className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Role & Organization</CardTitle>
                    <p className="text-sm text-muted-foreground">Your position in the organization</p>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border">
                    <div>
                      <p className="font-medium">Your Role</p>
                      <p className="text-sm text-muted-foreground">Assigned by your organization admin</p>
                    </div>
                    <Badge className={`${ROLE_COLORS[user?.role || "employee"]} text-white capitalize`}>
                      {user?.role}
                    </Badge>
                  </div>
                  {user?.department && (
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border">
                      <div>
                        <p className="font-medium">Department</p>
                        <p className="text-sm text-muted-foreground">Your team or department</p>
                      </div>
                      <span className="text-sm font-medium capitalize">{user.department.replace("-", " ")}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border">
                    <div>
                      <p className="font-medium">Member Since</p>
                      <p className="text-sm text-muted-foreground">When you joined the platform</p>
                    </div>
                    <span className="text-sm font-medium">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "N/A"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Security */}
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-4 py-4 border-b">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <Shield className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Security</CardTitle>
                    <p className="text-sm text-muted-foreground">Account security and authentication</p>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 border border-green-200">
                    <div>
                      <p className="font-medium">Authentication Status</p>
                      <p className="text-sm text-muted-foreground">You are logged in via Replit Auth.</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-bold">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border">
                    <div>
                      <p className="font-medium">Sign Out</p>
                      <p className="text-sm text-muted-foreground">Sign out of all devices</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => { window.location.href = "/api/logout"; }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-4 py-4 border-b">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Bell className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Notification Preferences</CardTitle>
                    <p className="text-sm text-muted-foreground">Control what alerts you receive</p>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {[
                    { label: "New report submissions", desc: "Get notified when team members submit reports", enabled: true },
                    { label: "Report reviews completed", desc: "When your report is reviewed by a supervisor", enabled: true },
                    { label: "Revision requests", desc: "When a supervisor requests changes to your report", enabled: true },
                    { label: "System announcements", desc: "Platform updates and maintenance notices", enabled: false },
                  ].map((notif, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border">
                      <div>
                        <p className="font-medium text-sm">{notif.label}</p>
                        <p className="text-xs text-muted-foreground">{notif.desc}</p>
                      </div>
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${notif.enabled ? "bg-primary" : "bg-gray-300"}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${notif.enabled ? "right-0.5" : "left-0.5"}`} />
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">Notification settings will be fully configurable in a future update.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
