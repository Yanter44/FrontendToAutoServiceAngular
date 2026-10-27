import { HttpClient } from '@angular/common/http';
import { Injectable, model } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResult } from '../model';
import { InvitationPreview } from '../model/invitation.model'; 
import { InviteUserRequest } from '../model/invitation.model';

@Injectable({ providedIn: 'root' })
export class InvitationService {
  private readonly base = `${environment.apiBase}/Invitation`;

  constructor(private readonly http: HttpClient) {}

  inviteUser(model: InviteUserRequest): Observable<ApiResult<boolean> | undefined> {
    return this.http.post<ApiResult<boolean>>(`${this.base}/InviteUser`, model).pipe(catchError(() => of(undefined)));
  }

  getInvitationByToken(token: string): Observable<ApiResult<InvitationPreview> | undefined> {
    return this.http.get<ApiResult<InvitationPreview>>(`${this.base}/GetInvitationByToken?token=${token}`).pipe(
      catchError(() => of(undefined))
    );
  }
}
