import { Component, effect, inject, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminModalService } from '../../data/admin-modal.service';
import { AdminModal } from "../../../../core/model";
import { ToastService } from '../../../../core/services/toast.service';
import { AdminStateService } from '../../data/admin-state.service';
import { PtoExpertDraft } from '../../../../core/model';
import {  ElementRef, ViewChild } from '@angular/core';
@Component({
  selector: 'app-add-new-pto-expert-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-new-pto-expert-modal.component.html'
})
export class AddNewPtoExpertComponent{
    @ViewChild('expertKeyInput') expertKeyInput!: ElementRef<HTMLInputElement>;

    private readonly AdminModals = inject(AdminModalService);
    private readonly state = inject(AdminStateService); 
    private readonly key = AdminModal.AddNewPtoExpert;
    private readonly toast = inject(ToastService);

    expertFirstName = '';
    expertMiddleName = '';
    expertLastName = '';
    expertSequenceNumber = 0;
    expertKeyFile: File | null = null; 
    
  isOpen(): boolean { 
    return this.AdminModals.isOpen(this.key);
  }

  closeFromOverlay(event: Event): void {
    this.AdminModals.closeFromOverlay(event, this.key);
  }
  onExpertKeySelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.expertKeyFile = input.files?.[0] ?? null;
  }
  addNewExpert(): void {
    if (!this.expertLastName || !this.expertFirstName || !this.expertSequenceNumber) {
      this.toast.error('Заполните фамилию, имя и код эксперта');  
      return;
    }
    if (!this.expertKeyFile) {
      this.toast.error('Прикрепите файл ключа (.zip)');
      return;
    }
    const newExpert: PtoExpertDraft = {
      firstName: this.expertFirstName.trim(),
      lastName: this.expertLastName.trim(),
      middleName: this.expertMiddleName.trim(),
      sequenceNumber: this.expertSequenceNumber,
      keyFile: this.expertKeyFile
    };

    this.state.ptoExpertsDraft.update(list => [...list, newExpert]);

    this.resetExpertForm();
    this.AdminModals.close(this.key);
    this.toast.success('Эксперт добавлен');
  }

  private resetExpertForm(): void {
    this.expertFirstName = '';
    this.expertMiddleName = '';
    this.expertLastName = '';
    this.expertSequenceNumber = 0;
    this.expertKeyFile = null;
    if (this.expertKeyInput?.nativeElement) {
      this.expertKeyInput.nativeElement.value = '';
    }
  }
}
