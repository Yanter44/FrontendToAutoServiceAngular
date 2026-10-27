export interface GalleryPhotoDto {
  id: number;
  url: string;
  tag?: string;
  group?: string;
  publicId?: string;
  name?: string;
  createdAt?: string;
}

export interface AddPhotoToGalleryRequest {
  tag: string;
  group: string;
  publicId: string;
  url: string;
}
