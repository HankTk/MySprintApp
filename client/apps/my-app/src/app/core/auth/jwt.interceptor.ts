import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthService} from './auth.service';

/**
 * JWT Token Interceptor
 * Automatically adds JWT token to all HTTP requests
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) =>
{
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token)
  {
    const clonedRequest = req.clone(
        {
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
    return next(clonedRequest);
  }

  return next(req);
};
