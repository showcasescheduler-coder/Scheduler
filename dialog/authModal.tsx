import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, Check, CreditCard, Calendar } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: "accept" | "regenerate";
}

const AuthModal = ({ isOpen, onClose, actionType }: AuthModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            Start Your 14-Day Free Trial
          </DialogTitle>
          <DialogDescription className="text-base">
            Try ScheduleSmart Pro free for 14 days. No credit card required
            during trial.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4">
            {/* Feature List */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">
                  Unlimited AI schedule generations
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Custom schedule templates</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Priority-based task management</span>
              </div>
            </div>

            {/* Pricing Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">14-day free trial</span>
                </div>
                <span className="text-green-600 font-medium">$0</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Then</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">$9.99/month</span>
                  <p className="text-xs text-gray-500">Cancel anytime</p>
                </div>
              </div>
            </div>

            {/* Sign Up Button */}
            <SignUpButton mode="modal">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 h-11">
                <Sparkles className="h-4 w-4 mr-2" />
                Start Free Trial
              </Button>
            </SignUpButton>

            {/* Terms and Privacy */}
            <p className="text-xs text-center text-gray-500">
              By starting your trial, you agree to our{" "}
              <a href="/terms" className="text-blue-600 hover:underline">
                Terms
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
