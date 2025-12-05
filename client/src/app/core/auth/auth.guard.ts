import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Authentication guard
 * Protects routes that require authentication
 */
export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);
  
  // TODO: Implement authentication check
  // if (!authService.isAuthenticated()) {
  //   router.navigate(['/login']);
  //   return false;
  // }
  
  return true;

};
