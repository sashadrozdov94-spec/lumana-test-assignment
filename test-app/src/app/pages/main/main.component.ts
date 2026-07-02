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
  private store = inject(Store);

  private viewport = viewChild(CdkVirtualScrollViewport);

  public characters = this.store.selectSignal(CharacterSelectors.selectAllCharacters);
  public isLoading = this.store.selectSignal(CharacterSelectors.selectIsLoading);
  public selectCharacter = this.store.selectSignal(CharacterSelectors.selectSelectedCharacter);
  public pagination = this.store.selectSignal(CharacterSelectors.selectPagination);
  public currentPage = this.store.selectSignal(CharacterSelectors.selectCurrentPage);
  public searchQuery = this.store.selectSignal(CharacterSelectors.selectSearchQuery);

  constructor() {
    effect(() => {
      const query = this.searchQuery();
      this.viewport()?.scrollToIndex(0);
    });
  }

  ngOnInit() {
    const currentQuery = this.searchQuery();
    this.store.dispatch(CharacterActions.setSearch({ query: currentQuery || '' }));
  }

  public selectCharacterHandler(character: ICharacter) {
    this.store.dispatch(CharacterActions.selectCharacter({ character }));
  }

  public onScroll(index: number) {
    if (this.searchQuery()) return;
    if (this.isLoading()) return;

    const totalPages = this.pagination()?.pages || 100;
    const threshold = 5;
    const end = index + threshold;
    const total = this.characters().length;

    if (end >= total && this.currentPage() < totalPages) {
      this.store.dispatch(CharacterActions.loadNextPage());
    }
  }
}
