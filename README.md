# ClickFactory (FICSIT Pioneer: Factory Automation)

[![Play Live](https://img.shields.io/badge/Play%20Live-aethercowboy.github.io%2FClickFactory-orange?style=for-the-badge&logo=google-chrome&logoColor=white)](https://aethercowboy.github.io/ClickFactory)
[![Version](https://img.shields.io/badge/version-0.9.3-blue?style=for-the-badge)](./package.json)
[![License](https://img.shields.io/badge/license-Apache--2.0-green?style=for-the-badge)](./LICENSE)

Play the live game directly in your browser:  
👉 **[https://aethercowboy.github.io/ClickFactory](https://aethercowboy.github.io/ClickFactory)**

---

## Legal Disclaimer

**ClickFactory** is an unofficial, non-commercial fan game inspired by **Satisfactory** (developed by Coffee Stain Studios).

- It is **in no way associated with, affiliated with, endorsed by, or sponsored by Coffee Stain Studios, Coffee Stain Publishing, or Embracer Group**.
- All Satisfactory game concepts, names, items, visual themes, and trademarks belong solely to Coffee Stain Studios.
- This project is created purely for educational and non-commercial enthusiast appreciation of factory automation and incremental games.

---

## Overview

An incremental idle clicker game inspired by **Satisfactory**, **Universal Paperclips**, and **Cookie Clicker**.

Extract raw planetary ores, machine foundational plates and rods, establish automated conveyor and smelting lines, balance a sensitive electrical power grid with master circuit breakers, research alien technology in the MAM, and launch colossal payloads up the Space Elevator for Project Assembly.

---

## Features

### 1. Planetary Resource Survey & Manual Crafting
- **Resource Deposits**: Mine native nodes across planet MASSAGE-2(A-B)b (Iron Ore, Copper Ore, Limestone, Coal, Caterium Gold, Raw Quartz, Crude Oil, Bauxite, Uranium, SAM Ore, Water, and Flora).
- **Proportional Craft Bench Times**: Hand-crafting components requires time proportional to recipe complexity (`craftTime`).
- **Interruptible Craft Queues**: Longer crafting batches (including 10x or "Max") can be safely interrupted at any moment via the **Cancel / Interrupt** button without losing finished items or wasting resources.
- **Pioneer Gear**: Unlock the FICSIT Employee Coffee Cup (+400% click yield) and Blade Runners Exoskeleton (2x manual craft speed).

### 2. Autonomous Factory Production Lines
- **Machine Types**:
  - Extractors: Portable Miners, Miner Mk.1, Mk.2, Mk.3, Oil Extractor, Water Extractor
  - Processors: Induction Smelters, Alloy Foundries, Constructors, Assemblers, 4-Line Manufacturers, Chemical Refineries, Industrial Blenders, and Particle Accelerators
- **Overclocking with Power Shards**: Socket crystal shards harvested from native Power Slugs to boost machine clock speeds up to 250%.
- **Zero-Loss Dismantling**: Receive a 100% material refund when decommissioning factory units.

### 3. Electrical Power Grid & Circuit Breakers
- **Power Plants**:
  - Biomass Burners (30 MW) burning Leaves, Biomass, or Solid Biofuel
  - Coal Generators (75 MW) powered by continuous Coal and pumped Water cooling
  - Fuel Generators (250 MW) running on Fuel or Turbofuel
  - Nuclear Power Plants (2,500 MW) splitting Uranium Fuel Rods
- **Dynamic Resource Depletion**: Operational generators actively consume fuel and water per tick. Offline units produce no power and burn no fuel.
- **Dynamic Load & Breaker Trips**: If factory consumption exceeds capacity, the grid trips with an industrial siren. Pioneers must balance generation or shut down lines before pulling the heavy master breaker lever to restore power.

### 4. Multi-Track Progression System
- **HUB Milestones (Tiers 0 through 9)**: Deliver required components to the HUB Freighter Pod to unlock advanced logistics, miners, foundries, refineries, and quantum tech. Unlocked sequentially with strict prerequisite validation.
- **Space Elevator (Project Assembly)**: Complete Phases 1 through 4 by fabricating and shipping specialized orbital parts (Smart Plating, Automated Wiring, Versatile Framework, Modular Engines, Adaptive Control Units, Magnetic Field Generators, Thermal Propulsion Rockets, and Nuclear Pasta).
- **MAM (Molecular Analysis Machine)**: Research 5 distinct tech trees:
  - *Power Slugs*: Overclocking thresholds up to 250%
  - *Caterium*: Quickwire, Blade Runners, and AI Limiters
  - *Alien Organisms*: Chitin synthesis and high-yield DNA Capsules
  - *Quartz*: Quartz Crystals, Silica, and Crystal Oscillators
  - *Hard Drives*: Crash site analysis unlocking alternate recipes (e.g., Cast Screws directly from Iron Ingots)
- **AWESOME Sink & AWESOME Shop**: Shred overflow materials into points to print corporate FICSIT Coupons and purchase permanent upgrades and monuments.

### 5. Pioneer Accolades (Achievement System)
- **Comprehensive Milestone Tracking**: Tracks industrial achievements across automation, production volume, power grid management, and exploration:
  - *First Automation*: Construct first extractor or production building
  - *1000 Iron Ingots*: Stockpile massive ingot reserves
  - *Power Trip*: Experience an electrical breaker overload
  - *Maximum Throughput*: Overclock a machine to 250% using 3 Power Shards
  - *Speed Demon*: Research and equip Blade Runners in the MAM
  - *Orbital Lift-Off*: Complete Space Elevator Phase 1
  - *FICSIT Pioneer Legend*: Acquire the solid gold 24k Nut Trophy
- **Celebratory Real-Time Toasts**: Sparkling corporate fanfare jingle, celebratory confetti burst, and animated toast notifications with bonus FICSIT coupon grants upon completion.
- **Accolades Command Ledger**: Dedicated modal with category tabs (All, Automation, Production, Power, Progression, Special), completion percentage bar, and live progress counters.

### 6. FICSIT Factory Boombox & Procedural Audio
- **Web Audio API Sound Engine**: Zero-asset procedural synthesis for mining clinks, pneumatic presses, breaker arcs, launch thrusters, and ticket chimes, plus a toggleable ambient industrial synth drone.
- **Interactive Factory Boombox**: Unlocked via the AWESOME Shop (`FICSIT Factory Boombox`), featuring a retro cassette deck UI with dual spinning reels, VU meter equalizer, tape library tray, volume slider, and 4 procedural synthwave tracks:
  1. *MASSAGE-2(A-B)b Synthwave* (120 BPM): Bouncy 80s bassline with shimmering arpeggiated leads.
  2. *Conveyor Belt Boogie* (126 BPM): High-energy industrial electro-funk rhythm.
  3. *Deep Space Elevator* (90 BPM): Atmospheric sci-fi ambient chords and space bells.
  4. *Pioneer Lo-Fi Chill* (96 BPM): Warm pentatonic chords with relaxed analog beat.
- **Logistics Balance Monitor**: Live items/minute production and consumption rates with automatic deficit detection to identify bottlenecks.
- **Persistence**: Automatic LocalStorage saving every 5 seconds, offline progress simulation, and full JSON save export/import.

### 7. Planetary Biome Sectors (Theme Switcher)
- **5 Iconic Planetary Sectors**: Transform your factory environment across the iconic starting biomes of MASSAGE-2(A-B)b:
  - *Grass Fields (Sector 01)*: Verdant emerald meadows, rich flora density, gentle rolling savannah, and warm sunlight ambiance.
  - *Rocky Desert (Sector 02)*: High-contrast amber sandstone canyons, elevated plateaus, and dry desert drone harmonics.
  - *Northern Forest (Sector 03)*: Mist-shrouded alpine spruce valleys, cool teal atmosphere, pure mountain quartz veins, and ethereal high-altitude tones.
  - *Dune Desert (Sector 04)*: Immense copper-orange dunes, blazing desert sun, heat mirage horizons, and open mega-factory topography.
  - *Titan Forest (Sector 05)*: Primeval alien biosphere crowned with giant bioluminescent mushroom spires, violet mycelium glow, and exotic SAM/Uranium nodes.
- **Dynamic Factory Horizon & Lighting**: Each biome dynamically adjusts sky gradients, backdrop lighting, environmental trait notes, and Web Audio synthesizer drone chords.
### 8. Lizard Doggo Native Companion ("Can You Pet the Dog?")
- **Interactive Companion Mechanics**: Adopt and care for MASSAGE-2(A-B)b's most beloved native creature, the Lizard Doggo (*Canine Reptilia*).
- **Petting Interaction**: Interactive petting with floating heart bursts, tail wags, affectionate alien purrs, and playful yips.
- **Treat Feeding**: Feed sweet Paleberries (+25% happiness, -14s foraging cooldown) or fresh Leaves (+8% happiness) to boost mood and foraging speed.
- **Wild Foraging & Deliveries**: Doggo periodically forages in the alien wilds and brings back gifts (Leaves, Paleberries, Caterium, Quartz, Power Shards, SAM Ore, seasonal FICSMAS gifts, or the iconic 2% Nuclear Waste hazard gag!).
- **Sanctuary Modal & Quick Dock**: Dedicated sanctuary dialog for petting, treat feeding, custom renaming, and item collection, plus a persistent quick-dock widget in the primary factory workspace.
- **Doggo Accolades**: 3 dedicated achievements (*Yes, You Can Pet the Dog!*, *Pioneer's Best Friend*, and *Good Boy Delivery*).

---

## Tech Stack

- **Framework**: React 19 (TypeScript)
- **Bundler & Tooling**: Vite 8
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Animations & Effects**: Motion & Canvas-Confetti
- **Audio**: Web Audio API (procedural synthesis)

---

## Getting Started

### Prerequisites

- Node.js (version 18 or higher recommended)
- npm

### Installation

```bash
git clone https://github.com/aethercowboy/ClickFactory.git
cd ClickFactory
npm install
```

### Development Server

Start the local development server at `http://localhost:3000`:

```bash
npm run dev
```

### Production Build

Compile the application to the `dist` directory:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

### Running Automated Verification Tests

Execute the comprehensive progression and simulation test suites:

```bash
npm test
```

---

## Changelog

### v0.9.3
- **Streamlined Doggo Companion UI & Space Recovery**:
  - Removed the bulky full-width `DoggoDockWidget` from the top of the main factory workspace, recovering substantial vertical screen real estate across all production and mining tabs.
  - Upgraded the top telemetry ribbon's **Lizard Doggo Companion Badge** into a comprehensive, compact companion status widget: displays live companion name, happiness %, and dynamic treasure notification badges (e.g. `🎁 [Item Name]!`) with pulse animations when an item is retrieved.
  - Clicking the header badge opens the **Doggo Sanctuary Modal** where the interactive SVG illustration, petting animation, mood details, treasure collection, and treat feeding live without consuming factory floor space.
- **Automated Verification**: Updated test suites in `test/progression.test.ts` for v0.9.3 SemVer validation.

### v0.9.2
- **Standardized Modal Height & Scroll Architecture**: Resolved modal overflow issues where controls in headers and footers were cut off on smaller viewports:
  - **Bounded Viewport Height**: All interactive modal dialogs (`FactoryAutomation` deploy modal, `PowerGridModal`, `SpaceElevatorModal`, `DoggoSanctuaryModal`, `BiomePickerModal`, `AchievementsModal`, and `SettingsModal`) are strictly bounded to `max-h-[90vh]` / `max-h-[92vh]`.
  - **Pinned Headers & Footers**: Header bars and action footers now employ `shrink-0` to guarantee that close buttons, confirm actions, and status indicators remain visible and clickable on every screen size.
  - **Independent Content Scrolling**: Intermediate modal content containers are configured with `flex-1 overflow-y-auto`, ensuring long lists and selection grids scroll smoothly without pushing header/footer controls out of view.
- **Automated Verification**: Added Test Suite 13 verifying viewport bounds, pinned headers, pinned footers, and scrollable bodies across all system modals, alongside SemVer 0.9.2 consistency.

### v0.9.1
- **Alien Remains & SAM Ore Extraction**: Restored access to Alien Remains by adding a dedicated *Hostile Alien Organisms* survey node to the Extraction & Mining tab (unlocked via Tier 1 Field Research) with manual fauna hunting (`Hunt Hostile Fauna`) and automated harvesting support.
- **S.A.M. Ore Geode Survey Node**: Added dedicated planetary deposit card for S.A.M. Ore in the Extraction tab (unlocked via Tier 9 Quantum Tech).
- **Miner Compatibility**: Added `alien_remains` to `SOLID_MINERAL_ORES` so Portable Miners and Miner Mk.1–3 can automate creature carapace collection.
- **Save State Migration**: Automatically ensures `unlockedOres` contains all ores granted by already-completed milestones on game load.
- **Automated Verification**: Added Test 12F verifying Alien Remains and SAM Ore accessibility via mechanical extractors and manual harvesting.

### v0.9.0
- **Automation Modal Device Fleet Counts**: Each machine architecture and target resource option now displays the active device count deployed across your factory (e.g. *Iron Ore Extractors x5*, *Constructors x4*).
- **Zero-Ownership Highlighting**: Prominently highlights devices and resource nodes you have 0 of with glowing amber badges (*0 Owned / 0 Deployed*) and accent borders, making factory automation gaps immediately apparent.
- **Strict Extractor Target Type Safety**: Enforced strict resource node engineering compatibility across the automation modal, engine tick, and save loader:
  - Hydraulic **Water Extractors** are strictly restricted to Water reservoir nodes (preventing extraction of solid ores like Iron).
  - Subterranean **Oil Extractors** are strictly restricted to Crude Oil wellheads.
  - Mechanical Rotary Miners (**Portable Miner**, **Miner Mk.1 / Mk.2 / Mk.3**) are restricted to solid mineral outcrops and cannot extract fluids.
  - Automated **FICSMAS Gift Trees** are restricted to orbital gift drops.
- **Automated Verification**: Added Test Suite 12 in `test/progression.test.ts` validating all extractor restriction rules, fleet counting, zero-ownership detection, and SemVer 0.9.0 consistency.

### v0.8.2
- **CI / Pipeline Build Fix for Recharts (`react-is`)**: Added missing `react-is` dependency required by Recharts module bundling (`recharts/es6/util/ReactUtils.js`), resolving the Rolldown/Vite production build failure in GitHub Actions (`CI=true npm run build`).
- **Synchronized Lockfiles**: Fully reconciled `package-lock.json` and `bun.lock` with `recharts` and `react-is` for deterministic CI clean installs (`npm ci`).
- **Vite Config Modernization**: Updated `vite.config.ts` path resolution to use `import.meta.dirname ?? process.cwd()`, suppressing native config loader deprecation warnings.

### v0.8.1
- **Recharts Net Flow Sparklines & Stability Trend Analysis**: Added compact, animated Recharts AreaChart sparklines to each row of the Logistics tab to visualize rolling net flow rate stability over time.
- **Dynamic Color-Coding & Direction Indicators**: Sparklines dynamically render in emerald (surplus), rose (deficit), amber (fluctuating across zero), or slate (neutral), with stability badges indicating *Stable*, *Rising ↗*, *Falling ↘*, or *Fluctuating ∿*.
- **Interactive Micro-Tooltips & Zero Reference Line**: Hovering over any point in the sparkline reveals the historical net rate with active unit scaling (`/min` or `/sec`), accompanied by a dashed zero reference line.

### v0.8.0
- **Logistics Net Flow Rate Filter & Bottleneck Detection**: Added comprehensive flow rate filtering on the Logistics tab to easily diagnose deficits, stagnant components, and throughput thresholds.
- **Arbitrary Rate Input & Interactive Scrubbing Slider**: Type any arbitrary numeric value (positive, negative, or decimal) or scrub continuously with a dynamic range slider to show components with net flow less than or equal to that rate.
- **Deficit & Zero Flow Analysis**: Easily view strictly negative flow rates (`< 0`, consuming faster than producing) or include neutral/zero flow rates (`≤ 0`) with single-click condition toggling.
- **Dual Display & Filter Units (/min and /sec)**: Seamlessly toggle between FICSIT standard `/min` and per-second `/sec` rates, with live secondary unit conversions displayed in parentheses.
- **Quick Preset Chips**: Instant 1-click filters for *All*, *Deficit Only (< 0)*, *Zero or Deficit (≤ 0)*, *< 60/min (1/s)* (Mk.1 conveyor belt speed), and *< 60/sec (3,600/min)*.
- **Interactive Flow Metric Cards**: Clickable summary cards for *All Active*, *Deficits*, *Neutral/Zero*, and *Surplus Growing* that immediately focus the table on those items.
- **Clickable Table Sorting**: Click any column header (Item Name, Stock, Production Rate, Consumption Rate, Net Flow Rate) to sort ascending or descending (defaulting to biggest deficits first).
- **Scope & Category Controls**: Filter by component category or toggle *Include Stagnant (0-stock)* to survey all discovered materials.
- **Automated Verification**: Added Test Suite 11 in `test/progression.test.ts` verifying flow filtering, zero handling, unit conversions, and SemVer 0.8.0 compliance.

### v0.7.0
- **Lizard Doggo Companion ("Can You Pet the Dog?")**: Added Satisfactory's iconic reptilian canine companion to ClickFactory.
- **Interactive Petting Action**: Pet your Lizard Doggo at any time with floating heart particles, floppy ear-fin and tail wag animations, and procedural audio (warm purrs and friendly yips).
- **Doggo Sanctuary Modal**: Full companion hub with animated SVG illustration, mood indicator (5 happiness tiers), custom companion renaming, treat feeding, and retrieved treasure slot.
- **Companion Quick-Dock Widget**: Persistent mini companion card on the main factory workspace providing 1-click petting, item delivery alert, and happiness status.
- **Treat Feeding System**: Feed sweet Paleberries (+25% happiness, -14s foraging cooldown) or fresh Leaves (+8% happiness) to accelerate foraging cycles.
- **Wild Foraging & Deliveries**: Periodically fetches gifts from MASSAGE-2(A-B)b's wild (common: Leaves/Ingots/Paleberries; uncommon: Caterium/Quartz/Alien Remains; rare: Power Shards/SAM Ore; holiday: FICSMAS gifts; and a hilarious 2% Nuclear Waste hazard delivery with radiation warning!).
- **New Accolades & Audio**: Added 3 achievements (*Yes, You Can Pet the Dog!*, *Pioneer's Best Friend*, *Good Boy Delivery*) and Web Audio synthesis for purrs, barks, and delivery chimes.
- **Automated Verification**: Added Test Suite 10 verifying Doggo state, petting logic, foraging roll tables, and SemVer 0.7.0 compliance.

### v0.6.1
- **Responsive Settings Modal Architecture**: Fixed mobile & small-screen viewport cutoff where the Settings modal exceeded screen height and hid the Close button.
- **Sticky Header & Footer Controls**: Added persistent sticky header with touch-friendly Close button (`X` icon + label) and a dedicated sticky footer with prominent "Close Settings" action button.
- **Scrollable Modal Body**: Constrained dialog to `max-h-[92vh]` with internal smooth scrolling (`overflow-y-auto`).
- **Backdrop & Keyboard Dismissal**: Enabled backdrop click-to-close and `Escape` key shortcut support.

### v0.6.0
- **Seasonal FICSMAS Holiday Event**: Added full Satisfactory-style holiday event with giant gifts dropped from planetary orbit.
- **Calendar & Manual Override Controls**: Automatically active every December (Dec 1 - Dec 31); includes settings in Pioneer Terminal to force Always Active, Seasonal, or Disabled at any time.
- **Giant Present Harvesting & Automation**: Harvest orbital gift drops manually with cheerful silver bell chimes, or construct automated robotic FICSMAS Gift Trees (15 gifts/min).
- **MAM Holiday Tech Tree**: Integrated 6 holiday research nodes unlocking Red/Blue/Copper/Iron Ornaments, Tree Branches, Candy Canes, Festive Bows, Cryogenic Snowballs, Automated Gift Trees, and the pinnacle FICSMAS Wonder Star.
- **Falling Snowflakes Background Effect**: 48 animated, gently swaying CSS snowflakes drifting across the factory environment whenever FICSMAS mode is active.
- **Holiday Boombox Track & Audio**: Added *FICSIT Holiday Jingle Bells* procedural synth cassette track and festive silver bell sound effects.
- **Holiday Accolades**: Added 4 festive achievements (*Merry FICSIT*, *Deck the Factory Halls*, *Holiday Automation*, *A Star in the Sky*).
- **Automated Verification**: Added Test Suite 9 verifying FICSMAS calendar logic, tech tree nodes, item recipes, and SemVer 0.6.0 compliance.

### v0.5.0
- **Planetary Biome Sectors (Theme Switcher)**: Added 5 authentic Satisfactory biomes on MASSAGE-2(A-B)b (*Grass Fields*, *Rocky Desert*, *Northern Forest*, *Dune Desert*, *Titan Forest*).
- **Dynamic Visual Atmosphere**: Each biome transforms the factory skyline canvas, backdrop lighting gradient, environmental traits notes, and color accents.
- **Atmospheric Web Audio Integration**: Biome transitions trigger pneumatic deployment audio and smoothly retune ambient synth drone chords.
- **Multi-Point Theme Controls**: Change sectors via the Header Biome badge, Factory Flow Map trigger, or the Settings modal.
- **Automated Verification**: Added Test Suite 8 verifying all 5 biome definitions, default fallbacks, and SemVer 0.5.0 consistency.

### v0.4.0
- **Pioneer Accolades (Achievement System)**: Added 14 tracked achievements with real-time detection, animated toast notifications, celebratory confetti, corporate fanfare audio, coupon rewards, and dedicated Ledger UI modal with filter tabs.
- **FICSIT Factory Boombox**: Integrated retro cassette player widget with dual spinning tape reels, track sequencer, volume slider, and 4 procedural Web Audio synth tracks (*MASSAGE-2(A-B)b Synthwave*, *Conveyor Belt Boogie*, *Deep Space Elevator*, *Pioneer Lo-Fi Chill*).
- **Header Accolades & Boombox Controls**: Added quick metrics counter button and Boombox dock trigger.
- **Automated Verification**: Added Test Suite 7 verifying achievement predicates and boombox tracks.

### v0.3.0
- **Proportional Craft Times & Queue Interruption**: Manual crafting time scales with recipe `craftTime`, with Blade Runners speed multiplier and queue interruption support.
- **Power Grid Resource Depletion**: Generators actively deplete fuel and water per operational unit.
- **Progression Prerequisites & Circularity Tests**: Added prerequisite checks in `progression.ts` and automated validation suite.
- **Live Deployment & Legal Notice**: Published live on GitHub Pages with official legal disclaimer.

---

## Versioning & Agent Instructions

This project adheres strictly to [Semantic Versioning (SemVer)](https://semver.org/): `MAJOR.MINOR.PATCH`.

- Current Version: **v0.9.1** (displayed in `package.json`, `src/version.ts`, top navigation bar, and settings modal).
- When submitting features, enhancements, or bugfixes, see [AGENTS.md](./AGENTS.md) for required version bump procedures and testing rules.

---

## Deployment to GitHub Pages

This repository includes an automated GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and deploys the app to GitHub Pages on every push to the `main` branch.

### Enabling GitHub Pages in Your Repository

1. Push your repository to GitHub (`https://github.com/aethercowboy/ClickFactory.git`).
2. In your repository on GitHub, navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. Every push to `main` will automatically build and publish to:
   ```
   https://aethercowboy.github.io/ClickFactory/
   ```

---

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](./LICENSE) file for details.
