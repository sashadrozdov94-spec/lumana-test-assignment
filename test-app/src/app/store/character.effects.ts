import { inject, Injectable, DestroyRef } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, catchError, switchMap, withLatestFrom, tap, delay } from 'rxjs/operators';
import { concatLatestFrom } from '@ngrx/operators';
import * as CharacterActions from './characters.actions';
import * as CharacterSelectors from './character.selector';
import { ApiService } from '../services/api.service';
import { IPaginatedResponse } from '../interfaces/pagination.interface';
import { ISearchHistory } from '../interfaces/character.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable()
export class CharacterEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly apiService = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly responseCache = new Map<string, IPaginatedResponse>();

  loadCharacters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CharacterActions.setSearch, CharacterActions.loadNextPage),
      takeUntilDestroyed(this.destroyRef),
      withLatestFrom(
        this.store.select(CharacterSelectors.selectCurrentPage),
        this.store.select(CharacterSelectors.selectSearchQuery)
      ),
      switchMap(([action, page, storeQuery]) => {
        const isSearchAction = action.type === CharacterActions.setSearch.type;
        const currentQuery = isSearchAction ? (action as any).query : storeQuery;
        const apiPage = isSearchAction ? 1 : page;

        const cacheKey = `search:${currentQuery.trim().toLowerCase()}-page:${apiPage}`;

        if (this.responseCache.has(cacheKey)) {
          const cachedResponse = this.responseCache.get(cacheKey);
          if (cachedResponse) {
            return of(CharacterActions.loadCharactersSuccess({ response: cachedResponse })).pipe(delay(10));
          }
        }

        return this.apiService.getCharacters(apiPage, currentQuery).pipe(
          tap(response => this.responseCache.set(cacheKey, response)),
          map(response => CharacterActions.loadCharactersSuccess({ response })),
          catchError(error => {
            if (error.status === 404) {
               const emptyResponse: IPaginatedResponse = { total: 0, page: apiPage, limit: 20, totalPages: 0, data: [] };
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
        const response = action.response as IPaginatedResponse;
        const hasResults = !!(response?.data?.length);

        if (hasResults && query?.trim()) {
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
