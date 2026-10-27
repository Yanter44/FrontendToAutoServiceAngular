import { Component } from '@angular/core';
import { AddTsPhotoModalComponent } from '../add-ts-photo-modal/add-ts-photo-modal.component';
import { CreateApplicationModalComponent } from '../create-application-modal/create-application-modal.component';
import { CreateBranchModalComponent } from '../create-branch-modal/create-branch-modal.component';
import { InviteAgentModalComponent } from '../invite-agent-modal/invite-agent-modal.component';

@Component({
  selector: 'app-agent-modals',
  standalone: true,
  imports: [
    CreateApplicationModalComponent,
    AddTsPhotoModalComponent,
    CreateBranchModalComponent,
    InviteAgentModalComponent
  ],
  template: `
    <app-create-application-modal />
    <app-add-ts-photo-modal />
    <app-create-branch-modal />
    <app-invite-new-agent-modal /> 
  `
})
export class AgentModalsHostComponent {}
