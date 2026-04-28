import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Building2, Users, DollarSign, TrendingUp, Activity, Megaphone,
  CheckCircle2, XCircle, PauseCircle, FileText, Plus, AlertTriangle,
} from "lucide-react";

type MasterStats = {
  totalOrganizations: number;
  activeOrganizations: number;
  trialOrganizations: number;
  suspendedOrganizations: number;
  totalUsers: number;
  totalReports: number;
  monthlyRecurringRevenue: number;
  planBreakdown: Record<string, number>;
};

type Organization = {
  id: number;
  name: string;
  slug: string;
  ownerEmail: string | null;
  industry: string | null;
  status: string;
  plan: string;
  trialEndsAt: string | null;
  createdAt: string;
  userCount: number;
  reportCount: number;
};

type ActivityItem = {
  id: number;
  organizationId: number | null;
  actorEmail: string | null;
  action: string;
  details: string | null;
  createdAt: string;
};

type Invoice = {
  id: number;
  organizationId: number;
  amount: number;
  currency: string;
  status: string;
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
};

const PLAN_PRICES: Record<string, number> = {
  trial: 0, starter: 49, professional: 149, enterprise: 499,
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30",
  trial: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
  suspended: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  cancelled: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30",
};

function formatMoney(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency, maximumFractionDigits: 0,
  }).format((cents || 0) / 100);
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString();
}

