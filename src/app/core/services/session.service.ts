import { Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, of, shareReplay, tap } from 'rxjs';
import { MeResponse, RoleType } from '../model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SessionService {
  readonly me = signal<MeResponse | null>(null);
  private loaded = false;
  private me$?: Observable<MeResponse | null>;

  constructor(private readonly authService: AuthService) {}

  homePathForRole(role: RoleType | string): string {
    switch (role) {
      case RoleType.Agent: return '/agent';
      case RoleType.Admin:
      case RoleType.Moderator: return '/admin';
      default: return '/login';
    }
  }

  ensureMe(): Observable<MeResponse | null> {
    if (this.loaded) return of(this.me());
    if (this.me$) return this.me$;

    if (!this.authService.canAttemptRefresh()) {
      this.me.set(null);
      this.loaded = true;
      return of(null);
    }

    this.me$ = this.authService.me().pipe(
      tap(me => {
        this.me.set(me);
        this.loaded = true;
        this.me$ = undefined;
      }),
      catchError((error: HttpErrorResponse) => {
        this.me.set(null);
        this.loaded = true;
        this.me$ = undefined;
        if (error.status === 401) this.authService.denyRefresh();
        return of(null);
      }),
      shareReplay(1)
    );

    return this.me$;
  }

  setMe(me: MeResponse | null): void {
    this.me.set(me);
    this.loaded = true;
    this.me$ = undefined;
  }

  clear(): void {
    this.me.set(null);
    this.loaded = false;
    this.me$ = undefined;
  }

  isRole(...roles: RoleType[]): boolean {
    const current = this.me()?.roleType;
    return !!current && roles.some(role => role === current);
  }

  displayName(): string {
    return this.me()?.fio || 'Пользователь';
  }
}