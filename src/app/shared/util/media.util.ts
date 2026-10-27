import { GalleryPhotoDto } from '../../core/model';

export function photoFileName(photo: GalleryPhotoDto): string {
  if (photo.name) return photo.name;
  if (photo.publicId) {
    const parts = photo.publicId.split('/');
    const last = parts[parts.length - 1];
    if (last) return last;
  }
  return photo.tag || 'photo';
}

export function generatedPhotoSrc(base64: string): string {
  return base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`;
}
