# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Sector Scavengers: Signal & Salvage is a browser-based idle/strategy game built with TypeScript and rendered on HTML5 Canvas. It was originally created in Makko AI Studio, which provides a proprietary `@makko/engine` runtime. A local engine stub (`engine/`) replaces the proprietary engine for local development.

### Development commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` (Vite on port 5173) |
| Type check / lint | `npm run typecheck` |
| Production build | `npm run build` |

### Key caveats

- **`@makko/engine` is a local stub** (`engine/` directory). It is NOT the real Makko AI Studio engine. Sprite sheet frame data loads from `api.makko.ai` at runtime; if that CDN is down, the game falls back to procedural rendering (colored shapes).
- **Type re-exports**: The `vite.config.ts` includes a `fixTypeReExports` plugin that rewrites two type-only barrel re-exports (`ButtonBounds` in `src/ui/cryo-ui/index.ts` and `Room`/`RoomType` in `src/types/spacecraft.ts`) so esbuild doesn't strip them. If you add new type-only re-exports via barrel files and get "does not provide an export named" errors at runtime, add them to this plugin.
- **`tsconfig.json` uses `strict: false`** because the original source was written for Makko Studio's less-strict TS compilation. Enabling strict mode surfaces ~15 pre-existing type errors in the game source.
- **PlayFun SDK**: In localhost/preview environments the game auto-creates a mock PlayFun SDK, so blockchain features work in offline mode. No secrets are needed.
- **No automated tests**: The repository has no test framework or test files. Type checking (`npm run typecheck`) is the only automated validation.
- **Assets are remote**: All sprites and backgrounds load from `https://api.makko.ai`. The Content-Security-Policy in `index.html` allows this. No local asset downloads are needed.
