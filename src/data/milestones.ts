import { MilestoneDef } from '../types/game';

export const ALL_MILESTONES: MilestoneDef[] = [
  // TIER 0: ONBOARDING
  {
    id: 'tier0_upgrade_1',
    tier: 0,
    name: 'HUB Upgrade 1: Equipment Workshop',
    description: 'Establish the initial FICSIT pioneer operational outpost. Unlocks portable mining drills.',
    cost: [{ itemId: 'iron_ore', amount: 10 }],
    rewards: ['Portable Miner', 'Equipment Workshop'],
    unlocks: {
      buildings: ['portable_miner'],
      recipes: ['recipe_iron_plate', 'recipe_iron_rod'],
    },
  },
  {
    id: 'tier0_upgrade_2',
    tier: 0,
    name: 'HUB Upgrade 2: Smelting & Copper',
    description: 'Unlocks automated smelting furnaces, copper mineral surveying, and installs the 1st integrated HUB Biomass Burner (20 MW) to power early automation.',
    cost: [
      { itemId: 'iron_rod', amount: 20 },
      { itemId: 'iron_plate', amount: 10 },
    ],
    rewards: ['Smelter', 'HUB Biomass Burner #1 (20 MW)', 'Power Grid Monitor', 'Copper Ore Node', 'Wire', 'Cable'],
    unlocks: {
      buildings: ['smelter', 'hub_biomass_burner'],
      ores: ['copper_ore'],
      recipes: ['recipe_copper_ingot', 'recipe_wire', 'recipe_cable'],
      features: ['power_grid'],
      grantGenerators: [{ buildingId: 'hub_biomass_burner', count: 1, maxTotal: 2 }],
    },
  },
  {
    id: 'tier0_upgrade_3',
    tier: 0,
    name: 'HUB Upgrade 3: Limestone & Fasteners',
    description: 'Survey limestone deposits to grind concrete for factory foundations, and machine fine screws.',
    cost: [
      { itemId: 'iron_plate', amount: 20 },
      { itemId: 'iron_rod', amount: 20 },
      { itemId: 'wire', amount: 50 },
    ],
    rewards: ['Limestone Node', 'Concrete Recipe', 'Screw Recipe', 'Constructor'],
    unlocks: {
      buildings: ['constructor_machine'],
      ores: ['limestone'],
      recipes: ['recipe_concrete', 'recipe_screw'],
    },
  },
  {
    id: 'tier0_upgrade_4',
    tier: 0,
    name: 'HUB Upgrade 4: Reinforced Plating',
    description: 'Bolt structural plates together, construct Miner Mk.1 drill rigs, and install the 2nd integrated HUB Biomass Burner (+20 MW).',
    cost: [
      { itemId: 'iron_plate', amount: 75 },
      { itemId: 'cable', amount: 20 },
      { itemId: 'concrete', amount: 10 },
    ],
    rewards: ['Miner Mk.1', 'HUB Biomass Burner #2 (+20 MW)', 'Reinforced Iron Plate Recipe', 'Copper Sheet Recipe'],
    unlocks: {
      buildings: ['miner_mk1', 'hub_biomass_burner'],
      recipes: ['recipe_reinforced_plate', 'recipe_copper_sheet'],
      grantGenerators: [{ buildingId: 'hub_biomass_burner', count: 1, maxTotal: 2 }],
    },
  },
  {
    id: 'tier0_upgrade_5',
    tier: 0,
    name: 'HUB Upgrade 5: Power Generation',
    description: 'Construct standalone 30 MW Biomass Burners with superior fuel efficiency and refine raw flora into dense Biomass.',
    cost: [
      { itemId: 'iron_rod', amount: 75 },
      { itemId: 'cable', amount: 50 },
      { itemId: 'concrete', amount: 20 },
    ],
    rewards: ['Standalone Biomass Burner (30 MW)', 'Biomass Refining', 'Expanded Power Grid'],
    unlocks: {
      buildings: ['biomass_burner'],
      recipes: ['recipe_biomass_leaves'],
      features: ['power_grid'],
    },
  },

  // TIER 1: BASE BUILDING & FIELD RESEARCH
  {
    id: 'tier1_field_research',
    tier: 1,
    name: 'Field Research & MAM',
    description: 'Deploy the Molecular Analysis Machine (MAM) to analyze alien artifacts, power slugs, and caterium.',
    cost: [
      { itemId: 'wire', amount: 300 },
      { itemId: 'screw', amount: 300 },
      { itemId: 'iron_plate', amount: 100 },
    ],
    rewards: ['MAM Tech Trees', 'Alien Research', 'Power Slug Scanning'],
    unlocks: {
      ores: ['caterium_ore', 'alien_remains'],
      recipes: ['recipe_caterium_ingot', 'recipe_quickwire'],
      features: ['mam_research'],
    },
  },
  {
    id: 'tier1_logistics',
    tier: 1,
    name: 'Logistics & Conveyor Routing',
    description: 'Automate transport lines with Conveyor Belts Mk.1 and high-capacity storage buffers.',
    cost: [
      { itemId: 'iron_plate', amount: 150 },
      { itemId: 'iron_rod', amount: 150 },
      { itemId: 'wire', amount: 300 },
    ],
    rewards: ['Conveyor Mk.1 (+20% machine efficiency)', 'Automated Buffers'],
    unlocks: {
      features: ['conveyor_logistics'],
    },
  },

  // TIER 2: PART ASSEMBLY & AWESOME SINK
  {
    id: 'tier2_part_assembly',
    tier: 2,
    name: 'Part Assembly',
    description: 'Construct automated 2-input Assemblers for Rotors, Modular Frames, and Project Assembly parts.',
    cost: [
      { itemId: 'reinforced_plate', amount: 50 },
      { itemId: 'screw', amount: 300 },
      { itemId: 'cable', amount: 100 },
    ],
    rewards: ['Assembler', 'Rotor Recipe', 'Modular Frame Recipe', 'Smart Plating (Space Elevator)', 'Quartz Processing'],
    unlocks: {
      buildings: ['assembler'],
      recipes: [
        'recipe_rotor',
        'recipe_modular_frame',
        'recipe_smart_plating',
        'recipe_quartz_crystal',
        'recipe_silica',
      ],
      ores: ['raw_quartz'],
    },
  },
  {
    id: 'tier2_awesome_sink',
    tier: 2,
    name: 'Resource Sink & AWESOME Shop',
    description: 'Send excess production into the AWESOME Sink to earn FICSIT Coupons and purchase premium upgrades.',
    cost: [
      { itemId: 'reinforced_plate', amount: 50 },
      { itemId: 'concrete', amount: 400 },
      { itemId: 'wire', amount: 500 },
    ],
    rewards: ['AWESOME Sink', 'AWESOME Shop Unlocks', 'Solid Biofuel'],
    unlocks: {
      recipes: ['recipe_solid_biofuel', 'recipe_alien_dna_capsule'],
      features: ['awesome_sink', 'awesome_shop'],
    },
  },

  // TIER 3: COAL POWER & BASIC STEEL
  {
    id: 'tier3_coal_power',
    tier: 3,
    name: 'Coal Power & Fluids',
    description: 'Transition from manual biomass gathering to fully autonomous, non-stop 75 MW Coal Generators.',
    cost: [
      { itemId: 'reinforced_plate', amount: 150 },
      { itemId: 'rotor', amount: 50 },
      { itemId: 'cable', amount: 300 },
    ],
    rewards: ['Coal Generator', 'Water Extractor', 'Coal Ore Node', 'Water Fluid'],
    unlocks: {
      buildings: ['coal_generator', 'water_extractor'],
      ores: ['coal', 'water'],
    },
  },
  {
    id: 'tier3_basic_steel',
    tier: 3,
    name: 'Basic Steel Production',
    description: 'Construct dual-input Foundries to smelt high-tensile steel ingots, beams, and pipes.',
    cost: [
      { itemId: 'concrete', amount: 300 },
      { itemId: 'wire', amount: 500 },
      { itemId: 'smart_plating', amount: 50 },
    ],
    rewards: ['Foundry', 'Steel Ingot', 'Steel Beam', 'Steel Pipe', 'Stator', 'Automated Wiring', 'Versatile Framework'],
    unlocks: {
      buildings: ['foundry'],
      recipes: [
        'recipe_steel_ingot',
        'recipe_steel_beam',
        'recipe_steel_pipe',
        'recipe_stator',
        'recipe_automated_wiring',
        'recipe_versatile_framework',
        'recipe_ai_limiter',
      ],
    },
  },

  // TIER 4: ADVANCED STEEL & MOTORS
  {
    id: 'tier4_advanced_steel',
    tier: 4,
    name: 'Advanced Steel Production',
    description: 'Encase steel beams in concrete for heavy dampening and combine rotaries into full electric motors.',
    cost: [
      { itemId: 'steel_beam', amount: 200 },
      { itemId: 'steel_pipe', amount: 200 },
      { itemId: 'concrete', amount: 500 },
    ],
    rewards: ['Miner Mk.2', 'Encased Industrial Beam', 'Motor Recipe'],
    unlocks: {
      buildings: ['miner_mk2'],
      recipes: ['recipe_encased_beam', 'recipe_motor'],
    },
  },

  // TIER 5: OIL PROCESSING & COMPUTERS
  {
    id: 'tier5_oil_processing',
    tier: 5,
    name: 'Oil Processing & Petrochemicals',
    description: 'Tap subterranean crude oil reservoirs. Distill plastics, rubber, and combustible fuel.',
    cost: [
      { itemId: 'motor', amount: 50 },
      { itemId: 'encased_beam', amount: 100 },
      { itemId: 'steel_pipe', amount: 500 },
    ],
    rewards: ['Oil Extractor', 'Refinery', 'Plastic', 'Rubber', 'Fuel', 'Circuit Board'],
    unlocks: {
      buildings: ['oil_extractor', 'refinery'],
      ores: ['crude_oil'],
      recipes: ['recipe_plastic', 'recipe_rubber', 'recipe_fuel', 'recipe_circuit_board'],
    },
  },
  {
    id: 'tier5_industrial_manufacturing',
    tier: 5,
    name: 'Industrial Manufacturing',
    description: 'Fabricate 4-line Manufacturers capable of assembling computers and heavy industrial frameworks.',
    cost: [
      { itemId: 'motor', amount: 100 },
      { itemId: 'plastic', amount: 200 },
      { itemId: 'rubber', amount: 200 },
    ],
    rewards: ['Manufacturer', 'Computer Recipe', 'Heavy Modular Frame Recipe', 'Crystal Oscillator'],
    unlocks: {
      buildings: ['manufacturer'],
      recipes: ['recipe_computer', 'recipe_heavy_modular_frame', 'recipe_crystal_oscillator'],
    },
  },

  // TIER 6: EXPANDED POWER & AEROSPACE
  {
    id: 'tier6_expanded_power',
    tier: 6,
    name: 'Expanded Power Infrastructure',
    description: 'Deploy 250 MW Fuel Generators and formulate high-energy Turbofuel mixtures.',
    cost: [
      { itemId: 'computer', amount: 50 },
      { itemId: 'heavy_modular_frame', amount: 50 },
      { itemId: 'motor', amount: 100 },
    ],
    rewards: ['Fuel Generator', 'Turbofuel Synthesis', 'Modular Engine', 'Adaptive Control Unit'],
    unlocks: {
      buildings: ['fuel_generator'],
      recipes: ['recipe_turbofuel', 'recipe_modular_engine', 'recipe_adaptive_control_unit'],
    },
  },

  // TIER 7: BAUXITE & ALUMINUM
  {
    id: 'tier7_bauxite_refinement',
    tier: 7,
    name: 'Bauxite & Aluminum Refinement',
    description: 'Extract and purify bauxite ore into featherlight aerodynamic aluminum alloys.',
    cost: [
      { itemId: 'computer', amount: 100 },
      { itemId: 'heavy_modular_frame', amount: 100 },
      { itemId: 'rubber', amount: 500 },
    ],
    rewards: ['Miner Mk.3', 'Blender', 'Aluminum Ingot', 'Aluminum Casing', 'Radio Control Unit', 'Supercomputer', 'High-Speed Connector'],
    unlocks: {
      buildings: ['miner_mk3', 'blender'],
      ores: ['bauxite'],
      recipes: [
        'recipe_aluminum_scrap',
        'recipe_aluminum_ingot',
        'recipe_aluminum_casing',
        'recipe_radio_control_unit',
        'recipe_supercomputer',
        'recipe_high_speed_connector',
      ],
    },
  },

  // TIER 8: NUCLEAR POWER & LEADING EDGE
  {
    id: 'tier8_nuclear_power',
    tier: 8,
    name: 'Nuclear Power Generation',
    description: 'Harness atomic fission with 2,500 MW Nuclear Power Plants using enriched Uranium Fuel Rods.',
    cost: [
      { itemId: 'supercomputer', amount: 50 },
      { itemId: 'heavy_modular_frame', amount: 100 },
      { itemId: 'aluminum_casing', amount: 400 },
    ],
    rewards: ['Nuclear Power Plant', 'Uranium Ore Node', 'Uranium Fuel Rod Recipe', 'Particle Accelerator'],
    unlocks: {
      buildings: ['nuclear_power_plant', 'accelerator'],
      ores: ['uranium'],
      recipes: [
        'recipe_uranium_fuel_rod',
        'recipe_fused_modular_frame',
        'recipe_nuclear_pasta',
        'recipe_magnetic_field_generator',
        'recipe_thermal_propulsion_rocket',
        'recipe_assembly_director_system',
      ],
    },
  },

  // TIER 9: QUANTUM TECHNOLOGY & FICSIT ENDGAME
  {
    id: 'tier9_quantum_tech',
    tier: 9,
    name: 'Quantum Technology & SAM Synthesis',
    description: 'Synthesize Strange Alien Matter to unlock spacetime manipulation and ultimate planetary automation.',
    cost: [
      { itemId: 'assembly_director_system', amount: 50 },
      { itemId: 'nuclear_pasta', amount: 50 },
      { itemId: 'thermal_propulsion_rocket', amount: 25 },
    ],
    rewards: ['SAM Ore Node', 'Dark Matter Synthesis', 'Time Crystals', 'Singularity Cells', 'FICSIT Planetary Master Title'],
    unlocks: {
      ores: ['sam_ore'],
      features: ['quantum_tech'],
    },
  },
];
