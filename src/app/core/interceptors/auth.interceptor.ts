import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const AUTH_RETRIED = new HttpContextToken(() => false);

const skipRefresh = (url: string): boolean =>
  /\/Auth\/(Login|TryRegistration|ConfirmRegistrationCode|FinishRegistration|RefreshToken|AcceptInvitation|SignOut)/.test(url)
  || /\/Invitation\/GetInvitationByToken/.test(url);

const isPublicPage = (url: string): boolean => {
  const path = url.split('?')[0];
  return path === '/login' || path.startsWith('/invite');
};

const onPublicPage = (router: Router): boolean =>
  isPublicPage(router.url) || (typeof location !== 'undefined' && isPublicPage(location.pathname));

const goToLogin = (router: Router): void => {
  if (!onPublicPage(router)) {
    void router.navigateByUrl('/login');
  }
};

export const credentialsInterceptor: HttpInterceptorFn = (req, next) =>
  next(req.clone({ withCredentials: true }));

export const authRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || skipRefresh(req.url)) {
        return throwError(() => error);
      }

      // jwt и jwtrefresh стоят как HttpOnly: скрипт их не видит, браузер отправит jwtrefresh сам.
      if (req.context.get(AUTH_RETRIED) || onPublicPage(router) || !auth.canAttemptRefresh()) {
        auth.denyRefresh();
        goToLogin(router);
        return throwError(() => error);
      }

      return auth.refreshToken().pipe(
        switchMap(ok => {
          if (!ok) {
            goToLogin(router);
            return throwError(() => error);
          }
          return next(req.clone({
            withCredentials: true,
            context: req.context.set(AUTH_RETRIED, true)
          }));
        }),
        catchError(() => {
          auth.denyRefresh();
          goToLogin(router);
          return throwError(() => error);
        })
      );
    })
  );
};
