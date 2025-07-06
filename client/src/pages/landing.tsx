import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">THE SUPERVISOR</h1>
          <p className="text-lg text-muted-foreground">Enterprise Performance Management</p>
        </div>
        
        <Card className="shadow-lg">
          <CardContent className="pt-6 p-8">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to THE SUPERVISOR</h2>
                <p className="text-gray-600 mb-6">
                  A hierarchical performance reporting and feedback platform for enterprise organizations.
                </p>
              </div>
              
              <Button 
                onClick={handleLogin}
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3"
                size="lg"
              >
                Sign In with Replit
              </Button>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  Don't have an account? Contact your administrator
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
