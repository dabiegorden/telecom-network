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
import { Pencil, Trash2, Loader2, Users } from "lucide-react";
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
  profileImage?: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    specialization: "",
    experience: 0,
    location: "",
  });

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

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      specialization: user.specialization || "",
      experience: user.experience || 0,
      location: user.location || "",
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;

    try {
      const response = await usersApi.updateUser(selectedUser._id, formData);
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
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

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
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-linear-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
          <Users className="h-6 w-6 text-cyan-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">All Users</h1>
          <p className="text-slate-400">Manage all users in the system</p>
        </div>
      </div>

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
                {users.map((user) => (
                  <TableRow
                    key={user._id}
                    className="border-slate-800 hover:bg-slate-800/30 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-cyan-500/50">
                          <AvatarImage src={user.profileImage} />
                          <AvatarFallback className="bg-linear-to-br from-cyan-500 to-blue-500 text-white font-semibold">
                            {user.name.charAt(0).toUpperCase()}
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
                      {user.experience ? `${user.experience} years` : "N/A"}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {user.location || "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(user)}
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
                          className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit User</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update user information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-slate-300">
                Role
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
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
              <Label htmlFor="specialization" className="text-slate-300">
                Specialization
              </Label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={(e) =>
                  setFormData({ ...formData, specialization: e.target.value })
                }
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience" className="text-slate-300">
                Experience (years)
              </Label>
              <Input
                id="experience"
                type="number"
                value={formData.experience}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    experience: parseInt(e.target.value),
                  })
                }
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-slate-300">
                Location
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              className="bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
            >
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-500">
              Delete User
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete {selectedUser?.name}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
