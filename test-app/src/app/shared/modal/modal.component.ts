import { AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, OnInit, OnDestroy, signal, viewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { throttleTime, startWith } from 'rxjs/operators';
import * as CharacterSelectors from '../../store/character.selector';
import * as CharacterActions from '../../store/characters.actions';
import { ChangedCanvasCharacter } from '../../interfaces/canvas.interface';
import { RECTANGLE_COLOR } from '../../interfaces/canvas.enum';
import { CanvasService } from '../../services/canvas.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CanvasService]
})
export class ModalComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly destroyRef = inject(DestroyRef);
  private readonly canvasService = inject(CanvasService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly DESIGN_DIMENSIONS = { width: 1200, height: 850 };

  public activeCharacter = this.store.selectSignal(CharacterSelectors.selectSelectedCharacter);
  public scaleFactor = signal<number>(1);

  protected readonly colorPalette = RECTANGLE_COLOR;
  protected colorControl = new FormControl(this.colorPalette.red);

  private savedCanvasData: ChangedCanvasCharacter[] = [];
  private canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  ngOnInit(): void {
    this.subscribeToStoreUpdates();

    this.colorControl.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(color => {
            if (color) this.canvasService.setColor(color);
        });

    this.canvasService.figureSelected$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(color => {
            this.colorControl.setValue(color, { emitEvent: false });
            this.cdr.markForCheck();
        });
  }

  ngAfterViewInit(): void {
    if (this.activeCharacter()) {
        this.initCanvasEnvironment();
    }
  }

  ngOnDestroy(): void {
      this.canvasService.destroy();
  }

  private subscribeToStoreUpdates(): void {
    this.store.select(CharacterSelectors.selectChangedCharacters)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => this.savedCanvasData = [...data]);
  }

  private initCanvasEnvironment(): void {
    const char = this.activeCharacter();
    if (!char) return;

    this.canvasService.setCanvasElement(this.canvasRef());

    const bgImage = new Image();
    bgImage.src = char.image;

    bgImage.onload = () => {
      this.canvasService.setDimensions(bgImage.naturalWidth, bgImage.naturalHeight);
      this.canvasService.setBackground(bgImage.src);
      this.canvasService.loadFigures(this.savedCanvasData, char.id);
      this.canvasService.initInteractions();
    };

    fromEvent(window, 'resize')
      .pipe(startWith(null), throttleTime(100), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.recalculateScale());
  }

  private recalculateScale(): void {
    const { innerWidth, innerHeight } = window;
    const scaleX = (innerWidth * 0.95) / this.DESIGN_DIMENSIONS.width;
    const scaleY = (innerHeight * 0.95) / this.DESIGN_DIMENSIONS.height;
    this.scaleFactor.set(Math.min(scaleX, scaleY));
  }

  public saveAndClose(): void {
    const charId = this.activeCharacter()?.id;
    if (!charId) return;

    const currentFigures = this.canvasService.getFigures();

    const snapshot: ChangedCanvasCharacter = {
        characterId: charId,
        canvas: currentFigures
    };

    const updatedList = this.savedCanvasData.some(c => c.characterId === charId)
        ? this.savedCanvasData.map(c => c.characterId === charId ? snapshot : c)
        : [...this.savedCanvasData, snapshot];

    this.store.dispatch(CharacterActions.updateChangedCharacters({ changedCharacters: updatedList }));
    this.close();
  }

  public resetCanvas(): void {
    this.canvasService.reset();
  }

  public close(): void {
    this.store.dispatch(CharacterActions.clearSelection());
  }
}
