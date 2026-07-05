import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { ArrowLeft, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import {
  PURSUING_YEARS,
  useSMS,
  type Student,
} from "@/lib/sms-data";
import { useAuth } from "@/lib/auth";

const ENGG_DEPARTMENTS = ["ECE", "EEE", "MECH", "CIVIL", "CSBS", "IT", "AIDS", "CSE"];
const ARTS_SCIENCE_DEPARTMENTS = ["CS", "Physics", "Chemistry", "Mathematics", "Commerce", "English", "Economics"];
const DEGREES = ["BE", "B.Tech", "B.Sc", "BA", "B.Com"];
const SECTIONS = ["A", "B", "C", "D"];
const YEAR_OPTIONS = Array.from({ length: 2030 - 2018 + 1 }, (_, index) => String(2018 + index));
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { API_BASE } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormValues = Omit<Student, "id">;

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function StudentForm({ id }: { id?: string }) {
  const navigate = useNavigate();
  const { getStudent, addStudent, updateStudent, removeStudentPhoto } = useSMS();
  const { isStudent, isAdmin } = useAuth();
  const [profilePic, setProfilePic] = useState<File | undefined>(undefined);
  const [removeProfilePic, setRemoveProfilePic] = useState(false);
  const isEdit = Boolean(id);
  const existing = id ? getStudent(id) : undefined;
  // Students can only edit their own social links & mobile
  const isReadOnly = isStudent && isEdit;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: existing ?? { pursuingYear: "" },
  });

  const pursuingYear = watch("pursuingYear");
  const department = watch("department");
  const degree = watch("degree");
  const startYear = watch("startYear");
  const endYear = watch("endYear");

  const isEngineering = degree === "BE" || degree === "B.Tech";
  const isBachelor = degree === "B.Sc" || degree === "BA" || degree === "B.Com";
  
  const availableDepartments = isEngineering 
    ? ENGG_DEPARTMENTS 
    : isBachelor 
      ? ARTS_SCIENCE_DEPARTMENTS 
      : [];

  // Reset department if the available options change and current isn't valid
  useEffect(() => {
    if (department && availableDepartments.length > 0 && !availableDepartments.includes(department)) {
      setValue("department", "");
    }
  }, [availableDepartments, department, setValue]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const onSubmit = async (data: FormValues) => {
    const start = Number(data.startYear);
    const end = Number(data.endYear);
    const expectedDuration = (data.degree === "BE" || data.degree === "B.Tech") ? 4 : 3;

    if (data.startYear && data.endYear) {
      if (end - start !== expectedDuration) {
        setError("endYear", {
          type: "validate",
          message: `For ${data.degree}, graduation must be exactly ${expectedDuration} years after Start Year.`,
        });
        return;
      }
    }

    clearErrors("endYear");

    try {
      if (isEdit && id) {
        if (removeProfilePic) {
          await removeStudentPhoto(id);
        }
        await updateStudent(id, data, profilePic);
        toast.success("Student updated");
      } else {
        await addStudent(data, profilePic);
        toast.success("Student registered");
      }
      navigate({ to: "/students" });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save student. Please try again.",
      );
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate({ to: "/students" })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEdit ? "Edit Student Profile" : "Register New Student"}
        </h1>
      </div>

      <Card>
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <section>
              <h2 className="mb-1 text-lg font-bold text-primary">Basic Information</h2>
              <Separator className="mb-5" />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Full Name" error={errors.name?.message}>
                  <Input {...register("name", { required: "Name is required" })} disabled={isReadOnly} />
                </Field>
                <Field label="Registration Number" error={errors.regNo?.message}>
                  <Input
                    {...register("regNo", { required: "Registration number is required" })}
                    disabled={isReadOnly}
                  />
                </Field>
                <Field label="Email Address" error={errors.email?.message}>
                  <Input
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" },
                    })}
                    disabled={isReadOnly}
                  />
                </Field>
                <Field label="Mobile Number (Optional)" error={errors.mobileNumber?.message}>
                  <Input
                    {...register("mobileNumber", {
                      pattern: {
                        value: /^([0-9]{10})?$/,
                        message: "Must be exactly 10 digits if provided",
                      },
                    })}
                  />
                </Field>
              </div>
            </section>

            <section>
              <h2 className="mb-1 text-lg font-bold text-primary">Academic Details</h2>
              <Separator className="mb-5" />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Stream" error={errors.degree?.message}>
                  <Select
                    value={degree || ""}
                    onValueChange={(v) =>
                      setValue("degree", v as FormValues["degree"])
                    }
                    disabled={isStudent}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stream" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEGREES.map((deg) => (
                        <SelectItem key={deg} value={deg}>
                          {deg}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Specialization (Department)" error={errors.department?.message}>
                  <Select
                    value={department || ""}
                    onValueChange={(v) =>
                      setValue("department", v as FormValues["department"])
                    }
                    disabled={isStudent || !degree}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={degree ? "Select specialization" : "Select stream first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDepartments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.department?.message && <p className="text-xs text-destructive">{errors.department.message}</p>}
                </Field>
                <Field label="Start Year" error={errors.startYear?.message}>
                  <Select
                    value={startYear || ""}
                    onValueChange={(v) => setValue("startYear", v)}
                    disabled={isStudent}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select start year" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEAR_OPTIONS.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="End Year (Graduation)" error={errors.endYear?.message}>
                  <Select
                    value={endYear || ""}
                    onValueChange={(v) => setValue("endYear", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select end year" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEAR_OPTIONS.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Pursuing Year" error={errors.pursuingYear?.message}>
                  <Select
                    value={pursuingYear || ""}
                    onValueChange={(v) =>
                      setValue("pursuingYear", v as FormValues["pursuingYear"])
                    }
                    disabled={isStudent}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {PURSUING_YEARS.map((y) => (
                        <SelectItem key={y.value} value={y.value}>
                          {y.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.pursuingYear?.message && <p className="text-xs text-destructive">{errors.pursuingYear.message}</p>}
                </Field>
              </div>
            </section>

            <section>
              <h2 className="mb-1 text-lg font-bold text-primary">Online Profiles</h2>
              <Separator className="mb-5" />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="HackerRank Username">
                  <Input {...register("hackerRankUsername")} />
                </Field>
                <Field label="LinkedIn URL">
                  <Input {...register("linkedInUrl")} />
                </Field>
                <Field label="GitHub URL">
                  <Input {...register("githubUrl")} />
                </Field>
                <Field label="LeetCode URL">
                  <Input {...register("leetcodeUrl")} />
                </Field>
              </div>
            </section>            <section>
              <h2 className="mb-1 text-lg font-bold text-primary">Profile Photo</h2>
              <Separator className="mb-5" />
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  {!removeProfilePic && profilePic ? (
                    <AvatarImage src={URL.createObjectURL(profilePic)} alt="Preview" />
                  ) : !removeProfilePic && existing?.profilePicUrl ? (
                    <AvatarImage src={`${API_BASE}/api/students/${existing.id}/photo`} alt="Current" />
                  ) : null}
                  <AvatarFallback className="bg-accent text-2xl text-primary">
                    {watch("name")?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-4">
                    <Label
                      htmlFor="profile-upload"
                      className="flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-4 py-2 hover:bg-accent hover:text-accent-foreground shadow-sm transition-colors"
                    >
                      <UploadCloud className="h-4 w-4" />
                      <span className="text-sm font-medium">Upload Photo</span>
                    </Label>
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        setProfilePic(file ?? undefined);
                        if (file) setRemoveProfilePic(false);
                      }}
                    />
                    {profilePic ? (
                      <p className="text-sm text-muted-foreground truncate max-w-[200px]" title={profilePic.name}>
                        {profilePic.name}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">No file chosen</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {existing?.profilePicUrl && !removeProfilePic && !profilePic && (
                      <Button type="button" variant="destructive" size="sm" onClick={() => setRemoveProfilePic(true)}>
                        Remove Photo
                      </Button>
                    )}
                    {(removeProfilePic || profilePic) && (
                      <Button type="button" variant="outline" size="sm" onClick={() => {
                        setRemoveProfilePic(false);
                        setProfilePic(undefined);
                      }}>
                        Undo
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </section>


            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/students" })}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEdit ? "Save Changes" : "Register Student"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
