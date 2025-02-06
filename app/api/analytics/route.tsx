import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import Day from "@/models/Day";
import User from "@/models/User";
import Project from "@/models/Project"; // Add Project model import
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const { userId: clerkId, range = "week" } = await request.json();

    if (!clerkId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ clerkId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const mongoUserId = user._id;
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999); // Set to end of day

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0); // Set to start of day

    switch (range) {
      case "week":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "14":
        startDate.setDate(endDate.getDate() - 14);
        break;
      case "month":
        startDate.setDate(endDate.getDate() - 30);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }

    // Add this right after getting the mongoUserId
    console.log("MongoDB User ID type:", typeof mongoUserId);
    console.log("MongoDB User ID:", mongoUserId);

    // Let's also get ALL projects for this user regardless of completion status
    const allProjects = await Project.find({
      userId: mongoUserId,
    }).lean();

    console.log("All projects for user (completed or not):", allProjects);

    // Let's examine one project's structure if we have any
    if (allProjects.length > 0) {
      console.log("Sample project structure:", {
        id: allProjects[0]._id,
        userId: allProjects[0].userId,
        completed: allProjects[0].completed,
        completedAt: allProjects[0].completedAt,
      });
    }

    // Keep your existing queries after this
    const allCompletedProjects = await Project.find({
      userId: mongoUserId,
      completed: true,
    }).lean();

    // Add this to see if there are ANY completed projects with ANY userId
    const anyCompletedProjects = await Project.find({
      completed: true,
    }).lean();

    console.log("ANY completed projects in the system:", anyCompletedProjects);

    const completedProjects = await Project.countDocuments({
      userId: clerkId, // Use the Clerk ID directly
      completed: true,
      completedAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const formatDate = (date: Date) => {
      return date.toISOString().split("T")[0];
    };

    const days = await Day.find({
      user: mongoUserId,
      date: {
        $gte: formatDate(startDate),
        $lte: formatDate(endDate),
      },
    })
      .populate({
        path: "blocks",
        populate: {
          path: "tasks",
          select: "completed",
        },
      })
      .sort({ date: -1 })
      .lean();

    // Process the days data as before
    let totalTasks = 0;
    let completedTasks = 0;

    const processedDays = days.map((day) => {
      let dayTotalTasks = 0;
      let dayCompletedTasks = 0;
      let blocksCompleted = 0;
      let totalBlocks = day.blocks?.length || 0;

      day.blocks?.forEach((block: any) => {
        let blockCompleted = true;
        block.tasks?.forEach((task: any) => {
          dayTotalTasks++;
          totalTasks++;
          if (task.completed) {
            dayCompletedTasks++;
            completedTasks++;
          } else {
            blockCompleted = false;
          }
        });
        if (blockCompleted && block.tasks?.length > 0) {
          blocksCompleted++;
        }
      });

      return {
        date: day.date,
        tasksCompleted: dayCompletedTasks,
        totalTasks: dayTotalTasks,
        blocksCompleted,
        totalBlocks,
      };
    });

    const totalDays = range === "week" ? 7 : range === "14" ? 14 : 30;

    const response = {
      averageTasksPerDay: (completedTasks / totalDays).toFixed(1),
      completionRate:
        totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : "0",
      totalTasksCompleted: completedTasks,
      totalTasks: totalTasks,
      completedProjects, // Add the completed projects count
      recentDays: processedDays,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Error fetching analytics data" },
      { status: 500 }
    );
  }
}

// import { NextRequest, NextResponse } from "next/server";
// import dbConnect from "@/lib/mongo";
// import Day from "@/models/Day";
// import User from "@/models/User"; // Add User model import
// import mongoose from "mongoose";

// export async function POST(request: NextRequest) {
//   await dbConnect();

//   try {
//     const { userId: clerkId, range = "week" } = await request.json();

//     if (!clerkId) {
//       return NextResponse.json(
//         { error: "User ID is required" },
//         { status: 400 }
//       );
//     }

//     const user = await User.findOne({ clerkId });

//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     const mongoUserId = user._id;
//     const endDate = new Date();
//     const startDate = new Date();

//     switch (range) {
//       case "week":
//         startDate.setDate(endDate.getDate() - 7);
//         break;
//       case "14":
//         startDate.setDate(endDate.getDate() - 14);
//         break;
//       case "month":
//         startDate.setDate(endDate.getDate() - 30);
//         break;
//       default:
//         startDate.setDate(endDate.getDate() - 7);
//     }

//     const formatDate = (date: Date) => {
//       return date.toISOString().split("T")[0];
//     };

