import { Component } from '@angular/core';
import { AccrualBalanceModalComponent } from '../accrual-balance-modal/accrual-balance-modal.component';
import { AddNewDocumentRequirementModalComponent } from '../add-new-document-requirement-modal/add-new-document-requirement-modal.component';
import { AddNewNeuronNetworkModalComponent } from '../add-new-neuron-network-modal/add-new-neuron-network-modal.component';
import { AddNewPhotoRequirementModalComponent } from '../add-new-photo-requirement-modal/add-new-photo-requirement-modal.component';
import { AddNewPhotoToGalleryModalComponent } from '../add-new-photo-to-gallery-modal/add-new-photo-to-gallery-modal.component';
import { AddNewPromptModalComponent } from '../add-new-prompt-modal/add-new-prompt-modal.component';
import { AddNewPtoModalComponent } from '../add-new-pto-modal/add-new-pto-modal.component';
import { DeductBalanceModalComponent } from '../deduct-balance-modal/deduct-balance-modal.component';
import { DeleteDocumentRequirementModalComponent } from '../delete-document-requirement-modal/delete-document-requirement-modal.component';
import { DeleteNeuronNetworkModalComponent } from '../delete-neuron-network-modal/delete-neuron-network-modal.component';
import { DeletePhotoRequirementModalComponent } from '../delete-photo-requirement-modal/delete-photo-requirement-modal.component';
import { DeletePromptModalComponent } from '../delete-prompt-modal/delete-prompt-modal.component';
import { DeletePtoModalComponent } from '../delete-pto-modal/delete-pto-modal.component';
import { DeleteUserModalComponent } from '../delete-user-modal/delete-user-modal.component';
import { EditApplicationPhotoModalComponent } from '../edit-application-photo-modal/edit-application-photo-modal.component';
import { EditDocumentRequirementModalComponent } from '../edit-document-requirement-modal/edit-document-requirement-modal.component';
import { EditPhotoRequirementModalComponent } from '../edit-photo-requirement-modal/edit-photo-requirement-modal.component';
import { InviteNewUserModalComponent } from '../invite-new-user-modal/invite-new-user-modal.component';
import { RedactNeuronNetworkModalComponent } from '../redact-neuron-network-modal/redact-neuron-network-modal.component';
import { RedactPromptModalComponent } from '../redact-prompt-modal/redact-prompt-modal.component';
import { RedactPtoModalComponent } from '../redact-pto-modal/redact-pto-modal.component';
import { RedactUserModalComponent } from '../redact-user-modal/redact-user-modal.component';
import { RejectApplicationModalComponent } from '../reject-application-modal/reject-application-modal';
import { SelectGalleryPhotoModalComponent } from '../select-gallery-photo-modal/select-gallery-photo-modal.component';
import { AddNewPtoExpertComponent } from '../add-new-pto-expert-modal/add-new-pto-expert-modal';

@Component({
  selector: 'app-admin-modals',
  standalone: true,
  imports: [
    AccrualBalanceModalComponent,
    AddNewDocumentRequirementModalComponent,
    AddNewNeuronNetworkModalComponent,
    AddNewPhotoRequirementModalComponent,
    AddNewPhotoToGalleryModalComponent,
    AddNewPromptModalComponent,
    AddNewPtoModalComponent,
    DeductBalanceModalComponent,
    DeleteDocumentRequirementModalComponent,
    DeleteNeuronNetworkModalComponent,
    DeletePhotoRequirementModalComponent,
    DeletePromptModalComponent,
    DeletePtoModalComponent,
    DeleteUserModalComponent,
    EditApplicationPhotoModalComponent,
    EditDocumentRequirementModalComponent,
    EditPhotoRequirementModalComponent,
    InviteNewUserModalComponent,
    RedactNeuronNetworkModalComponent,
    RedactPromptModalComponent,
    RedactPtoModalComponent,
    RedactUserModalComponent,
    RejectApplicationModalComponent,
    SelectGalleryPhotoModalComponent,
    AddNewPtoExpertComponent,
  ],
  template: `
    <app-invite-new-user-modal />
    <app-delete-user-modal />
    <app-redact-user-modal />
    <app-add-new-pto-modal />
    <app-redact-pto-modal />
    <app-delete-pto-modal />
    <app-add-new-prompt-modal />
    <app-redact-prompt-modal />
    <app-delete-prompt-modal />
    <app-add-new-neuron-network-modal />
    <app-redact-neuron-network-modal />
    <app-delete-neuron-network-modal />
    <app-add-new-photo-requirement-modal />
    <app-add-new-document-requirement-modal />
    <app-edit-photo-requirement-modal />
    <app-edit-document-requirement-modal />
    <app-delete-photo-requirement-modal />
    <app-delete-document-requirement-modal />
    <app-accrual-balance-modal />
    <app-deduct-balance-modal />
    <app-add-new-photo-to-gallery-modal />
    <app-select-gallery-photo-modal />
    <app-edit-application-photo-modal />
    <app-reject-application-modal />
    <app-add-new-pto-expert-modal />
  `
})
export class AdminModalsHostComponent {}
