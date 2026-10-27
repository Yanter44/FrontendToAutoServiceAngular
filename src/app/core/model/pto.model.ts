export interface VehicleCategory {
  id: number;
  name: string;
  description: string;
  type: string;
}

export interface PtoPricePolicy {
  vehicleCategoriesBySrtsId: number;
  price: number;
}

export interface PtoDto {
  id: number;
  name: string;
  rsaNumber: string;
  address?: string;
  latitude?: string | null;
  longitude?: string | null;
  login?: string;
  password?: string;
  apiKey?: string;
  pricePolicies?: PtoPricePolicy[];
  ptoExperts?: PtoExpertDto[];
}

export interface AddPtoRequest {
  name: string;
  rsaNumber: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  maximumThroughput: number;
  operatorKeyArchive: File | null; 
  pricePolicies: PtoPricePolicy[];
  experts: {
    firstName: string;
    lastName: string;
    middleName: string;
    sequenceNumber: number;
    keyArchive: File | null;    
  }[];
}

export interface PtoPricePolicyDraft {
  vehicleCategoriesBySrtsId: number;
  name: string;
  price: number | null;
}

export interface PtoExpertDraft {
  firstName: string;
  lastName: string;
  middleName: string;
  sequenceNumber: number;
  keyFile: File | null;
}
export interface PtoExpertDto {
  id: number;
  firstName: string;
  lastName: string;
  middleName: string | null;
  sequenceNumber: number;
}
