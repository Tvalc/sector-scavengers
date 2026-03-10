import type { DrawStyle, TextStyle, ImageStyle } from './types';

export interface IDisplay {
  width: number;
  height: number;
  canvas: HTMLCanvasElement;

  setImageSmoothing(enabled: boolean): void;
  fitToWindow(preserveAspectRatio: boolean): void;
  setAutoFit(mode: string): void;
  setCursor(cursor: string): void;
  clear(color?: string): void;

  beginFrame(): void;
  endFrame(): void;

  drawRect(x: number, y: number, w: number, h: number, style?: DrawStyle): void;
  drawRoundRect(x: number, y: number, w: number, h: number, radius: number, style?: DrawStyle): void;
  drawCircle(x: number, y: number, radius: number, style?: DrawStyle): void;
  drawEllipse(x: number, y: number, rx: number, ry: number, style?: DrawStyle): void;
  drawLine(x1: number, y1: number, x2: number, y2: number, style?: DrawStyle): void;
  drawPolygon(points: Array<{ x: number; y: number }>, style?: DrawStyle): void;
  drawText(text: string, x: number, y: number, style?: TextStyle): void;
  drawImage(image: HTMLImageElement, x: number, y: number, width?: number, height?: number, style?: ImageStyle): void;
  measureText(text: string, style?: { font?: string }): { width: number };

  pushClipRect(x: number, y: number, w: number, h: number): void;
  pushClipCircle(cx: number, cy: number, r: number): void;
  popClip(): void;

  setGlobalOffset(x: number, y: number): void;

  requestFullscreen(): Promise<void>;
  exitFullscreen(): Promise<void>;
  onFullscreenChange: ((fullscreen: boolean) => void) | null;
}

export class Canvas2DDisplay implements IDisplay {
  canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private _width: number;
  private _height: number;
  private autoFitMode: string | null = null;
  private offsetX = 0;
  private offsetY = 0;
  onFullscreenChange: ((fullscreen: boolean) => void) | null = null;

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this._width = width;
    this._height = height;
    canvas.width = width;
    canvas.height = height;
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  setImageSmoothing(enabled: boolean): void {
    this.ctx.imageSmoothingEnabled = enabled;
  }

  fitToWindow(_preserveAspectRatio: boolean): void {
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
  }

  setAutoFit(mode: string): void {
    this.autoFitMode = mode;
    if (mode === 'window') {
      const resize = () => {
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
      };
      window.addEventListener('resize', resize);
      resize();
    }
  }

  setCursor(cursor: string): void {
    this.canvas.style.cursor = cursor;
  }

