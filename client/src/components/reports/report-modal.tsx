import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
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
import { X, MapPin, Loader2, CheckCircle2 } from "lucide-react";

interface ReportModalProps {
  onClose: () => void;
}

// Template fields based on report type
const TEMPLATES: Record<string, { tasksLabel: string; tasksPh: string; challengesPh: string; goalsPh: string; extra?: { label: string; key: string; ph: string }[] }> = {
  weekly: {
    tasksLabel: "Tasks Completed This Week *",
    tasksPh: "List your completed tasks for this week...",
    challengesPh: "Any blockers or challenges you faced...",
    goalsPh: "What are you planning for next week...",
  },
  project: {
    tasksLabel: "Project Progress & Deliverables *",
    tasksPh: "Describe project milestones achieved, features delivered, or phase completed...",
    challengesPh: "Technical issues, resource constraints, or scope challenges...",
    goalsPh: "Next project milestones and planned actions...",
    extra: [
      { label: "Client / Stakeholder", key: "clientName", ph: "e.g. Acme Corp or Internal" },
    ],
  },
  goal_review: {
    tasksLabel: "Goal Achievement Summary *",
    tasksPh: "How well did you achieve your goals? List specific accomplishments...",
    challengesPh: "What prevented full goal achievement or caused delays...",
    goalsPh: "Revised or new goals for the next review period...",
  },
  special: {
    tasksLabel: "Work Completed *",
    tasksPh: "Describe the special assignment and what was accomplished...",
    challengesPh: "Challenges, constraints, or unexpected issues...",
    goalsPh: "Follow-up actions or next steps...",
    extra: [
      { label: "Assignment Reference", key: "reference", ph: "e.g. Inspection #42 or Site visit ID" },
    ],
  },
};

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
    clientName: "",
    reference: "",
  });

  const [location, setLocation] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const template = TEMPLATES[formData.type] || null;

  const createReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      await apiRequest("POST", "/api/reports", reportData);
    },
    onSuccess: () => {
      toast({ title: "Report submitted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/timeline"] });
      onClose();
    },
    onError: () => {
      toast({ title: "Failed to submit report", variant: "destructive" });
    },
  });

  const handleChange = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const captureLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation is not supported by your browser", variant: "destructive" });
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = `${pos.coords.latitude.toFixed(6)},${pos.coords.longitude.toFixed(6)}`;
        setLocation(coords);
        setLocationLoading(false);
        toast({ title: "Location captured", description: coords });
      },
      () => {
        setLocationLoading(false);
        toast({ title: "Could not get location", description: "Check your browser's location permissions.", variant: "destructive" });
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.type || !formData.title || !formData.tasksCompleted) {
      toast({ title: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    // Build tasksCompleted to include extra fields if present
    let tasksContent = formData.tasksCompleted;
    if (formData.clientName) tasksContent = `Client: ${formData.clientName}\n\n${tasksContent}`;
    if (formData.reference) tasksContent = `Reference: ${formData.reference}\n\n${tasksContent}`;

    createReportMutation.mutate({
      type: formData.type,
      title: formData.title,
      priority: formData.priority,
      tasksCompleted: tasksContent,
      challengesFaced: formData.challengesFaced,
      goalsNextPeriod: formData.goalsNextPeriod,
      location: location || undefined,
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Submit Report</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type + Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Report Type *</Label>
              <Select value={formData.type} onValueChange={v => handleChange("type", v)}>
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

            <div className="space-y-1.5">
              <Label>Priority Level</Label>
              <Select value={formData.priority} onValueChange={v => handleChange("priority", v)}>
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

          {/* Title */}
          <div className="space-y-1.5">
            <Label>Report Title *</Label>
            <Input
              value={formData.title}
              onChange={e => handleChange("title", e.target.value)}
              placeholder="e.g. Week 12 Progress Update — Engineering"
            />
          </div>

          {/* Template-specific extra fields */}
          {template?.extra?.map(field => (
            <div key={field.key} className="space-y-1.5">
              <Label>{field.label}</Label>
              <Input
                value={(formData as any)[field.key]}
                onChange={e => handleChange(field.key, e.target.value)}
                placeholder={field.ph}
              />
            </div>
          ))}

          {/* Tasks completed */}
          <div className="space-y-1.5">
            <Label>{template?.tasksLabel || "Tasks Completed *"}</Label>
            <Textarea
              value={formData.tasksCompleted}
              onChange={e => handleChange("tasksCompleted", e.target.value)}
              rows={4}
              placeholder={template?.tasksPh || "List the tasks you completed..."}
            />
          </div>

          {/* Challenges */}
          <div className="space-y-1.5">
            <Label>Challenges Faced</Label>
            <Textarea
              value={formData.challengesFaced}
              onChange={e => handleChange("challengesFaced", e.target.value)}
              rows={3}
              placeholder={template?.challengesPh || "Describe any challenges or obstacles..."}
            />
          </div>

          {/* Goals */}
          <div className="space-y-1.5">
            <Label>Goals / Next Steps</Label>
            <Textarea
              value={formData.goalsNextPeriod}
              onChange={e => handleChange("goalsNextPeriod", e.target.value)}
              rows={3}
              placeholder={template?.goalsPh || "What are your goals for the next period..."}
            />
          </div>

          {/* GPS Location */}
          <div className="space-y-1.5">
            <Label>Field Location (Optional)</Label>
            {location ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-700">Location captured</p>
                  <p className="text-xs text-green-600 font-mono">{location}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation(null)}
                  className="text-green-700 hover:text-green-900 shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={captureLocation}
                disabled={locationLoading}
                className="w-full border-dashed border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600"
              >
                {locationLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Getting location...
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-2" />
                    Capture GPS Location
                  </>
                )}
              </Button>
            )}
            <p className="text-xs text-gray-400">
              Captures your current GPS coordinates as evidence of field activity.
            </p>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={createReportMutation.isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
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
