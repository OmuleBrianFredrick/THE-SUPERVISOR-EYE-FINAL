import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ReportModal from "@/components/reports/report-modal";
import { 
  Plus, 
  Users, 
  Calendar, 
  Download,
  FileText,
  BarChart3
} from "lucide-react";

export default function QuickActions() {
  const { user } = useAuth();
  const [showReportModal, setShowReportModal] = useState(false);

  const employeeActions = [
    {
      icon: Plus,
      label: "Create Report",
      color: "hover:border-primary hover:bg-blue-50",
      iconColor: "text-primary",
      action: () => setShowReportModal(true),
    },
    {
      icon: FileText,
      label: "View My Reports",
      color: "hover:border-green-500 hover:bg-green-50",
      iconColor: "text-green-500",
      action: () => window.location.href = "/reports",
    },
    {
      icon: BarChart3,
      label: "My Performance",
      color: "hover:border-purple-500 hover:bg-purple-50",
      iconColor: "text-purple-500",
      action: () => {}, // TODO: Implement
    },
    {
      icon: Download,
      label: "Export Data",
      color: "hover:border-gray-500 hover:bg-gray-50",
      iconColor: "text-gray-500",
      action: () => {}, // TODO: Implement
    },
  ];

  const supervisorActions = [
    {
      icon: Plus,
      label: "Create Report",
      color: "hover:border-primary hover:bg-blue-50",
      iconColor: "text-primary",
      action: () => setShowReportModal(true),
    },
    {
      icon: Users,
      label: "Manage Team",
      color: "hover:border-supervisor hover:bg-cyan-50",
      iconColor: "text-supervisor",
      action: () => window.location.href = "/team",
    },
    {
      icon: Calendar,
      label: "Schedule Review",
      color: "hover:border-orange-500 hover:bg-orange-50",
      iconColor: "text-orange-500",
      action: () => {}, // TODO: Implement
    },
    {
      icon: Download,
      label: "Export Data",
      color: "hover:border-green-500 hover:bg-green-50",
      iconColor: "text-green-500",
      action: () => {}, // TODO: Implement
    },
  ];

  const actions = user?.role === 'employee' ? employeeActions : supervisorActions;

  return (
    <>
      <Card className="shadow-sm border border-gray-100">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className={`flex items-center space-x-3 p-4 h-auto justify-start transition-colors ${action.color}`}
                  onClick={action.action}
                >
                  <Icon className={`${action.iconColor} text-xl h-6 w-6`} />
                  <span className="font-medium">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {showReportModal && (
        <ReportModal onClose={() => setShowReportModal(false)} />
      )}
    </>
  );
}
