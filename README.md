# FICSIT Pioneer: Factory Automation

An incremental idle clicker game inspired by **Satisfactory**, **Universal Paperclips**, and **Cookie Clicker**.

Extract raw planetary ores, machine foundational plates and rods, establish automated conveyor and smelting lines, balance a sensitive electrical power grid with master circuit breakers, research alien technology in the MAM, and launch colossal payloads up the Space Elevator for Project Assembly.

---

## Features

### 1. Planetary Resource Survey & Manual Crafting
- **Resource Deposits**: Mine native nodes across planet MASSAGE-2(A-B)b (Iron Ore, Copper Ore, Limestone, Coal, Caterium Gold, Raw Quartz, Crude Oil, Bauxite, Uranium, and Flora).
- **Craft Bench**: Fabricate standard components by hand with single, x5, x10, and max batch options.
- **Pioneer Gear**: Unlock the FICSIT Employee Coffee Cup (+400% click yield) and Blade Runners Exoskeleton (+100% manual craft speed).

### 2. Autonomous Factory Production Lines
- **Machine Types**:
  - Extractors: Portable Miners, Miner Mk.1, Mk.2, Mk.3, Oil Extractor, Water Extractor
  - Processors: Induction Smelters, Alloy Foundries, Constructors, Assemblers, 4-Line Manufacturers, Chemical Refineries, Industrial Blenders, and Particle Accelerators
- **Overclocking with Power Shards**: Socket crystal shards harvested from native Power Slugs to boost machine clock speeds up to 250%.
- **Zero-Loss Dismantling**: Receive a 100% material refund when decommissioning factory units.

### 3. Electrical Power Grid & Circuit Breakers
- **Power Plants**:
  - Biomass Burners (30 MW) burning Leaves, Biomass, or Solid Biofuel
  - Coal Generators (75 MW) powered by continuous Coal and Water cooling
  - Fuel Generators (250 MW) running on Fuel or Turbofuel
  - Nuclear Power Plants (2,500 MW) splitting Uranium Fuel Rods
- **Dynamic Load & Breaker Trips**: If factory consumption exceeds capacity, the grid trips with an industrial siren. Pioneers must balance generation or shut down lines before pulling the heavy master breaker lever to restore power.

### 4. Multi-Track Progression System
- **HUB Milestones (Tiers 0 through 9)**: Deliver required components to the HUB Freighter Pod to unlock advanced logistics, miners, foundries, refineries, and quantum tech.
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
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
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

---

## Deployment to GitHub Pages

This repository includes an automated GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and deploys the applet to GitHub Pages on every push to the `main` branch.

### Enabling GitHub Pages in Your Repository

1. Push your repository to GitHub.
2. In your repository on GitHub, navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. Every push to `main` will automatically trigger the build pipeline and publish the site to:
   ```
   https://<your-username>.github.io/<repo-name>/
   ```

---

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](./LICENSE) file for details.
