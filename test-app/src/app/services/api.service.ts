import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { IPaginatedResponse } from '../interfaces/pagination.interface';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;
  private readonly reportUrl = environment.reportUrl;

  public getCharacters(page: number, queryName: string | null): Observable<IPaginatedResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', '20');

    if (queryName && queryName.trim() !== '') {
      params = params.set('name', queryName.trim());
    }

    return this.httpClient.get<IPaginatedResponse>(`${this.baseUrl}/characters`, { params });
  }

  public downloadReport(): void {
    const cacheBuster = Date.now();
    window.open(`${this.reportUrl}/report/pdf?cb=${cacheBuster}`, '_blank');
  }
}
