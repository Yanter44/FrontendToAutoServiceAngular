import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResult, ConfirmRegistrationCodeRequest, FinishRegistrationRequest, MeResponse} from '../model';
import { AcceptInvitationRequest } from '../model/invitation.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base = `${environment.apiBase}/Auth`;
  private refresh$?: Observable<boolean>;
  private refreshDenied = false;

  constructor(private readonly http: HttpClient) {}

  canAttemptRefresh(): boolean {
    return !this.refreshDenied;
  }

  denyRefresh(): void {
    this.refreshDenied = true;
    this.refresh$ = undefined;
  }

  allowRefresh(): void {
    this.refreshDenied = false;
    this.refresh$ = undefined;
  }

  me(): Observable<MeResponse> {
    return this.http.get<MeResponse>(`${this.base}/Me`);
  }

  ping(): Observable<unknown> {
    return this.http.get(`${this.base}/Ping`);
  }

  login(email: string, password: string): Observable<boolean> {
    return this.http.post(`${this.base}/Login`, { email, password }, { observe: 'response' }).pipe(
      map(response => response.ok),
      tap(ok => {
        if (ok) this.allowRefresh();
      }),
      catchError(() => of(false))
    );
  }

  register(email: string, password: string): Observable<{ ok: boolean; data?: string; message?: string }> {
    return this.http.post<ApiResult<string>>(`${this.base}/TryRegistration`, { email, password }, { observe: 'response' }).pipe(
      map(response => ({
        ok: response.ok,
        data: response.body?.data,
        message: response.body?.message
      })),
      catchError((error: HttpErrorResponse) =>
        of({ ok: false, message: error.error?.message as string | undefined })
      )
    );
  }

  confirmCode(payload: ConfirmRegistrationCodeRequest): Observable<boolean> {
    return this.http.post(`${this.base}/ConfirmRegistrationCode`, payload, { observe: 'response' }).pipe(
      map(response => response.ok),
      catchError(() => of(false))
    );
  }

  finishRegistration(payload: FinishRegistrationRequest): Observable<boolean> {
    return this.http.post(`${this.base}/FinishRegistration`, payload, { observe: 'response' }).pipe(
      map(response => response.ok),
      tap(ok => {
        if (ok) this.allowRefresh();
      }),
      catchError(() => of(false))
    );
  }

  signOut(): Observable<boolean> {
    return this.http.get(`${this.base}/SignOut`, { observe: 'response' }).pipe(
      map(response => response.ok),
      tap(() => this.denyRefresh()),
      catchError(() => {
        this.denyRefresh();
        return of(false);
      })
    );
  }

  acceptInvitation(payload: AcceptInvitationRequest): Observable<ApiResult> {
    return this.http.post<ApiResult>(`${this.base}/AcceptInvitation`, payload).pipe(
      tap(result => {
        if (result?.success !== false) this.allowRefresh();
      }),
      catchError(() => of({ success: false, message: 'Не удалось принять приглашение' }))
    );
  }

  refreshToken(): Observable<boolean> {
    if (this.refreshDenied) {
      return of(false);
    }
    if (!this.refresh$) {
      this.refresh$ = this.http.get(`${this.base}/RefreshToken`, { observe: 'response' }).pipe(
        map(response => response.ok),
        catchError(() => of(false)),
        tap(ok => {
          this.refresh$ = undefined;
          if (!ok) this.denyRefresh();
        }),
        shareReplay(1)
      );
    }
    return this.refresh$;
  }
}
