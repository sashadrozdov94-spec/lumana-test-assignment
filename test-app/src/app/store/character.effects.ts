import { inject, Injectable, DestroyRef } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, catchError, switchMap, withLatestFrom, tap } from 'rxjs/operators';
import { concatLatestFrom } from '@ngrx/operators';
import * as CharacterActions from './characters.actions';
import * as CharacterSelectors from './character.selector';
import { ApiService } from '../services/api.service';
import { IPaginatedResponse } from '../interfaces/pagination.interface';
import { ISearchHistory } from '../interfaces/character.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable()
export class CharacterEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private apiService = inject(ApiService);
  private destroyRef = inject(DestroyRef);

  private responseCache = new Map<string, IPaginatedResponse>();

  loadCharacters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CharacterActions.setSearch, CharacterActions.loadNextPage),
      takeUntilDestroyed(this.destroyRef),
      withLatestFrom(
        this.store.select(CharacterSelectors.selectCurrentPage),
        this.store.select(CharacterSelectors.selectSearchQuery)
      ),
      switchMap(([action, page, searchQuery]) => {
        const isSearchAction = action.type === CharacterActions.setSearch.type;
        const apiPage = isSearchAction ? 1 : page;
        const cacheKey = `search:${searchQuery.trim().toLowerCase()}-page:${apiPage}`;

        if (this.responseCache.has(cacheKey)) {
          const cachedResponse = this.responseCache.get(cacheKey);
          if (cachedResponse) {
            return of(CharacterActions.loadCharactersSuccess({ response: cachedResponse }));
          }
        }

        return this.apiService.getCharacters(apiPage, searchQuery, null).pipe(
          tap(response => this.responseCache.set(cacheKey, response)),
          map(response => CharacterActions.loadCharactersSuccess({ response })),
          catchError(error => {
            if (error.status === 404) {
               const emptyResponse: IPaginatedResponse = {
                 info: { count: 0, pages: 0, next: null, prev: null },
                 results: []
               };
               this.responseCache.set(cacheKey, emptyResponse);

               return of(CharacterActions.loadCharactersSuccess({ response: emptyResponse }));
            }
            return of(CharacterActions.loadCharactersFailure({ error }));
          })
        );
      })
    )
  );

  history$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CharacterActions.loadCharactersSuccess),
      takeUntilDestroyed(this.destroyRef),
      concatLatestFrom(() => this.store.select(CharacterSelectors.selectSearchQuery)),
      tap(([action, query]) => {
        const response = action.response;
        let hasResults = false;

        if (response && 'results' in response && Array.isArray(response.results)) {
            hasResults = response.results.length > 0;
        }

        if (hasResults && query && query.trim().length > 0) {
          const item: ISearchHistory = {
            id: query.trim(),
            query: query.trim(),
            timestamp: Date.now()
          };
          this.store.dispatch(CharacterActions.addToHistory({ item }));
        }
      })
    ),
    { dispatch: false }
  );
}
