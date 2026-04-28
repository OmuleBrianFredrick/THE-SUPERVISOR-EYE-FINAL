import { useEffect, useState } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Building2, Mail, Check, AlertTriangle, LogIn } from "lucide-react";

type InviteInfo = {
  invitation: {
    id: number;
    email: string;
    role: string;
    status: string;
    expiresAt: string;
  };
  organization: { id: number; name: string; industry: string | null } | null;
};

export default function AcceptInvite() {
  const [, params] = useRoute("/invite/:token");
  const [, navigate] = useLocation();
  const token = params?.token || "";
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [stashedToken, setStashedToken] = useState<string | null>(null);

  const infoQuery = useQuery<InviteInfo>({
    queryKey: ["/api/invitations/by-token", token],
    enabled: !!token,
  });

  const acceptMutation = useMutation({
    mutationFn: async () => apiRequest("POST", `/api/invitations/accept/${token}`),
    onSuccess: () => {
      toast({ title: "You're in!", description: "Welcome to the team." });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      sessionStorage.removeItem("pendingInviteToken");
      setTimeout(() => navigate("/"), 600);
    },
    onError: (e: any) => toast({ title: "Could not accept", description: e.message, variant: "destructive" }),
  });

  // Stash the token so login/register pages can pick it up
  useEffect(() => {
    if (token) sessionStorage.setItem("pendingInviteToken", token);
    setStashedToken(token);
  }, [token]);

  const info = infoQuery.data;
  const expired = info?.invitation.status === "expired";
  const alreadyTaken = info?.invitation.status && ["accepted", "revoked"].includes(info.invitation.status);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            <CardTitle data-testid="text-invite-title">Team invitation</CardTitle>
          </div>
          <CardDescription>
            {info?.organization ? `Join ${info.organization.name}` : "Loading invitation…"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {infoQuery.isLoading ? (
            <p className="text-sm text-gray-500 py-4 text-center">Loading…</p>
          ) : !info ? (
            <div className="text-center py-4">
              <AlertTriangle className="w-8 h-8 mx-auto text-amber-500 mb-2" />
              <p className="text-sm text-gray-700 dark:text-gray-300">This invitation link isn't valid.</p>
            </div>
          ) : expired || alreadyTaken ? (
            <div className="text-center py-4">
              <AlertTriangle className="w-8 h-8 mx-auto text-amber-500 mb-2" />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                This invitation is <b>{info.invitation.status}</b>. Ask the person who invited you to send a fresh link.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-5">
                <Row label="Organization" value={
                  info.organization ? (
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4" /> {info.organization.name}
                    </span>
                  ) : "—"
                } />
                <Row label="Invited email" value={info.invitation.email} />
                <Row label="Role" value={
                  <Badge variant="outline" className="capitalize">{info.invitation.role}</Badge>
                } />
                <Row label="Expires" value={new Date(info.invitation.expiresAt).toLocaleDateString()} />
              </div>

              {authLoading ? (
                <p className="text-sm text-gray-500 text-center">Checking your session…</p>
              ) : isAuthenticated ? (
                <>
                  {user && info.invitation.email && user.email &&
                    user.email.toLowerCase() !== info.invitation.email.toLowerCase() && (
                      <div className="mb-3 p-2 rounded-md bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-200">
                        You're signed in as <b>{user.email}</b> but this invite was sent to <b>{info.invitation.email}</b>.
                        You can still accept it.
                      </div>
                    )}
                  <Button
                    className="w-full"
                    onClick={() => acceptMutation.mutate()}
                    disabled={acceptMutation.isPending}
                    data-testid="button-accept-invite"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {acceptMutation.isPending ? "Joining…" : `Join ${info.organization?.name || "the team"}`}
                  </Button>
                </>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                    Sign in or create an account to accept this invite.
                  </p>
                  <Link href="/register">
                    <Button className="w-full" data-testid="button-register-from-invite">
                      Create an account
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" className="w-full" data-testid="button-login-from-invite">
                      <LogIn className="w-4 h-4 mr-2" /> I already have an account
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
