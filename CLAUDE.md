# CanvasToDo

## Goal

Fetch upcoming Canvas assignments, generate a study scaffold for each one with
the Anthropic SDK, and publish them into a Notion database. The aim is to turn
a list of due dates into actionable, broken-down study plans that live where
the user already organizes their work (Notion).

## Stack

- **Node + TypeScript**, run with [`tsx`](https://github.com/privatenumber/tsx)
  (`npm start` runs `tsx src/index.ts`). No build step — `tsx` runs the
  TypeScript directly.
- ESM modules (`"type": "module"` in `package.json`). Note the `.js` import
  specifiers in TypeScript files — that's required for native ESM resolution.
- Configuration is read entirely from **environment variables**. Locally,
  `dotenv` loads them from a `.env` file; see `.env.example` for the full list.

### Dependencies

- `@anthropic-ai/sdk` — generate study scaffolds. Default to the latest model,
  `claude-opus-4-8`.
- `@notionhq/client` — create pages in the Notion database.
- `dotenv` — load `.env` locally.

## Layout

- `src/canvas.ts` — fetches upcoming assignments from the Canvas REST API.
- `src/draft.ts` — turns an assignment into a study scaffold via the Anthropic SDK.
- `src/notion.ts` — publishes scaffolds into the Notion database.
- `src/index.ts` — orchestrates the pipeline (canvas → draft → notion).

These are currently stubs; the pipeline wiring will be filled in by later tasks.

## Required environment variables

| Variable             | Purpose                                        |
| -------------------- | ---------------------------------------------- |
| `CANVAS_BASE_URL`    | Base URL of the Canvas instance                |
| `CANVAS_TOKEN`       | Canvas API access token                        |
| `ANTHROPIC_API_KEY`  | Anthropic API key                              |
| `NOTION_TOKEN`       | Notion integration token                       |
| `NOTION_DATABASE_ID` | Target Notion database for generated scaffolds |

## Where this runs

This code is designed to **run in GitHub Actions** (see
`.github/workflows/run.yml`), where the secrets above are provided as
environment variables. It is **not** intended to run inside the Claude Code
sandbox: do not assume the sandbox can reach Canvas, Anthropic, or Notion, or
that it has access to the secrets. When developing here, expect to write and
type-check code without making live API calls.

## Notes for contributors

The author is a beginner. Please write clear, well-commented code, prefer
straightforward solutions over clever ones, and explain any non-obvious
choices in pull request descriptions.
