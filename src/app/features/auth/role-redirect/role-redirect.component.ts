import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { SessionService } from '../../../core/services/session.service';

@Component({
  selector: 'app-role-redirect',
  standalone: true,
  template: ''
})
export class RoleRedirectComponent implements OnInit {
  private readonly session = inject(SessionService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  async ngOnInit(): Promise<void> {
    if (!this.auth.canAttemptRefresh()) {
      await this.router.navigateByUrl('/login');
      return;
    }
    try {
      const me = await firstValueFrom(this.session.ensureMe());
      if (me?.isBlocked) {
        await this.router.navigateByUrl('/blocked');
        return;
      }
      if (me?.roleType) {
        await this.router.navigateByUrl(this.session.homePathForRole(me.roleType));
        return;
      }
    } catch {
      await this.router.navigateByUrl('/login');
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    await this.router.navigateByUrl('/login');
  }
}
