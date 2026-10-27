import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResult, PagedResult, ProfileDto, TransactionDto, BranchWithMembersDto, CreateBranchDto, BranchDto } from '../model';

@Injectable({ providedIn: 'root' })
export class AgentService {
  private readonly base = `${environment.apiBase}/Agent`;

  constructor(private readonly http: HttpClient) {}

  getMyApplications(page: number, pageSize: number): Observable<unknown> {
    return this.http.get(`${this.base}/GetMyApplications?page=${page}&pageSize=${pageSize}`).pipe(catchError(() => of(undefined)));
  }

  getMyProfile(): Observable<ProfileDto | undefined> {
    return this.http.get<ProfileDto>(`${this.base}/GetMyProfile`).pipe(catchError(() => of(undefined)));
  }

  getMyBalance(): Observable<ApiResult<number> | undefined> {
    return this.http.get<ApiResult<number>>(`${this.base}/GetMyBalance`).pipe(catchError(() => of(undefined)));
  }

  getMyDebtLimit(): Observable<ApiResult<number> | undefined> {
    return this.http.get<ApiResult<number>>(`${this.base}/GetMyDebtLimit`).pipe(catchError(() => of(undefined)));
  }

  getMyCurrentDebt(): Observable<ApiResult<number> | undefined> {
    return this.http.get<ApiResult<number>>(`${this.base}/GetMyCurrentDebt`).pipe(catchError(() => of(undefined)));
  }

  getMyAllBalanceTransactionStory(): Observable<unknown> {
    return this.http.get(`${this.base}/GetMyAllBalanceTransactionStory`).pipe(catchError(() => of(undefined)));
  }

  getMyBalanceTransactionStory(page: number, pageSize: number): Observable<ApiResult<PagedResult<TransactionDto>> | undefined> {
    return this.http.get<ApiResult<PagedResult<TransactionDto>>>(
      `${this.base}/GetMyBalanceTransactionStory?page=${page}&pageSize=${pageSize}`
    ).pipe(catchError(() => of(undefined)));
  }
  getMyBranches(): Observable<ApiResult<BranchWithMembersDto[]> | undefined> {
    return this.http
      .get<ApiResult<BranchWithMembersDto[]>>(`${this.base}/GetMyBranches`)
      .pipe(catchError(() => of(undefined)));
  }

  createBranch(dto: CreateBranchDto): Observable<ApiResult<BranchDto> | undefined> {
    return this.http
      .post<ApiResult<BranchDto>>(`${this.base}/CreateBranch`, dto)
      .pipe(catchError(() => of(undefined)));
  }

  deleteBranch(id: number): Observable<ApiResult<boolean> | undefined> {
    return this.http
      .delete<ApiResult<boolean>>(`${this.base}/Branches/${id}`)
      .pipe(catchError(() => of(undefined)));
  }

}
