import { NotificationType } from './enum/notification-type.enum';

export interface NotificationDto {
  id: number;
  title?: string;
  message?: string;
  notificationType?: NotificationType | string;
  isRead: boolean;
  createdAt?: string;
}

export type UiNotification = NotificationDto;
