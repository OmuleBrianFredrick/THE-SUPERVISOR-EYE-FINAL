import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      apiRequest("POST", "/api/auth/login", data),
    onSuccess: async (user: any) => {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      const role = user?.role || "employee";
      const routes: Record<string, string> = {
        employee: "/employee-dashboard",
        supervisor: "/supervisor-dashboard",
        manager: "/manager-dashboard",
        executive: "/executive-dashboard",
      };
      navigate(routes[role] || "/");
    },
    onError: (err: any) => {
      toast({
        title: "Login failed",
        description: err.message || "Invalid email or password",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">THE SUPERVISOR</h1>
          <p className="text-blue-300 mt-1 text-sm">Performance & Reporting Platform</p>
        </div>

        <Card className="shadow-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-white">Sign in to your account</CardTitle>
            <CardDescription className="text-blue-200">
              Enter your email and password to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-blue-100">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-300/50 focus:border-blue-400"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-blue-100">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-blue-300/50 focus:border-blue-400 pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 mt-2"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-blue-200 text-sm">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="text-blue-400 hover:text-white font-medium underline-offset-2 hover:underline"
                >
                  Create account
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
