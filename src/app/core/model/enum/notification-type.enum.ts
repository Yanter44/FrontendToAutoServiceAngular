export enum NotificationType {
  ApplicationSendToModeration = 'ApplicationSendToModeration',
  ApplicationRejected = 'ApplicationRejected',
  ApplicationCreated = 'ApplicationCreated',
  ApplicationApproved = 'ApplicationApproved',
  ApplicationFinished = 'ApplicationFinished',
  BalanceCredited = 'BalanceCredited',
  BalanceDebited = 'BalanceDebited'
}

/** @deprecated используйте NotificationType */
export const NotificationTypes = NotificationType;
