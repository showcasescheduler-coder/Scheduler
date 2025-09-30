// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   Film,
//   Calendar,
//   Building,
//   BookOpen,
//   Menu,
//   Edit,
//   Save,
//   X,
//   ThumbsUp,
//   AlertCircle,
//   Star,
//   Clock,
//   Users,
//   TrendingUp,
//   DollarSign,
//   BarChart,
//   LayoutGrid,
//   Settings,
//   HelpCircle,
//   Plus,
//   PlusCircle,
//   Trash2,
// } from "lucide-react";
// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
//   CardFooter,
// } from "@/components/ui/card";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// import { Separator } from "@/components/ui/separator";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { toast } from "react-hot-toast";
// import Link from "next/link";
// import { useRouter } from "next/navigation";

// export default function BestPracticesPage() {
//   const [isEditing, setIsEditing] = useState(false);
//   const [sections, setSections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [editingItem, setEditingItem] = useState(null);

//   // New state for add section dialog
//   const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
//   const [newSectionName, setNewSectionName] = useState("");

//   // New state for add item dialog
//   const [isAddItemOpen, setIsAddItemOpen] = useState(false);
//   const [addItemSection, setAddItemSection] = useState(null);
//   const [newItemName, setNewItemName] = useState("");
//   const [newItemContent, setNewItemContent] = useState("");

//   const router = useRouter();

//   // Navigation links for sidebar
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
//       active: false,
//     },
//     {
//       name: "Best Practices",
//       icon: BookOpen,
//       href: "/dashboard/best-practices",
//       active: true,
//     },
//   ];

//   const sectionIcons = {
//     general: Star,
//     revenue: DollarSign,
//     logistics: Clock,
//     seasonal: BarChart,
//   };

//   // Fetch data from API
//   useEffect(() => {
//     fetchBestPractices();
//   }, []);

//   const fetchBestPractices = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch("/api/best-practices");
//       const data = await response.json();

//       if (data.success) {
//         setSections(data.sections);
//       } else {
//         toast.error("Failed to load best practices");
//       }
//     } catch (error) {
//       console.error("Error fetching best practices:", error);
//       toast.error("Failed to load best practices");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const navigateTo = (url) => {
//     router.push(url);
//   };

//   const handleItemChange = (itemId, field, value) => {
//     setEditingItem({ itemId, field, value });
//   };

//   const handleSaveItem = async (itemId, name, description) => {
//     try {
//       const response = await fetch(`/api/best-practices/items/${itemId}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ name, description }),
//       });

//       const data = await response.json();
//       if (data.success) {
//         toast.success("Item updated successfully!");
//         fetchBestPractices(); // Refresh data
//       } else {
//         toast.error(data.error || "Failed to update item");
//       }
//     } catch (error) {
//       console.error("Error updating item:", error);
//       toast.error("Failed to update item");
//     }
//   };

//   const handleDeleteItem = async (itemId) => {
//     if (!confirm("Are you sure you want to delete this item?")) return;

//     try {
//       const response = await fetch(`/api/best-practices/items/${itemId}`, {
//         method: "DELETE",
//       });

//       const data = await response.json();
//       if (data.success) {
//         toast.success("Item deleted successfully!");
//         fetchBestPractices(); // Refresh data
//       } else {
//         toast.error(data.error || "Failed to delete item");
//       }
//     } catch (error) {
//       console.error("Error deleting item:", error);
//       toast.error("Failed to delete item");
//     }
//   };

//   const handleDeleteSection = async (sectionId) => {
//     if (
//       !confirm(
//         "Are you sure you want to delete this section and all its items?"
//       )
//     )
//       return;

//     try {
//       const response = await fetch(
//         `/api/best-practices/sections/${sectionId}`,
//         {
//           method: "DELETE",
//         }
//       );

//       const data = await response.json();
//       if (data.success) {
//         toast.success("Section deleted successfully!");
//         fetchBestPractices(); // Refresh data
//       } else {
//         toast.error(data.error || "Failed to delete section");
//       }
//     } catch (error) {
//       console.error("Error deleting section:", error);
//       toast.error("Failed to delete section");
//     }
//   };

//   // Function to handle adding a new section
//   const handleAddSection = async () => {
//     if (!newSectionName.trim()) {
//       toast.error("Section name cannot be empty!");
//       return;
//     }

