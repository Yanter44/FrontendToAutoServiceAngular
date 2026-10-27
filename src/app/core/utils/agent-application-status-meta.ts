import { ApplicationStatus } from '../model';
import { StatusMeta } from '../model/statusMeta.model';

export function agentApplicationStatusMeta(
  status?: string,
  errorMessage?: string,
): StatusMeta {
  switch (status) {
    case ApplicationStatus.Validating:
      return {
        className: 'StatusBadge ProcessingStatus',
        label: 'Обрабатывается',
      };

    case ApplicationStatus.OnModeration:
      return {
        className: 'StatusBadge ModerationStatus',
        label: 'На рассмотрении',
      };

    case ApplicationStatus.RejectedByModerator:
      return {
        className: 'StatusBadge RejectedStatus',
        label: 'Заявка отклонена',
      };

    case ApplicationStatus.Approved:
      return {
        className: 'StatusBadge ApprovedStatus',
        label: 'Принята, готовится отправка',
      };
    case ApplicationStatus.EaistoProcessing:
      return {
        className: 'StatusBadge EaistoProcessing',
        label: 'Проверяется в ЕАИСТО',
      };

    case ApplicationStatus.Completed:
      return {
        className: 'StatusBadge Success',
        label: 'Готово — карта получена',
      };

    case ApplicationStatus.EaistoError:
      return {
        className: 'StatusBadge EaistoError',
        label: errorMessage
          ? `Ошибка проверки: ${errorMessage}`
          : 'Ошибка проверки, обратитесь в поддержку',
      };

    default:
      return {
        className: 'StatusBadge',
        label: status || 'Неизвестно',
      };
  }
}