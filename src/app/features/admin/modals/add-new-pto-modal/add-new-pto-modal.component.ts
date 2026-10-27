import { Component, effect, inject, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AdminModal, PtoPricePolicyDraft } from '../../../../core/model';
import { PtoService } from '../../../../core/services/pto.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AdminModalService } from '../../data/admin-modal.service';
import { AdminPtosFacade } from '../../data/admin-ptos.facade';
import { AdminStateService } from '../../data/admin-state.service';
import { AddPtoRequest } from '../../../../core/model';

@Component({
  selector: 'app-add-new-pto-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-new-pto-modal.component.html'
})
export class AddNewPtoModalComponent {
  private readonly AdminModals = inject(AdminModalService);
  public readonly state = inject(AdminStateService);
  private readonly ptos = inject(AdminPtosFacade);
  private readonly ptoService = inject(PtoService);
  private readonly toast = inject(ToastService);
  private readonly key = AdminModal.AddNewPto;
  private policiesSynced = false;

  ptoName = '';
  ptoRsa = '';
  ptoAddress = '';
  ptoLatitude: number | null = null;
  ptoLongitude: number | null = null; 
  ptoMaximumThroughput: number | null = null;
  ptoOperatorKey: File | null = null;
  pricePolicies: PtoPricePolicyDraft[] = [];

  constructor() {
    effect(() => {
      if (!this.AdminModals.isOpen(this.key)) {
        this.policiesSynced = false;
        return;
      }
      if (!this.policiesSynced) {
        untracked(() => {
          this.policiesSynced = true;
          this.syncPricePolicies();
        });
      }
    });
  }

  isOpen(): boolean {
    return this.AdminModals.isOpen(this.key);
  }

  closeFromOverlay(event: Event): void {
    this.AdminModals.closeFromOverlay(event, this.key);
  }

  openAddExpertModal(event?: Event): void {
    event?.preventDefault();
    this.AdminModals.open(AdminModal.AddNewPtoExpert);
  }

  removeExpert(index: number): void {
    this.state.ptoExpertsDraft.update(list => {
      const newList = [...list];
      newList.splice(index, 1);
      return newList;
    });
  }
  onOperatorKeySelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.ptoOperatorKey = input.files?.[0] ?? null;
  }
  async submitNewPto(): Promise<void> {
    if (!this.ptoName.trim() || !this.ptoRsa.trim()) {
      this.toast.error('Заполните обязательные поля: Название и Номер РСА');
      return;
    }
    const requestData: AddPtoRequest = {
    name: this.ptoName.trim(),
    rsaNumber: this.ptoRsa.trim(),
    address: this.ptoAddress.trim(),
    latitude: this.ptoLatitude,
    longitude: this.ptoLongitude,
    maximumThroughput: this.ptoMaximumThroughput ?? 0,
    operatorKeyArchive: this.ptoOperatorKey,
    pricePolicies: this.pricePolicies.map(row => ({
      vehicleCategoriesBySrtsId: row.vehicleCategoriesBySrtsId,
      price: Number(row.price) || 0
    })),
    experts: this.state.ptoExpertsDraft().map(exp => ({
      firstName: exp.firstName,
      lastName: exp.lastName,
      middleName: exp.middleName,
      sequenceNumber: exp.sequenceNumber,
      keyArchive: exp.keyFile
    }))
  };

  const ok = await firstValueFrom(this.ptoService.addNewPto(requestData));
    if (ok) {
      this.resetForm();
      this.AdminModals.close(this.key);
      await this.ptos.load();
      this.toast.success('ПТО добавлен');
    } else {
      this.toast.error('Не удалось добавить ПТО');
    }
  }

  private syncPricePolicies(): void {
    this.pricePolicies = this.state.vehicleCategoriesBySrts().map(category => ({
      vehicleCategoriesBySrtsId: category.id,
      name: category.name,
      price: this.pricePolicies.find(row => row.vehicleCategoriesBySrtsId === category.id)?.price ?? null
    }));
  }

  private resetForm(): void {
    this.ptoName = '';
    this.ptoRsa = '';
    this.ptoAddress = '';
    this.ptoLatitude = null;
    this.ptoLongitude = null; 
    this.ptoMaximumThroughput = null;
    this.pricePolicies = this.pricePolicies.map(row => ({ ...row, price: null }));
  }
}
