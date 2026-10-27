import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AdminModal } from '../../../../core/model';
import { InvitationService } from '../../../../core/services/invitation.service';
import { ToastService } from '../../../../core/services/toast.service';
import { isApiOk } from '../../../../shared/util/api.util';
import { AdminModalService } from '../../data/admin-modal.service';
import { AdminUsersFacade } from '../../data/admin-users.facade';

@Component({
  selector: 'app-invite-new-user-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './invite-new-user-modal.component.html'
})
export class InviteNewUserModalComponent {
  private readonly modal = inject(AdminModalService);
  private readonly users = inject(AdminUsersFacade);
  private readonly invitationService = inject(InvitationService);
  private readonly toast = inject(ToastService);
  private readonly key = AdminModal.InviteNewUser;

  inviteRole = 'agent';
  inviteEmail = '';

  isOpen(): boolean {
    return this.modal.isOpen(this.key);
  }

  closeFromOverlay(event: Event): void {
    this.modal.closeFromOverlay(event, this.key);
  }

  async submitInvite(): Promise<void> {
    if (!this.inviteRole) {
      this.toast.error('Выберите роль');
      return;
    }
    if (!this.inviteEmail.trim()) {
      this.toast.error('Введите Email');
      return;
    }
    const result = await firstValueFrom(this.invitationService.inviteUser({
      email: this.inviteEmail.trim(),
      role: this.inviteRole
    }));
    if (isApiOk(result)) {
      this.toast.success('Приглашение отправлено');
      this.inviteEmail = '';
      this.modal.close(this.key);
      await this.users.load();
    } else {
      this.toast.error(result?.message || 'Произошла ошибка при приглашении пользователя');
    }
  }
}
