import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Building2, Save, Activity } from "lucide-react";

type Org = {
  id: number;
  name: string;
  industry: string | null;
  country: string | null;
  contactEmail: string | null;
  phone: string | null;
  notes: string | null;
  plan: string;
  status: string;
};

type ActivityRow = {
  id: number;
  organizationId: number | null;
  userId: string | null;
  action: string;
  details: string | null;
  createdAt: string;
};

export default function OrganizationSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const canEdit = user?.role === "executive" || (user as any)?.isSuperAdmin;

  const orgQuery = useQuery<Org>({ queryKey: ["/api/organization"] });
  const activityQuery = useQuery<ActivityRow[]>({
    queryKey: ["/api/organization/activity"],
    enabled: canEdit,
  });

  const [form, setForm] = useState<Partial<Org>>({});
  useEffect(() => {
    if (orgQuery.data) setForm(orgQuery.data);
  }, [orgQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<Org>) => apiRequest("PATCH", "/api/organization", data),
    onSuccess: () => {
      toast({ title: "Saved" });
      queryClient.invalidateQueries({ queryKey: ["/api/organization"] });
      queryClient.invalidateQueries({ queryKey: ["/api/organization/activity"] });
      queryClient.invalidateQueries({ queryKey: ["/api/billing"] });
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
            Organization
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your organization's profile and view activity.
          </p>
        </div>

        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
            {canEdit && <TabsTrigger value="activity" data-testid="tab-activity">Activity</TabsTrigger>}
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" /> {form.name || "Organization"}
                    </CardTitle>
                    <CardDescription>
                      Plan: <span className="capitalize">{form.plan}</span> · Status:{" "}
                      <Badge variant="outline" className="capitalize">{form.status}</Badge>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {orgQuery.isLoading ? (
                  <p className="text-sm text-gray-500 py-8 text-center">Loading…</p>
                ) : (
                  <div className="space-y-4 max-w-xl">
                    <Field label="Name" testId="input-org-name">
                      <Input
                        value={form.name || ""}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        disabled={!canEdit}
                        data-testid="input-org-name"
                      />
                    </Field>
                    <Field label="Industry" testId="input-org-industry">
                      <Input
                        value={form.industry || ""}
                        onChange={(e) => setForm({ ...form, industry: e.target.value })}
                        disabled={!canEdit}
                        data-testid="input-org-industry"
                      />
                    </Field>
                    <Field label="Country" testId="input-org-country">
                      <Input
                        value={form.country || ""}
                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                        disabled={!canEdit}
                        data-testid="input-org-country"
                      />
                    </Field>
                    <Field label="Contact email" testId="input-org-email">
                      <Input
                        type="email"
                        value={form.contactEmail || ""}
                        onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                        disabled={!canEdit}
                        data-testid="input-org-email"
                      />
                    </Field>
                    <Field label="Phone" testId="input-org-phone">
                      <Input
                        value={form.phone || ""}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        disabled={!canEdit}
                        data-testid="input-org-phone"
                      />
                    </Field>
                    <Field label="Notes" testId="input-org-notes">
                      <Textarea
                        rows={3}
                        value={form.notes || ""}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        disabled={!canEdit}
                        data-testid="input-org-notes"
                      />
                    </Field>

                    {canEdit ? (
                      <Button
                        onClick={() => saveMutation.mutate(form)}
                        disabled={saveMutation.isPending}
                        data-testid="button-save-org"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {saveMutation.isPending ? "Saving…" : "Save changes"}
                      </Button>
                    ) : (
                      <p className="text-sm text-gray-500">Only the organization's executive can edit these details.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {canEdit && (
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Recent activity
                  </CardTitle>
                  <CardDescription>Last 50 actions inside your organization.</CardDescription>
                </CardHeader>
                <CardContent>
                  {activityQuery.isLoading ? (
                    <p className="text-sm text-gray-500 py-8 text-center">Loading…</p>
                  ) : (activityQuery.data || []).length === 0 ? (
                    <p className="text-sm text-gray-500 py-8 text-center">No activity yet.</p>
                  ) : (
                    <ul className="space-y-3">
                      {activityQuery.data!.map((a) => (
                        <li
                          key={a.id}
                          className="flex items-start gap-3 border-b border-gray-100 dark:border-gray-800 pb-3"
                          data-testid={`activity-${a.id}`}
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Activity className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{a.action.replace(/_/g, " ")}</p>
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
          )}
        </Tabs>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode; testId?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