export default function MasterCrm() {
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [announceOpen, setAnnounceOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);

  const statsQuery = useQuery<MasterStats>({ queryKey: ["/api/master/stats"] });
  const orgsQuery = useQuery<Organization[]>({ queryKey: ["/api/master/organizations"] });
  const activityQuery = useQuery<ActivityItem[]>({ queryKey: ["/api/master/activity"] });
  const invoicesQuery = useQuery<Invoice[]>({ queryKey: ["/api/master/invoices"] });

  // Forbidden = not super admin
  const forbidden =
    (statsQuery.error as any)?.message?.includes("403") ||
    (orgsQuery.error as any)?.message?.includes("403");

  const createOrgMutation = useMutation({
    mutationFn: async (data: { name: string; ownerEmail: string; plan: string; industry: string }) => {
      return apiRequest("POST", "/api/master/organizations", data);
    },
    onSuccess: () => {
      toast({ title: "Organization created" });
      queryClient.invalidateQueries({ queryKey: ["/api/master/organizations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/master/stats"] });
      setCreateOpen(false);
    },
    onError: (e: any) => toast({ title: "Could not create", description: e.message, variant: "destructive" }),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("POST", `/api/master/organizations/${id}/status`, { status });
    },
    onSuccess: () => {
      toast({ title: "Status updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/master/organizations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/master/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/master/activity"] });
    },
    onError: (e: any) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });

  const planMutation = useMutation({
    mutationFn: async ({ id, plan }: { id: number; plan: string }) => {
      return apiRequest("PATCH", `/api/master/organizations/${id}`, { plan });
    },
    onSuccess: () => {
      toast({ title: "Plan updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/master/organizations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/master/stats"] });
    },
    onError: (e: any) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });

  const announceMutation = useMutation({
    mutationFn: async (data: { title: string; body: string; audience: string }) => {
      return apiRequest("POST", "/api/master/announcements", data);
    },
    onSuccess: () => {
      toast({ title: "Announcement sent" });
      setAnnounceOpen(false);
    },
    onError: (e: any) => toast({ title: "Could not send", description: e.message, variant: "destructive" }),
  });

  if (forbidden) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <CardTitle>Access denied</CardTitle>
            </div>
            <CardDescription>This area is for the platform super admin only.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const stats = statsQuery.data;
  const orgs = orgsQuery.data || [];
  const activity = activityQuery.data || [];
  const invoices = invoicesQuery.data || [];
  const selectedOrg = orgs.find((o) => o.id === selectedOrgId);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
              Master CRM
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage every organization on the platform.
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={announceOpen} onOpenChange={setAnnounceOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="button-open-announce">
                  <Megaphone className="w-4 h-4 mr-2" /> Send announcement
                </Button>
              </DialogTrigger>
              <AnnounceDialog onSubmit={(d) => announceMutation.mutate(d)} pending={announceMutation.isPending} />
            </Dialog>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-open-create-org">
                  <Plus className="w-4 h-4 mr-2" /> New organization
                </Button>
              </DialogTrigger>
              <CreateOrgDialog onSubmit={(d) => createOrgMutation.mutate(d)} pending={createOrgMutation.isPending} />
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<Building2 className="w-5 h-5" />}
            label="Organizations"
            value={stats?.totalOrganizations ?? "—"}
            sub={`${stats?.activeOrganizations ?? 0} active · ${stats?.trialOrganizations ?? 0} trial`}
            testId="stat-orgs"
          />
          <StatCard
            icon={<Users className="w-5 h-5" />}
            label="Total users"
            value={stats?.totalUsers ?? "—"}
            sub={`${stats?.totalReports ?? 0} reports filed`}
            testId="stat-users"
          />
          <StatCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Monthly revenue"
            value={stats ? formatMoney(stats.monthlyRecurringRevenue * 100) : "—"}
            sub="Recurring (estimate)"
            testId="stat-mrr"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Plan mix"
            value={stats ? Object.entries(stats.planBreakdown).length : "—"}
            sub={stats ? Object.entries(stats.planBreakdown)
              .map(([p, n]) => `${p}: ${n}`).join(" · ") : ""}
            testId="stat-plan-mix"
          />
        </div>

        <Tabs defaultValue="organizations" className="w-full">
          <TabsList>
            <TabsTrigger value="organizations" data-testid="tab-organizations">Organizations</TabsTrigger>
            <TabsTrigger value="activity" data-testid="tab-activity">Activity</TabsTrigger>
            <TabsTrigger value="invoices" data-testid="tab-invoices">Invoices</TabsTrigger>
          </TabsList>

          <TabsContent value="organizations">
            <Card>
              <CardHeader>
                <CardTitle>All organizations</CardTitle>
                <CardDescription>Click a row to view details and change plan or status.</CardDescription>
              </CardHeader>
              <CardContent>
                {orgsQuery.isLoading ? (
                  <p className="text-sm text-gray-500 py-8 text-center">Loading…</p>
                ) : orgs.length === 0 ? (
                  <p className="text-sm text-gray-500 py-8 text-center">No organizations yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead className="text-right">Users</TableHead>
                        <TableHead className="text-right">Reports</TableHead>
                        <TableHead>Trial ends</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orgs.map((org) => (
                        <TableRow
                          key={org.id}
                          className="cursor-pointer"
                          onClick={() => setSelectedOrgId(org.id)}
                          data-testid={`row-org-${org.id}`}
                        >
                          <TableCell className="font-medium" data-testid={`text-org-name-${org.id}`}>
                            {org.name}
                            <div className="text-xs text-gray-500">{org.slug}</div>
                          </TableCell>
                          <TableCell className="text-sm">{org.ownerEmail || "—"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={STATUS_STYLES[org.status] || ""}>
                              {org.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="capitalize">{org.plan}</TableCell>
                          <TableCell className="text-right">{org.userCount}</TableCell>
                          <TableCell className="text-right">{org.reportCount}</TableCell>
                          <TableCell className="text-sm">{formatDate(org.trialEndsAt)}</TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-1">
                              {org.status !== "active" && (
                                <Button
                                  size="sm" variant="ghost"
                                  onClick={() => statusMutation.mutate({ id: org.id, status: "active" })}
                                  data-testid={`button-activate-${org.id}`}
                                >
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                </Button>
                              )}
                              {org.status !== "suspended" && (
                                <Button
                                  size="sm" variant="ghost"
                                  onClick={() => statusMutation.mutate({ id: org.id, status: "suspended" })}
                                  data-testid={`button-suspend-${org.id}`}
                                >
                                  <PauseCircle className="w-4 h-4 text-amber-600" />
                                </Button>
                              )}
                              {org.status !== "cancelled" && (
                                <Button
                                  size="sm" variant="ghost"
                                  onClick={() => statusMutation.mutate({ id: org.id, status: "cancelled" })}
                                  data-testid={`button-cancel-${org.id}`}
                                >
                                  <XCircle className="w-4 h-4 text-red-600" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Recent activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activityQuery.isLoading ? (
                  <p className="text-sm text-gray-500 py-8 text-center">Loading…</p>
                ) : activity.length === 0 ? (
                  <p className="text-sm text-gray-500 py-8 text-center">No activity yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {activity.map((a) => (
                      <li key={a.id} className="flex items-start gap-3 border-b border-gray-100 dark:border-gray-800 pb-3" data-testid={`activity-${a.id}`}>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Activity className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {a.action}
                            {a.actorEmail && <span className="text-gray-500 font-normal"> · {a.actorEmail}</span>}
                          </p>
                          {a.details && <p className="text-xs text-gray-500 mt-0.5">{a.details}</p>}
                          <p className="text-xs text-gray-400 mt-0.5">{new Date(a.createdAt).toLocaleString()}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Invoices
                </CardTitle>
              </CardHeader>
              <CardContent>
                {invoicesQuery.isLoading ? (
                  <p className="text-sm text-gray-500 py-8 text-center">Loading…</p>
                ) : invoices.length === 0 ? (
                  <p className="text-sm text-gray-500 py-8 text-center">No invoices yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Org</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due</TableHead>
                        <TableHead>Paid</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((inv) => {
                        const org = orgs.find((o) => o.id === inv.organizationId);
                        return (
                          <TableRow key={inv.id} data-testid={`row-invoice-${inv.id}`}>
                            <TableCell>#{inv.id}</TableCell>
                            <TableCell>{org?.name || `Org ${inv.organizationId}`}</TableCell>
                            <TableCell>{formatMoney(inv.amount, inv.currency)}</TableCell>
                            <TableCell><Badge variant="outline">{inv.status}</Badge></TableCell>
                            <TableCell>{formatDate(inv.dueDate)}</TableCell>
                            <TableCell>{formatDate(inv.paidAt)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Detail dialog */}
        <Dialog open={!!selectedOrgId} onOpenChange={(o) => !o && setSelectedOrgId(null)}>
          <DialogContent className="max-w-lg">
            {selectedOrg && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedOrg.name}</DialogTitle>
                  <DialogDescription>{selectedOrg.ownerEmail || "No owner email"}</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2">
                  <DetailRow label="Status">
                    <Badge variant="outline" className={STATUS_STYLES[selectedOrg.status] || ""}>
                      {selectedOrg.status}
                    </Badge>
                  </DetailRow>
                  <DetailRow label="Industry">{selectedOrg.industry || "—"}</DetailRow>
                  <DetailRow label="Users">{selectedOrg.userCount}</DetailRow>
                  <DetailRow label="Reports">{selectedOrg.reportCount}</DetailRow>
                  <DetailRow label="Created">{formatDate(selectedOrg.createdAt)}</DetailRow>
                  <DetailRow label="Trial ends">{formatDate(selectedOrg.trialEndsAt)}</DetailRow>
                  <div>
                    <Label>Change plan</Label>
                    <Select
                      value={selectedOrg.plan}
                      onValueChange={(v) => planMutation.mutate({ id: selectedOrg.id, plan: v })}
                    >
                      <SelectTrigger className="mt-1" data-testid="select-plan">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(PLAN_PRICES).map((p) => (
                          <SelectItem key={p} value={p}>
                            {p} {PLAN_PRICES[p] > 0 ? `($${PLAN_PRICES[p]}/mo)` : "(free)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedOrgId(null)} data-testid="button-close-detail">
                    Close
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, sub, testId }: {
  icon: React.ReactNode; label: string; value: React.ReactNode; sub: string; testId: string;
}) {
  return (
    <Card data-testid={testId}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{label}</span>
          <span className="text-primary">{icon}</span>
        </div>
        <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-500 mt-1 truncate">{sub}</p>
      </CardContent>
    </Card>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  );
}

function CreateOrgDialog({ onSubmit, pending }: {
  onSubmit: (d: { name: string; ownerEmail: string; plan: string; industry: string }) => void;
  pending: boolean;
}) {
  const [name, setName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [plan, setPlan] = useState("trial");
  const [industry, setIndustry] = useState("");
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create organization</DialogTitle>
        <DialogDescription>Add a new tenant to the platform.</DialogDescription>
      </DialogHeader>
      <div className="space-y-3 py-2">
        <div>
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} data-testid="input-org-name" />
        </div>
        <div>
          <Label>Owner email</Label>
          <Input value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} data-testid="input-owner-email" />
        </div>
        <div>
          <Label>Industry</Label>
          <Input value={industry} onChange={(e) => setIndustry(e.target.value)} data-testid="input-industry" />
        </div>
        <div>
          <Label>Plan</Label>
          <Select value={plan} onValueChange={setPlan}>
            <SelectTrigger data-testid="select-create-plan"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.keys(PLAN_PRICES).map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button
          disabled={pending || !name}
          onClick={() => onSubmit({ name, ownerEmail, plan, industry })}
          data-testid="button-submit-create-org"
        >
          {pending ? "Creating…" : "Create"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function AnnounceDialog({ onSubmit, pending }: {
  onSubmit: (d: { title: string; body: string; audience: string }) => void;
  pending: boolean;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Send announcement</DialogTitle>
        <DialogDescription>Reaches all organizations or just one segment.</DialogDescription>
      </DialogHeader>
      <div className="space-y-3 py-2">
        <div>
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} data-testid="input-announce-title" />
        </div>
        <div>
          <Label>Message</Label>
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} data-testid="input-announce-body" />
        </div>
        <div>
          <Label>Audience</Label>
          <Select value={audience} onValueChange={setAudience}>
            <SelectTrigger data-testid="select-audience"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All organizations</SelectItem>
              <SelectItem value="trial">Trial only</SelectItem>
              <SelectItem value="active">Active only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button
          disabled={pending || !title || !body}
          onClick={() => onSubmit({ title, body, audience })}
          data-testid="button-submit-announce"
        >
          {pending ? "Sending…" : "Send"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
