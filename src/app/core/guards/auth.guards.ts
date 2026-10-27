import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { MeResponse, RoleType } from '../model';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';

const loginTree = (router: Router): UrlTree => router.createUrlTree(['/login']);
const blockedTree = (router: Router): UrlTree => router.createUrlTree(['/blocked']);

const redirectIfBlocked = (me: MeResponse, router: Router): UrlTree | null =>
  me.isBlocked ? blockedTree(router) : null;

export const authGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.canAttemptRefresh() && !session.me()) {
    return loginTree(router);
  }

  return session.ensureMe().pipe(
    map(me => {
      if (!me) return loginTree(router);
      return redirectIfBlocked(me, router) ?? true;
    }),
    catchError(() => of(loginTree(router)))
  );
};

export const blockedPageGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.canAttemptRefresh() && !session.me()) {
    return loginTree(router);
  }

  return session.ensureMe().pipe(
    map(me => {
      console.log(me);
      console.log(me?.isBlocked);
      if (!me) 
        return loginTree(router);
      if (me.isBlocked) 
        return true;
      return router.createUrlTree([session.homePathForRole(me.roleType)]);
    }),
    catchError(() => of(loginTree(router)))
  );
};

// export const blockedPageGuard: CanActivateFn = () => true;

export const guestGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.canAttemptRefresh() && !session.me()) {
    return true;
  }

  return session.ensureMe().pipe(
    map(me => {
      if (!me) return true;
      return redirectIfBlocked(me, router) ?? router.createUrlTree([session.homePathForRole(me.roleType)]);
    }),
    catchError(() => of(true))
  );
};

export const roleGuard = (roles: RoleType[]): CanActivateFn => () => {
  const session = inject(SessionService);
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.canAttemptRefresh() && !session.me()) {
    return router.createUrlTree(['/login']);
  }

  return session.ensureMe().pipe(
    map(me => {
      if (!me) return loginTree(router);
      const blocked = redirectIfBlocked(me, router);
      if (blocked) return blocked;
      if (roles.some(role => role === me.roleType)) return true;
      return router.createUrlTree([session.homePathForRole(me.roleType)]);
    }),
    catchError(() => of(loginTree(router)))
  );
};
