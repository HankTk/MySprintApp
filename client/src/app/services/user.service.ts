import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUserRequest } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService
{
  private apiUrl = 'http://localhost:8080/api/users';

  private http = inject(HttpClient);

  getUsers(): Observable<User[]>
  {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUser(id: string): Observable<User>
  {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: CreateUserRequest): Observable<User>
  {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: string, user: User): Observable<User>
  {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: string): Observable<void>
  {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

