import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import Routine from "@/models/Routine";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const routine = await Routine.findById(params.id).populate("tasks");
    if (!routine) {
      return NextResponse.json(
        { success: false, error: "Routine not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(routine);
  } catch (error) {
    console.error("Error fetching routine:", error);
    return NextResponse.json(
      { success: false, error: "Error fetching routine" },
      { status: 400 }
    );
  }
}

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   await dbConnect();

//   try {
//     console.log("params", params);
//   } catch (error) {
//     console.error("Error fetching routine:", error);
//     return NextResponse.json(
//       { error: "Error fetching routine" },
//       { status: 500 }
//     );
//   }

//   // try {
//   //   const routine = await Routine.findById(params.id).populate("tasks");
//   //   if (!routine) {
//   //     return NextResponse.json({ error: "Routine not found" }, { status: 404 });
//   //   }
//   //   return NextResponse.json(routine);
//   // } catch (error) {
//   //   console.error("Error fetching routine:", error);
//   //   return NextResponse.json(
//   //     { error: "Error fetching routine" },
//   //     { status: 500 }
//   //   );
//   // }
// }

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const body = await request.json();
    const updatedRoutine = await Routine.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!updatedRoutine) {
      return NextResponse.json({ error: "Routine not found" }, { status: 404 });
    }
    return NextResponse.json(updatedRoutine);
  } catch (error) {
    console.error("Error updating routine:", error);
    return NextResponse.json(
      { error: "Error updating routine" },
      { status: 500 }
    );
  }
}
