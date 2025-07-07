import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ThemeSelector from "@/components/ui/theme-selector";
import NotificationCenter from "@/components/ui/notification-center";
import QuickActionsPanel from "@/components/ui/quick-actions-panel";
import { 
  Bell, 
  ChevronDown, 
  LogOut, 
  User, 
  Settings, 
  Palette, 
  Zap,
  HelpCircle,
  Shield,
  Search,
  Menu
} from "lucide-react";

export default function Navbar() {
  const { user } = useAuth();
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const { data: notificationCount } = useQuery({
    queryKey: ["/api/notifications/unread-count"],
    refetchInterval: 30000,
  });

  const getRoleColor = (role?: string) => {
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

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case "executive": return "Executive";
      case "manager": return "Manager";
      case "supervisor": return "Supervisor";
      case "employee": return "Employee";
      default: return "User";
    }
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <>
      <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Shield className="w-8 h-8 text-primary animate-bounce-gentle" />
                <div>
                  <h1 className="text-xl font-bold text-primary">THE SUPERVISOR</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 hidden md:block">Performance Management</p>
                </div>
              </div>
              {user && (
                <Badge className={`${getRoleColor(user.role)} text-white text-xs px-2 py-1 ml-2`}>
                  {getRoleDisplayName(user.role)}
                </Badge>
              )}
            </div>

            {/* Search Bar - Hidden on mobile */}
            <div className="hidden lg:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search reports, team members..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Quick Actions */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowQuickActions(true)}
                className="hidden md:flex items-center space-x-2 hover:bg-primary/10"
              >
                <Zap className="h-4 w-4" />
                <span className="hidden lg:inline">Actions</span>
              </Button>

              {/* Theme Selector */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowThemeSelector(true)}
                className="hidden md:flex hover:bg-primary/10"
                title="Theme Settings"
              >
                <Palette className="h-4 w-4" />
              </Button>

              {/* Notifications */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative p-2 hover:bg-primary/10"
                onClick={() => setShowNotifications(true)}
                title="Notifications"
              >
                <Bell className="h-5 w-5 text-gray-400" />
                {notificationCount && notificationCount.count > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse"
                  >
                    {notificationCount.count > 9 ? "9+" : notificationCount.count}
                  </Badge>
                )}
              </Button>
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-3 hover:bg-primary/10">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.profileImageUrl} />
                      <AvatarFallback className={`${getRoleColor(user?.role)} text-white text-sm font-medium`}>
                        {getInitials(user?.firstName, user?.lastName, user?.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.firstName} {user?.lastName || user?.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {getRoleDisplayName(user?.role)}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 animate-scale-in">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    className="flex items-center space-x-2"
                    onClick={() => setShowThemeSelector(true)}
                  >
                    <Palette className="h-4 w-4" />
                    <span>Theme Preferences</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    className="flex items-center space-x-2"
                    onClick={() => setShowQuickActions(true)}
                  >
                    <Zap className="h-4 w-4" />
                    <span>Quick Actions</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="flex items-center space-x-2">
                    <HelpCircle className="h-4 w-4" />
                    <span>Help & Support</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    className="flex items-center space-x-2 text-red-600 dark:text-red-400"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu */}
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="lg:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Modals */}
      <ThemeSelector open={showThemeSelector} onClose={() => setShowThemeSelector(false)} />
      <NotificationCenter open={showNotifications} onClose={() => setShowNotifications(false)} />
      <QuickActionsPanel open={showQuickActions} onClose={() => setShowQuickActions(false)} />
    </>
  );
}
