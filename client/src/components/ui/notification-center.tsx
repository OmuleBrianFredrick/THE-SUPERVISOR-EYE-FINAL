import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  X,
  Check,
  Clock,
  AlertCircle,
  MessageSquare,
  FileText,
  Users,
  CheckCircle2,
  Filter,
  MoreHorizontal,
  Star,
  Archive
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ open, onClose }: NotificationCenterProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: open,
  });

  // Mark notifications as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationIds: number[]) => {
      for (const id of notificationIds) {
        await apiRequest(`/api/notifications/${id}/read`, { method: "PATCH" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
      setSelectedNotifications([]);
    },
  });

  // Archive notifications
  const archiveMutation = useMutation({
    mutationFn: async (notificationIds: number[]) => {
      for (const id of notificationIds) {
        await apiRequest(`/api/notifications/${id}/archive`, { method: "PATCH" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      setSelectedNotifications([]);
      toast({
        title: "Notifications Archived",
        description: `${selectedNotifications.length} notifications moved to archive.`,
      });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'report_submitted': return FileText;
      case 'report_reviewed': return CheckCircle2;
      case 'meeting_scheduled': return Clock;
      case 'team_update': return Users;
      case 'message': return MessageSquare;
      case 'alert': return AlertCircle;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string, isRead: boolean) => {
    if (isRead) return "text-gray-500";
    
    switch (type) {
      case 'alert': return "text-red-500";
      case 'report_submitted': return "text-blue-500";
      case 'report_reviewed': return "text-green-500";
      case 'meeting_scheduled': return "text-purple-500";
      case 'team_update': return "text-orange-500";
      default: return "text-gray-700";
    }
  };

  const filteredNotifications = notifications.filter((notification: any) => {
    if (selectedTab === "unread") return !notification.isRead;
    if (selectedTab === "important") return notification.priority === "high";
    if (selectedTab === "archived") return notification.archived;
    return !notification.archived;
  });

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate([notification.id]);
    }

    // Handle navigation based on notification type
    switch (notification.type) {
      case 'report_submitted':
        window.location.href = `/reports`;
        break;
      case 'report_reviewed':
        window.location.href = `/reports`;
        break;
      case 'meeting_scheduled':
        // Handle meeting navigation
        break;
      case 'team_update':
        window.location.href = `/team`;
        break;
      default:
        break;
    }
  };

  const handleSelectNotification = (notificationId: number) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleMarkAllAsRead = () => {
    const unreadIds = filteredNotifications
      .filter((n: any) => !n.isRead)
      .map((n: any) => n.id);
    
    if (unreadIds.length > 0) {
      markAsReadMutation.mutate(unreadIds);
    }
  };

  const mockNotifications = [
    {
      id: 1,
      type: 'report_submitted',
      title: 'New Report Submitted',
      message: 'John Doe has submitted their weekly performance report.',
      isRead: false,
      priority: 'medium',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      user: { firstName: 'John', lastName: 'Doe' }
    },
    {
      id: 2,
      type: 'report_reviewed',
      title: 'Report Reviewed',
      message: 'Your weekly report has been reviewed with a rating of 4.5/5.',
      isRead: false,
      priority: 'high',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      user: { firstName: 'Manager', lastName: 'Smith' }
    },
    {
      id: 3,
      type: 'meeting_scheduled',
      title: 'Team Meeting Scheduled',
      message: 'Weekly team sync scheduled for tomorrow at 2:00 PM.',
      isRead: true,
      priority: 'medium',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      user: { firstName: 'Sarah', lastName: 'Johnson' }
    },
    {
      id: 4,
      type: 'alert',
      title: 'Performance Alert',
      message: 'Your team\'s completion rate has dropped below 85%.',
      isRead: false,
      priority: 'high',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      user: { firstName: 'System', lastName: '' }
    }
  ];

  // Use mock data if no real notifications
  const displayNotifications = filteredNotifications.length > 0 ? filteredNotifications : mockNotifications;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notification Center</span>
              <Badge variant="outline" className="ml-2">
                {displayNotifications.filter((n: any) => !n.isRead).length} unread
              </Badge>
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="important">Important</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>

            {/* Action Bar */}
            <div className="flex items-center justify-between py-3 border-b flex-shrink-0">
              <div className="flex items-center space-x-2">
                {selectedNotifications.length > 0 ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markAsReadMutation.mutate(selectedNotifications)}
                      disabled={markAsReadMutation.isPending}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Mark Read
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => archiveMutation.mutate(selectedNotifications)}
                      disabled={archiveMutation.isPending}
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {selectedNotifications.length} selected
                    </span>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleMarkAllAsRead}
                    disabled={markAsReadMutation.isPending}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark All Read
                  </Button>
                )}
              </div>
              <Button size="sm" variant="ghost">
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            <TabsContent value={selectedTab} className="flex-1 overflow-y-auto space-y-2 mt-0 pt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : displayNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No notifications to display</p>
                </div>
              ) : (
                displayNotifications.map((notification: any) => {
                  const Icon = getNotificationIcon(notification.type);
                  const isSelected = selectedNotifications.includes(notification.id);
                  
                  return (
                    <Card
                      key={notification.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        !notification.isRead ? 'bg-blue-50 border-blue-200' : ''
                      } ${isSelected ? 'ring-2 ring-primary' : ''}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectNotification(notification.id)}
                            className="mt-1"
                            onClick={(e) => e.stopPropagation()}
                          />
                          
                          <div className={`p-2 rounded-full ${!notification.isRead ? 'bg-primary/10' : 'bg-gray-100'}`}>
                            <Icon className={`w-4 h-4 ${getNotificationColor(notification.type, notification.isRead)}`} />
                          </div>
                          
                          <div className="flex-1 min-w-0" onClick={() => handleNotificationClick(notification)}>
                            <div className="flex items-center justify-between">
                              <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                                {notification.title}
                              </h4>
                              <div className="flex items-center space-x-2">
                                {notification.priority === 'high' && (
                                  <Star className="w-4 h-4 text-orange-500" />
                                )}
                                <span className="text-xs text-gray-500">
                                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                            
                            <p className={`text-sm mt-1 ${!notification.isRead ? 'text-gray-700' : 'text-gray-500'}`}>
                              {notification.message}
                            </p>
                            
                            {notification.user && (
                              <div className="flex items-center space-x-2 mt-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-xs">
                                    {`${notification.user.firstName[0]}${notification.user.lastName[0] || ''}`}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-gray-500">
                                  {notification.user.firstName} {notification.user.lastName}
                                </span>
                              </div>
                            )}
                            
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-primary rounded-full absolute top-4 right-4"></div>
                            )}
                          </div>
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