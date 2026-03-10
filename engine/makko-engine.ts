import { Canvas2DDisplay, type IDisplay } from './display';
import { InputManager } from './input';
import { SpriteCharacter } from './sprite-character';
import type {
  EngineInitOptions,
  StaticAsset,
  ICharacter,
  SpriteManifest,
  SpriteSheetFrame,
} from './types';

class MakkoEngineImpl {
  private _display!: Canvas2DDisplay;
  private _input = new InputManager();
  private characters = new Map<string, SpriteCharacter>();
  private staticAssets = new Map<string, StaticAsset>();
  private initialized = false;

  get display(): IDisplay {
    return this._display;
  }

  get input(): InputManager {
    return this._input;
  }

  async initEngine(options: EngineInitOptions): Promise<void> {
    const { canvas, width, height, manifests } = options;

    this._display = new Canvas2DDisplay(canvas, width, height);
    this._input.init(canvas, width, height);
    this.initialized = true;

    for (const manifestUrl of manifests) {
      try {
        const resp = await fetch(manifestUrl);
        const data = await resp.json();

        if (data.characters) {
          await this.loadSpriteManifest(data as SpriteManifest);
        }
        if (data.assets) {
          await this.loadStaticAssetManifest(data);
        }
      } catch (err) {
        console.warn(`[MakkoEngine] Failed to load manifest: ${manifestUrl}`, err);
      }
    }

    console.log(
      `[MakkoEngine] Initialized: ${this.characters.size} characters, ${this.staticAssets.size} static assets`
    );
  }

  private async loadSpriteManifest(manifest: SpriteManifest): Promise<void> {
    for (const [charName, charData] of Object.entries(manifest.characters)) {
      const character = new SpriteCharacter(charName);

      for (const [animName, animData] of Object.entries(charData.animations)) {
        try {
          const image = await this.loadImage(animData.image);

          let frames: SpriteSheetFrame[] = [];
          try {
            const jsonResp = await fetch(animData.json);
            const jsonData = await jsonResp.json();
            if (Array.isArray(jsonData.frames)) {
              frames = jsonData.frames.map((f: Record<string, unknown>) => ({
                x: (f.frame as Record<string, number>)?.x ?? f.x ?? 0,
                y: (f.frame as Record<string, number>)?.y ?? f.y ?? 0,
                width: (f.frame as Record<string, number>)?.w ?? f.width ?? (animData.metadata?.dimensions?.width ?? 100),
                height: (f.frame as Record<string, number>)?.h ?? f.height ?? (animData.metadata?.dimensions?.height ?? 100),
              }));
            }
          } catch {
            const dim = animData.metadata?.dimensions;
            if (dim) {
              const cols = Math.ceil(Math.sqrt(animData.frameCount));
              for (let i = 0; i < animData.frameCount; i++) {
                frames.push({
                  x: (i % cols) * dim.width,
                  y: Math.floor(i / cols) * dim.height,
                  width: dim.width,
                  height: dim.height,
                });
              }
            }
          }

          character.addAnimation(animName, {
            name: animName,
            fps: animData.fps,
            frameCount: animData.frameCount,
            frames,
            image,
            metadata: animData.metadata,
          });
        } catch {
          console.warn(`[MakkoEngine] Failed to load animation: ${animName}`);
        }
      }

      this.characters.set(charName, character);
    }
  }

  private async loadStaticAssetManifest(manifest: { assets: Record<string, { url: string; name?: string; asset_type?: string; width?: number; height?: number; metadata?: { width?: number; height?: number } }> }): Promise<void> {
    for (const [key, assetData] of Object.entries(manifest.assets)) {
      try {
        const image = await this.loadImage(assetData.url);
        const w = assetData.metadata?.width ?? assetData.width ?? image.naturalWidth;
        const h = assetData.metadata?.height ?? assetData.height ?? image.naturalHeight;
        this.staticAssets.set(key, {
          image,
          width: w,
          height: h,
          name: assetData.name ?? key,
        });
      } catch {
        console.warn(`[MakkoEngine] Failed to load static asset: ${key}`);
      }
    }
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  sprite(name: string): ICharacter | null {
    return this.characters.get(name) ?? null;
  }

  staticAsset(name: string): StaticAsset | null {
    return this.staticAssets.get(name) ?? null;
  }

  hasStaticAsset(name: string): boolean {
    return this.staticAssets.has(name);
  }

  isCharacterLoaded(name: string): boolean {
    const char = this.characters.get(name);
    return char?.isLoaded() ?? false;
  }

  getLoadedCharacters(): string[] {
    const result: string[] = [];
    for (const [name, char] of this.characters) {
      if (char.isLoaded()) {
        result.push(name);
      }
    }
    return result;
  }
}

export const MakkoEngine = new MakkoEngineImpl();
