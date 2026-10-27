import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CloudinaryUploadResult, UploadSignatureResponse } from '../model';

export type UploadPhotoScenario =
  | 'AgentUploadApplicationPhoto'
  | 'AdminUploadLibraryPhoto';

@Injectable({ providedIn: 'root' })
export class CloudinaryService {
  constructor(private readonly http: HttpClient) {}

  async requestUploadPhotoSignature(
    file: File,
    scenario: UploadPhotoScenario
  ): Promise<UploadSignatureResponse> {
    const response = await firstValueFrom(
      this.http.post<UploadSignatureResponse>(
        `${environment.apiBase}/Cloudinary/GetUploadPhotoSignature`,
        {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          scenario: scenario
        },
        { observe: 'response' }
      )
    );

    if (!response.ok || !response.body) {
      throw new Error(
        (response.body as unknown as { error?: string })?.error ||
          'Не удалось получить подпись'
      );
    }
    return response.body;
  }

  async uploadPhoto(
    file: File,
    scenario: UploadPhotoScenario
  ): Promise<CloudinaryUploadResult> {
    const signatureData = await this.requestUploadPhotoSignature(file, scenario);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signatureData.apiKey);
    formData.append('timestamp', String(signatureData.timestamp));
    formData.append('signature', signatureData.signature);
    formData.append('folder', signatureData.folder); // ← важно, если preset не задаёт папку

    const resourceType = file.type.startsWith('image/') ? 'image' : 'raw';
    const uploadUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/${resourceType}/upload`;

    const response = await fetch(uploadUrl, { method: 'POST', body: formData });
    if (!response.ok) {
      let errorMsg = 'Ошибка загрузки файла';
      try {
        const err = await response.json();
        errorMsg = err.error?.message || JSON.stringify(err);
      } catch {
        try {
          errorMsg = (await response.text()) || errorMsg;
        } catch {
          /* ignore */
        }
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    return { url: data.secure_url, publicId: data.public_id };
  }

  validateFile(
    file: File,
    options: { maxSizeMB?: number; allowedTypes?: string[] | null } = {}
  ): boolean {
    const { maxSizeMB = 10, allowedTypes = null } = options;
    if (allowedTypes && !allowedTypes.includes(file.type)) {
      throw new Error(
        `Тип файла "${file.type}" не поддерживается. Разрешены: ${allowedTypes.join(', ')}`
      );
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      throw new Error(
        `Файл "${file.name}" слишком большой (${(file.size / 1024 / 1024).toFixed(1)} MB). Максимум ${maxSizeMB} MB`
      );
    }
    return true;
  }
}