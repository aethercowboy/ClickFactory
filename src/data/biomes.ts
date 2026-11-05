import { BiomeId } from '../types/game';

export interface BiomeDef {
  id: BiomeId;
  name: string;
  sector: string;
  tagline: string;
  description: string;
  icon: string;
  accentColor: string;
  badgeBg: string;
  badgeBorder: string;
  skyGradient: string;
  horizonGradient: string;
  ambientTone: string;
  ambientChords: number[]; // Frequencies in Hz for Web Audio drone
  resourceNotes: string;
  environmentalTraits: string[];
  terrainType: 'plains' | 'canyons' | 'mountains' | 'dunes' | 'alien_spires';
}

export const BIOMES: BiomeDef[] = [
  {
    id: 'grass_fields',
    name: 'Grass Fields',
    sector: 'Sector 01',
    tagline: 'Ideal Pioneer Colony Drop Site',
    description: 'Vast rolling savannahs rich with leafy flora and gentle terrain. Excellent starting conditions with widespread surface iron and copper nodes.',
    icon: 'Trees',
    accentColor: '#4ade80', // Emerald green
    badgeBg: 'rgba(34, 197, 94, 0.15)',
    badgeBorder: 'rgba(34, 197, 94, 0.4)',
    skyGradient: 'from-emerald-950/40 via-[#101915] to-[#0c1210]',
    horizonGradient: 'from-emerald-900/30 to-transparent',
    ambientTone: 'Warm savannah breeze with gentle rustling grasslands',
    ambientChords: [130.81, 196.0, 261.63, 329.63], // C3, G3, C4, E4 (Warm major)
    resourceNotes: 'High biomass yield, standard purity iron/copper, balanced limestone deposits.',
    environmentalTraits: ['Abundant Flora & Leaves', 'Flat Gentle Topography', 'Temperate Climate', 'Open Build Space'],
    terrainType: 'plains',
  },
  {
    id: 'rocky_desert',
    name: 'Rocky Desert',
    sector: 'Sector 02',
    tagline: 'Terraced Sandstone Plateaus',
    description: 'Carved sandstone mesas and ancient dry riverbeds. High-contrast ochre stone formations with rich deposits of Caterium gold and deep coal reserves.',
    icon: 'Mountain',
    accentColor: '#f59e0b', // Amber / sandstone gold
    badgeBg: 'rgba(245, 158, 11, 0.15)',
    badgeBorder: 'rgba(245, 158, 11, 0.4)',
    skyGradient: 'from-amber-950/40 via-[#1a150e] to-[#0f0d09]',
    horizonGradient: 'from-amber-800/30 to-transparent',
    ambientTone: 'Arid canyon resonance with dry desert wind echoes',
    ambientChords: [146.83, 220.0, 293.66, 369.99], // D3, A3, D4, F#4 (Open fifths desert drone)
    resourceNotes: 'High limestone purity, pure Caterium veins, concentrated coal basins.',
    environmentalTraits: ['Elevated Plateaus', 'High Caterium Purity', 'Arid Sandstone Strata', 'Direct Rail Corridors'],
    terrainType: 'canyons',
  },
  {
    id: 'northern_forest',
    name: 'Northern Forest',
    sector: 'Sector 03',
    tagline: 'Alpine Spruce Mountain Valleys',
    description: 'Lush coniferous highlands surrounded by jagged granite peaks. Exceptionally dense mineral purity and pure quartz nodes nestled in cool mountain mist.',
    icon: 'Compass',
    accentColor: '#14b8a6', // Teal / alpine spruce
    badgeBg: 'rgba(20, 184, 166, 0.15)',
    badgeBorder: 'rgba(20, 184, 166, 0.4)',
    skyGradient: 'from-teal-950/40 via-[#0e1717] to-[#0a1011]',
    horizonGradient: 'from-teal-800/30 to-transparent',
    ambientTone: 'Crisp mountain alpine mist with serene high-altitude hum',
    ambientChords: [164.81, 246.94, 329.63, 440.0], // E3, B3, E4, A4 (Cool suspended alpine)
    resourceNotes: 'Ultra-pure resource nodes across all categories, steep vertical terrain.',
    environmentalTraits: ['Dense Spruce Canopies', 'Pure Quartz & Bauxite', 'Mist-Shrouded Valleys', 'Vertical Logistics'],
    terrainType: 'mountains',
  },
  {
    id: 'dune_desert',
    name: 'Dune Desert',
    sector: 'Sector 04',
    tagline: 'Sweeping Crimson Sand Ocean',
    description: 'An immense sea of red and copper dunes stretching to the planetary horizon. Endless flat building expanses with boundless solar and raw crude oil fields.',
    icon: 'Sun',
    accentColor: '#f97316', // Desert copper / orange
    badgeBg: 'rgba(249, 115, 22, 0.15)',
    badgeBorder: 'rgba(249, 115, 22, 0.4)',
    skyGradient: 'from-orange-950/40 via-[#1c120c] to-[#120a06]',
    horizonGradient: 'from-orange-900/30 to-transparent',
    ambientTone: 'Scorching planetary heat mirage with low frequency sub-rumble',
    ambientChords: [174.61, 261.63, 349.23, 440.0], // F3, C4, F4, A4 (Warm desert shimmer)
    resourceNotes: 'Scarce water, vast crude oil access, enormous iron/copper availability.',
    environmentalTraits: ['Unlimited Flat Footprint', 'Intense Solar Radiance', 'Copper Sand Dunes', 'Mega-Factory Ready'],
    terrainType: 'dunes',
  },
  {
    id: 'titan_forest',
    name: 'Titan Forest',
    sector: 'Sector 05',
    tagline: 'Primeval Bioluminescent Canopy',
    description: 'An ancient, towering alien biosphere crowned by colossal mushroom spires and glowing spores. Houses rare exotic deposits of SAM Ore and Uranium.',
    icon: 'Sparkles',
    accentColor: '#c084fc', // Luminescent purple
    badgeBg: 'rgba(192, 132, 252, 0.15)',
    badgeBorder: 'rgba(192, 132, 252, 0.4)',
    skyGradient: 'from-purple-950/40 via-[#160f1f] to-[#0c0812]',
    horizonGradient: 'from-purple-900/30 to-transparent',
    ambientTone: 'Ethereal alien mycelium pulses and crystalline twilight harmonic',
    ambientChords: [116.54, 174.61, 261.63, 329.63], // Bb2, F3, C4, E4 (Lydian alien shimmer)
    resourceNotes: 'Concentrated SAM Ore, Uranium fuel nodes, dense alien chitin specimens.',
    environmentalTraits: ['Giant Fungus Spires', 'Bioluminescent Spores', 'SAM Ore & Radiation', 'Exotic Alien Flora'],
    terrainType: 'alien_spires',
  },
];

export const DEFAULT_BIOME_ID: BiomeId = 'grass_fields';

export function getBiomeDef(biomeId?: BiomeId): BiomeDef {
  return BIOMES.find(b => b.id === biomeId) || BIOMES[0];
}
