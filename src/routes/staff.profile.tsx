import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useEffect, useState, useRef } from "react";
import { api, type StaffProfileApi, type DesignationApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { 
  Mail, Phone, Briefcase, Linkedin, Github, Globe, Lock, Camera, 
  Trash2, Calendar, MapPin, Award, User as UserIcon, ShieldAlert 
} from "lucide-react";
import { API_BASE } from "@/lib/api";

export const Route = createFileRoute("/staff/profile")({
  component: StaffProfilePage,
});

function StaffProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isStaff, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not staff
  useEffect(() => {
    if (!isStaff) {
      navigate({ to: "/dashboard" });
    }
  }, [isStaff, navigate]);

  const { data: staffProfile, isLoading: isLoadingProfile, error: profileError } = useQuery({
    queryKey: ["staffProfile"],
    queryFn: () => api.getCurrentStaffProfile(),
    retry: false, // Don't infinite retry if 404
  });

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: "",
      email: "",
      mobileNumber: "",
      linkedInUrl: "",
      specialization: "",
      gender: "",
      dateOfBirth: "",
      address: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
      qualification: "",
      experience: 0,
      githubUrl: "",
      portfolioUrl: "",
    },
  });

  // Change Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const isProfileIncomplete = staffProfile && !staffProfile.name;

  useEffect(() => {
    if (staffProfile) {
      // Normalize dateOfBirth: might be an array [y,m,d], object, or ISO string
      const normalizeDateStr = (val: any): string => {
        if (!val) return "";
        if (typeof val === "string") return val.slice(0, 10); // take YYYY-MM-DD part
        if (Array.isArray(val) && val.length >= 3) {
          const [y, m, d] = val;
          return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        }
        return "";
      };

      reset({
        name: staffProfile.name || "",
        email: staffProfile.email || "",
        mobileNumber: staffProfile.mobileNumber || "",
        linkedInUrl: staffProfile.linkedInUrl || "",
        specialization: staffProfile.specialization || "",
        gender: staffProfile.gender || "",
        dateOfBirth: normalizeDateStr(staffProfile.dateOfBirth),
        address: staffProfile.address || "",
        city: staffProfile.city || "",
        state: staffProfile.state || "",
        country: staffProfile.country || "",
        pincode: staffProfile.pincode || "",
        qualification: staffProfile.qualification || "",
        experience: staffProfile.experience || 0,
        githubUrl: staffProfile.githubUrl || "",
        portfolioUrl: staffProfile.portfolioUrl || "",
      });

      // Force editing if profile is incomplete
      if (isProfileIncomplete) {
        setIsEditing(true);
      }
    }
  }, [staffProfile, reset, isProfileIncomplete]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<StaffProfileApi>) =>
      api.updateCurrentStaffProfile(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffProfile"] });
      toast.success("Profile saved successfully");
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: api.changePassword,
    onSuccess: () => {
      toast.success("Password changed successfully");
      setPasswordDialogOpen(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to change password. Make sure current password is correct.");
    },
  });

  const onSubmit = (data: any) => {
    // Strip empty strings so they don't overwrite existing data with blanks
    const payload: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== "" && value !== null && value !== undefined) {
        payload[key] = value;
      }
    }
    updateMutation.mutate(payload as any);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, and PNG formats are allowed");
      return;
    }

    try {
      await api.uploadStaffPhoto(file);
      queryClient.invalidateQueries({ queryKey: ["staffProfile"] });
      toast.success("Profile picture updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload photo");
    }
  };

  const handleRemovePhoto = async () => {
    if (!confirm("Are you sure you want to remove your profile picture?")) return;
    try {
      await api.deleteStaffPhoto();
      queryClient.invalidateQueries({ queryKey: ["staffProfile"] });
      toast.success("Profile picture removed");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove photo");
    }
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Confirm password does not match new password");
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  if (isLoadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground animate-pulse">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Handle case where profile doesn't exist (returns 404)
  const profile = staffProfile || {
    name: "",
    email: "",
    mobileNumber: "",
    linkedInUrl: "",
    specialization: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    qualification: "",
    experience: 0,
    githubUrl: "",
    portfolioUrl: "",
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {isProfileIncomplete && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 flex gap-3 items-start shadow-sm">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold">Complete Your Profile</h4>
            <p className="text-sm text-amber-700">Please fill out your personal details and Employee ID to complete your profile registration.</p>
          </div>
        </div>
      )}

      {/* Main Profile Info Banner */}
      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl">
        <CardContent className="p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="relative group">
            <Avatar className="w-24 h-24 border-4 border-white/20 shadow-xl rounded-full">
              {profile.profilePhotoUrl && profile.id ? (
                <AvatarImage src={`${API_BASE}/api/staff/${profile.id}/photo`} alt={profile.name} />
              ) : null}
              <AvatarFallback className="bg-white/10 text-white text-3xl font-bold">
                {profile.name ? profile.name.charAt(0).toUpperCase() : user?.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity cursor-pointer">
              <button 
                onClick={() => fileInputRef.current?.click()} 
                title="Upload Photo"
                className="p-1.5 bg-white/20 rounded-full hover:bg-white/40 transition text-white"
              >
                <Camera className="w-4 h-4" />
              </button>
              {profile.profilePhotoUrl && (
                <button 
                  onClick={handleRemovePhoto} 
                  title="Remove Photo"
                  className="p-1.5 bg-red-500/80 rounded-full hover:bg-red-500 transition text-white"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".jpg,.jpeg,.png"
              onChange={handlePhotoUpload} 
            />
          </div>

          <div className="text-center md:text-left flex-1 space-y-1">
            <h2 className="text-3xl font-extrabold tracking-tight">{profile.name || "Set Name"}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-white/80 text-sm">
              {profile.employeeId && (
                <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-mono">
                  ID: {profile.employeeId}
                </span>
              )}
              {profile.designation && (
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" /> {profile.designation.name || (profile.designation as any).designationName}
                </span>
              )}
              {profile.department && (
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold">
                  {profile.department}
                </span>
              )}
              {profile.stream && (
                <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-semibold">
                  {profile.stream}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
            {!isEditing && (
              <Button 
                onClick={() => setIsEditing(true)} 
                className="bg-white text-blue-700 hover:bg-white/90 shadow-md font-semibold"
              >
                Edit Profile
              </Button>
            )}
            <Button 
              onClick={() => setPasswordDialogOpen(true)} 
              className="bg-white/20 text-white hover:bg-white/30 border border-white/40 font-semibold shadow"
            >
              <Lock className="w-4 h-4 mr-2" /> Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <Card className="shadow-sm border-border">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-blue-600" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                disabled={!isEditing}
                placeholder="Full Name"
                {...register("name", { required: "Name is required" })}
                className="mt-1.5"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                disabled={!isEditing}
                placeholder="your@email.com"
                {...register("email", { 
                  pattern: { value: /^\S+@\S+$/i, message: "Invalid email format" }
                })}
                className="mt-1.5"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input
                id="mobileNumber"
                disabled={!isEditing}
                placeholder="10 digit mobile number"
                {...register("mobileNumber", { 
                  pattern: { value: /^\d{10}$/i, message: "Mobile number must be 10 digits" }
                })}
                className="mt-1.5"
              />
              {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber.message}</p>}
            </div>

            <div>
              <Label htmlFor="gender">Gender</Label>
              {isEditing ? (
                <select
                  id="gender"
                  {...register("gender")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1.5"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <Input id="gender" disabled value={profile.gender || "—"} className="mt-1.5" />
              )}
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                disabled={!isEditing}
                {...register("dateOfBirth")}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                disabled={!isEditing}
                placeholder="Street address"
                {...register("address")}
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  disabled={!isEditing}
                  placeholder="City"
                  {...register("city")}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  disabled={!isEditing}
                  placeholder="State"
                  {...register("state")}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  disabled={!isEditing}
                  placeholder="Country"
                  {...register("country")}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  disabled={!isEditing}
                  placeholder="Pincode"
                  {...register("pincode")}
                  className="mt-1.5"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card className="shadow-sm border-border">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" /> Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="employeeId">Employee ID (Read Only)</Label>
              <Input
                id="employeeId"
                disabled
                value={profile.employeeId || "Not assigned by Admin"}
                className="mt-1.5 bg-muted/50"
              />
            </div>

            <div>
              <Label htmlFor="department">Department (Read Only)</Label>
              <Input
                id="department"
                disabled
                value={profile.department || "Not assigned"}
                className="mt-1.5 bg-muted/50"
              />
            </div>

            <div>
              <Label htmlFor="stream">Stream (Read Only)</Label>
              <Input
                id="stream"
                disabled
                value={profile.stream || "Not assigned"}
                className="mt-1.5 bg-muted/50"
              />
            </div>

            <div>
              <Label htmlFor="designation">Designation (Read Only)</Label>
              <Input
                id="designation"
                disabled
                value={profile.designation ? (profile.designation.name || (profile.designation as any).designationName) : "Not assigned"}
                className="mt-1.5 bg-muted/50"
              />
            </div>

            <div>
              <Label htmlFor="joiningDate">Joining Date (Read Only)</Label>
              <Input
                id="joiningDate"
                disabled
                value={profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : "—"}
                className="mt-1.5 bg-muted/50"
              />
            </div>

            <div>
              <Label htmlFor="qualification">Qualification</Label>
              <Input
                id="qualification"
                disabled={!isEditing}
                placeholder="e.g. M.Tech, Ph.D."
                {...register("qualification")}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                disabled={!isEditing}
                placeholder="e.g. Machine Learning, Cyber Security"
                {...register("specialization")}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                disabled={!isEditing}
                placeholder="Years"
                {...register("experience", { valueAsNumber: true })}
                className="mt-1.5"
              />
            </div>
          </CardContent>
        </Card>

        {/* Online Profiles */}
        <Card className="shadow-sm border-border">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" /> Online Profiles
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="linkedInUrl" className="flex items-center gap-1.5">
                <Linkedin className="w-4 h-4 text-blue-600" /> LinkedIn URL
              </Label>
              <Input
                id="linkedInUrl"
                disabled={!isEditing}
                placeholder="https://linkedin.com/in/..."
                {...register("linkedInUrl")}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="githubUrl" className="flex items-center gap-1.5">
                <Github className="w-4 h-4 text-gray-800" /> GitHub URL
              </Label>
              <Input
                id="githubUrl"
                disabled={!isEditing}
                placeholder="https://github.com/..."
                {...register("githubUrl")}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="portfolioUrl" className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-green-600" /> Portfolio Website
              </Label>
              <Input
                id="portfolioUrl"
                disabled={!isEditing}
                placeholder="https://yourportfolio.com"
                {...register("portfolioUrl")}
                className="mt-1.5"
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Information Card */}
        <Card className="shadow-sm border-border bg-muted/10">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Account Metadata (Read Only)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground block">Username</span>
              <span className="font-semibold text-foreground">{user?.username}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">System Role</span>
              <span className="font-semibold text-foreground">{profile.user?.role || "STAFF"}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Account Status</span>
              <span className={`font-semibold ${profile.user?.enabled !== false ? 'text-green-600' : 'text-red-500'}`}>
                {profile.user?.enabled !== false ? 'Active' : 'Disabled'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Created Date</span>
              <span className="font-semibold text-foreground">
                {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 shadow"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
            {!isProfileIncomplete && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  reset();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
          </div>
        )}
      </form>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleChangePasswordSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="currPass">Current Password</Label>
              <Input
                id="currPass"
                type="password"
                required
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPass">New Password</Label>
              <Input
                id="newPass"
                type="password"
                required
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confPass">Confirm Password</Label>
              <Input
                id="confPass"
                type="password"
                required
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setPasswordDialogOpen(false)}
                disabled={changePasswordMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
