import { MAMNodeDef } from '../types/game';

export const ALL_MAM_NODES: MAMNodeDef[] = [
  // POWER SLUGS TREE
  {
    id: 'mam_slug_blue',
    tree: 'slugs',
    name: 'Blue Power Slug Analysis',
    description: 'Extract raw crystal energy from native blue slugs. Unlocks Power Shards and Overclocking up to 150%.',
    researchDuration: 5,
    cost: [{ itemId: 'leaves', amount: 50 }],
    prerequisites: [],
    unlocks: {
      overclockMax: 1.5,
      perkName: 'Power Shards & 150% Overclocking',
    },
  },
  {
    id: 'mam_slug_yellow',
    tree: 'slugs',
    name: 'Yellow Power Slug Analysis',
    description: 'Synthesize higher frequency crystals. Increases maximum machine overclocking cap to 200%.',
    researchDuration: 12,
    cost: [
      { itemId: 'wire', amount: 100 },
      { itemId: 'reinforced_plate', amount: 20 },
    ],
    prerequisites: ['mam_slug_blue'],
    unlocks: {
      overclockMax: 2.0,
      perkName: '200% Overclocking Cap',
    },
  },
  {
    id: 'mam_slug_purple',
    tree: 'slugs',
    name: 'Purple Power Slug Overdrive',
    description: 'Master harmonic resonance of rare purple slugs. Maximizes machine overclocking to 250% overdrive.',
    researchDuration: 25,
    cost: [
      { itemId: 'modular_frame', amount: 20 },
      { itemId: 'rotor', amount: 30 },
      { itemId: 'crystal_oscillator', amount: 5 },
    ],
    prerequisites: ['mam_slug_yellow'],
    unlocks: {
      overclockMax: 2.5,
      perkName: '250% Overclocking Maximum',
    },
  },

  // CATERIUM TREE
  {
    id: 'mam_cat_ingot',
    tree: 'caterium',
    name: 'Caterium Metallurgy',
    description: 'Analyze gold conductive properties. Unlocks efficient quickwire drawing.',
    researchDuration: 6,
    cost: [{ itemId: 'caterium_ore', amount: 25 }],
    prerequisites: [],
    unlocks: {
      recipes: ['recipe_caterium_ingot', 'recipe_quickwire'],
      ores: ['caterium_ore'],
      perkName: 'Caterium Metallurgy',
    },
  },
  {
    id: 'mam_cat_blade_runners',
    tree: 'caterium',
    name: 'Blade Runners Exoskeleton',
    description: 'Pioneer leg braces engineered with caterium springs. Boosts manual mining and crafting speed by +100%.',
    researchDuration: 15,
    cost: [
      { itemId: 'quickwire', amount: 100 },
      { itemId: 'rotor', amount: 15 },
    ],
    prerequisites: ['mam_cat_ingot'],
    unlocks: {
      manualSpeedMultiplier: 2.0,
      perkName: 'Blade Runners: +100% Manual Crafting Speed',
    },
  },
  {
    id: 'mam_cat_ai_limiter',
    tree: 'caterium',
    name: 'AI Limiter Architecture',
    description: 'FICSIT cybernetic inhibitors safeguarding autonomous assembly logic.',
    researchDuration: 18,
    cost: [
      { itemId: 'quickwire', amount: 200 },
      { itemId: 'copper_sheet', amount: 50 },
    ],
    prerequisites: ['mam_cat_blade_runners'],
    unlocks: {
      recipes: ['recipe_ai_limiter', 'recipe_high_speed_connector'],
      perkName: 'AI Limiter & High-Speed Logic',
    },
  },

  // ALIEN ORGANISMS TREE
  {
    id: 'mam_alien_carapace',
    tree: 'alien',
    name: 'Hog & Spitter Carapace Analysis',
    description: 'Analyze chitinous alien remains to synthesize nutritious and industrial organic proteins.',
    researchDuration: 8,
    cost: [{ itemId: 'alien_remains', amount: 5 }],
    prerequisites: [],
    unlocks: {
      perkName: 'Alien Chitin Synthesis',
      recipes: ['recipe_alien_dna_capsule'],
    },
  },
  {
    id: 'mam_alien_dna',
    tree: 'alien',
    name: 'Alien DNA Capsule Protocol',
    description: 'Package pure alien genetic code into capsules that yield immense coupon points in the AWESOME Sink.',
    researchDuration: 20,
    cost: [
      { itemId: 'alien_remains', amount: 15 },
      { itemId: 'plastic', amount: 20 },
    ],
    prerequisites: ['mam_alien_carapace'],
    unlocks: {
      perkName: 'High-Yield DNA Capsules (120,000 Sink Pts)',
    },
  },

  // QUARTZ TREE
  {
    id: 'mam_quartz_analysis',
    tree: 'quartz',
    name: 'Quartz Crystal Structure',
    description: 'Examine piezoelectric properties of planetary quartz nodes. Unlocks Silica flux.',
    researchDuration: 8,
    cost: [{ itemId: 'raw_quartz', amount: 20 }],
    prerequisites: [],
    unlocks: {
      recipes: ['recipe_quartz_crystal', 'recipe_silica'],
      ores: ['raw_quartz'],
      perkName: 'Quartz Purification',
    },
  },
  {
    id: 'mam_quartz_oscillator',
    tree: 'quartz',
    name: 'Crystal Oscillator Fabrication',
    description: 'Harmonize quartz wafer oscillators for ultra-precise avionics and computer telemetry.',
    researchDuration: 20,
    cost: [
      { itemId: 'quartz_crystal', amount: 50 },
      { itemId: 'reinforced_plate', amount: 30 },
    ],
    prerequisites: ['mam_quartz_analysis'],
    unlocks: {
      recipes: ['recipe_crystal_oscillator'],
      perkName: 'Crystal Oscillator Avionics',
    },
  },

  // HARD DRIVES / ALTERNATE RECIPES TREE
  {
    id: 'mam_hard_drive_cast_screw',
    tree: 'hard_drives',
    name: 'Crash Site #1: Cast Screw Blueprint',
    description: 'Recovered FICSIT crash telemetry. Casts Screws directly from melted Iron Ingots without rods.',
    researchDuration: 15,
    cost: [
      { itemId: 'iron_ingot', amount: 100 },
      { itemId: 'reinforced_plate', amount: 25 },
    ],
    prerequisites: [],
    unlocks: {
      alternateRecipeId: 'recipe_cast_screw',
      perkName: 'Alternate: Cast Screw (Skip Rods!)',
    },
  },
  {
    id: 'mam_hard_drive_bolted_plate',
    tree: 'hard_drives',
    name: 'Crash Site #2: Bolted Iron Plate',
    description: 'High-pressure bolting recipe producing Reinforced Plates in larger batches at higher speed.',
    researchDuration: 20,
    cost: [
      { itemId: 'screw', amount: 500 },
      { itemId: 'rotor', amount: 20 },
    ],
    prerequisites: ['mam_hard_drive_cast_screw'],
    unlocks: {
      alternateRecipeId: 'recipe_bolted_plate',
      perkName: 'Alternate: Bolted Iron Plate (+100% Yield)',
    },
  },

  // FICSMAS HOLIDAY TREE
  {
    id: 'mam_ficsmas_holiday_cheer',
    tree: 'ficsmas',
    name: 'Holiday Spirit Analysis',
    description: 'Initial telemetry scan of festive packages descending through the clouds. Unlocks Red & Blue Ornaments and Tree Branches.',
    researchDuration: 5,
    cost: [{ itemId: 'ficsmas_gift', amount: 10 }],
    prerequisites: [],
    unlocks: {
      recipes: [
        'recipe_ficsmas_tree_branch',
        'recipe_ficsmas_ornament_red',
        'recipe_ficsmas_ornament_blue',
      ],
      perkName: 'Holiday Ornaments & Tree Branches',
    },
  },
  {
    id: 'mam_ficsmas_confectionery',
    tree: 'ficsmas',
    name: 'Festive Confectionery & Bows',
    description: 'Extract sucrose polymers and vibrant ribbons from holiday parcels. Unlocks Candy Canes & Bows.',
    researchDuration: 8,
    cost: [
      { itemId: 'ficsmas_gift', amount: 25 },
      { itemId: 'ficsmas_tree_branch', amount: 10 },
    ],
    prerequisites: ['mam_ficsmas_holiday_cheer'],
    unlocks: {
      recipes: ['recipe_ficsmas_candy_cane', 'recipe_ficsmas_bow'],
      perkName: 'Candy Canes & Festive Bows',
    },
  },
  {
    id: 'mam_ficsmas_metallurgy',
    tree: 'ficsmas',
    name: 'Industrial Bauble Metallurgy',
    description: 'Plate holiday ornaments in structural iron and conductive copper. Unlocks Copper & Iron Ornaments.',
    researchDuration: 12,
    cost: [
      { itemId: 'ficsmas_ornament_red', amount: 15 },
      { itemId: 'ficsmas_ornament_blue', amount: 15 },
      { itemId: 'copper_sheet', amount: 20 },
    ],
    prerequisites: ['mam_ficsmas_holiday_cheer'],
    unlocks: {
      recipes: ['recipe_ficsmas_ornament_copper', 'recipe_ficsmas_ornament_iron'],
      perkName: 'Copper & Iron Ornaments',
    },
  },
  {
    id: 'mam_ficsmas_snowballs',
    tree: 'ficsmas',
    name: 'Cryogenic Snowballs',
    description: 'Compress gift vapor into cryogenic snowballs for playful festive factory recreation.',
    researchDuration: 8,
    cost: [
      { itemId: 'ficsmas_gift', amount: 20 },
      { itemId: 'water', amount: 50 },
    ],
    prerequisites: ['mam_ficsmas_confectionery'],
    unlocks: {
      recipes: ['recipe_ficsmas_snowball'],
      perkName: 'FICSMAS Snowballs',
    },
  },
  {
    id: 'mam_ficsmas_gift_tree',
    tree: 'ficsmas',
    name: 'FICSMAS Gift Tree Automation',
    description: 'Assemble an automated gift harvester disguised as a holiday tree. Drops gifts autonomously.',
    researchDuration: 15,
    cost: [
      { itemId: 'ficsmas_tree_branch', amount: 25 },
      { itemId: 'ficsmas_ornament_copper', amount: 10 },
      { itemId: 'ficsmas_ornament_iron', amount: 10 },
    ],
    prerequisites: ['mam_ficsmas_metallurgy'],
    unlocks: {
      buildings: ['ficsmas_gift_tree'],
      perkName: 'Automated Gift Tree',
    },
  },
  {
    id: 'mam_ficsmas_wonder_star',
    tree: 'ficsmas',
    name: 'FICSMAS Wonder Star Synthesis',
    description: 'The absolute zenith of pioneer holiday craftsmanship. Unlocks the magnificent FICSMAS Wonder Star recipe.',
    researchDuration: 25,
    cost: [
      { itemId: 'ficsmas_ornament_copper', amount: 25 },
      { itemId: 'ficsmas_ornament_iron', amount: 25 },
      { itemId: 'ficsmas_bow', amount: 25 },
      { itemId: 'ficsmas_candy_cane', amount: 25 },
    ],
    prerequisites: ['mam_ficsmas_gift_tree', 'mam_ficsmas_snowballs'],
    unlocks: {
      recipes: ['recipe_ficsmas_wonder_star'],
      perkName: 'FICSMAS Wonder Star Recipe',
    },
  },
];
