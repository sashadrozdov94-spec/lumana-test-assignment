import { ICharacter } from "./character.interface";

export interface IApiPageInfo {
  count: number;
  pages: number;
  next: string | null;
  prev: string | null;
}

export interface IPaginatedResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: ICharacter[];
}
