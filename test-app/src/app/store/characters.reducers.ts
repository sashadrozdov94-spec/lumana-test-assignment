import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { ICharacter, ISearchHistory } from '../interfaces/character.interface';
import { IApiPageInfo, IPaginatedResponse } from '../interfaces/pagination.interface';
import { ChangedCanvasCharacter } from '../interfaces/canvas.interface';
import * as CharacterActions from './characters.actions';

export interface HistoryState extends EntityState<ISearchHistory> {}

export interface CharacterState extends EntityState<ICharacter> {
  isLoading: boolean;
  error: any;
  pagination: IApiPageInfo | null;
  selectedCharacter: ICharacter | null;
  searchId: number | null;
  searchQuery: string;
  currentPage: number;
  changedCharacters: ChangedCanvasCharacter[];
  history: HistoryState;
}

export const appAdapter: EntityAdapter<ICharacter> = createEntityAdapter<ICharacter>({
  selectId: (character) => character.id,
  sortComparer: false
});

export const historyAdapter: EntityAdapter<ISearchHistory> = createEntityAdapter<ISearchHistory>({
  selectId: (item) => item.id,
  sortComparer: (a, b) => b.timestamp - a.timestamp
});

export const initialState: CharacterState = appAdapter.getInitialState({
  isLoading: false,
  error: null,
  pagination: null,
  selectedCharacter: null,
  searchQuery: '',
  searchId: null,
  currentPage: 1,
  changedCharacters: [],
  history: historyAdapter.getInitialState()
});

export const characterReducer = createReducer(
  initialState,

  on(CharacterActions.setSearch, (state, { query }) => appAdapter.removeAll({
    ...state,
    searchQuery: query,
    searchId: null,
    currentPage: 1,
    pagination: null,
    isLoading: true,
    error: null
  })),

  on(CharacterActions.loadNextPage, (state) => ({
    ...state,
    currentPage: state.currentPage + 1,
    isLoading: true
  })),

  on(CharacterActions.loadCharactersSuccess, (state, { response }) => {
    const paginatedRes = response as IPaginatedResponse;
    const newChars = paginatedRes?.data || [];

    const hasMore = newChars.length > 0;
    const newInfo = {
      count: paginatedRes?.total || state.pagination?.count || 0,
      pages: hasMore ? state.currentPage + 1 : state.currentPage,
      next: null,
      prev: null
    };

    return appAdapter.addMany(newChars, {
      ...state,
      isLoading: false,
      pagination: newInfo,
      error: null
    });
  }),

  on(CharacterActions.loadCharactersFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  on(CharacterActions.selectCharacter, (state, { character }) => ({
    ...state,
    selectedCharacter: character
  })),

  on(CharacterActions.clearSelection, (state) => ({
    ...state,
    selectedCharacter: null
  })),

  on(CharacterActions.updateChangedCharacters, (state, { changedCharacters }) => ({
    ...state,
    changedCharacters
  })),

  on(CharacterActions.addToHistory, (state, { item }) => ({
    ...state,
    history: historyAdapter.upsertOne(item, state.history)
  })),

  on(CharacterActions.clearHistory, (state) => ({
    ...state,
    history: historyAdapter.removeAll(state.history)
  }))
);

export const { selectAll } = appAdapter.getSelectors();
export const { selectAll: selectAllHistoryItems } = historyAdapter.getSelectors();
