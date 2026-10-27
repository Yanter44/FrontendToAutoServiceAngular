import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResult, NotificationDto } from '../model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private readonly http: HttpClient) {}

  getNotifications(page: number, pageSize: number): Observable<NotificationDto[] | undefined> {
    return this.http.get<NotificationDto[]>(
      `${environment.apiBase}/Notification/GetNotifications?page=${page}&pageSize=${pageSize}`
    ).pipe(catchError(() => of(undefined)));
  }
  markNotificationAsRead(notificationId: number): Observable<ApiResult<boolean>> {
    return this.http.patch<ApiResult<boolean>>(
      `${environment.apiBase}/Notification/MarkNotificationAsRead?notificationId=${notificationId}`, {}
    );
  }

  markAllMyNotificationsAsRead(): Observable<ApiResult<boolean>> {
    return this.http.post<ApiResult<boolean>>(
      `${environment.apiBase}/Notification/MarkAllMyNotificationsAsRead`, {}
    );
  }
}
