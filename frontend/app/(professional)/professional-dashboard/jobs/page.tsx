"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  Search,
  MapPin,
  Filter,
  Loader2,
  RefreshCw,
  Globe,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import InternalJobsList from "@/components/InternalJobsList";
import ExternalJobsList from "@/components/Externaljobslist";
import MyApplicationsList from "@/components/Myapplicationslist";

const ProfessionalsJobsPage = () => {
  const [activeTab, setActiveTab] = useState("internal");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync external jobs from RapidAPI
  const handleSyncExternalJobs = async () => {
    setIsSyncing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/jobs/sync-external?query=Telecommunications&location=United States",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        toast.success(
          `Successfully synced ${data.synced} jobs from external sources`,
        );
        // Trigger refresh of internal jobs list
        window.dispatchEvent(new CustomEvent("refreshJobs"));
      } else {
        toast.error(data.message || "Failed to sync external jobs");
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Error syncing external jobs");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

        <div className="relative p-8">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-linear-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">
                    Job Opportunities
                  </h1>
                  <p className="text-slate-400 mt-1">
                    Discover and apply for telecommunications positions
                  </p>
                </div>
              </div>
            </div>

            {/* Sync Button */}
            {/* <Button
              onClick={handleSyncExternalJobs}
              disabled={isSyncing}
              className="bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg shadow-orange-500/25 transition-all duration-200"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync External Jobs
                </>
              )}
            </Button> */}
          </div>

          {/* Search and Filters */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search by title, company, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20 h-11"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 z-10" />
              <Input
                placeholder="Location"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20 h-11"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
              <SelectTrigger className="w-50 bg-slate-800/50 border-slate-700 text-white focus:border-cyan-500 focus:ring-cyan-500/20">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
              </SelectContent>
            </Select>

            {(searchQuery || locationFilter || jobTypeFilter) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setLocationFilter("");
                  setJobTypeFilter("");
                }}
                className="text-cyan-400 hover:text-cyan-300 hover:bg-slate-800"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 bg-slate-900 border border-slate-700 p-1 rounded-xl">
          <TabsTrigger
            value="internal"
            className="data-[state=active]:bg-linear-to-r text-white data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/25 transition-all duration-200 rounded-lg"
          >
            <Building2 className="mr-2 h-4 w-4" />
            Internal Jobs
          </TabsTrigger>
          <TabsTrigger
            value="external"
            className="data-[state=active]:bg-linear-to-r text-white data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/25 transition-all duration-200 rounded-lg"
          >
            <Globe className="mr-2 h-4 w-4" />
            External Jobs
          </TabsTrigger>
          {/* <TabsTrigger
            value="applications"
            className="data-[state=active]:bg-linear-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/25 transition-all duration-200 rounded-lg"
          >
            <Briefcase className="mr-2 h-4 w-4" />
            My Applications
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="internal" className="space-y-4">
          <InternalJobsList
            searchQuery={searchQuery}
            locationFilter={locationFilter}
            jobTypeFilter={jobTypeFilter}
          />
        </TabsContent>

        <TabsContent value="external" className="space-y-4">
          <ExternalJobsList
            searchQuery={searchQuery}
            locationFilter={locationFilter}
          />
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <MyApplicationsList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfessionalsJobsPage;
