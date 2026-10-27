import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AddPhotoToGalleryRequest, ApiResult, GalleryPhotoDto, PagedResult } from '../model';

@Injectable({ providedIn: 'root' })
export class PhotoGalleryService {
  private readonly base = `${environment.apiBase}/PhotoGallery`;

  constructor(private readonly http: HttpClient) {}

  getPhotoGallery(page: number, pageSize: number): Observable<ApiResult<PagedResult<GalleryPhotoDto>>> {
    return this.http.get<ApiResult<PagedResult<GalleryPhotoDto>>>(
      `${this.base}/GetPhotoGallery?page=${page}&pageSize=${pageSize}`
    ).pipe(catchError(error => throwError(() => error)));
  }

  addNewPhotoToGallery(model: AddPhotoToGalleryRequest): Observable<ApiResult> {
    return this.http.post<ApiResult>(`${this.base}/AddNewPhotoToGallery`, model).pipe(
      catchError(error => throwError(() => error))
    );
  }

  deletePhotoFromGallery(photoId: number | string): Observable<ApiResult> {
    return this.http.delete<ApiResult>(`${this.base}/DeletePhotoFromGallery?photoId=${photoId}`).pipe(
      catchError(error => throwError(() => error))
    );
  }
}
