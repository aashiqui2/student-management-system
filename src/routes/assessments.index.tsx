import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, ClipboardList, FileText } from "lucide-react";
import { useSMS } from "@/lib/sms-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/sms/EmptyState";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/assessments/")({
  head: () => ({
    meta: [
      { title: "Assessments — EduTrack" },
      { name: "description", content: "Create and manage assessments." },
    ],
  }),
  component: AssessmentList,
});

function AssessmentList() {
  const { assessments, deleteAssessment, deleteAssessmentsBulk, deleteAllAssessments } = useSMS();
  const { isAdmin, isStaff } = useAuth();
  const navigate = useNavigate();
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
            <ClipboardList className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
        </div>
        {(isAdmin || isStaff) && (
          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && selectedIds.size > 0 && (
              <Button variant="destructive" onClick={() => setShowBulkDeleteConfirm(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected ({selectedIds.size})
              </Button>
            )}
            {isAdmin && assessments.length > 0 && selectedIds.size === 0 && (
              <Button variant="destructive" onClick={() => setShowDeleteAllConfirm(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete All
              </Button>
            )}
            <Button onClick={() => navigate({ to: "/assessments/new" })}>
              <Plus className="mr-2 h-4 w-4" />
              Add Assessment
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {assessments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                    {isAdmin && (
                      <th className="px-5 py-3 w-[40px]">
                        <input
                          type="checkbox"
                          checked={assessments.length > 0 && selectedIds.size === assessments.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds(new Set(assessments.map((a) => a.id)));
                            } else {
                              setSelectedIds(new Set());
                            }
                          }}
                        />
                      </th>
                    )}
                    <th className="px-5 py-3 font-semibold">Assessment Name</th>
                    <th className="px-5 py-3 font-semibold">Date Conducted</th>
                    <th className="px-5 py-3 font-semibold">Total Marks</th>
                    <th className="px-5 py-3 font-semibold">Created By</th>
                    <th className="px-5 py-3 font-semibold">Resources</th>
                    {(isAdmin || isStaff) && <th className="px-5 py-3 text-center font-semibold">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((a) => (
                    <tr key={a.id} className="border-b transition-colors last:border-0 hover:bg-muted/40">
                      {isAdmin && (
                        <td className="px-5 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(a.id)}
                            onChange={(e) => {
                              const newSet = new Set(selectedIds);
                              if (e.target.checked) newSet.add(a.id);
                              else newSet.delete(a.id);
                              setSelectedIds(newSet);
                            }}
                          />
                        </td>
                      )}
                      <td className="px-5 py-3 font-semibold">{a.assessmentName}</td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {new Date(a.dateConducted).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant="secondary">{a.totalMarks}</Badge>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {a.createdBy || "—"}
                      </td>
                      <td className="px-5 py-3">
                        {a.resources && a.resources.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {a.resources.map((r, i) => (
                              <a
                                key={`${r.name}-${i}`}
                                href={r.downloadUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex max-w-[160px] items-center gap-1 rounded-md border bg-accent px-2 py-1 text-xs text-primary hover:underline"
                                title={r.name}
                              >
                                <FileText className="h-3 w-3 shrink-0" />
                                <span className="truncate">{r.name}</span>
                              </a>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>

                      {(isAdmin || isStaff) && (
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                navigate({
                                  to: "/assessments/edit/$id",
                                  params: { id: a.id },
                                })
                              }
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setToDelete(a.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              message="No assessments yet. Create one to start entering marks."
              actionLabel="Add Assessment"
              onAction={() => navigate({ to: "/assessments/new" })}
            />
          )}
        </CardContent>
      </Card>

      <AlertDialog open={toDelete !== null} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this assessment?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the assessment and all marks recorded against it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (toDelete) {
                  deleteAssessment(toDelete);
                  toast.success("Assessment deleted");
                }
                setToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} assessments?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the selected assessments and all marks recorded against them. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await deleteAssessmentsBulk(Array.from(selectedIds).map(Number));
                setSelectedIds(new Set());
                setShowBulkDeleteConfirm(false);
                toast.success(`${selectedIds.size} assessments deleted`);
              }}
            >
              Delete Selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteAllConfirm} onOpenChange={setShowDeleteAllConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete ALL assessments?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove ALL assessments and their marks from the system. This action cannot be undone!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={async () => {
                await deleteAllAssessments();
                setSelectedIds(new Set());
                setShowDeleteAllConfirm(false);
                toast.success("All assessments deleted");
              }}
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
