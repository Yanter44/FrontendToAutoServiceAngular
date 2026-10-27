import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProfileDto } from '../model';

@Injectable({ providedIn: 'root' })
export class AdminProfileService {
  constructor(private readonly http: HttpClient) {}

  getMyProfile(): Observable<ProfileDto | undefined> {
    return this.http.get<ProfileDto>(`${environment.apiBase}/Admin/GetMyProfile`).pipe(catchError(() => of(undefined)));
  }
}
