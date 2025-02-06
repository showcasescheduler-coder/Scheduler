import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, Check, Clock, Wand2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: "accept" | "regenerate";
}

const AuthModal = ({ isOpen, onClose, actionType }: AuthModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2 justify-center">
            <Brain className="h-8 w-8 text-purple-600" />
            Unlock ScheduleSmart
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {actionType === "accept"
              ? "Ready to save your perfect schedule? Sign up to continue!"
              : "Want to try a different schedule? Sign up to explore more options!"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="space-y-6">
            {/* Value Propositions */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-purple-50 p-3 rounded-lg">
                <Wand2 className="h-5 w-5 text-purple-600 flex-shrink-0" />
                <span className="text-sm">
                  Create unlimited AI-powered schedules tailored to your needs
                </span>
              </div>
              <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm">
                  Save hours of manual planning with smart scheduling
                </span>
              </div>
              <div className="flex items-center gap-3 bg-green-50 p-3 rounded-lg">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm">
                  Access all core features completely free
                </span>
              </div>
            </div>

            {/* Sign Up Button */}
            <div className="space-y-4">
              <SignUpButton mode="modal">
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-base"
                  onClick={onClose}
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Sign Up For Free
                </Button>
              </SignUpButton>

              <p className="text-center text-sm text-gray-600">
                No credit card required
              </p>
            </div>

            {/* Terms and Privacy */}
            <p className="text-xs text-center text-gray-500">
              By signing up, you agree to our{" "}
              <a href="/terms" className="text-purple-600 hover:underline">
                Terms
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-purple-600 hover:underline">
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
