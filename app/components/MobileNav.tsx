"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Calendar,
  Repeat,
  BarChart2,
} from "lucide-react";
import { SheetClose } from "@/components/ui/sheet";

const MobileNav = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    // Special case for dashboard to prevent it from being active for all /dashboard/* routes
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    // For other routes, check if the current path starts with the given path
    return pathname.startsWith(path);
  };

  const getLinkClass = (path: string) => {
    return `flex items-center space-x-3 text-sm font-medium ${
      isActive(path) ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
    } transition-colors`;
  };

  const getIconClass = (path: string) => {
    return `h-5 w-5 ${isActive(path) ? "text-blue-600" : ""} transition-colors`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <Brain className="h-8 w-8 text-blue-600" />
        <SheetClose className="rounded-sm opacity-70 hover:opacity-100 ring-offset-background transition-opacity" />
      </div>

      <nav className="flex-1 p-4">
        <div className="flex flex-col space-y-6">
          <Link href="/dashboard" className={getLinkClass("/dashboard")}>
            <LayoutDashboard className={getIconClass("/dashboard")} />
            <span className="flex-1">Dashboard</span>
          </Link>

          <Link
            href="/dashboard/projects"
            className={getLinkClass("/dashboard/projects")}
          >
            <FolderKanban className={getIconClass("/dashboard/projects")} />
            <span className="flex-1">Projects</span>
          </Link>

          <Link
            href="/dashboard/tasks"
            className={getLinkClass("/dashboard/tasks")}
          >
            <ListTodo className={getIconClass("/dashboard/tasks")} />
            <span className="flex-1">Tasks</span>
          </Link>

          <Link
            href="/dashboard/events"
            className={getLinkClass("/dashboard/events")}
          >
            <Calendar className={getIconClass("/dashboard/events")} />
            <span className="flex-1">Events</span>
          </Link>

          <Link
            href="/dashboard/routines"
            className={getLinkClass("/dashboard/routines")}
          >
            <Repeat className={getIconClass("/dashboard/routines")} />
            <span className="flex-1">Routines</span>
          </Link>

          <Link
            href="/dashboard/analytics"
            className={getLinkClass("/dashboard/analytics")}
          >
            <BarChart2 className={getIconClass("/dashboard/analytics")} />
            <span className="flex-1">Analytics</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default MobileNav;
