import { ICharacter } from "./character.interface";

export interface IApiPageInfo {
  count: number;
  pages: number;
  next: string | null;
  prev: string | null;
}

export interface IPaginatedResponse {
  info: IApiPageInfo;
  results: ICharacter[];
}
