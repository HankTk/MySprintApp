import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { User, LoginRequest } from '../../features/users/models/user';

/**
 * Authentication service
 * Handles user authentication, login, logout, and token management
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService
{
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:8080/api';
  
  private readonly CURRENT_USER_KEY = 'currentUser';
  private readonly HAS_USERS_KEY = 'hasUsers';
  private readonly JWT_TOKEN_KEY = 'jwtToken';
  
  // Reactive state
  currentUser = signal<User | null>(this.getStoredUser());
  hasUsers = signal<boolean | null>(null);

  constructor()
  {
    this.checkUsers();
  }

  /**
   * Check if any users exist in the system
   */
  checkUsers(): Observable<boolean>
  {
    return this.http.get<{ hasUsers: boolean }>(`${this.apiUrl}/auth/check-users`).pipe(
      map(response => response.hasUsers),
      tap(hasUsers => 
{
        this.hasUsers.set(hasUsers);
        localStorage.setItem(this.HAS_USERS_KEY, String(hasUsers));
      }),
      catchError(() =>
      {
        this.hasUsers.set(false);
        return of(false);
      })
    );
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginRequest): Observable<User>
  {
    return this.http.post<{ user: User; token: string }>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => 
{
        const { user, token } = response;
        this.currentUser.set(user);
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
        localStorage.setItem(this.JWT_TOKEN_KEY, token);
      }),
      map(response => response.user)
    );
  }

  /**
   * Logout current user
   */
  logout(): void
  {
    this.currentUser.set(null);
    localStorage.removeItem(this.CURRENT_USER_KEY);
    localStorage.removeItem(this.JWT_TOKEN_KEY);
    this.router.navigate(['/login']);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean
  {
    return this.currentUser() !== null && this.hasToken();
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null
  {
    return this.currentUser();
  }

  /**
   * Get stored user from localStorage
   */
  private getStoredUser(): User | null 
{
    try 
{
      const stored = localStorage.getItem(this.CURRENT_USER_KEY);
      if (stored)
      {
        return JSON.parse(stored);
      }
    }
 catch (e)
 {
      console.error('Error parsing stored user', e);
    }
    return null;
  }

  /**
   * Check if users exist (from localStorage cache)
   */
  getHasUsersCached(): boolean | null
  {
    const stored = localStorage.getItem(this.HAS_USERS_KEY);
    return stored === 'true' ? true : stored === 'false' ? false : null;
  }

  /**
   * Get JWT token from localStorage
   */
  getToken(): string | null
  {
    return localStorage.getItem(this.JWT_TOKEN_KEY);
  }

  /**
   * Check if user has a valid token
   */
  hasToken(): boolean
  {
    return this.getToken() !== null;
  }
}
