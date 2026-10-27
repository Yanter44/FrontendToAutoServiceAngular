import { TransactionType } from './enum/transaction-type.enum';

export interface TransactionDto {
  externalId: string | number;
  agentName: string;
  amount: number;
  description?: string;
  createdAt: string;
  transactionType: TransactionType | string;
  status?: string;
}

export interface BalanceMutationRequest {
  agentId: number;
  amount: number;
  comment: string;
  idempotencyKey: string;
}

export interface AgentFinances {
  balance: number | null;
  debtlimit: number | null;
  currentdebt: number | null;
}
