import { Routes } from '@angular/router';
import { RoleType } from './core/model';
import { authGuard, blockedPageGuard, guestGuard, roleGuard } from './core/guards/auth.guards';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/auth/role-redirect/role-redirect.component').then(m => m.RoleRedirectComponent) },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/authorize-page/authorize-page.component').then(m => m.AuthorizePageComponent)
  },
  {
    path: 'invite',
    loadComponent: () => import('./features/invite/accept-invite-page/accept-invite-page.component').then(m => m.AcceptInvitePageComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard([RoleType.Admin, RoleType.Moderator])],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'agent',
    canActivate: [authGuard, roleGuard([RoleType.Agent])],
    loadChildren: () => import('./features/agent/agent.routes').then(m => m.AGENT_ROUTES)
  },
  {
    path: 'blocked',
    canActivate: [blockedPageGuard],
    loadComponent: () => import('./shared/components/block-user.component/block-user.component').then(m => m.BlockUserComponent)
  },
  {
        path: '**',
        loadComponent: () =>
            import('./shared/components/not-found.component/not-found.component')
                .then(m => m.NotFoundComponent)
  }
];
