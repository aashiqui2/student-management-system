import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { ArrowLeft, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import {
  useSMS,
  type Student,
} from "@/lib/sms-data";
import { useAuth } from "@/lib/auth";

const STREAMS = ["B.Tech", "M.Tech", "B.Sc", "M.Sc"];
const SPECIALIZATIONS = ["CSE", "IT", "ECE", "AIDS", "CSBS", "Cybersecurity"];
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
import { SearchableSelect } from "@/components/ui/searchable-select";

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
    defaultValues: existing ?? {},
  });

  const startYear = watch("startYear");
  const courseDuration = watch("courseDuration");
  const stream = watch("stream");
  const specialization = watch("specialization");

  // Reset specialization if the stream changes
  useEffect(() => {
    if (specialization && !stream) {
      setValue("specialization", "");
    }
  }, [stream, specialization, setValue]);

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
    const duration = Number(data.courseDuration);
    const streamUpper = data.stream?.toUpperCase() || "";
    const isEngineering = streamUpper.includes("ENGINEERING") || streamUpper.includes("B.E") || streamUpper.includes("B.TECH") || streamUpper === "BE" || streamUpper === "BTECH";
    const expectedDuration = isEngineering ? 4 : 3;

    if (data.courseDuration) {
      if (duration !== expectedDuration) {
        setError("courseDuration", {
          type: "validate",
          message: `For ${data.stream}, course duration must be exactly ${expectedDuration} years.`,
        });
        return;
      }
    }

    clearErrors("courseDuration");

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



  const SPECIALIZATIONS_GROUPS = [
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

  const STREAMS_GROUPS = [
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

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mt-5">
                <Field label="Stream" error={errors.stream?.message}>
                  <SearchableSelect
                    groups={STREAMS_GROUPS}
                    value={stream || ""}
                    onValueChange={(v) => setValue("stream", v as FormValues["stream"])}
                    disabled={isStudent}
                    placeholder="Select Stream"
                  />
                </Field>
                <Field label="Department" error={errors.specialization?.message}>
                  <SearchableSelect
                    options={SPECIALIZATIONS_GROUPS}
                    value={specialization || ""}
                    onValueChange={(v) => setValue("specialization", v as FormValues["specialization"])}
                    disabled={isStudent || !stream}
                    placeholder="Select Department"
                  />
                  {errors.specialization?.message && <p className="text-xs text-destructive">{errors.specialization.message}</p>}
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
                <Field label="Course Duration (Years)" error={errors.courseDuration?.message}>
                  <Select
                    value={courseDuration ? String(courseDuration) : ""}
                    onValueChange={(v) => setValue("courseDuration", Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          {year} {year === 1 ? 'Year' : 'Years'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
