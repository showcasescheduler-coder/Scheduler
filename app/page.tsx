"use client";
import React, { useState } from "react";
import { Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function HomePage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
      <header className="sticky top-0 z-50 w-full border-b border-purple-800/30 bg-slate-900/95 backdrop-blur">
        <div className="container flex h-16 max-w-screen-2xl items-center px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/showcase.png"
              alt="Showcase Cinemas"
              width={120}
              height={24}
              className="h-6 w-auto filter brightness-0 invert"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="ml-auto hidden md:flex items-center gap-6">
            <Link href="/dashboard">
              <Button
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 border-0 shadow-lg"
                size="sm"
              >
                Dashboard
              </Button>
            </Link>
          </nav>

          {/* Mobile Navigation */}
          <div className="ml-auto md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-2 text-white hover:bg-purple-800/50"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-64 bg-slate-900 border-purple-800/30"
              >
                <nav className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2 mt-4">
                    <Link href="/dashboard">
                      <Button
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 border-0"
                        size="sm"
                        onClick={() => setIsSheetOpen(false)}
                      >
                        Dashboard
                      </Button>
                    </Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-purple-900/40 to-transparent"></div>

        {/* Content */}
        <div className="text-center px-4 relative z-10">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full"></div>
              <Image
                src="/showcase.png"
                alt="Showcase Cinemas"
                width={300}
                height={60}
                className="h-12 md:h-16 w-auto relative z-10 filter brightness-0 invert"
                priority
              />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white tracking-wide">
            Cinema Scheduling
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              Platform
            </span>
          </h1>

          <p className="text-xl text-slate-300 max-w-md mx-auto mb-8 leading-relaxed">
            Optimize your cinema schedules with AI-powered insights to maximize
            revenue and enhance customer experience.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 px-8 py-3 text-lg font-medium shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
                size="lg"
              >
                Access Dashboard
              </Button>
            </Link>
            {/* <Link href="/schedules">
              <Button
                className="bg-transparent text-purple-300 hover:bg-purple-800/50 border border-purple-500/50 hover:border-purple-400 px-8 py-3 text-lg font-medium transition-all duration-200"
                size="lg"
              >
                View Schedules
              </Button>
            </Link> */}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-400 rounded-full opacity-40 animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-purple-300 rounded-full opacity-30 animate-pulse delay-500"></div>
      </main>
    </div>
  );
}
