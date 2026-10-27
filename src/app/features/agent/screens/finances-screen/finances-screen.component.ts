import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { TransactionDto, TransactionType } from '../../../../core/model';
import { AgentStateService } from '../../data/agent-state.service';
import { AgentService } from '../../../../core/services/agent.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ScreenLoadingComponent } from '../../../../shared/components/screen-loading/screen-loading.component';
import { RuDatePipe } from '../../../../shared/pipes/ru-date.pipe';

@Component({
  selector: 'app-agent-finances-screen',
  standalone: true,
  imports: [FormsModule, PaginationComponent, RuDatePipe, ScreenLoadingComponent],
  templateUrl: './finances-screen.component.html',
  host: { class: 'FinancesScreen ScreenContainer' },
  styles: [`:host { display: block; height: 100%; min-height: 0; }`]
})
export class AgentFinancesScreenComponent implements OnInit {
  readonly agentState = inject(AgentStateService);
  private readonly agent = inject(AgentService);

  readonly pageSize = 10;
  readonly loading = signal(!this.agentState.financesLoaded());
  dateFrom = '';
  dateTo = '';
  statusFilter = '';
  typeFilter = '';

  async ngOnInit(): Promise<void> {
    if (this.agentState.financesLoaded()) return;

    this.loading.set(true);
    try {
      await this.ensureFinances();
      const historyLoaded = await this.fetchPage(1);
      if (historyLoaded) this.agentState.financesLoaded.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  money(value: number | null): string {
    if (value == null) return '—';
    return `${value} ₽`;
  }

  isCredit(tx: TransactionDto): boolean {
    return tx.transactionType === TransactionType.Credit;
  }

  isDebit(tx: TransactionDto): boolean {
    return tx.transactionType === TransactionType.Debit;
  }

  amountText(tx: TransactionDto): string {
    if (this.isCredit(tx)) return `+${tx.amount} ₽`;
    if (this.isDebit(tx)) return `-${tx.amount} ₽`;
    return `${tx.amount} ₽`;
  }

  statusLabel(tx: TransactionDto): string {
    const status = tx.status || (tx as TransactionDto & { transactionStatus?: string }).transactionStatus;
    if (status === 'Completed') return 'Успешно';
    return status || '—';
  }

  isSuccess(tx: TransactionDto): boolean {
    const status = tx.status || (tx as TransactionDto & { transactionStatus?: string }).transactionStatus;
    return status === 'Completed';
  }

  onDateRangeChange(): void {
    if (!this.dateFrom || !this.dateTo) return;
    const startDate = new Date(this.dateFrom);
    const endDate = new Date(this.dateTo);
    console.log('Выбран старт:', startDate.toLocaleDateString('ru-RU'));
    console.log('Выбран конец:', endDate.toLocaleDateString('ru-RU'));
    const formatDate = (date: Date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    };
    console.log('Отформатированный старт:', formatDate(startDate));
    console.log('Отформатированный конец:', formatDate(endDate));
  }

  async loadPage(page: number): Promise<void> {
    const cached = this.agentState.financesPage(page);
    if (cached) {
      this.agentState.rememberFinancesPage(cached);
      return;
    }

    this.loading.set(true);
    try {
      await this.fetchPage(page);
    } finally {
      this.loading.set(false);
    }
  }

  private async fetchPage(page: number): Promise<boolean> {
    const result = await firstValueFrom(this.agent.getMyBalanceTransactionStory(page, this.pageSize));
    if (!result?.data) return false;
    this.agentState.rememberFinancesPage(result.data);
    return true;
  }

  private async ensureFinances(): Promise<void> {
    const current = this.agentState.finances();
    if (current.balance != null && current.debtlimit != null && current.currentdebt != null) return;

    const [balance, debtlimit, currentdebt] = await Promise.all([
      firstValueFrom(this.agent.getMyBalance()),
      firstValueFrom(this.agent.getMyDebtLimit()),
      firstValueFrom(this.agent.getMyCurrentDebt())
    ]);

    this.agentState.finances.set({
      balance: balance?.data ?? null,
      debtlimit: debtlimit?.data ?? null,
      currentdebt: currentdebt?.data ?? null
    });
    this.agentState.headerBalance.set(balance?.data ?? this.agentState.headerBalance());
  }
}
