import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardCopy, ChevronDown, ChevronUp } from "lucide-react";

const DataDisplay = ({ title, data }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
  };

  return (
    <Card className="my-4 border border-gray-200 shadow-sm">
      <CardHeader
        className="py-3 px-4 flex flex-row items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="text-md font-medium flex items-center">
          {title}
          {isExpanded ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4" />
          )}
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
          className="h-8"
        >
          <ClipboardCopy className="h-4 w-4 mr-1" />
          Copy
        </Button>
      </CardHeader>
      {isExpanded && (
        <CardContent className="px-4 py-2">
          <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-xs">
            {jsonString}
          </pre>
        </CardContent>
      )}
    </Card>
  );
};

export default DataDisplay;
