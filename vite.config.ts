import { defineConfig, type Plugin } from 'vite';
import path from 'path';

/**
 * Vite plugin to fix type-only re-exports that esbuild strips.
 *
 * The game source was built for Makko Studio's TS pipeline, which
 * handles `export { SomeInterface } from './file'` differently than
 * esbuild (which strips type-only exports in isolation mode).
 * This plugin rewrites those barrel re-exports so type-only symbols
 * use `export type` syntax, preventing the runtime error:
 *   "does not provide an export named 'X'"
 */
function fixTypeReExports(): Plugin {
  return {
    name: 'fix-type-re-exports',
    enforce: 'pre',
    transform(code, id) {
      if (id.endsWith('src/ui/cryo-ui/index.ts')) {
        return code.replace(
          `export { ButtonBounds, CryoUIState, MODAL_WIDTH, MODAL_HEIGHT, PADDING, CARD_HEIGHT, CARD_MARGIN, ROLE_COLORS } from './types';`,
          `export type { ButtonBounds } from './types';\nexport { CryoUIState, MODAL_WIDTH, MODAL_HEIGHT, PADDING, CARD_HEIGHT, CARD_MARGIN, ROLE_COLORS } from './types';`
        );
      }
      if (id.endsWith('src/types/spacecraft.ts')) {
        return code.replace(
          `export { Room, RoomType };`,
          `export type { Room, RoomType };`
        );
      }
    },
  };
}

export default defineConfig({
  plugins: [fixTypeReExports()],
  resolve: {
    alias: {
      '@makko/engine': path.resolve(__dirname, 'engine/index.ts'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
