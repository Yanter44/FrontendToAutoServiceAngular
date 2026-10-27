import { Component, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminModal } from '../../../../core/model';
import { ToastService } from '../../../../core/services/toast.service';
import { UserService } from '../../../../core/services/user.service';
import { isApiOk } from '../../../../shared/util/api.util';
import { AdminModalService } from '../../data/admin-modal.service';
import { AdminUsersFacade } from '../../data/admin-users.facade';

@Component({
  selector: 'app-delete-user-modal',
  standalone: true,
  templateUrl: './delete-user-modal.component.html'
})
export class DeleteUserModalComponent {
  private readonly modal = inject(AdminModalService);
  private readonly users = inject(AdminUsersFacade);
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);
  private readonly key = AdminModal.DeleteUser;

  isOpen(): boolean {
    return this.modal.isOpen(this.key);
  }

  closeFromOverlay(event: Event): void {
    this.modal.closeFromOverlay(event, this.key);
  }

  selectedUserName(): string {
    return this.modal.selectedUser()?.fio || '';
  }

  async submitDeleteUser(): Promise<void> {
    const user = this.modal.selectedUser();
    if (!user) return;
    const result = await firstValueFrom(this.userService.deleteUser({ userId: user.userId }));
    if (isApiOk(result)) {
      this.toast.success('Пользователь удалён');
      this.modal.close(this.key);
      await this.users.load();
    } else {
      this.toast.error(result?.message || 'Не удалось удалить пользователя');
    }
  }
}
