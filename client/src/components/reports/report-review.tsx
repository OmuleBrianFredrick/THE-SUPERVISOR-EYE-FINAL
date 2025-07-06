import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, FileText } from "lucide-react";
import type { ReportWithRelations } from "@shared/schema";

interface ReportReviewProps {
  report: ReportWithRelations;
  onBack: () => void;
}

export default function ReportReview({ report, onBack }: ReportReviewProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [feedback, setFeedback] = useState(report.supervisorFeedback || "");
  const [rating, setRating] = useState(report.rating?.toString() || "");

  const reviewMutation = useMutation({
    mutationFn: async ({ action, data }: { action: string, data: any }) => {
      await apiRequest("PATCH", `/api/reports/${report.id}/review`, data);
    },
    onSuccess: (_, { action }) => {
      toast({
        title: "Success",
        description: action === "approve" ? "Report approved successfully!" : "Revision requested successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      onBack();
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
        description: "Failed to review report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = () => {
    if (!feedback.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide feedback before approving.",
        variant: "destructive",
      });
      return;
    }

    if (!rating) {
      toast({
        title: "Validation Error",
        description: "Please provide a rating before approving.",
        variant: "destructive",
      });
      return;
    }

    reviewMutation.mutate({
      action: "approve",
      data: {
        feedback,
        rating: parseInt(rating),
        status: "approved",
      },
    });
  };

  const handleRequestRevision = () => {
    if (!feedback.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide feedback for the revision request.",
        variant: "destructive",
      });
      return;
    }

    reviewMutation.mutate({
      action: "revision",
      data: {
        feedback,
        rating: rating ? parseInt(rating) : null,
        status: "needs_revision",
      },
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      case "approved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>;
      case "needs_revision":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Needs Revision</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const canReview = user && report.supervisorId === user.id && report.status === "pending";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex items-center space-x-2 text-primary hover:text-primary/80 mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Reports</span>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Review Report</h1>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              {/* Report Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className={`${getRoleColor(report.employee?.role || 'employee')} text-white font-medium`}>
                        {getInitials(report.employee?.firstName, report.employee?.lastName, report.employee?.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {report.employee?.firstName} {report.employee?.lastName || report.employee?.email}
                      </h3>
                      <p className="text-gray-600">{report.title}</p>
                      <p className="text-sm text-gray-500">
                        Submitted {new Date(report.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(report.status)}
                </div>
              </div>
              
              {/* Report Content */}
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Tasks Completed</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {report.tasksCompleted || "No tasks listed"}
                    </p>
                  </div>
                </div>
                
                {report.challengesFaced && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Challenges Faced</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {report.challengesFaced}
                      </p>
                    </div>
                  </div>
                )}
                
                {report.goalsNextPeriod && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Goals for Next Period</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {report.goalsNextPeriod}
                      </p>
                    </div>
                  </div>
                )}
                
                {report.attachments && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Attached Files</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <span className="text-sm text-gray-900">Files attached</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Supervisor Feedback Section */}
              {canReview && (
                <div className="p-6 border-t border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Provide Feedback</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="feedback" className="text-sm font-medium text-gray-700 mb-2">
                        Feedback *
                      </Label>
                      <Textarea
                        id="feedback"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={4}
                        placeholder="Provide feedback on performance, areas for improvement, and recognition..."
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="rating" className="text-sm font-medium text-gray-700 mb-2">
                        Overall Rating
                      </Label>
                      <Select value={rating} onValueChange={setRating}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Select rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">Excellent (5)</SelectItem>
                          <SelectItem value="4">Good (4)</SelectItem>
                          <SelectItem value="3">Average (3)</SelectItem>
                          <SelectItem value="2">Below Average (2)</SelectItem>
                          <SelectItem value="1">Poor (1)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex justify-end space-x-4 pt-6">
                      <Button 
                        variant="outline"
                        onClick={handleRequestRevision}
                        disabled={reviewMutation.isPending}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        {reviewMutation.isPending ? "Processing..." : "Request Revision"}
                      </Button>
                      <Button 
                        onClick={handleApprove}
                        disabled={reviewMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {reviewMutation.isPending ? "Processing..." : "Approve Report"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Existing Feedback Display */}
              {report.supervisorFeedback && !canReview && (
                <div className="p-6 border-t border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Supervisor Feedback</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap mb-2">
                      {report.supervisorFeedback}
                    </p>
                    {report.rating && (
                      <p className="text-sm font-medium text-gray-700">
                        Rating: {report.rating}/5
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
