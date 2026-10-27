import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ROLE_LABELS } from '../../../core/utils/helpers';
import { InvitationService } from '../../../core/services/invitation.service';
import { AuthService } from '../../../core/services/auth.service';
import { SessionService } from '../../../core/services/session.service';

@Component({
  selector: 'app-accept-invite-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './accept-invite-page.component.html',
  styleUrls: ['../../../../styles/accept-invite.css']
})
export class AcceptInvitePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly invitationService = inject(InvitationService);
  private readonly authService = inject(AuthService);
  private readonly session = inject(SessionService);

  token = '';
  loading = true;
  formVisible = false;
  errorState = false;
  errorText = 'Приглашение недействительно';
  formError = '';
  roleLabel = '—';
  email = '—';
  fio = '';
  password = '';
  passwordConfirm = '';
  submitting = false;
  submitLabel = 'Зарегистрироваться';

  async ngOnInit(): Promise<void> {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.showErrorState('Ссылка недействительна — токен отсутствует');
      return;
    }
    await this.loadInvitation();
  }

  private async loadInvitation(): Promise<void> {
    const result = await firstValueFrom(this.invitationService.getInvitationByToken(this.token));
    if (!result?.success || !result.data) {
      this.showErrorState(result?.message || 'Приглашение недействительно');
      return;
    }
    this.roleLabel = ROLE_LABELS[result.data.roleType] || result.data.roleType;
    this.email = result.data.email;
    this.loading = false;
    this.formVisible = true;
  }

  async submit(): Promise<void> {
    this.formError = '';
    const fio = this.fio.trim();
    if (!fio) return this.showFormError('Введите ФИО');
    if (fio.length < 2) return this.showFormError('ФИО слишком короткое');
    if (!this.password) return this.showFormError('Введите пароль');
    if (this.password.length < 6) return this.showFormError('Пароль должен быть не короче 6 символов');
    if (this.password !== this.passwordConfirm) return this.showFormError('Пароли не совпадают');

    this.submitting = true;
    this.submitLabel = 'Регистрация…';
    const result = await firstValueFrom(this.authService.acceptInvitation({
      token: this.token,
      fio,
      password: this.password
    }));

    if (!result?.success) {
      this.showFormError(result?.message || 'Не удалось зарегистрироваться');
      this.submitting = false;
      this.submitLabel = 'Зарегистрироваться';
      return;
    }

    this.session.clear();
    await this.router.navigateByUrl('/');
  }

  private showErrorState(message: string): void {
    this.loading = false;
    this.formVisible = false;
    this.errorState = true;
    this.errorText = message;
  }

  private showFormError(message: string): void {
    this.formError = message;
  }
}
