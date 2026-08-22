export interface TransportMode {
  id: string;
  name: string;
  iconName: string;
  factorKgCo2PerKgKm: number; // kg CO2e per kg product per km
  speed: string;
  ecoRating: 'High' | 'Medium' | 'Low';
  description: string;
}

export const TRANSPORT_MODES: TransportMode[] = [
  {
    id: 'sea',
    name: 'Maritime Cold-Chain',
    iconName: 'Ship',
    factorKgCo2PerKgKm: 0.000015, // ~15g CO2 / ton-km
    speed: '12-18 days',
    ecoRating: 'High',
    description: 'Ultra-low emission maritime transport using bio-fuel reefer vessels.'
  },
  {
    id: 'rail',
    name: 'Electric Rail Express',
    iconName: 'Train',
    factorKgCo2PerKgKm: 0.000030, // ~30g CO2 / ton-km
    speed: '4-7 days',
    ecoRating: 'High',
    description: 'Zero direct emission electrified rail corridor for regional transit.'
  },
  {
    id: 'road',
    name: 'Cold-Chain EV / Road',
    iconName: 'Truck',
    factorKgCo2PerKgKm: 0.000120, // ~120g CO2 / ton-km
    speed: '2-4 days',
    ecoRating: 'Medium',
    description: 'Temperature-controlled refrigerated freight truck.'
  },
  {
    id: 'air',
    name: 'Express Air Freight',
    iconName: 'Plane',
    factorKgCo2PerKgKm: 0.001100, // ~1100g CO2 / ton-km
    speed: '24-48 hrs',
    ecoRating: 'Low',
    description: 'High-speed air freight for perishable prime delicacies.'
  }
];

// Distance matrix from origin countries to major destination hubs (default ~ 3500 km)
export const COUNTRY_DISTANCES_KM: Record<string, number> = {
  'Italy': 1800,
  'Spain': 1400,
  'France': 900,
  'Netherlands': 600,
  'India': 6500,
  'Thailand': 8200,
  'USA': 5500,
  'Mexico': 7800,
  'Japan': 9200,
  'Brazil': 9500,
  'Kenya': 6800,
  'Global': 3500,
};

export interface CarbonCalculationResult {
  distanceKm: number;
  mode: TransportMode;
  grossTransportCo2eKg: number;
  organicOffsetKg: number;
  packagingOffsetKg: number;
  netCo2eKgTotal: number;
  netCo2eKgPerUnit: number;
  sustainabilityScore: number; // 0 - 100
  sustainabilityGrade: 'A+' | 'A' | 'B' | 'C' | 'D';
  carKmEquivalent: number;
  treeDaysEquivalent: number;
  badges: string[];
}

export function calculateProductCarbonFootprint(params: {
  originCountry: string;
  isOrganic: boolean;
  quantityKg?: number;
  selectedModeId?: string;
  customDistanceKm?: number;
  packagingType?: 'Eco-Sustainable' | 'Standard' | 'Luxury Gift Box';
}): CarbonCalculationResult {
  const quantity = params.quantityKg || 1;
  const distanceKm = params.customDistanceKm || COUNTRY_DISTANCES_KM[params.originCountry] || 3500;
  
  const mode = TRANSPORT_MODES.find(m => m.id === params.selectedModeId) || 
    (distanceKm < 2000 ? TRANSPORT_MODES[2] : TRANSPORT_MODES[0]); // default road for short, sea for long

  // Gross Shipping Footprint = weight (kg) * distance (km) * factor
  const grossTransportCo2eKg = quantity * distanceKm * mode.factorKgCo2PerKgKm;

  // Organic farming saves synthetic fertilizer nitrogen oxide emissions (~0.18 kg CO2e / kg)
  const organicOffsetKg = params.isOrganic ? quantity * 0.18 : 0;

  // Packaging impact
  let packagingOffsetKg = 0;
  if (params.packagingType === 'Eco-Sustainable') {
    packagingOffsetKg = quantity * 0.06; // Savings from compostable plant starch
  } else if (params.packagingType === 'Luxury Gift Box') {
    packagingOffsetKg = -0.04 * quantity; // Extra penalty for heavy wooden/cardboard box
  }

  // Net CO2e
  const netCo2eKgTotal = Math.max(0.02, grossTransportCo2eKg - organicOffsetKg - packagingOffsetKg);
  const netCo2eKgPerUnit = netCo2eKgTotal / quantity;

  // Sustainability Score Calculation (0 - 100)
  let score = 50;

  // Organic bonus
  if (params.isOrganic) score += 20;

  // Transport mode bonus
  if (mode.id === 'sea') score += 20;
  else if (mode.id === 'rail') score += 18;
  else if (mode.id === 'road') score += 10;
  else if (mode.id === 'air') score -= 15;

  // Distance penalty/bonus
  if (distanceKm < 1500) score += 15;
  else if (distanceKm < 4000) score += 8;
  else if (distanceKm > 8000) score -= 10;

  // Packaging bonus
  if (params.packagingType === 'Eco-Sustainable') score += 8;

  // Clamp score between 10 and 100
  score = Math.min(100, Math.max(10, Math.round(score)));

  let sustainabilityGrade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'C';
  if (score >= 90) sustainabilityGrade = 'A+';
  else if (score >= 80) sustainabilityGrade = 'A';
  else if (score >= 70) sustainabilityGrade = 'B';
  else if (score >= 50) sustainabilityGrade = 'C';
  else sustainabilityGrade = 'D';

  // Equivalents
  const carKmEquivalent = Number((netCo2eKgTotal / 0.20).toFixed(1)); // 0.2 kg CO2 per car km
  const treeDaysEquivalent = Number((netCo2eKgTotal / 0.06).toFixed(1)); // ~0.06 kg absorbed per tree daily

  const badges: string[] = [];
  if (params.isOrganic) badges.push("Zero Synthetic Chemicals");
  if (mode.ecoRating === 'High') badges.push("Low-Emission Corridor");
  if (distanceKm < 2000) badges.push("Regional Micro-Transit");
  if (params.packagingType === 'Eco-Sustainable') badges.push("Compostable Packaging");

  return {
    distanceKm,
    mode,
    grossTransportCo2eKg: Number(grossTransportCo2eKg.toFixed(3)),
    organicOffsetKg: Number(organicOffsetKg.toFixed(3)),
    packagingOffsetKg: Number(packagingOffsetKg.toFixed(3)),
    netCo2eKgTotal: Number(netCo2eKgTotal.toFixed(3)),
    netCo2eKgPerUnit: Number(netCo2eKgPerUnit.toFixed(3)),
    sustainabilityScore: score,
    sustainabilityGrade,
    carKmEquivalent,
    treeDaysEquivalent,
    badges
  };
}