  clear(color?: string): void {
    if (color) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(0, 0, this._width, this._height);
    } else {
      this.ctx.clearRect(0, 0, this._width, this._height);
    }
  }

  beginFrame(): void {
    this.ctx.save();
  }

  endFrame(): void {
    this.ctx.restore();
  }

  setGlobalOffset(x: number, y: number): void {
    this.offsetX = x;
    this.offsetY = y;
  }

  private applyStyle(style?: DrawStyle): void {
    if (!style) return;
    if (style.alpha !== undefined) {
      this.ctx.globalAlpha = style.alpha;
    }
  }

  private resetAlpha(): void {
    this.ctx.globalAlpha = 1;
  }

  drawRect(x: number, y: number, w: number, h: number, style?: DrawStyle): void {
    this.ctx.save();
    this.applyStyle(style);
    if (style?.fill) {
      this.ctx.fillStyle = style.fill;
      this.ctx.fillRect(x + this.offsetX, y + this.offsetY, w, h);
    }
    if (style?.stroke) {
      this.ctx.strokeStyle = style.stroke;
      this.ctx.lineWidth = style?.lineWidth ?? 1;
      this.ctx.strokeRect(x + this.offsetX, y + this.offsetY, w, h);
    }
    this.ctx.restore();
  }

  drawRoundRect(x: number, y: number, w: number, h: number, radius: number, style?: DrawStyle): void {
    this.ctx.save();
    this.applyStyle(style);
    const ox = x + this.offsetX;
    const oy = y + this.offsetY;
    this.ctx.beginPath();
    this.ctx.roundRect(ox, oy, w, h, radius);
    if (style?.fill) {
      this.ctx.fillStyle = style.fill;
      this.ctx.fill();
    }
    if (style?.stroke) {
      this.ctx.strokeStyle = style.stroke;
      this.ctx.lineWidth = style?.lineWidth ?? 1;
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawCircle(x: number, y: number, radius: number, style?: DrawStyle): void {
    this.ctx.save();
    this.applyStyle(style);
    this.ctx.beginPath();
    this.ctx.arc(x + this.offsetX, y + this.offsetY, radius, 0, Math.PI * 2);
    if (style?.fill) {
      this.ctx.fillStyle = style.fill;
      this.ctx.fill();
    }
    if (style?.stroke) {
      this.ctx.strokeStyle = style.stroke;
      this.ctx.lineWidth = style?.lineWidth ?? 1;
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawEllipse(x: number, y: number, rx: number, ry: number, style?: DrawStyle): void {
    this.ctx.save();
    this.applyStyle(style);
    this.ctx.beginPath();
    this.ctx.ellipse(x + this.offsetX, y + this.offsetY, rx, ry, 0, 0, Math.PI * 2);
    if (style?.fill) {
      this.ctx.fillStyle = style.fill;
      this.ctx.fill();
    }
    if (style?.stroke) {
      this.ctx.strokeStyle = style.stroke;
      this.ctx.lineWidth = style?.lineWidth ?? 1;
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawLine(x1: number, y1: number, x2: number, y2: number, style?: DrawStyle): void {
    this.ctx.save();
    this.applyStyle(style);
    this.ctx.beginPath();
    this.ctx.moveTo(x1 + this.offsetX, y1 + this.offsetY);
    this.ctx.lineTo(x2 + this.offsetX, y2 + this.offsetY);
    this.ctx.strokeStyle = style?.stroke ?? '#ffffff';
    this.ctx.lineWidth = style?.lineWidth ?? 1;
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawPolygon(points: Array<{ x: number; y: number }>, style?: DrawStyle): void {
    if (points.length < 2) return;
    this.ctx.save();
    this.applyStyle(style);
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x + this.offsetX, points[0].y + this.offsetY);
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x + this.offsetX, points[i].y + this.offsetY);
    }
    this.ctx.closePath();
    if (style?.fill) {
      this.ctx.fillStyle = style.fill;
      this.ctx.fill();
    }
    if (style?.stroke) {
      this.ctx.strokeStyle = style.stroke;
      this.ctx.lineWidth = style?.lineWidth ?? 1;
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawText(text: string, x: number, y: number, style?: TextStyle): void {
    this.ctx.save();
    if (style?.alpha !== undefined) {
      this.ctx.globalAlpha = style.alpha;
    }
    this.ctx.font = style?.font ?? '16px monospace';
    this.ctx.fillStyle = style?.fill ?? '#ffffff';
    this.ctx.textAlign = style?.align ?? 'left';
    this.ctx.textBaseline = style?.baseline ?? 'alphabetic';
    this.ctx.fillText(text, x + this.offsetX, y + this.offsetY);
    this.ctx.restore();
  }

  drawImage(image: HTMLImageElement, x: number, y: number, width?: number, height?: number, style?: ImageStyle): void {
    this.ctx.save();
    if (style?.alpha !== undefined) {
      this.ctx.globalAlpha = style.alpha;
    }
    const w = width ?? image.naturalWidth;
    const h = height ?? image.naturalHeight;

    if (style?.flipH || style?.flipV || style?.rotation) {
      const cx = x + this.offsetX + w / 2;
      const cy = y + this.offsetY + h / 2;
      this.ctx.translate(cx, cy);
      if (style?.rotation) this.ctx.rotate(style.rotation);
      if (style?.flipH) this.ctx.scale(-1, 1);
      if (style?.flipV) this.ctx.scale(1, -1);
      this.ctx.drawImage(image, -w / 2, -h / 2, w, h);
    } else {
      this.ctx.drawImage(image, x + this.offsetX, y + this.offsetY, w, h);
    }
    this.ctx.restore();
  }

  measureText(text: string, style?: { font?: string }): { width: number } {
    this.ctx.save();
    this.ctx.font = style?.font ?? '16px monospace';
    const metrics = this.ctx.measureText(text);
    this.ctx.restore();
    return { width: metrics.width };
  }

  pushClipRect(x: number, y: number, w: number, h: number): void {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(x + this.offsetX, y + this.offsetY, w, h);
    this.ctx.clip();
  }

  pushClipCircle(cx: number, cy: number, r: number): void {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(cx + this.offsetX, cy + this.offsetY, r, 0, Math.PI * 2);
    this.ctx.clip();
  }

  popClip(): void {
    this.ctx.restore();
  }

  async requestFullscreen(): Promise<void> {
    try {
      await this.canvas.requestFullscreen();
      this.onFullscreenChange?.(true);
    } catch {
      // Fullscreen not supported or denied
    }
  }

  async exitFullscreen(): Promise<void> {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      this.onFullscreenChange?.(false);
    } catch {
      // Ignore
    }
  }
}
