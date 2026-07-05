import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api, API_BASE, type DesignationApi, type StaffProfileApi } from "@/lib/api";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { ArrowLeft, Edit2, Mail, Phone, Briefcase, Trash2, ShieldAlert, Eye, MapPin, GraduationCap, Clock, Github, Globe } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/staff/")({
  component: StaffManagement,
});

// removed old StaffProfile definition in favor of StaffProfileApi

function StaffManagement() {
  const { isAdmin, isStaff, user } = useAuth();
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState<StaffProfileApi[]>([]);
  const [designations, setDesignations] = useState<DesignationApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<StaffProfileApi>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [staffToView, setStaffToView] = useState<StaffProfileApi | null>(null);

  const DEPARTMENTS = [
    {
      label: "Engineering",
      options: [
        { label: "Computer Science and Engineering (CSE)", value: "Computer Science and Engineering (CSE)" },
        { label: "Information Technology (IT)", value: "Information Technology (IT)" },
        { label: "Artificial Intelligence and Machine Learning (AI & ML)", value: "Artificial Intelligence and Machine Learning (AI & ML)" },
        { label: "Artificial Intelligence and Data Science (AI & DS)", value: "Artificial Intelligence and Data Science (AI & DS)" },
        { label: "Computer Science and Business Systems (CSBS)", value: "Computer Science and Business Systems (CSBS)" },
        { label: "Computer Engineering", value: "Computer Engineering" },
        { label: "Cyber Security", value: "Cyber Security" },
        { label: "Data Science", value: "Data Science" },
        { label: "Internet of Things (IoT)", value: "Internet of Things (IoT)" },
        { label: "Robotics and Artificial Intelligence", value: "Robotics and Artificial Intelligence" },
        { label: "Software Engineering", value: "Software Engineering" },
        { label: "Cloud Computing", value: "Cloud Computing" },
        { label: "Blockchain Technology", value: "Blockchain Technology" }
      ]
    },
    {
      label: "Arts & Science",
      options: [
        { label: "B.Sc Computer Science", value: "B.Sc Computer Science" },
        { label: "B.Sc Information Technology", value: "B.Sc Information Technology" },
        { label: "B.Sc Artificial Intelligence", value: "B.Sc Artificial Intelligence" },
        { label: "B.Sc Artificial Intelligence and Machine Learning", value: "B.Sc Artificial Intelligence and Machine Learning" },
        { label: "B.Sc Data Science", value: "B.Sc Data Science" },
        { label: "B.Sc Cyber Security", value: "B.Sc Cyber Security" },
        { label: "B.Sc Computer Technology", value: "B.Sc Computer Technology" },
        { label: "B.Sc Software Systems", value: "B.Sc Software Systems" },
        { label: "B.Sc Computer Applications", value: "B.Sc Computer Applications" }
      ]
    }
  ];

  const SPECIALIZATIONS = [
    { label: "General", value: "General" },
    { label: "Artificial Intelligence", value: "Artificial Intelligence" },
    { label: "Machine Learning", value: "Machine Learning" },
    { label: "Artificial Intelligence & Machine Learning", value: "Artificial Intelligence & Machine Learning" },
    { label: "Data Science", value: "Data Science" },
    { label: "Cyber Security", value: "Cyber Security" },
    { label: "Information Security", value: "Information Security" },
    { label: "Ethical Hacking", value: "Ethical Hacking" },
    { label: "Cloud Computing", value: "Cloud Computing" },
    { label: "DevOps", value: "DevOps" },
    { label: "Internet of Things (IoT)", value: "IoT" },
    { label: "Blockchain", value: "Blockchain" },
    { label: "Full Stack Development", value: "Full Stack Development" },
    { label: "Software Engineering", value: "Software Engineering" },
    { label: "Mobile Application Development", value: "Mobile Application Development" },
    { label: "Web Development", value: "Web Development" },
    { label: "Computer Networks", value: "Computer Networks" },
    { label: "Network Security", value: "Network Security" },
    { label: "Database Management", value: "Database Management" },
    { label: "Computer Vision", value: "Computer Vision" },
    { label: "Natural Language Processing (NLP)", value: "NLP" },
    { label: "Robotics", value: "Robotics" },
    { label: "Embedded Systems", value: "Embedded Systems" },
    { label: "Big Data Analytics", value: "Big Data Analytics" },
    { label: "Game Development", value: "Game Development" },
    { label: "AR/VR", value: "AR/VR" },
    { label: "Quantum Computing", value: "Quantum Computing" }
  ];

  const STREAMS = [
    {
      label: "Engineering",
      options: [
        { label: "B.E.", value: "B.E." },
        { label: "B.Tech.", value: "B.Tech." }
      ]
    },
    {
      label: "Arts & Science",
      options: [
        { label: "B.Sc", value: "B.Sc" }
      ]
    },
    {
      label: "Commerce",
      options: [
        { label: "B.Com", value: "B.Com" },
        { label: "B.Com Computer Applications", value: "B.Com Computer Applications" },
        { label: "B.Com Information Systems", value: "B.Com Information Systems" }
      ]
    },
    {
      label: "Management",
      options: [
        { label: "BBA", value: "BBA" },
        { label: "BBA Computer Applications", value: "BBA Computer Applications" }
      ]
    },
    {
      label: "Postgraduate",
      options: [
        { label: "M.E.", value: "M.E." },
        { label: "M.Tech.", value: "M.Tech." },
        { label: "MCA", value: "MCA" },
        { label: "M.Sc", value: "M.Sc" }
      ]
    },
    {
      label: "Diploma",
      options: [
        { label: "Diploma in Computer Engineering", value: "Diploma in Computer Engineering" },
        { label: "Diploma in Information Technology", value: "Diploma in Information Technology" },
        { label: "Diploma in AI & ML", value: "Diploma in AI & ML" },
        { label: "Diploma in Cyber Security", value: "Diploma in Cyber Security" },
        { label: "Diploma in Data Science", value: "Diploma in Data Science" }
      ]
    }
  ];

  const QUALIFICATIONS = [
    {
      label: "Postgraduate",
      options: [
        { label: "Ph.D.", value: "Ph.D." },
        { label: "M.E.", value: "M.E." },
        { label: "M.Tech.", value: "M.Tech." },
        { label: "M.Sc.", value: "M.Sc." },
        { label: "MCA", value: "MCA" },
        { label: "MBA", value: "MBA" }
      ]
    },
    {
      label: "Undergraduate",
      options: [
        { label: "B.E.", value: "B.E." },
        { label: "B.Tech.", value: "B.Tech." },
        { label: "B.Sc.", value: "B.Sc." },
        { label: "BCA", value: "BCA" },
        { label: "BBA", value: "BBA" }
      ]
    },
    {
      label: "Diploma",
      options: [
        { label: "Diploma", value: "Diploma" }
      ]
    }
  ];

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

  const handleEditClick = (staff: StaffProfileApi) => {
    setEditingId(staff.id);
    setFormData({ ...staff });
    setDialogOpen(true);
  };

  const handleViewClick = (staff: StaffProfileApi) => {
    setStaffToView(staff);
    setViewDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingId) return;

    if (formData.mobileNumber && formData.mobileNumber.length !== 10) {
      toast.error("Mobile number must be exactly 10 digits");
      return;
    }

    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Please enter a valid email address");
        return;
      }
    }

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

  const handleDelete = async (staff: StaffProfileApi) => {
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
                              <AvatarImage src={`${API_BASE}/api/staff/${staff.id}/photo`} alt={staff.name} />
                            ) : null}
                            <AvatarFallback className="bg-accent text-primary text-xs font-bold">
                              {staff.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-sm">{staff.name}</div>
                            {staff.designation && (
                              <div className="text-xs text-muted-foreground">
                                {staff.designation.name}
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
                                onClick={() => handleViewClick(staff)}
                                className="h-7 px-2 text-xs transition-all hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                title="View Details"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
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

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="professional">Professional</TabsTrigger>
              <TabsTrigger value="additional">Additional Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 pt-4">
              <div>
                <Label htmlFor="employeeId">Staff ID / Employee ID</Label>
                <Input
                  id="employeeId"
                  value={formData.employeeId || ""}
                  disabled={true}
                  className="bg-muted"
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender || ""}
                    onValueChange={(val) => setFormData({ ...formData, gender: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="professional" className="space-y-4 pt-4">
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
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Department</Label>
                <SearchableSelect 
                  groups={DEPARTMENTS} 
                  value={formData.department} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, department: val }))} 
                  placeholder="Select Department" 
                  modal={true}
                />
              </div>

              <div>
                <Label>Stream</Label>
                <SearchableSelect 
                  groups={STREAMS} 
                  value={formData.stream} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, stream: val, specialization: "" }))} 
                  placeholder="Select Stream" 
                  modal={true}
                />
              </div>

              <div>
                <Label>Specialization</Label>
                <SearchableSelect 
                  options={SPECIALIZATIONS} 
                  value={formData.specialization} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, specialization: val }))} 
                  placeholder="Select Specialization" 
                  modal={true}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Qualification</Label>
                  <SearchableSelect 
                    groups={QUALIFICATIONS} 
                    value={formData.qualification} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, qualification: val }))} 
                    placeholder="Select Qualification" 
                    modal={true}
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Experience (Years)</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={formData.experience || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, experience: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="additional" className="space-y-4 pt-4">
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, pincode: e.target.value })
                    }
                  />
                </div>
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
              
              <div>
                <Label htmlFor="github">GitHub URL</Label>
                <Input
                  id="github"
                  type="url"
                  value={formData.githubUrl || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, githubUrl: e.target.value })
                  }
                />
              </div>
              
              <div>
                <Label htmlFor="portfolio">Portfolio URL</Label>
                <Input
                  id="portfolio"
                  type="url"
                  value={formData.portfolioUrl || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, portfolioUrl: e.target.value })
                  }
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* View Staff Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <Avatar className="h-12 w-12 border shadow-sm">
                {staffToView?.profilePhotoUrl ? (
                  <AvatarImage src={`${API_BASE}/api/staff/${staffToView.id}/photo`} />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary">
                  {staffToView?.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div>{staffToView?.name}</div>
                <div className="text-sm font-normal text-muted-foreground mt-1">
                  {staffToView?.designation?.name || "No Designation"} • {staffToView?.employeeId || "No ID"}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {staffToView && (
            <div className="py-4 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</div>
                  <div className="font-medium text-sm truncate" title={staffToView.email}>{staffToView.email || "—"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Mobile</div>
                  <div className="font-medium text-sm">{staffToView.mobileNumber || "—"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Gender</div>
                  <div className="font-medium text-sm">{staffToView.gender || "—"}</div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Department</div>
                  <div className="font-medium text-sm">{staffToView.department || "—"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Stream</div>
                  <div className="font-medium text-sm">{staffToView.stream || "—"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Specialization</div>
                  <div className="font-medium text-sm">{staffToView.specialization || "—"}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" /> Qualification</div>
                  <div className="font-medium text-sm">{staffToView.qualification || "—"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> Experience</div>
                  <div className="font-medium text-sm">{staffToView.experience !== undefined && staffToView.experience !== null ? `${staffToView.experience} Years` : "—"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Joining Date</div>
                  <div className="font-medium text-sm">{staffToView.joiningDate ? new Date(staffToView.joiningDate).toLocaleDateString() : "—"}</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Location & Address</div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Address</div>
                  <div className="font-medium text-sm">
                    {staffToView.address || staffToView.city || staffToView.state ? (
                      <>
                        {staffToView.address && <span>{staffToView.address}, </span>}
                        {staffToView.city && <span>{staffToView.city}, </span>}
                        {staffToView.state && <span>{staffToView.state} </span>}
                        {staffToView.pincode && <span>- {staffToView.pincode}</span>}
                        {staffToView.country && <div>{staffToView.country}</div>}
                      </>
                    ) : "—"}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Links & Profiles</div>
                <div className="flex flex-wrap gap-4">
                  {staffToView.linkedInUrl && (
                    <a href={staffToView.linkedInUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline">
                      <Globe className="w-4 h-4" /> LinkedIn
                    </a>
                  )}
                  {staffToView.githubUrl && (
                    <a href={staffToView.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:underline">
                      <Github className="w-4 h-4" /> GitHub
                    </a>
                  )}
                  {staffToView.portfolioUrl && (
                    <a href={staffToView.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:underline">
                      <Globe className="w-4 h-4" /> Portfolio
                    </a>
                  )}
                  {!staffToView.linkedInUrl && !staffToView.githubUrl && !staffToView.portfolioUrl && (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
