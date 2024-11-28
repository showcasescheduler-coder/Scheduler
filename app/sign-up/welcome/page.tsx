import React from "react";
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

const WelcomeScreen = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="flex items-center space-x-3">
              <Brain className="h-12 w-12 text-blue-600" />
              <span className="text-3xl font-bold text-gray-900">
                ScheduleSmart
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-gray-900">
                Welcome to ScheduleSmart
              </h1>

              <p className="text-xl text-gray-600 max-w-lg">
                Let's personalize your schedule based on your natural rhythms,
                preferences, and work habits. This will only take a few minutes!
              </p>
            </div>
            <Link href="/sign-up">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold 
                py-3 px-8 text-lg w-full max-w-sm"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeScreen;
