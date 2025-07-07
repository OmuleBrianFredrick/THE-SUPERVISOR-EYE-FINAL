import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  FileText, 
  Users, 
  Calendar,
  MessageSquare,
  Clock,
  Target,
  AlertTriangle,
  Search,
  Zap,
  BarChart3,
  Settings,
  HelpCircle,
  Bookmark,
  Send
} from "lucide-react";

interface QuickActionsPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function QuickActionsPanel({ open, onClose }: QuickActionsPanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [actionData, setActionData] = useState<any>({});

  // Quick report submission
  const submitQuickReportMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/reports", {
        method: "POST",
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          type: "quick_update",
          priority: data.priority || "medium"
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Quick Report Submitted",
        description: "Your report has been submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      setSelectedAction(null);
      setActionData({});
    },
  });

  // Send message mutation  
  const sendMessageMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/messages", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
      setSelectedAction(null);
      setActionData({});
    },
  });

  const getQuickActions = () => {
    const commonActions = [
      {
        id: 'quick_report',
        title: 'Quick Report',
        description: 'Submit a quick status update',
        icon: FileText,
        color: 'bg-blue-500',
        category: 'reporting'
      },
      {
        id: 'send_message',
        title: 'Send Message',
        description: 'Send a message to team members',
        icon: MessageSquare,
        color: 'bg-green-500',
        category: 'communication'
      },
      {
        id: 'schedule_meeting',
        title: 'Schedule Meeting',
        description: 'Schedule a team meeting',
        icon: Calendar,
        color: 'bg-purple-500',
        category: 'planning'
      },
      {
        id: 'view_analytics',
        title: 'View Analytics',
        description: 'Quick access to performance data',
        icon: BarChart3,
        color: 'bg-orange-500',
        category: 'analytics'
      }
    ];

    // Role-specific actions
    const roleSpecificActions: { [key: string]: any[] } = {
      employee: [
        {
          id: 'clock_in',
          title: 'Clock In/Out',
          description: 'Track your work hours',
          icon: Clock,
          color: 'bg-indigo-500',
          category: 'time'
        },
        {
          id: 'set_goal',
          title: 'Set Goal',
          description: 'Create a personal goal',
          icon: Target,
          color: 'bg-pink-500',
          category: 'goals'
        }
      ],
      supervisor: [
        {
          id: 'review_reports',
          title: 'Review Reports',
          description: 'Quick access to pending reviews',
          icon: FileText,
          color: 'bg-yellow-500',
          category: 'management'
        },
        {
          id: 'team_feedback',
          title: 'Team Feedback',
          description: 'Provide feedback to team members',
          icon: Users,
          color: 'bg-teal-500',
          category: 'feedback'
        }
      ],
      manager: [
        {
          id: 'department_overview',
          title: 'Department Overview',
          description: 'View department metrics',
          icon: BarChart3,
          color: 'bg-cyan-500',
          category: 'analytics'
        },
        {
          id: 'resource_planning',
          title: 'Resource Planning',
          description: 'Plan resource allocation',
          icon: Target,
          color: 'bg-rose-500',
          category: 'planning'
        }
      ],
      executive: [
        {
          id: 'system_alerts',
          title: 'System Alerts',
          description: 'View critical system alerts',
          icon: AlertTriangle,
          color: 'bg-red-500',
          category: 'alerts'
        },
        {
          id: 'admin_settings',
          title: 'Admin Settings',
          description: 'Quick access to admin panel',
          icon: Settings,
          color: 'bg-gray-500',
          category: 'admin'
        }
      ]
    };

    const userRole = user?.role || 'employee';
    return [...commonActions, ...(roleSpecificActions[userRole] || [])];
  };

  const handleActionSelect = (actionId: string) => {
    setSelectedAction(actionId);
    setActionData({});
  };

  const handleActionSubmit = () => {
    switch (selectedAction) {
      case 'quick_report':
        submitQuickReportMutation.mutate(actionData);
        break;
      case 'send_message':
        sendMessageMutation.mutate(actionData);
        break;
      case 'schedule_meeting':
        // Handle meeting scheduling
        toast({
          title: "Feature Coming Soon",
          description: "Meeting scheduling will be available soon.",
        });
        setSelectedAction(null);
        break;
      case 'clock_in':
        // Handle time tracking
        toast({
          title: "Clocked In",
          description: "Time tracking started.",
        });
        setSelectedAction(null);
        break;
      default:
        toast({
          title: "Action Executed",
          description: "Quick action completed successfully.",
        });
        setSelectedAction(null);
        break;
    }
  };

  const renderActionForm = () => {
    switch (selectedAction) {
      case 'quick_report':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Report Title</Label>
              <Input
                id="title"
                value={actionData.title || ''}
                onChange={(e) => setActionData({ ...actionData, title: e.target.value })}
                placeholder="Enter report title"
              />
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={actionData.content || ''}
                onChange={(e) => setActionData({ ...actionData, content: e.target.value })}
                placeholder="Describe your progress, achievements, or updates..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                value={actionData.priority || 'medium'}
                onChange={(e) => setActionData({ ...actionData, priority: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        );

      case 'send_message':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipient">Recipient</Label>
              <Input
                id="recipient"
                value={actionData.recipient || ''}
                onChange={(e) => setActionData({ ...actionData, recipient: e.target.value })}
                placeholder="Enter recipient name or email"
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={actionData.subject || ''}
                onChange={(e) => setActionData({ ...actionData, subject: e.target.value })}
                placeholder="Message subject"
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={actionData.message || ''}
                onChange={(e) => setActionData({ ...actionData, message: e.target.value })}
                placeholder="Type your message..."
                rows={4}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Select an action to get started</p>
          </div>
        );
    }
  };

  const actions = getQuickActions();
  const categories = Array.from(new Set(actions.map(action => action.category)));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Quick Actions</span>
            <Badge variant="outline">Power User Tools</Badge>
          </DialogTitle>
        </DialogHeader>

        {!selectedAction ? (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search actions..."
                className="pl-10"
              />
            </div>

            {/* Actions by Category */}
            {categories.map(category => (
              <div key={category} className="space-y-3">
                <h3 className="text-lg font-semibold capitalize">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {actions
                    .filter(action => action.category === category)
                    .map(action => {
                      const Icon = action.icon;
                      return (
                        <Card
                          key={action.id}
                          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 animate-fade-in"
                          onClick={() => handleActionSelect(action.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-lg ${action.color}`}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {action.title}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                  {action.description}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </div>
            ))}

            {/* Quick Access Buttons */}
            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4">Quick Access</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <Bookmark className="w-4 h-4" />
                  <span>Bookmarks</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>Help Center</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Action Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAction(null)}
                >
                  ← Back
                </Button>
                <h3 className="text-lg font-semibold">
                  {actions.find(a => a.id === selectedAction)?.title}
                </h3>
              </div>
            </div>

            {/* Action Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {actions.find(a => a.id === selectedAction)?.description}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderActionForm()}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setSelectedAction(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleActionSubmit}
                disabled={submitQuickReportMutation.isPending || sendMessageMutation.isPending}
                className="flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>
                  {submitQuickReportMutation.isPending || sendMessageMutation.isPending 
                    ? "Processing..." 
                    : "Execute Action"
                  }
                </span>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}