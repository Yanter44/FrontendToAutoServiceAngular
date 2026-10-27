import { Component, OnInit, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ScreenLoadingComponent } from '../../../../shared/components/screen-loading/screen-loading.component';
import { AgentModal } from '../../../../core/model';
import { AgentModalService } from '../../data/agent-modal.service';
import { AgentStateService } from '../../data/agent-state.service';
import { AgentBranchesFacade } from '../../data/agent-branches-fascade';

@Component({
  selector: 'app-agent-branches-screen',
  standalone: true,
  imports: [DatePipe, ScreenLoadingComponent],
  templateUrl: './branches-screen.component.html',
  host: { class: 'BranchesScreen ScreenContainer' },
  styles: [`:host { display: block; height: 100%; min-height: 0; overflow: auto; }`]
})
export class AgentBranchesScreenComponent implements OnInit {
  private readonly agentModals = inject(AgentModalService);
  private readonly branchesFacade = inject(AgentBranchesFacade);
  readonly agentState = inject(AgentStateService);

  readonly branches = computed(() => this.agentState.branches());
  readonly loading = computed(() => this.agentState.branchesLoading());

  async ngOnInit(): Promise<void> {
    await this.branchesFacade.load();
  }

  openCreateBranch(): void {
    this.agentModals.open(AgentModal.CreateBranch);
  }
  openInviteAgent(branchId: number, branchName: string ,event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.agentState.inviteBranchId.set(branchId);
    this.agentState.inviteBranchName.set(branchName);
    console.log(branchId);
    console.log(branchName);
    this.agentModals.open(AgentModal.InviteAgent);
  }
}