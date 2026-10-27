import { Component, input } from '@angular/core';

@Component({
  selector: 'app-notification-icon',
  standalone: true,
  templateUrl: './notification-icon.component.html',
  styleUrl: './notification-icon.component.css'
})
export class NotificationIconComponent {
  readonly type = input<string | undefined>('');
}
