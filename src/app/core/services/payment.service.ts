import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResult, BalanceMutationRequest, PagedResult, TransactionDto } from '../model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly base = `${environment.apiBase}/Payment`;

  constructor(private readonly http: HttpClient) {}

  credit(model: BalanceMutationRequest): Observable<boolean> {
    return this.http.post(`${this.base}/CreditAgentBalance`, model, { observe: 'response' }).pipe(
      map(response => response.ok),
      catchError(() => of(false))
    );
  }

  debit(model: BalanceMutationRequest): Observable<boolean> {
    return this.http.post(`${this.base}/DebitAgentBalance`, model, { observe: 'response' }).pipe(
      map(response => response.ok),
      catchError(() => of(false))
    );
  }

  getAllTransactions(): Observable<unknown> {
    return this.http.get(`${this.base}/GetAllTransaction`).pipe(catchError(() => of(false)));
  }

  getTransactions(page: number, pageSize: number): Observable<ApiResult<PagedResult<TransactionDto>> | false> {
    return this.http.get<ApiResult<PagedResult<TransactionDto>>>(
      `${this.base}/GetTransactions?page=${page}&pageSize=${pageSize}`
    ).pipe(catchError(() => of(false as const)));
  }
}
