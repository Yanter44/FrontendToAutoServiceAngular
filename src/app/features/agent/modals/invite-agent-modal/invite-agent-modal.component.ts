import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AgentModal } from '../../../../core/model';
import { InviteUserRequest } from '../../../../core/model/invitation.model';
import { AgentModalService } from '../../data/agent-modal.service';
import { AgentStateService } from '../../data/agent-state.service';
import { InvitationService } from '../../../../core/services/invitation.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AgentBranchesFacade } from '../../data/agent-branches-fascade';

@Component({
    selector: 'app-invite-new-agent-modal',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './invite-agent-modal.component.html'
})

export class InviteAgentModalComponent {
    private readonly agentModals = inject(AgentModalService);
    private readonly agentState = inject(AgentStateService);
    private readonly invitationService = inject(InvitationService);   // ← замена
    private readonly toast = inject(ToastService);
    private readonly branchesFacade = inject(AgentBranchesFacade);

    readonly branchName = computed(() => this.agentState.inviteBranchName());

    email = '';
    submitting = false;

    isOpen(): boolean {
        return this.agentModals.isOpen(AgentModal.InviteAgent);
    }

    close(): void {
        this.reset();
        this.agentState.inviteBranchId.set(null);
        this.agentState.inviteBranchName.set('');
        this.agentModals.close(AgentModal.InviteAgent);
    }

    async submit(): Promise<void> {
        const branchId = this.agentState.inviteBranchId();
        const email = this.email.trim().toLowerCase();

        if (!branchId) {
            this.toast.error('Ветка не выбрана');
            return;
        }

        if (!email) {
            this.toast.error('Введите email');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.toast.error('Введите корректный email');
            return;
        }

        this.submitting = true;
        try {
            const result = await this.branchesFacade.invite(email, branchId);
            if (result.success) {
                this.close();
            }
        } finally {
            this.submitting = false;
        }
    }

    private reset(): void {
        this.email = '';
        this.submitting = false;
    }
}