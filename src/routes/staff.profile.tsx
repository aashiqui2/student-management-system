import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
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
import { SearchableSelect } from "@/components/ui/searchable-select";
import { DEPARTMENTS, STREAMS, SPECIALIZATIONS } from "@/lib/constants";
import { toast } from "sonner";
import { 
  Mail, Phone, Briefcase, Linkedin, Github, Globe, Lock, Camera, 
  Trash2, Calendar, MapPin, Award, User as UserIcon, ShieldAlert,
  Eye, EyeOff, CheckCircle2, XCircle
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

  const { data: designations = [] } = useQuery({
    queryKey: ["designations"],
    queryFn: api.getDesignations,
  });

  const { register, handleSubmit, watch, reset, control, formState: { errors } } = useForm({
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
      designationId: "",
    },
  });

  // Change Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordRequirements = [
    { met: passwordData.newPassword.length >= 8, text: "At least 8 characters" },
    { met: /[A-Z]/.test(passwordData.newPassword), text: "One uppercase letter" },
    { met: /[a-z]/.test(passwordData.newPassword), text: "One lowercase letter" },
    { met: /[0-9]/.test(passwordData.newPassword), text: "One number" },
    { met: /[^A-Za-z0-9]/.test(passwordData.newPassword), text: "One special character" },
  ];

  const strength = passwordRequirements.filter(r => r.met).length;
  const strengthColor = strength <= 2 ? "bg-red-500" : strength <= 4 ? "bg-amber-500" : "bg-emerald-500";
  const strengthBgColor = strength <= 2 ? "bg-red-500/10" : strength <= 4 ? "bg-amber-500/10" : "bg-emerald-500/10";
  const strengthLabel = strength <= 2 ? "Weak" : strength <= 4 ? "Medium" : "Strong";

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
        username: staffProfile.user?.username || "",
        name: staffProfile.name || "",
        email: staffProfile.email || "",
        mobileNumber: staffProfile.mobileNumber || "",
        linkedInUrl: staffProfile.linkedInUrl || "",
        department: staffProfile.department || "",
        stream: staffProfile.stream || "",
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
        designationId: staffProfile.designation?.id?.toString() || "",
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
      const msg = error.message.replace(/API request failed: \d+ \w+ /, "");
      toast.error(msg || "Failed to change password. Make sure current password is correct.");
    },
  });

  const watchDesignationId = watch("designationId");
  const selectedDesignation = designations.find((d: any) => d.id.toString() === watchDesignationId);
  const designationName = selectedDesignation?.designationName || selectedDesignation?.name || "";
  const isTrainer = ["Technical Trainer", "Soft Skill Trainer", "Aptitude Trainer"].includes(designationName);
  const isFaculty = designationName === "College Faculty";

  const onSubmit = (data: any) => {
    const payload = { ...data };
    if (payload.designationId) {
      payload.designation = { id: parseInt(payload.designationId, 10) };
    }
    
    if (isTrainer) {
      payload.department = null;
      payload.stream = null;
    }
    
    delete payload.designationId;
    updateMutation.mutate(payload);
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
    if (strength < 5) {
      toast.error("New password does not meet all requirements");
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
            {isEditing && (
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
            )}
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
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>}
            </div>

            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                disabled={!isEditing}
                placeholder="Username"
                {...register("username", { 
                  required: "Username is required",
                  pattern: { value: /^[a-zA-Z0-9_]+$/, message: "Username can only contain letters, numbers, and underscores" },
                  minLength: { value: 3, message: "Username must be at least 3 characters" }
                })}
                className="mt-1.5"
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message as string}</p>}
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
                maxLength={10}
                placeholder="10 digit mobile number"
                {...register("mobileNumber", { 
                  pattern: { value: /^\d{10}$/i, message: "Mobile number must be 10 digits" },
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  }
                })}
                className="mt-1.5"
              />
              {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber.message as string}</p>}
            </div>

            <div>
              <Label htmlFor="gender">Gender</Label>
              {isEditing ? (
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <div className="mt-1.5">
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <SelectTrigger className="w-full bg-background border-input">
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />
              ) : (
                <Input id="gender" disabled value={profile.gender || "—"} className="mt-1.5 bg-muted/50" />
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
                value={profile.employeeId || "Will be generated automatically"}
                className="mt-1.5 bg-muted/50"
              />
            </div>

            <div>
              <Label htmlFor="designationId">Designation</Label>
              {isEditing ? (
                <Controller
                  name="designationId"
                  control={control}
                  render={({ field }) => (
                    <div className="mt-1.5">
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <SelectTrigger className="w-full bg-background border-input">
                          <SelectValue placeholder="Select Designation" />
                        </SelectTrigger>
                        <SelectContent>
                          {designations.map((d: any) => (
                            <SelectItem key={d.id} value={d.id.toString()}>
                              {d.designationName || d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />
              ) : (
                <Input
                  id="designationId"
                  disabled
                  value={profile.designation ? (profile.designation.name || (profile.designation as any).designationName) : "Not assigned"}
                  className="mt-1.5 bg-muted/50"
                />
              )}
            </div>

            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              <Label htmlFor="department">Department</Label>
              {isEditing ? (
                <Controller
                  name="department"
                  control={control}
                  rules={{ required: false }}
                  render={({ field }) => (
                    <div className="mt-1.5">
                      <SearchableSelect
                        groups={DEPARTMENTS}
                        value={field.value}
                        onValueChange={(val) => {
                          field.onChange(val);
                          setValue("stream", "");
                        }}
                        placeholder="Select Department"
                      />
                    </div>
                  )}
                />
              ) : (
                <Input
                  id="department"
                  disabled
                  value={profile.department || "Not specified"}
                  className="mt-1.5 bg-muted/50"
                />
              )}
            </div>

            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              <Label htmlFor="stream">Stream</Label>
              {isEditing ? (
                <Controller
                  name="stream"
                  control={control}
                  rules={{ required: false }}
                  render={({ field }) => (
                    <div className="mt-1.5">
                      <SearchableSelect
                        groups={STREAMS}
                        value={field.value}
                        onValueChange={(val) => {
                          field.onChange(val);
                          setValue("specialization", "");
                        }}
                        placeholder="Select Stream"
                      />
                    </div>
                  )}
                />
              ) : (
                <Input
                  id="stream"
                  disabled
                  value={profile.stream || "Not specified"}
                  className="mt-1.5 bg-muted/50"
                />
              )}
            </div>

            {(isTrainer || isFaculty) && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <Label htmlFor="qualification">Highest Qualification</Label>
                {isEditing ? (
                  <select
                    id="qualification"
                    {...register("qualification", { required: (isTrainer || isFaculty) ? "Qualification is required" : false })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1.5"
                  >
                    <option value="">Select Qualification</option>
                    <optgroup label="Postgraduate">
                      <option value="Ph.D.">Ph.D.</option>
                      <option value="M.E.">M.E.</option>
                      <option value="M.Tech.">M.Tech.</option>
                      <option value="M.Sc.">M.Sc.</option>
                      <option value="MCA">MCA</option>
                      <option value="MBA">MBA</option>
                    </optgroup>
                    <optgroup label="Undergraduate">
                      <option value="B.E.">B.E.</option>
                      <option value="B.Tech.">B.Tech.</option>
                      <option value="B.Sc.">B.Sc.</option>
                      <option value="BCA">BCA</option>
                      <option value="BBA">BBA</option>
                    </optgroup>
                    <optgroup label="Diploma">
                      <option value="Diploma">Diploma</option>
                    </optgroup>
                  </select>
                ) : (
                  <Input id="qualification" disabled value={profile.qualification || "—"} className="mt-1.5" />
                )}
                {errors.qualification && <p className="text-red-500 text-xs mt-1">{errors.qualification.message as string}</p>}
              </div>
            )}

            {(isTrainer || isFaculty) && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <Label htmlFor="specialization">Specialization</Label>
                {isEditing ? (
                  <Controller
                    name="specialization"
                    control={control}
                    rules={{ required: (isTrainer || isFaculty) ? "Specialization is required" : false }}
                    render={({ field }) => (
                      <div className="mt-1.5">
                        <SearchableSelect
                          options={SPECIALIZATIONS}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select Specialization"
                        />
                        {errors.specialization && <p className="text-red-500 text-xs mt-1">{errors.specialization.message as string}</p>}
                      </div>
                    )}
                  />
                ) : (
                  <Input id="specialization" disabled value={profile.specialization || "Not assigned"} className="mt-1.5 bg-muted/50" />
                )}
              </div>
            )}

            {(isTrainer || isFaculty) && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  disabled={!isEditing}
                  {...register("experience", { 
                    valueAsNumber: true,
                    required: (isTrainer || isFaculty) ? "Experience is required" : false 
                  })}
                  className="mt-1.5"
                />
                {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience.message as string}</p>}
              </div>
            )}

            {!isEditing && (
              <div>
                <Label htmlFor="joiningDate">Joining Date (Read Only)</Label>
                <Input
                  id="joiningDate"
                  disabled
                  value={profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : "—"}
                  className="mt-1.5 bg-muted/50"
                />
              </div>
            )}


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
              <div className="relative">
                <Input
                  id="currPass"
                  type={showCurrentPassword ? "text" : "password"}
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPass">New Password</Label>
              <div className="relative">
                <Input
                  id="newPass"
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {passwordData.newPassword && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strengthColor}`}
                        style={{ width: `${(strength / 5) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${strengthBgColor} ${strength <= 2 ? 'text-red-600' : strength <= 4 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {strengthLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {passwordRequirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs">
                        {req.met ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-slate-300" />
                        )}
                        <span className={req.met ? "text-slate-600" : "text-slate-400"}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confPass">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confPass"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
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
