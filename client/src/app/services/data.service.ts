import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { StoreService } from './store.service';

@Injectable({ providedIn: 'root' })
export class DataService {
  private http = inject(HttpClient);
  private store = inject(StoreService);
  private apiUrl = 'http://localhost:8080/api';

  get(resource: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${resource}`).pipe(
      tap(data => this.store.set(resource, data))
    );
  }

  post(resource: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${resource}`, data).pipe(
      tap(response => {
        // Update store if needed
        const currentData = this.store.select(resource)();
        if (Array.isArray(currentData)) {
          this.store.set(resource, [...currentData, response]);
        }
      })
    );
  }

  put(resource: string, id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${resource}/${id}`, data).pipe(
      tap(response => {
        // Update store if needed
        const currentData = this.store.select(resource)();
        if (Array.isArray(currentData)) {
          const updated = currentData.map((item: any) => 
            item.id === id ? response : item
          );
          this.store.set(resource, updated);
        }
      })
    );
  }

  delete(resource: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${resource}/${id}`).pipe(
      tap(() => {
        // Update store if needed
        const currentData = this.store.select(resource)();
        if (Array.isArray(currentData)) {
          const filtered = currentData.filter((item: any) => item.id !== id);
          this.store.set(resource, filtered);
        }
      })
    );
  }
}
