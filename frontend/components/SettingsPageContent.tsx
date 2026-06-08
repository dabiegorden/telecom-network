"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Lock, Mail, ShieldCheck, User as UserIcon } from "lucide-react";
import { usersApi } from "@/lib/api";

interface SettingsUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function SettingsPageContent() {
  const [user, setUser] = useState<SettingsUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState("");
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await usersApi.getCurrentUser();
        if (res.success) {
          setUser(res.data);
          setName(res.data.name || "");
        } else {
          toast.error(res.message || "Failed to load account settings");
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        toast.error("Failed to load account settings");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveAccount = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setIsSavingAccount(true);
    try {
      const res = await usersApi.updateCurrentUser({ name });
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
        toast.success("Account details updated");
      } else {
        toast.error(res.message || "Failed to update account");
      }
    } catch (error) {
      console.error("Failed to update account:", error);
      toast.error("Failed to update account");
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await usersApi.updateCurrentUser({
        password: newPassword,
        currentPassword,
      });
      if (res.success) {
        toast.success("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(res.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Failed to change password:", error);
      toast.error("Failed to change password");
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
          <p className="text-slate-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Account settings</h1>
        <p className="text-slate-400">
          Manage your account details, security and preferences.
        </p>
      </div>

      {/* Account info */}
      <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl">
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-white">
              Account information
            </h2>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="settings-name">Full name</Label>
            <Input
              id="settings-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-slate-700 bg-slate-800 text-white"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="settings-email" className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" /> Email address
            </Label>
            <Input
              id="settings-email"
              value={user?.email || ""}
              disabled
              className="border-slate-700 bg-slate-800/50 text-slate-400"
            />
            <p className="text-xs text-slate-500">
              Your email address cannot be changed. Contact support if you need
              assistance.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5" /> Account type
            </Label>
            <Input
              value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ""}
              disabled
              className="border-slate-700 bg-slate-800/50 capitalize text-slate-400"
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveAccount}
              disabled={isSavingAccount}
              className="gap-2 bg-cyan-500 text-white hover:bg-cyan-400"
            >
              {isSavingAccount && <Loader2 className="h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl">
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-white">
              Change password
            </h2>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="border-slate-700 bg-slate-800 text-white"
            />
          </div>

          <Separator className="bg-slate-800" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="border-slate-700 bg-slate-800 text-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border-slate-700 bg-slate-800 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleChangePassword}
              disabled={isSavingPassword}
              className="gap-2 bg-cyan-500 text-white hover:bg-cyan-400"
            >
              {isSavingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
              Update password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