//     const days = await Day.find({
//       user: mongoUserId,
//       date: {
//         $gte: formatDate(startDate),
//         $lte: formatDate(endDate),
//       },
//     })
//       .populate({
//         path: "blocks",
//         populate: {
//           path: "tasks",
//           select: "completed",
//         },
//       })
//       .sort({ date: -1 }) // Sort by date descending
//       .lean();

//     // Initialize our metrics
//     let totalTasks = 0;
//     let completedTasks = 0;

//     // Process days data for the response
//     const processedDays = days.map((day) => {
//       let dayTotalTasks = 0;
//       let dayCompletedTasks = 0;
//       let blocksCompleted = 0;
//       let totalBlocks = day.blocks?.length || 0;

//       day.blocks?.forEach((block: any) => {
//         let blockCompleted = true;
//         block.tasks?.forEach((task: any) => {
//           dayTotalTasks++;
//           totalTasks++;
//           if (task.completed) {
//             dayCompletedTasks++;
//             completedTasks++;
//           } else {
//             blockCompleted = false;
//           }
//         });
//         if (blockCompleted && block.tasks?.length > 0) {
//           blocksCompleted++;
//         }
//       });

//       return {
//         date: day.date,
//         tasksCompleted: dayCompletedTasks,
//         totalTasks: dayTotalTasks,
//         blocksCompleted,
//         totalBlocks,
//       };
//     });

//     const totalDays = range === "week" ? 7 : range === "14" ? 14 : 30;

//     const response = {
//       averageTasksPerDay: (completedTasks / totalDays).toFixed(1),
//       completionRate:
//         totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : "0",
//       totalTasksCompleted: completedTasks,
//       totalTasks: totalTasks,
//       recentDays: processedDays,
//     };

//     return NextResponse.json(response);
//   } catch (error) {
//     console.error("Error fetching analytics:", error);
//     return NextResponse.json(
//       { error: "Error fetching analytics data" },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(request: NextRequest) {
//   await dbConnect();

//   try {
//     // Get the Clerk ID from the request body
//     const { userId: clerkId, range = "week" } = await request.json();

//     if (!clerkId) {
//       return NextResponse.json(
//         { error: "User ID is required" },
//         { status: 400 }
//       );
//     }

//     // First, find the user document using the Clerk ID
//     const user = await User.findOne({ clerkId });

//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     // Now we have the MongoDB User ID to use in our Day query
//     const mongoUserId = user._id;

//     // Calculate the date range for our query
//     const endDate = new Date();
//     const startDate = new Date();

//     switch (range) {
//       case "week":
//         startDate.setDate(endDate.getDate() - 7);
//         break;
//       case "14":
//         startDate.setDate(endDate.getDate() - 14);
//         break;
//       case "month":
//         startDate.setDate(endDate.getDate() - 30);
//         break;
//       default:
//         startDate.setDate(endDate.getDate() - 7);
//     }

//     // Format dates to match your Day model's date string format (YYYY-MM-DD)
//     const formatDate = (date: Date) => {
//       return date.toISOString().split("T")[0];
//     };

//     // Use the MongoDB User ID to find the days
//     const days = await Day.find({
//       user: mongoUserId, // Now using the correct MongoDB ObjectId
//       date: {
//         $gte: formatDate(startDate),
//         $lte: formatDate(endDate),
//       },
//     })
//       .populate({
//         path: "blocks",
//         populate: {
//           path: "tasks",
//           select: "completed",
//         },
//       })
//       .lean();

//     // Initialize our metrics
//     let totalTasks = 0;
//     let completedTasks = 0;

//     // Process each day's data
//     days.forEach((day) => {
//       day.blocks?.forEach((block: any) => {
//         block.tasks?.forEach((task: any) => {
//           totalTasks++;
//           if (task.completed) {
//             completedTasks++;
//           }
//         });
//       });
//     });

//     // Get total days based on selected range
//     const totalDays = range === "week" ? 7 : range === "14" ? 14 : 30;

//     // Calculate final metrics
//     const response = {
//       averageTasksPerDay: (completedTasks / totalDays).toFixed(1),
//       completionRate:
//         totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : "0",
//       totalTasksCompleted: completedTasks,
//       totalTasks: totalTasks,
//       completedTasks: completedTasks,
//     };

//     return NextResponse.json(response);
//   } catch (error) {
//     console.error("Error fetching analytics:", error);
//     return NextResponse.json(
//       { error: "Error fetching analytics data" },
//       { status: 500 }
//     );
//   }
// }
