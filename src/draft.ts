// draft.ts
// Responsible for turning a Canvas assignment into a "study scaffold" — a
// short plan that helps break the work into manageable steps — using the
// Anthropic SDK.
//
// Configuration comes from environment variables (see .env.example):
//   ANTHROPIC_API_KEY  an Anthropic API key
//
// This is a stub for now — the real model call will be filled in later.

import type { CanvasAssignment } from "./canvas.js";

/** The generated study plan for a single assignment. */
export interface StudyScaffold {
  /** The assignment this scaffold was generated for. */
  assignment: CanvasAssignment;
  /** Markdown text containing the suggested steps / study plan. */
  plan: string;
}

/**
 * Generate a study scaffold for one assignment using the Anthropic SDK.
 *
 * TODO: construct an Anthropic client (it reads ANTHROPIC_API_KEY from the
 * environment automatically) and ask the model — defaulting to
 * "claude-opus-4-8" — to produce a short, actionable study plan.
 */
export async function generateStudyScaffold(
  assignment: CanvasAssignment,
): Promise<StudyScaffold> {
  console.log(`draft: generateStudyScaffold placeholder for "${assignment.name}"`);
  return { assignment, plan: "" };
}
