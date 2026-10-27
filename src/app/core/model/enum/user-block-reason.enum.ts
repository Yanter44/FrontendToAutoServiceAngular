export enum UserBlockReason {
  Spam = 'spam',
  Fraud = 'fraud',
  Abuse = 'abuse',
  Violation = 'violation',
  Other = 'other'
}

export const USER_BLOCK_REASON_LABEL: Record<UserBlockReason, string> = {
  [UserBlockReason.Spam]: 'Спам',
  [UserBlockReason.Fraud]: 'Мошенничество',
  [UserBlockReason.Abuse]: 'Оскорбительное поведение',
  [UserBlockReason.Violation]: 'Нарушение правил',
  [UserBlockReason.Other]: 'Другое'
};
