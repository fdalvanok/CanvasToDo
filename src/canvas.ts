// canvas.ts
// Talks to the Canvas LMS REST API and returns the upcoming assignments we
// care about, flattened across all of the user's active courses.
//
// Configuration comes from environment variables (see .env.example):
//   CANVAS_BASE_URL  the API root of your Canvas instance, e.g.
//                    https://canvas.instructure.com/api/v1
//   CANVAS_TOKEN     a Canvas API access token
//
// dotenv is imported here too so that running this module locally (outside of
// index.ts) still picks up your .env file. In GitHub Actions the variables are
// already present, so dotenv simply finds nothing extra to load.
import "dotenv/config";

/** One assignment, trimmed to the fields this project uses. */
export interface CanvasAssignment {
  id: number;
  courseName: string;
  name: string;
  description: string;
  /** ISO 8601 due date, or null if the assignment has no due date. */
  dueAt: string | null;
  /** Direct link to the assignment in Canvas. */
  htmlUrl: string;
  /** True if we've already submitted (or it's been graded). */
  submitted: boolean;
}

// ---------------------------------------------------------------------------
// Raw API shapes — only the fields we actually read from each response.
// Canvas returns much more than this; we keep our interfaces minimal.
// ---------------------------------------------------------------------------

/** A course as returned by GET /users/self/courses. */
interface CanvasCourse {
  id: number;
  name: string;
}

/** A submission, included on assignments via include[]=submission. */
interface CanvasSubmission {
  workflow_state: string; // e.g. "unsubmitted" | "submitted" | "graded"
}

/** An assignment as returned by GET /courses/{id}/assignments. */
interface CanvasAssignmentRaw {
  id: number;
  name: string;
  description: string | null;
  due_at: string | null;
  html_url: string;
  submission?: CanvasSubmission;
}

/**
 * Read and validate the Canvas configuration from the environment.
 * Throws a clear error if either variable is missing.
 */
function getConfig(): { baseUrl: string; token: string } {
  const baseUrl = process.env.CANVAS_BASE_URL;
  const token = process.env.CANVAS_TOKEN;

  if (!baseUrl) throw new Error("CANVAS_BASE_URL is not set");
  if (!token) throw new Error("CANVAS_TOKEN is not set");

  // Strip a trailing slash so we can safely join paths with a leading slash.
  return { baseUrl: baseUrl.replace(/\/$/, ""), token };
}

/**
 * Parse the `Link` response header and return the URL marked rel="next",
 * or null if there is no next page.
 *
 * Canvas paginates list endpoints. Instead of giving us a page count, it sends
 * a `Link` header listing related URLs, for example:
 *
 *   <https://.../assignments?page=2>; rel="next",
 *   <https://.../assignments?page=5>; rel="last"
 *
 * To walk every page we keep following the "next" URL until there isn't one.
 */
function getNextPageUrl(linkHeader: string | null): string | null {
  if (!linkHeader) return null;

  // Each comma-separated part looks like: <URL>; rel="next"
  for (const part of linkHeader.split(",")) {
    const match = part.match(/<([^>]+)>\s*;\s*rel="([^"]+)"/);
    if (match && match[2] === "next") {
      return match[1];
    }
  }
  return null;
}

/**
 * Fetch every page of a paginated Canvas list endpoint and return the combined
 * results as a single flat array.
 *
 * The first request goes to `startUrl`; subsequent requests follow the
 * rel="next" link until Canvas stops sending one.
 */
async function paginate<T>(startUrl: string, token: string): Promise<T[]> {
  const results: T[] = [];
  let url: string | null = startUrl;

  while (url) {
    const response: Response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      // 401 almost always means the token is wrong; give a friendly hint.
      if (response.status === 401) {
        throw new Error("Canvas token invalid or expired");
      }
      throw new Error(
        `Canvas request failed: ${response.status} ${response.statusText} (${url})`,
      );
    }

    const page = (await response.json()) as T[];
    results.push(...page);

    // Follow the Link header to the next page, if any.
    url = getNextPageUrl(response.headers.get("link"));
  }

  return results;
}

/**
 * Fetch the user's upcoming assignments across all active courses.
 *
 * 1. List the user's active courses.
 * 2. For each course, list its upcoming assignments (with submission info).
 * 3. Flatten everything into one array of CanvasAssignment.
 */
export async function getUpcomingAssignments(): Promise<CanvasAssignment[]> {
  const { baseUrl, token } = getConfig();

  // 1. Active courses for the current user.
  const courses = await paginate<CanvasCourse>(
    `${baseUrl}/users/self/courses?enrollment_state=active&per_page=100`,
    token,
  );

  const assignments: CanvasAssignment[] = [];

  // 2. Upcoming assignments per course. We do these one course at a time to
  //    keep the code simple and easy to follow.
  for (const course of courses) {
    const rawAssignments = await paginate<CanvasAssignmentRaw>(
      `${baseUrl}/courses/${course.id}/assignments?bucket=upcoming&include[]=submission&per_page=100`,
      token,
    );

    // 3. Map each raw assignment into our trimmed-down shape.
    for (const raw of rawAssignments) {
      const state = raw.submission?.workflow_state;
      assignments.push({
        id: raw.id,
        courseName: course.name,
        name: raw.name,
        description: raw.description ?? "",
        dueAt: raw.due_at,
        htmlUrl: raw.html_url,
        submitted: state === "submitted" || state === "graded",
      });
    }
  }

  return assignments;
}
