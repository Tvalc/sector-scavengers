import type { IDisplay } from './display';

export interface DrawStyle {
  fill?: string;
  stroke?: string;
  lineWidth?: number;
  alpha?: number;
}

export interface TextStyle {
  font?: string;
  fill?: string;
  align?: 'left' | 'center' | 'right';
  baseline?: 'top' | 'middle' | 'bottom' | 'alphabetic';
  alpha?: number;
}

export interface ImageStyle {
  scale?: number;
  flipH?: boolean;
  flipV?: boolean;
  rotation?: number;
  alpha?: number;
}

export interface CharacterDrawOptions {
  scale?: number;
  flipH?: boolean;
  flipV?: boolean;
  alpha?: number;
  debug?: boolean;
}

export interface Hitbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FrameSize {
  width: number;
  height: number;
}

export interface ICharacter {
  characterName: string;
  play(animation: string, loop?: boolean, frameOffset?: number, options?: { speed?: number }): unknown;
  update(deltaTime: number): void;
  draw(display: IDisplay, x: number, y: number, options?: CharacterDrawOptions): void;
  getCurrentAnimation(): string | null;
  isLoaded(): boolean;
  getHitbox(): Hitbox | null;
  getCurrentFrameSize(): FrameSize | null;
}

export type Character = ICharacter;

export interface StaticAsset {
  image: HTMLImageElement;
  width: number;
  height: number;
  name: string;
}

export interface SpriteSheetFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpriteSheetData {
  frames: SpriteSheetFrame[];
  image: HTMLImageElement;
}

export interface AnimationManifestEntry {
  fps: number;
  json: string;
  image: string;
  priority: string;
  frameCount: number;
  spriteSheetId: string;
  animationLength: number;
  metadata?: {
    anchor?: {
      x: number;
      y: number;
      strategy: string;
      normalized?: { x: number; y: number };
    };
    hitbox?: { x: number; y: number; width: number; height: number };
    scale?: number;
    dimensions?: { width: number; height: number };
  };
}

export interface CharacterManifestEntry {
  animations: Record<string, AnimationManifestEntry>;
  metadata?: { character_id?: string };
}

export interface SpriteManifest {
  version: string;
  characters: Record<string, CharacterManifestEntry>;
}

export interface StaticAssetManifest {
  version: string;
  assets: Record<string, { url: string; width: number; height: number }>;
}

export interface EngineInitOptions {
  manifests: string[];
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  renderer: string;
}
