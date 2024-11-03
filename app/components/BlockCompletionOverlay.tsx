import React from "react";
import { Loader2 } from "lucide-react";

interface BlockCompletionOverlayProps {
  isVisible: boolean;
  step: string;
}

const BlockCompletionOverlay: React.FC<BlockCompletionOverlayProps> = ({
  isVisible,
  step,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 relative">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
          <div className="space-y-2 text-center">
            <h3 className="font-semibold text-lg">Completing Block</h3>
            <p className="text-muted-foreground text-sm">{step}</p>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div className="bg-primary h-2 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockCompletionOverlay;
