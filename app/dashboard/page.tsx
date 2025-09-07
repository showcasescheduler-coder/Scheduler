"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Film,
  Calendar,
  Upload,
  PlusCircle,
  Menu,
  InfoIcon,
  FileSpreadsheet,
  X,
  BookOpen,
  Building,
  Eye,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [selectedSite, setSelectedSite] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [lastWeekFile, setLastWeekFile] = useState<File | null>(null);
  const [newFilmsFile, setNewFilmsFile] = useState<File | null>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [bestPractices, setBestPractices] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState("claude-3-7-sonnet-20250219");
  const [hasExistingSchedule, setHasExistingSchedule] = useState(false);

  const router = useRouter();

  const lastWeekInputRef = useRef<HTMLInputElement>(null);
  const newFilmsInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true);

        // Fetch both datasets in parallel
        const [sitesResponse, practicesResponse] = await Promise.all([
          fetch("/api/sites"),
          fetch("/api/best-practices"),
        ]);

        const sitesData = await sitesResponse.json();
        const practicesData = await practicesResponse.json();

        if (sitesData.success) {
          setSites(sitesData.sites);
        }

        if (practicesData.success) {
          setBestPractices(practicesData.sections);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load required data");
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, []);

  // Check for existing schedule when site selection changes
  useEffect(() => {
    if (selectedSite && typeof window !== 'undefined') {
      const existingSchedule = localStorage.getItem(`schedule_${selectedSite}`);
      setHasExistingSchedule(!!existingSchedule);
    } else {
      setHasExistingSchedule(false);
    }
  }, [selectedSite]);

  // const sites = [
  //   { id: "site1", name: "Downtown Cinema" },
  //   { id: "site2", name: "Westfield Multiplex" },
  //   { id: "site3", name: "Eastside Movies" },
  //   { id: "site4", name: "Harbor View Cinemas" },
  // ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Check if file is an Excel file
    const isExcel =
      file.type === "application/vnd.ms-excel" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    if (!isExcel) {
      toast.error("Please upload only Excel files (.xls or .xlsx)");
      event.target.value = "";
      return;
    }

    if (fileType === "lastWeek") {
      setLastWeekFile(file);
    } else {
      setNewFilmsFile(file);
    }

    toast.success(`${file.name} uploaded successfully`);
  };

  const removeFile = (fileType: string) => {
    if (fileType === "lastWeek") {
      setLastWeekFile(null);
      if (lastWeekInputRef.current) lastWeekInputRef.current.value = "";
    } else {
      setNewFilmsFile(null);
      if (newFilmsInputRef.current) newFilmsInputRef.current.value = "";
    }
  };

  const triggerFileInput = (inputRef: React.RefObject<HTMLInputElement>) => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  // Check if generate button should be enabled
  const isGenerateButtonDisabled = () => {
    // Site selection is required in all cases
    if (!selectedSite) return true;

    // If we have both files, button is enabled
    if (lastWeekFile && newFilmsFile) return false;

    // If we have at least one file AND additional instructions, button is enabled
    if (
      (lastWeekFile || newFilmsFile) &&
      additionalInstructions.trim().length > 0
    )
      return false;

    // Otherwise, button is disabled
    return true;
  };

  // Navigation links for sidebar and mobile menu
  const navLinks = [
    {
      name: "Schedule Generator",
      icon: Calendar,
      href: "/dashboard",
      active: true,
    },
    {
      name: "Sites",
      icon: Building,
      href: "dashboard/sites",
      active: false,
    },
    {
      name: "Best Practices",
      icon: BookOpen,
      href: "dashboard/best-practices",
      active: false,
    },
  ];

  const handleGenerateSchedule = async () => {
    // Find the selected site data
    const siteData = sites.find(site => site._id === selectedSite);
    if (!siteData) {
      toast.error("Please select a site");
      return;
    }

    // Check if there's already a saved schedule for this site
    const existingSchedule = localStorage.getItem(`schedule_${selectedSite}`);
    if (existingSchedule) {
      const confirmGenerate = confirm("You already have a saved schedule for this site. Generating a new one will replace it. Continue?");
      if (!confirmGenerate) {
        // Just navigate to the existing schedule
        router.push(`/dashboard/schedule-chat?site=${selectedSite}&name=${encodeURIComponent(siteData.name)}`);
        return;
      }
    }

    // Set loading state
    setIsGenerating(true);
    const loadingToast = toast.loading("Generating optimized schedule with AI... This may take 20-30 seconds.");

    try {
      // Create FormData to send files and data
      const formData = new FormData();
      formData.append("siteId", selectedSite);
      formData.append("siteName", siteData.name);
      formData.append("siteData", JSON.stringify(siteData));
      formData.append("bestPractices", JSON.stringify(bestPractices));
      formData.append("additionalInstructions", additionalInstructions);
      formData.append("modelName", selectedModel);
      
      if (lastWeekFile) {
        formData.append("lastWeekFile", lastWeekFile);
      }
      
      if (newFilmsFile) {
        formData.append("newFilmsFile", newFilmsFile);
      }

      // Call the API endpoint
      const response = await fetch("/api/generate-schedule", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast.dismiss(loadingToast);
        toast.success("Schedule generated successfully!");
        
        // Store the schedule in sessionStorage to pass to the next page
        sessionStorage.setItem("generatedSchedule", JSON.stringify(data.schedule));
        
        // Navigate to schedule-chat page with site data
        router.push(`/dashboard/schedule-chat?site=${selectedSite}&name=${encodeURIComponent(siteData.name)}`);
      } else {
        throw new Error(data.error || "Failed to generate schedule");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error instanceof Error ? error.message : "Failed to generate schedule");
      console.error("Error generating schedule:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const navigateTo = (url: string) => {
    router.push(url);
  };

  console.log(sites);
  console.log(bestPractices);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={lastWeekInputRef}
        onChange={(e) => handleFileUpload(e, "lastWeek")}
        accept=".xls,.xlsx"
        className="hidden"
      />
      <input
        type="file"
        ref={newFilmsInputRef}
        onChange={(e) => handleFileUpload(e, "newFilms")}
        accept=".xls,.xlsx"
        className="hidden"
      />

      {/* Sidebar - Desktop */}
      <div className="hidden md:flex w-64 flex-col bg-slate-900/95 border-r border-purple-800/30 backdrop-blur">
        <Link
          href="/"
          className="p-4 flex items-center gap-2 border-b border-purple-800/30"
        >
          <Image
            src="/showcase.png"
            alt="Showcase Cinemas"
            width={120}
            height={24}
            className="h-6 w-auto filter brightness-0 invert"
            priority
          />
        </Link>
        <div className="flex-1 overflow-auto p-4">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Button
                key={link.name}
                variant={link.active ? "default" : "ghost"}
                className={`w-full justify-start ${
                  link.active
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                    : "text-slate-300 hover:bg-purple-800/50 hover:text-white"
                }`}
                onClick={() => navigateTo(link.href)}
              >
                <link.icon className="mr-2 h-4 w-4" />
                {link.name}
              </Button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Mobile */}
        <header className="bg-slate-900/95 border-b border-purple-800/30 backdrop-blur p-4 flex items-center justify-between md:hidden">
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-purple-800/50"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="bg-slate-900 border-purple-800/30"
              >
                <div className="py-4">
                  <Link href="/" className="flex items-center gap-2 mb-4">
                    <Image
                      src="/showcase.png"
                      alt="Showcase Cinemas"
                      width={120}
                      height={24}
                      className="h-6 w-auto filter brightness-0 invert"
                      priority
                    />
                  </Link>
                  <nav className="space-y-2">
                    {navLinks.map((link) => (
                      <Button
                        key={link.name}
                        variant={link.active ? "default" : "ghost"}
                        className={`w-full justify-start ${
                          link.active
                            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                            : "text-slate-300 hover:bg-purple-800/50 hover:text-white"
                        }`}
                        onClick={() => navigateTo(link.href)}
                      >
                        <link.icon className="mr-2 h-4 w-4" />
                        {link.name}
                      </Button>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-medium ml-2 text-white">
              Schedule Generator
            </h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="hidden md:flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-white">
              Schedule Generator
            </h1>
          </div>

          <Card className="bg-slate-800/50 border-purple-800/30 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">
                Generate Revenue-Optimized Schedule
              </CardTitle>
              <CardDescription className="text-slate-300">
                Upload past weekend performance data and new film details to
                generate an optimized schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Site Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Select Cinema Location
                </label>
                <Select onValueChange={setSelectedSite} value={selectedSite}>
                  <SelectTrigger className="w-full bg-slate-700/50 border-purple-800/30 text-white">
                    <SelectValue placeholder="Select a cinema location" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-purple-800/30">
                    {sites.map((site) => (
                      <SelectItem
                        key={site._id}
                        value={site._id}
                        className="text-white hover:bg-purple-800/50"
                      >
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Model Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  AI Model
                </label>
                <Select onValueChange={setSelectedModel} value={selectedModel}>
                  <SelectTrigger className="w-full bg-slate-700/50 border-purple-800/30 text-white">
                    <SelectValue placeholder="Select AI model" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-purple-800/30">
                    <SelectItem
                      value="claude-3-7-sonnet-20250219"
                      className="text-white hover:bg-purple-800/50"
                    >
                      Claude 3.7 Sonnet (Better quality, slower ~45s)
                    </SelectItem>
                    <SelectItem
                      value="claude-sonnet-4-20250514"
                      className="text-white hover:bg-purple-800/50"
                    >
                      Claude Sonnet 4 (Fastest, good quality ~15s)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="bg-purple-800/30" />

              {/* Data Upload Section */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-white">
                  Upload Required Data
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Last Week's Performance Upload Card */}
                  <Card
                    className={`border backdrop-blur ${
                      lastWeekFile
                        ? "border-purple-500/50 bg-purple-900/30"
                        : "border-purple-800/30 bg-slate-700/30"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center text-center space-y-3">
                        {lastWeekFile ? (
                          <FileSpreadsheet className="h-8 w-8 text-purple-400" />
                        ) : (
                          <Upload className="h-8 w-8 text-slate-400" />
                        )}
                        <div>
                          <h4 className="font-medium text-white">
                            Last Weekend&apos;s Performance
                          </h4>
                          <p className="text-sm text-slate-400 mt-1">
                            Upload sales data, ticket sales, and occupancy
                            levels
                          </p>
                        </div>

                        {lastWeekFile ? (
                          <div className="w-full">
                            <div className="flex items-center justify-between p-2 bg-purple-900/50 rounded border border-purple-600/30 text-sm mb-2">
                              <div className="flex items-center">
                                <FileSpreadsheet className="h-4 w-4 mr-2 text-purple-400" />
                                <span className="truncate max-w-[150px] text-white">
                                  {lastWeekFile.name}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                                onClick={() => removeFile("lastWeek")}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button
                              variant="outline"
                              className="border-purple-500/50 text-purple-300 hover:bg-purple-800/50"
                              onClick={() => triggerFileInput(lastWeekInputRef)}
                            >
                              Change File
                            </Button>
                          </div>
                        ) : (
                          <Button
                            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                            onClick={() => triggerFileInput(lastWeekInputRef)}
                          >
                            Upload Excel File
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* New Films Upload Card */}
                  <Card
                    className={`border backdrop-blur ${
                      newFilmsFile
                        ? "border-purple-500/50 bg-purple-900/30"
                        : "border-purple-800/30 bg-slate-700/30"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center text-center space-y-3">
                        {newFilmsFile ? (
                          <FileSpreadsheet className="h-8 w-8 text-purple-400" />
                        ) : (
                          <Film className="h-8 w-8 text-slate-400" />
                        )}
                        <div>
                          <h4 className="font-medium text-white">
                            New Film Releases
                          </h4>
                          <p className="text-sm text-slate-400 mt-1">
                            Upload details for new films coming this week
                          </p>
                        </div>

                        {newFilmsFile ? (
                          <div className="w-full">
                            <div className="flex items-center justify-between p-2 bg-purple-900/50 rounded border border-purple-600/30 text-sm mb-2">
                              <div className="flex items-center">
                                <FileSpreadsheet className="h-4 w-4 mr-2 text-purple-400" />
                                <span className="truncate max-w-[150px] text-white">
                                  {newFilmsFile.name}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                                onClick={() => removeFile("newFilms")}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button
                              variant="outline"
                              className="border-purple-500/50 text-purple-300 hover:bg-purple-800/50"
                              onClick={() => triggerFileInput(newFilmsInputRef)}
                            >
                              Change File
                            </Button>
                          </div>
                        ) : (
                          <Button
                            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                            onClick={() => triggerFileInput(newFilmsInputRef)}
                          >
                            Upload Excel File
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator className="bg-purple-800/30" />

              {/* Additional Instructions */}
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <label className="text-sm font-medium text-slate-300">
                    Additional Instructions (Optional)
                  </label>
                  <InfoIcon className="h-4 w-4 text-slate-400" />
                </div>
                <Textarea
                  placeholder="Enter any specific requirements or considerations for this schedule (e.g., special events, preferred time slots for certain films)"
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  rows={4}
                  className="resize-none bg-slate-700/50 border-purple-800/30 text-white placeholder:text-slate-400"
                />
              </div>

              {/* Generate Button */}
              <div className="pt-4 space-y-2">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
                  disabled={isGenerateButtonDisabled() || isGenerating}
                  onClick={handleGenerateSchedule}
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating with AI... Please wait
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-5 w-5" />
                      Generate Optimized Schedule
                    </>
                  )}
                </Button>
                
                {/* View Existing Schedule Button */}
                {hasExistingSchedule && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-800/20"
                    onClick={() => {
                      const siteData = sites.find(site => site._id === selectedSite);
                      if (siteData) {
                        router.push(`/dashboard/schedule-chat?site=${selectedSite}&name=${encodeURIComponent(siteData.name)}`);
                      }
                    }}
                  >
                    <Eye className="mr-2 h-5 w-5" />
                    View Existing Schedule
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
