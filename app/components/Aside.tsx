"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package2,
  ListTodo,
  FolderKanban,
  CalendarClock,
  CalendarDays,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Aside = () => {
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const getLinkClassName = (href: string) => {
    const baseClasses =
      "flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8";
    const activeClasses = "bg-accent text-accent-foreground";
    const inactiveClasses = "text-muted-foreground hover:text-foreground";

    return `${baseClasses} ${
      isLinkActive(href) ? activeClasses : inactiveClasses
    }`;
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="#"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">Acme Inc</span>
        </Link>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/dashboard" className={getLinkClassName("/dashboard")}>
              <Home className="h-5 w-5" />
              <span className="sr-only">Dashboard</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Dashboard</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/dashboard/projects"
              className={getLinkClassName("/dashboard/projects")}
            >
              <FolderKanban className="h-5 w-5" />
              <span className="sr-only">Projects</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Projects</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/dashboard/tasks"
              className={getLinkClassName("/dashboard/tasks")}
            >
              <ListTodo className="h-5 w-5" />
              <span className="sr-only">Tasks</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Tasks</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/dashboard/events"
              className={getLinkClassName("/dashboard/events")}
            >
              <CalendarDays className="h-5 w-5" />
              <span className="sr-only">Events</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Events</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/dashboard/routines"
              className={getLinkClassName("/dashboard/routines")}
            >
              <CalendarClock className="h-5 w-5" />
              <span className="sr-only">Routines</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Routines</TooltipContent>
        </Tooltip>
      </nav>
    </aside>
  );
};

export default Aside;
