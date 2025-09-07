"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Building,
  Menu,
  BookOpen,
  ChevronLeft,
  Save,
  Trash,
  Edit,
  X,
  PlayCircle,
  PauseCircle,
  FileText,
  AlertCircle,
  Plus,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Placeholder data for site details
const placeholderSite = {
  _id: "1",
  name: "Showcase Cinema Leicester",
  description:
    "Premier cinema location in Leicester city center with state-of-the-art facilities and premium viewing experiences",
  address: {
    street: "30 Leicester Street",
    city: "Leicester",
    state: "LE",
    zip: "LE1 3RG",
  },
  status: "active",
  operatingHours: {
    monday: { open: "11:00", close: "23:00" },
    tuesday: { open: "11:00", close: "23:00" },
    wednesday: { open: "11:00", close: "23:00" },
    thursday: { open: "11:00", close: "23:00" },
    friday: { open: "11:00", close: "23:00" },
    saturday: { open: "09:00", close: "01:00" },
    sunday: { open: "09:00", close: "23:00" },
  },
  screens: [
    {
      _id: "screen1",
      name: "IMAX Theatre",
      capacity: 300,
      features: ["IMAX", "Dolby Atmos", "Reserved Seating", "Premium Sound"],
    },
    {
      _id: "screen2",
      name: "Dolby Cinema",
      capacity: 250,
      features: [
        "Dolby Vision",
        "Dolby Atmos",
        "Luxury Seating",
        "Reclining Seats",
      ],
    },
    {
      _id: "screen3",
      name: "Screen 3",
      capacity: 180,
      features: ["3D", "Digital Projection", "Reserved Seating"],
    },
    {
      _id: "screen4",
      name: "Screen 4",
      capacity: 180,
      features: ["Digital Projection", "Wheelchair Accessible", "Hearing Loop"],
    },
    {
      _id: "screen5",
      name: "Screen 5",
      capacity: 120,
      features: ["Digital Projection", "Reserved Seating"],
    },
    {
      _id: "screen6",
      name: "VIP Lounge Theatre",
      capacity: 80,
      features: [
        "VIP Experience",
        "Bar Service",
        "Dine-in",
        "Luxury Seating",
        "Dolby Atmos",
      ],
    },
  ],
  amenities: [
    "Free WiFi",
    "Parking",
    "Food Court",
    "Accessibility Features",
    "Premium Concessions",
  ],
  customPrompt:
    "This Leicester city center location primarily serves young professionals and families. Weekend evenings see high demand for blockbusters. The VIP Lounge Theatre is popular for date nights and special occasions. IMAX screenings typically sell out for major releases. Consider the large student population - discounted pricing works well for weekday matinees. The location is easily accessible via public transport, leading to consistent foot traffic throughout the week.",
  updatedAt: "2025-06-15T10:30:00Z",
  createdAt: "2024-01-15T10:30:00Z",
};

// Placeholder amenities data
const placeholderAmenities = [
  {
    _id: "1",
    name: "Free WiFi",
    description: "Complimentary wireless internet access throughout the venue",
  },
  {
    _id: "2",
    name: "Parking",
    description: "On-site parking facilities for customers",
  },
  {
    _id: "3",
    name: "Food Court",
    description: "Variety of dining options and concessions",
  },
  {
    _id: "4",
    name: "Accessibility Features",
    description:
      "Wheelchair accessible facilities and assistive listening devices",
  },
  {
    _id: "5",
    name: "Premium Concessions",
    description: "Gourmet snacks and beverages including alcohol",
  },
  {
    _id: "6",
    name: "Gaming Area",
    description: "Arcade and gaming facilities",
  },
  {
    _id: "7",
    name: "Party Rooms",
    description: "Private rooms for birthday parties and events",
  },
  {
    _id: "8",
    name: "Baby-Friendly",
    description: "Baby changing facilities and parent-friendly screenings",
  },
  {
    _id: "9",
    name: "Student Discounts",
    description: "Special pricing for students with valid ID",
  },
  {
    _id: "10",
    name: "Loyalty Program",
    description: "Rewards program for frequent visitors",
  },
];

