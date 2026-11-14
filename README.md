# Itty Bitty Kitty City

A tiny 3D kitty city built with **Svelte 5**, **Three.js** (via [Threlte](https://threlte.xyz/)), and **TypeScript**. Walk around a miniature city as a little kitty cube.

## Tech Stack

- **Svelte 5** – Reactive UI with runes (`$state`, `$props`, `$bindable`)
- **Threlte** – Declarative Three.js components for Svelte
- **Three.js** – 3D rendering
- **TypeScript** – Type safety
- **Vite** – Fast dev server and bundler
- **Vitest** – Unit testing
- **ESLint + Prettier** – Code quality and formatting

## Getting Started

### Prerequisites

- Node.js 20+
- npm (or pnpm/yarn)

### Installation

```bash
npm install
```

### Development

Start the dev server with hot module replacement:

```bash
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

### Building

Production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
src/
├── main.ts                 # App entry point
├── App.svelte              # Root component – menu, canvas, HUD, overlay pages
├── app.css                 # Global styles
├── engine/
│   ├── PlayerController.ts # Movement logic with collision detection
│   ├── CollisionSystem.ts  # AABB collision detection against sites and placed buildings
│   ├── FollowCameraSystem.ts # Tweened orbit camera around a follow focus
│   └── modelFit.ts         # Fits glTF props to a target footprint
├── ui/
│   ├── MainMenu.svelte     # Wii/iisu styled title screen
│   ├── Player.svelte       # Kitty player mesh + controller binding
│   ├── Environment.svelte  # Floor, collection points, lighting
│   ├── Placement.svelte    # Build-mode ghost preview + click-to-place
│   ├── BuildingGhost.svelte # Green/red tinted placement ghost
│   ├── BuildingModel.svelte # Placed building: glTF model or placeholder box
│   ├── GltfProp.svelte     # Static glTF props (deposits, scenery)
│   ├── Refineries.svelte   # Refinery working-state visuals
│   ├── Colonists.svelte    # Colonist NPC visuals
│   ├── BuildMenu.svelte    # Bottom-right build button and building picker
│   ├── ResourceHud.svelte  # Bottom-left counters and page buttons
│   ├── EconomyLayer.svelte # Animated collector → refinery ore packets
│   ├── PageShell.svelte    # Overlay page frame (backdrop, card, close)
│   ├── ResourcesPage.svelte # Resource cards with live amounts
│   ├── SettingsPage.svelte # Skin picker and controls reference
│   └── FollowCamera.svelte # Camera that follows the player
├── state/
│   ├── ui.svelte.ts        # Game start and overlay page state
│   ├── camera.svelte.ts    # Orbit camera yaw
│   ├── resources.svelte.ts # Resource pools and spend checks
│   ├── buildings.svelte.ts # Placed buildings and placement selection
│   ├── economy.svelte.ts   # Ore buffers, refinery pulls, transfer packets
│   ├── refineries.svelte.ts # Refinery buffers and deposits
│   ├── npcs.svelte.ts      # Colonists, population, and housing
│   └── skins.svelte.ts     # Selected player skin
└── lib/
    ├── balance.ts          # Resource, building, and tuning tables
    ├── placement.ts        # Grid math and placement validation
    ├── power.ts            # Power generation / demand satisfaction
    ├── economy.ts          # Extraction, refining, and range math
    ├── population.ts       # Colonist growth and upkeep rules
    ├── skins.ts            # Skin presets and persistence
    ├── layout.ts           # Floor and collection-point site layout
    ├── input.ts            # Keyboard input reading (WASD)
    ├── cameraInput.ts      # Q/E orbit-camera key bindings
    └── data/               # Save-file serialization and storage adapters
```

## Controls

| Key       | Action                          |
| --------- | ------------------------------- |
| `W` / `↑` | Move forward                    |
| `S` / `↓` | Move backward                   |
| `A` / `←` | Move left                       |
| `D` / `→` | Move right                      |
| `Q` / `E` | Turn camera                     |
| Wheel     | Zoom                            |
| `R`       | Rotate structure while building |
| Click     | Place the selected structure    |
| `Esc`     | Cancel build mode               |

## Available Scripts

| Command           | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `npm run dev`     | Start development server                             |
| `npm run build`   | Build for production                                 |
| `npm run preview` | Preview production build                             |
| `npm run check`   | Run `svelte-check` (TypeScript + Svelte diagnostics) |
| `npm run lint`    | Run ESLint                                           |
| `npm run format`  | Format with Prettier                                 |
| `npm run test`    | Run Vitest tests                                     |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow, testing policy, and
commit conventions. [ARCHITECTURE.md](ARCHITECTURE.md) covers the layer
boundaries, naming, and the rules the frame loop follows.

## License

The source code in this repository is released under the [MIT License](LICENSE).

Third-party art assets and libraries are credited in [CREDITS.md](CREDITS.md).
