import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResult,
  ConfirmGeneratedPhotoRequest,
  GeneratePhotoRequest,
  GeneratePhotoResponseData,
  NeuronNetworkDto,
  PagedResult
} from '../model';

@Injectable({ providedIn: 'root' })
export class NeuronNetworkService {
  private readonly base = `${environment.apiBase}/NeuronNetwork`;

  constructor(private readonly http: HttpClient) {}

  getNeuronNetworks(page: number, pageSize: number): Observable<ApiResult<PagedResult<NeuronNetworkDto>> | undefined> {
    return this.http.get<ApiResult<PagedResult<NeuronNetworkDto>>>(
      `${this.base}/GetNeuronNetworks?page=${page}&pageSize=${pageSize}`
    ).pipe(catchError(() => of(undefined)));
  }

  getAllNeuronNetworks(): Observable<ApiResult<NeuronNetworkDto[]> | undefined> {
    return this.http.get<ApiResult<NeuronNetworkDto[]>>(`${this.base}/GetAllNeuronNetworks`).pipe(catchError(() => of(undefined)));
  }

  addNewNeuronNetwork(model: { name: string; link: string }): Observable<boolean> {
    return this.http.post(`${this.base}/AddNewNeuronNetwork`, model, { observe: 'response' }).pipe(
      map(response => response.ok),
      catchError(() => of(false))
    );
  }

  deleteNeuronNetwork(neuronNetworkId: number | string): Observable<ApiResult | undefined> {
    return this.http.delete<ApiResult>(`${this.base}/DeleteNeuronNetwork?neuronNetworkId=${neuronNetworkId}`).pipe(
      catchError(() => of(undefined))
    );
  }

  generatePhoto(model: GeneratePhotoRequest): Observable<ApiResult<GeneratePhotoResponseData> | undefined> {
    return this.http.post<ApiResult<GeneratePhotoResponseData>>(`${this.base}/GeneratePhoto`, model).pipe(
      catchError(() => of(undefined))
    );
  }

  confirmGeneratedPhotoByAI(model: ConfirmGeneratedPhotoRequest): Observable<ApiResult | undefined> {
    return this.http.post<ApiResult>(`${this.base}/ConfirmGeneratedPhoto`, model).pipe(catchError(() => of(undefined)));
  }
}
