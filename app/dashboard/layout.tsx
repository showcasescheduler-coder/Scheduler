import React, { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import Aside from "../components/Aside";
import Header from "../components/Header";
import { Toaster } from "react-hot-toast";

interface Props {
  children: ReactNode;
}

const layout = ({ children }: Props) => {
  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Aside />

        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          {/* Header */}
          <Header />
          {children}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default layout;
