import { Component, computed, DestroyRef, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import * as CharacterSelectors from '../../store/character.selector';
import * as CharacterActions from '../../store/characters.actions';
import { ICharacter } from '../../interfaces/character.interface';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule
  ],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent {
  private store = inject(Store);

  public searchQuery = this.store.selectSignal(CharacterSelectors.selectSearchQuery);
  public characters = this.store.selectSignal(CharacterSelectors.selectAllCharacters);
  public historySuggestions = this.store.selectSignal(CharacterSelectors.selectHistorySuggestions);
  public isLoading = this.store.selectSignal(CharacterSelectors.selectIsLoading);
  private destroyRef = inject(DestroyRef);

  public searchControl = new FormControl<string | ICharacter>(this.searchQuery() || '');

  public filteredOptions = computed(() => {
    const query = this.searchQuery();
    const apiList = this.characters();
    const historyList = this.historySuggestions();

    return {
      history: historyList,
      api: (query && query.trim() !== '') ? apiList : []
    };
  });

  constructor() {
    this.searchControl.valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((searchTerm) => {
      const term = typeof searchTerm === 'string' ? searchTerm : searchTerm?.name;
      const cleanTerm = term ?? '';

      if (cleanTerm !== this.searchQuery()) {
          this.store.dispatch(CharacterActions.setSearch({ query: cleanTerm }));
      }
    });

    effect(() => {
      const storeQuery = this.searchQuery();
      const controlValue = this.searchControl.value;

      const controlString = typeof controlValue === 'string'
        ? controlValue
        : controlValue?.name || '';

      if (storeQuery !== undefined && storeQuery !== controlString) {
        this.searchControl.setValue(storeQuery, { emitEvent: false });
      }
    });
  }

  public displayFn(character: ICharacter | string): string {
    if (typeof character === 'string') return character;
    return character && character.name ? character.name : '';
  }

  public clearSearch(): void {
    this.searchControl.setValue('');
  }

  public selectHistory(query: string): void {
    this.store.dispatch(CharacterActions.setSearch({ query }));
  }
}
