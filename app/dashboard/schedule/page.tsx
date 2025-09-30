"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Film,
  RefreshCw,
  Send,
  Calendar,
  Download,
  Copy,
  ArrowLeft,
  Menu,
  Building,
  BookOpen,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import * as XLSX from "xlsx";

interface ShowTime {
  film: string;
  times: string[];
  rating?: string;
  runtime?: string;
}

interface DaySchedule {
  [key: string]: ShowTime[];
}

interface ScreenSchedule {
  name: string;
  capacity: number;
  features: string[];
  strategy?: string;
  schedule: DaySchedule;
}

interface GeneratedSchedule {
  site: string;
  weekRange: string;
  screens: ScreenSchedule[];
  reasoning: string;
  warnings?: string[];
  revenue_projection?: string;
  utilization_rate?: string;
}

function SchedulePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const siteId = searchParams.get("site");
  const siteName = searchParams.get("name");
  
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<GeneratedSchedule | null>(null);
  const [refinementInput, setRefinementInput] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);

  // Generate mock schedule data
  const generateMockSchedule = (): GeneratedSchedule => {
    const weekStart = new Date();
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return {
      site: siteName || "Showcase Cinema",
      weekRange: `${formatDate(weekStart)} - ${formatDate(weekEnd)}`,
      screens: [
        {
          name: "Screen 1 - IMAX",
          capacity: 450,
          features: ["IMAX", "Dolby Atmos", "Recliner Seats"],
          schedule: {
            monday: [
              { film: "Dune: Part Two", times: ["12:00", "15:30", "19:00", "22:30"], rating: "PG-13", runtime: "166 min" },
            ],
            tuesday: [
              { film: "Dune: Part Two", times: ["12:00", "15:30", "19:00", "22:30"], rating: "PG-13", runtime: "166 min" },
            ],
            wednesday: [
              { film: "Dune: Part Two", times: ["14:00", "17:30", "21:00"], rating: "PG-13", runtime: "166 min" },
            ],
            thursday: [
              { film: "Dune: Part Two", times: ["14:00", "17:30", "21:00"], rating: "PG-13", runtime: "166 min" },
            ],
            friday: [
              { film: "Dune: Part Two", times: ["11:00", "14:30", "18:00", "21:30"], rating: "PG-13", runtime: "166 min" },
              { film: "Late Night IMAX", times: ["00:30"], rating: "PG-13", runtime: "166 min" },
            ],
            saturday: [
              { film: "Dune: Part Two", times: ["10:00", "13:30", "17:00", "20:30"], rating: "PG-13", runtime: "166 min" },
              { film: "Late Night IMAX", times: ["00:00"], rating: "PG-13", runtime: "166 min" },
            ],
            sunday: [
              { film: "Dune: Part Two", times: ["11:00", "14:30", "18:00", "21:30"], rating: "PG-13", runtime: "166 min" },
            ],
          },
        },
        {
          name: "Screen 2 - Standard",
          capacity: 200,
          features: ["Standard", "Dolby Digital"],
          schedule: {
            monday: [
              { film: "Kung Fu Panda 4", times: ["11:30", "14:00", "16:30"], rating: "PG", runtime: "94 min" },
              { film: "Imaginary", times: ["19:00", "21:30"], rating: "PG-13", runtime: "104 min" },
            ],
            tuesday: [
              { film: "Kung Fu Panda 4", times: ["11:30", "14:00", "16:30"], rating: "PG", runtime: "94 min" },
              { film: "Imaginary", times: ["19:00", "21:30"], rating: "PG-13", runtime: "104 min" },
            ],
            wednesday: [
              { film: "Kung Fu Panda 4", times: ["14:00", "16:30"], rating: "PG", runtime: "94 min" },
              { film: "Imaginary", times: ["19:00", "21:30"], rating: "PG-13", runtime: "104 min" },
            ],
            thursday: [
              { film: "Kung Fu Panda 4", times: ["14:00", "16:30"], rating: "PG", runtime: "94 min" },
              { film: "Bob Marley: One Love", times: ["19:00", "21:30"], rating: "PG-13", runtime: "107 min" },
            ],
            friday: [
              { film: "Kung Fu Panda 4", times: ["11:00", "13:30", "16:00", "18:30"], rating: "PG", runtime: "94 min" },
              { film: "Imaginary", times: ["21:00", "23:30"], rating: "PG-13", runtime: "104 min" },
            ],
            saturday: [
              { film: "Kung Fu Panda 4", times: ["10:00", "12:30", "15:00", "17:30"], rating: "PG", runtime: "94 min" },
              { film: "Imaginary", times: ["20:00", "22:30"], rating: "PG-13", runtime: "104 min" },
            ],
            sunday: [
              { film: "Kung Fu Panda 4", times: ["11:00", "13:30", "16:00"], rating: "PG", runtime: "94 min" },
              { film: "Bob Marley: One Love", times: ["18:30", "21:00"], rating: "PG-13", runtime: "107 min" },
            ],
          },
        },
        {
          name: "Screen 3 - Premium",
          capacity: 150,
          features: ["Premium", "Recliner Seats", "In-seat Service"],
          schedule: {
            monday: [
              { film: "Cabrini", times: ["13:00", "16:00", "19:00", "22:00"], rating: "PG-13", runtime: "142 min" },
            ],
            tuesday: [
              { film: "Cabrini", times: ["13:00", "16:00", "19:00", "22:00"], rating: "PG-13", runtime: "142 min" },
            ],
            wednesday: [
              { film: "Ordinary Angels", times: ["13:00", "15:45", "18:30", "21:15"], rating: "PG", runtime: "118 min" },
            ],
            thursday: [
              { film: "Ordinary Angels", times: ["13:00", "15:45", "18:30", "21:15"], rating: "PG", runtime: "118 min" },
            ],
            friday: [
              { film: "Cabrini", times: ["12:00", "15:00", "18:00", "21:00"], rating: "PG-13", runtime: "142 min" },
              { film: "Late Show", times: ["00:00"], rating: "PG-13", runtime: "142 min" },
            ],
            saturday: [
              { film: "Cabrini", times: ["11:00", "14:00", "17:00", "20:00", "23:00"], rating: "PG-13", runtime: "142 min" },
            ],
            sunday: [
              { film: "Ordinary Angels", times: ["12:00", "14:45", "17:30", "20:15"], rating: "PG", runtime: "118 min" },
            ],
          },
        },
      ],
      reasoning: "Based on last week's performance data, I've optimized the schedule to maximize revenue during peak hours (Friday-Sunday evenings) while maintaining family-friendly options during matinee times. IMAX screen is dedicated to the blockbuster 'Dune: Part Two' which showed strong performance last week. Screen 2 balances family content (Kung Fu Panda 4) during day/early evening with thriller content (Imaginary) for evening audiences. Premium Screen 3 focuses on adult dramas with comfortable spacing for the dinner crowd.",
      warnings: [
        "Consider adding more matinee showings on weekdays if local schools have breaks",
        "Saturday late night shows may need security staff",
        "Monitor concession inventory for expected high weekend traffic"
      ],
      revenue_projection: "$145,000 - $165,000",
      utilization_rate: "78%"
    };
  };

  // Simulate schedule generation
  useEffect(() => {
    const generateSchedule = async () => {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockSchedule = generateMockSchedule();
      setSchedule(mockSchedule);
      setLoading(false);
      
      toast.success("Schedule generated successfully!");
    };

    generateSchedule();
  }, []);

  // Handle refinement
  const handleRefineSchedule = async () => {
    if (!refinementInput.trim()) {
      toast.error("Please enter refinement instructions");
      return;
    }

    setIsRefining(true);
    setConversationHistory([...conversationHistory, refinementInput]);
    
    // Simulate refinement delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock updating the schedule based on refinement
    if (schedule) {
      const updatedSchedule = { ...schedule };
      updatedSchedule.reasoning = `REFINED: ${refinementInput}\n\n${schedule.reasoning}`;
      setSchedule(updatedSchedule);
    }
    
    setRefinementInput("");
    setIsRefining(false);
    toast.success("Schedule refined successfully!");
  };

  // Copy schedule to clipboard
  const handleCopySchedule = () => {
    if (!schedule) return;
    
    const scheduleText = JSON.stringify(schedule, null, 2);
    navigator.clipboard.writeText(scheduleText);
    toast.success("Schedule copied to clipboard!");
  };

  // Export schedule to Excel
  const handleExportExcel = () => {
    if (!schedule) return;

    try {
      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // Create data for the summary sheet
      const summaryData = [
        ["Schedule Summary"],
        [""],
        ["Site:", schedule.site],
        ["Week Range:", schedule.weekRange],
        ["Revenue Projection:", schedule.revenue_projection || "N/A"],
        ["Utilization Rate:", schedule.utilization_rate || "N/A"],
        [""],
        ["Reasoning:"],
        [schedule.reasoning],
      ];

      if (schedule.warnings && schedule.warnings.length > 0) {
        summaryData.push([""]);
        summaryData.push(["Warnings:"]);
        schedule.warnings.forEach(warning => {
          summaryData.push([warning]);
        });
      }

      // Add summary sheet
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

      // Create a sheet for each screen
      schedule.screens.forEach((screen, index) => {
        const screenData: any[][] = [
          [`${screen.name}`],
          [`Capacity: ${screen.capacity}`],
          [`Features: ${screen.features.join(", ")}`],
        ];

        // Add strategy if available
        if (screen.strategy) {
          screenData.push([`Strategy: ${screen.strategy}`]);
        }

        screenData.push(
          [""],
          ["Day", "Film", "Show Times", "Rating", "Runtime"]
        );

        const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
        
        days.forEach(day => {
          const daySchedule = screen.schedule[day];
          if (daySchedule && daySchedule.length > 0) {
            daySchedule.forEach((show, showIndex) => {
              screenData.push([
                showIndex === 0 ? day.charAt(0).toUpperCase() + day.slice(1) : "",
                show.film,
                show.times.join(", "),
                show.rating || "",
                show.runtime || ""
              ]);
            });
          } else {
            screenData.push([day.charAt(0).toUpperCase() + day.slice(1), "No shows scheduled", "", "", ""]);
          }
        });

        const screenSheet = XLSX.utils.aoa_to_sheet(screenData);
        // Set column widths
        const wscols = [
          {wch: 12}, // Day
          {wch: 30}, // Film
          {wch: 40}, // Show Times
          {wch: 10}, // Rating
          {wch: 12}  // Runtime
        ];
        screenSheet['!cols'] = wscols;
        
        XLSX.utils.book_append_sheet(wb, screenSheet, `Screen ${index + 1}`);
      });

      // Generate and download the Excel file
      const fileName = `${schedule.site.replace(/[^a-z0-9]/gi, '_')}_Schedule_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast.success("Schedule exported to Excel successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export schedule to Excel");
    }
  };

  // Export schedule to PDF (using browser print)
  const handleExportPDF = () => {
    if (!schedule) return;
    
    // Create a new window with the schedule formatted for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Please allow pop-ups to export as PDF");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${schedule.site} - Weekly Schedule</title>
          <style>
            @page { size: landscape; margin: 0.5in; }
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; border-bottom: 2px solid #8b5cf6; padding-bottom: 10px; }
            h2 { color: #555; margin-top: 30px; }
            h3 { color: #666; margin-top: 20px; }
            .header { margin-bottom: 30px; }
            .info-grid { display: grid; grid-template-columns: 200px 1fr; gap: 10px; margin-bottom: 20px; }
            .info-label { font-weight: bold; color: #666; }
            .screen { page-break-inside: avoid; margin-bottom: 40px; border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
            .screen-header { background: #f5f5f5; padding: 10px; margin: -20px -20px 20px -20px; border-radius: 8px 8px 0 0; }
            .schedule-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            .schedule-table th { background: #8b5cf6; color: white; padding: 10px; text-align: left; }
            .schedule-table td { border: 1px solid #ddd; padding: 8px; }
            .schedule-table tr:nth-child(even) { background: #f9f9f9; }
            .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 10px; margin-top: 20px; border-radius: 5px; }
            .no-print { display: none; }
            @media print {
              .screen { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${schedule.site} - Weekly Schedule</h1>
            <div class="info-grid">
              <span class="info-label">Week Range:</span>
              <span>${schedule.weekRange}</span>
              <span class="info-label">Revenue Projection:</span>
              <span>${schedule.revenue_projection || 'N/A'}</span>
              <span class="info-label">Utilization Rate:</span>
              <span>${schedule.utilization_rate || 'N/A'}</span>
            </div>
            <p><strong>Strategy:</strong> ${schedule.reasoning}</p>
          </div>
          
          ${schedule.screens.map(screen => `
            <div class="screen">
              <div class="screen-header">
                <h2>${screen.name}</h2>
                <p>Capacity: ${screen.capacity} | Features: ${screen.features.join(', ')}</p>
                ${screen.strategy ? `<p style="margin-top: 8px; padding: 8px; background-color: #f0f0f0; border-left: 3px solid #8b5cf6;"><strong>Strategy:</strong> ${screen.strategy}</p>` : ''}
              </div>
              <table class="schedule-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Film</th>
                    <th>Show Times</th>
                    <th>Rating</th>
                    <th>Runtime</th>
                  </tr>
                </thead>
                <tbody>
                  ${['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                    const daySchedule = screen.schedule[day];
                    if (daySchedule && daySchedule.length > 0) {
                      return daySchedule.map((show, index) => `
                        <tr>
                          <td>${index === 0 ? day.charAt(0).toUpperCase() + day.slice(1) : ''}</td>
                          <td>${show.film}</td>
                          <td>${show.times.join(', ')}</td>
                          <td>${show.rating || ''}</td>
                          <td>${show.runtime || ''}</td>
                        </tr>
                      `).join('');
                    } else {
                      return `
                        <tr>
                          <td>${day.charAt(0).toUpperCase() + day.slice(1)}</td>
                          <td colspan="4">No shows scheduled</td>
                        </tr>
                      `;
                    }
                  }).join('')}
                </tbody>
              </table>
            </div>
          `).join('')}
          
          ${schedule.warnings && schedule.warnings.length > 0 ? `
            <div class="warning">
              <h3>Warnings:</h3>
              <ul>
                ${schedule.warnings.map(warning => `<li>${warning}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then trigger print
    printWindow.onload = () => {
      printWindow.print();
      toast.success("Use the print dialog to save as PDF");
    };
  };

  // Regenerate schedule
  const handleRegenerateSchedule = async () => {
    setLoading(true);
    setConversationHistory([]);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockSchedule = generateMockSchedule();
    setSchedule(mockSchedule);
    setLoading(false);
    
    toast.success("Schedule regenerated successfully!");
  };

  const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  // Navigation links
  const navLinks = [
    {
      name: "Schedule Generator",
      icon: Calendar,
      href: "/dashboard",
      active: false,
    },
    {
      name: "Sites",
      icon: Building,
      href: "/dashboard/sites",
      active: false,
    },
    {
      name: "Best Practices",
      icon: BookOpen,
      href: "/dashboard/best-practices",
      active: false,
    },
    {
      name: "Generated Schedule",
      icon: Film,
      href: "/dashboard/schedule",
      active: true,
    },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex w-64 flex-col bg-slate-900/95 border-r border-purple-800/30 backdrop-blur">
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-4 border-b border-purple-800/30"
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

        <nav className="flex-1 px-4 py-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-2 transition-colors ${
                link.active
                  ? "bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white border border-purple-500/30"
                  : "text-slate-400 hover:text-white hover:bg-purple-800/20"
              }`}
            >
              <link.icon className="h-5 w-5" />
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-slate-900/95 border-b border-purple-800/30 backdrop-blur px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden text-white hover:bg-purple-800/50"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-64 bg-slate-900 border-purple-800/30 p-0"
                >
                  <div className="flex items-center gap-2 px-6 py-4 border-b border-purple-800/30">
                    <Image
                      src="/showcase.png"
                      alt="Showcase Cinemas"
                      width={120}
                      height={24}
                      className="h-6 w-auto filter brightness-0 invert"
                      priority
                    />
                  </div>
                  <nav className="px-4 py-6">
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-2 transition-colors ${
                          link.active
                            ? "bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white border border-purple-500/30"
                            : "text-slate-400 hover:text-white hover:bg-purple-800/20"
                        }`}
                      >
                        <link.icon className="h-5 w-5" />
                        <span>{link.name}</span>
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>

              <Button
                onClick={() => router.push("/dashboard")}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white hover:bg-purple-800/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Generator
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleCopySchedule}
                variant="outline"
                size="sm"
                className="text-white border-purple-500/30 hover:bg-purple-800/20"
                disabled={loading}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-purple-500/30 hover:bg-purple-800/20"
                    disabled={loading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-900 border-purple-500/30">
                  <DropdownMenuItem 
                    onClick={handleExportExcel}
                    className="text-white hover:bg-purple-800/20 cursor-pointer"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleExportPDF}
                    className="text-white hover:bg-purple-800/20 cursor-pointer"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                onClick={handleRegenerateSchedule}
                variant="outline"
                size="sm"
                className="text-white border-purple-500/30 hover:bg-purple-800/20"
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <h1 className="text-2xl font-bold text-white">Generated Schedule</h1>
            <p className="text-purple-200">{siteName || "Showcase Cinema"}</p>
            {schedule && (
              <p className="text-sm text-purple-300 mt-1">{schedule.weekRange}</p>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <RefreshCw className="h-8 w-8 text-purple-400 animate-spin mb-4" />
              <p className="text-slate-300">Generating optimal schedule...</p>
              <p className="text-sm text-slate-500 mt-2">Analyzing last week&apos;s data and applying best practices</p>
            </div>
          ) : schedule ? (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-slate-800/50 border-purple-800/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-slate-400">Revenue Projection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-400">{schedule.revenue_projection}</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-purple-800/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-slate-400">Utilization Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-400">{schedule.utilization_rate}</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-purple-800/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-slate-400">Total Screens</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-purple-400">{schedule.screens.length}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Schedule Tabs */}
              <Tabs defaultValue="screen-0" className="w-full">
                <TabsList className="bg-slate-800 border border-purple-800/30">
                  {schedule.screens.map((screen, index) => (
                    <TabsTrigger key={index} value={`screen-${index}`} className="text-slate-300">
                      {screen.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {schedule.screens.map((screen, screenIndex) => (
                  <TabsContent key={screenIndex} value={`screen-${screenIndex}`} className="mt-4">
                    <Card className="bg-slate-800/50 border-purple-800/30">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-white">{screen.name}</CardTitle>
                            <CardDescription className="text-slate-400">
                              Capacity: {screen.capacity} seats
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            {screen.features.map((feature, idx) => (
                              <Badge key={idx} className="bg-purple-900/50 text-purple-200">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {screen.strategy && (
                          <div className="mt-3 p-3 bg-purple-900/20 rounded-md border border-purple-600/30">
                            <p className="text-sm text-purple-200 leading-relaxed">
                              <span className="font-semibold text-purple-300">Strategy:</span> {screen.strategy}
                            </p>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-7 gap-4">
                          {daysOfWeek.map((day) => (
                            <div key={day} className="space-y-2">
                              <h4 className="text-sm font-semibold text-purple-300 capitalize">
                                {day.slice(0, 3)}
                              </h4>
                              <div className="space-y-2">
                                {screen.schedule[day]?.map((showing, idx) => (
                                  <div key={idx} className="bg-slate-900/50 p-2 rounded border border-slate-700">
                                    <p className="text-xs font-medium text-white truncate" title={showing.film}>
                                      {showing.film}
                                    </p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {showing.times.map((time, timeIdx) => (
                                        <span key={timeIdx} className="text-xs text-slate-400 bg-slate-800 px-1 py-0.5 rounded">
                                          {time}
                                        </span>
                                      ))}
                                    </div>
                                    {showing.rating && (
                                      <span className="text-xs text-slate-500 mt-1">{showing.rating}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>

              {/* AI Reasoning */}
              <Card className="bg-slate-800/50 border-purple-800/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    Schedule Reasoning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 whitespace-pre-wrap">{schedule.reasoning}</p>
                </CardContent>
              </Card>

              {/* Warnings */}
              {schedule.warnings && schedule.warnings.length > 0 && (
                <Card className="bg-slate-800/50 border-orange-800/30">
                  <CardHeader>
                    <CardTitle className="text-orange-400 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Considerations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {schedule.warnings.map((warning, idx) => (
                        <li key={idx} className="text-slate-300 flex items-start gap-2">
                          <span className="text-orange-400 mt-1">•</span>
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Refinement Section */}
              <Card className="bg-slate-800/50 border-purple-800/30">
                <CardHeader>
                  <CardTitle className="text-white">Refine Schedule</CardTitle>
                  <CardDescription className="text-slate-400">
                    Request changes or adjustments to the generated schedule
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {conversationHistory.length > 0 && (
                    <div className="bg-slate-900/50 rounded p-3 space-y-2">
                      <p className="text-xs text-slate-500">Previous refinements:</p>
                      {conversationHistory.map((msg, idx) => (
                        <p key={idx} className="text-sm text-slate-400">• {msg}</p>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Textarea
                      value={refinementInput}
                      onChange={(e) => setRefinementInput(e.target.value)}
                      placeholder="E.g., 'Add more family-friendly showtimes on Saturday morning' or 'Replace Imaginary with a different thriller'"
                      className="flex-1 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                      rows={3}
                    />
                    <Button
                      onClick={handleRefineSchedule}
                      disabled={isRefining || !refinementInput.trim()}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                    >
                      {isRefining ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

export default function SchedulePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <SchedulePageContent />
    </Suspense>
  );
}