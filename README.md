# ClickFactory (FICSIT Pioneer: Factory Automation)

[![Play Live](https://img.shields.io/badge/Play%20Live-aethercowboy.github.io%2FClickFactory-orange?style=for-the-badge&logo=google-chrome&logoColor=white)](https://aethercowboy.github.io/ClickFactory)
[![Version](https://img.shields.io/badge/version-0.3.0-blue?style=for-the-badge)](./package.json)
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

### 5. Procedural Audio & Logistics Telemetry
- **Web Audio API Sound Engine**: Zero-asset procedural synthesis for mining clinks, pneumatic presses, breaker arcs, launch thrusters, and ticket chimes, plus a toggleable ambient industrial synth drone.
- **Logistics Balance Monitor**: Live items/minute production and consumption rates with automatic deficit detection to identify bottlenecks.
- **Persistence**: Automatic LocalStorage saving every 5 seconds, offline progress simulation, and full JSON save export/import.

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

## Versioning & Agent Instructions

This project adheres strictly to [Semantic Versioning (SemVer)](https://semver.org/): `MAJOR.MINOR.PATCH`.

- Current Version: **v0.3.0** (displayed in `package.json`, `src/version.ts`, top navigation bar, and settings modal).
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
