import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ADMIN_PAGE_SIZES } from '../config/admin-page-sizes';
import { AdminStateService } from './admin-state.service';
import { PtoService } from '../../../core/services/pto.service';
import { VehicleService } from '../../../core/services/vehicle.service';

@Injectable({ providedIn: 'root' })
export class AdminPtosFacade {
  private readonly state = inject(AdminStateService);
  private readonly api = inject(PtoService);
  private readonly vehicleService = inject(VehicleService);

  private vehicleCategoriesLoading: Promise<void> | null = null;

  async load(page = this.state.ptosResult().page || 1): Promise<void> {
    const result = await firstValueFrom(this.api.getPtos(page, ADMIN_PAGE_SIZES.ptos));
    if (result?.data) this.state.ptosResult.set(result.data);
  }

  async loadVehicleCategoriesBySrts(): Promise<void> {
    if (this.state.vehicleCategoriesBySrts().length) return;

    if (this.vehicleCategoriesLoading) return this.vehicleCategoriesLoading;

    this.vehicleCategoriesLoading = (async () => {
      try {
        const categoriesbySrts = await firstValueFrom(this.vehicleService.getAllVehicleCategoriesBySrts());
        console.log("НУ ТУТ ЕПТЫ");
        console.log(categoriesbySrts);
        this.state.vehicleCategoriesBySrts.set(categoriesbySrts ?? []);
      } catch (err) {
        console.error('Не удалось загрузить категории ТС', err);
      } finally {
        this.vehicleCategoriesLoading = null;
      }
    })();

    return this.vehicleCategoriesLoading;
  }
}