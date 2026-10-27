import { Component, inject } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-switch',
  standalone: true,
  host: { class: 'ThemeSwitchHost' },
  template: `
    <button type="button" class="ThemeSwitch" (click)="theme.toggle()" [attr.aria-pressed]="theme.theme() === 'dark'" [attr.aria-label]="label()">
      <span class="ThemeSwitchTrack" aria-hidden="true">
        @if (theme.theme() === 'dark') {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z"/></svg>
        } @else {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
        }
      </span>
      <span class="ThemeSwitchLabel">{{ theme.theme() === 'dark' ? 'Тёмная' : 'Светлая' }}</span>
    </button>
  `
})
export class ThemeSwitchComponent {
  readonly theme = inject(ThemeService);

  label(): string {
    return this.theme.theme() === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему';
  }
}
