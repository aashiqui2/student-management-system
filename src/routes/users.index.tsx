import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { API_BASE } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Edit, Power, Trash2, Search, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/users/")({
  component: UsersManagement,
});

type UserDto = {
  id: number;
  username: string;
  role: string;
  enabled: boolean;
  fullName?: string;
  regNo?: string;
  stream?: string;
  department?: string;
  specialization?: string;
  email?: string;
  profilePicUrl?: string;
  dateRegistered?: string;
};

function UsersManagement() {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Delete Modal
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Edit Modal
  const [userToEdit, setUserToEdit] = useState<UserDto | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: "", email: "", department: "", stream: "", specialization: "", regNo: "" });

  // View Modal
  const [userToView, setUserToView] = useState<UserDto | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      toast.error("Unauthorized access");
      navigate({ to: "/dashboard" });
      return;
    }
    fetchUsers();
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      if (res.ok) {
        setUsers(await res.json());
      } else {
        toast.error("Failed to load users");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id: number, newRole: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        toast.success("Role updated successfully");
        fetchUsers();
      } else {
        toast.error("Failed to update role");
      }
    } catch (e) {
      toast.error("Failed to update role");
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      if (res.ok) {
        toast.success("Status updated");
        fetchUsers();
      } else {
        toast.error("Failed to update status");
      }
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const confirmDelete = (id: number) => {
    setUserToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (userToDelete === null) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      if (res.ok) {
        toast.success("User deleted");
        fetchUsers();
      } else {
        const err = await res.text();
        toast.error(err || "Failed to delete user");
      }
    } catch (e) {
      toast.error("Failed to delete user");
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleEditSubmit = async () => {
    if (!userToEdit) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userToEdit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        toast.success("User updated");
        fetchUsers();
        setIsEditDialogOpen(false);
      } else {
        toast.error("Failed to update user");
      }
    } catch (e) {
      toast.error("Failed to update user");
    }
  };

  const openEditDialog = (u: UserDto) => {
    setUserToEdit(u);
    setEditForm({ 
      fullName: u.fullName || (u.role === "ADMIN" ? "Admin" : ""), 
      email: u.email || "",
      department: u.department || "",
      stream: u.stream || "",
      specialization: u.specialization || "",
      regNo: u.regNo || "" 
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (u: UserDto) => {
    setUserToView(u);
    setIsViewDialogOpen(true);
  };

  if (!isAdmin) return null;

  // Derived state for table
  const activeCount = users.filter((u) => u.enabled).length;
  const disabledCount = users.filter((u) => !u.enabled).length;

  const filteredUsers = users.filter((u) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      (u.fullName || "").toLowerCase().includes(searchLower) ||
      (u.username || "").toLowerCase().includes(searchLower) ||
      (u.email || "").toLowerCase().includes(searchLower);

    const isApplicant = u.role === "STUDENT" && u.username.endsWith("_staff");

    const matchesRole = roleFilter === "ALL" || 
                        u.role === roleFilter || 
                        (roleFilter === "STAFF_APPLICANT" && isApplicant);
    
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && u.enabled) ||
      (statusFilter === "DISABLED" && !u.enabled);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">Admin</Badge>;
      case "STAFF":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200">Staff</Badge>;
      case "STUDENT":
        return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200">Student</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const DEPARTMENTS = [
    {
      label: "Engineering",
      options: [
        { label: "Computer Science and Engineering (CSE)", value: "CSE" },
        { label: "Information Technology (IT)", value: "IT" },
        { label: "Artificial Intelligence and Machine Learning (AI & ML)", value: "AI & ML" },
        { label: "Artificial Intelligence and Data Science (AI & DS)", value: "AI & DS" },
        { label: "Computer Science and Business Systems (CSBS)", value: "CSBS" },
        { label: "Computer Engineering", value: "Computer Engineering" },
        { label: "Cyber Security", value: "Cyber Security" },
        { label: "Data Science", value: "Data Science" },
        { label: "Internet of Things (IoT)", value: "IoT" },
        { label: "Robotics and Artificial Intelligence", value: "Robotics and AI" },
        { label: "Software Engineering", value: "Software Engineering" },
        { label: "Cloud Computing", value: "Cloud Computing" },
        { label: "Blockchain Technology", value: "Blockchain Technology" }
      ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
      label: "Arts & Science",
      options: [
        { label: "B.Sc Computer Science", value: "B.Sc CS" },
        { label: "B.Sc Information Technology", value: "B.Sc IT" },
        { label: "B.Sc Artificial Intelligence", value: "B.Sc AI" },
        { label: "B.Sc Artificial Intelligence and Machine Learning", value: "B.Sc AI & ML" },
        { label: "B.Sc Data Science", value: "B.Sc Data Science" },
        { label: "B.Sc Cyber Security", value: "B.Sc Cyber Security" },
        { label: "B.Sc Computer Technology", value: "B.Sc Computer Technology" },
        { label: "B.Sc Software Systems", value: "B.Sc Software Systems" },
        { label: "B.Sc Computer Applications", value: "B.Sc Computer Applications" }
      ].sort((a, b) => a.label.localeCompare(b.label))
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
  ].sort((a, b) => a.label.localeCompare(b.label));

  const STREAMS = [
    {
      label: "Engineering",
      options: [
        { label: "B.E.", value: "B.E." },
        { label: "B.Tech.", value: "B.Tech." }
      ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
      label: "Arts & Science",
      options: [
        { label: "B.Sc", value: "B.Sc" }
      ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
      label: "Commerce",
      options: [
        { label: "B.Com", value: "B.Com" },
        { label: "B.Com Computer Applications", value: "B.Com Computer Applications" },
        { label: "B.Com Information Systems", value: "B.Com Information Systems" }
      ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
      label: "Management",
      options: [
        { label: "BBA", value: "BBA" },
        { label: "BBA Computer Applications", value: "BBA Computer Applications" }
      ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
      label: "Postgraduate",
      options: [
        { label: "M.E.", value: "M.E." },
        { label: "M.Tech.", value: "M.Tech." },
        { label: "MCA", value: "MCA" },
        { label: "M.Sc", value: "M.Sc" }
      ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
      label: "Diploma",
      options: [
        { label: "Diploma in Computer Engineering", value: "Diploma in Computer Engineering" },
        { label: "Diploma in Information Technology", value: "Diploma in Information Technology" },
        { label: "Diploma in AI & ML", value: "Diploma in AI & ML" },
        { label: "Diploma in Cyber Security", value: "Diploma in Cyber Security" },
        { label: "Diploma in Data Science", value: "Diploma in Data Science" }
      ].sort((a, b) => a.label.localeCompare(b.label))
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage user accounts and permissions.
          </p>
        </div>
        
        {/* Statistics */}
        <div className="flex gap-4 text-sm bg-background p-3 rounded-lg border shadow-sm">
          <div className="flex flex-col items-center px-2">
            <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Total Users</span>
            <span className="text-lg font-bold">{users.length}</span>
          </div>
          <div className="w-px bg-border"></div>
          <div className="flex flex-col items-center px-2">
            <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Active</span>
            <span className="text-lg font-bold text-emerald-600">{activeCount}</span>
          </div>
          <div className="w-px bg-border"></div>
          <div className="flex flex-col items-center px-2">
            <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Disabled</span>
            <span className="text-lg font-bold text-red-600">{disabledCount}</span>
          </div>
        </div>
      </div>

      <Card className="shadow-sm border-muted">
        <CardHeader className="pb-4 pt-5 border-b bg-muted/20">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search users..."
                className="pl-9 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filters */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[130px] bg-background">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Roles</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="STAFF_APPLICANT">Staff Applicant</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[130px] bg-background">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="DISABLED">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-background text-left text-muted-foreground">
                    <th className="px-5 py-4 font-semibold w-[70px]">Profile</th>
                    <th className="px-5 py-4 font-semibold">Full Name</th>
                    <th className="px-5 py-4 font-semibold">Username</th>
                    <th className="px-5 py-4 font-semibold w-[120px]">Status</th>
                    <th className="px-5 py-4 font-semibold w-[120px]">Role</th>
                    <th className="px-5 py-4 font-semibold text-right w-[180px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-muted-foreground">
                        No users found matching your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isAdminRow = u.role === "ADMIN";
                      
                      return (
                        <tr key={u.id} className="group transition-colors hover:bg-muted/30 bg-background">
                          {/* Profile */}
                          <td 
                            className="px-5 py-3 cursor-pointer hover:opacity-80"
                            onClick={() => toast.info(`Navigating to user details for ${u.username}`)}
                          >
                            <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-primary/20 transition-all shadow-sm">
                              {u.profilePicUrl ? (
                                <AvatarImage src={`${API_BASE}${u.profilePicUrl}`} alt={u.fullName || u.username} className="object-cover" />
                              ) : null}
                              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                                {(u.fullName || u.username).charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </td>

                          {/* Full Name */}
                          <td className="px-5 py-3 font-medium text-foreground">
                            {u.fullName || (isAdminRow ? "Admin" : <span className="text-xs italic text-muted-foreground">N/A</span>)}
                          </td>

                          {/* Username */}
                          <td 
                            className="px-5 py-3 font-mono text-sm cursor-pointer text-primary hover:underline hover:text-primary/80 transition-colors"
                            onClick={() => toast.info(`Navigating to user details for ${u.username}`)}
                          >
                            @{u.username}
                          </td>

                          {/* Status */}
                          <td className="px-5 py-3">
                            {u.enabled ? (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1.5 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                Disabled
                              </Badge>
                            )}
                          </td>

                          {/* Role Badge / Dropdown */}
                          <td className="px-5 py-3">
                            {isAdminRow ? (
                              getRoleBadge(u.role)
                            ) : (
                              <div className="flex items-center gap-2">
                                <Select 
                                  value={u.role} 
                                  onValueChange={(val) => handleRoleChange(u.id, val)}
                                >
                                  <SelectTrigger className="w-[110px] h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="STAFF">Staff</SelectItem>
                                    <SelectItem value="STUDENT">Student</SelectItem>
                                  </SelectContent>
                                </Select>
                                {u.role === "STUDENT" && u.username.endsWith("_staff") && (
                                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 whitespace-nowrap">Applicant</Badge>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <TooltipProvider delayDuration={150}>
                                {/* Approve Staff */}
                                {u.role === "STUDENT" && u.username.endsWith("_staff") && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-md"
                                        onClick={() => handleRoleChange(u.id, "STAFF")}
                                      >
                                        <UserCheck className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Approve as Staff</p></TooltipContent>
                                  </Tooltip>
                                )}

                                {/* View */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-md"
                                      onClick={() => openViewDialog(u)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent><p>View User</p></TooltipContent>
                                </Tooltip>
                                
                                {/* Edit */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-100 rounded-md"
                                      onClick={() => openEditDialog(u)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{isAdminRow ? "Edit Profile" : "Edit User"}</p>
                                  </TooltipContent>
                                </Tooltip>

                                {/* Disable/Enable & Delete (Hidden for Admin) */}
                                {!isAdminRow && (
                                  <>
                                    {/* Disable/Enable */}
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="icon"
                                          className={`h-8 w-8 rounded-md ${u.enabled ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100' : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100'}`}
                                          onClick={() => handleToggleStatus(u.id)}
                                        >
                                          <Power className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{u.enabled ? "Disable User" : "Enable User"}</p>
                                      </TooltipContent>
                                    </Tooltip>

                                    {/* Delete */}
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="icon"
                                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-md"
                                          onClick={() => confirmDelete(u.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent><p>Delete User</p></TooltipContent>
                                    </Tooltip>
                                  </>
                                )}
                              </TooltipProvider>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View User Modal */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {userToView && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {userToView.profilePicUrl ? (
                    <AvatarImage src={`${API_BASE}${userToView.profilePicUrl}`} />
                  ) : null}
                  <AvatarFallback>{(userToView.fullName || userToView.username).charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold">{userToView.fullName || (userToView.role === "ADMIN" ? "Admin" : "N/A")}</h3>
                  <p className="text-sm text-muted-foreground">@{userToView.username}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Role</p>
                  <p className="font-medium">{userToView.role}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium">{userToView.enabled ? "Active" : "Disabled"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{userToView.email || "N/A"}</p>
                </div>
                {userToView.role !== "ADMIN" && (
                  <>
                    <div>
                      <p className="text-muted-foreground">Reg/Emp No</p>
                      <p className="font-medium">{userToView.regNo || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Department</p>
                      <p className="font-medium">{userToView.department || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Stream</p>
                      <p className="font-medium">{userToView.stream || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Specialization</p>
                      <p className="font-medium">{userToView.specialization || "N/A"}</p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-muted-foreground">Joined</p>
                  <p className="font-medium">
                    {userToView.dateRegistered ? new Date(userToView.dateRegistered).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
            <DialogDescription>
              Update basic details for @{userToEdit?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input 
                value={editForm.fullName} 
                onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Full Name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                type="email"
                value={editForm.email} 
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Email Address"
              />
            </div>
            {userToEdit?.role !== "ADMIN" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <SearchableSelect 
                    groups={DEPARTMENTS} 
                    value={editForm.department} 
                    onValueChange={(val) => setEditForm(prev => ({ ...prev, department: val }))} 
                    placeholder="Select Department" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stream</Label>
                  <SearchableSelect 
                    groups={STREAMS} 
                    value={editForm.stream} 
                    onValueChange={(val) => setEditForm(prev => ({ ...prev, stream: val }))} 
                    placeholder="Select Stream" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Specialization</Label>
                  <SearchableSelect 
                    options={SPECIALIZATIONS} 
                    value={editForm.specialization} 
                    onValueChange={(val) => setEditForm(prev => ({ ...prev, specialization: val }))} 
                    placeholder="Select Specialization" 
                  />
                </div>
              </div>
            )}
            {userToEdit?.role === "STUDENT" && (
              <div className="space-y-2">
                <Label>Reg/Emp No</Label>
                <Input 
                  value={editForm.regNo} 
                  onChange={(e) => setEditForm(prev => ({ ...prev, regNo: e.target.value }))}
                  placeholder="Reg/Emp No"
                />
              </div>
            )}
          </div>
          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete User
            </DialogTitle>
            <DialogDescription className="py-4 text-base">
              Are you sure you want to permanently delete this user?
              <br /><br />
              <strong>This action cannot be undone.</strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={executeDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

