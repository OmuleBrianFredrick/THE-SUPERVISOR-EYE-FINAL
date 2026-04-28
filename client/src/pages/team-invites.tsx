import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, Copy, X, UserPlus, Check, Clock } from "lucide-react";

type Invitation = {
  id: number;
  email: string;
  role: string;
  status: string;
  token: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
};

type Supervisor = { id: string; firstName: string | null; lastName: string | null; email: string | null; role: string };

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
  accepted: "bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30",
  revoked: "bg-gray-500/15 text-gray-700 dark:text-gray-300 border-gray-500/30",
  expired: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
};

function formatDate(d: string | null) {
  return d ? new Date(d).toLocaleDateString() : "—";
}

function isExpired(d: string) {
  return new Date(d) < new Date();
}

export default function TeamInvites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("employee");
  const [department, setDepartment] = useState("");
  const [supervisorId, setSupervisorId] = useState("none");

  const canInvite = user && (
    ["executive", "manager", "supervisor"].includes((user as any).role) ||
    (user as any).isSuperAdmin
  );

  const invitesQuery = useQuery<Invitation[]>({ queryKey: ["/api/invitations"] });
  const supervisorsQuery = useQuery<Supervisor[]>({
    queryKey: ["/api/users/all"],
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { email: string; role: string; supervisorId: string | null; department: string }) =>
      apiRequest("POST", "/api/invitations", data),
    onSuccess: () => {
      toast({ title: "Invitation sent" });
      queryClient.invalidateQueries({ queryKey: ["/api/invitations"] });
      setEmail("");
      setDepartment("");
      setSupervisorId("none");
    },
    onError: (e: any) => toast({ title: "Could not invite", description: e.message, variant: "destructive" }),
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/invitations/${id}`),
    onSuccess: () => {
      toast({ title: "Invitation revoked" });
      queryClient.invalidateQueries({ queryKey: ["/api/invitations"] });
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const copyLink = async (token: string) => {
    const link = `${window.location.origin}/invite/${token}`;
    try {
      await navigator.clipboard.writeText(link);
      toast({ title: "Link copied to clipboard" });
    } catch {
      toast({ title: "Could not copy", description: link, variant: "destructive" });
    }
  };

  const supervisors = (supervisorsQuery.data || []).filter(
    (u) => ["supervisor", "manager", "executive"].includes(u.role)
  );

  const invites = invitesQuery.data || [];

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
            Team invites
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Invite teammates by email. They'll get a link to join your organization.
          </p>
        </div>

        {canInvite && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" /> Send a new invitation
              </CardTitle>
              <CardDescription>The invite link is valid for 7 days.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="teammate@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="input-invite-email"
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger data-testid="select-invite-role"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Department (optional)</Label>
                  <Input
                    placeholder="e.g. operations"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    data-testid="input-invite-department"
                  />
                </div>
                <div className="md:col-span-3">
                  <Label>Reports to (optional)</Label>
                  <Select value={supervisorId} onValueChange={setSupervisorId}>
                    <SelectTrigger data-testid="select-invite-supervisor"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— None —</SelectItem>
                      {supervisors.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.firstName} {s.lastName} ({s.role}) · {s.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-1 flex items-end">
                  <Button
                    className="w-full"
                    disabled={!email || createMutation.isPending}
                    onClick={() => createMutation.mutate({
                      email, role, department,
                      supervisorId: supervisorId === "none" ? null : supervisorId,
                    })}
                    data-testid="button-send-invite"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {createMutation.isPending ? "Sending…" : "Send invite"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Invitations sent</CardTitle>
            <CardDescription>Pending, accepted and expired invites for your organization.</CardDescription>
          </CardHeader>
          <CardContent>
            {invitesQuery.isLoading ? (
              <p className="text-sm text-gray-500 py-8 text-center">Loading…</p>
            ) : invites.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">No invitations yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invites.map((inv) => {
                    const effectiveStatus = inv.status === "pending" && isExpired(inv.expiresAt) ? "expired" : inv.status;
                    return (
                      <TableRow key={inv.id} data-testid={`row-invite-${inv.id}`}>
                        <TableCell className="font-medium">{inv.email}</TableCell>
                        <TableCell className="capitalize">{inv.role}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={STATUS_STYLES[effectiveStatus] || ""}>
                            {effectiveStatus === "accepted" && <Check className="w-3 h-3 mr-1" />}
                            {effectiveStatus === "pending" && <Clock className="w-3 h-3 mr-1" />}
                            {effectiveStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(inv.createdAt)}</TableCell>
                        <TableCell className="text-sm">{formatDate(inv.expiresAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {effectiveStatus === "pending" && (
                              <>
                                <Button
                                  size="sm" variant="ghost"
                                  onClick={() => copyLink(inv.token)}
                                  data-testid={`button-copy-${inv.id}`}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                                {canInvite && (
                                  <Button
                                    size="sm" variant="ghost"
                                    onClick={() => revokeMutation.mutate(inv.id)}
                                    data-testid={`button-revoke-${inv.id}`}
                                  >
                                    <X className="w-4 h-4 text-red-600" />
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
