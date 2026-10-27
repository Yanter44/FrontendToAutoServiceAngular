import { Injectable, inject } from '@angular/core';
import { AgentStateService } from "./agent-state.service";
import { AgentService } from "../../../core/services/agent.service";
import { ToastService } from "../../../core/services/toast.service";
import { firstValueFrom } from 'rxjs';
import { BranchWithMembersDto, CreateBranchDto } from '../../../core/model';
import { InviteUserRequest } from '../../../core/model/invitation.model';
import { InvitationService } from '../../../core/services/invitation.service';
import { ApiResult } from '../../../core/model';

@Injectable({ providedIn: 'root' })
export class AgentBranchesFacade {
    private readonly state = inject(AgentStateService);
    private readonly api = inject(AgentService);
    private readonly toast = inject(ToastService);
    private readonly invitationService = inject(InvitationService)

    async load(): Promise<void> {
        if (this.state.branchesLoaded()) return;

        this.state.branchesLoading.set(true);
        try {
            const result = await firstValueFrom(this.api.getMyBranches());
            if (result?.success) {
                const incoming = result.data ?? [];
                this.state.branches.update(current => {
                    const ids = new Set(incoming.map(branch => branch.id));
                    const added = current.filter(branch => !branch.id || !ids.has(branch.id));
                    return [...added, ...incoming];
                });
                this.state.branchesLoaded.set(true);
            }
        } catch (error) {
            console.error('Ошибка загрузки веток:', error);
        } finally {
            this.state.branchesLoading.set(false);
        }
    }

    async create(dto: CreateBranchDto): Promise<boolean> {
        try {
            const result = await firstValueFrom(this.api.createBranch(dto));

            if (result?.success) {
                this.state.addBranch(branchFromCreate(dto, result.data));
                this.toast.success('Ветка создана');
                return true;
            }

            this.toast.error(result?.message ?? 'Не удалось создать ветку');
            return false;
        } catch (error) {
            console.error('Ошибка создания ветки:', error);
            this.toast.error('Ошибка соединения с сервером');
            return false;
        }
    }
    async invite(email: string, branchId: number): Promise<ApiResult<boolean>> {
        try {
            const dto: InviteUserRequest = { email, branchId };
            const result = await firstValueFrom(this.invitationService.inviteUser(dto));

            if (result?.success) {
                this.toast.success(`Приглашение отправлено на ${email}`);
                return { success: true, data: true };
            }

            this.toast.error(result?.message ?? 'Не удалось отправить приглашение');
            return { success: false, message: result?.message };
        } catch (error) {
            console.error('Ошибка приглашения агента:', error);
            this.toast.error('Ошибка соединения с сервером');
            return { success: false, message: 'Ошибка соединения' };
        }
    }
}

function branchFromCreate(dto: CreateBranchDto, data: unknown): BranchWithMembersDto {
    const record = data && typeof data === 'object' ? data as Record<string, unknown> : {};
    const id = Number(record['id'] ?? record['Id'] ?? 0);
    const memberCount = Number(record['memberCount'] ?? record['MemberCount'] ?? 0);
    return {
        id: Number.isFinite(id) ? id : 0,
        name: String(record['name'] ?? record['Name'] ?? dto.name),
        fee: Number(record['fee'] ?? record['Fee'] ?? dto.fee),
        isActive: true,
        createdAt: new Date().toISOString(),
        memberCount: Number.isFinite(memberCount) ? memberCount : 0,
        members: []
    };
}