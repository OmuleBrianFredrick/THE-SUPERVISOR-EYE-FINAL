import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Sparkles, ArrowRight, X } from "lucide-react";
import { useState, useEffect } from "react";

type Item = { id: string; title: string; description: string; done: boolean; link: string };
type Onboarding = { items: Item[]; complete: boolean; percent: number };

const DISMISS_KEY = "onboarding-dismissed";

export default function OnboardingChecklist() {
  const { data, isLoading } = useQuery<Onboarding>({ queryKey: ["/api/onboarding"] });
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY) === "true") setDismissed(true);
  }, []);

  if (isLoading || !data || data.complete || dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  };

  return (
    <Card className="mb-6 border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-lg" data-testid="text-onboarding-title">
              Get started with The Supervisor
            </CardTitle>
          </div>
          <button
            onClick={handleDismiss}
            className="opacity-50 hover:opacity-100 p-1"
            aria-label="Dismiss"
            data-testid="button-dismiss-onboarding"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {data.items.filter((i) => i.done).length} of {data.items.length} complete
            </span>
            <span className="font-semibold text-blue-700 dark:text-blue-300" data-testid="text-onboarding-percent">
              {data.percent}%
            </span>
          </div>
          <Progress value={data.percent} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {data.items.map((item) => (
          <Link key={item.id} href={item.link}>
            <div
              className="flex items-start gap-3 p-3 rounded-md hover-elevate cursor-pointer"
              data-testid={`onboarding-item-${item.id}`}
            >
              {item.done ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    item.done ? "line-through text-muted-foreground" : "text-foreground"
                  }`}
                >
                  {item.title}
                </p>
                {!item.done && (
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                )}
              </div>
              {!item.done && <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />}
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
