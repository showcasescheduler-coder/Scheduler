"use client";

import {
  Brain,
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Calendar,
  Repeat,
  BarChart2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import AuthModal from "@/dialog/authModal";

export function SidebarContent() {
  const { isSignedIn } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const pathname = usePathname();

  const handleNavigation = (e: React.MouseEvent, path: string) => {
    if (!isSignedIn) {
      e.preventDefault();
      setShowAuthModal(true);
    }
  };

  const isActive = (path: string) => {
    // Special case for dashboard to prevent it from being active for all /dashboard/* routes
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    // For other routes, check if the current path starts with the given path
    return pathname.startsWith(path);
  };

  const getIconClass = (path: string) => {
    return `h-5 w-5 ${
      isActive(path) ? "text-blue-600" : "text-gray-400"
    } transition-colors`;
  };

  return (
    <div className="flex flex-col items-center py-6 space-y-8">
      <Link href={"/"} className="flex flex-col items-center gap-2">
        <Brain className="h-8 w-8 text-blue-600" />
      </Link>
      <nav className="flex flex-col space-y-8">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/dashboard"
                className="flex items-center justify-center"
                onClick={(e) => handleNavigation(e, "/dashboard")}
              >
                <LayoutDashboard className={getIconClass("/dashboard")} />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Dashboard</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/dashboard/projects"
                className="flex items-center justify-center"
                onClick={(e) => handleNavigation(e, "/dashboard/projects")}
              >
                <FolderKanban className={getIconClass("/dashboard/projects")} />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Projects</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/dashboard/tasks"
                className="flex items-center justify-center"
                onClick={(e) => handleNavigation(e, "/dashboard/tasks")}
              >
                <ListTodo className={getIconClass("/dashboard/tasks")} />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Tasks</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/dashboard/events"
                className="flex items-center justify-center"
                onClick={(e) => handleNavigation(e, "/dashboard/events")}
              >
                <Calendar className={getIconClass("/dashboard/events")} />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Events</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/dashboard/routines"
                className="flex items-center justify-center"
                onClick={(e) => handleNavigation(e, "/dashboard/routines")}
              >
                <Repeat className={getIconClass("/dashboard/routines")} />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Routines</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/dashboard/analytics"
                className="flex items-center justify-center"
                onClick={(e) => handleNavigation(e, "/dashboard/analytics")}
              >
                <BarChart2 className={getIconClass("/dashboard/analytics")} />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Analytics</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        actionType="accept"
      />
    </div>
  );
}
