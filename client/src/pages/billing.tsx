import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard, Check, Building2, Calendar, AlertTriangle, Sparkles,
} from "lucide-react";

type BillingPlan = {
  id: string;
  name: string;
  priceCents: number;
  features: string[];
};

type BillingResponse = {
  organization: {
    id: number;
    name: string;
    slug: string;
    plan: string;
    status: string;
    trialEndsAt: string | null;
    industry: string | null;
    createdAt: string;
  };
  invoices: Array<{
    id: number;
    amount: number;
    currency: string;
    status: string;
    dueDate: string | null;
    paidAt: string | null;
    createdAt: string;
  }>;
  plans: BillingPlan[];
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

function daysUntil(d: string | null): number | null {
  if (!d) return null;
  const ms = new Date(d).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export default function Billing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const canChangePlan = user?.role === "executive" || (user as any)?.isSuperAdmin;

  const { data, isLoading } = useQuery<BillingResponse>({ queryKey: ["/api/billing"] });

  const planMutation = useMutation({
    mutationFn: async (plan: string) => apiRequest("POST", "/api/billing/plan", { plan }),
    onSuccess: () => {
      toast({ title: "Plan updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/billing"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (e: any) => toast({
      title: "Could not change plan",
      description: e.message,
      variant: "destructive",
    }),
  });

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
            Billing & Plan
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your subscription and invoices.
          </p>
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-500 py-8 text-center">Loading…</p>
        ) : !data ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <CardTitle>Billing not available</CardTitle>
              </div>
              <CardDescription>You need to belong to an organization first.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            {/* Current org card */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" /> {data.organization.name}
                    </CardTitle>
                    <CardDescription>
                      {data.organization.industry || "Organization"} · created {formatDate(data.organization.createdAt)}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className={STATUS_STYLES[data.organization.status] || ""}>
                    {data.organization.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Stat label="Current plan" value={
                    <span className="capitalize" data-testid="text-current-plan">
                      {data.organization.plan}
                    </span>
                  } />
                  <Stat label="Status" value={
                    <span className="capitalize">{data.organization.status}</span>
                  } />
                  <Stat label="Trial ends" value={
                    data.organization.trialEndsAt
                      ? `${formatDate(data.organization.trialEndsAt)} (${daysUntil(data.organization.trialEndsAt)} days)`
                      : "—"
                  } />
                </div>
                {data.organization.status === "trial" && data.organization.trialEndsAt && (
                  <div className="mt-4 p-3 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 dark:text-blue-200">
                        You're on a free trial.
                      </p>
                      <p className="text-blue-700 dark:text-blue-300">
                        Pick a paid plan below before your trial ends to keep your team's access.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Plans grid */}
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Available plans
            </h2>
            {!canChangePlan && (
              <p className="text-sm text-gray-500 mb-4">
                Only the organization's executive can change the plan.
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {data.plans.map((plan) => {
                const isCurrent = data.organization.plan === plan.id;
                return (
                  <Card
                    key={plan.id}
                    className={isCurrent ? "border-primary border-2" : ""}
                    data-testid={`card-plan-${plan.id}`}
                  >
                    <CardHeader>
                      <CardTitle className="capitalize">{plan.name}</CardTitle>
                      <CardDescription>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatMoney(plan.priceCents)}
                        </span>
                        <span className="text-sm text-gray-500"> /month</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-4">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        className="w-full"
                        variant={isCurrent ? "outline" : "default"}
                        disabled={isCurrent || !canChangePlan || planMutation.isPending}
                        onClick={() => planMutation.mutate(plan.id)}
                        data-testid={`button-select-${plan.id}`}
                      >
                        {isCurrent ? "Current plan" : planMutation.isPending ? "Updating…" : "Switch to this plan"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Invoices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Invoices
                </CardTitle>
                <CardDescription>Past charges for your organization.</CardDescription>
              </CardHeader>
              <CardContent>
                {data.invoices.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-500">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No invoices yet. They'll appear here once your first billing cycle starts.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due</TableHead>
                        <TableHead>Paid</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.invoices.map((inv) => (
                        <TableRow key={inv.id} data-testid={`row-invoice-${inv.id}`}>
                          <TableCell className="font-medium">#{inv.id}</TableCell>
                          <TableCell>{formatMoney(inv.amount, inv.currency)}</TableCell>
                          <TableCell><Badge variant="outline">{inv.status}</Badge></TableCell>
                          <TableCell>{formatDate(inv.dueDate)}</TableCell>
                          <TableCell>{formatDate(inv.paidAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-base font-semibold text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
  );
}
