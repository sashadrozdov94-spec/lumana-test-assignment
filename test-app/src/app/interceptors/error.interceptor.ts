import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 404) {
        console.error(`[HTTP Interceptor] Error for ${req.url}:`, error.message);
      }
      return throwError(() => error);
    })
  );
};
