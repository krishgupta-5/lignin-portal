// Mock data for the Lignin Extraction Predictor portal

export const plantOptions = [
  { value: 'miscanthus', label: 'Miscanthus' },
  { value: 'rice_straw', label: 'Rice Straw' },
  { value: 'sugarcane_bagasse', label: 'Sugarcane Bagasse' },
  { value: 'bamboo', label: 'Bamboo' },
  { value: 'wheat_straw', label: 'Wheat Straw' },
  { value: 'corn_stover', label: 'Corn Stover' },
  { value: 'switchgrass', label: 'Switchgrass' },
  { value: 'poplar', label: 'Poplar Wood' },
];

export const chemicalOptions = [
  { value: 'choline_chloride_urea', label: 'Choline Chloride + Urea' },
  { value: 'naoh', label: 'NaOH (Sodium Hydroxide)' },
  { value: 'h2so4', label: 'H₂SO₄ (Sulfuric Acid)' },
  { value: 'ionic_liquids', label: 'Ionic Liquids' },
  { value: 'des', label: 'Deep Eutectic Solvents' },
  { value: 'ethanol', label: 'Ethanol (Organosolv)' },
  { value: 'kraft', label: 'Kraft Process (NaOH + Na₂S)' },
];

export const performanceRatings = ['Better', 'Good', 'Average', 'Poor'];

// Generates a realistic sigmoid-like yield curve
export function generateYieldCurve(maxYield = 78.6, steepness = 0.04, midpoint = 60) {
  const data = [];
  for (let t = 0; t <= 180; t += 10) {
    const y = maxYield / (1 + Math.exp(-steepness * (t - midpoint)));
    data.push({
      time: t,
      yield: Math.round(y * 10) / 10,
    });
  }
  return data;
}

// Default prediction result (matches mockup)
export const defaultPrediction = {
  ligninYield: 78.6,
  recommendedTime: 62,
  performance: 'Better',
  confidence: 91.4,
  yieldCurve: generateYieldCurve(78.6, 0.04, 60),
};

// Generates a simulated prediction based on inputs
export function simulatePrediction(plant, chemical, temperature, timeRange, ratio, ph) {
  // Create a deterministic but varied result based on inputs
  const seed = (plant + chemical + temperature + ph).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = (min, max) => min + ((seed * 9301 + 49297) % 233280) / 233280 * (max - min);
  
  const ligninYield = Math.round(rand(45, 92) * 10) / 10;
  const recommendedTime = Math.round(rand(30, 120));
  const confidence = Math.round(rand(72, 97) * 10) / 10;
  
  let performance;
  if (ligninYield >= 75) performance = 'Better';
  else if (ligninYield >= 60) performance = 'Good';
  else if (ligninYield >= 45) performance = 'Average';
  else performance = 'Poor';

  return {
    ligninYield,
    recommendedTime,
    performance,
    confidence,
    yieldCurve: generateYieldCurve(ligninYield, 0.03 + Math.random() * 0.03, recommendedTime),
  };
}

// Sample history data
export const sampleHistory = [
  {
    id: 'pred-001',
    date: '2026-05-28 14:32',
    plant: 'Miscanthus',
    chemical: 'Choline Chloride + Urea',
    temperature: 120,
    timeRange: '10 – 180',
    ratio: '1:15',
    ph: 3.5,
    ligninYield: 78.6,
    recommendedTime: 62,
    performance: 'Better',
    confidence: 91.4,
  },
  {
    id: 'pred-002',
    date: '2026-05-28 11:15',
    plant: 'Rice Straw',
    chemical: 'NaOH (Sodium Hydroxide)',
    temperature: 100,
    timeRange: '10 – 150',
    ratio: '1:10',
    ph: 12.0,
    ligninYield: 65.2,
    recommendedTime: 85,
    performance: 'Good',
    confidence: 87.3,
  },
  {
    id: 'pred-003',
    date: '2026-05-27 16:48',
    plant: 'Sugarcane Bagasse',
    chemical: 'H₂SO₄ (Sulfuric Acid)',
    temperature: 140,
    timeRange: '10 – 120',
    ratio: '1:20',
    ph: 1.5,
    ligninYield: 82.1,
    recommendedTime: 48,
    performance: 'Better',
    confidence: 93.7,
  },
  {
    id: 'pred-004',
    date: '2026-05-27 09:22',
    plant: 'Bamboo',
    chemical: 'Deep Eutectic Solvents',
    temperature: 110,
    timeRange: '10 – 180',
    ratio: '1:12',
    ph: 5.0,
    ligninYield: 55.8,
    recommendedTime: 95,
    performance: 'Average',
    confidence: 79.1,
  },
  {
    id: 'pred-005',
    date: '2026-05-26 13:05',
    plant: 'Wheat Straw',
    chemical: 'Ionic Liquids',
    temperature: 130,
    timeRange: '10 – 160',
    ratio: '1:18',
    ph: 7.0,
    ligninYield: 71.4,
    recommendedTime: 72,
    performance: 'Good',
    confidence: 85.6,
  },
  {
    id: 'pred-006',
    date: '2026-05-26 08:30',
    plant: 'Corn Stover',
    chemical: 'Ethanol (Organosolv)',
    temperature: 160,
    timeRange: '10 – 200',
    ratio: '1:8',
    ph: 4.2,
    ligninYield: 88.3,
    recommendedTime: 55,
    performance: 'Better',
    confidence: 95.2,
  },
  {
    id: 'pred-007',
    date: '2026-05-25 17:12',
    plant: 'Switchgrass',
    chemical: 'Kraft Process (NaOH + Na₂S)',
    temperature: 170,
    timeRange: '10 – 180',
    ratio: '1:6',
    ph: 13.0,
    ligninYield: 42.5,
    recommendedTime: 110,
    performance: 'Poor',
    confidence: 72.8,
  },
  {
    id: 'pred-008',
    date: '2026-05-25 10:45',
    plant: 'Poplar Wood',
    chemical: 'Choline Chloride + Urea',
    temperature: 115,
    timeRange: '10 – 150',
    ratio: '1:14',
    ph: 4.0,
    ligninYield: 74.9,
    recommendedTime: 68,
    performance: 'Good',
    confidence: 89.5,
  },
];
