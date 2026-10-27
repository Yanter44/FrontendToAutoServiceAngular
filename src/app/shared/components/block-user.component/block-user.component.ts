import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { SessionService } from '../../../core/services/session.service';

@Component({
    selector: 'app-block-user',
    standalone: true,
    templateUrl: './block-user.component.html',
    styleUrls: ['../../../../styles/block-user.css']
})
export class BlockUserComponent {
    private readonly router = inject(Router);
    private readonly auth = inject(AuthService);
    private readonly session = inject(SessionService);

    async goHome(): Promise<void> {
        await firstValueFrom(this.auth.signOut());
        this.session.clear();
        await this.router.navigateByUrl('/login');
    }

    goBack(): void {
        window.history.back();
    }
}