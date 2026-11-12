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
├── App.svelte              # Root component – sets up Canvas, Player, Camera, Environment
├── app.css                 # Global styles
├── engine/
│   ├── PlayerController.ts # Movement logic with collision detection
│   ├── CollisionSystem.ts  # AABB collision detection against obstacles
│   └── FollowCameraSystem.ts # Smooth camera following player
├── ui/
│   ├── Player.svelte       # Kitty player mesh + controller binding
│   ├── Environment.svelte  # Floor, obstacles, lighting
│   └── FollowCamera.svelte # Camera that follows the player
└── lib/
    ├── layout.ts           # City layout (floor + obstacle positions)
    └── input.ts            # Keyboard input reading (WASD/Arrow keys)
```

## Controls

| Key | Action |
|-----|--------|
| `W` / `↑` | Move forward |
| `S` / `↓` | Move backward |
| `A` / `←` | Move left |
| `D` / `→` | Move right |

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run check` | Run `svelte-check` (TypeScript + Svelte diagnostics) |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run test` | Run Vitest tests |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow, testing policy, and
commit conventions. [ARCHITECTURE.md](ARCHITECTURE.md) covers the layer
boundaries, naming, and the rules the frame loop follows.

## License

MIT