"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertCircle,
  CheckCircle,
  Send,
  Download,
  Copy,
  ArrowLeft,
  Bot,
  User,
  RefreshCw,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { toast } from "react-hot-toast";
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

interface Message {
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
  scheduleUpdate?: GeneratedSchedule;
}

function ScheduleChatPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const siteId = searchParams.get("site");
  const siteName = searchParams.get("name") || "Showcase Cinema";
  
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<GeneratedSchedule | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);


  // Helper function to get relative time
  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  // Initial load
  useEffect(() => {
    const loadInitialSchedule = async () => {
      setLoading(true);
      
      // First check for newly generated schedule from sessionStorage
      const sessionSchedule = sessionStorage.getItem("generatedSchedule");
      // Then check localStorage for persistent schedule
      const localSchedule = localStorage.getItem(`schedule_${siteId}`);
      
      console.log("Checking for stored schedule...");
      console.log("Session storage:", !!sessionSchedule);
      console.log("Local storage:", !!localSchedule);
      
      let initialSchedule;
      
      if (sessionSchedule) {
        // New schedule was just generated
        console.log("Found newly generated schedule in sessionStorage");
        initialSchedule = JSON.parse(sessionSchedule);
        
        // Save to localStorage for persistence
        localStorage.setItem(`schedule_${siteId}`, sessionSchedule);
        localStorage.setItem(`schedule_${siteId}_timestamp`, new Date().toISOString());
        
        // Clear sessionStorage
        sessionStorage.removeItem("generatedSchedule");
        
        console.log("Schedule saved to localStorage for site:", siteId);
        toast.success("New schedule generated and saved");
      } else if (localSchedule) {
        // Load previously saved schedule from localStorage
        console.log("Loading saved schedule from localStorage");
        initialSchedule = JSON.parse(localSchedule);
        
        // Show when it was saved
        const savedTimestamp = localStorage.getItem(`schedule_${siteId}_timestamp`);
        if (savedTimestamp) {
          const savedDate = new Date(savedTimestamp);
          const timeAgo = getTimeAgo(savedDate);
          toast.success(`Loaded schedule from ${timeAgo}`);
        }
      } else if (!schedule) {
        // No schedule found anywhere
        console.log("No stored schedule found, redirecting to dashboard");
        toast.error("No schedule data found. Please generate a schedule first.");
        router.push('/dashboard');
        return;
      } else {
        // We already have a schedule loaded in state
        console.log("Using existing schedule from state");
        return;
      }
      
      setSchedule(initialSchedule);
      
      // Add initial message with the reasoning from the AI
      setMessages([{
        role: 'assistant',
        content: initialSchedule.reasoning || `I've generated an optimized schedule for ${siteName}. The schedule maximizes revenue during peak hours while maintaining family-friendly options during matinee times. You can request changes using the input below.`,
        timestamp: new Date(),
        scheduleUpdate: initialSchedule,
      }]);
      
      setLoading(false);
    };

    loadInitialSchedule();
  }, [siteName, siteId, router]);

  // Handle applying changes
  const handleApplyChanges = async () => {
    if (!inputValue.trim()) {
      toast.error("Please describe the changes you want to make");
      return;
    }

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsProcessing(true);

    try {
      // Call the API to update the schedule
      const response = await fetch("/api/update-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentSchedule: schedule,
          changeRequest: inputValue,
          siteName: siteName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the schedule
        const updatedSchedule = data.schedule;
        setSchedule(updatedSchedule);
        
        // Save updated schedule to localStorage
        localStorage.setItem(`schedule_${siteId}`, JSON.stringify(updatedSchedule));
        localStorage.setItem(`schedule_${siteId}_timestamp`, new Date().toISOString());

        // Add assistant response
        const assistantMessage: Message = {
          role: 'assistant',
          content: updatedSchedule.reasoning || `I've updated the schedule based on your request. The changes have been applied while maintaining optimal revenue projections.`,
          timestamp: new Date(),
          scheduleUpdate: updatedSchedule,
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        toast.success("Schedule updated successfully!");
      } else {
        throw new Error(data.error || "Failed to update schedule");
      }
    } catch (error) {
      // Add error message
      const errorMessage: Message = {
        role: 'assistant',
        content: `I encountered an error while updating the schedule: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error("Failed to update schedule");
      console.error("Error updating schedule:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
          [""],
          ["Day", "Film", "Show Times", "Rating", "Runtime"],
        ];

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

  const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
      {/* Header */}
      <header className="bg-slate-900/95 border-b border-purple-800/30 backdrop-blur">
        <div className="px-6 py-4">
          {/* Single Row with Everything */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Button
                onClick={() => router.push("/dashboard")}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white hover:bg-purple-800/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Generator
              </Button>
              
              <div className="border-l border-purple-800/30 pl-6">
                <h1 className="text-xl font-bold text-white">Generated Schedule</h1>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-purple-200">{siteName}</span>
                  {schedule && (
                    <>
                      <span className="text-purple-400">•</span>
                      <span className="text-purple-300">{schedule.weekRange}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Metrics */}
              {schedule && (
                <div className="flex items-center gap-6 border-l border-purple-800/30 pl-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Revenue:</span>
                    <span className="font-semibold text-green-400">{schedule.revenue_projection}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Utilization:</span>
                    <span className="font-semibold text-blue-400">{schedule.utilization_rate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Screens:</span>
                    <span className="font-semibold text-purple-400">{schedule.screens.length}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  if (confirm("Are you sure you want to clear the saved schedule? You'll need to generate a new one.")) {
                    localStorage.removeItem(`schedule_${siteId}`);
                    localStorage.removeItem(`schedule_${siteId}_timestamp`);
                    toast.success("Schedule cleared. Redirecting to generator...");
                    setTimeout(() => router.push('/dashboard'), 1000);
                  }
                }}
                variant="outline"
                size="sm"
                className="bg-slate-800/50 text-red-400 border-red-500/30 hover:bg-red-800/20"
                disabled={loading}
                title="Clear saved schedule"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear
              </Button>
              <Button
                onClick={handleCopySchedule}
                variant="outline"
                size="sm"
                className="bg-slate-800/50 text-white border-purple-500/30 hover:bg-purple-800/20"
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
                    className="bg-slate-800/50 text-white border-purple-500/30 hover:bg-purple-800/20"
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Schedule Display */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <RefreshCw className="h-8 w-8 text-purple-400 animate-spin mb-4" />
              <p className="text-slate-300">Generating optimal schedule...</p>
              <p className="text-sm text-slate-500 mt-2">Analyzing last week&apos;s data and applying best practices</p>
            </div>
          ) : schedule ? (
            <div className="space-y-6">
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
            </div>
          ) : null}
        </div>

        {/* Right Panel - Chat for Changes */}
        <div className="w-[400px] border-l border-purple-800/30 flex flex-col bg-slate-900/95">
          <div className="p-4 border-b border-purple-800/30">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-400" />
              Schedule Assistant
            </h2>
            <p className="text-sm text-slate-400 mt-1">Request changes to the schedule</p>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-purple-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-600/20 text-white'
                        : message.scheduleUpdate
                        ? 'bg-green-900/20 text-white border border-green-800/30'
                        : 'bg-slate-800/50 text-slate-200'
                    }`}
                  >
                    {message.scheduleUpdate && (
                      <div className="flex items-center gap-2 mb-2 text-xs text-green-400">
                        <CheckCircle className="h-3 w-3" />
                        Schedule Updated
                      </div>
                    )}
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs text-slate-500 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-blue-400" />
                    </div>
                  )}
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Applying changes...
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-purple-800/30 bg-slate-800/50">
            <div className="space-y-3">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Describe the changes you want to make to the schedule (e.g., 'Add more matinee shows on Saturday' or 'Replace Imaginary with a different film')"
                className="bg-slate-900/50 border-purple-800/30 text-white placeholder:text-slate-500 min-h-[80px]"
                disabled={isProcessing}
              />
              <Button
                onClick={handleApplyChanges}
                disabled={!inputValue.trim() || isProcessing}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Applying Changes...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Apply Changes
                  </>
                )}
              </Button>
              <p className="text-xs text-slate-500 text-center">
                Changes will regenerate the schedule based on your requirements
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ScheduleChatPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <ScheduleChatPageContent />
    </Suspense>
  );
}