import { ALL_MILESTONES } from '../src/data/milestones';
import { ALL_RECIPES, ALL_BUILDINGS, ALL_ITEMS } from '../src/data/items';
import { SPACE_ELEVATOR_PHASES } from '../src/data/spaceElevator';
import { INITIAL_SAVE } from '../src/utils/saveLoad';
import { ItemId } from '../src/types/game';

// Helper to compute reachable items using transitive closure
function computeReachableItems(
  ores: Set<ItemId>,
  recipes: Set<string>,
  buildings: Set<string>
): Set<ItemId> {
  const reachable = new Set<ItemId>(ores);

  // Manual gathering gives leaves and biomass raw items if surveyed
  if (ores.has('leaves')) {
    reachable.add('leaves');
  }

  let changed = true;
  let iterations = 0;
  const maxIterations = 50;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    for (const recipeId of recipes) {
      const recipe = ALL_RECIPES.find(r => r.id === recipeId);
      if (!recipe) continue;

      // Check if machine is available
      // The Pioneer Craft Bench can manually craft solid parts (smelting, constructor, assembler, foundry, manufacturer)
      // Refineries, blenders, and accelerators require their specific automated buildings
      const canCraftAtBench =
        recipe.machineType !== 'refinery' &&
        recipe.machineType !== 'accelerator' &&
        recipe.machineType !== 'blender';

      const hasBuilding =
        canCraftAtBench ||
        Object.values(ALL_BUILDINGS).some(
          b => b.machineType === recipe.machineType && buildings.has(b.id)
        );

      if (!hasBuilding) continue;

      // Check if all inputs are reachable
      const allInputsReachable = recipe.inputs.every(input => reachable.has(input.itemId));
      if (!allInputsReachable) continue;

      // Add outputs
      for (const output of recipe.outputs) {
        if (!reachable.has(output.itemId)) {
          reachable.add(output.itemId);
          changed = true;
        }
      }
    }
  }

  return reachable;
}

export function runProgressionTests() {
  console.log('--- RUNNING FICSIT PROGRESSION & CIRCULAR DEPENDENCY TESTS ---');
  let failures = 0;

  // TEST 1: Direct Circularity (Does a milestone require an item that it unlocks?)
  console.log('\n[TEST 1] Checking Direct Milestone Circular Dependencies...');
  for (const milestone of ALL_MILESTONES) {
    const unlockedItemIds = new Set<ItemId>();

    // Add unlocked ores
    if (milestone.unlocks.ores) {
      milestone.unlocks.ores.forEach(o => unlockedItemIds.add(o));
    }

    // Add outputs of unlocked recipes
    if (milestone.unlocks.recipes) {
      for (const rId of milestone.unlocks.recipes) {
        const recipe = ALL_RECIPES.find(r => r.id === rId);
        if (recipe) {
          recipe.outputs.forEach(out => unlockedItemIds.add(out.itemId));
        }
      }
    }

    // Check if any cost requires an item unlocked by this milestone
    for (const cost of milestone.cost) {
      if (unlockedItemIds.has(cost.itemId)) {
        console.error(
          `FAIL: Direct circular dependency in milestone "${milestone.name}" (${milestone.id})! Cost requires "${cost.itemId}", which is unlocked by this milestone.`
        );
        failures++;
      }
    }
  }
  if (failures === 0) {
    console.log('✓ Passed: No direct circular dependencies detected in any milestone.');
  }

  // TEST 2: Sequential Progression & Producibility Simulation
  console.log('\n[TEST 2] Simulating Full Game Progression from Tier 0 to Tier 9...');
  const currentOres = new Set<ItemId>(INITIAL_SAVE.unlockedOres);
  const currentRecipes = new Set<string>(INITIAL_SAVE.unlockedRecipes);
  const currentBuildings = new Set<string>(INITIAL_SAVE.unlockedBuildings);

  for (let i = 0; i < ALL_MILESTONES.length; i++) {
    const milestone = ALL_MILESTONES[i];
    const reachableBefore = computeReachableItems(currentOres, currentRecipes, currentBuildings);

    // Verify all cost items can be produced before unlocking this milestone
    for (const cost of milestone.cost) {
      if (!reachableBefore.has(cost.itemId)) {
        console.error(
          `FAIL: Milestone "${milestone.name}" (${milestone.id}) requires "${cost.itemId}" (${ALL_ITEMS[cost.itemId]?.name}), but it cannot be produced with technologies unlocked prior to this step!`
        );
        failures++;
      }
    }

    // Apply milestone unlocks
    if (milestone.unlocks.ores) {
      milestone.unlocks.ores.forEach(o => currentOres.add(o));
    }
    if (milestone.unlocks.recipes) {
      milestone.unlocks.recipes.forEach(r => currentRecipes.add(r));
    }
    if (milestone.unlocks.buildings) {
      milestone.unlocks.buildings.forEach(b => currentBuildings.add(b));
    }

    console.log(`  ✓ Tier ${milestone.tier}: "${milestone.name}" verified producible.`);
  }

  // TEST 3: Space Elevator Phases Reachability
  console.log('\n[TEST 3] Verifying Space Elevator Project Assembly Phases...');
  const finalReachable = computeReachableItems(currentOres, currentRecipes, currentBuildings);

  for (const phase of SPACE_ELEVATOR_PHASES) {
    for (const req of phase.requirements) {
      if (!finalReachable.has(req.itemId)) {
        console.error(
          `FAIL: Space Elevator Phase ${phase.phase} requires "${req.itemId}", but it is not producible by endgame technologies!`
        );
        failures++;
      }
    }
    console.log(`  ✓ Phase ${phase.phase}: "${phase.name}" components verified.`);
  }

  console.log('\n--------------------------------------------------------------');
  if (failures > 0) {
    console.error(`FAILED: ${failures} progression / circularity errors detected.`);
    process.exit(1);
  } else {
    console.log('SUCCESS: All progression milestones, recipes, and tiers verified circular-dependency free!');
  }
}

// Execute when run via tsx
runProgressionTests();
