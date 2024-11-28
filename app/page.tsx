// "use client";
// import {
//   SignInButton,
//   SignUpButton,
//   SignedIn,
//   SignedOut,
//   UserButton,
//   useAuth,
// } from "@clerk/nextjs";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Brain,
//   Sparkles,
//   Target,
//   ChevronRight,
//   Clock,
//   Users,
//   BarChart,
//   Check,
// } from "lucide-react";

// import Image from "next/image";

// const Home = () => {
//   const { isLoaded, userId } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (isLoaded && userId) {
//       router.push("/dashboard");
//     }
//   }, [isLoaded, userId, router]);

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
//       <h1 className="text-4xl font-bold mb-8">Welcome to Your App</h1>

//       <SignedOut>
//         <div className="space-x-4">
//           <SignInButton mode="modal">
//             <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
//               Sign In
//             </button>
//           </SignInButton>
//           <SignUpButton mode="modal">
//             <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
//               Sign Up
//             </button>
//           </SignUpButton>
//         </div>
//       </SignedOut>

//       <SignedIn>
//         <div className="flex flex-col items-center">
//           <p className="mb-4">Redirecting to dashboard...</p>
//           <UserButton />
//         </div>
//       </SignedIn>
//     </div>
//   );
// };

// export default Home;

// Complete Homepage

"use client";
import React, { useState } from "react";
import { Brain, Calendar, Send } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAppContext } from "@/app/context/AppContext";
import { useRouter } from "next/navigation";

export default function Component() {
  const [inputValue, setInputValue] = React.useState("");
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [prompt, setPrompt] = useState("");
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const { setPromptText } = useAppContext();
  const router = useRouter();
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Generating schedule for:", inputValue);
  };

  const handleGenerateSchedule = () => {
    setPromptText(inputValue);
    router.push("/dashboard");
  };

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
          <nav className="ml-auto flex items-center gap-6">
            {["Features", "How It Works", "Research", "Pricing"].map((item) => (
              <Link
                key={item}
                className="text-sm font-medium text-[#64748b] transition-colors hover:text-blue-600"
                href="#"
              >
                {item}
              </Link>
            ))}
            <div className="flex items-center gap-2">
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700"
                size="sm"
              >
                Sign Up
              </Button>
              <Button
                className="bg-white text-blue-600 hover:bg-blue-50 border border-blue-600"
                size="sm"
              >
                Sign In
              </Button>
            </div>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="container flex flex-col items-center justify-center gap-4 pb-8 pt-24 md:pb-12 md:pt-32 lg:py-32">
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
                {/* <Card className="mb-6 bg-[#f1f5f9] border-none">
                  <CardContent className="p-4 flex items-center justify-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                    <p className="text-lg font-medium text-[#1e293b]">
                      {formatDate(selectedDate)}
                    </p>
                  </CardContent>
                </Card> */}
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
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <Textarea
                        placeholder={`Describe your tasks, preferences, and any other relevant information for ${tab}'s schedule...`}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="min-h-[150px] border-[#e2e8f0] focus:border-blue-600"
                      />
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
                    </form>
                  </TabsContent>
                ))}
              </Tabs>
              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  {
                    label: "Plan my workday",
                    text: "Help me plan my workday efficiently",
                  },
                  {
                    label: "Schedule meetings",
                    text: "Schedule my meetings with appropriate breaks",
                  },
                  {
                    label: "Study schedule",
                    text: "Create a balanced study schedule with breaks",
                  },
                ].map(({ label, text }) => (
                  <Button
                    key={label}
                    variant="outline"
                    size="sm"
                    className="border-[#e2e8f0] text-sm text-[#64748b] hover:bg-[#f1f5f9] hover:text-blue-600"
                    onClick={() =>
                      setInputValue((prev) => prev + `\n• ${text}`)
                    }
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
