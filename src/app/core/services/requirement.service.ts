import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResult, DocumentRequirement, PhotoRequirement } from '../model';

@Injectable({ providedIn: 'root' })
export class RequirementService {
  private readonly base = `${environment.apiBase}/Requirements`;

  constructor(private readonly http: HttpClient) {}

  getAllPhotoRequirements(): Observable<PhotoRequirement[]> {
    return this.http
      .get<ApiResult<PhotoRequirement[]>>(`${this.base}/GetAllPhotoRequirements`)
      .pipe(
        map(r => r.data ?? []),
        catchError(() => of([]))
      );
  }

  addPhotoRequirement(model: Partial<PhotoRequirement>): Observable<PhotoRequirement | null> {
    return this.http
      .post<ApiResult<PhotoRequirement>>(`${this.base}/AddNewPhotoRequirement`, model)
      .pipe(
        map(r => r.data ?? null),
        catchError(() => of(null))
      );
  }

  editPhotoRequirement(model: PhotoRequirement): Observable<ApiResult<PhotoRequirement> | null> {
    return this.http
      .put<ApiResult<PhotoRequirement>>(`${this.base}/EditPhotoRequirement`, model)
      .pipe(catchError(() => of(null)));
  }

  deletePhotoRequirement(id: number | string): Observable<boolean> {
    return this.http
      .delete<ApiResult<boolean>>(`${this.base}/DeletePhotoRequirement`, {
        params: { photoRequirementId: id },
      })
      .pipe(
        map(r => r.success),
        catchError(() => of(false))
      );
  }

  getAllDocumentRequirements(): Observable<DocumentRequirement[]> {
    return this.http
      .get<ApiResult<DocumentRequirement[]>>(`${this.base}/GetAllDocumentRequirements`)
      .pipe(
        map(r => r.data ?? []),
        catchError(() => of([]))
      );
  }

  addDocumentRequirement(model: Partial<DocumentRequirement>): Observable<DocumentRequirement | null> {
    return this.http
      .post<ApiResult<DocumentRequirement>>(`${this.base}/AddNewDocumentRequirement`, model)
      .pipe(
        map(r => r.data ?? null),
        catchError(() => of(null))
      );
  }

  editDocumentRequirement(model: DocumentRequirement): Observable<ApiResult<DocumentRequirement> | null> {
    return this.http
      .put<ApiResult<DocumentRequirement>>(`${this.base}/EditDocumentRequirement`, model)
      .pipe(catchError(() => of(null)));
  }

  deleteDocumentRequirement(id: number | string): Observable<boolean> {
    return this.http
      .delete<ApiResult<boolean>>(`${this.base}/DeleteDocumentRequirement`, {
        params: { documentRequirementId: id },
      })
      .pipe(
        map(r => r.success),
        catchError(() => of(false))
      );
  }
}