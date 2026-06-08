"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Camera,
  Loader2,
  MapPin,
  Briefcase,
  Globe,
  Phone,
  Pencil,
  X,
  Plus,
  Mail,
} from "lucide-react";
import { usersApi } from "@/lib/api";

interface ProfileUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  specialization?: string;
  experience?: number;
  skills?: string[];
  bio?: string;
  headline?: string;
  location?: string;
  website?: string;
  phone?: string;
  profileImage?: string;
  bannerImage?: string;
}

const ROLE_LABELS: Record<string, string> = {
  professional: "Telecom Professional",
  recruiter: "Recruiter",
  admin: "Administrator",
};

export default function ProfilePageContent() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [form, setForm] = useState({
    name: "",
    headline: "",
    specialization: "",
    experience: "",
    location: "",
    website: "",
    phone: "",
    bio: "",
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    try {
      const res = await usersApi.getCurrentUser();
      if (res.success) {
        setUser(res.data);
        syncForm(res.data);
        const stored = localStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          localStorage.setItem(
            "user",
            JSON.stringify({ ...parsed, ...res.data }),
          );
        }
      } else {
        toast.error(res.message || "Failed to load profile");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const syncForm = (u: ProfileUser) => {
    setForm({
      name: u.name || "",
      headline: u.headline || "",
      specialization: u.specialization || "",
      experience:
        u.experience !== undefined && u.experience !== null
          ? String(u.experience)
          : "",
      location: u.location || "",
      website: u.website || "",
      phone: u.phone || "",
      bio: u.bio || "",
    });
    setSkills(u.skills || []);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleImageUpload = async (
    file: File,
    field: "profileImage" | "bannerImage",
  ) => {
    const setUploading =
      field === "profileImage" ? setUploadingAvatar : setUploadingBanner;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append(field, file);
      const res = await usersApi.updateCurrentUser(formData);
      if (res.success) {
        setUser(res.data);
        const stored = localStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          localStorage.setItem(
            "user",
            JSON.stringify({ ...parsed, ...res.data }),
          );
        }
        toast.success(
          field === "profileImage"
            ? "Profile photo updated"
            : "Banner image updated",
        );
      } else {
        toast.error(res.message || "Failed to upload image");
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const addSkill = () => {
    const value = skillInput.trim();
    if (value && !skills.includes(value)) {
      setSkills([...skills, value]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const payload: Record<string, any> = {
        name: form.name,
        headline: form.headline,
        specialization: form.specialization,
        location: form.location,
        website: form.website,
        phone: form.phone,
        bio: form.bio,
        skills,
      };
      if (form.experience !== "") {
        payload.experience = Number(form.experience);
      }

      const res = await usersApi.updateCurrentUser(payload);
      if (res.success) {
        setUser(res.data);
        const stored = localStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          localStorage.setItem(
            "user",
            JSON.stringify({ ...parsed, ...res.data }),
          );
        }
        toast.success("Profile updated successfully");
        setIsEditOpen(false);
      } else {
        toast.error(res.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-slate-400">Could not load your profile.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Banner + Avatar Card */}
      <Card className="overflow-hidden border-slate-800 bg-slate-900/60 pt-0 backdrop-blur-xl">
        <div className="relative h-44 w-full sm:h-56">
          {user.bannerImage ? (
            <img
              src={user.bannerImage}
              alt="Profile banner"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-linear-to-br from-cyan-600/40 via-blue-700/40 to-slate-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />

          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file, "bannerImage");
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            size="sm"
            onClick={() => bannerInputRef.current?.click()}
            disabled={uploadingBanner}
            className="absolute right-3 top-3 gap-2 bg-slate-950/60 text-white backdrop-blur-md hover:bg-slate-950/80"
          >
            {uploadingBanner ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
            Edit banner
          </Button>
        </div>

        <CardContent className="relative px-4 pb-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
              <div className="relative -mt-16 sm:-mt-20">
                <Avatar className="h-28 w-28 border-4 border-slate-900 shadow-xl sm:h-36 sm:w-36">
                  <AvatarImage
                    src={user.profileImage || undefined}
                    alt={user.name}
                  />
                  <AvatarFallback className="bg-linear-to-br from-orange-500 to-red-500 text-3xl font-semibold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, "profileImage");
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  size="icon"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-1 right-1 h-9 w-9 rounded-full bg-cyan-500 text-white shadow-lg hover:bg-cyan-400"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="text-center sm:pb-2 sm:text-left">
                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                <p className="text-cyan-400 font-medium">
                  {user.headline ||
                    user.specialization ||
                    ROLE_LABELS[user.role] ||
                    "TelecomNet Member"}
                </p>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-400 sm:justify-start">
                  {user.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {user.location}
                    </span>
                  )}
                  <Badge className="bg-linear-to-r from-orange-500 to-red-500 text-white capitalize">
                    {ROLE_LABELS[user.role] || user.role}
                  </Badge>
                </div>
              </div>
            </div>

            <Button
              onClick={() => {
                if (user) syncForm(user);
                setIsEditOpen(true);
              }}
              className="gap-2 bg-cyan-500 text-white hover:bg-cyan-400 sm:self-start"
            >
              <Pencil className="h-4 w-4" />
              Edit profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl">
        <CardContent className="space-y-3 p-6">
          <h2 className="text-lg font-semibold text-white">About</h2>
          {user.bio ? (
            <p className="whitespace-pre-line text-slate-300">{user.bio}</p>
          ) : (
            <p className="text-slate-500 italic">
              No bio added yet. Tell others about your telecom expertise and
              career goals.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Contact & details */}
      <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl">
        <CardContent className="space-y-4 p-6">
          <h2 className="text-lg font-semibold text-white">
            Contact &amp; Details
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 text-slate-300">
              <Mail className="h-4 w-4 text-cyan-400" />
              <span className="truncate">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3 text-slate-300">
                <Phone className="h-4 w-4 text-cyan-400" />
                <span>{user.phone}</span>
              </div>
            )}
            {user.website && (
              <div className="flex items-center gap-3 text-slate-300">
                <Globe className="h-4 w-4 text-cyan-400" />
                <a
                  href={
                    user.website.startsWith("http")
                      ? user.website
                      : `https://${user.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-cyan-400 hover:underline"
                >
                  {user.website}
                </a>
              </div>
            )}
            {user.specialization && (
              <div className="flex items-center gap-3 text-slate-300">
                <Briefcase className="h-4 w-4 text-cyan-400" />
                <span>{user.specialization}</span>
              </div>
            )}
            {typeof user.experience === "number" && (
              <div className="flex items-center gap-3 text-slate-300">
                <Briefcase className="h-4 w-4 text-cyan-400" />
                <span>{user.experience} years of experience</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl">
        <CardContent className="space-y-3 p-6">
          <h2 className="text-lg font-semibold text-white">
            Skills &amp; Expertise
          </h2>
          {user.skills && user.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic">
              Add your telecom skills (e.g. RF Planning, 5G, Network Security)
              to stand out to recruiters.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Edit profile dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto border-slate-800 bg-slate-900 text-slate-200 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Edit profile</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border-slate-700 bg-slate-800 text-white"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                placeholder="e.g. RF Engineer | 5G Network Specialist at MTN Ghana"
                value={form.headline}
                onChange={(e) =>
                  setForm({ ...form, headline: e.target.value })
                }
                className="border-slate-700 bg-slate-800 text-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                value={form.specialization}
                onChange={(e) =>
                  setForm({ ...form, specialization: e.target.value })
                }
                className="border-slate-700 bg-slate-800 text-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="experience">Years of experience</Label>
              <Input
                id="experience"
                type="number"
                min={0}
                value={form.experience}
                onChange={(e) =>
                  setForm({ ...form, experience: e.target.value })
                }
                className="border-slate-700 bg-slate-800 text-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g. Accra, Ghana"
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
                className="border-slate-700 bg-slate-800 text-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="border-slate-700 bg-slate-800 text-white"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="website">Website / LinkedIn</Label>
              <Input
                id="website"
                placeholder="e.g. linkedin.com/in/yourname"
                value={form.website}
                onChange={(e) =>
                  setForm({ ...form, website: e.target.value })
                }
                className="border-slate-700 bg-slate-800 text-white"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="bio">About / Bio</Label>
              <Textarea
                id="bio"
                rows={4}
                maxLength={500}
                placeholder="Tell others about your telecom background, achievements and goals..."
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="border-slate-700 bg-slate-800 text-white"
              />
              <p className="text-right text-xs text-slate-500">
                {form.bio.length}/500
              </p>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label>Skills</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. 5G, RF Optimization, Fiber Optics"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  className="border-slate-700 bg-slate-800 text-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSkill}
                  className="gap-1 border-slate-700 text-slate-200 hover:bg-slate-800"
                >
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="gap-1 border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 rounded-full hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              className="border-slate-700 text-slate-200 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="gap-2 bg-cyan-500 text-white hover:bg-cyan-400"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
