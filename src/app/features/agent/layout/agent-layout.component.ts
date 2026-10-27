import {Component,ElementRef,HostListener,OnDestroy,OnInit,ViewChild,ViewEncapsulation,computed,inject} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppLoaderComponent } from '../../../shared/components/app-loader/app-loader.component';
import { NotificationIconComponent } from '../../../shared/components/notification-icon/notification-icon.component';
import { AgentStateService } from '../data/agent-state.service';
import { AgentService } from '../../../core/services/agent.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoaderService } from '../../../core/services/loader.service';
import { NotificationHubService, UiNotification } from '../../../core/services/notification-hub.service';
import { SessionService } from '../../../core/services/session.service';
import { SignalRService } from '../../../core/services/signalr.service';
import { NotificationType, TransactionType } from '../../../core/model';
import { isMobileLayout } from '../../../core/utils/helpers';
import { AgentModalsHostComponent } from '../modals/agent-modals-host/agent-modals-host.component';
import { ThemeSwitchComponent } from '../../../shared/components/theme-switch/theme-switch.component';
import { ApplicationDetailsSidebarComponent } from './application-details-sidebar/application-details-sidebar.component';

@Component({
  selector: 'app-agent-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    AppLoaderComponent,
    AgentModalsHostComponent,
    NotificationIconComponent,
    ThemeSwitchComponent,
    ApplicationDetailsSidebarComponent
  ],
  templateUrl: './agent-layout.component.html',
  styleUrls: [
    '../../../../styles/agent/layout.css',
    '../../../../styles/agent/loader.css',
    '../../../../styles/agent/modals/AddTsPhotoModal.css',
    '../../../../styles/agent/modals/CreateApplicationModal.css',
    '../../../../styles/agent/modals/AddTsDocumentModal.css',
    '../../../../styles/agent/modals/CreateBranchModal.css',
    '../../../../styles/agent/modals/DetailsSidebarModal.css',
    '../../../../styles/agent/modals/InviteAgentModal.css', 
    '../../../../styles/agent/modals/ProfileSetting.css',
    '../../../../styles/agent/modals/NotificationModal.css',
    '../../../../styles/agent/screens/ApplicationsScreen.css',
    '../../../../styles/agent/screens/FinanceScreen.css',
    '../../../../styles/agent/screens/BranchesScreen.css'
  ],
  encapsulation: ViewEncapsulation.None
})
export class AgentLayoutComponent implements OnInit, OnDestroy {
  readonly agentState = inject(AgentStateService);
  readonly hub = inject(NotificationHubService);
  private readonly loader = inject(LoaderService);
  private readonly session = inject(SessionService);
  private readonly agent = inject(AgentService);
  private readonly auth = inject(AuthService);
  private readonly signalR = inject(SignalRService);
  private readonly router = inject(Router);

  @ViewChild('profileTrigger') profileTrigger?: ElementRef<HTMLElement>;
  @ViewChild('profileDropdown') profileDropdown?: ElementRef<HTMLElement>;
  @ViewChild('notificationTrigger') notificationTrigger?: ElementRef<HTMLElement>;
  @ViewChild('notificationDropdown') notificationDropdown?: ElementRef<HTMLElement>;

  profileOpen = false;
  notificationsOpen = false;
  mobileNavOpen = false;
  private sidebarClosing = false;
  private routerSub?: Subscription;
  private balanceNoticesBound = false;

