import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ADMIN_PAGE_SIZES } from '../config/admin-page-sizes';
import { AdminStateService } from './admin-state.service';
import { UserService } from '../../../core/services/user.service';

@Injectable({ providedIn: 'root' })
export class AdminUsersFacade {
  private readonly state = inject(AdminStateService);
  private readonly api = inject(UserService);

  async load(page = this.state.usersResult().page || 1): Promise<void> {
    const result = await firstValueFrom(this.api.getUsers(page, ADMIN_PAGE_SIZES.users));
    if (result?.data) this.state.usersResult.set(result.data);
  }

  async loadAgents(): Promise<void> {
    const result = await firstValueFrom(this.api.getAllAgents());
    this.state.availableAgents.set(result?.data ?? []);
  }
}
