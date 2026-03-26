import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Mail, ArrowLeft, Copy, CheckCircle, ExternalLink } from "lucide-react";

export default function ForgotPassword() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const forgotMutation = useMutation({
    mutationFn: (data: { email: string }) =>
      apiRequest("POST", "/api/auth/forgot-password", data),
    onSuccess: (res: any) => {
      if (res?.resetUrl) {
        setResetUrl(res.resetUrl);
      } else {
        // Email not found — still show a neutral message
        setResetUrl("not_found");
      }
    },
    onError: (err: any) => {
      toast({
        title: "Something went wrong",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCopy = async () => {
    if (!resetUrl || resetUrl === "not_found") return;
    await navigator.clipboard.writeText(resetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Reset link copied to clipboard" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Please enter your email address", variant: "destructive" });
      return;
    }
    forgotMutation.mutate({ email });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">THE SUPERVISOR</h1>
          <p className="text-blue-300 mt-1 text-sm">Password Recovery</p>
        </div>

        <Card className="shadow-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
          {!resetUrl ? (
            <>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-white">Forgot your password?</CardTitle>
                <CardDescription className="text-blue-200">
                  Enter the email address for your account and we'll generate a password reset link for you.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-blue-100">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-blue-300/50 focus:border-blue-400 pl-10"
                        autoComplete="email"
                        autoFocus
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5"
                    disabled={forgotMutation.isPending}
                  >
                    {forgotMutation.isPending ? "Generating link..." : "Generate Reset Link"}
                  </Button>
                </form>

                <div className="mt-6 text-center">
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
          ) : resetUrl === "not_found" ? (
            <>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  Check your inbox
                </CardTitle>
                <CardDescription className="text-blue-200">
                  If an account with <span className="text-white font-medium">{email}</span> exists,
                  a password reset link will be sent. Please contact your administrator if you need further help.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  onClick={() => navigate("/login")}
                >
                  Return to Sign In
                </Button>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  Reset link generated
                </CardTitle>
                <CardDescription className="text-blue-200">
                  Your password reset link is ready. Copy it and open it in your browser to set a new password.
                  This link expires in <span className="text-white font-medium">1 hour</span>.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Reset link display */}
                <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                  <p className="text-xs text-blue-300 mb-2 font-medium uppercase tracking-wider">Your reset link</p>
                  <p className="text-white/80 text-xs break-all leading-relaxed font-mono">{resetUrl}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2"
                    onClick={handleCopy}
                  >
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied!" : "Copy Link"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10 flex items-center justify-center gap-2"
                    onClick={() => window.open(resetUrl, "_self")}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Link
                  </Button>
                </div>

                <p className="text-center text-xs text-blue-400">
                  Note: In production, this link would be sent to your email automatically.
                </p>

                <button
                  onClick={() => navigate("/login")}
                  className="w-full text-blue-400 hover:text-white text-sm flex items-center gap-1 justify-center transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Sign In
                </button>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