//     try {
//       const response = await fetch("/api/best-practices/sections", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ name: newSectionName }),
//       });

//       const data = await response.json();
//       if (data.success) {
//         toast.success(`New section "${newSectionName}" added!`);
//         setNewSectionName("");
//         setIsAddSectionOpen(false);
//         fetchBestPractices(); // Refresh data
//       } else {
//         toast.error(data.error || "Failed to create section");
//       }
//     } catch (error) {
//       console.error("Error creating section:", error);
//       toast.error("Failed to create section");
//     }
//   };

//   // Function to handle adding a new item to a section
//   const handleAddItem = async () => {
//     if (!newItemName.trim() || !newItemContent.trim()) {
//       toast.error("Item name and content cannot be empty!");
//       return;
//     }

//     try {
//       const response = await fetch(
//         `/api/best-practices/sections/${addItemSection._id}/items`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             name: newItemName,
//             description: newItemContent,
//           }),
//         }
//       );

//       const data = await response.json();
//       if (data.success) {
//         toast.success(`New item "${newItemName}" added!`);
//         setNewItemName("");
//         setNewItemContent("");
//         setIsAddItemOpen(false);
//         fetchBestPractices(); // Refresh data
//       } else {
//         toast.error(data.error || "Failed to create item");
//       }
//     } catch (error) {
//       console.error("Error creating item:", error);
//       toast.error("Failed to create item");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
//         <div className="flex-1 flex items-center justify-center">
//           <div className="text-white">Loading best practices...</div>
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
//             <h1 className="text-lg font-medium ml-2 text-white">
//               Best Practices
//             </h1>
//           </div>
//         </header>

//         {/* Page Content */}
//         <main className="flex-1 overflow-auto p-4 md:p-8">
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <h1 className="text-2xl font-bold mb-1 text-white">
//                 Scheduling Best Practices
//               </h1>
//               <p className="text-slate-400">
//                 Standard guidelines applied to all cinema locations
//               </p>
//             </div>
//             <div className="hidden md:flex items-center space-x-2">
//               <Button
//                 className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
//                 onClick={() => setIsEditing(!isEditing)}
//               >
//                 <Edit className="h-4 w-4 mr-2" />
//                 {isEditing ? "Done Editing" : "Edit Best Practices"}
//               </Button>
//             </div>
//           </div>

//           {/* Mobile Edit Button */}
//           <div className="md:hidden mb-4">
//             <Button
//               className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
//               onClick={() => setIsEditing(!isEditing)}
//             >
//               <Edit className="h-4 w-4 mr-2" />
//               {isEditing ? "Done Editing" : "Edit Best Practices"}
//             </Button>
//           </div>

