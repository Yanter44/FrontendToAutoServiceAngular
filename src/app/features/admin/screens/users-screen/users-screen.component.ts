import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminModal, RoleType, UserDto } from '../../../../core/model';
import { usersSortConfig } from '../../../../core/config/sort-configs';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ScreenLoadingComponent } from '../../../../shared/components/screen-loading/screen-loading.component';
import { RuDatePipe } from '../../../../shared/pipes/ru-date.pipe';
import { filterPageItems } from '../../../../shared/util/filter.util';
import { formatMoney } from '../../../../shared/util/money.util';
import { userRoleBadgeClass, userRoleLabel } from '../../../../shared/util/role.util';
import { ADMIN_PAGE_SIZES } from '../../config/admin-page-sizes';
import { AdminModalService } from '../../data/admin-modal.service';
import { AdminStateService } from '../../data/admin-state.service';
import { AdminUsersFacade } from '../../data/admin-users.facade';

@Component({
  selector: 'app-admin-users-screen',
  standalone: true,
  imports: [FormsModule, PaginationComponent, RuDatePipe, ScreenLoadingComponent],
  templateUrl: './users-screen.component.html'
})
export class AdminUsersScreenComponent implements OnInit {
  readonly state = inject(AdminStateService);
  private readonly users = inject(AdminUsersFacade);
  private readonly modal = inject(AdminModalService);

  readonly search = signal('');
  readonly sort = signal('newest');
  readonly page = signal(1);
  readonly loading = signal(true);
  readonly pageSize = ADMIN_PAGE_SIZES.users;
  readonly result = computed(() => this.state.usersResult());
  readonly items = computed(() =>
    filterPageItems(this.result().items ?? [], this.search(), usersSortConfig.searchFields, this.sort(), usersSortConfig.sortOptions)
  );

  async ngOnInit(): Promise<void> {
    await this.load(1);
  }

  async load(page: number): Promise<void> {
    this.loading.set(true);
    this.page.set(page);
    try {
      await this.users.load(page);
    } finally {
      this.loading.set(false);
    }
  }

  roleClass(role: string): string {
    return userRoleBadgeClass(role);
  }

  roleLabel(role: string): string {
    return userRoleLabel(role);
  }

  balanceText(user: UserDto): string {
    if (user.role !== RoleType.Agent) return '—/—';
    return `${formatMoney(user.balance)}/${formatMoney(user.debtLimit)}`;
  }

  invite(): void {
    this.modal.open(AdminModal.InviteNewUser);
  }

  redact(user: UserDto): void {
    this.modal.selectedUser.set(user);
    this.modal.open(AdminModal.RedactUser);
  }

  remove(user: UserDto): void {
    this.modal.selectedUser.set(user);
    this.modal.open(AdminModal.DeleteUser);
  }
}
