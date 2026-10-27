export interface NeuronNetworkDto {
  id: number;
  name: string;
  link: string;
}

export interface GeneratePhotoRequest {
  applicationId: number;
  photoId: number;
  neuronNetworkId: number;
  promptsIds: number[];
  additionalPhotoUrls?: string[];
}

export interface GeneratePhotoResponseData {
  imageBase64: string;
}

export interface ConfirmGeneratedPhotoRequest {
  applicationId: number;
  photoId: number;
  imageBase64: string;
}
