# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup          # First-time setup: install deps, generate Prisma client, run migrations
npm run dev            # Start dev server with Turbopack (requires NODE_OPTIONS for node-compat)
npm run build          # Production build
npm run test           # Run all tests with Vitest
npx vitest run <file>  # Run a single test file
npm run lint           # ESLint
npm run db:reset       # Reset database (destructive)
```

`NODE_OPTIONS='--require ./node-compat.cjs'` is required for all Next.js commands — it's already embedded in the npm scripts, so always use them rather than calling `next` directly.

## Environment

- `ANTHROPIC_API_KEY` in `.env` — optional. Without it, the app uses a `MockLanguageModel` that returns static sample components (Counter, ContactForm, Card). With it, uses `claude-haiku-4-5`.

## Architecture

UIGen is a Next.js 15 (App Router) app where users describe React components in a chat, Claude generates them via an agentic loop with file-system tools, and the result renders in a sandboxed iframe — all without writing any files to disk.

### Core Data Flow

1. User sends a prompt → `/api/chat/route.ts`
2. Route calls Claude with two tools: `str_replace_editor` (create/edit files) and `file_manager` (rename/delete)
3. Claude iterates (up to 40 steps) writing files into a `VirtualFileSystem` (in-memory Map tree)
4. On stream completion, the serialized VFS state is saved to `Project.data` (JSON column in SQLite)
5. Client `FileSystemContext` applies tool calls to its own VFS instance
6. `PreviewFrame` picks up file changes, runs Babel (via `@babel/standalone`) to transform JSX, builds an import map pointing local files to blob URLs and third-party packages to `esm.sh`, then injects this into a sandboxed `<iframe>`

### Key Files

| File | Role |
|------|------|
| `src/app/api/chat/route.ts` | Chat endpoint — AI loop, tool execution, project save |
| `src/lib/file-system.ts` | `VirtualFileSystem` class — in-memory file tree |
| `src/lib/transform/jsx-transformer.ts` | Babel JSX transform + import map + blob URL generation |
| `src/lib/provider.ts` | Selects real vs. mock Claude model |
| `src/lib/prompts/generation.tsx` | System prompt sent to Claude |
| `src/lib/tools/str-replace.ts` | `str_replace_editor` tool definition |
| `src/lib/tools/file-manager.ts` | `file_manager` tool definition |
| `src/contexts/file-system-context.tsx` | Client-side VFS React context |
| `src/contexts/chat-context.tsx` | Chat state + Vercel AI SDK `useChat` |
| `src/components/PreviewFrame.tsx` | Sandboxed iframe preview |
| `src/lib/auth.ts` | JWT session (httpOnly cookie, 7-day expiry) |
| `src/actions/index.ts` | Server actions: signUp, signIn, signOut, getUser |

### Database

Schema is defined in `prisma/schema.prisma`. SQLite via Prisma. Two models:
- `User` — email + bcrypt password hash
- `Project` — belongs to optional User; stores chat history (`messages: String`) and VFS state (`data: String`) as JSON columns

### Authentication

JWT stored in an httpOnly cookie. `src/middleware.ts` protects `/api/projects` and `/api/filesystem`. Server actions in `src/actions/` handle auth mutations. Anonymous users get a sessionStorage-tracked experience; they're prompted to sign up to persist work.

## Code Style

Use comments sparingly. Only comment complex code.

### Testing

Vitest with jsdom. Tests live alongside source in `src/`. The `@/` path alias resolves to `src/`.
