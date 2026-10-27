import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'applications' },
      { path: 'applications', loadComponent: () => import('./screens/applications-screen/applications-screen.component').then(m => m.AdminApplicationsScreenComponent) },
      { path: 'users', loadComponent: () => import('./screens/users-screen/users-screen.component').then(m => m.AdminUsersScreenComponent) },
      { path: 'ptos', loadComponent: () => import('./screens/ptos-screen/ptos-screen.component').then(m => m.AdminPtosScreenComponent) },
      { path: 'prompts', loadComponent: () => import('./screens/prompts-screen/prompts-screen.component').then(m => m.AdminPromptsScreenComponent) },
      { path: 'photogallery', loadComponent: () => import('./screens/photo-gallery-screen/photo-gallery-screen.component').then(m => m.AdminPhotoGalleryScreenComponent) },
      { path: 'requirements', loadComponent: () => import('./screens/requirements-screen/requirements-screen.component').then(m => m.AdminRequirementsScreenComponent) },
      { path: 'neuron-networks', loadComponent: () => import('./screens/neuron-networks-screen/neuron-networks-screen.component').then(m => m.AdminNeuronNetworksScreenComponent) },
      { path: 'accruals', loadComponent: () => import('./screens/accruals-screen/accruals-screen.component').then(m => m.AdminAccrualsScreenComponent) }
    ]
  }
];
