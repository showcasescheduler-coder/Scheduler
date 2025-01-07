"use client";
import React, { useState, useRef, useEffect } from "react";
import { Brain, Calendar, Send, AlertCircle, Menu } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAppContext } from "@/app/context/AppContext";
import { useRouter } from "next/navigation";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Component() {
  const [thoughts, setThoughts] = useState([""]);
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [prompt, setPrompt] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const { setPromptText, setIsGeneratingSchedule } = useAppContext();
  const router = useRouter();

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newThoughts = [...thoughts];
      newThoughts.splice(index + 1, 0, "");
      setThoughts(newThoughts);
      setTimeout(() => {
        // Fix: Add null check
        if (inputRefs.current[index + 1]) {
          inputRefs.current[index + 1]?.focus();
        }
      }, 0);
    } else if (
      e.key === "Backspace" &&
      thoughts[index] === "" &&
      thoughts.length > 1
    ) {
      e.preventDefault();
      const newThoughts = thoughts.filter((_, i) => i !== index);
      setThoughts(newThoughts);
      setTimeout(() => {
        // Fix: Add null check
        const prevInput = inputRefs.current[Math.max(0, index - 1)];
        if (prevInput) {
          prevInput.focus();
        }
      }, 0);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newThoughts = [...thoughts];
    newThoughts[index] = e.target.value;
    setThoughts(newThoughts);
  };

  const handleGenerateSchedule = () => {
    const cleanThoughts = thoughts
      .filter((thought) => thought.trim() !== "")
      .join("\n");
    setPromptText(cleanThoughts);
    setIsGeneratingSchedule(true);
    router.push("/dashboard");
  };

  const addSuggestion = (text: string) => {
    setThoughts((prev) => {
      // If there's only one thought and it's empty, replace it
      if (prev.length === 1 && prev[0] === "") {
        return [text];
      }
      // Otherwise append to the list
      return [...prev, text];
    });
  };

  const handleAuthClick = () => {
    setIsSheetOpen(false);
  };

  const navItems = ["Features", "How It Works", "Research", "Pricing"];

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc]">
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container flex h-16 max-w-screen-2xl items-center px-4">
          <Link href="/" className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-semibold text-[#1e293b]">
              ScheduleSmart
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="ml-auto hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item}
                className="text-sm font-medium text-[#64748b] transition-colors hover:text-blue-600"
                href="#"
              >
                {item}
              </Link>
            ))}
            <div className="flex items-center gap-2">
              <SignUpButton mode="modal">
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  size="sm"
                >
                  Sign Up
                </Button>
              </SignUpButton>
              <SignInButton mode="modal">
                <Button
                  className="bg-white text-blue-600 hover:bg-blue-50 border border-blue-600"
                  size="sm"
                >
                  Sign In
                </Button>
              </SignInButton>
            </div>
          </nav>

          {/* Mobile Navigation */}
          <div className="ml-auto md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="px-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <nav className="flex flex-col gap-4">
                  {navItems.map((item) => (
                    <Link
                      key={item}
                      className="text-sm font-medium text-[#64748b] transition-colors hover:text-blue-600"
                      href="#"
                    >
                      {item}
                    </Link>
                  ))}
                  <div className="flex flex-col gap-2 mt-4">
                    <SignUpButton mode="modal">
                      <Button
                        className="w-full bg-blue-600 text-white hover:bg-blue-700"
                        size="sm"
                        onClick={handleAuthClick}
                      >
                        Sign Up
                      </Button>
                    </SignUpButton>
                    <SignInButton mode="modal">
                      <Button
                        className="w-full bg-white text-blue-600 hover:bg-blue-50 border border-blue-600"
                        size="sm"
                        onClick={handleAuthClick}
                      >
                        Sign In
                      </Button>
                    </SignInButton>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container flex flex-col items-center justify-center gap-4 pb-8 pt-16 md:pb-12 md:pt-32 lg:py-32">
          {" "}
          <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-bold leading-tight tracking-tighter text-[#1e293b] md:text-6xl lg:leading-[1.1]">
              Optimize Your Schedule with{" "}
              <span className="text-blue-600">AI</span> and Behavioral Science
            </h1>
            <p className="max-w-[750px] text-lg text-[#64748b] sm:text-xl">
              ScheduleSmart combines cutting-edge artificial intelligence with
              proven behavioral science principles to create personalized,
              efficient schedules that maximize your productivity.
            </p>
          </div>
          <Card className="mx-auto mt-8 w-full max-w-[800px] bg-white">
            <CardContent className="p-6">
              <Tabs
                defaultValue="today"
                className="w-full"
                onValueChange={(value) =>
                  setSelectedDate(value === "today" ? today : tomorrow)
                }
              >
                <TabsList className="mb-4 grid w-full grid-cols-2 bg-[#f1f5f9]">
                  <TabsTrigger
                    value="today"
                    className="data-[state=active]:bg-white data-[state=active]:text-blue-600"
                  >
                    Today
                  </TabsTrigger>
                  <TabsTrigger
                    value="tomorrow"
                    className="data-[state=active]:bg-white data-[state=active]:text-blue-600"
                  >
                    Tomorrow
                  </TabsTrigger>
                </TabsList>
                {["today", "tomorrow"].map((tab) => (
                  <TabsContent key={tab} value={tab}>
                    <div className="space-y-4">
                      <div className="space-y-2 rounded-lg border-2 border-[#e2e8f0] p-6 bg-white shadow-sm hover:border-blue-100 hover:shadow-md transition-all duration-200">
                        {thoughts.map((thought, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3"
                          >
                            <span className="text-blue-600 mt-1 text-lg">
                              •
                            </span>
                            <input
                              ref={(el) => {
                                // Fix: Properly set ref
                                inputRefs.current[index] = el;
                              }}
                              type="text"
                              value={thought}
                              onChange={(e) => handleChange(e, index)}
                              onKeyDown={(e) => handleKeyDown(e, index)}
                              placeholder={
                                index === 0
                                  ? "What do you want to accomplish today (meetings, study goals, preferences...)..."
                                  : "Add another thought..."
                              }
                              className="flex-1 p-2 focus:outline-none focus:ring-2 focus:ring-blue-100 rounded-md w-full text-xs md:text-lg placeholder:text-gray-400 placeholder:text-xs md:placeholder:text-lg bg-transparent"
                            />
                          </div>
                        ))}
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-blue-600 text-white hover:bg-blue-700"
                        onClick={handleGenerateSchedule}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Generate {tab === "today"
                          ? "Today's"
                          : "Tomorrow's"}{" "}
                        Schedule
                      </Button>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  {
                    label: "Pomodoro Study Day",
                    thoughts: [
                      "Need to start with light exercise and breakfast at 8:30am",
                      "Need first Pomodoro study block 9:00-10:30am (3x 25min sessions with 5min breaks)",
                      "Need longer break with walk at 10:30am",
                      "Need second Pomodoro study block 11:00-12:30pm",
                      "Need lunch and rest break 12:30-1:30pm",
                      "Need review session 1:30-3:00pm",
                      "Need final Pomodoro block for practice problems 3:30-5:00pm",
                      "Need end-of-day summary and next day planning 5:00-5:30pm",
                    ],
                  },
                  {
                    label: "Deep Work Day",
                    thoughts: [
                      "Need to do morning prep routine 7:30-8:00am (no digital devices)",
                      "Need planning and email block 8:00-9:00am",
                      "Need first deep work session 9:00-11:30am (notifications off)",
                      "Need movement break 11:30-12:00pm",
                      "Need light admin tasks and lunch 12:00-1:00pm",
                      "Need second deep work session 1:00-3:30pm",
                      "Need afternoon break with brief walk 3:30-4:00pm",
                      "Need final focused session 4:00-5:30pm",
                      "Need daily review and shutdown routine 5:30-6:00pm",
                    ],
                  },
                  {
                    label: "Energy Management Day",
                    thoughts: [
                      "Need morning energy routine (light exercise, meditation) 7:00-8:00am",
                      "Need high-focus work during peak hours 8:30-11:00am",
                      "Need active break with movement 11:00-11:30am",
                      "Need medium-focus tasks 11:30-1:00pm",
                      "Need lunch and rest period 1:00-2:00pm",
                      "Need creative/collaborative work 2:00-4:00pm",
                      "Need light tasks and planning 4:00-5:00pm",
                      "Need evening recovery routine 5:00-6:00pm",
                    ],
                    mobileHidden: true,
                  },
                ].map(({ label, thoughts, mobileHidden }) => (
                  <Button
                    key={label}
                    variant="outline"
                    size="sm"
                    className={`border-[#e2e8f0] text-xs md:text-sm text-[#64748b] hover:bg-[#f1f5f9] hover:text-blue-600 ${
                      mobileHidden ? "hidden md:inline-flex" : ""
                    }`}
                    onClick={() => {
                      // Clear any initial empty thought before adding template
                      if (thoughts.length === 1 && thoughts[0] === "") {
                        setThoughts([]);
                      }
                      thoughts.forEach((thought) => addSuggestion(thought));
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
