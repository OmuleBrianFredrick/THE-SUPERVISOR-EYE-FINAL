import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Upload } from "lucide-react";

interface ReportModalProps {
  onClose: () => void;
}

export default function ReportModal({ onClose }: ReportModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    priority: "normal",
    tasksCompleted: "",
    challengesFaced: "",
    goalsNextPeriod: "",
  });

  const createReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      await apiRequest("POST", "/api/reports", reportData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Report submitted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.title || !formData.tasksCompleted) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createReportMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Submit Performance Report</DialogTitle>
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
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="type" className="text-sm font-medium text-gray-700 mb-2">
                Report Type *
              </Label>
              <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly Performance</SelectItem>
                  <SelectItem value="project">Project Update</SelectItem>
                  <SelectItem value="goal_review">Goal Review</SelectItem>
                  <SelectItem value="special">Special Assignment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="priority" className="text-sm font-medium text-gray-700 mb-2">
                Priority Level
              </Label>
              <Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="title" className="text-sm font-medium text-gray-700 mb-2">
              Report Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Enter a descriptive title for your report"
              className="w-full"
            />
          </div>
          
          <div>
            <Label htmlFor="tasksCompleted" className="text-sm font-medium text-gray-700 mb-2">
              Tasks Completed *
            </Label>
            <Textarea
              id="tasksCompleted"
              value={formData.tasksCompleted}
              onChange={(e) => handleChange("tasksCompleted", e.target.value)}
              rows={4}
              placeholder="List the tasks you've completed this period..."
              className="w-full"
            />
          </div>
          
          <div>
            <Label htmlFor="challengesFaced" className="text-sm font-medium text-gray-700 mb-2">
              Challenges Faced
            </Label>
            <Textarea
              id="challengesFaced"
              value={formData.challengesFaced}
              onChange={(e) => handleChange("challengesFaced", e.target.value)}
              rows={3}
              placeholder="Describe any challenges or obstacles..."
              className="w-full"
            />
          </div>
          
          <div>
            <Label htmlFor="goalsNextPeriod" className="text-sm font-medium text-gray-700 mb-2">
              Goals for Next Period
            </Label>
            <Textarea
              id="goalsNextPeriod"
              value={formData.goalsNextPeriod}
              onChange={(e) => handleChange("goalsNextPeriod", e.target.value)}
              rows={3}
              placeholder="What are your goals for the next period..."
              className="w-full"
            />
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2">
              Supporting Documents
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Drop files here or click to upload</p>
              <p className="text-sm text-gray-500 mt-1">PDF, DOC, JPG, PNG up to 10MB</p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button 
              type="button" 
              variant="outline"
              onClick={onClose}
              disabled={createReportMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={createReportMutation.isPending}
            >
              {createReportMutation.isPending ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
