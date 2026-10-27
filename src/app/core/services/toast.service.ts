import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: number;
  type: ToastType;
  title: string;
  message: string;
  duration: number;
}

const defaultTitles: Record<ToastType, string> = {
  success: 'Успешно',
  error: 'Ошибка',
  warning: 'Внимание',
  info: 'Информация'
};

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<ToastItem[]>([]);
  private seq = 0;

  show(type: ToastType, message: string, opts?: { title?: string; duration?: number }): { close: () => void } {
    const id = ++this.seq;
    const toast: ToastItem = {
      id,
      type,
      title: opts?.title ?? defaultTitles[type],
      message,
      duration: opts?.duration ?? 4000
    };
    this.toasts.update(list => [...list, toast]);

    let timer: ReturnType<typeof setTimeout> | undefined;
    const close = () => {
      if (timer) clearTimeout(timer);
      this.toasts.update(list => list.filter(item => item.id !== id));
    };

    if (toast.duration > 0) {
      timer = setTimeout(close, toast.duration);
    }

    return { close };
  }

  success(message: string, opts?: { title?: string; duration?: number }) {
    return this.show('success', message, opts);
  }

  error(message: string, opts?: { title?: string; duration?: number }) {
    return this.show('error', message, opts);
  }

  warning(message: string, opts?: { title?: string; duration?: number }) {
    return this.show('warning', message, opts);
  }

  info(message: string, opts?: { title?: string; duration?: number }) {
    return this.show('info', message, opts);
  }

  dismiss(id: number): void {
    this.toasts.update(list => list.filter(item => item.id !== id));
  }
}
