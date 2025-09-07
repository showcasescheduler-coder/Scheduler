"use client";

import React, { useState, useEffect, useRef } from "react";
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
  AlertCircle,
  CheckCircle,
  Send,
  Download,
  Copy,
  ArrowLeft,
  Bot,
  User,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";

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

export default function ScheduleChatPage() {
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


  // Initial load
  useEffect(() => {
    const loadInitialSchedule = async () => {
      setLoading(true);
      
      // Try to get the generated schedule from sessionStorage
      const storedSchedule = sessionStorage.getItem("generatedSchedule");
      console.log("Stored schedule found:", !!storedSchedule);
      
      let initialSchedule;
      if (storedSchedule) {
        // Use the AI-generated schedule
        console.log("Using AI-generated schedule");
        initialSchedule = JSON.parse(storedSchedule);
        console.log("Schedule site:", initialSchedule.site);
        console.log("Number of screens:", initialSchedule.screens?.length);
        // Don't remove immediately - wait a bit to avoid re-render issues
        setTimeout(() => {
          sessionStorage.removeItem("generatedSchedule");
        }, 1000);
      } else if (!schedule) {
        // Only redirect if we don't already have a schedule loaded
        console.log("No stored schedule and no existing schedule, redirecting to dashboard");
        toast.error("No schedule data found. Please generate a schedule first.");
        router.push('/dashboard');
        return;
      } else {
        // We already have a schedule loaded, just return
        console.log("Using existing schedule");
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
  }, [siteName]);

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

  // Export schedule (mock)
  const handleExportSchedule = () => {
    toast.success("Schedule exported! (Mock - would download file)");
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
                onClick={handleCopySchedule}
                variant="outline"
                size="sm"
                className="text-white border-purple-500/30 hover:bg-purple-800/20"
                disabled={loading}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button
                onClick={handleExportSchedule}
                variant="outline"
                size="sm"
                className="text-white border-purple-500/30 hover:bg-purple-800/20"
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
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
              <p className="text-sm text-slate-500 mt-2">Analyzing last week's data and applying best practices</p>
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