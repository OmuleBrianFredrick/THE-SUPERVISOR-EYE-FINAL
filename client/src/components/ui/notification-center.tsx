import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  X,
  Clock,
  AlertCircle,
  MessageSquare,
  FileText,
  Users,
  CheckCircle2,
  Target,
  Mail,
  CreditCard,
  Megaphone,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
}

type Notification = {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationCenter({ open, onClose }: NotificationCenterProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("all");

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: open,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/notifications/${id}/read`, { method: "PATCH" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("/api/notifications/read-all", { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
      toast({ title: "All caught up", description: "All notifications marked as read." });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "report_submitted": return FileText;
      case "report_reviewed": return CheckCircle2;
      case "revision_requested": return AlertCircle;
      case "task_assigned": return CheckCircle2;
      case "task_completed": return CheckCircle2;
      case "goal_assigned": return Target;
      case "invitation_accepted": return Users;
      case "team_update": return Users;
      case "billing": return CreditCard;
      case "broadcast": return Megaphone;
      case "message": return MessageSquare;
      case "alert": return AlertCircle;
      case "meeting_scheduled": return Clock;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string, isRead: boolean) => {
    if (isRead) return "text-gray-500";
    switch (type) {
      case "alert":
      case "revision_requested": return "text-red-500";
      case "report_submitted": return "text-blue-500";
      case "report_reviewed":
      case "task_completed": return "text-green-500";
      case "goal_assigned": return "text-amber-500";
      case "invitation_accepted":
      case "team_update": return "text-orange-500";
      case "billing": return "text-purple-500";
      case "broadcast": return "text-indigo-500";
      default: return "text-gray-700 dark:text-gray-200";
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (selectedTab === "unread") return !n.isRead;
    return true;
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    switch (notification.type) {
      case "report_submitted":
      case "report_reviewed":
      case "revision_requested":
        window.location.href = "/reports";
        break;
      case "task_assigned":
      case "task_completed":
        window.location.href = "/tasks";
        break;
      case "goal_assigned":
        window.location.href = "/goals";
        break;
      case "invitation_accepted":
      case "team_update":
        window.location.href = "/team";
        break;
      case "billing":
        window.location.href = "/billing";
        break;
      default:
        break;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notification Center</span>
              {unreadCount > 0 && (
                <Badge variant="outline" className="ml-2" data-testid="badge-unread-count">
                  {unreadCount} unread
                </Badge>
              )}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-notifications">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
              <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
              <TabsTrigger value="unread" data-testid="tab-unread">Unread</TabsTrigger>
            </TabsList>

            <div className="flex items-center justify-between py-3 border-b flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending || unreadCount === 0}
                data-testid="button-mark-all-read"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark all read
              </Button>
            </div>

            <TabsContent value={selectedTab} className="flex-1 overflow-y-auto space-y-2 mt-0 pt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500" data-testid="text-no-notifications">
                    {selectedTab === "unread" ? "No unread notifications" : "No notifications yet"}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  return (
                    <Card
                      key={notification.id}
                      className={`cursor-pointer transition-all hover-elevate active-elevate-2 ${
                        !notification.isRead ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900" : ""
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                      data-testid={`card-notification-${notification.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full ${!notification.isRead ? "bg-primary/10" : "bg-gray-100 dark:bg-gray-800"}`}>
                            <Icon className={`w-4 h-4 ${getNotificationColor(notification.type, !!notification.isRead)}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className={`text-sm font-medium ${!notification.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                                {notification.title}
                              </h4>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <p className={`text-sm mt-1 ${!notification.isRead ? "text-foreground/80" : "text-muted-foreground"}`}>
                              {notification.message}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
