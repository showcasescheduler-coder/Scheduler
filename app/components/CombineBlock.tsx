// import React from "react";
// import {
//   Badge,
//   Button,
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
//   Checkbox,
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuTrigger,
//   Progress,
// } from "@/components/ui";
// import {
//   MoreHorizontal,
//   RefreshCw,
//   PlusCircle,
//   CheckCircle,
//   Clock,
//   Loader2,
// } from "lucide-react";

// const CombinedBlockComponent = ({
//   blocks,
//   selectedDay,
//   handleEditBlock,
//   handleDeleteBlock,
//   handleRemoveBlockFromSchedule,
//   handleTaskCompletion,
//   handleEditTask,
//   handleRemoveTaskFromBlock,
//   handleDeleteTask,
//   handleAddTask,
//   handleCompleteBlock,
// }) => {
//   const calculateProgress = (tasks) => {
//     if (!tasks || tasks.length === 0) return 0;
//     const completedTasks = tasks.filter((task) => task.completed).length;
//     return (completedTasks / tasks.length) * 100;
//   };

//   return (
//     <>
//       {blocks.map((block, index) => {
//         const isEventBlock = !!block.event;
//         const isIncomplete = block.status === "incomplete";

//         return (
//           <Card key={block._id || index}>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <div>
//                 <CardTitle>
//                   {isEventBlock ? `Event: ${block.name}` : block.name}
//                 </CardTitle>
//                 <CardDescription>{`${block.startTime} - ${block.endTime}`}</CardDescription>
//               </div>
//               <div className="flex items-center space-x-2">
//                 {isIncomplete && <Badge variant="secondary">Incomplete</Badge>}
//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <Button aria-haspopup="true" size="icon" variant="ghost">
//                       <MoreHorizontal className="h-4 w-4" />
//                       <span className="sr-only">Toggle menu</span>
//                     </Button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent align="end">
//                     <DropdownMenuLabel>Actions</DropdownMenuLabel>
//                     <DropdownMenuItem onSelect={() => handleEditBlock(block)}>
//                       Edit
//                     </DropdownMenuItem>
//                     <DropdownMenuItem onSelect={() => handleDeleteBlock(block)}>
//                       Delete
//                     </DropdownMenuItem>
//                     {isEventBlock && (
//                       <DropdownMenuItem
//                         onSelect={() =>
//                           handleRemoveBlockFromSchedule(block._id)
//                         }
//                       >
//                         Remove from Schedule
//                       </DropdownMenuItem>
//                     )}
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               </div>
//             </CardHeader>
//             <CardContent>
//               {isEventBlock ? (
//                 <div className="text-sm text-gray-600">
//                   <Clock className="inline-block mr-2 h-4 w-4" />
//                   {block.description || "No description available"}
//                 </div>
//               ) : (
//                 <>
//                   {block.tasks && block.tasks.length > 0 && (
//                     <Progress
//                       value={calculateProgress(block.tasks)}
//                       className="h-2 mt-2 mb-4 bg-gray-200"
//                     />
//                   )}
//                   <div className="space-y-2">
//                     {block.tasks &&
//                       block.tasks.map((task, taskIndex) => (
//                         <Card
//                           key={task._id || taskIndex}
//                           className="bg-muted relative"
//                         >
//                           <CardContent className="p-3 flex items-center justify-between">
//                             <div className="flex items-center space-x-3">
//                               {selectedDay !== "tomorrow" && (
//                                 <div className="flex-shrink-0">
//                                   {task.updatingTask ? (
//                                     <Loader2 className="h-4 w-4 animate-spin" />
//                                   ) : (
//                                     <Checkbox
//                                       id={`task-${task._id || taskIndex}`}
//                                       checked={task.completed}
//                                       onCheckedChange={(checked) =>
//                                         handleTaskCompletion(task._id, checked)
//                                       }
//                                       disabled={task.updatingTask}
//                                     />
//                                   )}
//                                 </div>
//                               )}
//                               <div>
//                                 <label
//                                   htmlFor={`task-${task._id || taskIndex}`}
//                                   className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//                                 >
//                                   {task.name}
//                                 </label>
//                               </div>
//                             </div>
//                             <div className="flex items-center space-x-2">
//                               {task.projectId ? (
//                                 <Badge className="text-xs hidden md:inline-flex bg-purple-100 text-purple-800">
//                                   Project
//                                 </Badge>
//                               ) : task.isRoutineTask ? (
//                                 <Badge className="text-xs hidden md:inline-flex bg-green-100 text-green-800">
//                                   Routine
//                                 </Badge>
//                               ) : (
//                                 <Badge className="text-xs hidden md:inline-flex">
//                                   Stand-alone
//                                 </Badge>
//                               )}
//                               <Badge
//                                 className={`text-xs hidden md:inline-flex ${
//                                   task.priority === "High"
//                                     ? "bg-red-100 text-red-800"
//                                     : task.priority === "Medium"
//                                     ? "bg-yellow-100 text-yellow-800"
//                                     : "bg-green-100 text-green-800"
//                                 }`}
//                               >
//                                 {task.priority}
//                               </Badge>
//                               <Badge className="text-xs">{task.duration}</Badge>
//                               <DropdownMenu>
//                                 <DropdownMenuTrigger asChild>
//                                   <Button
//                                     aria-haspopup="true"
//                                     size="icon"
//                                     variant="ghost"
//                                   >
//                                     <MoreHorizontal className="h-4 w-4" />
//                                     <span className="sr-only">Actions</span>
//                                   </Button>
//                                 </DropdownMenuTrigger>
//                                 <DropdownMenuContent align="end">
//                                   <DropdownMenuLabel>Actions</DropdownMenuLabel>
//                                   <DropdownMenuItem
//                                     onSelect={() => handleEditTask(task)}
//                                   >
//                                     Edit
//                                   </DropdownMenuItem>
//                                   {!task.isRoutineTask && (
//                                     <DropdownMenuItem
//                                       onSelect={() =>
//                                         handleRemoveTaskFromBlock(task, block)
//                                       }
//                                     >
//                                       Remove from Block
//                                     </DropdownMenuItem>
//                                   )}
//                                   <DropdownMenuItem
//                                     onSelect={() =>
//                                       handleDeleteTask(task, block)
//                                     }
//                                   >
//                                     Delete Task
//                                   </DropdownMenuItem>
//                                 </DropdownMenuContent>
//                               </DropdownMenu>
//                             </div>
//                           </CardContent>
//                         </Card>
//                       ))}
//                   </div>
//                 </>
//               )}
//               <div className="flex justify-end mt-4 space-x-2">
//                 {!isEventBlock && (
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     className="bg-white"
//                     onClick={() => handleAddTask(block._id)}
//                   >
//                     <PlusCircle className="mr-2 h-4 w-4" />
//                     Add Task
//                   </Button>
//                 )}
//                 {selectedDay !== "tomorrow" && (
//                   <Button
//                     variant="default"
//                     size="sm"
//                     className="bg-black text-white"
//                     onClick={() => handleCompleteBlock(block._id)}
//                   >
//                     <CheckCircle className="mr-2 h-4 w-4" />
//                     Complete {isEventBlock ? "Event" : "Block"}
//                   </Button>
//                 )}
//                 {isIncomplete && (
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     className="bg-gray-100 text-gray-800 hover:bg-gray-200"
//                     onClick={() => handleReactivateBlock(block._id)}
//                   >
//                     <RefreshCw className="mr-2 h-4 w-4" />
//                     Reactivate Block
//                   </Button>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         );
//       })}
//     </>
//   );
// };

// export default CombinedBlockComponent;