export default function SiteDetailPage({ params }: { params: { id: string } }) {
  const siteId = params?.id;
  const [isEditing, setIsEditing] = useState(false);
  const [site, setSite] = useState<any>(null);
  const [originalSite, setOriginalSite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [amenities, setAmenities] = useState<any[]>([]);
  const [isAddScreenDialogOpen, setIsAddScreenDialogOpen] = useState(false);
  const [newScreen, setNewScreen] = useState({
    name: "",
    capacity: "",
    features: [],
  });
  const [isAmenityDialogOpen, setIsAmenityDialogOpen] = useState(false);
  const [isManageAmenitiesDialogOpen, setIsManageAmenitiesDialogOpen] =
    useState(false);
  const [newAmenity, setNewAmenity] = useState({ name: "", description: "" });
  const [editingAmenity, setEditingAmenity] = useState<any>(null);
  const router = useRouter();
  const [newFeatureInput, setNewFeatureInput] = useState<{ [key: string]: string }>({});

  // Removed API fetch since we're using placeholder data
  useEffect(() => {
    if (siteId) {
      // Data is already set with placeholder, just ensure daily hours
      const ensureDailyHours = (siteData: any) => {
        const updatedHours = { ...siteData.operatingHours };
        const defaultOpen = "11:00";
        const defaultClose = "23:00";

        const daysOfWeek = [
          { id: "monday", label: "Monday" },
          { id: "tuesday", label: "Tuesday" },
          { id: "wednesday", label: "Wednesday" },
          { id: "thursday", label: "Thursday" },
          { id: "friday", label: "Friday" },
          { id: "saturday", label: "Saturday" },
          { id: "sunday", label: "Sunday" },
        ];

        daysOfWeek.forEach((day: { id: string; label: string }) => {
          if (!updatedHours[day.id]) {
            updatedHours[day.id] = {
              open: defaultOpen,
              close: defaultClose,
            };
          }
        });

        setSite((prev) => ({
          ...prev,
          operatingHours: updatedHours,
        }));
      };
      
      // Fetch site data from database
      const fetchData = async () => {
        try {
          setLoading(true);
          
          // Fetch site data
          const siteResponse = await fetch(`/api/sites/${siteId}`);
          const siteData = await siteResponse.json();
          
          // Fetch amenities
          const amenitiesResponse = await fetch('/api/amenities');
          const amenitiesData = await amenitiesResponse.json();
          
          if (siteData.success && siteData.site) {
            setSite(siteData.site);
            ensureDailyHours(siteData.site);
            setOriginalSite(siteData.site);
          } else {
            toast.error('Failed to load site');
          }
          
          if (amenitiesData.success) {
            setAmenities(amenitiesData.amenities || []);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          toast.error('Failed to load data');
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }
  }, [siteId]);

  // Replace the existing handleAddCustomFeature function
  const handleAddCustomFeature = async (screenId: string, featureName: string) => {
    if (!isEditing || !featureName || !featureName.trim()) return;

    const trimmedFeature = featureName.trim();

    // Find the current screen
    const screen = site.screens.find((s: any) => s._id === screenId);
    if (!screen) return;
    
    // Check if feature already exists (handle undefined features array)
    if (screen.features && screen.features.includes(trimmedFeature)) return;

    // Update local state
    setSite((prev) => ({
      ...prev,
      screens: prev.screens.map((screen: any) => {
        if (screen._id === screenId) {
          // Initialize features array if it doesn't exist
          const currentFeatures = screen.features || [];
          if (!currentFeatures.includes(trimmedFeature)) {
            return {
              ...screen,
              features: [...currentFeatures, trimmedFeature],
            };
          }
        }
        return screen;
      }),
    }));

    // Clear the input for this screen
    setNewFeatureInput((prev) => ({
      ...prev,
      [screenId]: "",
    }));

    // The actual save will happen when "Save Changes" is clicked
    toast.success(`Feature "${trimmedFeature}" added successfully!`);
  };

  // Handle Enter key press in feature input
  const handleFeatureInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, screenId: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const featureName = newFeatureInput[screenId];
      if (featureName && featureName.trim()) {
        handleAddCustomFeature(screenId, featureName);
      }
    }
  };

  const handleAddAmenityToSite = (amenityName: string) => {
    if (!isEditing) return;

    setSite((prev) => ({
      ...prev,
      amenities: prev.amenities?.includes(amenityName)
        ? prev.amenities
        : [...(prev.amenities || []), amenityName],
    }));
  };

  const handleRemoveAmenityFromSite = (amenityName: string) => {
    if (!isEditing) return;

    setSite((prev) => ({
      ...prev,
      amenities: prev.amenities?.filter((a: string) => a !== amenityName) || [],
    }));
  };

  const daysOfWeek = [
    { id: "monday", label: "Monday" },
    { id: "tuesday", label: "Tuesday" },
    { id: "wednesday", label: "Wednesday" },
    { id: "thursday", label: "Thursday" },
    { id: "friday", label: "Friday" },
    { id: "saturday", label: "Saturday" },
    { id: "sunday", label: "Sunday" },
  ];

  // Ensure each day has operating hours (fallback to defaults)
  const ensureDailyHours = (siteData: any) => {
    const updatedHours = { ...siteData.operatingHours };
    const defaultOpen = "11:00";
    const defaultClose = "23:00";

    daysOfWeek.forEach((day) => {
      if (!updatedHours[day.id]) {
        updatedHours[day.id] = {
          open: defaultOpen,
          close: defaultClose,
        };
      }
    });

    if (
      JSON.stringify(updatedHours) !== JSON.stringify(siteData.operatingHours)
    ) {
      setSite((prev) => ({
        ...prev,
        operatingHours: updatedHours,
      }));
    }
  };

  const suggestedFeatures = [
    "IMAX",
    "Dolby Atmos",
    "3D",
    "4DX",
    "Dolby Vision",
    "Luxury Seating",
    "Reclining Seats",
    "Reserved Seating",
    "Premium Sound",
    "Digital Projection",
    "70mm Film",
    "VIP Experience",
    "Bar Service",
    "Dine-in",
    "Wheelchair Accessible",
    "Hearing Loop",
    "Closed Captions",
  ];

  // Navigation links for sidebar
  const navLinks = [
    {
      name: "Schedule Generator",
      icon: Calendar,
      href: "/dashboard",
      active: false,
    },
    {
      name: "Sites",
      icon: Building,
      href: "/dashboard/sites",
      active: true,
    },
    {
      name: "Best Practices",
      icon: BookOpen,
      href: "/dashboard/best-practices",
      active: false,
    },
  ];

  const navigateTo = (url: string) => {
    router.push(url);
  };

  const handleInputChange = (field: string, value: string) => {
    setSite((prev) => ({ ...prev, [field]: value }));
    // Debug logging for customPrompt changes
    if (field === 'customPrompt') {
      console.log('CustomPrompt updated to:', value);
    }
  };

  const handleAddressChange = (field: string, value: string) => {
    setSite((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const handleOperatingHoursChange = (day: string, timeType: string, value: string) => {
    setSite((prev) => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day as keyof typeof prev.operatingHours],
          [timeType]: value,
        },
      },
    }));
  };

  const handleDeleteSite = async () => {
    try {
      const response = await fetch(`/api/sites/${siteId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Site deleted successfully!");
        router.push("/dashboard/sites");
      } else {
        toast.error(data.error || "Failed to delete site");
      }
    } catch (error) {
      console.error("Error deleting site:", error);
      toast.error("Failed to delete site");
    }
  };

  const handleStatusToggle = (checked: boolean) => {
    setSite((prev) => ({
      ...prev,
      status: checked ? "active" : "inactive",
    }));
  };

  const handleAddFeature = (screenId: string, feature: string) => {
    if (!isEditing || !feature) return;

    setSite((prev) => ({
      ...prev,
      screens: prev.screens.map((screen: any) => {
        if (screen._id === screenId && !screen.features.includes(feature)) {
          return {
            ...screen,
            features: [...screen.features, feature],
          };
        }
        return screen;
      }),
    }));
  };

  // Update the handleRemoveFeature function
  const handleRemoveFeature = async (screenId: string, feature: string) => {
    if (!isEditing) return;

    // Update local state
    setSite((prev) => ({
      ...prev,
      screens: prev.screens.map((screen: any) => {
        if (screen._id === screenId) {
          return {
            ...screen,
            features: (screen.features || []).filter((f: string) => f !== feature),
          };
        }
        return screen;
      }),
    }));

    // The actual save will happen when "Save Changes" is clicked
    toast.success(`Feature "${feature}" removed successfully!`);
  };

  const resetDayToDefault = (day: string) => {
    setSite((prev) => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: { open: "11:00", close: "23:00" },
      },
    }));
  };

  const applyToAllDays = (sourceDay: string) => {
    const sourceHours = site.operatingHours[sourceDay as keyof typeof site.operatingHours];
    const updatedHours = { ...site.operatingHours };

    daysOfWeek.forEach((day: { id: string; label: string }) => {
      updatedHours[day.id as keyof typeof updatedHours] = { ...sourceHours };
    });

    setSite((prev) => ({
      ...prev,
      operatingHours: updatedHours,
    }));
  };

  const handleCancelEdit = () => {
    setSite(originalSite);
    setIsEditing(false);
    toast("Edit cancelled", { icon: "🔄" });
  };

  // Updated handleSaveChanges
  const handleSaveChanges = async () => {
    try {
      const response = await fetch(`/api/sites/${siteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(site),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Site updated successfully!");
        // Use the returned site data to ensure we have the latest version
        const updatedSite = data.site || site;
        setSite(updatedSite);
        setOriginalSite(updatedSite);
        setIsEditing(false);
        
        // Log for debugging
        console.log("Site updated with customPrompt:", updatedSite.customPrompt);
      } else {
        toast.error(data.error || "Failed to update site");
      }
    } catch (error) {
      console.error("Error updating site:", error);
      toast.error("Failed to update site");
    }
  };

  // Updated handleAddScreen
  const handleAddScreen = async () => {
    if (!newScreen.name.trim() || !newScreen.capacity) {
      toast.error("Please fill in screen name and capacity");
      return;
    }

    try {
      const response = await fetch('/api/screens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteId: siteId,
          name: newScreen.name,
          capacity: parseInt(newScreen.capacity),
          features: newScreen.features || [],
          type: "Standard",
          status: "active",
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Screen "${newScreen.name}" added successfully!`);

        // Add the new screen to local state
        setSite((prev) => ({
          ...prev,
          screens: [...(prev.screens || []), data.screen],
        }));

        // Also update originalSite to keep edit state consistent
        setOriginalSite((prev) => ({
          ...prev,
          screens: [...(prev.screens || []), data.screen],
        }));

        setNewScreen({ name: "", capacity: "", features: [] });
        setIsAddScreenDialogOpen(false);
      } else {
        toast.error(data.error || "Failed to add screen");
      }
    } catch (error) {
      console.error("Error adding screen:", error);
      toast.error("Failed to add screen");
    }
  };

  // Updated handleDeleteScreen
  const handleDeleteScreen = async (screenId: string, screenName: string) => {
    try {
      const response = await fetch(`/api/screens/${screenId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Screen "${screenName}" deleted successfully!`);

        // Remove the screen from local state
        setSite((prev) => ({
          ...prev,
          screens: prev.screens.filter((screen: any) => screen._id !== screenId),
        }));

        // Also update originalSite to keep edit state consistent
        setOriginalSite((prev) => ({
          ...prev,
          screens: prev.screens.filter((screen: any) => screen._id !== screenId),
        }));
      } else {
        toast.error(data.error || "Failed to delete screen");
      }
    } catch (error) {
      console.error("Error deleting screen:", error);
      toast.error("Failed to delete screen");
    }
  };

  // Updated handleUpdateScreen
  const handleUpdateScreen = async (screenId: string, field: string, value: any) => {
    if (!isEditing) return;

    // Update local state immediately for better UX
    setSite((prev) => ({
      ...prev,
      screens: prev.screens.map((s: any) =>
        s._id === screenId ? { ...s, [field]: value } : s
      ),
    }));

    // The actual API call will happen when Save Changes is clicked
    // since we're updating the entire site object
  };

  // Updated handleCreateNewAmenity
  const handleCreateNewAmenity = async () => {
    if (!newAmenity.name.trim()) {
      toast.error("Amenity name is required");
      return;
    }

    try {
      // Simulate API call
      const newAmenityData = {
        _id: Date.now().toString(),
        name: newAmenity.name,
        description: newAmenity.description,
      };

      toast.success(`Amenity "${newAmenity.name}" created successfully!`);
      setNewAmenity({ name: "", description: "" });
      setIsAmenityDialogOpen(false);

      // Update amenities list in local state
      setAmenities((prev) => [...prev, newAmenityData]);

      // Optionally add to site immediately
      handleAddAmenityToSite(newAmenityData.name);
    } catch (error) {
      console.error("Error creating amenity:", error);
      toast.error("Failed to create amenity");
    }
  };

  // Updated handleUpdateAmenity
  const handleUpdateAmenity = async (amenityId: string, updatedData: any) => {
    try {
      // Simulate API call
      toast.success("Amenity updated successfully!");
      setEditingAmenity(null);

      // Update amenities list in local state
      setAmenities((prev) =>
        prev.map((amenity: any) =>
          amenity._id === amenityId ? { ...amenity, ...updatedData } : amenity
        )
      );
    } catch (error) {
      console.error("Error updating amenity:", error);
      toast.error("Failed to update amenity");
    }
  };

  // Updated handleDeleteAmenity
  const handleDeleteAmenity = async (amenityId: string, amenityName: string) => {
    try {
      // Simulate API call
      toast.success(`Amenity "${amenityName}" deleted successfully!`);

      // Remove from amenities list in local state
      setAmenities((prev) =>
        prev.filter((amenity: any) => amenity._id !== amenityId)
      );

      // Remove from site if it was assigned
      handleRemoveAmenityFromSite(amenityName);
    } catch (error) {
      console.error("Error deleting amenity:", error);
      toast.error("Failed to delete amenity");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Loading site details...</div>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 text-white">Site Not Found</h1>
          <p className="text-slate-400 mb-4">
            The site you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button
            onClick={() => router.push("/dashboard/sites")}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
          >
            Return to Sites
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex w-64 flex-col bg-slate-900/95 border-r border-purple-800/30 backdrop-blur">
        <Link
          href="/"
          className="p-4 flex items-center gap-2 border-b border-purple-800/30"
        >
          <Image
            src="/showcase.png"
            alt="Showcase Cinemas"
            width={120}
            height={24}
            className="h-6 w-auto filter brightness-0 invert"
            priority
          />
        </Link>
        <div className="flex-1 overflow-auto p-4">
          <nav className="space-y-1">
            {navLinks.map((link: any) => (
              <Button
                key={link.name}
                variant={link.active ? "default" : "ghost"}
                className={`w-full justify-start ${
                  link.active
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                    : "text-slate-300 hover:bg-purple-800/50 hover:text-white"
                }`}
                onClick={() => navigateTo(link.href)}
              >
                <link.icon className="mr-2 h-4 w-4" />
                {link.name}
              </Button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Mobile */}
        <header className="bg-slate-900/95 border-b border-purple-800/30 backdrop-blur p-4 flex items-center justify-between md:hidden">
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-purple-800/50"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="bg-slate-900 border-purple-800/30"
              >
                <div className="py-4">
                  <Link href="/" className="flex items-center gap-2 mb-4">
                    <Image
                      src="/showcase.png"
                      alt="Showcase Cinemas"
                      width={120}
                      height={24}
                      className="h-6 w-auto filter brightness-0 invert"
                      priority
                    />
                  </Link>
                  <nav className="space-y-2">
                    {navLinks.map((link: any) => (
                      <Button
                        key={link.name}
                        variant={link.active ? "default" : "ghost"}
                        className={`w-full justify-start ${
                          link.active
                            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                            : "text-slate-300 hover:bg-purple-800/50 hover:text-white"
                        }`}
                        onClick={() => navigateTo(link.href)}
                      >
                        <link.icon className="mr-2 h-4 w-4" />
                        {link.name}
                      </Button>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-medium ml-2 text-white">
              Site Details
            </h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-800/30 text-slate-300 hover:bg-purple-800/50"
                  onClick={() => router.push("/dashboard/sites")}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Sites
                </Button>
                <h1 className="text-2xl font-bold hidden md:block text-white">
                  {site.name}
                </h1>
                <Badge
                  variant={site.status === "active" ? "default" : "secondary"}
                  className={`ml-2 ${
                    site.status === "active"
                      ? "bg-purple-900/50 text-purple-300 border border-purple-600/30"
                      : "bg-slate-700/50 text-slate-400 border border-slate-600/30"
                  }`}
                >
                  {site.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-800/30 text-slate-300 hover:bg-purple-800/50"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveChanges}
                      size="sm"
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-600/30 text-red-400 hover:bg-red-900/20"
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-slate-800 border-purple-800/30">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">
                            Are you sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-slate-300">
                            This will permanently delete {site.name} and all its
                            data. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-purple-800/30 text-slate-300 hover:bg-purple-800/50">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteSite}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Site
                    </Button>
                  </>
                )}
              </div>
            </div>
            <h1 className="text-xl font-bold mt-3 md:hidden text-white">
              {site.name}
            </h1>
          </div>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="bg-slate-800/50 border-purple-800/30">
              <TabsTrigger
                value="details"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="prompt"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                Custom Prompt
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 mt-6">
              <Card className="bg-slate-800/50 border-purple-800/30 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-white">Site Information</CardTitle>
                  <CardDescription className="text-slate-300">
                    Basic information about this cinema location
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="site-name" className="text-slate-300">
                        Name
                      </Label>
                      <Input
                        id="site-name"
                        value={site.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleInputChange("name", e.target.value)
                        }
                        disabled={!isEditing}
                        className="bg-slate-700/50 border-purple-800/30 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="site-screens" className="text-slate-300">
                        Number of Screens
                      </Label>
                      <Input
                        id="site-screens"
                        type="number"
                        value={site.screens?.length || 0}
                        disabled={true}
                        className="bg-slate-600/50 text-slate-400"
                      />
                      <p className="text-xs text-slate-500">
                        Calculated from screen details below
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="site-status" className="text-slate-300">
                        Status
                      </Label>
                      <div className="flex items-center space-x-2 pt-2">
                        <Switch
                          id="site-status"
                          checked={site.status === "active"}
                          onCheckedChange={handleStatusToggle}
                          disabled={!isEditing}
                        />
                        <Label htmlFor="site-status" className="cursor-pointer">
                          {site.status === "active" ? (
                            <span className="flex items-center text-purple-400">
                              <PlayCircle className="mr-1 h-4 w-4" /> Active
                            </span>
                          ) : (
                            <span className="flex items-center text-slate-500">
                              <PauseCircle className="mr-1 h-4 w-4" /> Inactive
                            </span>
                          )}
                        </Label>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-purple-800/30" />

                  <div className="space-y-2">
                    <Label
                      htmlFor="site-description"
                      className="text-slate-300"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="site-description"
                      value={site.description || ""}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        handleInputChange("description", e.target.value)
                      }
                      rows={3}
                      disabled={!isEditing}
                      className="min-h-[100px] bg-slate-700/50 border-purple-800/30 text-white"
                    />
                  </div>

                  <Separator className="bg-purple-800/30" />

                  <div>
                    <h3 className="text-md font-medium mb-3 text-white">
                      Address
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="street" className="text-slate-300">
                          Street
                        </Label>
                        <Input
                          id="street"
                          value={site.address?.street || ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleAddressChange("street", e.target.value)
                          }
                          disabled={!isEditing}
                          className="bg-slate-700/50 border-purple-800/30 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-slate-300">
                          City
                        </Label>
                        <Input
                          id="city"
                          value={site.address?.city || ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleAddressChange("city", e.target.value)
                          }
                          disabled={!isEditing}
                          className="bg-slate-700/50 border-purple-800/30 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-slate-300">
                          State
                        </Label>
                        <Input
                          id="state"
                          value={site.address?.state || ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleAddressChange("state", e.target.value)
                          }
                          disabled={!isEditing}
                          className="bg-slate-700/50 border-purple-800/30 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zip" className="text-slate-300">
                          ZIP Code
                        </Label>
                        <Input
                          id="zip"
                          value={site.address?.zip || ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleAddressChange("zip", e.target.value)
                          }
                          disabled={!isEditing}
                          className="bg-slate-700/50 border-purple-800/30 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-purple-800/30" />

                  <div>
                    <h3 className="text-md font-medium mb-3 text-white">
                      Operating Hours
                    </h3>
                    <div className="mb-2 flex justify-between items-center">
                      <h4 className="text-sm font-medium text-slate-300">
                        Daily Hours
                      </h4>
                      {isEditing && (
                        <div className="flex items-center space-x-2">
                          <Select
                            onValueChange={(value: string) => applyToAllDays(value)}
                            disabled={!isEditing}
                          >
                            <SelectTrigger className="w-[180px] bg-slate-700/50 border-purple-800/30 text-white">
                              <SelectValue placeholder="Copy hours from..." />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-purple-800/30">
                              {daysOfWeek.map((day: any) => (
                                <SelectItem
                                  key={day.id}
                                  value={day.id}
                                  className="text-white hover:bg-purple-800/50"
                                >
                                  Copy from {day.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    <div className="overflow-x-auto border border-purple-800/30 rounded-md">
                      <table className="w-full border-collapse">
                        <thead className="bg-slate-700/50">
                          <tr>
                            <th className="text-left py-2 px-3 border-b border-purple-800/30 text-slate-300">
                              Day
                            </th>
                            <th className="text-left py-2 px-3 border-b border-purple-800/30 text-slate-300">
                              Opening Time
                            </th>
                            <th className="text-left py-2 px-3 border-b border-purple-800/30 text-slate-300">
                              Closing Time
                            </th>
                            {isEditing && (
                              <th className="text-right py-2 px-3 border-b border-purple-800/30 text-slate-300">
                                Actions
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {daysOfWeek.map((day: any) => (
                            <tr
                              key={day.id}
                              className="border-b border-purple-800/30 hover:bg-slate-700/30"
                            >
                              <td className="py-2 px-3 font-medium text-white">
                                {day.label}
                              </td>
                              <td className="py-2 px-3">
                                {isEditing ? (
                                  <Input
                                    id={`${day.id}-open`}
                                    type="time"
                                    value={
                                      site.operatingHours[day.id as keyof typeof site.operatingHours]?.open ||
                                      "11:00"
                                    }
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                      handleOperatingHoursChange(
                                        day.id,
                                        "open",
                                        e.target.value
                                      )
                                    }
                                    className="w-full bg-slate-700/50 border-purple-800/30 text-white"
                                  />
                                ) : (
                                  <span className="text-slate-300">
                                    {site.operatingHours[day.id as keyof typeof site.operatingHours]?.open ||
                                      "11:00"}
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-3">
                                {isEditing ? (
                                  <Input
                                    id={`${day.id}-close`}
                                    type="time"
                                    value={
                                      site.operatingHours[day.id as keyof typeof site.operatingHours]?.close ||
                                      "23:00"
                                    }
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                      handleOperatingHoursChange(
                                        day.id,
                                        "close",
                                        e.target.value
                                      )
                                    }
                                    className="w-full bg-slate-700/50 border-purple-800/30 text-white"
                                  />
                                ) : (
                                  <span className="text-slate-300">
                                    {site.operatingHours[day.id as keyof typeof site.operatingHours]?.close ||
                                      "23:00"}
                                  </span>
                                )}
                              </td>
                              {isEditing && (
                                <td className="py-2 px-3 text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-slate-400 hover:text-white hover:bg-purple-800/50"
                                    onClick={() => resetDayToDefault(day.id)}
                                  >
                                    Reset
                                  </Button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <Separator className="bg-purple-800/30" />

                  <div>
                    <h3 className="text-md font-medium mb-3 text-white">
                      Screens
                    </h3>

                    <div className="mb-2 flex justify-between items-center">
                      <h4 className="text-sm font-medium text-slate-300">
                        Screen Details
                      </h4>
                      <Dialog
                        open={isAddScreenDialogOpen}
                        onOpenChange={setIsAddScreenDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center border-purple-600/50 text-purple-300 hover:bg-purple-800/50"
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add Screen
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-800 border-purple-800/30">
                          <DialogHeader>
                            <DialogTitle className="text-white">
                              Add New Screen
                            </DialogTitle>
                            <DialogDescription className="text-slate-300">
                              Add a new screen to this cinema location.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label
                                htmlFor="screen-name"
                                className="text-slate-300"
                              >
                                Screen Name
                              </Label>
                              <Input
                                id="screen-name"
                                placeholder="e.g., Screen 1, IMAX Theater"
                                className="bg-slate-700/50 border-purple-800/30 text-white placeholder:text-slate-400"
                                value={newScreen.name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  setNewScreen({
                                    ...newScreen,
                                    name: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label
                                htmlFor="screen-capacity"
                                className="text-slate-300"
                              >
                                Capacity (seats)
                              </Label>
                              <Input
                                id="screen-capacity"
                                type="number"
                                placeholder="e.g., 250"
                                className="bg-slate-700/50 border-purple-800/30 text-white placeholder:text-slate-400"
                                value={newScreen.capacity}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  setNewScreen({
                                    ...newScreen,
                                    capacity: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              className="border-purple-800/30 text-slate-300 hover:bg-purple-800/50"
                              onClick={() => setIsAddScreenDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              onClick={handleAddScreen}
                              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                            >
                              Add Screen
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {site.screens && site.screens.length > 0 ? (
                      <div className="overflow-x-auto border border-purple-800/30 rounded-md mb-4">
                        <table className="w-full border-collapse">
                          <thead className="bg-slate-700/50">
                            <tr>
                              <th className="text-left py-2 px-3 border-b border-purple-800/30 text-slate-300">
                                Name
                              </th>
                              <th className="text-left py-2 px-3 border-b border-purple-800/30 text-slate-300">
                                Capacity
                              </th>
                              <th className="text-left py-2 px-3 border-b border-purple-800/30 text-slate-300">
                                Features
                              </th>
                              <th className="text-right py-2 px-3 border-b border-purple-800/30 text-slate-300">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {site.screens.map((screen: any) => (
                              <tr
                                key={screen._id}
                                className="border-b border-purple-800/30 hover:bg-slate-700/30"
                              >
                                <td className="py-2 px-3">
                                  {isEditing ? (
                                    <Input
                                      value={screen.name}
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        handleUpdateScreen(
                                          screen._id,
                                          "name",
                                          e.target.value
                                        )
                                      }
                                      className="w-full bg-slate-700/50 border-purple-800/30 text-white"
                                    />
                                  ) : (
                                    <span className="text-white">
                                      {screen.name}
                                    </span>
                                  )}
                                </td>
                                <td className="py-2 px-3">
                                  {isEditing ? (
                                    <Input
                                      type="number"
                                      value={screen.capacity}
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        handleUpdateScreen(
                                          screen._id,
                                          "capacity",
                                          parseInt(e.target.value)
                                        )
                                      }
                                      className="w-full bg-slate-700/50 border-purple-800/30 text-white"
                                    />
                                  ) : (
                                    <span className="text-slate-300">{`${screen.capacity} seats`}</span>
                                  )}
                                </td>
                                <td className="py-2 px-3">
                                  <div className="space-y-2">
                                    {/* Existing features */}
                                    <div className="flex flex-wrap gap-1">
                                      {screen.features?.map((feature: string, idx: number) => (
                                        <Badge
                                          key={idx}
                                          variant="outline"
                                          className="py-1 bg-purple-900/30 border-purple-600/30 text-purple-300 group"
                                        >
                                          {feature}
                                          {isEditing && (
                                            <button
                                              onClick={() =>
                                                handleRemoveFeature(
                                                  screen._id,
                                                  feature
                                                )
                                              }
                                              className="ml-1 text-slate-400 hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                              <X className="h-3 w-3" />
                                            </button>
                                          )}
                                        </Badge>
                                      ))}
                                      {(!screen.features ||
                                        screen.features.length === 0) &&
                                        !isEditing && (
                                          <span className="text-slate-400 text-sm">
                                            No features
                                          </span>
                                        )}
                                    </div>

                                    {/* Add new feature input - only shown when editing */}
                                    {isEditing && (
                                      <div className="flex gap-2 items-center">
                                        <Input
                                          placeholder="Add feature..."
                                          value={
                                            newFeatureInput[screen._id] || ""
                                          }
                                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setNewFeatureInput((prev) => ({
                                              ...prev,
                                              [screen._id]: e.target.value,
                                            }))
                                          }
                                          onKeyPress={(e) =>
                                            handleFeatureInputKeyPress(
                                              e,
                                              screen._id
                                            )
                                          }
                                          className="flex-1 h-7 text-xs bg-slate-600/50 border-purple-800/30 text-white placeholder:text-slate-400"
                                        />
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() =>
                                            handleAddCustomFeature(
                                              screen._id,
                                              newFeatureInput[screen._id]
                                            )
                                          }
                                          disabled={
                                            !newFeatureInput[screen._id]?.trim()
                                          }
                                          className="h-7 px-2 text-purple-300 hover:text-white hover:bg-purple-800/50 disabled:opacity-50"
                                        >
                                          <Plus className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    )}

                                    {isEditing &&
                                      screen.features &&
                                      screen.features.length > 0 && (
                                        <p className="text-xs text-slate-500">
                                          Hover over features to remove them
                                        </p>
                                      )}
                                  </div>
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-slate-800 border-purple-800/30">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="text-white">
                                          Delete Screen
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-slate-300">
                                          Are you sure you want to delete &quot;
                                          {screen.name}&quot;? This action cannot be
                                          undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="border-purple-800/30 text-slate-300 hover:bg-purple-800/50">
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() =>
                                            handleDeleteScreen(
                                              screen._id,
                                              screen.name
                                            )
                                          }
                                          className="bg-red-600 hover:bg-red-700 text-white"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-400 border border-purple-800/30 rounded-md">
                        <p className="text-sm">No screens added yet.</p>
                        <p className="text-sm">
                          Click &quot;Add Screen&quot; to get started.
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="mb-3 flex justify-between items-center">
                      <h3 className="text-md font-medium text-white">
                        Amenities
                      </h3>
                      {isEditing && (
                        <div className="flex gap-2">
                          <Dialog
                            open={isAmenityDialogOpen}
                            onOpenChange={setIsAmenityDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-purple-600/50 text-purple-300 hover:bg-purple-800/50"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Amenity
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-800 border-purple-800/30">
                              <DialogHeader>
                                <DialogTitle className="text-white">
                                  Add Amenity to Site
                                </DialogTitle>
                                <DialogDescription className="text-slate-300">
                                  Select an existing amenity or create a new
                                  one.
                                </DialogDescription>
                              </DialogHeader>

                              <Tabs defaultValue="existing" className="w-full">
                                <TabsList className="bg-slate-700/50">
                                  <TabsTrigger
                                    value="existing"
                                    className="data-[state=active]:bg-purple-600"
                                  >
                                    Existing
                                  </TabsTrigger>
                                  <TabsTrigger
                                    value="new"
                                    className="data-[state=active]:bg-purple-600"
                                  >
                                    Create New
                                  </TabsTrigger>
                                </TabsList>

                                <TabsContent
                                  value="existing"
                                  className="space-y-4"
                                >
                                  <div className="max-h-48 overflow-y-auto space-y-2">
                                    {amenities
                                      .filter(
                                        (amenity: any) =>
                                          !site.amenities?.includes(
                                            amenity.name
                                          )
                                      )
                                      .map((amenity: any) => (
                                        <div
                                          key={amenity._id}
                                          className="flex items-center justify-between p-2 border border-purple-800/30 rounded-md bg-slate-700/30"
                                        >
                                          <div>
                                            <div className="text-white font-medium">
                                              {amenity.name}
                                            </div>
                                            {amenity.description && (
                                              <div className="text-slate-400 text-sm">
                                                {amenity.description}
                                              </div>
                                            )}
                                          </div>
                                          <Button
                                            size="sm"
                                            onClick={() => {
                                              handleAddAmenityToSite(
                                                amenity.name
                                              );
                                              setIsAmenityDialogOpen(false);
                                            }}
                                            className="bg-purple-600 hover:bg-purple-700"
                                          >
                                            Add
                                          </Button>
                                        </div>
                                      ))}
                                    {amenities.filter(
                                      (a: any) => !site.amenities?.includes(a.name)
                                    ).length === 0 && (
                                      <div className="text-center py-4 text-slate-400">
                                        All available amenities are already
                                        added to this site.
                                      </div>
                                    )}
                                  </div>
                                </TabsContent>

                                <TabsContent value="new" className="space-y-4">
                                  <div className="grid gap-4">
                                    <div className="grid gap-2">
                                      <Label
                                        htmlFor="new-amenity-name"
                                        className="text-slate-300"
                                      >
                                        Amenity Name
                                      </Label>
                                      <Input
                                        id="new-amenity-name"
                                        placeholder="e.g., IMAX, Dolby Atmos"
                                        className="bg-slate-700/50 border-purple-800/30 text-white placeholder:text-slate-400"
                                        value={newAmenity.name}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                          setNewAmenity({
                                            ...newAmenity,
                                            name: e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label
                                        htmlFor="new-amenity-description"
                                        className="text-slate-300"
                                      >
                                        Description (Optional)
                                      </Label>
                                      <Textarea
                                        id="new-amenity-description"
                                        placeholder="Brief description of the amenity..."
                                        className="bg-slate-700/50 border-purple-800/30 text-white placeholder:text-slate-400"
                                        value={newAmenity.description}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                          setNewAmenity({
                                            ...newAmenity,
                                            description: e.target.value,
                                          })
                                        }
                                        rows={3}
                                      />
                                    </div>
                                  </div>
                                  <Button
                                    onClick={handleCreateNewAmenity}
                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                                  >
                                    Create & Add Amenity
                                  </Button>
                                </TabsContent>
                              </Tabs>
                            </DialogContent>
                          </Dialog>

                          <Dialog
                            open={isManageAmenitiesDialogOpen}
                            onOpenChange={setIsManageAmenitiesDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
                              >
                                Manage All
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-800 border-purple-800/30 max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="text-white">
                                  Manage Global Amenities
                                </DialogTitle>
                                <DialogDescription className="text-slate-300">
                                  Create, edit, or delete amenities that can be
                                  used across all sites.
                                </DialogDescription>
                              </DialogHeader>

                              <div className="max-h-96 overflow-y-auto space-y-3">
                                {amenities.map((amenity: any) => (
                                  <div
                                    key={amenity._id}
                                    className="flex items-center justify-between p-3 border border-purple-800/30 rounded-md bg-slate-700/30"
                                  >
                                    {editingAmenity &&
                                    editingAmenity._id === amenity._id ? (
                                      <div className="flex-1 space-y-2 mr-3">
                                        <Input
                                          value={
                                            editingAmenity.name || amenity.name
                                          }
                                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setEditingAmenity({
                                              ...editingAmenity,
                                              name: e.target.value,
                                            })
                                          }
                                          className="bg-slate-600/50 border-purple-800/30 text-white"
                                          placeholder="Amenity name"
                                        />
                                        <Textarea
                                          value={
                                            editingAmenity.description ||
                                            amenity.description ||
                                            ""
                                          }
                                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                            setEditingAmenity({
                                              ...editingAmenity,
                                              description: e.target.value,
                                            })
                                          }
                                          className="bg-slate-600/50 border-purple-800/30 text-white"
                                          placeholder="Description (optional)"
                                          rows={2}
                                        />
                                        <div className="flex gap-2">
                                          <Button
                                            size="sm"
                                            onClick={() =>
                                              handleUpdateAmenity(
                                                amenity._id,
                                                editingAmenity
                                              )
                                            }
                                            className="bg-purple-600 hover:bg-purple-700"
                                          >
                                            Save
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                              setEditingAmenity(null)
                                            }
                                            className="border-slate-600 text-slate-300"
                                          >
                                            Cancel
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <div className="flex-1">
                                          <div className="text-white font-medium">
                                            {amenity.name}
                                          </div>
                                          {amenity.description && (
                                            <div className="text-slate-400 text-sm">
                                              {amenity.description}
                                            </div>
                                          )}
                                          <div className="text-xs text-slate-500 mt-1">
                                            Used in{" "}
                                            {site.amenities?.includes(
                                              amenity.name
                                            )
                                              ? "this site"
                                              : "0 sites"}
                                          </div>
                                        </div>
                                        <div className="flex gap-2">
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                              setEditingAmenity(amenity)
                                            }
                                            className="text-slate-300 hover:text-white hover:bg-purple-800/50"
                                          >
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                              >
                                                <Trash className="h-4 w-4" />
                                              </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="bg-slate-800 border-purple-800/30">
                                              <AlertDialogHeader>
                                                <AlertDialogTitle className="text-white">
                                                  Delete Amenity
                                                </AlertDialogTitle>
                                                <AlertDialogDescription className="text-slate-300">
                                                  Are you sure you want to
                                                  delete &quot;{amenity.name}&quot;? This
                                                  will remove it from all sites
                                                  that use it.
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel className="border-purple-800/30 text-slate-300 hover:bg-purple-800/50">
                                                  Cancel
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                  onClick={() =>
                                                    handleDeleteAmenity(
                                                      amenity._id,
                                                      amenity.name
                                                    )
                                                  }
                                                  className="bg-red-600 hover:bg-red-700 text-white"
                                                >
                                                  Delete
                                                </AlertDialogAction>
                                              </AlertDialogFooter>
                                            </AlertDialogContent>
                                          </AlertDialog>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                ))}
                                {amenities.length === 0 && (
                                  <div className="text-center py-8 text-slate-400">
                                    No amenities available. Create your first
                                    amenity above.
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {site.amenities?.map((amenity: string, index: number) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="py-1 bg-purple-900/30 border-purple-600/30 text-purple-300 relative group"
                        >
                          {amenity}
                          {isEditing && (
                            <button
                              onClick={() =>
                                handleRemoveAmenityFromSite(amenity)
                              }
                              className="ml-2 text-slate-400 hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </Badge>
                      ))}
                      {(!site.amenities || site.amenities.length === 0) && (
                        <span className="text-slate-400 text-sm">
                          {isEditing
                            ? "No amenities assigned. Click 'Add Amenity' to get started."
                            : "No amenities listed"}
                        </span>
                      )}
                    </div>

                    {isEditing &&
                      site.amenities &&
                      site.amenities.length > 0 && (
                        <p className="text-xs text-slate-500 mt-2">
                          Hover over amenities to remove them from this site
                        </p>
                      )}
                  </div>
                </CardContent>
                <CardFooter className="text-sm text-slate-500">
                  Last updated: {new Date(site.updatedAt).toLocaleDateString()}
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="prompt" className="space-y-6 mt-6">
              <Card className="bg-slate-800/50 border-purple-800/30 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-white">Custom AI Prompt</CardTitle>
                  <CardDescription className="text-slate-300">
                    Customize the AI prompt that generates schedules for this
                    location
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-slate-400" />
                      <Label
                        htmlFor="custom-prompt"
                        className="text-base font-medium text-slate-300"
                      >
                        Site-Specific Instructions
                      </Label>
                    </div>
                    <p className="text-sm text-slate-400">
                      These instructions will guide the AI in generating
                      optimized schedules specifically for this location.
                      Include information about audience demographics, special
                      considerations, or typical performance patterns.
                    </p>
                    <Textarea
                      id="custom-prompt"
                      value={site.customPrompt || ""}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        handleInputChange("customPrompt", e.target.value)
                      }
                      rows={8}
                      disabled={!isEditing}
                      className="min-h-[200px] font-mono text-sm bg-slate-700/50 border-purple-800/30 text-white"
                      placeholder="Describe specific considerations for this cinema location..."
                    />
                  </div>

                  <div className="bg-slate-700/30 p-4 rounded-md border border-purple-800/30">
                    <h4 className="text-sm font-medium mb-2 text-slate-300">
                      Tips for effective prompts:
                    </h4>
                    <ul className="text-sm text-slate-400 space-y-1 ml-5 list-disc">
                      <li>
                        Include information about typical audience demographics
                      </li>
                      <li>
                        Mention any historical performance patterns (e.g.,
                        &quot;family films perform best on weekend afternoons&quot;)
                      </li>
                      <li>
                        Note any special features or limitations of the venue
                      </li>
                      <li>
                        Include any regular events or community considerations
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
