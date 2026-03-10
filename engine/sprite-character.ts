import type { IDisplay } from './display';
import type {
  ICharacter,
  CharacterDrawOptions,
  Hitbox,
  FrameSize,
  AnimationManifestEntry,
  SpriteSheetFrame,
} from './types';

interface LoadedAnimation {
  name: string;
  fps: number;
  frameCount: number;
  frames: SpriteSheetFrame[];
  image: HTMLImageElement;
  metadata?: AnimationManifestEntry['metadata'];
}

export class SpriteCharacter implements ICharacter {
  characterName: string;
  private animations = new Map<string, LoadedAnimation>();
  private currentAnim: string | null = null;
  private currentFrame = 0;
  private frameTimer = 0;
  private loop = true;
  private speed = 1;
  private _loaded = false;

  constructor(name: string) {
    this.characterName = name;
  }

  addAnimation(name: string, anim: LoadedAnimation): void {
    this.animations.set(name, anim);
    this._loaded = true;
  }

  play(animation: string, loop = true, _frameOffset = 0, options?: { speed?: number }): unknown {
    if (this.animations.has(animation)) {
      this.currentAnim = animation;
      this.currentFrame = 0;
      this.frameTimer = 0;
      this.loop = loop;
      this.speed = options?.speed ?? 1;
    }
    return null;
  }

  update(deltaTime: number): void {
    if (!this.currentAnim) return;
    const anim = this.animations.get(this.currentAnim);
    if (!anim || anim.frames.length === 0) return;

    const frameDuration = (1000 / anim.fps) / this.speed;
    this.frameTimer += deltaTime;

    while (this.frameTimer >= frameDuration) {
      this.frameTimer -= frameDuration;
      this.currentFrame++;
      if (this.currentFrame >= anim.frames.length) {
        this.currentFrame = this.loop ? 0 : anim.frames.length - 1;
      }
    }
  }

  draw(display: IDisplay, x: number, y: number, options?: CharacterDrawOptions): void {
    if (!this.currentAnim) return;
    const anim = this.animations.get(this.currentAnim);
    if (!anim || anim.frames.length === 0 || !anim.image.complete) return;

    const frame = anim.frames[this.currentFrame];
    if (!frame) return;

    const scale = options?.scale ?? (anim.metadata?.scale ?? 1);
    const alpha = options?.alpha ?? 1;
    const flipH = options?.flipH ?? false;

    const ctx = (display as unknown as { canvas: HTMLCanvasElement }).canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.globalAlpha = alpha;

    const drawW = frame.width * scale;
    const drawH = frame.height * scale;
    const drawX = flipH ? x + drawW : x;
    const drawY = y;

    if (flipH) {
      ctx.scale(-1, 1);
      ctx.drawImage(
        anim.image,
        frame.x, frame.y, frame.width, frame.height,
        -drawX, drawY, drawW, drawH
      );
    } else {
      ctx.drawImage(
        anim.image,
        frame.x, frame.y, frame.width, frame.height,
        drawX, drawY, drawW, drawH
      );
    }

    ctx.restore();
  }

  getCurrentAnimation(): string | null {
    return this.currentAnim;
  }

  isLoaded(): boolean {
    return this._loaded;
  }

  getHitbox(): Hitbox | null {
    if (!this.currentAnim) return null;
    const anim = this.animations.get(this.currentAnim);
    if (!anim?.metadata?.hitbox) return null;
    return { ...anim.metadata.hitbox };
  }

  getCurrentFrameSize(): FrameSize | null {
    if (!this.currentAnim) return null;
    const anim = this.animations.get(this.currentAnim);
    if (!anim?.metadata?.dimensions) return null;
    return { ...anim.metadata.dimensions };
  }
}
