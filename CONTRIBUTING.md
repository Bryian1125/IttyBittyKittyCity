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

Push your branch and open a Pull Request against `main`. The PR description should explain:

- **What** changed
- **Why** it was needed
- **How** to test it manually (if applicable)

## Code Style

- **Formatting**: Prettier (run `npm run format`)
- **Linting**: ESLint with `eslint-plugin-svelte`, `typescript-eslint`
- **TypeScript**: Strict mode enabled; prefer `type` over `interface` for simple shapes
- **Svelte 5**: Use runes (`$state`, `$props`, `$bindable`, `$derived`, `$effect`) — no legacy `export let` or `createEventDispatcher`
- **Components**: One component per file; PascalCase filenames (`Player.svelte`)
- **Imports**: Group order — external libs, internal `@/` aliases, relative paths

## Testing

- Unit tests live in `src/**/*.test.ts` (or `.test.ts` alongside the file)
- Use Vitest with `@testing-library/svelte` for component tests
- Engine logic (PlayerController, CollisionSystem) should have unit tests
- Run `npm run test` — all tests must pass

## Pull Request Checklist

- [ ] `npm run check` passes
- [ ] `npm run lint` passes
- [ ] `npm run test` passes
- [ ] `npm run format` applied (no Prettier diffs)
- [ ] Conventional commit messages
- [ ] PR description explains the change
- [ ] No unrelated changes (no formatting-only commits mixed with logic)

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