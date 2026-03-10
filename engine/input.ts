export class InputManager {
  private keysDown = new Set<string>();
  private keysPressed = new Set<string>();
  private mouseButtons = new Set<number>();
  private mouseButtonsPressed = new Set<number>();
  private _mouseX = 0;
  private _mouseY = 0;
  private canvas: HTMLCanvasElement | null = null;
  private capturedKeys = new Set<string>();

  get mouseX(): number {
    return this._mouseX;
  }

  get mouseY(): number {
    return this._mouseY;
  }

  init(canvas: HTMLCanvasElement, gameWidth: number, gameHeight: number): void {
    this.canvas = canvas;

    window.addEventListener('keydown', (e) => {
      if (this.capturedKeys.has(e.code)) {
        e.preventDefault();
      }
      if (!this.keysDown.has(e.code)) {
        this.keysPressed.add(e.code);
      }
      this.keysDown.add(e.code);
    });

    window.addEventListener('keyup', (e) => {
      this.keysDown.delete(e.code);
    });

    canvas.addEventListener('mousedown', (e) => {
      if (!this.mouseButtons.has(e.button)) {
        this.mouseButtonsPressed.add(e.button);
      }
      this.mouseButtons.add(e.button);
    });

    canvas.addEventListener('mouseup', (e) => {
      this.mouseButtons.delete(e.button);
    });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      this._mouseX = ((e.clientX - rect.left) / rect.width) * gameWidth;
      this._mouseY = ((e.clientY - rect.top) / rect.height) * gameHeight;
    });

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  capture(keys: string[]): void {
    for (const key of keys) {
      this.capturedKeys.add(key);
    }
  }

  isKeyDown(key: string): boolean {
    return this.keysDown.has(key);
  }

  isKeyPressed(key: string): boolean {
    return this.keysPressed.has(key);
  }

  isMouseDown(button?: number): boolean {
    if (button === undefined) {
      return this.mouseButtons.size > 0;
    }
    return this.mouseButtons.has(button);
  }

  isMousePressed(button: number): boolean {
    return this.mouseButtonsPressed.has(button);
  }

  endFrame(): void {
    this.keysPressed.clear();
    this.mouseButtonsPressed.clear();
  }
}
