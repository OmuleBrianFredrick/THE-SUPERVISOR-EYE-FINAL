import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert, LogOut } from "lucide-react";

export default function ImpersonationBanner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isImpersonating = !!(user as any)?.impersonatedFromUserId;

  const stopMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/master/impersonate/stop"),
    onSuccess: () => {
      toast({ title: "Stopped impersonating" });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      window.location.href = "/master-crm";
    },
    onError: (e: any) =>
      toast({ title: "Failed to stop", description: e.message, variant: "destructive" }),
  });

  if (!isImpersonating) return null;

  const name = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.email || "user";

  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-between gap-3 sticky top-0 z-50 shadow-sm" data-testid="banner-impersonation">
      <div className="flex items-center gap-2 text-sm font-medium">
        <ShieldAlert className="w-4 h-4" />
        <span>You are impersonating <b>{name}</b>. Actions taken will appear as theirs.</span>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="bg-white hover:bg-amber-50"
        onClick={() => stopMutation.mutate()}
        disabled={stopMutation.isPending}
        data-testid="button-stop-impersonation"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Stop impersonating
      </Button>
    </div>
  );
}
