// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   Film,
//   Calendar,
//   Building,
//   Plus,
//   Menu,
//   Search,
//   Trash,
//   BookOpen,
// } from "lucide-react";
// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
//   DialogFooter,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { toast } from "react-hot-toast";
// import Link from "next/link";
// import { useRouter } from "next/navigation";

// export default function SitesPage() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isAddSiteDialogOpen, setIsAddSiteDialogOpen] = useState(false);
//   const [sites, setSites] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [newSite, setNewSite] = useState({
//     name: "",
//     description: "",
//     address: {
//       street: "",
//       city: "",
//       state: "",
//       zip: "",
//     },
//     status: "active",
//   });
//   const router = useRouter();

//   // Load sites when component mounts
//   useEffect(() => {
//     fetchSites();
//   }, []);

//   const fetchSites = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch("/api/sites");
//       const data = await response.json();

//       if (data.success) {
//         setSites(data.sites);
//       } else {
//         toast.error("Failed to load sites");
//       }
//     } catch (error) {
//       console.error("Error fetching sites:", error);
//       toast.error("Failed to load sites");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Filter sites based on search query
//   const filteredSites = sites.filter(
//     (site) =>
//       site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       `${site.address.street}, ${site.address.city}`
//         .toLowerCase()
//         .includes(searchQuery.toLowerCase())
//   );

//   // Navigation links for sidebar and mobile menu
//   const navLinks = [
//     {
//       name: "Schedule Generator",
//       icon: Calendar,
//       href: "/dashboard",
//       active: false,
//     },
//     {
//       name: "Sites",
//       icon: Building,
//       href: "/dashboard/sites",
//       active: true,
//     },
//     {
//       name: "Best Practices",
//       icon: BookOpen,
//       href: "/dashboard/best-practices",
//       active: false,
//     },
//   ];

//   const navigateTo = (url) => {
//     router.push(url);
//   };

//   const handleAddSite = async () => {
//     // Validate required fields
//     if (
//       !newSite.name.trim() ||
//       !newSite.address.street.trim() ||
//       !newSite.address.city.trim() ||
//       !newSite.address.state.trim() ||
//       !newSite.address.zip.trim()
//     ) {
//       toast.error("Please fill in all required fields");
//       return;
//     }

//     try {
//       const response = await fetch("/api/sites", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(newSite),
//       });

//       const data = await response.json();
//       if (data.success) {
//         toast.success(`Site "${newSite.name}" created successfully!`);

//         // Reset form and close dialog
//         setNewSite({
//           name: "",
//           description: "",
//           address: {
//             street: "",
//             city: "",
//             state: "",
//             zip: "",
//           },
//           status: "active",
//         });
//         setIsAddSiteDialogOpen(false);

//         // Refresh sites list
//         fetchSites();
//       } else {
//         toast.error(data.error || "Failed to create site");
//       }
//     } catch (error) {
//       console.error("Error creating site:", error);
//       toast.error("Failed to create site");
//     }
//   };

//   const handleDeleteSite = async (siteId: string, siteName: string) => {
//     try {
//       const response = await fetch(`/api/sites/${siteId}`, {
//         method: "DELETE",
//       });

//       const data = await response.json();
//       if (data.success) {
//         toast.success(`Site "${siteName}" deleted successfully!`);
//         fetchSites(); // Refresh sites list
//       } else {
//         toast.error(data.error || "Failed to delete site");
//       }
//     } catch (error) {
//       console.error("Error deleting site:", error);
//       toast.error("Failed to delete site");
//     }
//   };

//   const handleViewSite = (siteId: string) => {
//     router.push(`/dashboard/sites/${siteId}`);
//   };

//   const handleAddressChange = (field: string, value: string) => {
//     setNewSite((prev) => ({
//       ...prev,
//       address: {
//         ...prev.address,
//         [field]: value,
//       },
//     }));
//   };

