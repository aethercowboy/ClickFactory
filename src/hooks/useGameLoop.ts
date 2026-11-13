import { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameSaveData,
  ItemId,
  FactoryMachineState,
  GeneratorState,
  GameNotification,
  BiomeId,
} from '../types/game';
import { ALL_ITEMS, ALL_RECIPES, ALL_BUILDINGS } from '../data/items';
import { ALL_MAM_NODES } from '../data/mamTrees';
import { ALL_MILESTONES } from '../data/milestones';
import { SPACE_ELEVATOR_PHASES } from '../data/spaceElevator';
import { AWESOME_SHOP_ITEMS } from '../data/awesomeShop';
import { INITIAL_DOGGO, loadGame, saveGame } from '../utils/saveLoad';
import { audio } from '../utils/audio';
import { isMilestoneUnlocked } from '../utils/progression';
import { ACHIEVEMENTS, AchievementDef } from '../data/achievements';
import { fireAchievementConfetti } from '../utils/confetti';
import { getBiomeDef } from '../data/biomes';
import { isFicsmasActive } from '../utils/ficsmas';
import { getRandomDoggoTreasure, getDoggoRetrievalTimeMs } from '../utils/doggo';
import { isValidExtractorTarget } from '../utils/extractors';

export interface ProductionRates {
  producedPerMin: Record<ItemId, number>;
  consumedPerMin: Record<ItemId, number>;
  netPerMin: Record<ItemId, number>;
  netHistory?: Record<ItemId, number[]>;
}

