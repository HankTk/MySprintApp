import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { StoreService } from './store.service';

@Injectable({ providedIn: 'root' })
export class HttpService
{

  private http = inject(HttpClient);
  private store = inject(StoreService);
  private apiUrl = 'http://localhost:8080/api';

  get(resource: string): Observable<any>
  {
    return this.http.get(`${this.apiUrl}/${resource}`).pipe(
      tap(data => this.store.set(resource, data))
    );
  }

  post(resource: string, data: any): Observable<any>
  {
    // Store will be automatically updated via WebSocket notification, so no need to update here
    return this.http.post(`${this.apiUrl}/${resource}`, data);
  }

  put(resource: string, id: string, data: any): Observable<any>
  {
    // Store will be automatically updated via WebSocket notification, so no need to update here
    return this.http.put(`${this.apiUrl}/${resource}/${id}`, data);
  }

  delete(resource: string, id: string): Observable<void>
  {
    // Store will be automatically updated via WebSocket notification, so no need to update here
    return this.http.delete<void>(`${this.apiUrl}/${resource}/${id}`);
  }

}
