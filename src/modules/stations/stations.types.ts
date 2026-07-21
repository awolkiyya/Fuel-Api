export type CreateStationDTO = {
    name: string;
    city:string;
    region:string;
    lat: number;
    lng: number;
    image?:string;
    address?:string;
    managerId?: string; 
  };

export type StationFuelInput = {
  fuelTypeId: string
  maxCapacity: number
  isActive?: boolean
}

export type UpdateStationDTO = {
  name?: string
  city?: string
  region?: string
  lat?: number
  lng?: number
  image?: string
  address?: string

  managerId?: string | null

  fuelTypes?: StationFuelInput[]
}


export type StationResponse = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: string;

  managerId: string | null;

  settings?: {
    queueZone: any;
    thresholdLow: number;
    thresholdMedium: number;
    maxQueueCapacity: number;
    pricePerLiter: number;
  } | null;

  traffic?: {
    queueCount: number;
    congestionLevel: string;
    updatedBy: string;
    updatedAt: Date;
  } | null;

  createdAt?: Date;
};