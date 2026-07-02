import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { IPaginatedResponse, IApiPageInfo } from '../interfaces/pagination.interface';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private httpClient: HttpClient) { }

  public getCharacters(page: number, name: string | null, pagination: IApiPageInfo | null): Observable<IPaginatedResponse> {
    if (pagination && page > pagination.pages) {
      return EMPTY;
    }

    const params = new HttpParams()
      .set('page', page.toString())
      .set('name', name ? name : '');

    return this.httpClient.get<IPaginatedResponse>(
      environment.baseUrl + "/character",
      { params }
    );
  }
}
