export type VehicleType = 'bike' | 'scooter';
export type BikeCategory = 'all' | 'urbain' | 'vtc' | 'vtt' | 'cargo' | 'pliant' | 'trottinette';
export type AgencyFilter = 'all' | 'marina' | 'skanes' | 'ribat' | 'zone_hotel' | 'gare';

export interface CatalogBike {
  id: string;
  name: string;
  vehicleType: VehicleType;
  category: 'urbain' | 'vtc' | 'vtt' | 'cargo' | 'pliant' | 'trottinette';
  categoryLabel: string;
  agencyId: 'marina' | 'skanes' | 'ribat' | 'zone_hotel' | 'gare';
  agencyName: string;
  agencyPostalCode: string;
  pricePerDayDT: number;
  pricePerHourDT: number;
  rangeKm: number;
  batteryCapacity: string;
  maxSpeedKmH: number;
  weightKg: number;
  stockAvailable: number;
  tag?: string;
  image: string;
  fallbackImage: string;
  rating: number;
  reviewsCount: number;
  description: string;
  features: string[];
  // Rich technical specifications for detail page
  motorType: string;
  motorTorqueNm: number;
  transmission: string;
  brakes: string;
  chargingTimeHours: number;
  frameMaterial: string;
  wheelSize: string;
  connectivity: string;
  includedAccessories: string[];
}

