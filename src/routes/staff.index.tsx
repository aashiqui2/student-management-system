import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api, API_BASE, type DesignationApi } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit2, Mail, Phone, Briefcase, Trash2, ShieldAlert } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/staff/")({
  component: StaffManagement,
});

type StaffProfile = {
  id: number;
  name: string;
  email: string;
  mobileNumber?: string;
  linkedInUrl?: string;
  stream?: string;
  specialization?: string;
  profilePhotoUrl?: string;
  designation?: DesignationApi;
  employeeId?: string;
  createdAt?: string;
  user?: {
    id: number;
    username: string;
    role: string;
    enabled: boolean;
  };
};

function StaffManagement() {
  const { isAdmin, isStaff, user } = useAuth();
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [designations, setDesignations] = useState<DesignationApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<StaffProfile>>({});
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      toast.error("Unauthorized access");
      navigate({ to: "/dashboard" });
      return;
    }
    fetchStaff();
    fetchDesignations();
  }, [isAdmin]);

  const fetchStaff = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/staff`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      if (res.ok) {
        setStaffList(await res.json());
      } else {
        toast.error("Failed to load staff");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  const fetchDesignations = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/staff/designations`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      if (res.ok) {
        setDesignations(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditClick = (staff: StaffProfile) => {
    setEditingId(staff.id);
    setFormData({ ...staff });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingId) return;

    try {
      const res = await fetch(`${API_BASE}/api/staff/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Staff details updated successfully");
        setDialogOpen(false);
        setEditingId(null);
        setFormData({});
        fetchStaff();
      } else {
        toast.error("Failed to update staff details");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to update staff details");
    }
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingId(null);
    setFormData({});
  };

  const handleDelete = async (staff: StaffProfile) => {
    if (!window.confirm(`Are you sure you want to delete ${staff.name}? This will also remove their user account.`)) {
      return;
    }
    try {
      await api.deleteStaff(staff.id);
      toast.success("Staff deleted successfully");
      fetchStaff();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to delete staff");
    }
  };

  const handleToggleStatus = async (userId?: number) => {
    if (!userId) {
      toast.error("User account not linked to this staff profile");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      if (res.ok) {
        toast.success("Status updated successfully");
        fetchStaff();
      } else {
        toast.error("Failed to update status");
      }
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate({ to: "/dashboard" })}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Staff Management
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">{staffList.length} staff members</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">All Staff</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : staffList.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">No staff members found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                    <th className="px-4 py-3 font-semibold w-[120px]">Staff ID</th>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Stream</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Created Date</th>
                    <th className="px-4 py-3 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {staffList.map((staff) => (
                    <tr key={staff.id} className="group transition-colors hover:bg-muted/50">
                      {/* Staff ID */}
                      <td className="px-4 py-3 font-mono text-xs font-semibold">
                        {staff.employeeId || <span className="text-xs text-muted-foreground italic">Pending</span>}
                      </td>

                      {/* Name / Photo */}
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            {staff.profilePhotoUrl ? (
                              <AvatarImage src={`${API_BASE}${staff.profilePhotoUrl}`} alt={staff.name} />
                            ) : null}
                            <AvatarFallback className="bg-accent text-primary text-xs font-bold">
                              {staff.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-sm">{staff.name}</div>
                            {staff.designation && (
                              <div className="text-xs text-muted-foreground">
                                {staff.designation.designationName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 text-xs truncate max-w-[180px]" title={staff.email}>
                        {staff.email || <span className="text-xs text-muted-foreground">—</span>}
                      </td>

                      {/* Stream */}
                      <td className="px-4 py-3">
                        {staff.stream ? (
                          <Badge variant="outline">{staff.stream}</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <Badge
                          variant={staff.user?.enabled !== false ? "default" : "secondary"}
                          className="min-w-[60px] justify-center text-xs"
                        >
                          {staff.user?.enabled !== false ? "Active" : "Disabled"}
                        </Badge>
                      </td>

                      {/* Created Date */}
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : "—"}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditClick(staff)}
                                className="h-7 px-2 text-xs transition-all hover:border-primary hover:text-primary hover:bg-primary/5"
                                title="Edit"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleStatus(staff.user?.id)}
                                disabled={!staff.user}
                                className="h-7 px-2 text-xs transition-all hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 disabled:opacity-40"
                              >
                                {staff.user?.enabled !== false ? "Disable" : "Enable"}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(staff)}
                                className="h-7 px-2 text-xs transition-all hover:bg-red-700"
                                title="Delete"
                              >
                                Delete
                              </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Staff Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="employeeId">Staff ID / Employee ID</Label>
              <Input
                id="employeeId"
                value={formData.employeeId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, employeeId: e.target.value })
                }
                placeholder="e.g. STF001"
              />
            </div>

            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                value={formData.mobileNumber || ""}
                onChange={(e) =>
                  setFormData({ ...formData, mobileNumber: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="stream">Stream</Label>
              <Select
                value={formData.stream || ""}
                onValueChange={(val) => setFormData({ ...formData, stream: val, specialization: "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stream" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B.Tech">B.Tech</SelectItem>
                  <SelectItem value="M.Tech">M.Tech</SelectItem>
                  <SelectItem value="B.Sc">B.Sc</SelectItem>
                  <SelectItem value="M.Sc">M.Sc</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="designation">Designation</Label>
              <Select
                value={formData.designation?.id?.toString() || ""}
                onValueChange={(val) => {
                  const desig = designations.find((d) => d.id === Number(val));
                  setFormData({ ...formData, designation: desig });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  {designations.map((d) => (
                    <SelectItem key={d.id} value={d.id.toString()}>
                      {d.designationName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="specialization">Specialization</Label>
              <Select
                value={formData.specialization || ""}
                onValueChange={(val) => setFormData({ ...formData, specialization: val })}
                disabled={!formData.stream}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CSE">CSE (Computer Science)</SelectItem>
                  <SelectItem value="IT">IT (Information Technology)</SelectItem>
                  <SelectItem value="ECE">ECE (Electronics & Communication)</SelectItem>
                  <SelectItem value="AIDS">AIDS (AI & Data Science)</SelectItem>
                  <SelectItem value="CSBS">CSBS (Computer Science & Business)</SelectItem>
                  <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input
                id="linkedin"
                type="url"
                value={formData.linkedInUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, linkedInUrl: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