  readonly sidebarOpen = computed(() => !!this.agentState.selectedApplication());
  readonly notifications = computed(() =>
    [...this.hub.items()].sort(
      (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    )
  );

 async ngOnInit(): Promise<void> {
  this.loader.show(10);
  try {
    await firstValueFrom(this.auth.ping());
    this.loader.next();
    const me = await firstValueFrom(this.session.ensureMe());
    if (!me) {
      await this.router.navigateByUrl('/login');
      return;
    }
    this.loader.next();

    const balance = await firstValueFrom(this.agent.getMyBalance());
    this.agentState.headerBalance.set(balance?.data ?? null);
    this.loader.next();
    this.loader.next();
    this.loader.next();
    this.loader.next();

    this.bindBalanceNotices();
    try {
      await this.signalR.start();
    } catch (error) {
      console.error(error);
    }
    this.loader.next();

    await this.hub.init();
    this.loader.next();
    this.loader.next();
  } catch (error) {
    console.error('Ошибка инициализации приложения:', error);
  } finally {
    this.loader.hide();
  }

  this.routerSub = this.router.events
    .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
    .subscribe(() => {
      this.closeMobileNav();
      this.closeAllDropdowns();
      this.agentState.selectedApplication.set(null);
    });
}

  async ngOnDestroy(): Promise<void> {
    this.routerSub?.unsubscribe();
    this.closeMobileNav();
    this.closeAllDropdowns();
    await this.signalR.stop();
  }

  private bindBalanceNotices(): void {
    if (this.balanceNoticesBound) return;
    this.balanceNoticesBound = true;
    this.signalR.on(NotificationType.BalanceCredited, payload => {
      this.agentState.recordBalanceNotice(payload, TransactionType.Credit);
    });
    this.signalR.on(NotificationType.BalanceDebited, payload => {
      this.agentState.recordBalanceNotice(payload, TransactionType.Debit);
    });
  }

  displayName(): string {
    return this.session.displayName();
  }

  avatarLetter(): string {
    return this.displayName().trim().charAt(0).toUpperCase() || '?';
  }

  headerBalanceText(): string {
    const value = this.agentState.headerBalance();
    if (value == null) return '—';
    return `${value.toLocaleString('ru-RU')} ₽`;
  }

  toggleMobileNav(event: Event): void {
    event.stopPropagation();
    this.mobileNavOpen = !this.mobileNavOpen;
    this.setBodyClass('MobileNavOpen', this.mobileNavOpen);
    if (this.mobileNavOpen) {
      this.closeAllDropdowns();
    }
  }

  closeMobileNav(): void {
    this.mobileNavOpen = false;
    this.setBodyClass('MobileNavOpen', false);
  }

  toggleProfile(event: Event): void {
    event.stopPropagation();
    const willOpen = !this.profileOpen;
    this.closeAllDropdowns();
    if (willOpen) {
      this.profileOpen = true;
      if (isMobileLayout()) this.setBodyClass('SheetOpen', true);
      setTimeout(() => this.positionProfile());
    }
  }

  toggleNotifications(event: Event): void {
    event.stopPropagation();
    console.log('успешно нажал на уведомления');
    const willOpen = !this.notificationsOpen;
    this.closeAllDropdowns();
    if (willOpen) {
      this.notificationsOpen = true;
      if (isMobileLayout()) this.setBodyClass('SheetOpen', true);
      setTimeout(() => this.positionNotifications());
    }
  }

  closeAllDropdowns(): void {
    this.profileOpen = false;
    this.notificationsOpen = false;
    this.setBodyClass('SheetOpen', false);
  }

  closeSidebar(): void {
    this.agentState.selectedApplication.set(null);
  }

  showMoreNotifications(event: Event): void {
    event.stopPropagation();
    void this.hub.loadMore();
  }

  markNotificationRead(notification: UiNotification, event: Event): void {
    event.stopPropagation();
    void this.hub.markAsRead(notification.id);
  }

  markAllNotifications(event: Event): void {
    event.stopPropagation();
    void this.hub.markAllAsRead();
  }

  notificationTitle(notification: UiNotification): string {
    if (notification.notificationType === NotificationType.ApplicationSendToModeration) {
      return 'Заявка отправлена на модерацию';
    }
    return notification.title || 'Уведомление';
  }

  async signOut(): Promise<void> {
    await firstValueFrom(this.auth.signOut());
    this.session.clear();
    await this.router.navigateByUrl('/login');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const clickedProfile =
      !!this.profileDropdown?.nativeElement.contains(target) ||
      !!this.profileTrigger?.nativeElement.contains(target);
    const clickedNotification =
      !!this.notificationDropdown?.nativeElement.contains(target) ||
      !!this.notificationTrigger?.nativeElement.contains(target);

    if (!clickedProfile && !clickedNotification) {
      this.closeAllDropdowns();
    }

    if (!this.sidebarOpen()) return;
    const clickedInsideSidebar = !!target.closest('.DetailsSidebar');
    const clickedRow = !!target.closest('.ApplicationTableRow');
    if (!clickedInsideSidebar && !clickedRow && !this.sidebarClosing) {
      this.sidebarClosing = true;
      this.closeSidebar();
      setTimeout(() => {
        this.sidebarClosing = false;
      }, 300);
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (!isMobileLayout()) {
      this.closeMobileNav();
    }
    if (this.profileOpen) this.positionProfile();
    if (this.notificationsOpen) this.positionNotifications();
  }

  private positionProfile(): void {
    const trigger = this.profileTrigger?.nativeElement;
    const dropdown = this.profileDropdown?.nativeElement;
    if (!trigger || !dropdown) return;
    if (isMobileLayout()) {
      this.clearPosition(dropdown);
      return;
    }
    const rect = trigger.getBoundingClientRect();
    dropdown.style.top = `${rect.bottom + window.scrollY + 8}px`;
    dropdown.style.left = `${rect.right + window.scrollX - dropdown.offsetWidth}px`;
  }

  private positionNotifications(): void {
    const trigger = this.notificationTrigger?.nativeElement;
    const dropdown = this.notificationDropdown?.nativeElement;
    if (!trigger || !dropdown) return;
    if (isMobileLayout()) {
      this.clearPosition(dropdown);
      return;
    }
    const rect = trigger.getBoundingClientRect();
    dropdown.style.top = `${rect.bottom + window.scrollY + 8}px`;
    dropdown.style.left = `${rect.right + window.scrollX - dropdown.offsetWidth}px`;
  }

  private clearPosition(element: HTMLElement): void {
    element.style.top = '';
    element.style.left = '';
    element.style.right = '';
    element.style.width = '';
  }

  private setBodyClass(name: string, on: boolean): void {
    document.body.classList.toggle(name, on);
  }
}