//   if (loading) {
//     return (
//       <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
//         <div className="flex-1 flex items-center justify-center">
//           <div className="text-white">Loading sites...</div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
//       {/* Sidebar - Desktop */}
//       <div className="hidden md:flex w-64 flex-col bg-slate-900/95 border-r border-purple-800/30 backdrop-blur">
//         <Link
//           href="/"
//           className="p-4 flex items-center gap-2 border-b border-purple-800/30"
//         >
//           <Image
//             src="/showcase.png"
//             alt="Showcase Cinemas"
//             width={120}
//             height={24}
//             className="h-6 w-auto filter brightness-0 invert"
//             priority
//           />
//         </Link>
//         <div className="flex-1 overflow-auto p-4">
//           <nav className="space-y-1">
//             {navLinks.map((link) => (
//               <Button
//                 key={link.name}
//                 variant={link.active ? "default" : "ghost"}
//                 className={`w-full justify-start ${
//                   link.active
//                     ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
//                     : "text-slate-300 hover:bg-purple-800/50 hover:text-white"
//                 }`}
//                 onClick={() => navigateTo(link.href)}
//               >
//                 <link.icon className="mr-2 h-4 w-4" />
//                 {link.name}
//               </Button>
//             ))}
//           </nav>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Header - Mobile */}
//         <header className="bg-slate-900/95 border-b border-purple-800/30 backdrop-blur p-4 flex items-center justify-between md:hidden">
//           <div className="flex items-center">
//             <Sheet>
//               <SheetTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   className="text-white hover:bg-purple-800/50"
//                 >
//                   <Menu className="h-5 w-5" />
//                 </Button>
//               </SheetTrigger>
//               <SheetContent
//                 side="left"
//                 className="bg-slate-900 border-purple-800/30"
//               >
//                 <div className="py-4">
//                   <Link href="/" className="flex items-center gap-2 mb-4">
//                     <Image
//                       src="/showcase.png"
//                       alt="Showcase Cinemas"
//                       width={120}
//                       height={24}
//                       className="h-6 w-auto filter brightness-0 invert"
//                       priority
//                     />
//                   </Link>
//                   <nav className="space-y-2">
//                     {navLinks.map((link) => (
//                       <Button
//                         key={link.name}
//                         variant={link.active ? "default" : "ghost"}
//                         className={`w-full justify-start ${
//                           link.active
//                             ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
//                             : "text-slate-300 hover:bg-purple-800/50 hover:text-white"
//                         }`}
//                         onClick={() => navigateTo(link.href)}
//                       >
//                         <link.icon className="mr-2 h-4 w-4" />
//                         {link.name}
//                       </Button>
//                     ))}
//                   </nav>
//                 </div>
//               </SheetContent>
//             </Sheet>
//             <h1 className="text-lg font-medium ml-2 text-white">Sites</h1>
//           </div>
//         </header>

//         {/* Page Content */}
//         <main className="flex-1 overflow-auto p-4 md:p-8">
//           <div className="hidden md:flex items-center justify-between mb-8">
//             <h1 className="text-2xl font-bold text-white">Cinema Sites</h1>
//           </div>

//           <Card className="bg-slate-800/50 border-purple-800/30 backdrop-blur">
//             <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//               <div>
//                 <CardTitle className="text-white">Manage Sites</CardTitle>
//                 <CardDescription className="text-slate-300">
//                   View and manage your cinema locations
//                 </CardDescription>
//               </div>
//               <div className="flex items-center gap-4">
//                 <div className="relative">
//                   <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
//                   <Input
//                     type="search"
//                     placeholder="Search sites..."
//                     className="pl-8 w-full sm:w-[200px] md:w-[300px] bg-slate-700/50 border-purple-800/30 text-white placeholder:text-slate-400"
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                   />
//                 </div>
//                 <Dialog
//                   open={isAddSiteDialogOpen}
//                   onOpenChange={setIsAddSiteDialogOpen}
//                 >
//                   <DialogTrigger asChild>
//                     <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700">
//                       <Plus className="mr-2 h-4 w-4" /> Add Site
//                     </Button>
//                   </DialogTrigger>
//                   <DialogContent className="bg-slate-800 border-purple-800/30 max-w-2xl">
//                     <DialogHeader>
//                       <DialogTitle className="text-white">
//                         Add New Cinema Location
//                       </DialogTitle>
//                       <DialogDescription className="text-slate-300">
//                         Enter the basic details for the new cinema location. You
//                         can add screens and other details after creating the
//                         site.
//                       </DialogDescription>
//                     </DialogHeader>
//                     <div className="grid gap-4 py-4">
//                       {/* Basic Information */}
//                       <div className="grid gap-2">
//                         <Label htmlFor="site-name" className="text-slate-300">
//                           Site Name *
//                         </Label>
//                         <Input
//                           id="site-name"
//                           placeholder="e.g., Southside Cinema"
//                           className="bg-slate-700/50 border-purple-800/30 text-white placeholder:text-slate-400"
//                           value={newSite.name}
//                           onChange={(e) =>
//                             setNewSite({ ...newSite, name: e.target.value })
//                           }
//                         />
//                       </div>

