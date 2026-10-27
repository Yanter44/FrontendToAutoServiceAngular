import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PaymentService } from '../../../core/services/payment.service';
import { ADMIN_PAGE_SIZES } from '../config/admin-page-sizes';
import { AdminStateService } from './admin-state.service';

@Injectable({ providedIn: 'root' })
export class AdminPaymentsFacade {
  private readonly state = inject(AdminStateService);
  private readonly api = inject(PaymentService);

  async load(page = this.state.transactionsResult().page || 1): Promise<void> {
    const result = await firstValueFrom(this.api.getTransactions(page, ADMIN_PAGE_SIZES.accruals));
    if (result && typeof result === 'object' && result.data) {
      this.state.transactionsResult.set(result.data);
    }
  }
}
