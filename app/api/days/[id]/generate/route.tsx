// import { NextRequest, NextResponse } from "next/server";
// import dbConnect from "@/lib/mongo";
// import Day from "@/models/Day";
// import Block from "@/models/Block";
// import { generateScheduleWithAI } from "@/lib/ai"; // You'll need to implement this function

// export async function POST(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   await dbConnect();

//   try {
//     const day = await Day.findById(params.id).populate("blocks");
//     if (!day) {
//       return NextResponse.json({ error: "Day not found" }, { status: 404 });
//     }

//     const userData = await getUserData(); // Implement this function to gather user data
//     const aiResponse = await generateScheduleWithAI(userData, day);

//     // Process AI response and update day
//     for (const blockData of aiResponse.Blocks) {
//       const block = new Block({
//         dayId: day._id,
//         name: blockData.description,
//         startTime: blockData.startTime,
//         endTime: blockData.endTime,
//         tasks: blockData.Tasks.map((task) => ({
//           description: task.description,
//           status: task.status,
//         })),
//       });
//       await block.save();
//       day.blocks.push(block._id);
//     }

//     await day.save();

//     const updatedDay = await Day.findById(params.id).populate({
//       path: "blocks",
//       populate: { path: "tasks" },
//     });

//     return NextResponse.json(updatedDay);
//   } catch (error) {
//     console.error("Error generating schedule:", error);
//     return NextResponse.json(
//       { error: "Error generating schedule" },
//       { status: 500 }
//     );
//   }
// }
