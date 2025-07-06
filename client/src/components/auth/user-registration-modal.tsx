import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  X, 
  User, 
  Building, 
  Users,
  Crown,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import type { User as UserType } from "@shared/schema";

interface UserRegistrationModalProps {
  onClose: () => void;
}

export default function UserRegistrationModal({ onClose }: UserRegistrationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "employee",
    department: "",
    supervisorId: "",
  });

  // Fetch potential supervisors based on selected role
  const { data: supervisors } = useQuery({
    queryKey: ["/api/users/supervisors", formData.role],
    retry: false,
    enabled: step === 2,
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: any) => {
      // First authenticate with Replit
      window.location.href = `/api/login?setupData=${encodeURIComponent(JSON.stringify(userData))}`;
    },
    onSuccess: () => {
      toast({
        title: "Registration Initiated",
        description: "Please complete authentication to finish setup.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: "Please try again or contact your administrator.",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.role || !formData.department) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (formData.role !== 'executive' && !formData.supervisorId) {
        toast({
          title: "Supervisor Required",
          description: "Please select your supervisor to establish reporting hierarchy.",
          variant: "destructive",
        });
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = () => {
    registerMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "employee": return "role-employee";
      case "supervisor": return "role-supervisor";
      case "manager": return "role-manager";
      case "executive": return "role-executive";
      default: return "bg-gray-500";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "employee": return User;
      case "supervisor": return Users;
      case "manager": return Building;
      case "executive": return Crown;
      default: return User;
    }
  };

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const roleOptions = [
    { value: "employee", label: "Employee", description: "Individual contributor role" },
    { value: "supervisor", label: "Supervisor", description: "Team lead managing employees" },
    { value: "manager", label: "Manager", description: "Department manager overseeing supervisors" },
    { value: "executive", label: "Executive", description: "Senior leadership position" }
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Employee Registration</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
        
        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
            1
          </div>
          <div className={`w-12 h-1 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
            2
          </div>
          <div className={`w-12 h-1 ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
            3
          </div>
        </div>

        {/* Step 1: Personal Information */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="Enter your work email"
                />
              </div>
              
              <div>
                <Label htmlFor="role">Position Level *</Label>
                <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your position level" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{role.label}</span>
                          <span className="text-sm text-gray-500">- {role.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="department">Department *</Label>
                <Select value={formData.department} onValueChange={(value) => handleChange("department", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="customer-success">Customer Success</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Supervisor Selection */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Reporting Structure</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {formData.role === 'executive' ? (
                <div className="text-center py-8">
                  <Crown className="w-16 h-16 text-executive mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Executive Position</h3>
                  <p className="text-gray-600">
                    As an executive, you don't report to anyone and will have full administrative access.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-4">
                    Select your direct supervisor to establish the reporting hierarchy. This person will review your reports and provide feedback.
                  </p>
                  
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Supervisor selection coming soon</p>
                    <p className="text-sm text-gray-400 mt-2">Your administrator will assign you to a supervisor</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => handleChange("supervisorId", "temp")}
                    >
                      Continue Without Supervisor
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Confirm Registration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Registration Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{formData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Role:</span>
                      <Badge className={`${getRoleColor(formData.role)} text-white`}>
                        {formData.role}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Department:</span>
                      <span className="font-medium capitalize">{formData.department.replace('-', ' ')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Next Steps</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• You'll be redirected to complete authentication</li>
                    <li>• Your account will be created with the specified details</li>
                    <li>• You'll gain access to your role-specific dashboard</li>
                    <li>• Your supervisor will be notified of your registration</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <Button 
            variant="outline"
            onClick={step === 1 ? onClose : () => setStep(step - 1)}
            disabled={registerMutation.isPending}
          >
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          
          {step < 3 ? (
            <Button onClick={handleNext} className="flex items-center space-x-2">
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={registerMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {registerMutation.isPending ? "Setting up..." : "Complete Registration"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}