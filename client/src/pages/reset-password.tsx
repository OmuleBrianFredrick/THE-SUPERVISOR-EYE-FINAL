import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Eye, EyeOff, CheckCircle, XCircle, ArrowLeft } from "lucide-react";

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    setToken(t);
  }, []);

  const resetMutation = useMutation({
    mutationFn: (data: { token: string; password: string }) =>
      apiRequest("POST", "/api/auth/reset-password", data),
    onSuccess: () => {
      setDone(true);
    },
    onError: (err: any) => {
      toast({
        title: "Reset failed",
        description: err.message || "Invalid or expired reset link.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast({ title: "Missing reset token", description: "Please use the link from your reset request.", variant: "destructive" });
      return;
    }
    if (!password || password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    resetMutation.mutate({ token, password });
  };

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">THE SUPERVISOR</h1>
          <p className="text-blue-300 mt-1 text-sm">Set a New Password</p>
        </div>

        <Card className="shadow-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
          {!token ? (
            <>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-400" />
                  Invalid Reset Link
                </CardTitle>
                <CardDescription className="text-blue-200">
                  This reset link is missing a token. Please go back and request a new password reset link.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  onClick={() => navigate("/forgot-password")}
                >
                  Request New Reset Link
                </Button>
              </CardContent>
            </>
          ) : done ? (
            <>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  Password Reset Successful
                </CardTitle>
                <CardDescription className="text-blue-200">
                  Your password has been updated. You can now sign in with your new password.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  onClick={() => navigate("/login")}
                >
                  Sign In Now
                </Button>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-white">Create new password</CardTitle>
                <CardDescription className="text-blue-200">
                  Choose a strong password for your account. It must be at least 6 characters.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-blue-100">New password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 6 characters"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-blue-300/50 focus:border-blue-400 pr-10"
                        autoComplete="new-password"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {password.length > 0 && password.length < 6 && (
                      <p className="text-xs text-red-400">Password must be at least 6 characters</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-blue-100">Confirm new password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Re-enter your new password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className={`bg-white/10 border-white/20 text-white placeholder:text-blue-300/50 focus:border-blue-400 pr-10
                          ${passwordsMatch ? "border-green-500/60" : ""}
                          ${passwordMismatch ? "border-red-500/60" : ""}`}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white"
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordsMatch && (
                      <p className="text-xs text-green-400 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Passwords match
                      </p>
                    )}
                    {passwordMismatch && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <XCircle className="h-3 w-3" /> Passwords do not match
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 mt-2"
                    disabled={resetMutation.isPending}
                  >
                    {resetMutation.isPending ? "Resetting password..." : "Reset Password"}
                  </Button>
                </form>

                <div className="mt-5 text-center">
                  <button
                    onClick={() => navigate("/login")}
                    className="text-blue-400 hover:text-white text-sm flex items-center gap-1 mx-auto transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Sign In
                  </button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