export function useGameLoop() {
  const [gameState, setGameState] = useState<GameSaveData>(() => loadGame());
  const [notifications, setNotifications] = useState<GameNotification[]>([]);
  const [productionRates, setProductionRates] = useState<ProductionRates>({
    producedPerMin: {} as any,
    consumedPerMin: {} as any,
    netPerMin: {} as any,
    netHistory: {} as any,
  });

  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  // Rate accumulation trackers over 1-second rolling windows
  const ratesProducedRef = useRef<Record<ItemId, number>>({} as any);
  const ratesConsumedRef = useRef<Record<ItemId, number>>({} as any);
  const ratesHistoryRef = useRef<Record<ItemId, number[]>>({} as any);
  const lastRateUpdateRef = useRef<number>(Date.now());

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((title: string, message: string, type: GameNotification['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    const notif: GameNotification = {
      id,
      title,
      message,
      type,
      timestamp: Date.now(),
    };
    setNotifications(prev => [notif, ...prev].slice(0, 5));

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  // Manual Mine click handler
  const manualMine = useCallback((oreId: ItemId) => {
    setGameState(prev => {
      // Calculate multiplier from coffee cup or blade runners
      let multiplier = 1;
      if (prev.shopPurchases.includes('shop_coffee_cup')) {
        multiplier *= 5;
      }
      if (prev.completedMAMNodes.includes('mam_cat_blade_runners')) {
        multiplier *= 1.5;
      }

      const added = multiplier;
      if (oreId === 'ficsmas_gift') {
        audio.playFicsmasBell();
      } else {
        audio.playMineClick();
      }

      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          [oreId]: (prev.inventory[oreId] || 0) + added,
        },
        ficsmasPresentsCollected:
          oreId === 'ficsmas_gift'
            ? (prev.ficsmasPresentsCollected || 0) + added
            : prev.ficsmasPresentsCollected,
        pioneerStats: {
          ...prev.pioneerStats,
          manualClicks: prev.pioneerStats.manualClicks + 1,
          totalOreMined: prev.pioneerStats.totalOreMined + added,
        },
      };
    });
  }, []);

  // Manual Craft handler
  const manualCraft = useCallback((recipeId: string, amount: number = 1) => {
    const recipe = ALL_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return false;

    let success = false;
    setGameState(prev => {
      // Verify inputs
      for (const input of recipe.inputs) {
        if ((prev.inventory[input.itemId] || 0) < input.amount * amount) {
          return prev;
        }
      }

      // Deduct inputs
      const newInv = { ...prev.inventory };
      for (const input of recipe.inputs) {
        newInv[input.itemId] = (newInv[input.itemId] || 0) - input.amount * amount;
      }

      // Add outputs
      for (const output of recipe.outputs) {
        newInv[output.itemId] = (newInv[output.itemId] || 0) + output.amount * amount;
      }

      audio.playCraftPress();
      success = true;

      return {
        ...prev,
        inventory: newInv,
        pioneerStats: {
          ...prev.pioneerStats,
          manualCrafts: prev.pioneerStats.manualCrafts + amount,
          totalPartsMade: prev.pioneerStats.totalPartsMade + amount,
        },
      };
    });

    return success;
  }, []);

  // Start Proportional Manual Crafting with Interruptibility
  const startCrafting = useCallback((recipeId: string, amount: number = 1) => {
    const recipe = ALL_RECIPES.find(r => r.id === recipeId);
    if (!recipe || amount <= 0) return false;

    let success = false;
    setGameState(prev => {
      let maxAffordable = Infinity;
      for (const input of recipe.inputs) {
        const available = prev.inventory[input.itemId] || 0;
        const count = Math.floor(available / input.amount);
        if (count < maxAffordable) maxAffordable = count;
      }
      const toCraft = Math.min(amount, maxAffordable);
      if (toCraft <= 0) return prev;

      let batchDuration = recipe.craftTime || 2;
      if (prev.completedMAMNodes.includes('mam_cat_blade_runners')) {
        batchDuration = Math.max(0.2, batchDuration / 2);
      }

      audio.playCraftPress();
      success = true;

      return {
        ...prev,
        activeCrafting: {
          recipeId,
          totalBatches: toCraft,
          completedBatches: 0,
          progress: 0,
          batchDurationSeconds: batchDuration,
        },
      };
    });

    return success;
  }, []);

  // Cancel / Interrupt Active Manual Crafting
  const cancelCrafting = useCallback(() => {
    setGameState(prev => {
      if (!prev.activeCrafting) return prev;
      const craftRecipe = ALL_RECIPES.find(r => r.id === prev.activeCrafting?.recipeId);
      const finished = prev.activeCrafting.completedBatches;

      addNotification(
        'Crafting Interrupted',
        `Manual fabrication halted. Retained ${finished} finished ${craftRecipe?.name || 'items'}.`,
        'info'
      );

      return {
        ...prev,
        activeCrafting: null,
      };
    });
  }, [addNotification]);

  // Add or update machine in factory
  const buildMachine = useCallback((buildingId: string, recipeId?: string, targetOre?: ItemId) => {
    const building = ALL_BUILDINGS[buildingId];
    if (!building) return false;

    // Integrated HUB Biomass Burners are strictly granted by HUB upgrades (up to 2)
    if (buildingId === 'hub_biomass_burner') {
      return false;
    }

    // Validate extractor target compatibility
    let resolvedTargetOre = targetOre;
    if (building.category === 'extractor') {
      if (buildingId === 'ficsmas_gift_tree' && !resolvedTargetOre) {
        resolvedTargetOre = 'ficsmas_gift';
      }
      if (!resolvedTargetOre || !isValidExtractorTarget(buildingId, resolvedTargetOre)) {
        console.warn(`[FICSIT Safety Protocol] Machine "${building.name}" cannot extract incompatible resource "${resolvedTargetOre}". Construction aborted.`);
        return false;
      }
    }

    let canAfford = true;
    setGameState(prev => {
      for (const cost of building.cost) {
        if ((prev.inventory[cost.itemId] || 0) < cost.amount) {
          canAfford = false;
          return prev;
        }
      }

      const newInv = { ...prev.inventory };
      for (const cost of building.cost) {
        newInv[cost.itemId] -= cost.amount;
      }

      // If generator
      if (building.category === 'power') {
        const existingGen = prev.generators.find(g => g.buildingId === buildingId);
        let updatedGens: GeneratorState[];
        if (existingGen) {
          updatedGens = prev.generators.map(g =>
            g.buildingId === buildingId ? { ...g, count: g.count + 1 } : g
          );
        } else {
          updatedGens = [
            ...prev.generators,
            { id: Math.random().toString(), buildingId, count: 1, isPaused: false },
          ];
        }
        return { ...prev, inventory: newInv, generators: updatedGens };
      }

      // If machine
      const existing = prev.machines.find(
        m => m.buildingId === buildingId && m.recipeId === recipeId && m.targetOre === resolvedTargetOre
      );

      let updatedMachines: FactoryMachineState[];
      if (existing) {
        updatedMachines = prev.machines.map(m =>
          m.id === existing.id ? { ...m, count: m.count + 1 } : m
        );
      } else {
        updatedMachines = [
          ...prev.machines,
          {
            id: Math.random().toString(36).substring(2, 9),
            buildingId,
            recipeId,
            targetOre: resolvedTargetOre,
            count: 1,
            clockSpeed: 1.0,
            powerShards: 0,
            isPaused: false,
          },
        ];
      }

      return {
        ...prev,
        inventory: newInv,
        machines: updatedMachines,
      };
    });

    return canAfford;
  }, []);

  // Dismantle machine (refunds 100% of cost)
  const dismantleMachine = useCallback((machineId: string) => {
    setGameState(prev => {
      const machine = prev.machines.find(m => m.id === machineId);
      if (!machine) return prev;

      const building = ALL_BUILDINGS[machine.buildingId];
      if (!building) return prev;

      const newInv = { ...prev.inventory };
      // Refund cost for 1 unit
      building.cost.forEach(c => {
        newInv[c.itemId] = (newInv[c.itemId] || 0) + c.amount;
      });

      // Refund installed power shards
      if (machine.powerShards > 0) {
        newInv.power_shard = (newInv.power_shard || 0) + machine.powerShards;
      }

      let updatedMachines: FactoryMachineState[];
      if (machine.count > 1) {
        updatedMachines = prev.machines.map(m =>
          m.id === machineId ? { ...m, count: m.count - 1 } : m
        );
      } else {
        updatedMachines = prev.machines.filter(m => m.id !== machineId);
      }

      return {
        ...prev,
        inventory: newInv,
        machines: updatedMachines,
      };
    });
  }, []);

  // Overclock machine with Power Shards
  const setMachineOverclock = useCallback((machineId: string, shards: number) => {
    setGameState(prev => {
      const machine = prev.machines.find(m => m.id === machineId);
      if (!machine) return prev;

      const shardsDiff = shards - machine.powerShards;
      if (shardsDiff > 0 && (prev.inventory.power_shard || 0) < shardsDiff) {
        return prev; // Not enough shards
      }

      const newInv = { ...prev.inventory };
      newInv.power_shard = (newInv.power_shard || 0) - shardsDiff;

      // Clock speed: 0 shards = 100%, 1 shard = 150%, 2 shards = 200%, 3 shards = 250%
      const newClockSpeed = 1.0 + shards * 0.5;

      return {
        ...prev,
        inventory: newInv,
        machines: prev.machines.map(m =>
          m.id === machineId
            ? { ...m, powerShards: shards, clockSpeed: Math.min(newClockSpeed, prev.overclockCap) }
            : m
        ),
      };
    });
  }, []);

  // Breaker reset action
  const resetPowerBreaker = useCallback(() => {
    setGameState(prev => {
      audio.playBreakerReset();
      addNotification('Power Grid Restored', 'The master circuit breaker has been re-engaged.', 'info');
      return {
        ...prev,
        powerGrid: {
          ...prev.powerGrid,
          isTripped: false,
        },
      };
    });
  }, [addNotification]);

  // Toggle Pause/Resume for a generator plant group
  const toggleGeneratorPause = useCallback((buildingId: string) => {
    setGameState(prev => ({
      ...prev,
      generators: prev.generators.map(g =>
        g.buildingId === buildingId ? { ...g, isPaused: !g.isPaused } : g
      ),
    }));
  }, []);

  // Submit items to active HUB Milestone
  const contributeMilestone = useCallback((itemId: ItemId, amount: number) => {
    setGameState(prev => {
      const milestone = ALL_MILESTONES.find(m => m.id === prev.currentMilestoneId);
      if (!milestone) return prev;

      const req = milestone.cost.find(c => c.itemId === itemId);
      if (!req) return prev;

      const already = prev.milestoneContributions[milestone.id]?.[itemId] || 0;
      const needed = req.amount - already;
      if (needed <= 0) return prev;

      const toGive = Math.min(needed, prev.inventory[itemId] || 0, amount);
      if (toGive <= 0) return prev;

      const newInv = { ...prev.inventory, [itemId]: (prev.inventory[itemId] || 0) - toGive };
      const currentMilestoneContribs = {
        ...(prev.milestoneContributions[milestone.id] || {}),
        [itemId]: already + toGive,
      };

      // Check if milestone is now fully satisfied!
      const isComplete = milestone.cost.every(c => {
        const amt = currentMilestoneContribs[c.itemId] || 0;
        return amt >= c.amount;
      });

      if (isComplete) {
        audio.playMilestoneFanfare();
        addNotification('Milestone Reached!', `${milestone.name} completed! New technology unlocked.`, 'milestone');

        // Unlock items/recipes/buildings/features
        const newCompleted = [...prev.completedMilestones, milestone.id];
        const newUnlockedOres = [...new Set([...prev.unlockedOres, ...(milestone.unlocks.ores || [])])];
        const newUnlockedRecipes = [...new Set([...prev.unlockedRecipes, ...(milestone.unlocks.recipes || [])])];
        const newUnlockedBuildings = [...new Set([...prev.unlockedBuildings, ...(milestone.unlocks.buildings || [])])];
        const newUnlockedFeatures = [...new Set([...(prev.unlockedFeatures || []), ...(milestone.unlocks.features || [])])];

        // Auto-install HUB-integrated generators granted by milestone upgrades (e.g., up to 2 HUB Biomass Burners)
        let newGenerators = prev.generators;
        if (milestone.unlocks.grantGenerators && milestone.unlocks.grantGenerators.length > 0) {
          newGenerators = [...prev.generators];
          for (const grant of milestone.unlocks.grantGenerators) {
            const idx = newGenerators.findIndex(g => g.buildingId === grant.buildingId);
            if (idx >= 0) {
              const existing = newGenerators[idx];
              const nextCount =
                grant.maxTotal !== undefined
                  ? Math.min(grant.maxTotal, existing.count + grant.count)
                  : existing.count + grant.count;
              newGenerators[idx] = { ...existing, count: nextCount };
            } else {
              const nextCount =
                grant.maxTotal !== undefined
                  ? Math.min(grant.maxTotal, grant.count)
                  : grant.count;
              newGenerators.push({
                id: Math.random().toString(36).substring(2, 9),
                buildingId: grant.buildingId,
                count: nextCount,
                isPaused: false,
              });
            }
          }
        }

        // Find next milestone that is unlocked and not completed
        const nextMilestone = ALL_MILESTONES.find(m => {
          if (newCompleted.includes(m.id)) return false;
          const tempState = {
            ...prev,
            completedMilestones: newCompleted,
            unlockedFeatures: newUnlockedFeatures,
          };
          return isMilestoneUnlocked(tempState, m);
        });

        return {
          ...prev,
          inventory: newInv,
          completedMilestones: newCompleted,
          currentMilestoneId: nextMilestone ? nextMilestone.id : null,
          unlockedOres: newUnlockedOres,
          unlockedRecipes: newUnlockedRecipes,
          unlockedBuildings: newUnlockedBuildings,
          unlockedFeatures: newUnlockedFeatures,
          generators: newGenerators,
          milestoneContributions: {
            ...prev.milestoneContributions,
            [milestone.id]: currentMilestoneContribs,
          },
        };
      }

      return {
        ...prev,
        inventory: newInv,
        milestoneContributions: {
          ...prev.milestoneContributions,
          [milestone.id]: currentMilestoneContribs,
        },
      };
    });
  }, [addNotification]);

  // Deliver project parts to Space Elevator
  const deliverToSpaceElevator = useCallback((itemId: ItemId, amount: number) => {
    setGameState(prev => {
      // Find current active phase
      const currentPhaseNum = prev.completedPhases.length + 1;
      const phaseDef = SPACE_ELEVATOR_PHASES.find(p => p.phase === currentPhaseNum);
      if (!phaseDef) return prev;

      const req = phaseDef.requirements.find(r => r.itemId === itemId);
      if (!req) return prev;

      const deliveredSoFar = prev.elevatorDeliveries[currentPhaseNum]?.[itemId] || 0;
      const remaining = req.amount - deliveredSoFar;
      if (remaining <= 0) return prev;

      const toSend = Math.min(remaining, prev.inventory[itemId] || 0, amount);
      if (toSend <= 0) return prev;

      const newInv = { ...prev.inventory, [itemId]: (prev.inventory[itemId] || 0) - toSend };
      const newDeliveriesForPhase = {
        ...(prev.elevatorDeliveries[currentPhaseNum] || {}),
        [itemId]: deliveredSoFar + toSend,
      };

      return {
        ...prev,
        inventory: newInv,
        elevatorDeliveries: {
          ...prev.elevatorDeliveries,
          [currentPhaseNum]: newDeliveriesForPhase,
        },
      };
    });
  }, []);

  // Launch Space Elevator (when requirements are met)
  const launchSpaceElevator = useCallback(() => {
    const prev = stateRef.current;
    const currentPhaseNum = prev.completedPhases.length + 1;
    const phaseDef = SPACE_ELEVATOR_PHASES.find(p => p.phase === currentPhaseNum);
    if (!phaseDef) return false;

    // Check all requirements
    const allMet = phaseDef.requirements.every(r => {
      const delivered = prev.elevatorDeliveries[currentPhaseNum]?.[r.itemId] || 0;
      return delivered >= r.amount;
    });

    if (!allMet) return false;

    audio.playLaunchRoar();
    addNotification('Project Assembly Launch!', `Phase ${currentPhaseNum} launched to orbit! Unlocked Tiers ${phaseDef.unlocksTiers.join(', ')}.`, 'elevator');

    setGameState(state => ({
      ...state,
      completedPhases: [...state.completedPhases, currentPhaseNum],
    }));

    return true;
  }, [addNotification]);

  // Start MAM Research
  const startMAMResearch = useCallback((nodeId: string) => {
    const node = ALL_MAM_NODES.find(n => n.id === nodeId);
    if (!node) return;

    setGameState(prev => {
      if (prev.activeResearch) return prev;
      // Check prerequisites
      const hasPrereqs = node.prerequisites.every(p => prev.completedMAMNodes.includes(p));
      if (!hasPrereqs) return prev;

      // Check costs
      for (const cost of node.cost) {
        if ((prev.inventory[cost.itemId] || 0) < cost.amount) {
          return prev;
        }
      }

      const newInv = { ...prev.inventory };
      for (const cost of node.cost) {
        newInv[cost.itemId] -= cost.amount;
      }

      return {
        ...prev,
        inventory: newInv,
        activeResearch: {
          nodeId,
          startTime: Date.now(),
          durationMs: node.researchDuration * 1000,
        },
      };
    });
  }, []);

  // Sink item into AWESOME Sink
  const sinkItem = useCallback((itemId: ItemId, amount: number) => {
    const item = ALL_ITEMS[itemId];
    if (!item || item.sinkPoints <= 0) return;

    setGameState(prev => {
      const available = prev.inventory[itemId] || 0;
      const count = Math.min(available, amount);
      if (count <= 0) return prev;

      let pointMultiplier = 1;
      if (prev.shopPurchases.includes('shop_sink_matrix')) {
        pointMultiplier = 1.5;
      }

      const earnedPoints = count * item.sinkPoints * pointMultiplier;
      let totalPoints = prev.sinkPoints + earnedPoints;

      // Coupons cost: starts at 1,000 points, scaling up slightly
      const pointsPerCoupon = 1000 + prev.totalCouponsPrinted * 250;
      let newCoupons = prev.ficsitCoupons;
      let newTotalCoupons = prev.totalCouponsPrinted;

      while (totalPoints >= pointsPerCoupon) {
        totalPoints -= pointsPerCoupon;
        newCoupons += 1;
        newTotalCoupons += 1;
        audio.playTicketChime();
      }

      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          [itemId]: available - count,
        },
        sinkPoints: totalPoints,
        ficsitCoupons: newCoupons,
        totalCouponsPrinted: newTotalCoupons,
      };
    });
  }, []);

  // Buy from AWESOME Shop
  const buyShopItem = useCallback((itemId: string) => {
    const shopItem = AWESOME_SHOP_ITEMS.find(s => s.id === itemId);
    if (!shopItem) return false;

    let success = false;
    setGameState(prev => {
      if (prev.shopPurchases.includes(itemId)) return prev;
      if (prev.ficsitCoupons < shopItem.couponCost) return prev;

      success = true;
      audio.playTicketChime();

      const newPurchases = [...prev.shopPurchases, itemId];
      const newInv = { ...prev.inventory };

      if (shopItem.effect.type === 'free_power_shards') {
        newInv.power_shard = (newInv.power_shard || 0) + shopItem.effect.value;
      }

      return {
        ...prev,
        ficsitCoupons: prev.ficsitCoupons - shopItem.couponCost,
        shopPurchases: newPurchases,
        inventory: newInv,
      };
    });

    return success;
  }, []);

  // Biome Sector Switcher (Theme change)
  const selectBiome = useCallback((biomeId: BiomeId) => {
    setGameState(prev => {
      if (prev.selectedBiome === biomeId) return prev;
      audio.playBiomeSwitch();
      const biome = getBiomeDef(biomeId);
      if (prev.ambientTrack) {
        audio.updateAmbientChords(biome.ambientChords);
      }
      return {
        ...prev,
        selectedBiome: biomeId,
      };
    });
  }, []);

  // Seasonal FICSMAS Mode Toggle
  const setFicsmasMode = useCallback((mode: 'auto' | 'enabled' | 'disabled') => {
    setGameState(prev => {
      audio.playCraftPress();
      return {
        ...prev,
        ficsmasMode: mode,
      };
    });
  }, []);

  // Lizard Doggo Companion Actions:
  const petDoggo = useCallback(() => {
    setGameState(prev => {
      const doggo = prev.doggo || INITIAL_DOGGO;
      if (Math.random() < 0.25) {
        audio.playDoggoBark();
      } else {
        audio.playDoggoPet();
      }

      const newPets = (doggo.petsCount || 0) + 1;
      const newHappiness = Math.min(100, (doggo.happiness || 50) + 6);
      const newTimer = Math.max(0, (doggo.retrievalTimerMs || 25000) - 4000);

      return {
        ...prev,
        doggo: {
          ...doggo,
          petsCount: newPets,
          happiness: newHappiness,
          lastPetTime: Date.now(),
          retrievalTimerMs: newTimer,
        },
        pioneerStats: {
          ...prev.pioneerStats,
          doggoPets: (prev.pioneerStats.doggoPets || 0) + 1,
        },
      };
    });
  }, []);

  const feedDoggo = useCallback((treatItemId: ItemId) => {
    setGameState(prev => {
      const doggo = prev.doggo || INITIAL_DOGGO;
      const available = prev.inventory[treatItemId] || 0;
      if (available < 1) return prev;

      let happinessBoost = 8;
      let timerReduction = 4000;
      if (treatItemId === 'paleberry') {
        happinessBoost = 25;
        timerReduction = 14000;
        audio.playDoggoBark();
        addNotification(
          'Doggo Loved the Treat!',
          `${doggo.name} gleefully devoured a sweet Paleberry! (+25% Happiness)`,
          'info'
        );
      } else {
        audio.playDoggoPet();
        addNotification(
          'Doggo Munched Snack',
          `${doggo.name} happily crunched on some fresh Leaves! (+8% Happiness)`,
          'info'
        );
      }

      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          [treatItemId]: available - 1,
        },
        doggo: {
          ...doggo,
          happiness: Math.min(100, (doggo.happiness || 50) + happinessBoost),
          retrievalTimerMs: Math.max(0, (doggo.retrievalTimerMs || 25000) - timerReduction),
          lastPetTime: Date.now(),
        },
      };
    });
  }, [addNotification]);

  const collectDoggoItem = useCallback(() => {
    setGameState(prev => {
      const doggo = prev.doggo || INITIAL_DOGGO;
      if (!doggo.heldItem) return prev;

      const { itemId, amount } = doggo.heldItem;
      audio.playTicketChime();

      if (itemId === 'nuclear_waste') {
        addNotification(
          '☢️ Radioactive Delivery!',
          `${doggo.name} brought Nuclear Waste! Pioneer caution: dispose of it in the AWESOME Sink!`,
          'power_trip'
        );
      } else {
        const itemName = ALL_ITEMS[itemId]?.name || itemId;
        addNotification(
          'Treasure Collected!',
          `Collected ${amount}x ${itemName} retrieved by ${doggo.name}!`,
          'info'
        );
      }

      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          [itemId]: (prev.inventory[itemId] || 0) + amount,
        },
        doggo: {
          ...doggo,
          heldItem: null,
          itemsRetrievedCount: (doggo.itemsRetrievedCount || 0) + 1,
          retrievalTimerMs: getDoggoRetrievalTimeMs(doggo.happiness),
        },
      };
    });
  }, [addNotification]);

  const renameDoggo = useCallback((name: string) => {
    setGameState(prev => {
      const doggo = prev.doggo || INITIAL_DOGGO;
      const clean = name.trim().slice(0, 24) || 'Lizard Doggo';
      audio.playDoggoBark();
      return {
        ...prev,
        doggo: {
          ...doggo,
          name: clean,
        },
      };
    });
  }, []);

  // Main Simulation Loop running at 10Hz (100ms interval)
  useEffect(() => {
    const TICK_INTERVAL_MS = 100;
    const interval = setInterval(() => {
      setGameState(prevState => {
        const now = Date.now();
        const deltaSec = (now - prevState.lastTick) / 1000;
        // Cap deltaSec in case of massive tab hibernation
        const clampedDelta = Math.min(deltaSec, 60);

        let newInv = { ...prevState.inventory };
        let powerCapacity = 0;
        let powerConsumption = 0;
        let isTripped = prevState.powerGrid.isTripped;

        // 1. Calculate Power Generation & Deplete Fuel/Water
        prevState.generators.forEach(gen => {
          if (gen.isPaused || gen.count <= 0) return;
          const building = ALL_BUILDINGS[gen.buildingId];
          if (!building || !building.powerGeneration) return;

          if (!building.fuelRequired) {
            powerCapacity += building.powerGeneration * gen.count;
            return;
          }

          const fuelReq = building.fuelRequired;
          const waterPerMin = fuelReq.waterPerMin || 0;
          const waterPerSecUnit = waterPerMin / 60;

          // Process each generator unit individually
          for (let unit = 0; unit < gen.count; unit++) {
            // Check water if required
            const waterNeeded = waterPerSecUnit * clampedDelta;
            if (waterPerMin > 0 && (newInv.water || 0) < waterNeeded) {
              continue; // Water missing, unit cannot operate
            }

            // Check fuel
            let matchedFuel: ItemId | null = null;
            let burnRatePerMin = fuelReq.burnRatePerMin;

            for (const fItem of fuelReq.fuelItems) {
              const itemBurnRate = fuelReq.fuelBurnRates?.[fItem] ?? fuelReq.burnRatePerMin;
              const fuelNeeded = (itemBurnRate / 60) * clampedDelta;
              if ((newInv[fItem] || 0) >= fuelNeeded) {
                matchedFuel = fItem;
                burnRatePerMin = itemBurnRate;
                break;
              }
            }

            if (!matchedFuel) {
              continue; // Fuel missing, unit cannot operate
            }

            // Deduct water
            if (waterNeeded > 0) {
              newInv.water = Math.max(0, (newInv.water || 0) - waterNeeded);
              ratesConsumedRef.current.water = (ratesConsumedRef.current.water || 0) + waterNeeded;
            }

            // Deduct fuel
            const fuelConsumed = (burnRatePerMin / 60) * clampedDelta;
            newInv[matchedFuel] = Math.max(0, (newInv[matchedFuel] || 0) - fuelConsumed);
            ratesConsumedRef.current[matchedFuel] = (ratesConsumedRef.current[matchedFuel] || 0) + fuelConsumed;

            powerCapacity += building.powerGeneration;
          }
        });

        // 2. Calculate Power Consumption by Machines
        prevState.machines.forEach(machine => {
          if (machine.isPaused || machine.count <= 0) return;
          const building = ALL_BUILDINGS[machine.buildingId];
          if (!building) return;

          if (building.powerConsumption > 0) {
            // Power scales with clockSpeed^1.3 in Satisfactory
            const clockExponent = Math.pow(machine.clockSpeed, 1.3);
            powerConsumption += building.powerConsumption * machine.count * clockExponent;
          }
        });

        // 3. Grid Trip Check (also trips if fuel/water runs out leaving capacity < consumption)
        let trippedThisTick = false;
        if (powerConsumption > powerCapacity && !isTripped) {
          isTripped = true;
          trippedThisTick = true;
          audio.playPowerTrip();
          addNotification(
            'Power Grid Tripped!',
            `Consumption (${Math.round(powerConsumption)} MW) exceeded capacity (${Math.round(powerCapacity)} MW). Ensure generators have fuel and reset the breaker.`,
            'power_trip'
          );
        }

        // 4. Run Machine Production (only if not tripped, or power consumption is 0)
        prevState.machines.forEach(machine => {
          if (machine.isPaused || machine.count <= 0) return;
          const building = ALL_BUILDINGS[machine.buildingId];
          if (!building) return;

          // If machine consumes power and grid is tripped or unpowered, it halts!
          if (building.powerConsumption > 0 && (isTripped || powerConsumption > powerCapacity)) {
            return;
          }

          // Case A: Extractor / Miner
          if (building.category === 'extractor' && (machine.targetOre || building.id === 'ficsmas_gift_tree')) {
            const ore = (machine.targetOre || 'ficsmas_gift') as ItemId;
            if (!isValidExtractorTarget(building.id, ore)) {
              return; // Extractor assigned to incompatible resource node
            }
            let baseRate = 2; // portable miner = 2/sec
            if (building.id === 'miner_mk1') baseRate = 10;
            if (building.id === 'miner_mk2') baseRate = 30;
            if (building.id === 'miner_mk3') baseRate = 90;
            if (building.id === 'oil_extractor') baseRate = 20;
            if (building.id === 'water_extractor') baseRate = 25;
            if (building.id === 'ficsmas_gift_tree') baseRate = 0.25; // 15 gifts/min

            const produced = baseRate * machine.clockSpeed * machine.count * clampedDelta;
            newInv[ore] = (newInv[ore] || 0) + produced;

            ratesProducedRef.current[ore] = (ratesProducedRef.current[ore] || 0) + produced;
            return;
          }

          // Case B: Production Machine (Smelter, Constructor, Assembler, Manufacturer, Refinery, etc.)
          if (machine.recipeId) {
            const recipe = ALL_RECIPES.find(r => r.id === machine.recipeId);
            if (!recipe) return;

            // Craft time per batch
            const craftsPerSec = (1 / recipe.craftTime) * machine.clockSpeed * machine.count;
            const batchAmount = craftsPerSec * clampedDelta;

            // Check how many batches we can afford
            let maxBatches = batchAmount;
            for (const input of recipe.inputs) {
              const available = newInv[input.itemId] || 0;
              const batchesPossible = available / input.amount;
              if (batchesPossible < maxBatches) {
                maxBatches = Math.max(0, batchesPossible);
              }
            }

            if (maxBatches > 0) {
              // Consume inputs
              for (const input of recipe.inputs) {
                const consumed = input.amount * maxBatches;
                newInv[input.itemId] = Math.max(0, (newInv[input.itemId] || 0) - consumed);
                ratesConsumedRef.current[input.itemId] = (ratesConsumedRef.current[input.itemId] || 0) + consumed;
              }

              // Produce outputs
              for (const output of recipe.outputs) {
                const produced = output.amount * maxBatches;
                newInv[output.itemId] = (newInv[output.itemId] || 0) + produced;
                ratesProducedRef.current[output.itemId] = (ratesProducedRef.current[output.itemId] || 0) + produced;
              }
            }
          }
        });

        // 4.5 Active Pioneer Manual Crafting over time
        let newActiveCrafting = prevState.activeCrafting || null;
        let manualCraftsFinishedThisTick = 0;
        let partsProducedThisTick = 0;

        if (newActiveCrafting) {
          const craftRecipe = ALL_RECIPES.find(r => r.id === newActiveCrafting!.recipeId);
          if (!craftRecipe) {
            newActiveCrafting = null;
          } else {
            let canAffordCurrent = true;
            for (const input of craftRecipe.inputs) {
              if ((newInv[input.itemId] || 0) < input.amount) {
                canAffordCurrent = false;
                break;
              }
            }

            if (!canAffordCurrent) {
              addNotification(
                'Crafting Halted',
                `Ran out of required ingredients for ${craftRecipe.name}.`,
                'info'
              );
              newActiveCrafting = null;
            } else {
              const deltaProgress = clampedDelta / newActiveCrafting.batchDurationSeconds;
              let currentProgress = newActiveCrafting.progress + deltaProgress;
              let completedBatches = newActiveCrafting.completedBatches;

              while (currentProgress >= 1 && completedBatches < newActiveCrafting.totalBatches) {
                let hasIngredients = true;
                for (const input of craftRecipe.inputs) {
                  if ((newInv[input.itemId] || 0) < input.amount) {
                    hasIngredients = false;
                    break;
                  }
                }

                if (!hasIngredients) {
                  addNotification(
                    'Crafting Halted',
                    `Ran out of required ingredients for ${craftRecipe.name}.`,
                    'info'
                  );
                  newActiveCrafting = null;
                  break;
                }

                for (const input of craftRecipe.inputs) {
                  newInv[input.itemId] = Math.max(0, (newInv[input.itemId] || 0) - input.amount);
                  ratesConsumedRef.current[input.itemId] = (ratesConsumedRef.current[input.itemId] || 0) + input.amount;
                }

                for (const output of craftRecipe.outputs) {
                  newInv[output.itemId] = (newInv[output.itemId] || 0) + output.amount;
                  ratesProducedRef.current[output.itemId] = (ratesProducedRef.current[output.itemId] || 0) + output.amount;
                  partsProducedThisTick += output.amount;
                }

                completedBatches += 1;
                manualCraftsFinishedThisTick += 1;
                currentProgress -= 1;
                audio.playCraftPress();
              }

              if (newActiveCrafting) {
                if (completedBatches >= newActiveCrafting.totalBatches) {
                  audio.playMilestoneFanfare();
                  addNotification(
                    'Fabrication Complete',
                    `Crafted ${newActiveCrafting.totalBatches}x ${craftRecipe.name}.`,
                    'info'
                  );
                  newActiveCrafting = null;
                } else {
                  newActiveCrafting = {
                    ...newActiveCrafting,
                    completedBatches,
                    progress: currentProgress,
                  };
                }
              }
            }
          }
        }

        // 5. Check MAM Active Research completion
        let newActiveResearch = prevState.activeResearch;
        let newCompletedMAM = prevState.completedMAMNodes;
        let newOverclockCap = prevState.overclockCap;
        let newUnlockedRecipes = prevState.unlockedRecipes;
        let newUnlockedOres = prevState.unlockedOres;
        let newUnlockedBuildings = prevState.unlockedBuildings;

        if (newActiveResearch) {
          const elapsed = now - newActiveResearch.startTime;
          if (elapsed >= newActiveResearch.durationMs) {
            const node = ALL_MAM_NODES.find(n => n.id === newActiveResearch?.nodeId);
            if (node) {
              audio.playMilestoneFanfare();
              addNotification('MAM Research Completed', `${node.name} finished!`, 'research');
              newCompletedMAM = [...newCompletedMAM, node.id];

              if (node.unlocks.overclockMax && node.unlocks.overclockMax > newOverclockCap) {
                newOverclockCap = node.unlocks.overclockMax;
              }
              if (node.unlocks.alternateRecipeId) {
                newUnlockedRecipes = [...new Set([...newUnlockedRecipes, node.unlocks.alternateRecipeId])];
              }
              if (node.unlocks.recipes) {
                newUnlockedRecipes = [...new Set([...newUnlockedRecipes, ...node.unlocks.recipes])];
              }
              if (node.unlocks.ores) {
                newUnlockedOres = [...new Set([...newUnlockedOres, ...node.unlocks.ores])];
              }
              if (node.unlocks.buildings) {
                newUnlockedBuildings = [...new Set([...newUnlockedBuildings, ...node.unlocks.buildings])];
              }
            }
            newActiveResearch = null;
          }
        }

        // 5.5 Lizard Doggo Companion Foraging Loop
        let newDoggo = prevState.doggo ? { ...prevState.doggo } : { ...INITIAL_DOGGO };
        // Gentle happiness decay over time: ~0.08% per second, floor at 25%
        newDoggo.happiness = Math.max(25, newDoggo.happiness - clampedDelta * 0.08);

        if (newDoggo.isTamed && !newDoggo.heldItem) {
          const newTimer = Math.max(0, newDoggo.retrievalTimerMs - clampedDelta * 1000);
          if (newTimer <= 0) {
            const isFics = isFicsmasActive(prevState);
            const treasure = getRandomDoggoTreasure(isFics);
            newDoggo.heldItem = {
              itemId: treasure.itemId,
              amount: treasure.amount,
            };
            newDoggo.retrievalTimerMs = getDoggoRetrievalTimeMs(newDoggo.happiness);
            audio.playDoggoItemFound();
            if (treasure.isHazard) {
              addNotification(
                '☢️ Radioactive Delivery!',
                `${newDoggo.name} brought Nuclear Waste from the alien wild! Check the Doggo Sanctuary.`,
                'power_trip'
              );
            } else {
              const itemTitle = ALL_ITEMS[treasure.itemId]?.name || treasure.itemId;
              addNotification(
                '🐶 Doggo Gift Found!',
                `${newDoggo.name} brought back ${treasure.amount}x ${itemTitle}! Check the Doggo Sanctuary.`,
                'info'
              );
            }
          } else {
            newDoggo.retrievalTimerMs = newTimer;
          }
        }

        // 6. Update rolling production rates every 1 second
        if (now - lastRateUpdateRef.current >= 1000) {
          const durationMin = (now - lastRateUpdateRef.current) / 60000;
          const producedPerMin: Record<ItemId, number> = {} as any;
          const consumedPerMin: Record<ItemId, number> = {} as any;
          const netPerMin: Record<ItemId, number> = {} as any;
          const netHistory: Record<ItemId, number[]> = {} as any;

          Object.keys(ALL_ITEMS).forEach(k => {
            const key = k as ItemId;
            const prod = (ratesProducedRef.current[key] || 0) / durationMin;
            const cons = (ratesConsumedRef.current[key] || 0) / durationMin;
            const roundedProd = Math.round(prod * 10) / 10;
            const roundedCons = Math.round(cons * 10) / 10;
            const roundedNet = Math.round((prod - cons) * 10) / 10;
            producedPerMin[key] = roundedProd;
            consumedPerMin[key] = roundedCons;
            netPerMin[key] = roundedNet;

            const prev = ratesHistoryRef.current[key] || [];
            const next = [...prev, roundedNet].slice(-24); // Keep last 24 readings (~24s window)
            ratesHistoryRef.current[key] = next;
            netHistory[key] = next;
          });

          setProductionRates({ producedPerMin, consumedPerMin, netPerMin, netHistory });
          ratesProducedRef.current = {} as any;
          ratesConsumedRef.current = {} as any;
          lastRateUpdateRef.current = now;
        }

        return {
          ...prevState,
          lastTick: now,
          inventory: newInv,
          powerGrid: {
            ...prevState.powerGrid,
            capacity: Math.round(powerCapacity),
            consumption: Math.round(powerConsumption),
            isTripped,
          },
          doggo: newDoggo,
          activeResearch: newActiveResearch,
          activeCrafting: newActiveCrafting,
          completedMAMNodes: newCompletedMAM,
          overclockCap: newOverclockCap,
          unlockedRecipes: newUnlockedRecipes,
          unlockedOres: newUnlockedOres,
          unlockedBuildings: newUnlockedBuildings,
          pioneerStats: {
            ...prevState.pioneerStats,
            manualCrafts: prevState.pioneerStats.manualCrafts + manualCraftsFinishedThisTick,
            totalPartsMade: prevState.pioneerStats.totalPartsMade + partsProducedThisTick,
            powerTripsCount: (prevState.pioneerStats.powerTripsCount || 0) + (trippedThisTick ? 1 : 0),
            playtimeSeconds: prevState.pioneerStats.playtimeSeconds + clampedDelta,
          },
        };
      });
    }, TICK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [addNotification]);

  // Achievement unlock detection & reward dispatch
  useEffect(() => {
    const currentUnlocked = gameState.unlockedAchievements || [];
    const newlyUnlocked: AchievementDef[] = [];

    ACHIEVEMENTS.forEach(ach => {
      if (!currentUnlocked.includes(ach.id)) {
        if (ach.check(gameState)) {
          newlyUnlocked.push(ach);
        }
      }
    });

    if (newlyUnlocked.length > 0) {
      const ids = newlyUnlocked.map(a => a.id);
      let bonusCoupons = 0;
      newlyUnlocked.forEach(ach => {
        bonusCoupons += ach.rewardCoupons || 0;
        addNotification(
          `Achievement: ${ach.title}`,
          `${ach.description}${ach.rewardCoupons ? ` (+${ach.rewardCoupons} Coupon${ach.rewardCoupons > 1 ? 's' : ''})` : ''}`,
          'achievement'
        );
      });

      audio.playAchievementFanfare();
      fireAchievementConfetti();

      setGameState(prev => ({
        ...prev,
        ficsitCoupons: prev.ficsitCoupons + bonusCoupons,
        unlockedAchievements: [...(prev.unlockedAchievements || []), ...ids],
      }));
    }
  }, [gameState, addNotification]);

  // Periodic LocalStorage auto-save every 5 seconds
  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveGame(stateRef.current);
    }, 5000);
    return () => clearInterval(saveInterval);
  }, []);

  return {
    gameState,
    setGameState,
    notifications,
    productionRates,
    manualMine,
    manualCraft,
    startCrafting,
    cancelCrafting,
    buildMachine,
    dismantleMachine,
    setMachineOverclock,
    resetPowerBreaker,
    toggleGeneratorPause,
    contributeMilestone,
    deliverToSpaceElevator,
    launchSpaceElevator,
    startMAMResearch,
    sinkItem,
    buyShopItem,
    selectBiome,
    setFicsmasMode,
    petDoggo,
    feedDoggo,
    collectDoggoItem,
    renameDoggo,
    addNotification,
    dismissNotification,
  };
}
