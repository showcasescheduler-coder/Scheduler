import { NextRequest, NextResponse } from "next/server";
import { promiseHooks } from "v8";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const {
    eventBlocks,
    routineBlocks,
    tasks,
    projects,
    userInput,
    startTime,
    endTime,
  } = await request.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: "Missing Anthropic API key" },
      { status: 500 }
    );
  }

  console.log("this is the new one");
  console.log("these are the routines", routineBlocks);
  console.log("these are the events", eventBlocks);
  console.log("these are the routines", tasks);
  console.log("these are the routines", projects);
  console.log("user Input", userInput);

  const createSchedulePrompt = `You are an expert scheduling assistant helping to organize a client's day. Your primary goal is to create a valid schedule that strictly enforces time constraints and task ordering requirements.

AVAILABLE DATA:
Time Frame: ${startTime} to ${endTime}
User Request: "${userInput}"

Projects and Their Tasks: ${JSON.stringify(projects, null, 2)}
Events: ${JSON.stringify(eventBlocks, null, 2)}
Routines: ${JSON.stringify(routineBlocks, null, 2)}
Standalone Tasks: ${JSON.stringify(tasks, null, 2)}

CRITICAL VALIDATION RULES:
1. Block Duration Rule (MOST IMPORTANT)
   - Block duration MUST equal sum of contained task durations
   - Calculate total task duration before creating any block
   - If tasks would exceed block time, create new block
   - Never place tasks without verifying duration constraint
   - Example: 60-minute block must contain exactly 60 minutes of tasks

2. Project Task Sequence (NEVER VIOLATE)
   - Every project task has a sequence number (0,1,2...)
   - Tasks MUST be scheduled in exact sequence order
   - Cannot place task n before task n-1
   - If sequence impossible, report in scheduleRationale

3. Time Block Integrity
   - No blocks can overlap
   - All times must be rounded to 30-minute intervals
   - Minimum block duration: 25 minutes
   - Tasks must fit within their specified time windows
   - Events cannot be moved from specified times unless user requests

SCHEDULING PRIORITY ORDER:
1. User Input (ABSOLUTE HIGHEST PRIORITY)
   - Always process user's explicit requests first
   - User modifications override ALL existing data
   - Handle these cases:
     a. Event Modifications:
        * Modified events: Keep eventId, use new time/duration
        * New events: Set eventId=null, isEvent=true
        * Override any conflicting database events
     b. Task Scheduling:
        * Exact times specified by user
        * Modified task properties
        * New tasks (set taskId=null)
     c. Routine Changes:
        * Modified routines: Keep routineId, use new window
        * New routines: Set routineId=null, copy tasks
        * Honor user's time preferences

2. Remaining Fixed Commitments
   - Unmodified events from database
   - Hard deadline tasks (due within 24h)

3. Routine Integration
   - Place in preferred time windows
   - Keep exact routine names
   - Maintain original task sequence
   - Set isRoutine=true and use original routineId

4. Project Task Scheduling
   - Process one project at a time
   - Every project task has a sequence number (0,1,2...)
   - Tasks MUST be scheduled in exact sequence order throughout the day
   - When block would exceed duration:
     * End current block
     * Create new block
     * Continue with next task
   - Set projectId and maintain original task IDs

5. Standalone Task Integration
   - Priority order: High → Medium → Low
   - Group similar tasks when possible
   - Respect time windows if specified
   - Set isStandaloneBlock=true

6. Break Integration
   - Required after 2.5 hours continuous work
   - 5-15 minutes between different task types
   - 30-60 minutes for lunch
   - Skip if near existing break-like routine

ERROR PREVENTION:
1. Before Creating Block:
   - Sum all task durations
   - Verify sum matches intended block duration
   - Confirm no time overlaps
   - Validate all task IDs exist

2. Before Adding Task:
   - Verify task exists in input data
   - Confirm task fits in remaining block time
   - Check task ordering for projects
   - Validate time window constraints

CRITICAL: You must return ONLY a raw JSON object without any additional text, markdown formatting, or code blocks. The response must start with { and end with } and contain only valid JSON. Return this exact structure:
{
  "currentTime": "${new Date().toTimeString().slice(0, 5)}",
  "scheduleRationale": "Brief explanation focusing on:
    - User input processing results
    - How block durations were validated
    - Project task order maintenance
    - Any scheduling conflicts
    - Unscheduled tasks and why",
  "blocks": [
    {
      "name": "Clear descriptive name",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "isEvent": boolean,
      "isRoutine": boolean,
      "isStandaloneBlock": boolean,
      "eventId": "MUST use exact _id from input Event when isRoutine is true",
      "routineId": "MUST use exact _id from input Routine when isRoutine is true",
      "tasks": [
        {
          "id": "original_task_id or null",
          "name": string,
          "description": string,
          "duration": number,
          "priority": "High" | "Medium" | "Low",
          "isRoutineTask": boolean,
          "projectId": "original_project_id or null",
          "type": "deep-work" | "planning" | "break" | "admin" | "collaboration",
          "isUserSpecified": boolean
        }
      ]
    }
  ]
}`;

  //   const createSchedulePrompt = `You are an expert scheduling assistant helping to organize a client's day. Your primary goal is to create a valid schedule that strictly enforces time constraints and task ordering requirements.

  // AVAILABLE DATA:
  // Time Frame: ${startTime} to ${endTime}
  // User Request: "${userInput}"

  // Projects and Their Tasks: ${JSON.stringify(projects, null, 2)}
  // Events: ${JSON.stringify(eventBlocks, null, 2)}
  // Routines: ${JSON.stringify(routineBlocks, null, 2)}
  // Standalone Tasks: ${JSON.stringify(tasks, null, 2)}

  // CRITICAL VALIDATION RULES:
  // 1. Block Duration Rule (MOST IMPORTANT)
  //    - Block duration MUST equal sum of contained task durations
  //    - Calculate total task duration before creating any block
  //    - If tasks would exceed block time, create new block
  //    - Never place tasks without verifying duration constraint
  //    - Example: 60-minute block must contain exactly 60 minutes of tasks

  // 2. Project Task Sequence (NEVER VIOLATE)
  //    - Every project task has a sequence number (0,1,2...)
  //    - Tasks MUST be scheduled in exact sequence order
  //    - Cannot place task n before task n-1
  //    - If sequence impossible, report in scheduleRationale

  // 3. Time Block Integrity
  //    - No blocks can overlap
  //    - All times must be rounded to 30-minute intervals
  //    - Minimum block duration: 25 minutes
  //    - Tasks must fit within their specified time windows
  //    - Events cannot be moved from specified times unless user requests

  // SCHEDULING PRIORITY ORDER:
  // 1. User Input (ABSOLUTE HIGHEST PRIORITY)
  //    - Always process user's explicit requests first
  //    - User modifications override ALL existing data
  //    - Handle these cases:
  //      a. Event Modifications:
  //         * Modified events: Keep eventId, use new time/duration
  //         * New events: Set eventId=null, isEvent=true
  //         * Override any conflicting database events
  //      b. Task Scheduling:
  //         * Exact times specified by user
  //         * Modified task properties
  //         * New tasks (set taskId=null)
  //      c. Routine Changes:
  //         * Modified routines: Keep routineId, use new window
  //         * New routines: Set routineId=null, copy tasks
  //         * Honor user's time preferences

  // 2. Remaining Fixed Commitments
  //    - Unmodified events from database
  //    - Hard deadline tasks (due within 24h)

  // 3. Routine Integration
  //    - Place in preferred time windows
  //    - Keep exact routine names
  //    - Maintain original task sequence
  //    - Set isRoutine=true and use original routineId

  // 4. Project Task Scheduling
  //    - Process one project at a time
  //    - Maintain exact task order within each project
  //    - When block would exceed duration:
  //      * End current block
  //      * Create new block
  //      * Continue with next task
  //    - Set projectId and maintain original task IDs

  // 5. Standalone Task Integration
  //    - Priority order: High → Medium → Low
  //    - Group similar tasks when possible
  //    - Respect time windows if specified
  //    - Set isStandaloneBlock=true

  // 6. Break Integration
  //    - Required after 2.5 hours continuous work
  //    - 5-15 minutes between different task types
  //    - 30-60 minutes for lunch
  //    - Skip if near existing break-like routine

  // ERROR PREVENTION:
  // 1. Before Creating Block:
  //    - Sum all task durations
  //    - Verify sum matches intended block duration
  //    - Confirm no time overlaps
  //    - Validate all task IDs exist

  // 2. Before Adding Task:
  //    - Verify task exists in input data
  //    - Confirm task fits in remaining block time
  //    - Check task ordering for projects
  //    - Validate time window constraints

  // CRITICAL: You must return ONLY a raw JSON object without any additional text, markdown formatting, or code blocks. The response must start with { and end with } and contain only valid JSON. Return this exact structure:
  // {
  //   "currentTime": "${new Date().toTimeString().slice(0, 5)}",
  //   "scheduleRationale": "Brief explanation focusing on:
  //     - User input processing results
  //     - How block durations were validated
  //     - Project task order maintenance
  //     - Any scheduling conflicts
  //     - Unscheduled tasks and why",
  //   "blocks": [
  //     {
  //       "name": "Clear descriptive name",
  //       "startTime": "HH:MM",
  //       "endTime": "HH:MM",
  //       "isEvent": boolean,
  //       "isRoutine": boolean,
  //       "isStandaloneBlock": boolean,
  //       "eventId": "MUST use exact _id from input Event when isRoutine is true",
  //       "routineId": "MUST use exact _id from input Routine when isRoutine is true",
  //       "tasks": [
  //         {
  //           "id": "original_task_id or null",
  //           "name": string,
  //           "description": string,
  //           "duration": number,
  //           "priority": "High" | "Medium" | "Low",
  //           "isRoutineTask": boolean,
  //           "projectId": "original_project_id or null",
  //           "type": "deep-work" | "planning" | "break" | "admin" | "collaboration",
  //           "isUserSpecified": boolean
  //         }
  //       ]
  //     }
  //   ]
  // }`;

  //   const createSchedulePrompt = `You are an expert scheduling assistant helping to organize a client's day. Your goal is to create an optimized schedule following strict scheduling principles while respecting all time constraints.

  // AVAILABLE DATA:
  // Time Frame: ${startTime} to ${endTime}
  // User Request: "${userInput}"

  // Projects and Their Tasks: ${JSON.stringify(projects, null, 2)}
  // Events: ${JSON.stringify(eventBlocks, null, 2)}
  // Routines: ${JSON.stringify(routineBlocks, null, 2)}
  // Standalone Tasks: ${JSON.stringify(tasks, null, 2)}

  // Available Data Structure:
  // 1. Time Frame: Specified start and end times for scheduling
  // 2. Events: Fixed calendar commitments with specific times
  // 3. Routines: Collections of recurring tasks with preferred time windows
  // 4. Projects: Collections of ordered tasks working toward specific goals
  // 5. Standalone Tasks: Individual tasks with varying priorities and deadlines
  // 6. User Input: Specific scheduling requests and modifications

  // GENERAL RULES:

  // 1. Block & Task Integrity:
  // - CRITICAL: The block's end time minus start time MUST be greater than or equal to the sum of all task durations within that block
  // - Calculate sum of task durations before placing in block
  // - If tasks would exceed block duration, create a new block
  // - All tasks must be contained within a time block
  // - No time blocks can overlap at any point
  // - Never create tasks that don't exist in input data
  //   * Exception: Break blocks can be created
  //   * Exception: "Free Time" blocks for gaps

  // 2. Time Management:
  // - Round all times to nearest 30 minutes for clarity
  // - Minimum block duration: 25 minutes
  // - Include 5-15 minute transitions between different types of work
  // - Maximum continuous work without break: 2.5 hours

  // 3. Data Integrity:
  // - Never modify original task properties except:
  //   * Priority adjustments for deadline tasks
  //   * Setting isUserSpecified flag
  // - Maintain all original IDs when using existing items
  // - Set IDs to null for new items
  // - Preserve exact names of events and routines

  // 4. Block Creation Rules:
  // - Every block must have:
  //   * Clear descriptive name
  //   * Precise start and end times
  //   * Correct boolean flags (isEvent, isRoutine, isStandaloneBlock)
  //   * Appropriate ID references
  // - Task grouping only allowed for:
  //   * Similar deadline-driven tasks
  //   * Related administrative work
  //   * Tasks from same project

  // 5. Task Placement Constraints:
  // - CRITICAL: Project tasks MUST be scheduled in the exact order they appear in the projects array
  //   * This order has been set by the user through drag-and-drop
  //   * Never reorder tasks within a project for any reason
  //   * If a task cannot fit in current block, create new block but maintain order
  // - Tasks must be scheduled within their specified time windows
  // - Other optimizations (energy patterns, cognitive load) only apply to non-project tasks

  // 6. Break & Buffer Management:
  // - Only create break blocks when needed
  // - Skip break creation near existing break-like routines
  // - Maintain small buffers between different task types
  // - Include preparation time before important events

  // SCHEDULING PROCESS:

  // 1. Process User Input
  // - Parse schedule-specific instructions only
  // - Honor explicit time requests ("Task A at 10:00")
  // - For event modifications:
  //   * If user changes time/duration of existing event: Keep original eventId
  //   * If user creates new event: Set eventId to null, set isEvent to true
  //   * Place at user-specified time, or if none given, use event's original time
  // - For routine handling:
  //   * Create new block with routine name
  //   * For existing routines: Set routineId to routine being duplicated
  //   * For new routines: Set routineId to null
  //   * Replicate all tasks from routine:
  //     - Copy task names and properties
  //     - Set isRoutineTask=true for all tasks
  //   * Set isRoutine=true for block
  // - For task requests:
  //   * Search projects and standalone tasks for matches
  //   * If matching existing task: Set taskId to original task's ID
  //   * If new task: Set taskId to null
  //   * Add to schedule in specified time slot

  // 2. Handle Fixed Commitments
  // Events:
  // - Schedule all events at their exact specified times
  // - For events in schedule:
  //   * Set eventId from original event
  //   * Set isEvent to true
  //   * Maintain all original event properties
  // - For conflicts with user-specified events:
  //   * Place conflicting event as close as possible to original time
  //   * Mark block name with "TIME CONFLICT - [EVENT NAME] - REQUIRES RESCHEDULING"
  //   * Maintain original eventId and isEvent=true
  //   * Add note in scheduleRationale about conflict

  // Deadline-Critical Tasks:
  // - Prioritize tasks due within next 24 hours
  // - Task placement rules:
  //   * Must be scheduled within task's specified time window
  //   * Can only be moved if conflicting with:
  //     - Fixed events
  //     - User-specified task times
  //     - Higher priority deadline tasks
  // - Task grouping strategy:
  //   * Group similar short-deadline tasks into single blocks
  //     - Example: Combine multiple admin tasks
  //     - Example: Group related communications
  //   * Maximum grouped block duration: 2 hours
  //   * Maintain individual task properties within groups
  // - For each deadline task:
  //   * Maintain original taskId
  //   * Set priority to "High"
  //   * Include buffer time if specified in task requirements

  // 3. Integrate Routines
  // - Place routines in preferred time windows
  // - Create blocks with routine names
  // - Set routineId and isRoutine flags
  // - Replicate routine tasks with null IDs
  // - Only modify if:
  //   * User explicitly requests
  //   * Unavoidable conflict exists

  // 4. Project Task Integration
  // - CRITICAL: USER-DEFINED TASK ORDER
  //   * The order of tasks in each project array is sacred - it represents user choices made through drag-and-drop
  //   * Never change this order even if it would create a "better" schedule
  //   * If tasks don't fit in one block, split into multiple blocks but maintain absolute order
  // - For each project:
  //   * Process tasks one by one in exact array order
  //   * When task duration sum would exceed block time:
  //     - Close current block
  //     - Create new block with incremental name (e.g., "Project Name: Part 1")
  //     - Continue with next task in sequence
  // - Additional considerations are secondary to maintaining user's chosen order

  // 5. Break Integration
  // - Insert strategic breaks between task blocks
  // - Break types and durations:
  //   * Micro-breaks (5-10 minutes) between regular tasks
  //   * Recovery breaks (15-30 minutes) between deep work
  //   * Lunch break (30-60 minutes) mid-day
  //   * Skip break insertion if routine break exists
  // - Name breaks descriptively (e.g., "Lunch Break", "Afternoon Refresh")
  // - Do not place breaks next to user routines that seem to act as a break

  // 6. Gap Management
  // - Identify gaps ≥ 30 minutes
  // - Label substantial gaps as "Free Time"
  // - Keep shorter gaps as flexibility buffers

  // CRITICAL: You must return ONLY a raw JSON object without any additional text, markdown formatting, or code blocks. The response must start with { and end with } and contain only valid JSON. Return this exact structure:
  // {
  //   "currentTime": "${new Date().toTimeString().slice(0, 5)}",
  //   "scheduleRationale": "Brief explanation of key decisions and conflicts",
  //   "blocks": [
  //     {
  //       "name": "Block name",
  //       "startTime": "HH:MM format",
  //       "endTime": "HH:MM format",
  //       "isEvent": boolean,
  //       "isRoutine": boolean,
  //       "isStandaloneBlock": boolean,
  //       "eventId": string or null,
  //       "routineId": "MUST use exact _id from input routine when isRoutine is true"
  //       "tasks": [
  //         {
  //           "id": "existing-id-if-found or null",
  //           "name": string,
  //           "description": string,
  //           "duration": number,
  //           "priority": "High" | "Medium" | "Low",
  //           "isRoutineTask": boolean,
  //           "projectId": string or null,
  //           "type": "deep-work" | "planning" | "break" | "admin" | "collaboration",
  //           "isUserSpecified": boolean,
  //         }
  //       ]
  //     }
  //   ]
  // }`;

  //   const createSchedulePrompt = `You are an expert scheduling assistant helping to organize a client's day. Your goal is to create an optimized schedule following strict scheduling principles while respecting all time constraints.

  // AVAILABLE DATA:
  // Time Frame: ${startTime} to ${endTime}
  // User Request: "${userInput}"

  // Projects and Their Tasks: ${JSON.stringify(projects, null, 2)}
  // Events: ${JSON.stringify(eventBlocks, null, 2)}
  // Routines: ${JSON.stringify(routineBlocks, null, 2)}
  // Standalone Tasks: ${JSON.stringify(tasks, null, 2)}

  // Available Data Structure:
  // 1. Time Frame: Specified start and end times for scheduling
  // 2. Events: Fixed calendar commitments with specific times
  // 3. Routines: Collections of recurring tasks with preferred time windows
  // 4. Projects: Collections of ordered tasks working toward specific goals
  // 5. Standalone Tasks: Individual tasks with varying priorities and deadlines
  // 6. User Input: Specific scheduling requests and modifications

  // GENERAL RULES:

  // 1. Block & Task Integrity:
  // - All tasks must be contained within a time block
  // - No time blocks can overlap at any point
  // - Total duration of tasks in a block must exactly match block duration
  // - Never create tasks that don't exist in input data
  //   * Exception: Break blocks can be created
  //   * Exception: "Free Time" blocks for gaps

  // 2. Time Management:
  // - Round all times to nearest 30 minutes for clarity
  // - Minimum block duration: 25 minutes
  // - Include 5-15 minute transitions between different types of work
  // - Maximum continuous work without break: 2.5 hours

  // 3. Data Integrity:
  // - Never modify original task properties except:
  //   * Priority adjustments for deadline tasks
  //   * Setting isUserSpecified flag
  // - Maintain all original IDs when using existing items
  // - Set IDs to null for new items
  // - Preserve exact names of events and routines

  // 4. Block Creation Rules:
  // - Every block must have:
  //   * Clear descriptive name
  //   * Precise start and end times
  //   * Correct boolean flags (isEvent, isRoutine, isStandaloneBlock)
  //   * Appropriate ID references
  // - Task grouping only allowed for:
  //   * Similar deadline-driven tasks
  //   * Related administrative work
  //   * Tasks from same project

  // 5. Task Placement Constraints:
  // - Tasks must be scheduled within their specified time windows
  // - Project tasks must maintain their array order
  // - Deep work tasks require peak energy times
  // - Consider cognitive load and task relationships

  // 6. Break & Buffer Management:
  // - Only create break blocks when needed
  // - Skip break creation near existing break-like routines
  // - Maintain small buffers between different task types
  // - Include preparation time before important events

  // SCHEDULING PROCESS:

  // 1. Process User Input
  // - Parse schedule-specific instructions only
  // - Honor explicit time requests ("Task A at 10:00")
  // - For event modifications:
  //   * If user changes time/duration of existing event: Keep original eventId
  //   * If user creates new event: Set eventId to null, set isEvent to true
  //   * Place at user-specified time, or if none given, use event's original time
  // - For routine handling:
  //   * Create new block with routine name
  //   * For existing routines: Set routineId to routine being duplicated
  //   * For new routines: Set routineId to null
  //   * Replicate all tasks from routine:
  //     - Copy task names and properties
  //     - Set isRoutineTask=true for all tasks
  //   * Set isRoutine=true for block
  // - For task requests:
  //   * Search projects and standalone tasks for matches
  //   * If matching existing task: Set taskId to original task's ID
  //   * If new task: Set taskId to null
  //   * Add to schedule in specified time slot

  // 2. Handle Fixed Commitments
  // Events:
  // - Schedule all events at their exact specified times
  // - For events in schedule:
  //   * Set eventId from original event
  //   * Set isEvent to true
  //   * Maintain all original event properties
  // - For conflicts with user-specified events:
  //   * Place conflicting event as close as possible to original time
  //   * Mark block name with "TIME CONFLICT - [EVENT NAME] - REQUIRES RESCHEDULING"
  //   * Maintain original eventId and isEvent=true
  //   * Add note in scheduleRationale about conflict

  // Deadline-Critical Tasks:
  // - Prioritize tasks due within next 24 hours
  // - Task placement rules:
  //   * Must be scheduled within task's specified time window
  //   * Can only be moved if conflicting with:
  //     - Fixed events
  //     - User-specified task times
  //     - Higher priority deadline tasks
  // - Task grouping strategy:
  //   * Group similar short-deadline tasks into single blocks
  //     - Example: Combine multiple admin tasks
  //     - Example: Group related communications
  //   * Maximum grouped block duration: 2 hours
  //   * Maintain individual task properties within groups
  // - For each deadline task:
  //   * Maintain original taskId
  //   * Set priority to "High"
  //   * Include buffer time if specified in task requirements

  // 3. Integrate Routines
  // - Place routines in preferred time windows
  // - Create blocks with routine names
  // - Set routineId and isRoutine flags
  // - Replicate routine tasks with null IDs
  // - Only modify if:
  //   * User explicitly requests
  //   * Unavoidable conflict exists

  // 4. Project Task Integration
  // - Prioritize project tasks as goal-oriented work
  // - Create 90-minute deep work blocks (based on cognitive research)
  // - Place during peak energy periods:
  //   * Morning: 9:00-12:00 (typically highest focus)
  //   * Early Afternoon: 14:00-16:00 (post-recovery)
  // - Maintain task order from project array
  // - Maximum 2 deep work blocks before requiring substantial break
  // - Include 15-minute context switching time between projects

  // 5. Break Integration
  // - Insert strategic breaks between task blocks
  // - Break types and durations:
  //   * Micro-breaks (5-10 minutes) between regular tasks
  //   * Recovery breaks (15-30 minutes) between deep work
  //   * Lunch break (30-60 minutes) mid-day
  //   * Skip break insertion if routine break exists
  // - Name breaks descriptively (e.g., "Lunch Break", "Afternoon Refresh")
  // - Do not place breaks next to user routines that seem to act as a break

  // 6. Gap Management
  // - Identify gaps ≥ 30 minutes
  // - Label substantial gaps as "Free Time"
  // - Keep shorter gaps as flexibility buffers

  // CRITICAL: You must return ONLY a raw JSON object without any additional text, markdown formatting, or code blocks. The response must start with { and end with } and contain only valid JSON. Return this exact structure:
  // {
  //   "currentTime": "${new Date().toTimeString().slice(0, 5)}",
  //   "scheduleRationale": "Brief explanation of key decisions and conflicts",
  //   "blocks": [
  //     {
  //       "name": "Block name",
  //       "startTime": "HH:MM format",
  //       "endTime": "HH:MM format",
  //       "isEvent": boolean,
  //       "isRoutine": boolean,
  //       "isStandaloneBlock": boolean,
  //       "eventId": string or null,
  //       "routineId": "MUST use exact _id from input routine when isRoutine is true"
  //       "tasks": [
  //         {
  //           "id": "existing-id-if-found or null",
  //           "name": string,
  //           "description": string,
  //           "duration": number,
  //           "priority": "High" | "Medium" | "Low",
  //           "isRoutineTask": boolean,
  //           "projectId": string or null,
  //           "type": "deep-work" | "planning" | "break" | "admin" | "collaboration",
  //           "isUserSpecified": boolean,
  //         }
  //       ]
  //     }
  //   ]
  // }`;

  // const createSchedulePrompt = `You are an expert scheduling assistant helping to organize a client's day. Your goal is to create an optimized schedule following strict scheduling principles while respecting all time constraints.

  // AVAILABLE DATA:
  // Time Frame: \${startTime} to \${endTime}
  // User Request: "\${userInput}"

  // Projects and Their Tasks: \${JSON.stringify(projects, null, 2)}
  // Events: \${JSON.stringify(eventBlocks, null, 2)}
  // Routines: \${JSON.stringify(routineBlocks, null, 2)}
  // Standalone Tasks: \${JSON.stringify(tasks, null, 2)}

  // Available Data Structure:
  // 1. Time Frame: Specified start and end times for scheduling
  // 2. Events: Fixed calendar commitments with specific times
  // 3. Routines: Collections of recurring tasks with preferred time windows
  // 4. Projects: Collections of ordered tasks working toward specific goals
  // 5. Standalone Tasks: Individual tasks with varying priorities and deadlines
  // 6. User Input: Specific scheduling requests and modifications

  // GENERAL RULES:

  // 1. Block & Task Integrity:
  // - All tasks must be contained within a time block
  // - No time blocks can overlap at any point
  // - Total duration of tasks in a block must exactly match block duration
  // - Never create tasks that don't exist in input data
  //   * Exception: Break blocks can be created
  //   * Exception: "Free Time" blocks for gaps

  // 2. Time Management:
  // - Round all times to nearest 30 minutes for clarity
  // - Minimum block duration: 25 minutes
  // - Include 5-15 minute transitions between different types of work
  // - Maximum continuous work without break: 2.5 hours

  // 3. Data Integrity:
  // - Never modify original task properties except:
  //   * Priority adjustments for deadline tasks
  //   * Setting isUserSpecified flag
  // - Maintain all original IDs when using existing items
  // - Set IDs to null for new items
  // - Preserve exact names of events and routines

  // 4. Block Creation Rules:
  // - Every block must have:
  //   * Clear descriptive name
  //   * Precise start and end times
  //   * Correct boolean flags (isEvent, isRoutine, isStandaloneBlock)
  //   * Appropriate ID references
  // - Task grouping only allowed for:
  //   * Similar deadline-driven tasks
  //   * Related administrative work
  //   * Tasks from same project

  // 5. Task Placement Constraints:
  // - Tasks must be scheduled within their specified time windows
  // - Project tasks must maintain their array order
  // - Deep work tasks require peak energy times
  // - Consider cognitive load and task relationships

  // 6. Break & Buffer Management:
  // - Only create break blocks when needed
  // - Skip break creation near existing break-like routines
  // - Maintain small buffers between different task types
  // - Include preparation time before important events

  // SCHEDULING PROCESS:

  // 1. Process User Input
  // - Parse schedule-specific instructions only
  // - Honor explicit time requests ("Task A at 10:00")
  // - For event modifications:
  //   * If user changes time/duration of existing event: Keep original eventId
  //   * If user creates new event: Set eventId to null, set isEvent to true
  //   * Place at user-specified time, or if none given, use event's original time
  // - For routine handling:
  //   * Create new block with routine name
  //   * For existing routines: Set routineId to routine being duplicated
  //   * For new routines: Set routineId to null
  //   * Replicate all tasks from routine:
  //     - Copy task names and properties
  //     - Set isRoutineTask=true for all tasks
  //   * Set isRoutine=true for block
  // - For task requests:
  //   * Search projects and standalone tasks for matches
  //   * If matching existing task: Set taskId to original task's ID
  //   * If new task: Set taskId to null
  //   * Add to schedule in specified time slot

  // 2. Handle Fixed Commitments
  // Events:
  // - Schedule all events at their exact specified times
  // - For events in schedule:
  //   * Set eventId from original event
  //   * Set isEvent to true
  //   * Maintain all original event properties
  // - For conflicts with user-specified events:
  //   * Place conflicting event as close as possible to original time
  //   * Mark block name with "TIME CONFLICT - [EVENT NAME] - REQUIRES RESCHEDULING"
  //   * Maintain original eventId and isEvent=true
  //   * Add note in scheduleRationale about conflict

  // Deadline-Critical Tasks:
  // - Prioritize tasks due within next 24 hours
  // - Task placement rules:
  //   * Must be scheduled within task's specified time window
  //   * Can only be moved if conflicting with:
  //     - Fixed events
  //     - User-specified task times
  //     - Higher priority deadline tasks
  // - Task grouping strategy:
  //   * Group similar short-deadline tasks into single blocks
  //     - Example: Combine multiple admin tasks
  //     - Example: Group related communications
  //   * Maximum grouped block duration: 2 hours
  //   * Maintain individual task properties within groups
  // - For each deadline task:
  //   * Maintain original taskId
  //   * Set priority to "High"
  //   * Include buffer time if specified in task requirements

  // 3. Integrate Routines
  // - Place routines in preferred time windows
  // - Create blocks with routine names
  // - Set routineId and isRoutine flags
  // - Replicate routine tasks with null IDs
  // - Only modify if:
  //   * User explicitly requests
  //   * Unavoidable conflict exists

  // 4. Project Task Integration
  // - Prioritize project tasks as goal-oriented work
  // - Create 90-minute deep work blocks (based on cognitive research)
  // - Place during peak energy periods:
  //   * Morning: 9:00-12:00 (typically highest focus)
  //   * Early Afternoon: 14:00-16:00 (post-recovery)
  // - Maintain task order from project array
  // - Maximum 2 deep work blocks before requiring substantial break
  // - Include 15-minute context switching time between projects

  // 5. Break Integration
  // - Insert strategic breaks between task blocks
  // - Break types and durations:
  //   * Micro-breaks (5-10 minutes) between regular tasks
  //   * Recovery breaks (15-30 minutes) between deep work
  //   * Lunch break (30-60 minutes) mid-day
  //   * Skip break insertion if routine break exists
  // - Name breaks descriptively (e.g., "Lunch Break", "Afternoon Refresh")
  // - Do not place breaks next to user routines that seem to act as a break

  // 6. Gap Management
  // - Identify gaps ≥ 30 minutes
  // - Label substantial gaps as "Free Time"
  // - Keep shorter gaps as flexibility buffers

  // Return ONLY a JSON object with this structure:
  // {
  //   "currentTime": "\${new Date().toTimeString().slice(0, 5)}",
  //   "scheduleRationale": "Brief explanation of key decisions and conflicts",
  //   "blocks": [
  //     {
  //       "name": "Block name",
  //       "startTime": "HH:MM format",
  //       "endTime": "HH:MM format",
  //       "isEvent": boolean,
  //       "isRoutine": boolean,
  //       "isStandaloneBlock": boolean,
  //       "eventId": string or null,
  //       "routineId": "MUST use exact _id from input routine when isRoutine is true"
  //       "tasks": [
  //         {
  //           "id": "existing-id-if-found or null",
  //           "name": string,
  //           "description": string,
  //           "duration": number,
  //           "priority": "High" | "Medium" | "Low",
  //           "isRoutineTask": boolean,
  //           "projectId": string or null,
  //           "type": "deep-work" | "planning" | "break" | "admin" | "collaboration",
  //           "isUserSpecified": boolean,
  //         }
  //       ]
  //     }
  //   ]
  // }`;

  //   const createSchedulePrompt = `You are an expert scheduling assistant helping to organize a client's day. Your goal is to create an optimized schedule following a strict priority system while respecting all time constraints.

  // AVAILABLE DATA:
  // Time Frame: ${startTime} to ${endTime}
  // User Request: "${userInput}"

  // Projects and Their Tasks: ${JSON.stringify(projects, null, 2)}
  // Events: ${JSON.stringify(eventBlocks, null, 2)}
  // Routines: ${JSON.stringify(routineBlocks, null, 2)}
  // Standalone Tasks: ${JSON.stringify(tasks, null, 2)}

  // SCHEDULING PROCESS:
  // Follow this exact order when building the schedule:

  // 1. Initial Setup Phase:
  // - Validate all time windows and durations
  // - Ensure all tasks have required fields
  // - Calculate total available time

  // 2. Fixed Time Blocks (Highest Priority):
  // - Place all events at their exact specified times
  // - Events cannot be moved or modified
  // - Mark these times as unavailable

  // 3. Deadline-Critical Tasks:
  // - Place tasks with deadlines within 24-48 hours
  // - Must schedule within task's specified time window
  // - Add to unscheduled list if cannot fit within window
  // - Note deadline conflicts in schedule rationale

  // 4. User-Specified Items:
  // - Parse user's explicit scheduling requests
  // - Place mentioned tasks/projects/routines
  // - Must respect each item's time window
  // - Flag any unfulfilled requests for explanation

  // 5. Routine Integration:
  // - Place routines within their specified time windows
  // - Keep exact routine names and IDs
  // - Never modify routine tasks or create new ones
  // - Block duration must match sum of routine tasks
  // - Add to unscheduled list if cannot fit in window

  // 6. Remaining Task Integration:
  // - Process other tasks based on:
  //   * Priority level
  //   * Task relationships (same project/type)
  //   * Time window constraints
  //   * Energy patterns (complex tasks in morning)
  // - Group related tasks when possible
  // - Never create tasks that don't exist in input data

  // 7. Break Planning:
  // - Maximum 2.5 hours of deep work without breaks
  // - Minimum 15-minute breaks between work sessions
  // - Use routine breaks where available
  // - Add additional breaks where needed

  // 8. Gap Analysis:
  // - Identify gaps longer than 30 minutes
  // - For longer gaps, create "Free Time" blocks
  // - Never invent new tasks to fill gaps

  // VALIDATION RULES:
  // 1. Blocks must never overlap
  // 2. Each block's duration must exactly match the sum of its tasks
  // 3. Every task must be scheduled within its specified time window
  // 4. Routines must maintain their exact structure and timing windows
  // 5. Never create tasks that don't exist in the input data
  // 6. Always include breaks between deep work sessions

  // Return ONLY a JSON object with this structure:
  // {
  //   "currentTime": "${new Date().toTimeString().slice(0, 5)}",
  //   "scheduleRationale": "Brief explanation of key decisions and conflicts",
  //   "blocks": [
  //     {
  //       "name": "Block name",
  //       "startTime": "HH:MM format",
  //       "endTime": "HH:MM format",
  //       "isEvent": boolean,
  //       "isRoutine": boolean,
  //       "isStandaloneBlock": boolean,
  //       "eventId": string or null,
  //       "routineId": "MUST use exact _id from input routine when isRoutine is true"
  //       "tasks": [
  //         {
  //           "id": "existing-id-if-found or null",
  //           "name": string,
  //           "description": string,
  //           "duration": number,
  //           "priority": "High" | "Medium" | "Low",
  //           "isRoutineTask": boolean,
  //           "projectId": string or null,
  //           "type": "deep-work" | "planning" | "break" | "admin" | "collaboration",
  //           "isUserSpecified": boolean,
  //         }
  //       ]
  //     }
  //   ]
  // }`;

  //   const createSchedulePrompt = `You are an expert scheduling assistant helping to organize a client's day. They have a full backlog of tasks, events, and routines, but haven't given specific instructions about exact timing for everything. Your goal is to create an optimized schedule while identifying any specific tasks they reference.

  // AVAILABLE DATA:
  // Time Frame: ${startTime} to ${endTime}
  // User Request: "${userInput}"

  // Projects and Their Tasks: ${JSON.stringify(projects, null, 2)}
  // Events: ${JSON.stringify(eventBlocks, null, 2)}
  // Routines: ${JSON.stringify(routineBlocks, null, 2)}
  // Standalone Tasks: ${JSON.stringify(tasks, null, 2)}

  // SCHEDULING PRINCIPLES:
  // 1. Event and Routine Priority:
  // - Events are immutable and must be scheduled at their specified times
  // - Recurring routines should be placed according to their preferred times
  // - Never reschedule or modify events
  // - Events take absolute priority over all other activities

  // 2. Task Reference Detection:
  // - Analyze user input for mentions of existing tasks, projects, or activities
  // - Look for:
  //   * Direct task names or close matches
  //   * Project references
  //   * Routine mentions
  //   * Task descriptions or keywords
  // - When found, use the existing task's ID and details
  // - For ambiguous references, prefer exact matches over partial matches

  // 3. Schedule Building Priority Order:
  // a) Fixed events (unchangeable, must be included)
  // b) Routine blocks (following their usual schedule)
  // c) Specifically referenced tasks from user input
  // d) High priority tasks
  // e) Tasks with approaching deadlines
  // f) Related tasks to minimize context switching
  // g) Lower priority tasks to fill remaining time

  // 4. Energy and Flow Optimization:
  // - Place high-cognitive tasks during peak energy (typically morning)
  // - Group similar tasks to maintain focus and reduce context switching
  // - Schedule breaks between different types of work
  // - Consider task relationships and dependencies
  // - Avoid cognitive overload with proper task spacing

  // 5. Schedule Balance:
  // - Maintain appropriate work/break ratios
  // - Include buffer time between major tasks
  // - Account for natural energy patterns
  // - Ensure sustainable pacing throughout the day

  // SCHEDULING INSTRUCTIONS:
  // 1. First, lock in all events at their exact times
  // 2. Place routine blocks according to their usual schedule
  // 3. Identify and extract any task references from user input
  // 4. Build remaining schedule prioritizing:
  //    - Referenced tasks
  //    - Task priority
  //    - Deadlines
  //    - Dependencies
  //    - Energy optimization
  // 5. Include rationale for task placement
  // 6. Note any tasks that couldn't be scheduled
  // 7. Blocks times cannot overlap
  // 8. Block duration must be equal to total duration of tasks inside.

  // Return ONLY a JSON object with this structure:
  // {
  //   "currentTime": "${new Date().toTimeString().slice(0, 5)}",
  //   "scheduleRationale": "Detailed explanation of schedule structure, including:
  //     - How events and routines were prioritized
  //     - Which tasks were referenced in user input
  //     - Why tasks were placed in their slots
  //     - Energy and flow considerations
  //     - Any tasks that couldn't be scheduled",
  //   "blocks": [
  //     {
  //       "name": "Block name",
  //       "startTime": "HH:MM format",
  //       "endTime": "HH:MM format",
  //       "isEvent": boolean,
  //       "isRoutine": boolean,
  //       "isStandaloneBlock": boolean,
  //       "eventId": string or null,
  //       "routineId": string or null,
  //       "tasks": [
  //         {
  //           "id": "existing-id-if-found or null",
  //           "name": string,
  //           "description": string,
  //           "duration": number,
  //           "priority": "High" | "Medium" | "Low",
  //           "isRoutineTask": boolean,
  //           "projectId": string or null,
  //           "type": "deep-work" | "planning" | "break" | "admin" | "collaboration",
  //           "isUserSpecified": boolean,
  //           "aiInsight": "How this task fits into the overall schedule flow"
  //         }
  //       ]
  //     }
  //   ],
  //   "unscheduledTasks": [
  //     {
  //       "id": string,
  //       "name": string,
  //       "reason": "Why this task couldn't be scheduled"
  //     }
  //   ]
  // }`;

  try {
    const schedule = await getAnthropicResponse(apiKey, createSchedulePrompt);

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json(
      { message: "Error creating schedule" },
      { status: 500 }
    );
  }
}

async function getAnthropicResponse(apiKey: string, prompt: string) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-sonnet-20240229",
      max_tokens: 4096, // Increased from 1024 to 4096
      temperature: 0.3,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Anthropic API error: ${response.status}`, errorText);
    throw new Error(`Anthropic API error: ${errorText}`);
  }

  const data = await response.json();
  const content = data.content[0].text;

  try {
    return JSON.parse(content);
  } catch (parseError) {
    console.error("Error parsing JSON:", parseError);
    console.error("Received content:", content);
    throw new Error("Invalid JSON response from Anthropic API");
  }
}
