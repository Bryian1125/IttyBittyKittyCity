# agents/

Agent skill set for working on Itty Bitty Kitty City.

> **Branch policy:** this folder lives on the `dev` branch only. It is workflow
> tooling for the development branch and should not be merged into `master`.

## Layout

```
agents/
└── skills/
    └── <skill-name>/
        ├── SKILL.md        # instructions the agent loads on demand
        └── references/ …   # optional deep-dive docs and code examples
```

Each `SKILL.md` follows the open Agent Skills format (Markdown + YAML
frontmatter with `name` / `description`), so it works with any agent that
supports skills: Claude Code, Cursor, Codex, OpenCode, etc.

## How this maps to the repo

The stack is **Svelte 5 (runes) + Threlte 8 + Three.js + TypeScript**, split as
`src/engine/` (imperative systems: `PlayerController`, `CollisionSystem`,
`FollowCameraSystem`), `src/ui/` (Threlte components), `src/lib/` (input, layout
data), `src/state/`.

| Working on | Load |
|---|---|
| Any `.svelte` / `.svelte.ts` edit | `svelte-code-writer`, `svelte-core-bestpractices`, `code-style-svelte`, `validate-file` |
| Three.js scene, camera, geometry, materials, shadows | `threejs-skill-router` first, then the specific `threejs-*` skill |
| Engine systems (movement, collision, camera) | `threejs-gameplay-systems`, `threejs-debug-profiler` |
| Architecture / refactors | `codebase-design`, `functional`, `finding-seams` |
| Tests | `testing-svelte`, `vitest`, `playwright` |
| Visual polish | `threejs-aaa-graphics-builder`, `threejs-bloom`, `threejs-exposure-color-grading`, `threejs-image-pipeline` |
| Before reporting done | `validate` + the repo's own gates (see below) |

## Repo gates (from CONTRIBUTING.md)

All of these must pass before a change is considered done:

```bash
npm run check   # svelte-check (TypeScript + Svelte diagnostics)
npm run lint    # ESLint
npm run test    # Vitest
npm run format  # Prettier
```

Attribution and upstream pins for every vendored skill: [`skills/SOURCES.md`](skills/SOURCES.md).
