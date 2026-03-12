import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
  Calendar,
  MessageSquare,
  Target,
  TrendingUp,
  Activity,
  PieChart,
  Briefcase,
  Shield,
  Building2,
  Crown,
  User,
  ChevronRight,
  Star,
  Network,
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "employee": return "role-employee";
      case "supervisor": return "role-supervisor";
      case "manager": return "role-manager";
      case "executive": return "role-executive";
      default: return "bg-gray-500";
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case "employee": return User;
      case "supervisor": return Users;
      case "manager": return Building2;
      case "executive": return Crown;
      default: return User;
    }
  };

  const getDashboardRoute = () => {
    switch (user?.role) {
      case "employee": return "/employee-dashboard";
      case "supervisor": return "/supervisor-dashboard";
      case "manager": return "/manager-dashboard";
      case "executive": return "/executive-dashboard";
      default: return "/";
    }
  };

  // Role-based navigation
  const getNavigationItems = () => {
    const commonItems = [
      { name: "Dashboard", href: getDashboardRoute(), icon: LayoutDashboard, badge: null },
      { name: "Reports", href: "/reports", icon: FileText, badge: null },
      { name: "Team", href: "/team", icon: Users, badge: null, requiresRole: ["supervisor", "manager", "executive"] },
      { name: "Analytics", href: "/analytics", icon: BarChart3, badge: null, requiresRole: ["supervisor", "manager", "executive"] },
      { name: "Org Chart", href: "/org-chart", icon: Network, badge: null, requiresRole: ["supervisor", "manager", "executive"] },
    ];

    const roleSpecificItems: { [key: string]: any[] } = {
      employee: [
        { name: "My Goals", href: "/goals", icon: Target, badge: null },
        { name: "Performance", href: "/performance", icon: TrendingUp, badge: null },
      ],
      supervisor: [
        { name: "Performance Reviews", href: "/reviews", icon: Star, badge: null },
      ],
      manager: [
        { name: "Department Overview", href: "/department", icon: PieChart, badge: null },
        { name: "Resource Planning", href: "/resources", icon: Briefcase, badge: null },
      ],
      executive: [
        { name: "Admin Dashboard", href: "/admin-dashboard", icon: Shield, badge: null },
        { name: "User Management", href: "/admin-users", icon: Users, badge: null },
      ]
    };

    const userRole = user?.role || 'employee';
    const specificItems = roleSpecificItems[userRole] || [];
    
    const allItems = [...commonItems, ...specificItems, 
      { name: "Settings", href: "/settings", icon: Settings, badge: null }
    ];

    // Filter by role requirements
    return allItems.filter(item => {
      if (!item.requiresRole) return true;
      return user && item.requiresRole.includes(user.role);
    });
  };

  const navigationItems = getNavigationItems();
  const RoleIcon = getRoleIcon(user?.role);

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 shadow-sm h-screen sticky top-0 border-r border-gray-200 dark:border-gray-700">
      {/* User Profile Card */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full ${getRoleColor(user?.role)} flex items-center justify-center mb-3 shadow-lg`}>
                <RoleIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate max-w-full">
                {user?.email}
              </p>
              <Badge variant="outline" className={`text-xs capitalize ${getRoleColor(user?.role)} text-white border-none`}>
                {user?.role}
              </Badge>
              {user?.department && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">
                  {user.department.replace('-', ' ')} Dept.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = location === item.href || 
            (item.href === getDashboardRoute() && location === "/") ||
            (item.href === "/" && location === getDashboardRoute());
          
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start group relative transition-all duration-200 h-11",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "hover:bg-primary/10 hover:scale-105"
                )}
              >
                <item.icon className={cn(
                  "mr-3 h-4 w-4 transition-transform duration-200",
                  isActive ? "scale-110" : "group-hover:scale-110"
                )} />
                <span className="flex-1 text-left">{item.name}</span>
                {item.badge && (
                  <Badge 
                    variant={isActive ? "secondary" : "outline"} 
                    className="ml-2 text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center"
                  >
                    {item.badge}
                  </Badge>
                )}
                {!isActive && (
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Quick Stats Card */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-0">
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-sm">
              <div className="space-y-1">
                <p className="text-gray-600 dark:text-gray-300 font-medium">Quick Stats</p>
                <div className="flex items-center space-x-4 text-xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Active</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Online</span>
                  </div>
                </div>
              </div>
              <Activity className="w-6 h-6 text-primary animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
