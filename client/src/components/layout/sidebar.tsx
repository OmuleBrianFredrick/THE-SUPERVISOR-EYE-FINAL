import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  BarChart3, 
  Settings 
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      current: location === "/",
    },
    {
      name: "Reports",
      href: "/reports", 
      icon: FileText,
      current: location === "/reports",
    },
    {
      name: "Team",
      href: "/team",
      icon: Users,
      current: location === "/team",
      requiresRole: ["supervisor", "manager", "executive"],
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      current: location === "/analytics",
      requiresRole: ["manager", "executive"],
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      current: location === "/settings",
    },
  ];

  const filteredNavigation = navigation.filter(item => {
    if (!item.requiresRole) return true;
    return user && item.requiresRole.includes(user.role);
  });

  return (
    <aside className="w-64 bg-white shadow-sm h-screen sticky top-0">
      <div className="p-6">
        <nav className="space-y-2">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <span
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer",
                    item.current
                      ? "text-primary bg-blue-50"
                      : "text-gray-600 hover:text-primary hover:bg-gray-50"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
