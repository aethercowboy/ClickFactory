# ClickFactory: Contributor & Agent Instructions

## 1. Versioning Protocol (Semantic Versioning)
ClickFactory strictly adheres to [Semantic Versioning (SemVer)](https://semver.org/): `MAJOR.MINOR.PATCH`.

- **PATCH** (`0.3.x`): Backwards-compatible bug fixes, minor UI tweaks, balance adjustments, and non-breaking refinements.
- **MINOR** (`0.x.0`): New gameplay features, buildings, milestone tiers, tech trees, or significant UI additions that preserve save compatibility.
- **MAJOR** (`x.0.0`): Major overhauls, save schema breaking changes, or engine rewrites.

### Mandatory Version Bump Rule
Whenever making any relevant enhancement, new feature, balance change, or bugfix:
1. Bump the `"version"` field in `package.json`.
2. Bump `APP_VERSION` in `src/version.ts`.
3. Add a concise entry to the **Changelog** section in `README.md`.
4. Run `npm test` and `npm run lint` to guarantee that all automated suites pass.

---

## 2. Core Game Systems & Architecture Guidelines
- **Proportional Craft Times & Interruption**: Manual crafting at the Pioneer Craft Bench must take time proportional to the recipe's `craftTime` (modified by gear upgrades such as the Blade Runners exoskeleton). Players must always be able to interrupt/cancel longer craft queues (e.g. after clicking "Max") without losing items that have already completed.
- **Progression Guardrails**: Milestone tiers, navigation tabs, and industrial machines must strictly obey the progression prerequisites in `src/utils/progression.ts`. Players should never be able to access, craft, or interact with unearned tiers ahead of time.
- **Power Grid Physics**: Generators must actively deplete fuel (e.g. biomass, solid biofuel, coal) and water per tick based on operational generator counts and grid load. If fuel or water is exhausted, generators shut down and capacity is reduced accordingly.
- **Legal Notice**: Always retain the disclaimer that ClickFactory is an unofficial fan game inspired by Satisfactory and is not affiliated with or endorsed by Coffee Stain Studios.
