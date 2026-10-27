import { ApplicationStatus } from './enum/application-status.enum';

export interface ApplicationPhoto {
  id?: number;
  url: string;
  vehiclePhotoType?: string;
  photoUrl?: string;
}

export interface ApplicationDocument {
  url?: string;
  fileName?: string;
  type?: string;
  documentUrl?: string;
}
export interface ApplicationProvidedDocument {
  id: number;
  documentType: string;
  displayName: string;
  isRequire: boolean;
}
export interface ApplicationDto {
  id: number;
  brand?: string;
  model?: string;
  vin?: string;
  gosNumber?: string;
  yearOfRelease?: number;
  fio?: string;
  email?: string;
  phoneNumber?: string;
  status: ApplicationStatus | string;
  createdAt?: string;
  errorMessage?: string;
  photos?: ApplicationPhoto[];
  documents?: ApplicationDocument[];
  ptoId?: number;
  vehicleCategoryId?: number;
  vehicleYearOfRelease?: number | null;
  vehicleBodyNumber?: string | null;
  chassisNumber?: string | null;
  isChassisNumberMissing?: boolean;
  isVinMissing?: boolean;
  additionalMarking?: number | null;
  massWithoutLoad?: number | null;
  alowedMaximumMass?: number | null;
  vehicleMileage?: number | null;
  fuelType?: string | null;
  typeOfBrakeSystemDrive?: string | null;
  tireBrand?: string | null;
  isSpecialPurposeMissing?: boolean;
  specialPurpose?: string | null;
  vehicleCategoryBySrts?: string | null;
  vehicleCategoyByOkp?: string | null;
  providedDocumentName?: string | null;
  providedDocumentSeriesAndNumber?: string | null;
  providedDocumentWhenWasIssued?: string | null;
  providedDocumentIssuedBy?: string | null;
  isTahogramMissing?: boolean;
  brandOfTachograph?: string | null;
  modelOfTachograph?: string | null;
  serialNumberOfTachograph?: string | null;
  isGasCylinderEquipmentMissing?: boolean;
  numberOfGasCylinderEquipment?: string | null;
  dateOfTheNextInspectionGasCylinderEquipment?: string | null;
  isGasCylinderMissing?: boolean;
  gasCylinderYearOfRelease?: number | null;
  gasCylinderSerialNumber?: string | null;
  dateOfTheLastInspectionGasCylinder?: string | null;
  dateOfTheNextInspectionGasCylinder?: string | null;
  _isTemporary?: boolean;
  _tempId?: number;
}

export interface ApplicationsMetrics {
  totalApplicationsCount: number;
  totalApplicationsInModerationCount: number;
  totalApplicationsApprovedCount: number;
  totalApplicationsTodayCount: number;
}

export interface CreateApplicationRequest {
  
  //ProvidedDocument
  providedDocumentId: number;
  providedDocumentSeriesAndNumber: string;
  providedDocumentWhenWasIssued: string;
  providedDocumentIssuedBy: string;

  //VehicleData
  isVinMissing: boolean;
  vin: string | null;
  vehicleYearOfRelease: number;
  brand: string;
  model: string;
  gosNumber: string;
  vehicleBodyNumber: string;
  isChassisNumberMissing: boolean;
  chassisNumber: string | null;
  additionalMarking: number | null;
  massWithoutLoad: number;
  vehicleCategoryBySrtsOrPtsId: number;
  vehicleCategoyByOkpId: number;
  vehicleMileage: number;
  alowedMaximumMass: number;
  fuelType: string;
  typeOfBrakeSystemDrive: string;
  tireBrand: string;
  isSpecialPurposeMissing: boolean;
  specialPurpose: string | null;

  //Tahograph
  isTahogramMissing: boolean;
  brandOfTachograph: string | null;
  modelOfTachograph: string | null;
  serialNumberOfTachograph: string | null;

  //GasCylinderEquipment
  isGasCylinderEquipmentMissing: boolean;
  numberOfGasCylinderEquipment: string | null;
  dateOfTheNextInspectionGasCylinderEquipment: string | null;
  
  //GasСylinder
  isGasCylinderMissing: boolean;
  gasCylinderYearOfRelease: number | null;
  gasCylinderSerialNumber: string | null;
  dateOfTheLastInspectionGasCylinder: string | null;
  dateOfTheNextInspectionGasCylinder: string | null;

  //ClientInfo
  fio: string;
  email: string;
  phoneNumber: string;

  ptoId: number;
  vehiclePhotos: { vehiclePhotoType: string; photoUrl: string }[];
}

export interface UploadedMediaItem {
  id: string;
  type: string;
  url: string;
  fileName?: string;
}
export interface AcceptApplicationDto {
  applicationId: number;
}

export interface RejectApplicationDto {
  applicationId: number;
  rejectReason: string;
}
