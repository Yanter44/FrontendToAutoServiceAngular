import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AgentListItem, ApiResult, BlockUserRequest, ChangeUserDebtLimitRequest, DeleteUserRequest, PagedResult, UnblockUserRequest, UserBlockHistoryItem,UserDto} from '../model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly base = `${environment.apiBase}/User`;

  constructor(private readonly http: HttpClient) {}

  getAllUsersExcept(): Observable<unknown> {
    return this.http.get(`${this.base}/GetAllUsersExcept`).pipe(catchError(() => of(undefined)));
  }

  getAllUsers(): Observable<unknown> {
    return this.http.get(`${this.base}/GetAllUsers`).pipe(catchError(() => of(undefined)));
  }

  getUsers(page: number, pageSize: number): Observable<ApiResult<PagedResult<UserDto>> | undefined> {
    return this.http.get<ApiResult<PagedResult<UserDto>>>(`${this.base}/GetUsers?page=${page}&pageSize=${pageSize}`).pipe(
      catchError(() => of(undefined))
    );
  }

  getAllAgents(): Observable<ApiResult<AgentListItem[]> | undefined> {
    return this.http.get<ApiResult<AgentListItem[]>>(`${this.base}/GetAllAgents`).pipe(catchError(() => of(undefined)));
  }

  deleteUser(model: DeleteUserRequest): Observable<ApiResult | undefined> {
    return this.http.delete<ApiResult>(`${this.base}/DeleteUser?userId=${model.userId}`).pipe(catchError(() => of(undefined)));
  }

  getAvailableRoles(): Observable<unknown> {
    return this.http.get(`${this.base}/GetAvailableRoles`).pipe(catchError(() => of(undefined)));
  }

  getUserBlockHistory(userId: number | string): Observable<ApiResult<UserBlockHistoryItem[]> | undefined> {
    return this.http.get<ApiResult<UserBlockHistoryItem[]>>(`${this.base}/GetUserBlocksHistory?userId=${userId}`).pipe(
      catchError(() => of(undefined))
    );
  }

  blockUser(model: BlockUserRequest): Observable<ApiResult | undefined> {
    return this.http.post<ApiResult>(`${this.base}/BlockUser`, model).pipe(catchError(() => of(undefined)));
  }

  unblockUser(model: UnblockUserRequest): Observable<ApiResult | undefined> {
    return this.http.post<ApiResult>(`${this.base}/UnblockUser`, model).pipe(catchError(() => of(undefined)));
  }

  changeUserDebtLimit(model: ChangeUserDebtLimitRequest): Observable<ApiResult | undefined> {
    return this.http.post<ApiResult>(`${this.base}/ChangeUserDebtLimit`, model).pipe(catchError(() => of(undefined)));
  }
}
