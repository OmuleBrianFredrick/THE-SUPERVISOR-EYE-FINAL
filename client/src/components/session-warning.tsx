import { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const POLL_INTERVAL = 60 * 1000;
const WARNING_COUNTDOWN = 60;

export default function SessionWarning() {
  const { isAuthenticated } = useAuth();
  const [sessionExpired, setSessionExpired] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(WARNING_COUNTDOWN);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    if (isAuthenticated) {
      wasAuthenticated.current = true;
    }
  }, [isAuthenticated]);

  const checkSession = useCallback(async () => {
    if (!wasAuthenticated.current) return;
    try {
      const res = await fetch("/api/auth/user", { credentials: "include" });
      if (res.status === 401) {
        setConsecutiveFailures(prev => {
          const next = prev + 1;
          if (next === 1) {
            setShowWarning(true);
            setCountdown(WARNING_COUNTDOWN);
          }
          if (next >= 2) {
            setSessionExpired(true);
            setShowWarning(false);
          }
          return next;
        });
      } else {
        setConsecutiveFailures(0);
        setShowWarning(false);
      }
    } catch {
      // Network error — don't trigger warning
    }
  }, []);

  const extendSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/user", { credentials: "include" });
      if (res.ok) {
        setShowWarning(false);
        setConsecutiveFailures(0);
        setCountdown(WARNING_COUNTDOWN);
      } else {
        setSessionExpired(true);
        setShowWarning(false);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(checkSession, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [checkSession]);

  useEffect(() => {
    if (!showWarning) return;
    if (countdown <= 0) {
      setSessionExpired(true);
      setShowWarning(false);
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [showWarning, countdown]);

  if (sessionExpired) {
    return (
      <Dialog open>
        <DialogContent className="sm:max-w-md" onInteractOutside={e => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <LogIn className="w-5 h-5" />
              Session Expired
            </DialogTitle>
            <DialogDescription>
              Your session has ended. Please sign in again to continue working.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => { window.location.href = "/login"; }}
            >
              Sign In Again
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (showWarning) {
    return (
      <Dialog open onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onInteractOutside={e => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <Clock className="w-5 h-5" />
              Session Expiring Soon
            </DialogTitle>
            <DialogDescription>
              Your session is about to expire. You will be signed out in{" "}
              <span className="font-bold text-amber-600">{countdown}</span> second{countdown !== 1 ? "s" : ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => { window.location.href = "/login"; }}>
              Sign Out
            </Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={extendSession}>
              Stay Signed In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}
