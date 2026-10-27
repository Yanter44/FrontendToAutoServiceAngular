import { Component, computed, effect, inject, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AdminModal } from '../../../../core/model';
import { PaymentService } from '../../../../core/services/payment.service';
import { ToastService } from '../../../../core/services/toast.service';
import { generateUUID } from '../../../../core/utils/helpers';
import { formatMoney } from '../../../../shared/util/money.util';
import { AdminModalService } from '../../data/admin-modal.service';
import { AdminPaymentsFacade } from '../../data/admin-payments.facade';
import { AdminStateService } from '../../data/admin-state.service';
import { AdminUsersFacade } from '../../data/admin-users.facade';

@Component({
  selector: 'app-accrual-balance-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './accrual-balance-modal.component.html'
})
export class AccrualBalanceModalComponent {
  private readonly modal = inject(AdminModalService);
  private readonly state = inject(AdminStateService);
  private readonly users = inject(AdminUsersFacade);
  private readonly payments = inject(AdminPaymentsFacade);
  private readonly paymentService = inject(PaymentService);
  private readonly toast = inject(ToastService);
  private readonly key = AdminModal.AccrualBalance;

  creditAgentId: number | null = null;
  creditAmount: number | null = 5000;
  creditComment = '';
  creditQuick = 5000;

  readonly agents = computed(() => this.state.availableAgents());

  constructor() {
    effect(() => {
      if (!this.modal.isOpen(this.key)) return;
      untracked(() => {
        if (!this.agents().length) void this.users.loadAgents();
        const first = this.agents()[0];
        if (first && this.creditAgentId == null) this.creditAgentId = first.id;
      });
    });
  }

  isOpen(): boolean {
    return this.modal.isOpen(this.key);
  }

  closeFromOverlay(event: Event): void {
    this.modal.closeFromOverlay(event, this.key);
  }

  setCreditQuick(value: number): void {
    this.creditQuick = value;
    this.creditAmount = value;
  }

  creditBalanceText(): string {
    return formatMoney(this.agents().find(agent => agent.id === Number(this.creditAgentId))?.balance);
  }

  async submitCredit(): Promise<void> {
    const agentId = Number(this.creditAgentId);
    const amount = Number(this.creditAmount);
    if (!agentId) {
      this.toast.error('Выберите агента');
      return;
    }
    if (!amount || amount <= 0) {
      this.toast.error('Введите корректную сумму');
      return;
    }
    const ok = await firstValueFrom(this.paymentService.credit({
      agentId,
      amount,
      comment: this.creditComment.trim(),
      idempotencyKey: generateUUID()
    }));
    if (ok) {
      this.modal.close(this.key);
      this.creditComment = '';
      await this.users.loadAgents();
      await this.payments.load();
      this.toast.success('Баланс начислен');
    } else {
      this.toast.error('Произошла ошибка при начислении средств');
    }
  }
}
