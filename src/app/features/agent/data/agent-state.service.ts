import { Injectable, signal } from '@angular/core';
import { AgentFinances, ApplicationDto, ApplicationsMetrics, DocumentRequirement, emptyPagedResult, PagedResult, PhotoRequirement,
  ProfileDto,
  PtoDto,
  TransactionDto,
  TransactionType,
  UploadedMediaItem,
  VehicleCategory,
  BranchWithMembersDto,
  ApplicationProvidedDocument
} from '../../../core/model';

@Injectable({ providedIn: 'root' })
export class AgentStateService {
  readonly profile = signal<ProfileDto | null>(null);
  readonly headerBalance = signal<number | null>(null);
  readonly applicationsResult = signal<PagedResult<ApplicationDto>>(emptyPagedResult());
  readonly applicationsMetrics = signal<ApplicationsMetrics>({
    totalApplicationsCount: 0,
    totalApplicationsInModerationCount: 0,
    totalApplicationsApprovedCount: 0,
    totalApplicationsTodayCount: 0
  });

  readonly applicationProvidedDocuments = signal<ApplicationProvidedDocument[]>([]);
  readonly vehicleCategoriesBySrts = signal<VehicleCategory[]>([]);
  readonly vehicleCategoriesByOkp = signal<VehicleCategory[]>([]);

  readonly ptos = signal<PtoDto[]>([]);
  readonly photoRequirements = signal<PhotoRequirement[]>([]);
  readonly documentRequirements = signal<DocumentRequirement[]>([]);

  readonly uploadedPhotos = signal<UploadedMediaItem[]>([]);
  readonly uploadedDocs = signal<UploadedMediaItem[]>([]);
  
  readonly finances = signal<AgentFinances>({ balance: null, debtlimit: null, currentdebt: null });
  readonly financesLoaded = signal(false);
  readonly financesHistoryResult = signal<PagedResult<TransactionDto>>(emptyPagedResult());
  private readonly financesPages = new Map<number, PagedResult<TransactionDto>>();
  private readonly seenBalanceNotices = new Set<string>();
  readonly selectedApplication = signal<ApplicationDto | null>(null);
  readonly MAX_PHOTOS = 8;

  readonly branches = signal<BranchWithMembersDto[]>([]);
  readonly branchesLoaded = signal(false);
  readonly branchesLoading = signal(false);
  readonly inviteBranchId = signal<number | null>(null);
  readonly inviteBranchName = signal<string>('');

  addBranch(branch: BranchWithMembersDto): void {
    this.branches.update(items => {
      if (branch.id && items.some(item => item.id === branch.id)) return items;
      return [branch, ...items];
    });
  }

  financesPage(page: number): PagedResult<TransactionDto> | undefined {
    return this.financesPages.get(page);
  }

  rememberFinancesPage(result: PagedResult<TransactionDto>): void {
    this.financesPages.set(result.page, result);
    this.financesHistoryResult.set(result);
  }

  recordBalanceNotice(payload: unknown, kind: TransactionType.Credit | TransactionType.Debit): void {
    const notice = readBalanceNotice(payload);
    const amount = notice.amount;
    const noticeKey = notice.externalId || [notice.createdAt, kind, amount, notice.message, notice.title].join('|');
    if (this.seenBalanceNotices.has(noticeKey)) return;
    this.seenBalanceNotices.add(noticeKey);

    if (notice.balance != null) {
      this.headerBalance.set(notice.balance);
      if (this.financesLoaded()) {
        this.finances.update(current => ({ ...current, balance: notice.balance }));
      }
    } else if (amount != null) {
      const delta = kind === TransactionType.Credit ? amount : -amount;
      this.headerBalance.update(value => value == null ? value : value + delta);
      if (this.financesLoaded()) {
        this.finances.update(current => ({
          ...current,
          balance: current.balance == null ? current.balance : current.balance + delta
        }));
      }
    }

    if (!this.financesLoaded() || amount == null) return;

    const tx: TransactionDto = {
      externalId: notice.externalId || noticeKey,
      agentName: '',
      amount,
      description: notice.description || notice.message || notice.title || (kind === TransactionType.Credit ? 'Поступление' : 'Списание'),
      createdAt: notice.createdAt || new Date().toISOString(),
      transactionType: kind,
      status: 'Completed'
    };
    this.prependFinanceOperation(tx);
  }

  private prependFinanceOperation(tx: TransactionDto): void {
    const visible = this.financesHistoryResult();
    const pageSize = visible.pageSize || 10;
    const first = this.financesPages.get(1) ?? (visible.page === 1 ? visible : emptyPagedResult<TransactionDto>());
    if (first.items.some(item => String(item.externalId) === String(tx.externalId))) return;

    const next: PagedResult<TransactionDto> = {
      ...first,
      items: [tx, ...first.items].slice(0, pageSize),
      page: 1,
      pageSize,
      totalCount: first.totalCount + 1,
      totalPages: Math.max(1, Math.ceil((first.totalCount + 1) / pageSize))
    };
    this.financesPages.set(1, next);
    for (const page of [...this.financesPages.keys()]) {
      if (page !== 1) this.financesPages.delete(page);
    }

    if (visible.page === 1) {
      this.financesHistoryResult.set(next);
      return;
    }

    this.financesHistoryResult.set({
      ...visible,
      totalCount: visible.totalCount + 1,
      totalPages: Math.max(1, Math.ceil((visible.totalCount + 1) / pageSize))
    });
  }
}

function readBalanceNotice(payload: unknown): BalanceNotice {
  const record = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {};
  const nested = record['data'] && typeof record['data'] === 'object' ? record['data'] as Record<string, unknown> : {};
  const source = { ...nested, ...record };
  const message = text(source['message']);
  const title = text(source['title']);
  const description = text(source['description']) || text(source['comment']);
  return {
    externalId: text(source['externalId']) || text(source['id']),
    amount: numberValue(source['amount']) ?? amountFromText(`${title} ${message} ${description}`),
    balance: numberValue(source['balance']) ?? numberValue(source['newBalance']),
    description,
    message,
    title,
    createdAt: text(source['createdAt'])
  };
}

function amountFromText(value: string): number | null {
  const money = value.match(/(\d[\d\s]*(?:[.,]\d+)?)\s*(?:₽|руб)/i);
  if (money) return numberValue(money[1]);
  return null;
}

function numberValue(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;
  const normalized = value.replace(/\s/g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function text(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
}

interface BalanceNotice {
  externalId: string;
  amount: number | null;
  balance: number | null;
  description: string;
  message: string;
  title: string;
  createdAt: string;
}
