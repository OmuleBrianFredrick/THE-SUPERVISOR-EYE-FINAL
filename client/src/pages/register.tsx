import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Eye, EyeOff, ChevronRight, ChevronLeft } from "lucide-react";

const ROLES = [
  { value: "employee", label: "Employee" },
  { value: "supervisor", label: "Supervisor" },
  { value: "manager", label: "Manager" },
  { value: "executive", label: "Executive" },
];

const DEPARTMENTS = [
  "Engineering", "Sales", "Marketing", "Human Resources",
  "Finance", "Operations", "Customer Service", "Legal", "Other",
];

export default function Register() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "employee",
    department: "",
    supervisorId: "",
  });

  const set = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  // Load potential supervisors based on chosen role
  const { data: supervisors = [] } = useQuery<any[]>({
    queryKey: ["/api/public/supervisors", form.role],
    queryFn: () =>
      fetch(`/api/public/supervisors/${form.role}`).then(r => r.json()),
    enabled: step === 2 && form.role !== "executive",
  });

  const registerMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/auth/register", data),
    onSuccess: async (user: any) => {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      const routes: Record<string, string> = {
        employee: "/employee-dashboard",
        supervisor: "/supervisor-dashboard",
        manager: "/manager-dashboard",
        executive: "/executive-dashboard",
      };
      navigate(routes[user?.role] || "/");
    },
    onError: (err: any) => {
      toast({
        title: "Registration failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleStep1Next = () => {
    if (!form.firstName || !form.lastName) {
      toast({ title: "Please enter your full name", variant: "destructive" });
      return;
    }
    if (!form.email) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return;
    }
    if (!form.password || form.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    setStep(2);
  };

  const handleSubmit = () => {
    if (!form.role) {
      toast({ title: "Please select a role", variant: "destructive" });
      return;
    }
    registerMutation.mutate({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
      role: form.role,
      department: form.department || null,
      supervisorId: form.supervisorId || null,
    });
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
          <p className="text-blue-300 mt-1 text-sm">Create your account</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${step >= s ? "bg-blue-600 text-white" : "bg-white/10 text-blue-300"}`}>
                {s}
              </div>
              {s < 2 && <div className={`w-10 h-0.5 ${step > s ? "bg-blue-600" : "bg-white/20"}`} />}
            </div>
          ))}
        </div>

        <Card className="shadow-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
          {step === 1 && (
            <>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-white">Personal details</CardTitle>
                <CardDescription className="text-blue-200">
                  Step 1 of 2 — Your account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-blue-100">First name</Label>
                    <Input
                      id="firstName"
                      placeholder="Jane"
                      value={form.firstName}
                      onChange={e => set("firstName", e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-blue-300/50 focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-blue-100">Last name</Label>
                    <Input
                      id="lastName"
                      placeholder="Smith"
                      value={form.lastName}
                      onChange={e => set("lastName", e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-blue-300/50 focus:border-blue-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-blue-100">Work email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={e => set("email", e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-blue-300/50 focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-blue-100">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={form.password}
                      onChange={e => set("password", e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-blue-300/50 focus:border-blue-400 pr-10"
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

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-blue-100">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={e => set("confirmPassword", e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-blue-300/50 focus:border-blue-400"
                  />
                </div>

                <Button
                  onClick={handleStep1Next}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 flex items-center justify-center gap-2"
                >
                  Continue <ChevronRight className="h-4 w-4" />
                </Button>

                <p className="text-center text-blue-200 text-sm">
                  Already have an account?{" "}
                  <button
                    onClick={() => navigate("/login")}
                    className="text-blue-400 hover:text-white font-medium hover:underline underline-offset-2"
                  >
                    Sign in
                  </button>
                </p>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-white">Organization details</CardTitle>
                <CardDescription className="text-blue-200">
                  Step 2 of 2 — Your role in the organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-blue-100">Role</Label>
                  <Select value={form.role} onValueChange={v => set("role", v)}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-blue-400">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map(r => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-blue-100">Department</Label>
                  <Select value={form.department} onValueChange={v => set("department", v)}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-blue-400">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {form.role !== "executive" && supervisors.length > 0 && (
                  <div className="space-y-1.5">
                    <Label className="text-blue-100">Reports to (Supervisor)</Label>
                    <Select value={form.supervisorId} onValueChange={v => set("supervisorId", v)}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-blue-400">
                        <SelectValue placeholder="Select supervisor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— None / Not assigned —</SelectItem>
                        {supervisors.map((s: any) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.firstName} {s.lastName} ({s.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 border-white/20 text-white hover:bg-white/10 flex items-center justify-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={registerMutation.isPending}
                    className="flex-2 flex-grow bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    {registerMutation.isPending ? "Creating account..." : "Create Account"}
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
