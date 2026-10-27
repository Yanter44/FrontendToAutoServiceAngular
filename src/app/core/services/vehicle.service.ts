import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResult, VehicleCategory } from '../model';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  constructor(private readonly http: HttpClient) {}

  getAllVehicleCategoriesBySrts(): Observable<VehicleCategory[]> {
    return this.http
      .get<ApiResult<VehicleCategory[]>>(`${environment.apiBase}/Vehicle/GetAllVehicleCategoriesBySrts`)
      .pipe(
        map(response => response.data ?? []),
        catchError(() => of([])),
      );
  }
  getAllVehicleCategoriesByOkp(): Observable<VehicleCategory[]> {
    return this.http
      .get<ApiResult<VehicleCategory[]>>(`${environment.apiBase}/Vehicle/GetAllVehicleCategoriesByOkp`)
      .pipe(
        map(response => response.data ?? []),
        catchError(() => of([])),
      );
  }
}