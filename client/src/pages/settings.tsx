import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import { User, Shield, Bell, Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
              <p className="text-muted-foreground">Manage your account settings and preferences.</p>
            </div>

            <div className="grid gap-6">
              <Card className="glass-card overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-4 py-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">First Name</label>
                      <input className="w-full p-2 rounded-md border bg-background/50" placeholder="John" disabled />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Last Name</label>
                      <input className="w-full p-2 rounded-md border bg-background/50" placeholder="Doe" disabled />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-4 py-4">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <Shield className="w-5 h-5 text-amber-500" />
                  </div>
                  <CardTitle className="text-xl">Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-background/30 border border-white/10">
                    <div>
                      <p className="font-medium">Authentication Status</p>
                      <p className="text-sm text-muted-foreground">You are currently logged in via Replit Auth.</p>
                    </div>
                    <div className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold uppercase tracking-wider">
                      Verified
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-4 py-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Bell className="w-5 h-5 text-blue-500" />
                  </div>
                  <CardTitle className="text-xl">Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">System Alerts</p>
                      <p className="text-sm text-muted-foreground">Receive notifications for system updates.</p>
                    </div>
                    <div className="w-12 h-6 bg-primary/20 rounded-full relative cursor-not-allowed opacity-50">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-primary rounded-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
