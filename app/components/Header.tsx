"use client";
import React, { useState, ReactNode } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  PanelLeft,
  Package2,
  Home,
  FolderKanban,
  ListTodo,
  CalendarDays,
  CalendarClock,
  LineChart,
  Settings,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LucideIcon } from "lucide-react";

const today = new Date();
interface NavLinkProps {
  href: string;
  icon: LucideIcon;
  children: ReactNode;
}

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const closeSheet = () => setIsOpen(false);

  const NavLink: React.FC<NavLinkProps> = ({ href, icon: Icon, children }) => (
    <Link
      href={href}
      className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
      onClick={closeSheet}
    >
      <Icon className="h-5 w-5" />
      {children}
    </Link>
  );

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <div className="flex items-center">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="sm:hidden">
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="#"
                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                onClick={closeSheet}
              >
                <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">Acme Inc</span>
              </Link>
              <NavLink href="/dashboard/fulldashboard" icon={Home}>
                Dashboard
              </NavLink>
              <NavLink href="/dashboard/projects" icon={FolderKanban}>
                Projects
              </NavLink>
              <NavLink href="/dashboard/tasks" icon={ListTodo}>
                Tasks
              </NavLink>
              <NavLink href="/dashboard/events" icon={CalendarDays}>
                Events
              </NavLink>
              <NavLink href="/dashboard/routines" icon={CalendarClock}>
                Routines
              </NavLink>
              <NavLink href="/dashboard/analytics" icon={LineChart}>
                Analytics
              </NavLink>
              <NavLink href="#" icon={Settings}>
                Settings
              </NavLink>
            </nav>
          </SheetContent>
        </Sheet>
        <Breadcrumb className="hidden md:flex ml-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="#">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="#">Orders</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Recent Orders</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center gap-2 absolute left-1/2 transform -translate-x-1/2 sm:static sm:left-auto sm:transform-none">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium sm:text-base whitespace-nowrap">
            {format(today, "EEEE, MMMM d, yyyy")}
          </span>
        </div>
        <UserButton />
      </div>
    </header>
  );
};

export default Header;
