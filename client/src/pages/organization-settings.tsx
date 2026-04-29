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
import { Building2, Save, Activity, Palette, Download, FileJson, FileSpreadsheet } from "lucide-react";

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
  brandLogoUrl?: string | null;
  brandPrimaryColor?: string | null;
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
  const [brand, setBrand] = useState<{ brandLogoUrl: string; brandPrimaryColor: string }>({
    brandLogoUrl: "",
    brandPrimaryColor: "",
  });

  useEffect(() => {
    if (orgQuery.data) {
      setForm(orgQuery.data);
      setBrand({
        brandLogoUrl: orgQuery.data.brandLogoUrl || "",
        brandPrimaryColor: orgQuery.data.brandPrimaryColor || "",
      });
    }
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

  const brandMutation = useMutation({
    mutationFn: async (data: { brandLogoUrl?: string; brandPrimaryColor?: string }) =>
      apiRequest("PATCH", "/api/organization/branding", data),
    onSuccess: () => {
      toast({ title: "Branding updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/organization"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const downloadFile = async (url: string, filename: string) => {
    try {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error(`Download failed (${res.status})`);
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
      toast({ title: "Download started", description: filename });
    } catch (err: any) {
      toast({ title: "Download failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
            Organization
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your organization's profile, branding, and data.
          </p>
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
            {canEdit && <TabsTrigger value="branding" data-testid="tab-branding">Branding</TabsTrigger>}
            {canEdit && <TabsTrigger value="data" data-testid="tab-data">Data</TabsTrigger>}
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
                    <Field label="Name">
                      <Input
                        value={form.name || ""}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        disabled={!canEdit}
                        data-testid="input-org-name"
                      />
                    </Field>
                    <Field label="Industry">
                      <Input
                        value={form.industry || ""}
                        onChange={(e) => setForm({ ...form, industry: e.target.value })}
                        disabled={!canEdit}
                        data-testid="input-org-industry"
                      />
                    </Field>
                    <Field label="Country">
                      <Input
                        value={form.country || ""}
                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                        disabled={!canEdit}
                        data-testid="input-org-country"
                      />
                    </Field>
                    <Field label="Contact email">
                      <Input
                        type="email"
                        value={form.contactEmail || ""}
                        onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                        disabled={!canEdit}
                        data-testid="input-org-email"
                      />
                    </Field>
                    <Field label="Phone">
                      <Input
                        value={form.phone || ""}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        disabled={!canEdit}
                        data-testid="input-org-phone"
                      />
                    </Field>
                    <Field label="Notes">
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
            <TabsContent value="branding">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" /> Brand
                  </CardTitle>
                  <CardDescription>
                    Upload a logo URL and pick a primary color used across invitations and dashboards.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-w-xl">
                    <Field label="Logo URL">
                      <Input
                        placeholder="https://example.com/logo.png"
                        value={brand.brandLogoUrl}
                        onChange={(e) => setBrand({ ...brand, brandLogoUrl: e.target.value })}
                        data-testid="input-brand-logo"
                      />
                    </Field>
                    {brand.brandLogoUrl && (
                      <div className="border rounded-md p-4 bg-white dark:bg-gray-900">
                        <p className="text-xs text-gray-500 mb-2">Preview</p>
                        <img
                          src={brand.brandLogoUrl}
                          alt="Logo preview"
                          className="max-h-16"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                          data-testid="img-brand-preview"
                        />
                      </div>
                    )}
                    <Field label="Primary color">
                      <div className="flex items-center gap-3">
                        <Input
                          type="color"
                          value={brand.brandPrimaryColor || "#2563eb"}
                          onChange={(e) => setBrand({ ...brand, brandPrimaryColor: e.target.value })}
                          className="w-16 h-10 p-1 cursor-pointer"
                          data-testid="input-brand-color"
                        />
                        <Input
                          placeholder="#2563eb"
                          value={brand.brandPrimaryColor}
                          onChange={(e) => setBrand({ ...brand, brandPrimaryColor: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    </Field>

                    <Button
                      onClick={() => brandMutation.mutate(brand)}
                      disabled={brandMutation.isPending}
                      data-testid="button-save-branding"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {brandMutation.isPending ? "Saving…" : "Save branding"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {canEdit && (
            <TabsContent value="data">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" /> Export your data
                  </CardTitle>
                  <CardDescription>
                    Download a copy of your organization's data at any time.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-5">
                      <FileSpreadsheet className="w-8 h-8 text-primary mb-3" />
                      <h3 className="font-semibold mb-1">Activity log (CSV)</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        All activity actions for spreadsheet analysis.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() =>
                          downloadFile("/api/organization/activity.csv", `activity-log-${new Date().toISOString().slice(0, 10)}.csv`)
                        }
                        data-testid="button-download-activity-csv"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download CSV
                      </Button>
                    </div>
                    <div className="border rounded-lg p-5">
                      <FileJson className="w-8 h-8 text-primary mb-3" />
                      <h3 className="font-semibold mb-1">Full export (JSON)</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Users, goals, reviews, tasks, meetings, invoices in one file.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() =>
                          downloadFile("/api/organization/export", `organization-export-${new Date().toISOString().slice(0, 10)}.json`)
                        }
                        data-testid="button-download-org-json"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download JSON
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
