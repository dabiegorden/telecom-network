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
import { Pencil, Trash2, Loader2, UserCheck } from "lucide-react";
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
  skills?: string[];
  profileImage?: string;
  createdAt: string;
}

export default function AdminProfessionalsPage() {
  const [professionals, setProfessionals] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    specialization: "",
    experience: 0,
    location: "",
    skills: "",
  });

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getAllProfessionals();
      if (response.success) {
        setProfessionals(response.data);
      } else {
        toast.error(response.message || "Failed to fetch professionals");
      }
    } catch (error) {
      toast.error("Failed to fetch professionals");
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
      specialization: user.specialization || "",
      experience: user.experience || 0,
      location: user.location || "",
      skills: user.skills?.join(", ") || "",
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;

    try {
      const updateData = {
        ...formData,
        skills: formData.skills.split(",").map((s) => s.trim()),
        role: "professional",
      };
      const response = await usersApi.updateUser(selectedUser._id, updateData);
      if (response.success) {
        toast.success("Professional updated successfully");
        setEditDialogOpen(false);
        fetchProfessionals();
      } else {
        toast.error(response.message || "Failed to update professional");
      }
    } catch (error) {
      toast.error("Failed to update professional");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      const response = await usersApi.deleteUser(selectedUser._id);
      if (response.success) {
        toast.success("Professional deleted successfully");
        setDeleteDialogOpen(false);
        fetchProfessionals();
      } else {
        toast.error(response.message || "Failed to delete professional");
      }
    } catch (error) {
      toast.error("Failed to delete professional");
      console.error(error);
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
          <UserCheck className="h-6 w-6 text-cyan-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Professionals</h1>
          <p className="text-slate-400">
            Manage telecommunication professionals
          </p>
        </div>
      </div>

      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Professionals List</CardTitle>
          <CardDescription className="text-slate-400">
            Total Professionals: {professionals.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-slate-800/50">
                  <TableHead className="text-slate-300 font-semibold">
                    Professional
                  </TableHead>
                  <TableHead className="text-slate-300 font-semibold">
                    Email
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
                  <TableHead className="text-slate-300 font-semibold">
                    Skills
                  </TableHead>
                  <TableHead className="text-slate-300 font-semibold text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {professionals.map((professional) => (
                  <TableRow
                    key={professional._id}
                    className="border-slate-800 hover:bg-slate-800/30 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-cyan-500/50">
                          <AvatarImage src={professional.profileImage} />
                          <AvatarFallback className="bg-linear-to-br from-cyan-500 to-blue-500 text-white font-semibold">
                            {professional.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-white">
                          {professional.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {professional.email}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {professional.specialization || "N/A"}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {professional.experience
                        ? `${professional.experience} years`
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {professional.location || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {professional.skills?.slice(0, 2).map((skill, idx) => (
                          <Badge
                            key={idx}
                            className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {professional.skills &&
                          professional.skills.length > 2 && (
                            <Badge className="bg-slate-700 text-slate-300 text-xs">
                              +{professional.skills.length - 2}
                            </Badge>
                          )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(professional)}
                          className="text-cyan-500 hover:text-cyan-400 hover:bg-cyan-500/10"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(professional);
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
            <DialogTitle className="text-xl font-bold">
              Edit Professional
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Update professional information
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
            <div className="space-y-2">
              <Label htmlFor="skills" className="text-slate-300">
                Skills (comma separated)
              </Label>
              <Input
                id="skills"
                value={formData.skills}
                onChange={(e) =>
                  setFormData({ ...formData, skills: e.target.value })
                }
                placeholder="5G, Network Design, RF Engineering"
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
              Update Professional
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-500">
              Delete Professional
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
              Delete Professional
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
