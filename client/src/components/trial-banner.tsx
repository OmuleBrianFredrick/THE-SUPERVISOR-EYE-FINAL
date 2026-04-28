import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles, AlertTriangle, X } from "lucide-react";
import { useState, useEffect } from "react";

type Org = {
  id: number;
  name: string;
  status: string;
  plan: string;
  trialEndsAt: string | null;
};

const DISMISS_KEY = "trial-banner-dismissed-at";

export default function TrialBanner() {
  const { data: org } = useQuery<Org>({
    queryKey: ["/api/organization"],
    retry: false,
  });
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const at = localStorage.getItem(DISMISS_KEY);
    if (at) {
      const hoursSince = (Date.now() - parseInt(at, 10)) / (1000 * 60 * 60);
      if (hoursSince < 24) setDismissed(true);
    }
  }, []);

  if (!org || dismissed) return null;
  if (org.status !== "trial" && org.status !== "suspended") return null;

  let daysLeft: number | null = null;
  if (org.trialEndsAt) {
    daysLeft = Math.ceil((new Date(org.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }

  const isExpired = org.status === "suspended" || (daysLeft !== null && daysLeft < 0);
  const isUrgent = daysLeft !== null && daysLeft <= 3;

  const styles = isExpired
    ? "bg-red-500/10 border-red-500/30 text-red-900 dark:text-red-100"
    : isUrgent
      ? "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-100"
      : "bg-blue-500/10 border-blue-500/30 text-blue-900 dark:text-blue-100";

  const Icon = isExpired || isUrgent ? AlertTriangle : Sparkles;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 border-b ${styles}`}
      data-testid="banner-trial"
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <div className="flex-1 text-sm">
        {isExpired ? (
          <>
            <b>Your trial has ended.</b> Pick a plan to keep your team's access.
          </>
        ) : daysLeft !== null && daysLeft <= 0 ? (
          <><b>Your trial ends today.</b> Upgrade now to keep working.</>
        ) : daysLeft !== null ? (
          <>
            <b>{daysLeft} {daysLeft === 1 ? "day" : "days"} left</b> in your free trial of <b>{org.name}</b>.
          </>
        ) : (
          <>You're on a free trial of <b>{org.name}</b>.</>
        )}
      </div>
      <Link href="/billing">
        <Button size="sm" variant={isExpired || isUrgent ? "default" : "outline"} data-testid="button-banner-upgrade">
          Upgrade plan
        </Button>
      </Link>
      <button
        onClick={handleDismiss}
        className="opacity-60 hover:opacity-100 p-1"
        aria-label="Dismiss"
        data-testid="button-banner-dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
