import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { ThemeService } from './core/services/theme.service';
import { ThemeSwitchComponent } from './shared/components/theme-switch/theme-switch.component';
import { ToastHostComponent } from './shared/components/toast-host/toast-host.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastHostComponent, ThemeSwitchComponent],
  template: `
    <router-outlet />
    @if (floatingTheme()) {
      <app-theme-switch class="Floating" />
    }
    <app-toast-host />
  `
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly url = signal(this.router.url);

  constructor() {
    inject(ThemeService);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => this.url.set(event.urlAfterRedirects));
  }

  readonly floatingTheme = computed(() => {
    const path = this.url().split('?')[0];
    return !path.startsWith('/admin') && !path.startsWith('/agent');
  });
}
