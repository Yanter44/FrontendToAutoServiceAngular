import { ApplicationDto } from '../../core/model';

export interface ApplicationFact {
  label: string;
  value: string;
  empty: boolean;
  wide?: boolean;
}

export interface ApplicationBlockView {
  text: string;
  meta: string;
  lines: ApplicationFact[];
  present: boolean;
  badge: string;
}

export interface NamedPlace {
  id: number;
  name?: string;
  address?: string | null;
}

const EMPTY = 'Нет';

export function applicationFacts(app: ApplicationDto): ApplicationFact[] {
  return [...primaryFacts(app), ...extraFacts(app)];
}

export function primaryFacts(app: ApplicationDto): ApplicationFact[] {
  return [
    fact('Гос. номер', app.gosNumber),
    fact('Год выпуска', releaseYear(app)),
    fact('VIN', app.isVinMissing ? null : app.vin, true),
    fact('Категория ТС (СРТС или ПТС)', app.vehicleCategoryBySrts, true),
    fact('Категория ТС (ОКП)', app.vehicleCategoyByOkp, true),
    fact('Масса', withUnit(app.massWithoutLoad, 'кг')),
    fact('Пробег', withUnit(app.vehicleMileage, 'км')),
    fact('Топливо', app.fuelType),
    fact('Шины', app.tireBrand),
    fact('Кузов', app.vehicleBodyNumber, true),
    fact('Тормоза', app.typeOfBrakeSystemDrive),
    fact('Макс. масса', withUnit(app.alowedMaximumMass, 'кг'))
  ];
}

export function extraFacts(app: ApplicationDto): ApplicationFact[] {
  return [
    fact('Шасси', app.isChassisNumberMissing ? null : app.chassisNumber),
    fact('Спецназначение', app.isSpecialPurposeMissing ? null : app.specialPurpose),
    fact('Доп. маркировка', app.additionalMarking)
  ];
}

export function vehicleTitle(app: ApplicationDto): string {
  const title = `${app.brand || ''} ${app.model || ''}`.trim();
  return title || 'Транспорт не указан';
}

export function documentBlock(app: ApplicationDto): ApplicationBlockView {
  const seriesAndNumber = splitSeriesAndNumber(app.providedDocumentSeriesAndNumber);
  const lines = [
    fact('Предоставленный документ', app.providedDocumentName),
    fact('Серия', seriesAndNumber.series),
    fact('Номер', seriesAndNumber.number),
    fact('Когда выдан', formatDate(app.providedDocumentWhenWasIssued)),
    fact('Кем выдан', app.providedDocumentIssuedBy)
  ];
  return {
    text: '',
    meta: '',
    lines,
    present: lines.some(item => !item.empty),
    badge: ''
  };
}

export function tachographBlock(app: ApplicationDto): ApplicationBlockView {
  if (app.isTahogramMissing) return absentBlock('Не установлено');
  return labeledBlock([
    fact('Марка', app.brandOfTachograph),
    fact('Модель', app.modelOfTachograph),
    fact('Серийный номер', app.serialNumberOfTachograph)
  ], 'В наличии', 'Не установлено');
}

export function gasEquipmentBlock(app: ApplicationDto): ApplicationBlockView {
  if (app.isGasCylinderEquipmentMissing) return absentBlock('Не установлено');
  return labeledBlock([
    fact('Номер', app.numberOfGasCylinderEquipment),
    fact('Дата очередного освидетельствования', formatDate(app.dateOfTheNextInspectionGasCylinderEquipment))
  ], 'В наличии', 'Не установлено');
}

export function gasCylinderBlock(app: ApplicationDto): ApplicationBlockView {
  if (app.isGasCylinderMissing) return absentBlock('Не установлено');
  return labeledBlock([
    fact('Год выпуска', app.gasCylinderYearOfRelease),
    fact('Серийный номер', app.gasCylinderSerialNumber),
    fact('Дата последнего освидетельствования', formatDate(app.dateOfTheLastInspectionGasCylinder)),
    fact('Дата очередного освидетельствования', formatDate(app.dateOfTheNextInspectionGasCylinder))
  ], 'В наличии', 'Не установлено');
}

export function ptoBlock(app: ApplicationDto, places: NamedPlace[]): ApplicationBlockView {
  const place = places.find(item => item.id === app.ptoId);
  if (!app.ptoId && !place) {
    return { text: EMPTY, meta: '', lines: [], present: false, badge: 'Не указано' };
  }
  return {
    text: place?.name || `ПТО №${app.ptoId}`,
    meta: place?.address || '',
    lines: [],
    present: true,
    badge: ''
  };
}

function labeledBlock(lines: ApplicationFact[], onBadge: string, offBadge: string): ApplicationBlockView {
  const present = lines.some(item => !item.empty);
  return { text: '', meta: '', lines, present, badge: present ? onBadge : offBadge };
}

function absentBlock(badge: string): ApplicationBlockView {
  return { text: EMPTY, meta: '', lines: [], present: false, badge };
}

function releaseYear(app: ApplicationDto): string {
  const year = app.vehicleYearOfRelease ?? app.yearOfRelease;
  return year ? String(year) : '';
}

function fact(label: string, value: string | number | null | undefined, wide = false): ApplicationFact {
  if (value == null || value === '') return { label, value: EMPTY, empty: true, wide };
  return { label, value: String(value), empty: false, wide };
}

function splitSeriesAndNumber(value?: string | null): { series: string; number: string } {
  const text = value?.trim() ?? '';
  if (!text) return { series: '', number: '' };
  const parts = text.split(/\s+/);
  if (parts.length === 1) return { series: parts[0], number: '' };
  return { series: parts.slice(0, -1).join(' '), number: parts[parts.length - 1] };
}

function withUnit(value: number | null | undefined, unit: string): string {
  if (value == null) return '';
  return `${new Intl.NumberFormat('ru-RU').format(value)} ${unit}`;
}

function formatDate(value?: string | null): string {
  if (!value) return '';
  const [date] = value.split('T');
  const [year, month, day] = date.split('-');
  if (!year || !month || !day) return value;
  return `${day}.${month}.${year}`;
}
