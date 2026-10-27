import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-not-found',
    standalone: true,
    templateUrl: './not-found.component.html',
    styleUrls: ['../../../../styles/not-found.css']
})
export class NotFoundComponent {

    private readonly router = inject(Router);

    goHome(): void {
        this.router.navigate(['/']);
    }

    goBack(): void {
        window.history.back();
    }
}