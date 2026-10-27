import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AgentModal, ApplicationDto, ApplicationFormModel, ApplicationStatus, PtoDto } from '../../../../core/model';
import { ApplicationService } from '../../../../core/services/application.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AgentModalService } from '../../data/agent-modal.service';
import { AgentStateService } from '../../data/agent-state.service';

@Component({
  selector: 'app-create-application-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-application-modal.component.html'
})
export class CreateApplicationModalComponent {
  readonly agentState = inject(AgentStateService);
  private readonly agentModals = inject(AgentModalService);
  private readonly applications = inject(ApplicationService);
  private readonly toast = inject(ToastService);

  form = new ApplicationFormModel();
  creating = false;
  createButtonText = 'Создать заявку';

  isCreateOpen(): boolean {
    return this.agentModals.isOpen(AgentModal.CreateApplication);
  }

  filteredPtos(): PtoDto[] {
    const categoryId = Number(this.form.vehicleCategoryBySrtsOrPtsId);
    if (!categoryId) return [];
    return this.agentState.ptos().filter(pto =>
      Array.isArray(pto.pricePolicies) &&
      pto.pricePolicies.some(policy => policy.vehicleCategoriesBySrtsId === categoryId)
    );
  }

  ptoLabel(pto: PtoDto): string {
    const categoryId = Number(this.form.vehicleCategoryBySrtsOrPtsId);
    const policy = pto.pricePolicies?.find(item => item.vehicleCategoriesBySrtsId === categoryId);
    const priceText = policy ? `${policy.price} ₽` : 'Цена не указана';
    return `${pto.name} — ${pto.address || ''} (${priceText})`;
  }

  clearVin(missing: boolean): void {
    if (missing) this.form.vin = '';
  }

  clearChassis(missing: boolean): void {
    if (missing) this.form.chassisNumber = '';
  }

  clearSpecialPurpose(missing: boolean): void {
    if (missing) this.form.specialPurpose = '';
  }

  clearTahograph(missing: boolean): void {
    if (!missing) return;
    this.form.brandOfTachograph = '';
    this.form.modelOfTachograph = '';
    this.form.serialNumberOfTachograph = '';
  }

  clearGasEquipment(missing: boolean): void {
    if (!missing) return;
    this.form.numberOfGasCylinderEquipment = '';
    this.form.dateOfTheNextInspectionGasCylinderEquipment = '';
  }

  clearGasCylinder(missing: boolean): void {
    if (!missing) return;
    this.form.gasCylinderYearOfRelease = 0;
    this.form.gasCylinderSerialNumber = '';
    this.form.dateOfTheLastInspectionGasCylinder = '';
    this.form.dateOfTheNextInspectionGasCylinder = '';
  }

  onCategoryBySrtsChange(): void {
    const selectedCategoryId = Number(this.form.vehicleCategoryBySrtsOrPtsId) || null;
    console.log('Пользователь выбрал категорию ID:', selectedCategoryId);
    const list = this.filteredPtos();
    this.form.ptoId = list[0]?.id ?? 0;
  }

  closeCreate(): void {
    this.agentModals.close(AgentModal.CreateApplication);
  }

  onCreateOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeCreate();
    }
  }

  openPhotoModal(event?: Event): void {
    event?.preventDefault();
    this.agentModals.open(AgentModal.AddTsPhoto);
  }

  removePhoto(id: string): void {
    this.agentState.uploadedPhotos.update(list => list.filter(item => item.id !== id));
  }

  async createApplication(event: Event): Promise<void> {
    event.preventDefault();
    this.form.photos = this.agentState.uploadedPhotos();
    this.form.vehicleCategoryBySrtsOrPtsId = Number(this.form.vehicleCategoryBySrtsOrPtsId) || 0;
    this.form.ptoId = Number(this.form.ptoId) || 0;
    this.form.vehicleYearOfRelease = Number(this.form.vehicleYearOfRelease) || 0;

    const model = this.form.toCreateRequest();
    console.log('Модель заявки:', model);

    try {
      this.creating = true;
      this.createButtonText = 'Сохранение...';
      const isSuccess = await firstValueFrom(this.applications.createNewApplication(model));
      if (isSuccess) {
        this.closeCreate();
        this.pushOptimisticRow(model);
        this.resetForm();
      }
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'Не удалось создать заявку');
    } finally {
      this.creating = false;
      this.createButtonText = 'Создать заявку';
    }
  }

  private pushOptimisticRow(model: ReturnType<ApplicationFormModel['toCreateRequest']>): void {
    const current = this.agentState.applicationsResult();
    const row: ApplicationDto = {
      id: Date.now(),
      brand: model.brand,
      model: model.model,
      vin: model.vin || '',
      gosNumber: model.gosNumber,
      yearOfRelease: model.vehicleYearOfRelease,
      fio: model.fio,
      email: model.email,
      phoneNumber: model.phoneNumber,
      ptoId: model.ptoId,
      vehicleCategoryId: model.vehicleCategoryBySrtsOrPtsId,
      status: ApplicationStatus.Validating,
      createdAt: new Date().toISOString(),
      photos: model.vehiclePhotos.map(photo => ({ url: photo.photoUrl, vehiclePhotoType: photo.vehiclePhotoType })),
      _isTemporary: true,
      _tempId: Date.now()
    };
    const totalCount = (current.totalCount || 0) + 1;
    const pageSize = current.pageSize || 10;
    this.agentState.applicationsResult.set({
      ...current,
      items: [row, ...current.items],
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize)
    });
  }

  private resetForm(): void {
    this.form = new ApplicationFormModel();
    this.agentState.uploadedPhotos.set([]);
    this.agentState.uploadedDocs.set([]);
  }
}
