"use client";

import { useEffect, useState } from "react";
import { usersApi } from "@/lib/api";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Pencil,
  Trash2,
  Loader2,
  Users,
  UserPlus,
  Eye,
  EyeOff,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  specialization?: string;
  experience?: number;
  location?: string;
  bio?: string;
  skills?: string[];
  profileImage?: string;
  createdAt: string;
}

const EMPTY_CREATE_FORM = {
  name: "",
  email: "",
  password: "",
  role: "professional",
  specialization: "",
  experience: 0,
  location: "",
  bio: "",
  skills: "",
};

const EMPTY_EDIT_FORM = {
  name: "",
  email: "",
  role: "",
  specialization: "",
  experience: 0,
  location: "",
  bio: "",
  skills: "",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getAllUsers();
      if (response.success) {
        setUsers(response.data);
      } else {
        toast.error(response.message || "Failed to fetch users");
      }
    } catch (error) {
      toast.error("Failed to fetch users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ── CREATE ──────────────────────────────────────────────
  const handleOpenCreate = () => {
    setCreateForm(EMPTY_CREATE_FORM);
    setShowPassword(false);
    setCreateDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!createForm.name || !createForm.email || !createForm.password) {
      toast.error("Name, email and password are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...createForm,
        skills: createForm.skills
          ? createForm.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      };
      // Uses the auth register endpoint or a dedicated admin create endpoint.
      // Adjust the API method name to match your usersApi implementation.
      const response = await usersApi.createUser(payload);
      if (response.success) {
        toast.success("User created successfully");
        setCreateDialogOpen(false);
        fetchUsers();
      } else {
        toast.error(response.message || "Failed to create user");
      }
    } catch (error) {
      toast.error("Failed to create user");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── VIEW ────────────────────────────────────────────────
  const handleView = (user: User) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  // ── EDIT ────────────────────────────────────────────────
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      specialization: user.specialization || "",
      experience: user.experience || 0,
      location: user.location || "",
      bio: user.bio || "",
      skills: user.skills?.join(", ") || "",
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...editForm,
        skills: editForm.skills
          ? editForm.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      };
      const response = await usersApi.updateUser(selectedUser._id, payload);
      if (response.success) {
        toast.success("User updated successfully");
        setEditDialogOpen(false);
        fetchUsers();
      } else {
        toast.error(response.message || "Failed to update user");
      }
    } catch (error) {
      toast.error("Failed to update user");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── DELETE ──────────────────────────────────────────────
  const handleDelete = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      const response = await usersApi.deleteUser(selectedUser._id);
      if (response.success) {
        toast.success("User deleted successfully");
        setDeleteDialogOpen(false);
        fetchUsers();
      } else {
        toast.error(response.message || "Failed to delete user");
      }
    } catch (error) {
      toast.error("Failed to delete user");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── HELPERS ─────────────────────────────────────────────
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-linear-to-r from-orange-500 to-red-500";
      case "recruiter":
        return "bg-linear-to-r from-purple-500 to-pink-500";
      case "professional":
        return "bg-linear-to-r from-cyan-500 to-blue-500";
      default:
        return "bg-slate-600";
    }
  };

  // ── SHARED FORM FIELDS (reused in create & edit) ────────
  const renderCommonFields = (
    form: typeof editForm,
    setForm: (f: typeof editForm) => void,
  ) => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-300">
            Name <span className="text-red-400">*</span>
          </Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Full name"
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-300">
            Email <span className="text-red-400">*</span>
          </Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="user@example.com"
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-300">Role</Label>
          <Select
            value={form.role}
            onValueChange={(value) => setForm({ ...form, role: value })}
          >
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="recruiter">Recruiter</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-slate-300">Specialization</Label>
          <Input
            value={form.specialization}
            onChange={(e) =>
              setForm({ ...form, specialization: e.target.value })
            }
            placeholder="e.g. Network Engineer"
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-300">Experience (years)</Label>
          <Input
            type="number"
            min={0}
            value={form.experience}
            onChange={(e) =>
              setForm({ ...form, experience: parseInt(e.target.value) || 0 })
            }
            className="bg-slate-800 border-slate-700 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-300">Location</Label>
          <Input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="City, Country"
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-slate-300">
          Skills{" "}
          <span className="text-slate-500 text-xs">(comma-separated)</span>
        </Label>
        <Input
          value={form.skills}
          onChange={(e) => setForm({ ...form, skills: e.target.value })}
          placeholder="e.g. 5G, LTE, Python"
          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-slate-300">Bio</Label>
        <textarea
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          placeholder="Short bio (max 500 characters)"
          maxLength={500}
          rows={3}
          className="w-full rounded-md bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        />
        <p className="text-xs text-slate-500 text-right">
          {form.bio?.length || 0}/500
        </p>
      </div>
    </>
  );

  // ── LOADING ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  // ── RENDER ───────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-linear-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
            <Users className="h-6 w-6 text-cyan-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">All Users</h1>
            <p className="text-slate-400">Manage all users in the system</p>
          </div>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white gap-2 shadow-lg shadow-cyan-500/20"
        >
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Table Card */}
      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Users List</CardTitle>
          <CardDescription className="text-slate-400">
            Total Users: {users.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-slate-800/50">
                  <TableHead className="text-slate-300 font-semibold">
                    User
                  </TableHead>
                  <TableHead className="text-slate-300 font-semibold">
                    Email
                  </TableHead>
                  <TableHead className="text-slate-300 font-semibold">
                    Role
                  </TableHead>
                  <TableHead className="text-slate-300 font-semibold">
                    Specialization
                  </TableHead>
                  <TableHead className="text-slate-300 font-semibold">
                    Experience
                  </TableHead>
                  <TableHead className="text-slate-300 font-semibold">
                    Location
                  </TableHead>
                  <TableHead className="text-slate-300 font-semibold text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-slate-500 py-12"
                    >
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow
                      key={user._id}
                      className="border-slate-800 hover:bg-slate-800/30 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-cyan-500/50">
                            <AvatarImage src={user.profileImage} />
                            <AvatarFallback className="bg-linear-to-br from-cyan-500 to-blue-500 text-white font-semibold">
                              {user?.name?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-white">
                            {user.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getRoleBadgeColor(user.role)} text-white border-0`}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {user.specialization || "N/A"}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {user.experience ? `${user.experience} yrs` : "N/A"}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {user.location || "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(user)}
                            title="View details"
                            className="text-slate-400 hover:text-white hover:bg-slate-700/50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(user)}
                            title="Edit user"
                            className="text-cyan-500 hover:text-cyan-400 hover:bg-cyan-500/10"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedUser(user);
                              setDeleteDialogOpen(true);
                            }}
                            title="Delete user"
                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── CREATE DIALOG ─────────────────────────────────── */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-linear-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                <UserPlus className="h-5 w-5 text-cyan-500" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  Create New User
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  Add a new user to the system
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Password field — only in create */}
            <div className="space-y-2">
              <Label className="text-slate-300">
                Password <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, password: e.target.value })
                  }
                  placeholder="Min. 6 characters"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {renderCommonFields(createForm as typeof editForm, (f) =>
              setCreateForm({ ...createForm, ...f }),
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isSubmitting}
              className="bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── VIEW DIALOG ───────────────────────────────────── */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              User Details
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-5 py-2">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-cyan-500/50">
                  <AvatarImage src={selectedUser.profileImage} />
                  <AvatarFallback className="bg-linear-to-br from-cyan-500 to-blue-500 text-white text-xl font-bold">
                    {selectedUser.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xl font-semibold text-white">
                    {selectedUser.name}
                  </p>
                  <p className="text-slate-400 text-sm">{selectedUser.email}</p>
                  <Badge
                    className={`${getRoleBadgeColor(selectedUser.role)} text-white border-0 mt-1`}
                  >
                    {selectedUser.role}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Specialization",
                    value: selectedUser.specialization,
                  },
                  {
                    label: "Experience",
                    value: selectedUser.experience
                      ? `${selectedUser.experience} years`
                      : null,
                  },
                  { label: "Location", value: selectedUser.location },
                  {
                    label: "Member Since",
                    value: new Date(selectedUser.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      },
                    ),
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50"
                  >
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                      {label}
                    </p>
                    <p className="text-white text-sm font-medium">
                      {value || "—"}
                    </p>
                  </div>
                ))}
              </div>

              {selectedUser.skills && selectedUser.skills.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 text-xs rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedUser.bio && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                    Bio
                  </p>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {selectedUser.bio}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewDialogOpen(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setViewDialogOpen(false);
                if (selectedUser) handleEdit(selectedUser);
              }}
              className="bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white gap-2"
            >
              <Pencil className="h-4 w-4" />
              Edit User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── EDIT DIALOG ───────────────────────────────────── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit User</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update information for{" "}
              <span className="text-cyan-400 font-medium">
                {selectedUser?.name}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {renderCommonFields(editForm, setEditForm)}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isSubmitting}
              className="bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DELETE DIALOG ─────────────────────────────────── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-400">
              Delete User
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete{" "}
              <span className="text-white font-medium">
                {selectedUser?.name}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
