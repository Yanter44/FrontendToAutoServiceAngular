import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResult, PagedResult, PromptDto, UpdatePromptRequest } from '../model';

@Injectable({ providedIn: 'root' })
export class PromptService {
  private readonly base = `${environment.apiBase}/Prompt`;

  constructor(private readonly http: HttpClient) {}

  addNewPrompt(tag: string, description: string): Observable<boolean> {
    return this.http.post(`${this.base}/AddNewPrompt`, { tag, description }, { observe: 'response' }).pipe(
      map(response => response.ok),
      catchError(() => of(false))
    );
  }

  getAllPrompts(): Observable<unknown> {
    return this.http.get(`${this.base}/GetAllPrompts`).pipe(catchError(() => of(undefined)));
  }

  getPrompts(page: number, pageSize: number): Observable<ApiResult<PagedResult<PromptDto>> | undefined> {
    return this.http.get<ApiResult<PagedResult<PromptDto>>>(`${this.base}/GetPrompts?page=${page}&pageSize=${pageSize}`).pipe(
      catchError(() => of(undefined))
    );
  }

  deletePrompt(promptId: number | string): Observable<ApiResult | undefined> {
    return this.http.delete<ApiResult>(`${this.base}/DeletePrompt?promptId=${promptId}`).pipe(catchError(() => of(undefined)));
  }

  redactPrompt(model: UpdatePromptRequest): Observable<ApiResult | undefined> {
    return this.http.put<ApiResult>(`${this.base}/UpdatePrompt`, model).pipe(catchError(() => of(undefined)));
  }
}
