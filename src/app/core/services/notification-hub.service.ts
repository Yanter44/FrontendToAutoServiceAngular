import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NotificationDto, NotificationTypes, UiNotification } from '../model';
import { NotificationService } from './notification.service';
import { SignalRService } from './signalr.service';

export type { UiNotification };

const NOTIFICATION_PAGE_SIZE = 10;

@Injectable({ providedIn: 'root' })
export class NotificationHubService {
  readonly items = signal<UiNotification[]>([]);
  readonly unreadCount = signal(0);
  readonly hasMore = signal(false);
  readonly loadingMore = signal(false);

  private readonly page = signal(1);
  private handlersBound = false;
  private markingAll = false;
  private readonly reading = new Set<number>();

  constructor(
    private readonly notificationService: NotificationService,
    private readonly signalR: SignalRService
  ) {}

  async init(): Promise<void> {
    const page = await this.fetchPage(1);
    page.items.sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime());
    this.page.set(1);
    this.items.set(page.items.map(toUiNotification));
    this.syncUnread();
    this.hasMore.set(this.pageHasMore(1, page));

    if (this.handlersBound) return;

    const prepend = (notification: NotificationDto) => {
      const item = toUiNotification(notification);
      this.items.update(items => items.some(existing => existing.id === item.id) ? items : [item, ...items]);
      this.syncUnread();
    };

    this.signalR.on(NotificationTypes.ApplicationApproved, prepend);
    this.signalR.on(NotificationTypes.ApplicationCreated, prepend);
    this.signalR.on(NotificationTypes.ApplicationSendToModeration, prepend);
    this.signalR.on(NotificationTypes.ApplicationRejected, prepend);
    this.signalR.on(NotificationTypes.BalanceCredited, prepend);
    this.signalR.on(NotificationTypes.BalanceDebited, prepend);
    this.handlersBound = true;
  }

  async loadMore(): Promise<void> {
    if (this.loadingMore() || !this.hasMore()) return;
    this.loadingMore.set(true);
    try {
      const nextPage = this.page() + 1;
      const page = await this.fetchPage(nextPage);
      if (!page.items.length) {
        this.hasMore.set(false);
        return;
      }

      let added = 0;
      this.items.update(items => {
        const known = new Set(items.map(item => item.id));
        const fresh = page.items.map(toUiNotification).filter(item => !known.has(item.id));
        added = fresh.length;
        return added ? [...items, ...fresh] : items;
      });

      if (!added) {
        this.hasMore.set(false);
        return;
      }

      this.page.set(nextPage);
      this.hasMore.set(this.pageHasMore(nextPage, page));
      this.syncUnread();
    } finally {
      this.loadingMore.set(false);
    }
  }

  async markAsRead(id: number): Promise<void> {
    const current = this.items().find(item => item.id === id);
    if (!current || current.isRead || this.reading.has(id)) return;

    this.reading.add(id);
    try {
      const result = await firstValueFrom(this.notificationService.markNotificationAsRead(id));
      if (!result?.success) return;
      this.items.update(items => items.map(item => item.id === id ? { ...item, isRead: true } : item));
      this.syncUnread();
    } catch (error) {
      console.error('Не удалось отметить уведомление прочитанным', error);
    } finally {
      this.reading.delete(id);
    }
  }

  async markAllAsRead(): Promise<void> {
    if (this.markingAll || this.unreadCount() === 0) return;

    this.markingAll = true;
    try {
      const result = await firstValueFrom(this.notificationService.markAllMyNotificationsAsRead());
      if (!result?.success) return;
      this.items.update(items => items.map(item => item.isRead ? item : { ...item, isRead: true }));
      this.unreadCount.set(0);
    } catch (error) {
      console.error('Не удалось отметить все уведомления прочитанными', error);
    } finally {
      this.markingAll = false;
    }
  }

  private async fetchPage(page: number): Promise<NotificationPage> {
    const response = await firstValueFrom(this.notificationService.getNotifications(page, NOTIFICATION_PAGE_SIZE));
    return unwrapNotifications(response);
  }

  private syncUnread(): void {
    this.unreadCount.set(this.items().filter(item => !item.isRead).length);
  }

  private pageHasMore(page: number, result: NotificationPage): boolean {
    if (result.items.length < NOTIFICATION_PAGE_SIZE) return false;
    if (result.totalCount == null) return true;
    return page * NOTIFICATION_PAGE_SIZE < result.totalCount;
  }
}

interface NotificationPage {
  items: NotificationDto[];
  totalCount: number | null;
}

function toUiNotification(item: NotificationDto): UiNotification {
  const raw = item as NotificationDto & Record<string, unknown>;
  return {
    id: numberOrZero(raw.id ?? raw['Id']),
    title: text(raw.title ?? raw['Title']),
    message: text(raw.message ?? raw['Message']),
    notificationType: text(raw.notificationType ?? raw['NotificationType']),
    isRead: Boolean(raw.isRead ?? raw['IsRead']),
    createdAt: text(raw.createdAt ?? raw['CreatedAt'])
  };
}

function unwrapNotifications(value: unknown): NotificationPage {
  if (Array.isArray(value)) return { items: value, totalCount: null };
  if (!value || typeof value !== 'object') return { items: [], totalCount: 0 };

  const record = value as { data?: unknown; items?: unknown; totalCount?: number };
  if (Array.isArray(record.items)) {
    return { items: record.items, totalCount: numberOrNull(record.totalCount) };
  }
  if (Array.isArray(record.data)) {
    return { items: record.data, totalCount: numberOrNull(record.totalCount) };
  }
  if (record.data && typeof record.data === 'object') {
    const data = record.data as { items?: unknown; totalCount?: number };
    if (Array.isArray(data.items)) {
      return { items: data.items, totalCount: numberOrNull(data.totalCount) };
    }
  }
  return { items: [], totalCount: 0 };
}

function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' ? value : null;
}

function numberOrZero(value: unknown): number {
  const parsed = typeof value === 'string' ? Number(value) : value;
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : 0;
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}