//                       <div className="grid gap-2">
//                         <Label
//                           htmlFor="site-description"
//                           className="text-slate-300"
//                         >
//                           Description
//                         </Label>
//                         <Textarea
//                           id="site-description"
//                           placeholder="Brief description of this cinema location..."
//                           rows={3}
//                           className="bg-slate-700/50 border-purple-800/30 text-white placeholder:text-slate-400"
//                           value={newSite.description}
//                           onChange={(e) =>
//                             setNewSite({
//                               ...newSite,
//                               description: e.target.value,
//                             })
//                           }
//                         />
//                       </div>

//                       {/* Address Section */}
//                       <div className="space-y-3">
//                         <Label className="text-slate-300 font-medium">
//                           Address *
//                         </Label>

//                         <div className="grid gap-3">
//                           <div className="grid gap-2">
//                             <Label
//                               htmlFor="street"
//                               className="text-slate-300 text-sm"
//                             >
//                               Street Address
//                             </Label>
//                             <Input
//                               id="street"
//                               placeholder="e.g., 123 Main Street"
//                               className="bg-slate-700/50 border-purple-800/30 text-white placeholder:text-slate-400"
//                               value={newSite.address.street}
//                               onChange={(e) =>
//                                 handleAddressChange("street", e.target.value)
//                               }
//                             />
//                           </div>

//                           <div className="grid grid-cols-2 gap-3">
//                             <div className="grid gap-2">
//                               <Label
//                                 htmlFor="city"
//                                 className="text-slate-300 text-sm"
//                               >
//                                 City
//                               </Label>
//                               <Input
//                                 id="city"
//                                 placeholder="e.g., Downtown"
//                                 className="bg-slate-700/50 border-purple-800/30 text-white placeholder:text-slate-400"
//                                 value={newSite.address.city}
//                                 onChange={(e) =>
//                                   handleAddressChange("city", e.target.value)
//                                 }
//                               />
//                             </div>

//                             <div className="grid gap-2">
//                               <Label
//                                 htmlFor="state"
//                                 className="text-slate-300 text-sm"
//                               >
//                                 State
//                               </Label>
//                               <Input
//                                 id="state"
//                                 placeholder="e.g., NY"
//                                 className="bg-slate-700/50 border-purple-800/30 text-white placeholder:text-slate-400"
//                                 value={newSite.address.state}
//                                 onChange={(e) =>
//                                   handleAddressChange("state", e.target.value)
//                                 }
//                               />
//                             </div>
//                           </div>

//                           <div className="grid gap-2">
//                             <Label
//                               htmlFor="zip"
//                               className="text-slate-300 text-sm"
//                             >
//                               ZIP Code
//                             </Label>
//                             <Input
//                               id="zip"
//                               placeholder="e.g., 10001"
//                               className="bg-slate-700/50 border-purple-800/30 text-white placeholder:text-slate-400"
//                               value={newSite.address.zip}
//                               onChange={(e) =>
//                                 handleAddressChange("zip", e.target.value)
//                               }
//                             />
//                           </div>
//                         </div>
//                       </div>

