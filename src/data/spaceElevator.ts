import { SpaceElevatorPhaseDef } from '../types/game';

export const SPACE_ELEVATOR_PHASES: SpaceElevatorPhaseDef[] = [
  {
    phase: 1,
    name: 'Project Assembly: Phase 1 (Platform Foundation)',
    description: 'Orbital platform needs structural dampening and kinetic alignment. Deliver Smart Plating to unlock Tiers 3 & 4 (Coal Power and Basic Steel).',
    requirements: [{ itemId: 'smart_plating', amount: 50 }],
    unlocksTiers: [3, 4],
  },
  {
    phase: 2,
    name: 'Project Assembly: Phase 2 (Orbital Logistics)',
    description: 'Equip the station with high-bandwidth automated wiring and modular superstructure framing. Unlocks Tiers 5 & 6 (Oil Refining & Industrial Manufacturing).',
    requirements: [
      { itemId: 'smart_plating', amount: 500 },
      { itemId: 'automated_wiring', amount: 500 },
      { itemId: 'versatile_framework', amount: 100 },
    ],
    unlocksTiers: [5, 6],
  },
  {
    phase: 3,
    name: 'Project Assembly: Phase 3 (Orbital Propulsion)',
    description: 'Deliver heavy attitude-control engines and adaptive avionics for space station stabilization. Unlocks Tiers 7 & 8 (Bauxite/Aluminum and Nuclear Power).',
    requirements: [
      { itemId: 'versatile_framework', amount: 2500 },
      { itemId: 'modular_engine', amount: 500 },
      { itemId: 'adaptive_control_unit', amount: 100 },
    ],
    unlocksTiers: [7, 8],
  },
  {
    phase: 4,
    name: 'Project Assembly: Phase 4 (Deep Space Expansion)',
    description: 'The crowning achievement of Project Assembly: Magnetic shielding, director neural arrays, hypersonic thermal rockets, and degenerate Nuclear Pasta. Unlocks Tier 9 Quantum Technology and grants the FICSIT Employee of the Planet prestige!',
    requirements: [
      { itemId: 'assembly_director_system', amount: 4000 },
      { itemId: 'magnetic_field_generator', amount: 4000 },
      { itemId: 'thermal_propulsion_rocket', amount: 1000 },
      { itemId: 'nuclear_pasta', amount: 1000 },
    ],
    unlocksTiers: [9],
  },
];
