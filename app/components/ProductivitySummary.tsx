import {
  Brain,
  ArrowLeft,
  ArrowRight,
  Star,
  Clock,
  Zap,
  Target,
  Calendar,
  BookOpen,
  Battery,
  Shield,
  Rocket,
} from "lucide-react";

// Add types for profile categories
type FlowProfile = "Deep Diver" | "Balanced Focuser" | "Agile Switcher";
type OrganizationProfile =
  | "Structured Planner"
  | "Flexible Organizer"
  | "Adaptive Arranger";
type IntensityProfile =
  | "High-Intensity Achiever"
  | "Steady Performer"
  | "Balanced Progressor";

interface ProfileRecommendations {
  flowProfile: {
    type: FlowProfile;
    workBlockDuration: string;
    bufferTime: string;
    environment: string;
    protectionStrategy: string;
  };
  organizationProfile: {
    type: OrganizationProfile;
    flexibility: string;
    transitionStyle: string;
    planningHorizon: string;
    bufferStrategy: string;
  };
  intensityProfile: {
    type: IntensityProfile;
    taskLoad: string;
    challengeDistribution: string;
    energyStyle: string;
    timeStrategy: string;
  };
}
