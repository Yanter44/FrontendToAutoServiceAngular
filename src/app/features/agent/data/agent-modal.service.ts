import { Injectable, inject } from '@angular/core';
import { AgentModal } from '../../../core/model';
import { ModalService } from '../../../core/services/modal.service';

@Injectable({ providedIn: 'root' })
export class AgentModalService {
  private readonly modals = inject(ModalService);

  open(name: AgentModal): void {
    this.modals.open(name);
  }

  close(name: AgentModal): void {
    this.modals.close(name);
  }

  isOpen(name: AgentModal): boolean {
    return this.modals.isOpen(name);
  }
}
