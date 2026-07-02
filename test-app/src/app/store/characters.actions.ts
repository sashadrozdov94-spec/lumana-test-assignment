import { createAction, props } from '@ngrx/store';
import { HttpErrorResponse } from '@angular/common/http';
import { ICharacter, ISearchHistory } from '../interfaces/character.interface';
import { IPaginatedResponse } from '../interfaces/pagination.interface';
import { ChangedCanvasCharacter } from '../interfaces/canvas.interface';


export const setSearch = createAction(
  '[SearchBar] Set Search',
  props<{ query: string }>()
);

export const loadNextPage = createAction(
  '[VirtualScroll] Load Next Page'
);

export const loadCharactersSuccess = createAction(
  '[Character API] Load Characters Success',
  props<{ response: IPaginatedResponse | ICharacter }>()
);

export const loadCharactersFailure = createAction(
  '[Character API] Load Characters Failure',
  props<{ error: HttpErrorResponse }>()
);

export const selectCharacter = createAction(
  '[Character List] Select Character',
  props<{ character: ICharacter }>()
);

export const clearSelection = createAction(
  '[Modal] Clear Selection'
);

export const updateChangedCharacters = createAction(
  "[Canvas] Save Characters Canvas",
  props<{ changedCharacters: ChangedCanvasCharacter[] }>(),
);

export const addToHistory = createAction(
  '[History] Add To History',
  props<{ item: ISearchHistory }>()
);

export const clearHistory = createAction(
  '[History] Clear History'
);
