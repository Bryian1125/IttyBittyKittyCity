# Architecture

How Itty Bitty Kitty City is put together, the boundaries reviewers enforce, and
where new code belongs. For the development workflow, see
[CONTRIBUTING.md](CONTRIBUTING.md).

## Stack

| Layer      | Choice                                                            |
| ---------- | ----------------------------------------------------------------- |
| Rendering  | Three.js via [Threlte](https://threlte.xyz/) 8 (`@threlte/core`)  |
| UI         | Svelte 5 with runes (`$state`, `$props`, `$bindable`, `$derived`) |
| Language   | TypeScript, strict mode                                           |
| Build      | Vite                                                              |
| Tests      | Vitest, `node` environment, `src/**/*.test.ts`                    |
| Formatting | Prettier (tabs, single quotes, trailing commas)                   |

## Layout

```text
src/
  main.ts                 Entry point: mounts App
  App.svelte              Composition root: Canvas + scene children
  app.css                 Global styles
  ui/                     Threlte components (declarative scene graph)
    MainMenu.svelte       Title screen, game start
    Player.svelte         Player mesh + per-frame task
    Environment.svelte    Floor, collection points, lights
    Placement.svelte      Build-mode ghost preview + click-to-place
    BuildingGhost.svelte  Green/red placement ghost for any building
    BuildingModel.svelte  Placed building: glTF model when the def has one, box otherwise
    GltfProp.svelte       Static glTF prop (map deposits, scenery), scaled to a footprint
    BuildMenu.svelte      Bottom-right build button and building picker
    ResourceHud.svelte    Bottom-left resource and power counters
    EconomyLayer.svelte   Collector → refinery packet animation
    FollowCamera.svelte   Camera rig + wheel zoom listener
  engine/                 Imperative systems (plain TypeScript)
    PlayerController.ts   Movement rules, delta-scaled, collision-aware
    modelFit.ts           Clones and grounds a glTF prop at a target footprint
    CollisionSystem.ts    AABB collision against collection points and placed buildings
    FollowCameraSystem.ts Tweened orbit camera around a follow focus
  lib/                    Pure data and helpers
    balance.ts            Resource, building, and buildable-area tunables
    cameraInput.ts        Q/E orbit-camera key bindings
    economy.ts            Extraction, refining, and range math
    input.ts              Keyboard state reader (WASD bindings)
    layout.ts             Floor and collection-point site layout
    placement.ts          Grid math and placement validation
    power.ts              Power generation/demand satisfaction
    data/                 Save serialization and storage adapters
  state/                  Cross-component reactive state (.svelte.ts modules)
    ui.svelte.ts          Screen state and game start
    camera.svelte.ts      Orbit camera yaw
    resources.svelte.ts   Resource pools and spend checks
    buildings.svelte.ts   Placed buildings and placement selection
    economy.svelte.ts     Ore buffers, refinery pulls, transfer packets
```

## Assets

Third-party 3D assets live under `public/models/<pack>/` and are referenced by
public URL from `BuildingDef.model` (for example
`/models/kaykit/drill_structure.gltf`) or `MapSite.deposit` (for example
`/models/kenney-space-kit/rock_crystalsLargeA.glb`). Keep a pack's `.gltf`,
`.bin`, texture files, and license text in the same folder so the relative
texture URIs resolve and the license travels with the files. Provenance and
attribution are recorded in [CREDITS.md](CREDITS.md).

## Boundaries reviewers enforce

1. **`engine/` does not import Svelte or Threlte.** Systems take Three.js
   objects (`Object3D`, `Vector3`, `Camera`) and primitives, and expose narrow
   methods such as `update(delta, input)`. This keeps them unit-testable in the
   `node` test environment, with no canvas, DOM, or WebGL context.
2. **`ui/` contains no game rules.** Movement, collision, and camera math live
   in `engine/`. Components read the keyboard, call a system, and bind objects
   into the scene graph — nothing more. If a component grows logic, extract a
   system.
3. **`lib/` stays pure.** Modules export plain data (`BoxSpec`, obstacle lists)
   and pure helpers. They create no Three.js objects and hold no scene state.
4. **Cross-component mutable state lives in `state/`** as `.svelte.ts` modules
   using runes. Everything else flows props down, callbacks up.
5. **Every per-frame behavior is delta-scaled** (`speed * delta`). A constant
   applied per frame runs twice as fast on a 120 Hz display. If it changes over
   time, it takes `delta`.
6. **No allocations inside `update()`.** Reuse scratch vectors and objects
   created at construction (see `FollowCameraSystem`). The frame loop must not
   feed the garbage collector.
7. **Event listeners registered in `$effect` are removed in its cleanup**
   (see `FollowCamera.svelte`). One listener, one disposer.
8. **New interactive feature → a system + a thin component.** Add the rules in
   `engine/` with an `update()` method, unit-test it, then wire it from a small
   `ui/` component. Do not grow `Player.svelte` into a controller.

## Naming

| Artifact                  | Convention                    | Example              |
| ------------------------- | ----------------------------- | -------------------- |
| Svelte components (files) | `PascalCase.svelte`           | `Player.svelte`      |
| Engine systems (files)    | `PascalCase.ts`, one per file | `CollisionSystem.ts` |
| `lib/` modules (files)    | `camelCase.ts`                | `layout.ts`          |
| State modules (files)     | `camelCase.svelte.ts`         | —                    |
| Types and interfaces      | `PascalCase`                  | `BoxSpec`            |
| Functions and variables   | `camelCase`                   | `moveAxis`           |
| Module-level constants    | `SCREAMING_SNAKE_CASE`        | `PLAYER_HALF_SIZE`   |
| Exported data             | `camelCase`                   | `obstacles`          |

## Frame loop

Threlte's `useTask(delta => …)` drives all updates, once per rendered frame.
Systems keep persistent state on their instance (`zoomFactor`, cached boxes) and
receive `delta` in seconds. Nothing else may hold frame state.

## Debugging

- `npm run dev` — Vite dev server with hot module replacement.
- `npm run check` — TypeScript and Svelte diagnostics without a browser.
- Browser DevTools → **Performance**: record a short interaction. Frame time
  should stay under 16.7 ms; check both the scripting (CPU) and GPU rows.
  Camera or collision feel regressions usually show up as scripting spikes,
  not GPU.
- Rendering, layout, camera feel, and collision feel are verified **in the
  browser**. Do not write mock-based tests to avoid that check.
