# Skill sources & provenance

All skills vendored from upstream agent-skill repositories (MIT / Apache-2.0).
Each skill folder retains its `SKILL.md` and text references; upstream pins are
recorded below for reproducibility.

Binary reference assets (texture maps, LUTs, `.exr` / `.bin` files, ~40 MB) were
**excluded** during vendoring to keep the repository small. They are not
referenced by any `SKILL.md`, so nothing breaks. Re-fetch from the upstream repo
if a skill's example needs its original textures.

## Sources

| Source | Commit | License | Skills |
|---|---|---|---|
| [`sveltejs/ai-tools`](https://github.com/sveltejs/ai-tools) | `d3e755be7702` | MIT | 2 — `svelte-code-writer`, `svelte-core-bestpractices` |
| [`fubits1/svelte-skills`](https://github.com/fubits1/svelte-skills) | `a024d57a1453` | MIT | 10 — `code-style`, `code-style-svelte`, `validate`, `validate-file`, `vitest`, `testing-svelte`, `playwright`, `js-config`, `editing`, `migration` |
| [`scottstts/Threejs-Awesome-Graphics-Agent-Skills`](https://github.com/scottstts/Threejs-Awesome-Graphics-Agent-Skills) | `53eb5a240974` | MIT | 10 — `threejs-skill-router`, `threejs-camera-direction`, `threejs-exposure-color-grading`, `threejs-image-pipeline`, `threejs-procedural-architecture`, `threejs-procedural-geometry`, `threejs-procedural-materials`, `threejs-shadow-systems`, `threejs-bloom`, `threejs-atmosphere-aerial-perspective` |
| [`Moh4696/open-3d-skills`](https://github.com/Moh4696/open-3d-skills) | `53beb899e77f` | MIT | 3 — `threejs-scene`, `site-check`, `frame-capture` |
| [`majidmanzarpour/threejs-game-skills`](https://github.com/majidmanzarpour/threejs-game-skills) | `8286774b22a2` | MIT | 7 — `threejs-gameplay-systems`, `threejs-debug-profiler`, `threejs-aaa-graphics-builder`, `threejs-qa-release`, `threejs-3d-generator`, `threejs-image-generator`, `threejs-audio-generator` |
| [`citypaul/.dotfiles`](https://github.com/citypaul/.dotfiles) | `cd4028d` | Apache-2.0 | 3 — `codebase-design`, `functional`, `finding-seams` |

**Total: 35 skills.**

## Updating

```bash
git clone --depth 1 https://github.com/<source>.git /tmp/opencode/skills-src/<name>
# re-copy the skill directories listed above, drop binary assets,
# then update the commit column to the new HEAD
```
