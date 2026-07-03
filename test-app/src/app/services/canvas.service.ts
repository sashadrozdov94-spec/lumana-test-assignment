import { Injectable, ElementRef } from '@angular/core';
import { Observable, fromEvent, of, Subject } from 'rxjs';
import { map, switchMap, takeUntil, tap, filter } from 'rxjs/operators';
import { CanvasState, RECTANGLE_COLOR } from '../interfaces/canvas.enum';
import { Figure } from '../classes/figure.class';
import { Vector, ChangedCanvasCharacter } from '../interfaces/canvas.interface';

@Injectable({
  providedIn: 'root'
})
export class CanvasService {
  private canvasEl!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private figures: Figure[] = [];
  private activeFigure: Figure | null = null;
  private tempPoints: Vector[] = [];
  private currentMode: CanvasState = CanvasState.idle;
  private currentColor: string = RECTANGLE_COLOR.red;
  private readonly CLOSING_RADIUS = 15;
  private destroy$ = new Subject<void>();

  public readonly figureSelected$ = new Subject<string>();

  public setCanvasElement(canvasRef: ElementRef<HTMLCanvasElement>): void {
    this.canvasEl = canvasRef.nativeElement;
    this.ctx = this.canvasEl.getContext('2d') as CanvasRenderingContext2D;
  }

  public setDimensions(width: number, height: number): void {
    if (this.canvasEl) {
      this.canvasEl.width = width;
      this.canvasEl.height = height;
    }
  }

  public setBackground(url: string): void {
    if (this.canvasEl) {
      this.canvasEl.style.backgroundImage = `url('${url}')`;
      this.canvasEl.style.backgroundSize = 'contain';
      this.canvasEl.style.backgroundRepeat = 'no-repeat';
    }
  }

  public setColor(color: string): void {
    this.currentColor = color;
    if (this.activeFigure) {
      this.activeFigure.fillColor = color;
      this.redrawCanvas();
    }
  }

  public loadFigures(canvasData: ChangedCanvasCharacter[], charId: number): void {
    const charData = canvasData.find(c => c.characterId === charId);
    if (charData?.canvas) {
      this.figures = charData.canvas.map(f => new Figure(f.vertices, f.rotation, f.fillColor));
      this.redrawCanvas();
    } else {
        this.figures = [];
        this.redrawCanvas();
    }
  }

  public getFigures(): any[] {
      return this.figures.map(({ vertices, rotation, fillColor }) => ({ vertices, rotation, fillColor }));
  }

  public reset(): void {
    this.figures = [];
    this.tempPoints = [];
    this.activeFigure = null;
    this.redrawCanvas();
  }

