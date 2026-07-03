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
import { Loader2, UserCheck } from "lucide-react";
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

// Recruiters can view professionals but must not edit or delete them —
// those actions are reserved for admins.
export default function RecruiterProfessionalsPage() {
  const [professionals, setProfessionals] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getAllProfessionals();
      if (response.success) {
        setProfessionals(response.data || []);
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
            Browse telecommunication professionals
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
