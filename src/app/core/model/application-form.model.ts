import { CreateApplicationRequest, UploadedMediaItem } from './application.model';

export class ApplicationFormModel {
  
  //ProvidedDocument
  providedDocumentId = 0;
  providedDocumentSeriesAndNumber = '';
  providedDocumentWhenWasIssued = '';
  providedDocumentIssuedBy = '';

  //VehicleData
  isVinMissing = false;
  vin = '';
  vehicleYearOfRelease = 0;
  brand = '';
  model = '';
  gosNumber = '';
  vehicleBodyNumber = '';
  isChassisNumberMissing = false;
  chassisNumber = '';
  additionalMarking = 0;
  massWithoutLoad = 0;
  vehicleCategoryBySrtsOrPtsId = 0;
  vehicleCategoyByOkpId = 0;
  vehicleMileage = 0;
  allowedMaximumMass = 0;
  fuelType = '';
  typeOfBrakeSystemDrive = '';
  tireBrand = '';
  isSpecialPurposeMissing = false;
  specialPurpose = '';

  //Tahograph
  isTahogramMissing = false;
  brandOfTachograph = '';
  modelOfTachograph = '';
  serialNumberOfTachograph = '';

  //GasCylinderEquipment
  isGasCylinderEquipmentMissing = false;
  numberOfGasCylinderEquipment = ''
  dateOfTheNextInspectionGasCylinderEquipment = '';
  
  //GasСylinder
  isGasCylinderMissing = false;
  gasCylinderYearOfRelease = 0;
  gasCylinderSerialNumber = ''
  dateOfTheLastInspectionGasCylinder = '';
  dateOfTheNextInspectionGasCylinder = '';

  //ClientInfo
  fio = '';
  email = '';
  phoneNumber = '';
  ptoId = 0;
  photos: UploadedMediaItem[] = [];

  validate(): string[] {
    const errors: string[] = [];
    if (!this.vin) errors.push('VIN номер обязателен для заполнения');
    if (!this.gosNumber) errors.push('Государственный номер обязателен для заполнения');
    if (!this.brand) errors.push('Марка автомобиля обязательна для заполнения');
    if (!this.model) errors.push('Модель автомобиля обязательна для заполнения');
    if (!this.vehicleYearOfRelease || this.vehicleYearOfRelease < 1900) {
      errors.push('Укажите корректный год выпуска');
    }
    if (!this.fio) errors.push('ФИО обязательно для заполнения');
    if (!this.email) errors.push('Email обязателен для заполнения');
    if (!this.phoneNumber) errors.push('Номер телефона обязателен для заполнения');
    if (!this.ptoId) errors.push('Выберите ПТО');
    return errors;
  }

  toCreateRequest(): CreateApplicationRequest {
    const num = (value: number | string | null | undefined): number => Number(value) || 0;
    const dateOrNull = (value: string): string | null => value || null;

    return {
      providedDocumentId: num(this.providedDocumentId),
      providedDocumentSeriesAndNumber: this.providedDocumentSeriesAndNumber,
      providedDocumentWhenWasIssued: this.providedDocumentWhenWasIssued,
      providedDocumentIssuedBy: this.providedDocumentIssuedBy,

      isVinMissing: this.isVinMissing,
      vin: this.isVinMissing ? null : this.vin,
      vehicleYearOfRelease: num(this.vehicleYearOfRelease),
      brand: this.brand,
      model: this.model,
      gosNumber: this.gosNumber,
      vehicleBodyNumber: this.vehicleBodyNumber,
      isChassisNumberMissing: this.isChassisNumberMissing,
      chassisNumber: this.isChassisNumberMissing ? null : this.chassisNumber,
      additionalMarking: this.additionalMarking ? num(this.additionalMarking) : null,
      massWithoutLoad: num(this.massWithoutLoad),
      vehicleCategoryBySrtsOrPtsId: num(this.vehicleCategoryBySrtsOrPtsId),
      vehicleCategoyByOkpId: num(this.vehicleCategoyByOkpId),
      vehicleMileage: num(this.vehicleMileage),
      alowedMaximumMass: num(this.allowedMaximumMass),
      fuelType: this.fuelType,
      typeOfBrakeSystemDrive: this.typeOfBrakeSystemDrive,
      tireBrand: this.tireBrand,
      isSpecialPurposeMissing: this.isSpecialPurposeMissing,
      specialPurpose: this.isSpecialPurposeMissing ? null : this.specialPurpose,

      isTahogramMissing: this.isTahogramMissing,
      brandOfTachograph: this.isTahogramMissing ? null : this.brandOfTachograph,
      modelOfTachograph: this.isTahogramMissing ? null : this.modelOfTachograph,
      serialNumberOfTachograph: this.isTahogramMissing ? null : this.serialNumberOfTachograph,

      isGasCylinderEquipmentMissing: this.isGasCylinderEquipmentMissing,
      numberOfGasCylinderEquipment: this.isGasCylinderEquipmentMissing ? null : this.numberOfGasCylinderEquipment,
      dateOfTheNextInspectionGasCylinderEquipment: this.isGasCylinderEquipmentMissing
        ? null
        : dateOrNull(this.dateOfTheNextInspectionGasCylinderEquipment),

      isGasCylinderMissing: this.isGasCylinderMissing,
      gasCylinderYearOfRelease: this.isGasCylinderMissing ? null : num(this.gasCylinderYearOfRelease),
      gasCylinderSerialNumber: this.isGasCylinderMissing ? null : this.gasCylinderSerialNumber,
      dateOfTheLastInspectionGasCylinder: this.isGasCylinderMissing ? null : dateOrNull(this.dateOfTheLastInspectionGasCylinder),
      dateOfTheNextInspectionGasCylinder: this.isGasCylinderMissing ? null : dateOrNull(this.dateOfTheNextInspectionGasCylinder),

      fio: this.fio,
      email: this.email,
      phoneNumber: this.phoneNumber,

      ptoId: num(this.ptoId),
      vehiclePhotos: this.photos.map(p => ({ vehiclePhotoType: p.type, photoUrl: p.url }))
    };
  }
}
