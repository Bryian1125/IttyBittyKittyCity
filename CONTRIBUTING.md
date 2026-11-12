# Contributing to Itty Bitty Kitty City

Thanks for wanting to contribute! This document outlines the workflow and standards for this project.

## Development Workflow

### 1. Fork & Clone

```bash
git clone https://github.com/<your-username>/IttyBittyKittyCity.git
cd IttyBittyKittyCity
```

### 2. Create a Branch

Use a descriptive branch name:

```bash
git checkout -b feat/add-catnip-collectibles
# or
git checkout -b fix/collision-bug-on-ramps
# or
git checkout -b docs/update-readme
```

### 3. Make Changes

- Follow the existing code style (enforced by Prettier + ESLint)
- Write TypeScript with strict types
- Keep components small and focused
- Add tests for new logic (Vitest)

### 4. Verify Locally

Before pushing, run the full check suite:

```bash
npm run check   # TypeScript + Svelte diagnostics
npm run lint    # ESLint
npm run test    # Vitest
npm run format  # Prettier (auto-fix)
```

All commands must pass.

### 5. Commit

Use conventional commits:

```
feat: add catnip collectibles with glow effect
fix: resolve player getting stuck on ramp edges
docs: update CONTRIBUTING with commit guidelines
refactor: extract collision logic to separate system
test: add unit tests for PlayerController
chore: update dependencies
```

### 6. Push & Open PR

Push your branch and open a Pull Request against `master`. Fill in the
[PR template](.github/PULL_REQUEST_TEMPLATE.md): summary, motivation, type of
change, how you tested it, and the checklist.

## Code Style

- **Formatting**: Prettier (run `npm run format`)
- **Linting**: ESLint with `eslint-plugin-svelte`, `typescript-eslint`
- **TypeScript**: Strict mode enabled; prefer `type` over `interface` for simple shapes
- **Svelte 5**: Use runes (`$state`, `$props`, `$bindable`, `$derived`, `$effect`) — no legacy `export let` or `createEventDispatcher`
- **Components**: One component per file; PascalCase filenames (`Player.svelte`)
- **Imports**: Group order — external libs, internal `@/` aliases, relative paths

Naming conventions, layer boundaries (what may import what), and the frame-loop
rules live in [ARCHITECTURE.md](ARCHITECTURE.md).

### Comments

Comments explain what the code does and any non-obvious constraint a reader
needs — for example why camera smoothing uses `1 - Math.exp(-k * delta)` instead
of a constant lerp factor. Do not narrate history, rejected alternatives, or
"why we don't do X"; git holds that. If a comment is longer than the code it
describes, cut it down.

## Contribution Rules

### One change per pull request

Keep each pull request to a single feature, fix, or refactor. Unrelated changes,
including drive-by cleanups and formatting of untouched files, go in separate
PRs so each can be reviewed and reverted on its own. Run `npm run format` on the
files you touched — never on the whole repo in an unrelated PR.

### One canonical name, no fallbacks

Every prop, layout id, key binding, and identifier has exactly one canonical
name. Do not add aliases, "try name X then name Y" resolution, or silent
defaults that hide misconfiguration. When input is wrong or missing, fail
loudly instead of papering over it. This applies to identifiers and
configuration, not runtime resilience — gracefully degrading an operation (for
example, ignoring unknown keys in `input.ts` rather than throwing) is fine.

### Vendored and generated code

Do not patch code under `node_modules/`, and do not hand-edit `dist/` output —
both are regenerated and any local edits are lost. That rule covers vendored
third-party content generally, including the agent skill set under
`agents/skills/` (dev branch, sources in `agents/skills/SOURCES.md`): fix or
report issues upstream, or re-copy from the source, instead of editing the
files in place.

## Testing

Choose the verification that exercises the changed behavior most directly, and
describe it in the PR's Testing section. A unit test is not required for every
change.

- **Engine logic** (`src/engine/`) — unit tests are expected. It is pure
  TypeScript with no DOM or WebGL dependency, so it runs in the default `node`
  test environment. Cover movement, collision, and camera math.
- **Data and helpers** (`src/lib/`) — test when the module has branching logic
  (layout validation, input mapping).
- **Components and rendering** (`src/ui/`) — verified in the browser, not with
  mocks. Do not write mock-based tests that assert Three.js rendering, or
  markup snapshots that break on every style change.
- **Bug fixes** — reproduce the bug first, then confirm the reproduction no
  longer fails. Add a regression test only when it provides durable coverage
  beyond that check.

Add a permanent unit test only when all of these hold:

- It protects an observable, deterministic contract.
- A plausible regression would have real impact (a stuck player, a broken
  collision volume).
- Existing tests do not already cover it.
- It would fail for a plausible broken implementation.
- It is cheaper and more reliable than checking the behavior by hand.

Unit tests live in `src/**/*.test.ts` (`*.test.ts` next to the file), run with
`npm run test`. Component and browser tests are not set up yet — adding
`@testing-library/svelte` or Vitest browser mode is a separate change, not a
side effect of a feature PR.

## Commit Messages

Follow the Conventional Commits style used in the history:
`type(scope): summary`, or `type: summary` when no scope helps. Use lowercase
types such as `feat`, `fix`, `refactor`, `chore`, `test`, `docs`, or `perf`,
with a focused scope when useful — `refactor(engine): drop per-frame vector
allocations`.

Keep the summary concise, imperative, and specific. Default to the summary line
alone; add a body only when it carries information a reader would otherwise
miss — a non-obvious root cause, a constraint that forced the approach, or a
behavior change players will notice. Do not restate the diff or list touched
files.

## Pull Request Checklist

- [ ] `npm run check` passes
- [ ] `npm run lint` passes
- [ ] `npm run test` passes
- [ ] `npm run format` applied to touched files (no Prettier diffs)
- [ ] Conventional commit messages
- [ ] New engine logic has unit tests
- [ ] Visual changes verified in the browser (screenshot or gif attached)
- [ ] Related docs updated in the same PR (README, CONTRIBUTING, ARCHITECTURE)
- [ ] No unrelated changes (no formatting-only commits mixed with logic)

## Debugging

- **Dev server**: `npm run dev` — Vite with hot module replacement. Most changes
  to `ui/` and `lib/` apply without a reload.
- **Diagnostics**: `npm run check` runs `svelte-check` (TypeScript + Svelte)
  without a browser and catches most wiring mistakes in components.
- **Frame time**: browser DevTools → Performance → record a short interaction
  (walk into a wall, zoom out). Frame time should stay under 16.7 ms; compare
  the scripting and GPU rows to tell CPU-bound from GPU-bound regressions.
- **Console errors**: WebGL warnings and uncaught errors in the browser console
  are treated as failures — fix them before opening a PR, even if the scene
  still renders.
- **Visual changes**: camera feel, collision feel, and rendering are verified by
  running the game. Attach a screenshot or short gif to the PR.

## Reporting Issues

Use GitHub Issues. Include:

- Clear title and description
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots/video if visual
- Browser/OS if relevant

## Feature Requests

Open an issue with the `enhancement` label. Describe:

- The problem it solves
- Proposed API/UX (if you have ideas)
- Any technical considerations

## Code of Conduct

Be respectful, inclusive, and constructive. This project follows the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

## Questions?

Open a GitHub Discussion or ping the maintainer in an issue.
