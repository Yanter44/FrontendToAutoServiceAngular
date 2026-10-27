import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AddPtoRequest, ApiResult, PagedResult, PtoDto } from '../model';

@Injectable({ providedIn: 'root' })
export class PtoService {
  private readonly base = `${environment.apiBase}/Pto`;

  constructor(private readonly http: HttpClient) {}
  addNewPto(ptoData: AddPtoRequest): Observable<boolean> {
    const formData = new FormData();
    formData.append('name', ptoData.name);
    formData.append('rsaNumber', ptoData.rsaNumber);
    formData.append('address', ptoData.address);
    formData.append('latitude', (ptoData.latitude ?? 0).toString());
    formData.append('longitude', (ptoData.longitude ?? 0).toString());
    formData.append('maximumThroughput', ptoData.maximumThroughput.toString());

    if (ptoData.operatorKeyArchive) {
      formData.append('operatorKeyArchive', ptoData.operatorKeyArchive);
    }

    ptoData.pricePolicies.forEach((policy, index) => {
      formData.append(`PricePolicies[${index}].VehicleCategoriesBySrtsId`, policy.vehicleCategoriesBySrtsId.toString());
      formData.append(`PricePolicies[${index}].Price`, (policy.price || 0).toString());
    });

    ptoData.experts.forEach((expert, index) => {
      formData.append(`Experts[${index}].FirstName`, expert.firstName);
      formData.append(`Experts[${index}].LastName`, expert.lastName);
      formData.append(`Experts[${index}].MiddleName`, expert.middleName);
      formData.append(`Experts[${index}].SequenceNumber`, expert.sequenceNumber.toString());

      if (expert.keyArchive) {
        formData.append(`Experts[${index}].KeyArchive`, expert.keyArchive);
      }
    });

    return this.http.post(`${this.base}/AddNewPto`, formData, { observe: 'response' }).pipe(
      map(response => response.ok),
      catchError(() => of(false))
    );
  }

  getAllPtos(): Observable<unknown> {
    return this.http.get(`${this.base}/GetAllPtos`).pipe(catchError(() => of(undefined)));
  }

  getPtos(page: number, pageSize: number): Observable<ApiResult<PagedResult<PtoDto>> | undefined> {
    return this.http.get<ApiResult<PagedResult<PtoDto>>>(`${this.base}/GetPtos?page=${page}&pageSize=${pageSize}`).pipe(
      catchError(() => of(undefined))
    );
  }

  deletePto(ptoId: number | string): Observable<ApiResult | undefined> {
    return this.http.delete<ApiResult>(`${this.base}/DeletePto?ptoId=${ptoId}`).pipe(catchError(() => of(undefined)));
  }
}
