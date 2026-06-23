// canvas.ts
// Responsible for talking to the Canvas LMS REST API and returning the
// upcoming assignments we care about.
//
// Configuration comes from environment variables (see .env.example):
//   CANVAS_BASE_URL  e.g. https://canvas.instructure.com
//   CANVAS_TOKEN     a Canvas API access token
//
// This is a stub for now — the real fetch logic will be filled in later.

/** A single Canvas assignment, trimmed down to the fields we use. */
export interface CanvasAssignment {
  id: number;
  name: string;
  /** Course the assignment belongs to. */
  courseName: string;
  /** ISO 8601 due date, or null if the assignment has no due date. */
  dueAt: string | null;
  /** Direct link to the assignment in Canvas. */
  htmlUrl: string;
}

/**
 * Fetch upcoming assignments from Canvas.
 *
 * TODO: call the Canvas API using CANVAS_BASE_URL and CANVAS_TOKEN,
 * filter to assignments due in the near future, and map them to
 * CanvasAssignment.
 */
export async function fetchUpcomingAssignments(): Promise<CanvasAssignment[]> {
  console.log("canvas: fetchUpcomingAssignments placeholder");
  return [];
}