//           <Card className="mb-6 bg-slate-800/50 border-purple-800/30 backdrop-blur">
//             <CardHeader className="pb-3">
//               <div className="flex items-center justify-between">
//                 <CardTitle className="text-white">
//                   About Best Practices
//                 </CardTitle>
//                 <Badge className="bg-purple-900/50 text-purple-300 border border-purple-600/30 hover:bg-purple-800/50">
//                   <HelpCircle className="h-3 w-3 mr-1" />
//                   Guide
//                 </Badge>
//               </div>
//               <CardDescription className="text-slate-300">
//                 These guidelines are automatically applied to all sites but can
//                 be overridden by site-specific settings
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="flex items-start gap-3 p-3 bg-purple-900/20 rounded-md border border-purple-600/30">
//                 <AlertCircle className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
//                 <div>
//                   <p className="text-sm text-purple-200">
//                     Best practices are used by our AI when generating optimized
//                     schedules. They provide default guidance that applies to all
//                     cinema locations, but site-specific settings take precedence
//                     when available.
//                   </p>
//                   <p className="text-sm text-purple-200 mt-2">
//                     Changes made here will affect all future schedule
//                     generations across all sites.
//                   </p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Add New Section Button */}
//           {isEditing && (
//             <div className="mb-6">
//               <Dialog
//                 open={isAddSectionOpen}
//                 onOpenChange={setIsAddSectionOpen}
//               >
//                 <DialogTrigger asChild>
//                   <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700">
//                     <PlusCircle className="h-4 w-4 mr-2" />
//                     Add New Section
//                   </Button>
//                 </DialogTrigger>
//                 <DialogContent className="bg-slate-800 border-purple-800/30">
//                   <DialogHeader>
//                     <DialogTitle className="text-white">
//                       Add New Practice Section
//                     </DialogTitle>
//                     <DialogDescription className="text-slate-300">
//                       Create a new category of best practices to organize
//                       related guidelines.
//                     </DialogDescription>
//                   </DialogHeader>
//                   <div className="grid gap-4 py-4">
//                     <div className="grid grid-cols-4 items-center gap-4">
//                       <Label
//                         htmlFor="section-name"
//                         className="text-right text-slate-300"
//                       >
//                         Section Name
//                       </Label>
//                       <Input
//                         id="section-name"
//                         value={newSectionName}
//                         onChange={(e) => setNewSectionName(e.target.value)}
//                         className="col-span-3 bg-slate-700/50 border-purple-800/30 text-white placeholder:text-slate-400"
//                         placeholder="e.g., Marketing, Technology, etc."
//                       />
//                     </div>
//                   </div>
//                   <DialogFooter>
//                     <Button
//                       variant="outline"
//                       className="border-purple-800/30 text-slate-300 hover:bg-purple-800/50"
//                       onClick={() => setIsAddSectionOpen(false)}
//                     >
//                       Cancel
//                     </Button>
//                     <Button
//                       onClick={handleAddSection}
//                       className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
//                     >
//                       Add Section
//                     </Button>
//                   </DialogFooter>
//                 </DialogContent>
//               </Dialog>
//             </div>
//           )}

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {sections.map((section) => {
//               const SectionIcon =
//                 sectionIcons[section.name.toLowerCase()] || Star;

//               return (
//                 <Card
//                   key={section._id}
//                   className="h-full bg-slate-800/50 border-purple-800/30 backdrop-blur"
//                 >
//                   <CardHeader>
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2">
//                         <SectionIcon className="h-5 w-5 text-purple-400" />
//                         <CardTitle className="capitalize text-white">
//                           {section.name}
//                         </CardTitle>
//                       </div>
//                       {isEditing && (
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={() => handleDeleteSection(section._id)}
//                           className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       )}
//                     </div>
//                   </CardHeader>
//                   <CardContent className="space-y-4">
//                     <div className="space-y-3">
//                       {section.items && section.items.length > 0 ? (
//                         section.items.map((item) => (
//                           <div
//                             key={item._id}
//                             className="border border-purple-800/30 rounded-lg p-4"
//                           >
//                             <div className="flex items-start justify-between mb-2">
//                               <h4 className="font-medium text-white text-sm">
//                                 {item.name}
//                               </h4>
//                               {isEditing && (
//                                 <Button
//                                   variant="ghost"
//                                   size="sm"
//                                   onClick={() => handleDeleteItem(item._id)}
//                                   className="text-red-400 hover:text-red-300 hover:bg-red-900/20 ml-2"
//                                 >
//                                   <Trash2 className="h-3 w-3" />
//                                 </Button>
//                               )}
//                             </div>
//                             {isEditing ? (
//                               <ItemEditor item={item} onSave={handleSaveItem} />
//                             ) : (
//                               <p className="text-sm text-slate-300">
//                                 {item.description}
//                               </p>
//                             )}
//                           </div>
//                         ))
//                       ) : (
//                         <div className="text-center py-8 text-slate-400">
//                           <p className="text-sm">
//                             No items in this section yet.
//                           </p>
//                         </div>
//                       )}
//                     </div>

//                     {/* Add New Item Button */}
//                     {isEditing && (
//                       <Button
//                         variant="outline"
//                         className="w-full mt-4 border-dashed border-purple-600/50 text-purple-300 hover:bg-purple-800/50"
//                         onClick={() => {
//                           setAddItemSection(section);
//                           setIsAddItemOpen(true);
//                         }}
//                       >
//                         <Plus className="h-4 w-4 mr-2" />
//                         Add New Item
//                       </Button>
//                     )}
//                   </CardContent>
//                 </Card>
//               );
//             })}
//           </div>

//           {/* Add New Item Dialog */}
//           <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
//             <DialogContent className="bg-slate-800 border-purple-800/30">
//               <DialogHeader>
//                 <DialogTitle className="text-white">
//                   Add New Practice Item
//                 </DialogTitle>
//                 <DialogDescription className="text-slate-300">
//                   Add a new best practice item to the {addItemSection?.name}{" "}
//                   section.
//                 </DialogDescription>
//               </DialogHeader>
//               <div className="grid gap-4 py-4">
//                 <div className="grid grid-cols-4 items-center gap-4">
//                   <Label
//                     htmlFor="item-name"
//                     className="text-right text-slate-300"
//                   >
//                     Item Name
//                   </Label>
//                   <Input
//                     id="item-name"
//                     value={newItemName}
//                     onChange={(e) => setNewItemName(e.target.value)}
//                     className="col-span-3 bg-slate-700/50 border-purple-800/30 text-white placeholder:text-slate-400"
//                     placeholder="e.g., Digital Promotion, Customer Experience"
//                   />
//                 </div>
//                 <div className="grid grid-cols-4 items-center gap-4">
//                   <Label
//                     htmlFor="item-content"
//                     className="text-right text-slate-300"
//                   >
//                     Content
//                   </Label>
//                   <Textarea
//                     id="item-content"
//                     value={newItemContent}
//                     onChange={(e) => setNewItemContent(e.target.value)}
//                     className="col-span-3 bg-slate-700/50 border-purple-800/30 text-white placeholder:text-slate-400"
//                     rows={4}
//                     placeholder="Enter the best practice guidance..."
//                   />
//                 </div>
//               </div>
//               <DialogFooter>
//                 <Button
//                   variant="outline"
//                   className="border-purple-800/30 text-slate-300 hover:bg-purple-800/50"
//                   onClick={() => setIsAddItemOpen(false)}
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   onClick={handleAddItem}
//                   className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
//                 >
//                   Add Item
//                 </Button>
//               </DialogFooter>
//             </DialogContent>
//           </Dialog>
//         </main>
//       </div>
//     </div>
//   );
// }

// // Separate component for editing items
// function ItemEditor({ item, onSave }) {
//   const [name, setName] = useState(item.name);
//   const [description, setDescription] = useState(item.description);
//   const [isEditing, setIsEditing] = useState(false);

//   const handleSave = () => {
//     onSave(item._id, name, description);
//     setIsEditing(false);
//   };

//   const handleCancel = () => {
//     setName(item.name);
//     setDescription(item.description);
//     setIsEditing(false);
//   };

//   if (!isEditing) {
//     return (
//       <div className="space-y-2">
//         <p className="text-sm text-slate-300">{description}</p>
//         <Button
//           variant="outline"
//           size="sm"
//           className="border-purple-800/30 text-purple-300 hover:bg-purple-800/50"
//           onClick={() => setIsEditing(true)}
//         >
//           <Edit className="h-3 w-3 mr-1" />
//           Edit
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-3">
//       <Input
//         value={name}
//         onChange={(e) => setName(e.target.value)}
//         className="bg-slate-700/50 border-purple-800/30 text-white text-sm"
//         placeholder="Item name"
//       />
//       <Textarea
//         value={description}
//         onChange={(e) => setDescription(e.target.value)}
//         rows={3}
//         className="bg-slate-700/50 border-purple-800/30 text-white text-sm"
//         placeholder="Item description"
//       />
//       <div className="flex gap-2">
//         <Button
//           size="sm"
//           onClick={handleSave}
//           className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
//         >
//           <Save className="h-3 w-3 mr-1" />
//           Save
//         </Button>
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={handleCancel}
//           className="border-purple-800/30 text-slate-300 hover:bg-purple-800/50"
//         >
//           <X className="h-3 w-3 mr-1" />
//           Cancel
//         </Button>
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useState, useEffect } from "react";

// Define interfaces for better type safety
interface Section {
  _id: string;
  name: string;
  items: SectionItem[];
}

interface SectionItem {
  _id: string;
  name: string;
  description: string;
}

interface ItemEditorProps {
  item: SectionItem;
  onSave: (itemId: string, name: string, description: string) => void;
}
import {
  Film,
  Calendar,
  Building,
  BookOpen,
  Menu,
  Edit,
  Save,
  X,
  ThumbsUp,
  AlertCircle,
  Star,
  Clock,
  Users,
  TrendingUp,
  DollarSign,
  BarChart,
  LayoutGrid,
  Settings,
  HelpCircle,
  Plus,
  PlusCircle,
  Trash2,
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Placeholder data for best practices
const placeholderBestPractices = [
  {
    _id: "1",
    name: "General",
    items: [
      {
        _id: "g1",
        name: "Show Time Spacing",
        description:
          "Maintain at least 30 minutes between showtimes of the same film when possible to give audiences flexibility in choosing times.",
      },
      {
        _id: "g2",
        name: "Screen Allocation",
        description:
          "Assign larger screens to anticipated high-performers. Reserve premium formats (IMAX, Dolby) for films that will benefit most from the format.",
      },
      {
        _id: "g3",
        name: "Peak Hour Optimization",
        description:
          "Schedule the most popular films during peak hours (Friday-Sunday evenings) to maximize attendance and revenue.",
      },
    ],
  },
  {
    _id: "2",
    name: "Revenue",
    items: [
      {
        _id: "r1",
        name: "Weekend Maximization",
        description:
          "Prioritize high-grossing films for prime weekend slots. Friday and Saturday evening shows should feature blockbusters and popular releases.",
      },
      {
        _id: "r2",
        name: "Matinee Strategy",
        description:
          "Use matinee slots for family films, documentaries, and indie releases. Consider discounted pricing for weekday afternoon showings.",
      },
      {
        _id: "r3",
        name: "Premium Format Allocation",
        description:
          "Reserve IMAX and premium screens for tentpole releases and films with spectacular visuals to justify higher ticket prices.",
      },
    ],
  },
  {
    _id: "3",
    name: "Logistics",
    items: [
      {
        _id: "l1",
        name: "Changeover Time",
        description:
          "Allow minimum 20 minutes between shows for cleaning and setup. Extend to 30 minutes for premium formats requiring additional preparation.",
      },
      {
        _id: "l2",
        name: "Staff Scheduling Alignment",
        description:
          "Coordinate film schedules with staff availability. Avoid complex screening patterns during reduced staffing periods.",
      },
      {
        _id: "l3",
        name: "Concession Timing",
        description:
          "Stagger popular show start times by 15-30 minutes to prevent concession stand overload and reduce customer wait times.",
      },
    ],
  },
  {
    _id: "4",
    name: "Seasonal",
    items: [
      {
        _id: "s1",
        name: "Holiday Scheduling",
        description:
          "Increase showtimes for family-friendly content during school holidays. Add late-night showings for popular releases during holiday periods.",
      },
      {
        _id: "s2",
        name: "Summer Blockbuster Strategy",
        description:
          "During summer months, prioritize action and family films. Increase frequency of air-conditioned premium formats during hot weather.",
      },
      {
        _id: "s3",
        name: "Awards Season Focus",
        description:
          "During awards season (Nov-Feb), allocate screens to Oscar contenders and critically acclaimed films alongside commercial releases.",
      },
    ],
  },
];

export default function BestPracticesPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<{ itemId: string; field: string; value: any } | null>(null);

  // New state for add section dialog
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");

  // New state for add item dialog
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [addItemSection, setAddItemSection] = useState<Section | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemContent, setNewItemContent] = useState("");

  const router = useRouter();

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
      active: false,
    },
    {
      name: "Best Practices",
      icon: BookOpen,
      href: "/dashboard/best-practices",
      active: true,
    },
  ];

  const sectionIcons: Record<string, React.ComponentType<any>> = {
    general: Star,
    revenue: DollarSign,
    logistics: Clock,
    seasonal: BarChart,
  };

  // Fetch best practices from database
  useEffect(() => {
    const fetchBestPractices = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/best-practices');
        const data = await response.json();
        
        if (data.success) {
          setSections(data.sections);
        } else {
          toast.error('Failed to load best practices');
          // Fallback to placeholder if DB fails
          // setSections(placeholderBestPractices);
        }
      } catch (error) {
        console.error('Error fetching best practices:', error);
        toast.error('Failed to load best practices');
        // Fallback to placeholder if DB fails
        // setSections(placeholderBestPractices);
      } finally {
        setLoading(false);
      }
    };

    fetchBestPractices();
  }, []);

  const navigateTo = (url: string) => {
    router.push(url);
  };

  const handleItemChange = (itemId: string, field: string, value: any) => {
    setEditingItem({ itemId, field, value });
  };

  const handleSaveItem = async (itemId: string, name: string, description: string) => {
    try {
      const response = await fetch(`/api/best-practices/items/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Item updated successfully!");
        // Update local state
        setSections((prevSections: Section[]) =>
          prevSections.map((section) => ({
            ...section,
            items: section.items.map((item) =>
              item._id === itemId ? { ...item, name, description } : item
            ),
          }))
        );
      } else {
        toast.error(data.error || "Failed to update item");
      }
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update item");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`/api/best-practices/items/${itemId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Item deleted successfully!");
        // Update local state
        setSections((prevSections: Section[]) =>
          prevSections.map((section) => ({
            ...section,
            items: section.items.filter((item) => item._id !== itemId),
          }))
        );
      } else {
        toast.error(data.error || "Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this section and all its items?"
      )
    )
      return;

    try {
      const response = await fetch(
        `/api/best-practices/sections/${sectionId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Section deleted successfully!");
        // Update local state
        setSections((prevSections: Section[]) =>
          prevSections.filter((section) => section._id !== sectionId)
        );
      } else {
        toast.error(data.error || "Failed to delete section");
      }
    } catch (error) {
      console.error("Error deleting section:", error);
      toast.error("Failed to delete section");
    }
  };

  // Function to handle adding a new section
  const handleAddSection = async () => {
    if (!newSectionName.trim()) {
      toast.error("Section name cannot be empty!");
      return;
    }

    try {
      const response = await fetch("/api/best-practices/sections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newSectionName }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`New section "${newSectionName}" added!`);
        setNewSectionName("");
        setIsAddSectionOpen(false);

        // Update local state with the returned section
        const newSection = {
          ...data.section,
          items: [],
        };
        setSections((prevSections: Section[]) => [...prevSections, newSection]);
      } else {
        toast.error(data.error || "Failed to create section");
      }
    } catch (error) {
      console.error("Error creating section:", error);
      toast.error("Failed to create section");
    }
  };

  // Function to handle adding a new item to a section
  const handleAddItem = async () => {
    if (!newItemName.trim() || !newItemContent.trim()) {
      toast.error("Item name and content cannot be empty!");
      return;
    }

    try {
      const response = await fetch(
        `/api/best-practices/sections/${addItemSection?._id}/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newItemName,
            description: newItemContent,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success(`New item "${newItemName}" added!`);
        setNewItemName("");
        setNewItemContent("");
        setIsAddItemOpen(false);

        // Update local state with the returned item
        setSections((prevSections: Section[]) =>
          prevSections.map((section) =>
            section._id === addItemSection?._id
              ? { ...section, items: [...section.items, data.item] }
              : section
          )
        );
      } else {
        toast.error(data.error || "Failed to create item");
      }
    } catch (error) {
      console.error("Error creating item:", error);
      toast.error("Failed to create item");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Loading best practices...</div>
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
            <h1 className="text-lg font-medium ml-2 text-white">
              Best Practices
            </h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-1 text-white">
                Scheduling Best Practices
              </h1>
              <p className="text-slate-400">
                Standard guidelines applied to all cinema locations
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <Button
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? "Done Editing" : "Edit Best Practices"}
              </Button>
            </div>
          </div>

          {/* Mobile Edit Button */}
          <div className="md:hidden mb-4">
            <Button
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? "Done Editing" : "Edit Best Practices"}
            </Button>
          </div>

          <Card className="mb-6 bg-slate-800/50 border-purple-800/30 backdrop-blur">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">
                  About Best Practices
                </CardTitle>
                <Badge className="bg-purple-900/50 text-purple-300 border border-purple-600/30 hover:bg-purple-800/50">
                  <HelpCircle className="h-3 w-3 mr-1" />
                  Guide
                </Badge>
              </div>
              <CardDescription className="text-slate-300">
                These guidelines are automatically applied to all sites but can
                be overridden by site-specific settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 p-3 bg-purple-900/20 rounded-md border border-purple-600/30">
                <AlertCircle className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-purple-200">
                    Best practices are used by our AI when generating optimized
                    schedules. They provide default guidance that applies to all
                    cinema locations, but site-specific settings take precedence
                    when available.
                  </p>
                  <p className="text-sm text-purple-200 mt-2">
                    Changes made here will affect all future schedule
                    generations across all sites.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add New Section Button */}
          {isEditing && (
            <div className="mb-6">
              <Dialog
                open={isAddSectionOpen}
                onOpenChange={setIsAddSectionOpen}
              >
                <DialogTrigger asChild>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add New Section
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-purple-800/30">
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      Add New Practice Section
                    </DialogTitle>
                    <DialogDescription className="text-slate-300">
                      Create a new category of best practices to organize
                      related guidelines.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label
                        htmlFor="section-name"
                        className="text-right text-slate-300"
                      >
                        Section Name
                      </Label>
                      <Input
                        id="section-name"
                        value={newSectionName}
                        onChange={(e) => setNewSectionName(e.target.value)}
                        className="col-span-3 bg-slate-700/50 border-purple-800/30 text-white placeholder:text-slate-400"
                        placeholder="e.g., Marketing, Technology, etc."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      className="border-purple-800/30 text-slate-300 hover:bg-purple-800/50"
                      onClick={() => setIsAddSectionOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddSection}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                    >
                      Add Section
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sections.map((section: Section) => {
              const SectionIcon: React.ComponentType<any> =
                sectionIcons[section.name.toLowerCase()] || Star;

              return (
                <Card
                  key={section._id}
                  className="h-full bg-slate-800/50 border-purple-800/30 backdrop-blur"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SectionIcon className="h-5 w-5 text-purple-400" />
                        <CardTitle className="capitalize text-white">
                          {section.name}
                        </CardTitle>
                      </div>
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSection(section._id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {section.items && section.items.length > 0 ? (
                        section.items.map((item: SectionItem) => (
                          <div
                            key={item._id}
                            className="border border-purple-800/30 rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-white text-sm">
                                {item.name}
                              </h4>
                              {isEditing && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteItem(item._id)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20 ml-2"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            {isEditing ? (
                              <ItemEditor item={item} onSave={handleSaveItem} />
                            ) : (
                              <p className="text-sm text-slate-300">
                                {item.description}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-400">
                          <p className="text-sm">
                            No items in this section yet.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Add New Item Button */}
                    {isEditing && (
                      <Button
                        variant="outline"
                        className="w-full mt-4 border-dashed border-purple-600/50 text-purple-300 hover:bg-purple-800/50"
                        onClick={() => {
                          setAddItemSection(section);
                          setIsAddItemOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Item
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Add New Item Dialog */}
          <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
            <DialogContent className="bg-slate-800 border-purple-800/30">
              <DialogHeader>
                <DialogTitle className="text-white">
                  Add New Practice Item
                </DialogTitle>
                <DialogDescription className="text-slate-300">
                  Add a new best practice item to the {addItemSection?.name}{" "}
                  section.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="item-name"
                    className="text-right text-slate-300"
                  >
                    Item Name
                  </Label>
                  <Input
                    id="item-name"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="col-span-3 bg-slate-700/50 border-purple-800/30 text-white placeholder:text-slate-400"
                    placeholder="e.g., Digital Promotion, Customer Experience"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="item-content"
                    className="text-right text-slate-300"
                  >
                    Content
                  </Label>
                  <Textarea
                    id="item-content"
                    value={newItemContent}
                    onChange={(e) => setNewItemContent(e.target.value)}
                    className="col-span-3 bg-slate-700/50 border-purple-800/30 text-white placeholder:text-slate-400"
                    rows={4}
                    placeholder="Enter the best practice guidance..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  className="border-purple-800/30 text-slate-300 hover:bg-purple-800/50"
                  onClick={() => setIsAddItemOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddItem}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                >
                  Add Item
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}

// Separate component for editing items
function ItemEditor({ item, onSave }: ItemEditorProps) {
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onSave(item._id, name, description);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(item.name);
    setDescription(item.description);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-slate-300">{description}</p>
        <Button
          variant="outline"
          size="sm"
          className="border-purple-800/30 text-purple-300 hover:bg-purple-800/50"
          onClick={() => setIsEditing(true)}
        >
          <Edit className="h-3 w-3 mr-1" />
          Edit
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="bg-slate-700/50 border-purple-800/30 text-white text-sm"
        placeholder="Item name"
      />
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        className="bg-slate-700/50 border-purple-800/30 text-white text-sm"
        placeholder="Item description"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleSave}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
        >
          <Save className="h-3 w-3 mr-1" />
          Save
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          className="border-purple-800/30 text-slate-300 hover:bg-purple-800/50"
        >
          <X className="h-3 w-3 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
