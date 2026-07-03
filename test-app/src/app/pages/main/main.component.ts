import { Component, OnInit, inject, viewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { ScrollingModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CharacterComponent } from "../../shared/character/character.component";
import { SearchBarComponent } from '../../shared/search-bar/search-bar.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { ICharacter } from '../../interfaces/character.interface';
import * as CharacterSelectors from '../../store/character.selector';
import * as CharacterActions from '../../store/characters.actions';
import { ApiService } from '../../services/api.service';

@Component({
  standalone: true,
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  imports: [
    CommonModule,
    CharacterComponent,
    SearchBarComponent,
    MatProgressSpinnerModule,
    ScrollingModule,
    ModalComponent
  ]
})
export class MainComponent implements OnInit {
  // Dependency injection using the modern inject() function
  private readonly store = inject(Store);
  private readonly apiService = inject(ApiService);

  // Gets a reference to the virtual scroll container in the template
  private readonly viewport = viewChild(CdkVirtualScrollViewport);

  // Reactive state connections using Angular Signals
  public characters = this.store.selectSignal(CharacterSelectors.selectAllCharacters);
  public isLoading = this.store.selectSignal(CharacterSelectors.selectIsLoading);
  public selectCharacter = this.store.selectSignal(CharacterSelectors.selectSelectedCharacter);
  public pagination = this.store.selectSignal(CharacterSelectors.selectPagination);
  public currentPage = this.store.selectSignal(CharacterSelectors.selectCurrentPage);
  public searchQuery = this.store.selectSignal(CharacterSelectors.selectSearchQuery);

  constructor() {
    // Side-effect: Automatically scrolls to the top whenever the search query changes
    effect(() => {
      this.searchQuery();
      this.viewport()?.scrollToIndex(0);
    });
  }

  // Triggers the initial data load on component mount
  ngOnInit(): void {
    this.store.dispatch(CharacterActions.setSearch({ query: this.searchQuery() || '' }));
  }

  // Sets the selected character to open the modal
  public selectCharacterHandler(character: ICharacter): void {
    this.store.dispatch(CharacterActions.selectCharacter({ character }));
  }

  // Infinite scroll logic: checks if the user is near the bottom of the list
  public onScroll(index: number): void {
    if (this.isLoading()) return;

    const current = this.currentPage();
    const totalPages = this.pagination()?.pages || 1;
    const total = this.characters().length;

    // Pre-fetches the next page when the user is 8 items away from the end
    if (total > 0 && index + 8 >= total && current < totalPages) {
      this.store.dispatch(CharacterActions.loadNextPage());
    }
  }

  // Triggers the backend PDF generation endpoint
  public downloadReport(): void {
    this.apiService.downloadReport();
  }

  // Performance optimization for *cdkVirtualFor to prevent unnecessary DOM re-renders
  public trackById(index: number, character: ICharacter): number {
    return character.id;
  }
}
