import { Component, ElementRef, QueryList, ViewChildren, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SessionService } from '../../../core/services/session.service';
import { AuthCard, FinishRegistrationRequest } from '../../../core/model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-authorize-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './authorize-page.component.html',
  styleUrls: ['../../../../styles/authorize.css', './authorize-page.component.css']
})
export class AuthorizePageComponent {
  private readonly auth = inject(AuthService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  card: AuthCard = AuthCard.Login;
  loginEmail = '';
  loginPassword = '';
  registerEmail = '';
  registerPassword = '';
  fio = '';
  code = ['', '', '', '', '', ''];
  submitting = false;

  private regAuthdata: FinishRegistrationRequest = {
    registrationId: null,
    fio: null,
    email: null,
    password: null
  };

  @ViewChildren('codeInput') codeInputs!: QueryList<ElementRef<HTMLInputElement>>;

  showRegister(): void {
    this.card = AuthCard.Register;
  }

  showLogin(): void {
    this.card = AuthCard.Login;
  }

  async login(): Promise<void> {
    if (!this.loginEmail || !this.loginPassword) {
      alert('Пожалуйста, заполните все поля');
      return;
    }
    this.submitting = true;
    const success = await firstValueFrom(this.auth.login(this.loginEmail, this.loginPassword));
    this.submitting = false;
    if (success) {
      this.session.clear();
      await this.router.navigateByUrl('/');
    } else {
      alert('Неверный email или пароль');
    }
  }

  async register(): Promise<void> {
    if (!this.registerEmail || !this.registerPassword) {
      alert('Пожалуйста, заполните все поля');
      return;
    }
    this.submitting = true;
    const result = await firstValueFrom(this.auth.register(this.registerEmail, this.registerPassword));
    this.submitting = false;
    if (!result.ok) {
      alert(result.message || 'Неверный email или пароль');
      return;
    }
    if (result.data) {
      localStorage.setItem('registrationKey', result.data);
      this.regAuthdata.Email = this.registerEmail;
      this.regAuthdata.Password = this.registerPassword;
      this.regAuthdata.RegistrationId = result.data;
      this.regAuthdata.email = this.registerEmail;
      this.regAuthdata.password = this.registerPassword;
      this.regAuthdata.registrationId = result.data;
    }
    this.card = AuthCard.Code;
  }

  onCodeInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.code[index] = input.value.slice(-1);
    if (input.value && index < 5) {
      this.codeInputs.get(index + 1)?.nativeElement.focus();
    }
  }

  onCodeKeydown(index: number, event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && !input.value && index > 0) {
      this.codeInputs.get(index - 1)?.nativeElement.focus();
    }
  }

  async confirmCode(): Promise<void> {
    const joined = this.code.join('');
    const registrationId = localStorage.getItem('registrationKey');
    if (joined.length !== 6) {
      alert('Пожалуйста, введите полный код');
      return;
    }
    this.submitting = true;
    const success = await firstValueFrom(this.auth.confirmCode({
      registrationId: registrationId || this.regAuthdata.registrationId || '',
      code: joined
    }));
    this.submitting = false;
    if (success) {
      this.card = AuthCard.Name;
    } else {
      alert('Неверный код');
    }
  }

  async finish(): Promise<void> {
    if (!this.fio) {
      alert('Пожалуйста, введите ваше ФИО');
      return;
    }
    this.regAuthdata.fio = this.fio;
    this.submitting = true;
    const success = await firstValueFrom(this.auth.finishRegistration(this.regAuthdata));
    this.submitting = false;
    if (success) {
      this.session.clear();
      await this.router.navigateByUrl('/');
    } else {
      alert('Что-то пошло не так :(');
    }
  }
}
