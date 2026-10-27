import { Injectable, NgZone } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { environment } from '../../../environments/environment';

interface SignalRHandler {
  eventName: string;
  callback: (payload: unknown) => void;
}

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private connection: HubConnection | null = null;
  private readonly handlers: SignalRHandler[] = [];

  constructor(private readonly zone: NgZone) {}

  async start(): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected) {
      return;
    }

    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }

    this.connection = new HubConnectionBuilder()
      .withUrl(`${environment.apiBase}/notificationHub`, { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    for (const handler of this.handlers) {
      this.bind(handler);
    }

    await this.connection.start();
    console.log(this.connection.connectionId);
  }

  on<T = unknown>(eventName: string, callback: (payload: T) => void): void {
    const handler: SignalRHandler = {
      eventName,
      callback: payload => callback(payload as T)
    };
    this.handlers.push(handler);
    if (this.connection) {
      this.bind(handler);
    }
  }

  async invoke<T = unknown>(method: string, ...args: unknown[]): Promise<T> {
    if (!this.connection) {
      throw new Error('SignalR connection is not started');
    }
    return this.connection.invoke<T>(method, ...args);
  }

  async stop(): Promise<void> {
    await this.connection?.stop();
    this.connection = null;
  }

  private bind(handler: SignalRHandler): void {
    this.connection?.on(handler.eventName, (payload: unknown) => {
      this.zone.run(() => handler.callback(payload));
    });
  }
}
