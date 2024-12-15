import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, PlusCircle, Sparkles } from "lucide-react";

interface NoBlocksCardProps {
  activeTab: "active" | "completed";
  onGenerateSchedule: () => void;
  onAddBlock: () => void;
}

const NoBlocksCard = ({
  activeTab,
  onGenerateSchedule,
  onAddBlock,
}: NoBlocksCardProps) => {
  return (
    <div className="flex h-[600px] w-full max-w-[100vw] px-2 md:px-0">
      <Card className="flex w-full bg-gray-50">
        <CardContent className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <ClipboardList className="mb-4 h-16 w-16 text-blue-600" />
          <h3 className="mb-2 text-2xl font-semibold text-gray-900">
            {activeTab === "active"
              ? "No Blocks Scheduled"
              : "No Completed Blocks"}
          </h3>
          <p className="mb-4 max-w-md text-gray-500">
            {activeTab === "active"
              ? "Start planning your day by adding time blocks, routines, or events. You can also generate a schedule based on your tasks and preferences."
              : "Complete some blocks to see them here. You can mark a block as complete when you've finished all its tasks."}
          </p>
          {activeTab === "active" && (
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                onClick={onGenerateSchedule}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Schedule
              </Button>
              <Button
                variant="outline"
                onClick={onAddBlock}
                className="border-gray-200 hover:bg-gray-50"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add First Block
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NoBlocksCard;
