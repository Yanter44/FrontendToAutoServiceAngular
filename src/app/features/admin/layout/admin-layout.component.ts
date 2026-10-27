import { NgComponentOutlet } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, ViewEncapsulation, computed, effect, inject, signal, untracked } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, firstValueFrom } from 'rxjs';
import { AdminModal, ApplicationPhoto, NotificationType } from '../../../core/model';
import { AdminProfileService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoaderService } from '../../../core/services/loader.service';
import { NotificationHubService, UiNotification } from '../../../core/services/notification-hub.service';
import { SessionService } from '../../../core/services/session.service';
import { SignalRService } from '../../../core/services/signalr.service';
import { isMobileLayout } from '../../../core/utils/helpers';
import { AppLoaderComponent } from '../../../shared/components/app-loader/app-loader.component';
import { NotificationIconComponent } from '../../../shared/components/notification-icon/notification-icon.component';
import { ThemeSwitchComponent } from '../../../shared/components/theme-switch/theme-switch.component';
import { AdminModalsHostComponent } from '../modals/admin-modals-host/admin-modals-host.component';
import { AdminModalService } from '../data/admin-modal.service';
import { AdminNeuronFacade } from '../data/admin-neuron.facade';
import { AdminPromptsFacade } from '../data/admin-prompts.facade';
import { AdminDetailsSidebarService } from '../data/admin-details-sidebar.service';
import { AdminStateService } from '../data/admin-state.service';
import { ADMIN_STYLE_URLS } from './admin-styles';
import { staffApplicationStatusMeta } from '../../../core/utils/staff-application-status-meta';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgComponentOutlet,
    AppLoaderComponent,
    AdminModalsHostComponent, NotificationIconComponent, ThemeSwitchComponent],
  templateUrl: './admin-layout.component.html',
  styleUrls: ADMIN_STYLE_URLS,
  encapsulation: ViewEncapsulation.None
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  readonly state = inject(AdminStateService);
  readonly detailsSidebar = inject(AdminDetailsSidebarService);
  readonly modal = inject(AdminModalService);
  readonly loader = inject(LoaderService);
  readonly notificationHub = inject(NotificationHubService);
  readonly session = inject(SessionService);
  private readonly adminProfile = inject(AdminProfileService);
  private readonly signalR = inject(SignalRService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly neurons = inject(AdminNeuronFacade);
  private readonly prompts = inject(AdminPromptsFacade);

  readonly profileOpen = signal(false);
  readonly notificationsOpen = signal(false);
  readonly detailsTab = signal<'vehicle' | 'media'>('vehicle');
  readonly mobileNavOpen = signal(false);

  readonly displayName = computed(() => this.session.displayName());
  readonly avatarLetter = computed(() => (this.displayName().trim()[0] || '?').toUpperCase());
  
  readonly roleText = computed(() => {
    const role = this.session.me()?.roleType;
    return role ? `Должность: ${role}` : '';
  });

  readonly profile = computed(() => this.state.profile());

  readonly sidebarOpen = computed(() => this.detailsSidebar.open());
  readonly selectedApplication = computed(() => this.state.selectedApplication());

  readonly applicationStatus = computed(() => {
    const app = this.selectedApplication();
    return staffApplicationStatusMeta(app?.status, app?.errorMessage);
  });
  
  readonly unreadCount = computed(() => this.notificationHub.unreadCount());
  readonly notifications = computed(() =>
    [...this.notificationHub.items()].sort(
      (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    )
  );

  @ViewChild('profileTrigger') profileTrigger?: ElementRef<HTMLElement>;
  @ViewChild('profileDropdown') profileDropdown?: ElementRef<HTMLElement>;
  @ViewChild('notificationTrigger') notificationTrigger?: ElementRef<HTMLElement>;
  @ViewChild('notificationDropdown') notificationDropdown?: ElementRef<HTMLElement>;

  constructor() {
    effect(() => {
      this.state.selectedApplication();
      untracked(() => this.detailsTab.set('vehicle'));
    });
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeSidebar();
        this.closeMobileNav();
        this.closeAllDropdowns();
      });
  }

  async ngOnInit(): Promise<void> {
    this.loader.show();
    try {

      this.loader.next();
      const me = await firstValueFrom(this.session.ensureMe());
      if (!me) {
        await this.router.navigateByUrl('/login');
        return;
      }

      this.loader.next();

      this.loader.next();
      try {
        await this.signalR.start();
      } catch (error) {
        console.error('Не удалось запустить SignalR:', error);
      }

      this.loader.next();
      await this.notificationHub.init();
      this.loader.next();
    } catch (error) {
      console.error('Ошибка инициализации приложения:', error);
    } finally {
      this.loader.hide();
    }
  }

  ngOnDestroy(): void {
    document.body.classList.remove('MobileNavOpen', 'SheetOpen');
    void this.signalR.stop();
  }

  toggleMobileNav(event: Event): void {
    event.stopPropagation();
    const next = !this.mobileNavOpen();
    this.mobileNavOpen.set(next);
    document.body.classList.toggle('MobileNavOpen', next);
    if (next) this.closeAllDropdowns();
  }

  closeMobileNav(): void {
    this.mobileNavOpen.set(false);
    document.body.classList.remove('MobileNavOpen');
  }

  toggleProfile(event: Event): void {
    event.stopPropagation();
    const next = !this.profileOpen();
    this.closeAllDropdowns();
    if (next) {
      this.profileOpen.set(true);
      this.setSheetOpen(true);
      queueMicrotask(() => this.positionProfile());
    }
  }

  toggleNotifications(event: Event): void {
    event.stopPropagation();
    const next = !this.notificationsOpen();
    this.closeAllDropdowns();
    if (next) {
      this.notificationsOpen.set(true);
      this.setSheetOpen(true);
      queueMicrotask(() => this.positionNotifications());
    }
  }

  closeAllDropdowns(): void {
    this.profileOpen.set(false);
    this.notificationsOpen.set(false);
    this.setSheetOpen(false);
  }

  setDetailsTab(tab: 'vehicle' | 'media'): void {
    this.detailsTab.set(tab);
  }

  closeSidebar(): void {
    this.detailsSidebar.close();
    this.state.selectedApplication.set(null);
  }

  openEditPhoto(event: Event, photo: ApplicationPhoto): void {
    event.preventDefault();
    event.stopPropagation();
    void this.prepareEditPhoto(photo);
  }

  photoUrl(photo: ApplicationPhoto): string {
    return photo.url || photo.photoUrl || '';
  }

  notificationTitle(type?: string, title?: string): string {
    if (type === NotificationType.ApplicationSendToModeration) return 'Заявка отправлена на модерацию';
    return title || 'Уведомление';
  }

  async signOut(): Promise<void> {
    try {
      await firstValueFrom(this.auth.signOut());
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
    this.session.clear();
    this.state.profile.set(null);
    await this.router.navigateByUrl('/login');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const inProfile =
      !!this.profileDropdown?.nativeElement.contains(target) ||
      !!this.profileTrigger?.nativeElement.contains(target);
    const inNotifications =
      !!this.notificationDropdown?.nativeElement.contains(target) ||
      !!this.notificationTrigger?.nativeElement.contains(target);
    if (!inProfile && !inNotifications) {
      this.closeAllDropdowns();
    }

    if (!this.sidebarOpen()) return;
    if (this.modal.hasOpenModal()) return;
    const insideSidebar = target.closest('.DetailsSidebar');
    const clickedRow = target.closest('.DetailsSidebarRow');
    if (!insideSidebar && !clickedRow) {
      this.closeSidebar();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.profileOpen()) this.positionProfile();
    if (this.notificationsOpen()) this.positionNotifications();
    if (!isMobileLayout()) this.closeMobileNav();
  }

  private async prepareEditPhoto(photo: ApplicationPhoto): Promise<void> {
    this.modal.selectedPhoto.set(photo);
    this.state.generatedPhotoByAi.set(null);
    this.state.additionalPhotos.set([]);
    this.modal.selectedPromptTags.set([]);
    await this.neurons.loadAll();
    await this.prompts.loadAll();
    this.modal.open(AdminModal.EditApplicationPhoto);
  }

  private setSheetOpen(open: boolean): void {
    document.body.classList.toggle('SheetOpen', open && isMobileLayout());
  }

  private positionProfile(): void {
    const dropdown = this.profileDropdown?.nativeElement;
    const trigger = this.profileTrigger?.nativeElement;
    if (!dropdown || !trigger) return;
    if (isMobileLayout()) {
      dropdown.style.top = '';
      dropdown.style.left = '';
      dropdown.style.right = '';
      dropdown.style.width = '';
      return;
    }
    const rect = trigger.getBoundingClientRect();
    dropdown.style.top = `${rect.bottom + window.scrollY + 8}px`;
    dropdown.style.left = `${rect.right + window.scrollX - dropdown.offsetWidth}px`;
  }

  private positionNotifications(): void {
    const dropdown = this.notificationDropdown?.nativeElement;
    const trigger = this.notificationTrigger?.nativeElement;
    if (!dropdown || !trigger) return;
    if (isMobileLayout()) {
      dropdown.style.top = '';
      dropdown.style.left = '';
      dropdown.style.right = '';
      dropdown.style.width = '';
      return;
    }
    const rect = trigger.getBoundingClientRect();
    dropdown.style.top = `${rect.bottom + window.scrollY + 8}px`;
    dropdown.style.left = `${rect.right + window.scrollX - dropdown.offsetWidth}px`;
  }
  showMoreNotifications(event: Event): void {
    event.stopPropagation();
    void this.notificationHub.loadMore();
  }

  markNotificationRead(notification: UiNotification, event: Event): void {
    event.stopPropagation();
    void this.notificationHub.markAsRead(notification.id);
  }

  markAllNotifications(event: Event): void {
    event.stopPropagation();
    void this.notificationHub.markAllAsRead();
  }
}