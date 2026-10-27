import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminModal, TransactionDto, TransactionType } from '../../../../core/model';
import { accrualsSortConfig } from '../../../../core/config/sort-configs';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ScreenLoadingComponent } from '../../../../shared/components/screen-loading/screen-loading.component';
import { RuDatePipe } from '../../../../shared/pipes/ru-date.pipe';
import { filterPageItems } from '../../../../shared/util/filter.util';
import { ADMIN_PAGE_SIZES } from '../../config/admin-page-sizes';
import { AdminModalService } from '../../data/admin-modal.service';
import { AdminPaymentsFacade } from '../../data/admin-payments.facade';
import { AdminStateService } from '../../data/admin-state.service';
import { AdminUsersFacade } from '../../data/admin-users.facade';

@Component({
  selector: 'app-admin-accruals-screen',
  standalone: true,
  imports: [FormsModule, PaginationComponent, RuDatePipe, ScreenLoadingComponent],
  templateUrl: './accruals-screen.component.html'
})
export class AdminAccrualsScreenComponent implements OnInit {
  readonly state = inject(AdminStateService);
  private readonly payments = inject(AdminPaymentsFacade);
  private readonly users = inject(AdminUsersFacade);
  private readonly modal = inject(AdminModalService);

  readonly search = signal('');
  readonly sort = signal('newest');
  readonly page = signal(1);
  readonly loading = signal(true);
  readonly pageSize = ADMIN_PAGE_SIZES.accruals;
  readonly result = computed(() => this.state.transactionsResult());
  readonly items = computed(() =>
    filterPageItems(
      this.result().items ?? [],
      this.search(),
      accrualsSortConfig.searchFields,
      this.sort(),
      accrualsSortConfig.sortOptions
    )
  );

  async ngOnInit(): Promise<void> {
    try {
      await this.users.loadAgents();
      await this.load(1);
    } finally {
      this.loading.set(false);
    }
  }

  async load(page: number): Promise<void> {
    this.loading.set(true);
    this.page.set(page);
    try {
      await this.payments.load(page);
    } finally {
      this.loading.set(false);
    }
  }

  amountClass(tx: TransactionDto): string {
    return tx.transactionType === TransactionType.Credit ? 'TransactionAmountCredit' : 'TransactionAmountDebit';
  }

  amountText(tx: TransactionDto): string {
    const sign = tx.transactionType === TransactionType.Credit ? '+' : '-';
    return `${sign}${tx.amount.toLocaleString('ru-RU')} ₽`;
  }

  credit(): void {
    this.modal.open(AdminModal.AccrualBalance);
  }

  debit(): void {
    this.modal.open(AdminModal.DeductBalance);
  }
}
