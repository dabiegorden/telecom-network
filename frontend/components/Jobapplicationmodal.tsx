"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Upload,
  FileText,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Building2,
  MapPin,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  description: string;
}

interface JobApplicationModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const JobApplicationModal = ({
  job,
  isOpen,
  onClose,
  onSuccess,
}: JobApplicationModalProps) => {
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a PDF, DOC, or DOCX file");
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setResumeFile(file);
    }
  };

  const handleRemoveFile = () => {
    setResumeFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to apply");
        return;
      }

      const formData = new FormData();
      formData.append("coverLetter", coverLetter);
      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      const response = await fetch(
        `http://localhost:5000/api/applications/${job._id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await response.json();

      if (data.success) {
        setSubmitStatus("success");
        toast.success("Application submitted successfully!");
        setTimeout(() => {
          onSuccess();
          onClose();
          resetForm();
        }, 2000);
      } else {
        setSubmitStatus("error");
        toast.error(data.message || "Failed to submit application");
      }
    } catch (error) {
      console.error("Application error:", error);
      setSubmitStatus("error");
      toast.error("Error submitting application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCoverLetter("");
    setResumeFile(null);
    setSubmitStatus("idle");
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            Apply for Position
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Submit your application for this position. Include a cover letter
            and upload your resume.
          </DialogDescription>
        </DialogHeader>

        {/* Job Details Card */}
        <div className="my-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-3">
          <h3 className="text-lg font-bold text-white">{job.title}</h3>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-cyan-400" />
              <span>{job.company}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-cyan-400" />
              <span>{job.location}</span>
            </div>
            <Badge
              variant="outline"
              className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
            >
              <Briefcase className="mr-1 h-3 w-3" />
              {job.jobType}
            </Badge>
          </div>
        </div>

        {submitStatus === "success" ? (
          <div className="py-8 flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-green-500/10">
              <CheckCircle className="h-16 w-16 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white">
              Application Submitted!
            </h3>
            <p className="text-slate-400 text-center">
              Your application has been successfully submitted. You'll be
              redirected shortly.
            </p>
          </div>
        ) : submitStatus === "error" ? (
          <div className="py-8 flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-red-500/10">
              <AlertCircle className="h-16 w-16 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Submission Failed</h3>
            <p className="text-slate-400 text-center">
              There was an error submitting your application. Please try again.
            </p>
            <Button
              onClick={() => setSubmitStatus("idle")}
              className="bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cover Letter */}
            <div className="space-y-2">
              <Label htmlFor="coverLetter" className="text-white font-semibold">
                Cover Letter
                <span className="text-slate-400 font-normal ml-2">
                  (Optional but recommended)
                </span>
              </Label>
              <Textarea
                id="coverLetter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell the employer why you're interested in this position and what makes you a great fit..."
                rows={8}
                maxLength={2000}
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20 resize-none"
              />
              <p className="text-xs text-slate-400 text-right">
                {coverLetter.length}/2000 characters
              </p>
            </div>

            {/* Resume Upload */}
            <div className="space-y-2">
              <Label htmlFor="resume" className="text-white font-semibold">
                Resume/CV
                <span className="text-slate-400 font-normal ml-2">
                  (PDF, DOC, DOCX - Max 5MB)
                </span>
              </Label>

              {resumeFile ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <div className="p-2 rounded-lg bg-cyan-500/10">
                    <FileText className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {resumeFile.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="resume"
                  className="flex flex-col items-center justify-center p-8 rounded-xl bg-slate-800/50 border-2 border-dashed border-slate-700 hover:border-cyan-500 transition-colors cursor-pointer group"
                >
                  <div className="p-3 rounded-full bg-slate-700 group-hover:bg-cyan-500/10 transition-colors">
                    <Upload className="h-8 w-8 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-white">
                    Click to upload resume
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    PDF, DOC, or DOCX up to 5MB
                  </p>
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:border-slate-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25 transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Submit Application
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default JobApplicationModal;
