import { Injectable, signal } from '@angular/core';
import { AgentListItem, ApplicationDto, ApplicationsMetrics, PtoExpertDraft, DocumentRequirement, emptyPagedResult, GalleryPhotoDto, NeuronNetworkDto, PagedResult, PhotoRequirement, ProfileDto,PromptDto,PtoDto, RedactUserState,RedactUserTab,TransactionDto,UserDto,VehicleCategory} from '../../../core/model';

@Injectable({ providedIn: 'root' })
export class AdminStateService {
  readonly profile = signal<ProfileDto | null>(null);
  readonly applicationsResult = signal<PagedResult<ApplicationDto>>(emptyPagedResult());
  readonly applicationsMetrics = signal<ApplicationsMetrics>({
    totalApplicationsCount: 0,
    totalApplicationsInModerationCount: 0,
    totalApplicationsApprovedCount: 0,
    totalApplicationsTodayCount: 0
  });
  readonly usersResult = signal<PagedResult<UserDto>>(emptyPagedResult());
  readonly ptosResult = signal<PagedResult<PtoDto>>(emptyPagedResult());
  readonly promptsResult = signal<PagedResult<PromptDto>>(emptyPagedResult());
  readonly availablePrompts = signal<PromptDto[]>([]);
  readonly photoGalleryResult = signal<PagedResult<GalleryPhotoDto>>(emptyPagedResult());
  readonly neuronNetworksResult = signal<PagedResult<NeuronNetworkDto>>(emptyPagedResult());
  readonly transactionsResult = signal<PagedResult<TransactionDto>>(emptyPagedResult());
  readonly availableAgents = signal<AgentListItem[]>([]);
  
  readonly vehicleCategoriesBySrts = signal<VehicleCategory[]>([]);
  readonly vehicleCategoriesByOkp = signal<VehicleCategory[]>([]);

  readonly photoRequirements = signal<PhotoRequirement[]>([]);
  readonly documentRequirements = signal<DocumentRequirement[]>([]);
  readonly allNeuronNetworks = signal<NeuronNetworkDto[]>([]);
  readonly selectedApplication = signal<ApplicationDto | null>(null);
  readonly selectedPto = signal<PtoDto | null>(null);
  readonly generatedPhotoByAi = signal<string | null>(null);
  readonly additionalPhotos = signal<GalleryPhotoDto[]>([]);
  readonly redactUser = signal<RedactUserState>({
    userId: null,
    user: null,
    activeTab: RedactUserTab.Account,
    blockHistory: [],
    blockHistoryLoaded: false
  });

  readonly ptoExpertsDraft = signal<PtoExpertDraft[]>([]);
}
