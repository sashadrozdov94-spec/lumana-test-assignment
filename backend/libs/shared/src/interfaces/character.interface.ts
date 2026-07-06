import { Document } from 'mongoose';

export interface ICharacter extends Document {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  heading: string;
  gender: string;
  origin: { name: string; url: string; };
  location: { name: string; url: string; };
  image: string;
  episode: string[];
  url: string;
  created: string;
}

export interface IApiResponse {
  info: { count: number; pages: number; next: string | null; prev: string | null; };
  results: ICharacter[];
}