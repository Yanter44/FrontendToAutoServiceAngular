export function formatMoney(value?: number | null): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '0 ₽';
  return `${value.toLocaleString('ru-RU')} ₽`;
}
