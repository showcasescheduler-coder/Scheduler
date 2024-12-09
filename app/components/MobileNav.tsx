import React from "react";
import Link from "next/link";
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
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <Brain className="h-8 w-8 text-blue-600" />
        <SheetClose className="rounded-sm opacity-70 hover:opacity-100 ring-offset-background transition-opacity" />
      </div>

      <nav className="flex-1 p-4">
        <div className="flex flex-col space-y-6">
          <a
            href="/dashboard"
            className="flex items-center space-x-3 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="flex-1">Dashboard</span>
          </a>

          <a
            href="/dashboard/projects"
            className="flex items-center space-x-3 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <FolderKanban className="h-5 w-5" />
            <span className="flex-1">Projects</span>
          </a>

          <a
            href="/dashboard/tasks"
            className="flex items-center space-x-3 text-sm font-medium text-blue-600"
          >
            <ListTodo className="h-5 w-5" />
            <span className="flex-1">Tasks</span>
          </a>

          <a
            href="/dashboard/events"
            className="flex items-center space-x-3 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <Calendar className="h-5 w-5" />
            <span className="flex-1">Events</span>
          </a>

          <a
            href="/dashboard/routines"
            className="flex items-center space-x-3 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <Repeat className="h-5 w-5" />
            <span className="flex-1">Routines</span>
          </a>

          <a
            href="/dashboard/analytics"
            className="flex items-center space-x-3 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <BarChart2 className="h-5 w-5" />
            <span className="flex-1">Analytics</span>
          </a>
        </div>
      </nav>
    </div>
  );
};

export default MobileNav;