  public destroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
  }

  public initInteractions(): void {
    const mouseDown$ = fromEvent<MouseEvent>(this.canvasEl, 'mousedown');
    const mouseMove$ = fromEvent<MouseEvent>(document, 'mousemove');
    const mouseUp$ = fromEvent<MouseEvent>(document, 'mouseup');

    mouseMove$.pipe(
      takeUntil(this.destroy$),
      filter(() => this.currentMode !== CanvasState.drag)
    ).subscribe(e => this.updateCursorStyle(e));

    mouseDown$.pipe(
      takeUntil(this.destroy$),
      map(e => this.getPointerPos(e)),
      switchMap(startPos => {
        const action = this.determineAction(startPos);

        switch (action) {
          case 'rotate':
            return this.handleRotation(startPos, mouseMove$, mouseUp$);
          case 'move':
            return this.handleMovement(startPos, mouseMove$, mouseUp$);
          case 'draw':
            return this.handleDrawing(startPos, mouseMove$);
          default:
            this.deselectAll();
            return of(null);
        }
      })
    ).subscribe();
  }

  private handleMovement(startPos: Vector, move$: Observable<MouseEvent>, up$: Observable<MouseEvent>) {
    this.setMode(CanvasState.drag, 'grabbing');
    let lastPos = startPos;

    return move$.pipe(
      map((e: MouseEvent) => this.getPointerPos(e)),
      tap((currPos: Vector) => {
        if (this.activeFigure) {
          const dx = currPos.x - lastPos.x;
          const dy = currPos.y - lastPos.y;
          this.activeFigure.translate(dx, dy);
          this.redrawCanvas();
          lastPos = currPos;
        }
      }),
      takeUntil(up$.pipe(tap(() => this.setMode(CanvasState.idle, 'grab'))))
    );
  }

  private handleRotation(startPos: Vector, move$: Observable<MouseEvent>, up$: Observable<MouseEvent>) {
    this.setMode(CanvasState.drag, 'move');

    return move$.pipe(
      map((e: MouseEvent) => this.getPointerPos(e)),
      tap((currPos: Vector) => {
         if (this.activeFigure) {
           this.activeFigure.rotation = this.activeFigure.getAngleForRotation(currPos.x, currPos.y);
           this.redrawCanvas();
         }
      }),
      takeUntil(up$.pipe(tap(() => this.setMode(CanvasState.idle, 'default'))))
    );
  }

  private handleDrawing(pos: Vector, move$: Observable<MouseEvent>) {
    if (this.currentMode !== CanvasState.drawing) {
        this.setMode(CanvasState.drawing, 'crosshair');
        this.tempPoints = [pos];

        return move$.pipe(
             takeUntil(fromEvent(this.canvasEl, 'mousedown')),
             tap((e: MouseEvent) => this.drawPreview(this.getPointerPos(e)))
        );
    }

    if (this.shouldCloseShape(pos)) {
        this.finalizeShape();
        return of(null);
    } else {
        this.tempPoints.push(pos);
        this.drawPreview(pos);

        return move$.pipe(
             takeUntil(fromEvent(this.canvasEl, 'mousedown')),
             tap((e: MouseEvent) => this.drawPreview(this.getPointerPos(e)))
        );
    }
  }

  private determineAction(pos: Vector): 'rotate' | 'move' | 'draw' | 'idle' {
    const rotateTarget = this.figures.find(f => f.isPointerNearRotationHandle(this.ctx, pos.x, pos.y));
    if (rotateTarget) {
      this.activeFigure = rotateTarget;
      this.figureSelected$.next(rotateTarget.fillColor);
      return 'rotate';
    }

    const moveTarget = this.figures.find(f => f.isPointerOver(this.ctx, pos.x, pos.y));
    if (moveTarget) {
      this.activeFigure = moveTarget;
      this.figureSelected$.next(moveTarget.fillColor);
      return 'move';
    }

    return (this.currentMode === CanvasState.drawing || this.currentMode === CanvasState.idle)
           ? 'draw' : 'idle';
  }

  private shouldCloseShape(pos: Vector): boolean {
    if (this.tempPoints.length < 3) return false;
    const start = this.tempPoints[0];
    const dist = Math.hypot(pos.x - start.x, pos.y - start.y);
    return dist <= this.CLOSING_RADIUS;
  }

  private finalizeShape(): void {
    const newFigure = new Figure([...this.tempPoints], 0, this.currentColor);
    this.figures.push(newFigure);
    this.activeFigure = newFigure;
    this.tempPoints = [];
    this.setMode(CanvasState.idle, 'default');
    this.redrawCanvas();
  }

  private drawPreview(cursorPos: Vector): void {
    this.redrawCanvas();
    this.drawPolyline(this.tempPoints, this.currentColor, cursorPos);
  }

  private redrawCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
    this.figures.forEach(f => f.render(this.ctx));
    if (this.activeFigure) this.activeFigure.drawSelectionFrame(this.ctx);
  }

  private drawPolyline(points: Vector[], color: string, nextPoint?: Vector): void {
    this.ctx.beginPath();
    this.ctx.strokeStyle = `rgba(${color}, 1)`;
    this.ctx.lineWidth = 2;

    if (points.length > 0) {
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) this.ctx.lineTo(points[i].x, points[i].y);
    }

    if (nextPoint && points.length > 0) {
        this.ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
        this.ctx.lineTo(nextPoint.x, nextPoint.y);
    }
    this.ctx.stroke();
  }

  private updateCursorStyle(e: MouseEvent): void {
    const { x, y } = this.getPointerPos(e);
    let cursor = 'default';

    if (this.figures.some(f => f.isPointerNearRotationHandle(this.ctx, x, y))) cursor = 'move';
    else if (this.figures.some(f => f.isPointerOver(this.ctx, x, y))) cursor = 'grab';
    else if (this.currentMode === CanvasState.drawing) cursor = 'crosshair';

    if (this.canvasEl.style.cursor !== cursor) this.canvasEl.style.cursor = cursor;
  }

  private getPointerPos(e: MouseEvent): Vector {
    const rect = this.canvasEl.getBoundingClientRect();
    const scaleX = this.canvasEl.width / rect.width;
    const scaleY = this.canvasEl.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  private setMode(mode: CanvasState, cursor: string): void {
    this.currentMode = mode;
    this.canvasEl.style.cursor = cursor;
  }

  private deselectAll(): void {
    this.activeFigure = null;
    this.redrawCanvas();
  }
}
