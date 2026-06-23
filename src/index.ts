// index.ts
// Entry point for the pipeline. Eventually this will:
//   1. fetch upcoming Canvas assignments        (canvas.ts)
//   2. generate a study scaffold for each one    (draft.ts)
//   3. publish the scaffolds into Notion          (notion.ts)
//
// Load environment variables from a local .env file when present. In GitHub
// Actions the secrets are provided as real environment variables, so dotenv
// simply finds nothing to load and that's fine.
import "dotenv/config";

console.log("pipeline placeholder");
