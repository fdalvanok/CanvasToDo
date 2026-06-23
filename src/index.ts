// index.ts
// Entry point for the pipeline. Eventually this will:
//   1. fetch upcoming Canvas assignments        (canvas.ts)
//   2. generate a study scaffold for each one    (draft.ts)
//   3. publish the scaffolds into Notion          (notion.ts)
//
// For now it fetches the upcoming Canvas assignments and prints them.
//
// Load environment variables from a local .env file when present. In GitHub
// Actions the secrets are provided as real environment variables, so dotenv
// simply finds nothing to load and that's fine.
import "dotenv/config";

import { getUpcomingAssignments } from "./canvas.js";

async function main(): Promise<void> {
  const assignments = await getUpcomingAssignments();

  for (const a of assignments) {
    console.log(
      `[${a.courseName}] ${a.name} — due ${a.dueAt} (submitted: ${a.submitted})`,
    );
  }
}

// Run main() and exit with a non-zero code if anything throws, so failures are
// obvious (especially in GitHub Actions logs).
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
