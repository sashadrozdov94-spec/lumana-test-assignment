import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CharacterState, selectAll, selectAllHistoryItems } from './characters.reducers';

export const selectCharacterState = createFeatureSelector<CharacterState>('character');

export const selectAllCharacters = createSelector(
  selectCharacterState,
  selectAll
);

export const selectIsLoading = createSelector(
  selectCharacterState,
  (state) => state.isLoading
);

export const selectSelectedCharacter = createSelector(
  selectCharacterState,
  (state) => state.selectedCharacter
);

export const selectSearchId = createSelector(
  selectCharacterState,
  (state) => state.searchId
);

export const selectSearchQuery = createSelector(
  selectCharacterState,
  (state) => state.searchQuery
);

export const selectPagination = createSelector(
  selectCharacterState,
  (state) => state.pagination
);

export const selectCurrentPage = createSelector(
  selectCharacterState,
  (state) => state.currentPage
);

export const selectChangedCharacters = createSelector(
  selectCharacterState,
  (state) => state.changedCharacters
);

export const selectChangedCharactersById = (id: number) => createSelector(
  selectChangedCharacters,
  (changedCharacters) => changedCharacters.find(c => c.characterId === id)
);

export const selectHistoryState = createSelector(
  selectCharacterState,
  (state) => state.history
);

export const selectAllHistory = createSelector(
  selectHistoryState,
  selectAllHistoryItems
);

export const selectHistorySuggestions = createSelector(
  selectAllHistory,
  (history) => history.slice(0, 5)
);
