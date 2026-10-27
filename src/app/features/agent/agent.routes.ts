import { Routes } from '@angular/router';
import { AgentLayoutComponent } from './layout/agent-layout.component';

export const AGENT_ROUTES: Routes = [
  {
    path: '',
    component: AgentLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'applications' },
      { path: 'applications', loadComponent: () => import('./screens/applications-screen/applications-screen.component').then(m => m.AgentApplicationsScreenComponent) },
      { path: 'finances', loadComponent: () => import('./screens/finances-screen/finances-screen.component').then(m => m.AgentFinancesScreenComponent) },
      { path: 'branches', loadComponent: () => import('./screens/branches-screen/branches-screen.component').then(m => m.AgentBranchesScreenComponent) }
    ]
  }
];
