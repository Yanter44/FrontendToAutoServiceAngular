import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AcceptApplicationDto, ApiResult, ApplicationDto, ApplicationsMetrics, CreateApplicationRequest, PagedResult, RejectApplicationDto } from '../model';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private readonly base = `${environment.apiBase}/Application`;

  constructor(private readonly http: HttpClient) {}

  getApplications(page: number, pageSize: number): Observable<ApiResult<PagedResult<ApplicationDto>> | undefined> {
    return this.http.get<ApiResult<PagedResult<ApplicationDto>>>(
      `${this.base}/GetApplications?page=${page}&pageSize=${pageSize}`
    ).pipe(catchError(() => of(undefined)));
  }

  getApplicationsMetrics(): Observable<ApplicationsMetrics | undefined> {
    return this.http.get<ApiResult<ApplicationsMetrics>>(`${this.base}/GetApplicationsMetrics`).pipe(
      map(result => result.success ? result.data : undefined),
      catchError(() => of(undefined))
    );
  }

  createNewApplication(model: CreateApplicationRequest): Observable<boolean> {
    return this.http.post(`${this.base}/CreateNewApplication`, model, { observe: 'response' }).pipe(
      map(response => response.ok),
      catchError((error: HttpErrorResponse) => {
        const message = error.error?.message || `Ошибка ${error.status}`;
        return throwError(() => new Error(message));
      })
    );
  }
  
  acceptApplication(model: AcceptApplicationDto): Observable<ApiResult<boolean>> {
    return this.http.post<ApiResult<boolean>>(`${this.base}/AcceptApplication`, model).pipe(
      catchError((error: HttpErrorResponse) => {
        const message = error.error?.message || `Ошибка ${error.status}`;
        return throwError(() => new Error(message));
      })
    );
  }

  rejectApplication(model: RejectApplicationDto): Observable<ApiResult<boolean>> {
    return this.http.post<ApiResult<boolean>>(`${this.base}/RejectApplication`, model).pipe(
      catchError((error: HttpErrorResponse) => {
        const message = error.error?.message || `Ошибка ${error.status}`;
        return throwError(() => new Error(message));
      })
    )
  }
}
