export interface UploadSignatureResponse {
  signature: string;
  timestamp: number | string;
  apiKey: string;
  cloudName: string;
  folder: string;
  uploadPreset: string;
}

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  fileName?: string;
}
