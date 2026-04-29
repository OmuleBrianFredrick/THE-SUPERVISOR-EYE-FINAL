import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ClipboardList, Plus, Trash2, X } from "lucide-react";

type Template = {
  id: number;
  organizationId: number | null;
  name: string;
  description: string | null;
  questions: string[];
  createdAt: string;
};

export default function ReviewTemplatesPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) window.location.href = "/login";
  }, [isLoading, isAuthenticated]);

  const canManage =
    user?.role === "executive" || user?.role === "manager" || (user as any)?.isSuperAdmin;

  const templatesQuery = useQuery<Template[]>({
    queryKey: ["/api/review-templates"],
    enabled: isAuthenticated,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<string[]>([""]);

  const reset = () => {
    setName("");
    setDescription("");
    setQuestions([""]);
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/review-templates", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/review-templates"] });
      setDialogOpen(false);
      reset();
      toast({ title: "Template created" });
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/review-templates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/review-templates"] });
      toast({ title: "Template removed" });
    },
  });

  const submit = () => {
    if (!name.trim()) return toast({ title: "Name is required", variant: "destructive" });
    const cleaned = questions.map((q) => q.trim()).filter(Boolean);
    if (cleaned.length === 0) return toast({ title: "Add at least one question", variant: "destructive" });
    createMutation.mutate({ name: name.trim(), description: description.trim() || null, questions: cleaned });
  };

  const templates = templatesQuery.data || [];

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-7 h-7 text-primary" />
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Review Templates</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Build reusable performance review questionnaires for your team.
                </p>
              </div>
            </div>
            {canManage && (
              <Button onClick={() => { reset(); setDialogOpen(true); }} data-testid="button-new-template">
                <Plus className="w-4 h-4 mr-2" />
                New template
              </Button>
            )}
          </div>

          {templatesQuery.isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : templates.length === 0 ? (
            <Card>
              <CardContent className="text-center py-16">
                <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No review templates yet.</p>
                {canManage && (
                  <Button onClick={() => { reset(); setDialogOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create your first template
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((t) => (
                <Card key={t.id} className="shadow-sm border border-gray-100 hover:shadow-md transition-shadow" data-testid={`card-template-${t.id}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">{t.name}</h3>
                        {t.description && <p className="text-sm text-gray-500 mt-1">{t.description}</p>}
                        <Badge variant="outline" className="mt-2">
                          {t.questions.length} question{t.questions.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      {canManage && (
                        <button
                          onClick={() => deleteMutation.mutate(t.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          data-testid={`button-delete-template-${t.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <ol className="mt-4 space-y-1.5 text-sm text-gray-700 list-decimal list-inside">
                      {t.questions.slice(0, 5).map((q, i) => (
                        <li key={i} className="truncate">{q}</li>
                      ))}
                      {t.questions.length > 5 && (
                        <li className="text-xs text-gray-400 list-none">+ {t.questions.length - 5} more…</li>
                      )}
                    </ol>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New review template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Template name *</Label>
              <Input
                placeholder="Quarterly performance review"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="input-template-name"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Textarea
                rows={2}
                placeholder="When to use this template…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Questions</Label>
              {questions.map((q, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    placeholder={`Question ${idx + 1}`}
                    value={q}
                    onChange={(e) => {
                      const next = [...questions];
                      next[idx] = e.target.value;
                      setQuestions(next);
                    }}
                    data-testid={`input-template-question-${idx}`}
                  />
                  <button
                    onClick={() => {
                      if (questions.length === 1) return;
                      setQuestions(questions.filter((_, i) => i !== idx));
                    }}
                    className="text-gray-400 hover:text-red-500 px-2"
                    type="button"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuestions([...questions, ""])}
                type="button"
                data-testid="button-add-question"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add question
              </Button>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={submit}
                disabled={createMutation.isPending}
                data-testid="button-save-template"
              >
                Create template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
