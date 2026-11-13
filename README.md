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
├── App.svelte              # Root component – menu, canvas, and HUD wiring
├── app.css                 # Global styles
├── engine/
│   ├── PlayerController.ts # Movement logic with collision detection
│   ├── CollisionSystem.ts  # AABB collision detection against obstacles and placed buildings
│   └── FollowCameraSystem.ts # Tweened orbit camera around a follow focus
├── ui/
│   ├── MainMenu.svelte     # Wii/iisu styled title screen
│   ├── Player.svelte       # Kitty player mesh + controller binding
│   ├── Environment.svelte  # Floor, obstacles, lighting
│   ├── Placement.svelte    # Build-mode ghost preview + click-to-place
│   ├── BuildMenu.svelte    # Bottom-right build button and building picker
│   ├── ResourceHud.svelte  # Bottom-left resource and power counters
│   └── FollowCamera.svelte # Camera that follows the player
├── state/
│   ├── ui.svelte.ts        # Screen and game-start state
│   ├── camera.svelte.ts    # Orbit camera yaw
│   ├── resources.svelte.ts # Resource pools and spend checks
│   └── buildings.svelte.ts # Placed buildings and placement selection
└── lib/
    ├── balance.ts          # Resource, building, and bounds tunables
    ├── placement.ts        # Grid math and placement validation
    ├── power.ts            # Power generation / demand satisfaction
    ├── layout.ts           # City layout (floor + obstacle positions)
    ├── input.ts            # Keyboard input reading (WASD/Arrow keys)
    ├── cameraInput.ts      # Q/E orbit-camera key bindings
    └── data/               # Save-file serialization and storage adapters
```

## Controls

| Key       | Action                       |
| --------- | ---------------------------- |
| `W` / `↑` | Move forward                 |
| `S` / `↓` | Move backward                |
| `A` / `←` | Move left                    |
| `D` / `→` | Move right                   |
| Click     | Place the selected structure |
| `Esc`     | Cancel build mode            |

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

MIT
