import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, User } from "lucide-react";
import type { User as UserType } from "@shared/schema";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  department: z.string().optional(),
  role: z.enum(["employee", "supervisor", "manager", "executive"]),
  supervisorId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CompleteProfile() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedRole, setSelectedRole] = useState("employee");

  const { data: currentUser, isLoading: userLoading } = useQuery<UserType>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const { data: supervisors } = useQuery<UserType[]>({
    queryKey: ["/api/users/supervisors/employee"],
    retry: false,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      department: "",
      role: "employee",
      supervisorId: "",
    },
  });

  useEffect(() => {
    if (currentUser) {
      form.reset({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        department: currentUser.department || "",
        role: (currentUser.role as FormValues["role"]) || "employee",
        supervisorId: currentUser.supervisorId || "",
      });
      setSelectedRole(currentUser.role || "employee");
    }
  }, [currentUser]);

  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      await apiRequest("PATCH", "/api/auth/complete-profile", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Profile saved!", description: "Welcome to The Supervisor platform." });
      const roleRoutes: Record<string, string> = {
        employee: "/employee-dashboard",
        supervisor: "/supervisor-dashboard",
        manager: "/manager-dashboard",
        executive: "/executive-dashboard",
      };
      const role = form.getValues("role");
      navigate(roleRoutes[role] || "/employee-dashboard");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save profile. Please try again.", variant: "destructive" });
    },
  });

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Shield className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">THE SUPERVISOR</h1>
          <p className="text-blue-300 mt-1">Complete your profile to get started</p>
        </div>

        <Card className="border-slate-700 bg-slate-800/80 shadow-2xl backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Your Profile Details
            </CardTitle>
            <CardDescription className="text-slate-400">
              We just need a few more details to set up your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(v => updateMutation.mutate(v))} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">First Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Jane" className="bg-slate-700 border-slate-600 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Smith" className="bg-slate-700 border-slate-600 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Department</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Engineering, Sales, HR" className="bg-slate-700 border-slate-600 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Your Role</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={v => {
                          field.onChange(v);
                          setSelectedRole(v);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="supervisor">Supervisor</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="executive">Executive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedRole !== "executive" && (
                  <FormField
                    control={form.control}
                    name="supervisorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Your Supervisor (optional)</FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue placeholder="Select a supervisor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None / Not assigned yet</SelectItem>
                            {(supervisors || []).map((s: UserType) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.firstName} {s.lastName} ({s.role})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 mt-2"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Saving...
                    </span>
                  ) : "Save Profile & Continue"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