//                       <div className="bg-purple-900/20 p-3 rounded-md border border-purple-600/30">
//                         <p className="text-sm text-purple-200">
//                           <strong>Note:</strong> After creating the site, you
//                           can click on it to add screens, operating hours,
//                           amenities, and other detailed settings.
//                         </p>
//                       </div>
//                     </div>
//                     <DialogFooter>
//                       <Button
//                         variant="outline"
//                         className="border-purple-800/30 text-slate-300 hover:bg-purple-800/50"
//                         onClick={() => setIsAddSiteDialogOpen(false)}
//                       >
//                         Cancel
//                       </Button>
//                       <Button
//                         onClick={handleAddSite}
//                         className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
//                       >
//                         Create Site
//                       </Button>
//                     </DialogFooter>
//                   </DialogContent>
//                 </Dialog>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="rounded-md border border-purple-800/30">
//                 <Table>
//                   <TableHeader>
//                     <TableRow className="border-purple-800/30 hover:bg-slate-700/30">
//                       <TableHead className="text-slate-300">Name</TableHead>
//                       <TableHead className="hidden md:table-cell text-slate-300">
//                         Location
//                       </TableHead>
//                       <TableHead className="hidden md:table-cell text-slate-300">
//                         Screens
//                       </TableHead>
//                       <TableHead className="hidden md:table-cell text-slate-300">
//                         Status
//                       </TableHead>
//                       <TableHead className="hidden md:table-cell text-slate-300">
//                         Last Updated
//                       </TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {filteredSites.length === 0 ? (
//                       <TableRow className="border-purple-800/30">
//                         <TableCell
//                           colSpan={6}
//                           className="text-center py-10 text-slate-400"
//                         >
//                           {sites.length === 0
//                             ? "No sites found. Create your first cinema location!"
//                             : "No sites found matching your search."}
//                         </TableCell>
//                       </TableRow>
//                     ) : (
//                       filteredSites.map((site) => (
//                         <TableRow
//                           key={site._id}
//                           className="cursor-pointer border-purple-800/30 hover:bg-slate-700/30"
//                           onClick={() => handleViewSite(site._id)}
//                         >
//                           <TableCell>
//                             <div className="font-medium text-white">
//                               {site.name}
//                             </div>
//                             <div className="text-sm text-slate-400 md:hidden">
//                               {site.address.street}, {site.address.city}
//                             </div>
//                           </TableCell>
//                           <TableCell className="hidden md:table-cell text-slate-300">
//                             {site.address.street}, {site.address.city},{" "}
//                             {site.address.state} {site.address.zip}
//                           </TableCell>
//                           <TableCell className="hidden md:table-cell text-slate-300">
//                             {site.screenCount || 0}
//                           </TableCell>
//                           <TableCell className="hidden md:table-cell">
//                             <span
//                               className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                                 site.status === "active"
//                                   ? "bg-purple-900/50 text-purple-300 border border-purple-600/30"
//                                   : "bg-slate-700/50 text-slate-400 border border-slate-600/30"
//                               }`}
//                             >
//                               {site.status === "active" ? "Active" : "Inactive"}
//                             </span>
//                           </TableCell>
//                           <TableCell className="hidden md:table-cell text-slate-300">
//                             {new Date(site.updatedAt).toLocaleDateString()}
//                           </TableCell>
//                         </TableRow>
//                       ))
//                     )}
//                   </TableBody>
//                 </Table>
//               </div>
//             </CardContent>
//           </Card>
//         </main>
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useState, useEffect } from "react";
import {
  Film,
  Calendar,
  Building,
  Plus,
  Menu,
  Search,
  Trash,
  BookOpen,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Placeholder data for cinema sites
const placeholderSites = [
  {
    _id: "1",
    name: "Showcase Cinema Leicester",
    description:
      "Premier cinema location in Leicester city center with state-of-the-art facilities",
    address: {
      street: "30 Leicester Street",
      city: "Leicester",
      state: "LE",
      zip: "LE1 3RG",
    },
    status: "active",
    screenCount: 12,
    updatedAt: "2025-06-15T10:30:00Z",
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    _id: "2",
    name: "Showcase Cinema Birmingham",
    description: "Large multiplex cinema with IMAX and premium seating options",
    address: {
      street: "142 High Street",
      city: "Birmingham",
      state: "WM",
      zip: "B4 7SL",
    },
    status: "active",
    screenCount: 18,
    updatedAt: "2025-06-10T14:22:00Z",
    createdAt: "2023-08-22T09:15:00Z",
  },
  {
    _id: "3",
    name: "Showcase Cinema Manchester",
    description:
      "Modern cinema complex featuring the latest blockbusters and indie films",
    address: {
      street: "78 Deansgate",
      city: "Manchester",
      state: "GM",
      zip: "M3 2BW",
    },
    status: "active",
    screenCount: 14,
    updatedAt: "2025-06-08T16:45:00Z",
    createdAt: "2023-11-10T11:20:00Z",
  },
  {
    _id: "4",
    name: "Showcase Cinema Leeds",
    description:
      "Flagship location with luxury reclining seats and gourmet concessions",
    address: {
      street: "25 Briggate",
      city: "Leeds",
      state: "WY",
      zip: "LS1 6HD",
    },
    status: "active",
    screenCount: 16,
    updatedAt: "2025-06-12T09:10:00Z",
    createdAt: "2024-03-05T13:45:00Z",
  },
  {
    _id: "5",
    name: "Showcase Cinema Nottingham",
    description:
      "Community-focused cinema with special event programming and local partnerships",
    address: {
      street: "56 Market Square",
      city: "Nottingham",
      state: "NG",
      zip: "NG1 2DP",
    },
    status: "active",
    screenCount: 10,
    updatedAt: "2025-06-14T12:30:00Z",
    createdAt: "2024-05-18T08:00:00Z",
  },
];

export default function SitesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddSiteDialogOpen, setIsAddSiteDialogOpen] = useState(false);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSite, setNewSite] = useState({
    name: "",
    description: "",
    address: {
      street: "",
      city: "",
      state: "",
      zip: "",
    },
    status: "active",
  });
  const router = useRouter();

  // Fetch sites function
  const fetchSites = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sites');
      const data = await response.json();
      
      if (data.success) {
        setSites(data.sites);
      } else {
        toast.error('Failed to load sites');
      }
    } catch (error) {
      console.error('Error fetching sites:', error);
      toast.error('Failed to load sites');
    } finally {
      setLoading(false);
    }
  };

  // Fetch sites from database on mount
  useEffect(() => {
    fetchSites();
  }, []);

  // Filter sites based on search query
  const filteredSites = sites.filter(
    (site) =>
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${site.address.street}, ${site.address.city}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  // Navigation links for sidebar and mobile menu
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

  const handleAddSite = async () => {
    // Validate required fields
    if (
      !newSite.name.trim() ||
      !newSite.address.street.trim() ||
      !newSite.address.city.trim() ||
      !newSite.address.state.trim() ||
      !newSite.address.zip.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Call actual API endpoint
      const response = await fetch("/api/sites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSite),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Site "${newSite.name}" created successfully!`);

        // Reset form and close dialog
        setNewSite({
          name: "",
          description: "",
          address: {
            street: "",
            city: "",
            state: "",
            zip: "",
          },
          status: "active",
        });
        setIsAddSiteDialogOpen(false);

        // Refresh the sites list to ensure we have the correct data
        fetchSites();
      } else {
        toast.error(data.error || "Failed to create site");
      }
    } catch (error) {
      console.error("Error creating site:", error);
      toast.error("Failed to create site");
    }
  };

  const handleDeleteSite = async (siteId: string, siteName: string) => {
    try {
      // Call actual API endpoint
      const response = await fetch(`/api/sites/${siteId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Site "${siteName}" deleted successfully!`);
        // Refresh the sites list to ensure consistency
        fetchSites();
      } else {
        toast.error(data.error || "Failed to delete site");
      }
    } catch (error) {
      console.error("Error deleting site:", error);
      toast.error("Failed to delete site");
    }
  };

  const handleViewSite = (siteId: string) => {
    router.push(`/dashboard/sites/${siteId}`);
  };

  const handleAddressChange = (field: string, value: string) => {
    setNewSite((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Loading sites...</div>
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
            {navLinks.map((link) => (
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
                    {navLinks.map((link) => (
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
            <h1 className="text-lg font-medium ml-2 text-white">Sites</h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="hidden md:flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-white">Cinema Sites</h1>
          </div>

          <Card className="bg-slate-800/50 border-purple-800/30 backdrop-blur">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-white">Manage Sites</CardTitle>
                <CardDescription className="text-slate-300">
                  View and manage your cinema locations
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="search"
                    placeholder="Search sites..."
                    className="pl-8 w-full sm:w-[200px] md:w-[300px] bg-slate-700/50 border-purple-800/30 text-white placeholder:text-slate-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Dialog
                  open={isAddSiteDialogOpen}
                  onOpenChange={setIsAddSiteDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700">
                      <Plus className="mr-2 h-4 w-4" /> Add Site
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-purple-800/30 max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-white">
                        Add New Cinema Location
                      </DialogTitle>
                      <DialogDescription className="text-slate-300">
                        Enter the basic details for the new cinema location. You
                        can add screens and other details after creating the
                        site.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      {/* Basic Information */}
                      <div className="grid gap-2">
                        <Label htmlFor="site-name" className="text-slate-300">
                          Site Name *
                        </Label>
                        <Input
                          id="site-name"
                          placeholder="e.g., Southside Cinema"
                          className="bg-slate-700/50 border-purple-800/30 text-white placeholder:text-slate-400"
                          value={newSite.name}
                          onChange={(e) =>
                            setNewSite({ ...newSite, name: e.target.value })
                          }
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label
                          htmlFor="site-description"
                          className="text-slate-300"
                        >
                          Description
                        </Label>
                        <Textarea
                          id="site-description"
                          placeholder="Brief description of this cinema location..."
                          rows={3}
                          className="bg-slate-700/50 border-purple-800/30 text-white placeholder:text-slate-400"
                          value={newSite.description}
                          onChange={(e) =>
                            setNewSite({
                              ...newSite,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>

                      {/* Address Section */}
                      <div className="space-y-3">
                        <Label className="text-slate-300 font-medium">
                          Address *
                        </Label>

                        <div className="grid gap-3">
                          <div className="grid gap-2">
                            <Label
                              htmlFor="street"
                              className="text-slate-300 text-sm"
                            >
                              Street Address
                            </Label>
                            <Input
                              id="street"
                              placeholder="e.g., 123 Main Street"
                              className="bg-slate-700/50 border-purple-800/30 text-white placeholder:text-slate-400"
                              value={newSite.address.street}
                              onChange={(e) =>
                                handleAddressChange("street", e.target.value)
                              }
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                              <Label
                                htmlFor="city"
                                className="text-slate-300 text-sm"
                              >
                                City
                              </Label>
                              <Input
                                id="city"
                                placeholder="e.g., Downtown"
                                className="bg-slate-700/50 border-purple-800/30 text-white placeholder:text-slate-400"
                                value={newSite.address.city}
                                onChange={(e) =>
                                  handleAddressChange("city", e.target.value)
                                }
                              />
                            </div>

                            <div className="grid gap-2">
                              <Label
                                htmlFor="state"
                                className="text-slate-300 text-sm"
                              >
                                State
                              </Label>
                              <Input
                                id="state"
                                placeholder="e.g., NY"
                                className="bg-slate-700/50 border-purple-800/30 text-white placeholder:text-slate-400"
                                value={newSite.address.state}
                                onChange={(e) =>
                                  handleAddressChange("state", e.target.value)
                                }
                              />
                            </div>
                          </div>

                          <div className="grid gap-2">
                            <Label
                              htmlFor="zip"
                              className="text-slate-300 text-sm"
                            >
                              ZIP Code
                            </Label>
                            <Input
                              id="zip"
                              placeholder="e.g., 10001"
                              className="bg-slate-700/50 border-purple-800/30 text-white placeholder:text-slate-400"
                              value={newSite.address.zip}
                              onChange={(e) =>
                                handleAddressChange("zip", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-purple-900/20 p-3 rounded-md border border-purple-600/30">
                        <p className="text-sm text-purple-200">
                          <strong>Note:</strong> After creating the site, you
                          can click on it to add screens, operating hours,
                          amenities, and other detailed settings.
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        className="border-purple-800/30 text-slate-300 hover:bg-purple-800/50"
                        onClick={() => setIsAddSiteDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddSite}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                      >
                        Create Site
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-purple-800/30">
                <Table>
                  <TableHeader>
                    <TableRow className="border-purple-800/30 hover:bg-slate-700/30">
                      <TableHead className="text-slate-300">Name</TableHead>
                      <TableHead className="hidden md:table-cell text-slate-300">
                        Location
                      </TableHead>
                      <TableHead className="hidden md:table-cell text-slate-300">
                        Screens
                      </TableHead>
                      <TableHead className="hidden md:table-cell text-slate-300">
                        Status
                      </TableHead>
                      <TableHead className="hidden md:table-cell text-slate-300">
                        Last Updated
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSites.length === 0 ? (
                      <TableRow className="border-purple-800/30">
                        <TableCell
                          colSpan={6}
                          className="text-center py-10 text-slate-400"
                        >
                          {sites.length === 0
                            ? "No sites found. Create your first cinema location!"
                            : "No sites found matching your search."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSites.map((site) => (
                        <TableRow
                          key={site._id}
                          className="cursor-pointer border-purple-800/30 hover:bg-slate-700/30"
                          onClick={() => handleViewSite(site._id)}
                        >
                          <TableCell>
                            <div className="font-medium text-white">
                              {site.name}
                            </div>
                            <div className="text-sm text-slate-400 md:hidden">
                              {site.address.street}, {site.address.city}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-slate-300">
                            {site.address.street}, {site.address.city},{" "}
                            {site.address.state} {site.address.zip}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-slate-300">
                            {site.screenCount || 0}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                site.status === "active"
                                  ? "bg-purple-900/50 text-purple-300 border border-purple-600/30"
                                  : "bg-slate-700/50 text-slate-400 border border-slate-600/30"
                              }`}
                            >
                              {site.status === "active" ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-slate-300">
                            {new Date(site.updatedAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
