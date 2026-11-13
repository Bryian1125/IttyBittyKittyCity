# Credits

Itty Bitty Kitty City is MIT-licensed (see [LICENSE](LICENSE)). Third-party art
and libraries shipped with the project are listed below.

## Art assets

| Asset                                                                                                 | Author                                                            | License           | Source                                              |
| ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------- | --------------------------------------------------- |
| KayKit Space Base Bits (1.0) — `drill_structure.gltf`, `drill_structure.bin`, `spacebits_texture.png` | Kay Lousberg ([www.kaylousberg.com](https://www.kaylousberg.com)) | CC0 1.0 Universal | [kaylousberg.itch.io](https://kaylousberg.itch.io/) |
| Kenney Space Kit (2.0) — `rock_crystalsLargeA.glb`, `rock_crystalsLargeB.glb`                         | Kenney ([www.kenney.nl](https://www.kenney.nl))                   | CC0 1.0 Universal | [kenney.nl/assets/space-kit](https://kenney.nl/assets/space-kit) |

Both packs are released under
[CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/), which
places the work in the public domain and requires no attribution. Credit is
given here voluntarily. Upstream license texts are kept alongside the files:
[`public/models/kaykit/LICENSE.txt`](public/models/kaykit/LICENSE.txt) (KayKit
Space Base Bits, created 1 September 2023) and
[`public/models/kenney-space-kit/License.txt`](public/models/kenney-space-kit/License.txt)
(Kenney Space Kit 2.0, created 27 August 2020).

## Runtime libraries

| Library         | License | Link                                                             |
| --------------- | ------- | ---------------------------------------------------------------- |
| three           | MIT     | [github.com/mrdoob/three.js](https://github.com/mrdoob/three.js) |
| @threlte/core   | MIT     | [github.com/threlte/threlte](https://github.com/threlte/threlte) |
| @threlte/extras | MIT     | [github.com/threlte/threlte](https://github.com/threlte/threlte) |
| svelte          | MIT     | [github.com/sveltejs/svelte](https://github.com/sveltejs/svelte) |

The build also emits the glTF decoder binaries that Three.js's `GLTFLoader`
bundles (referenced by `@threlte/extras`). They are fetched only when loading a
Draco- or Basis-compressed asset; the current models are uncompressed.

| Decoder                                | License    | Link                                                                                     |
| -------------------------------------- | ---------- | ---------------------------------------------------------------------------------------- |
| Draco (`draco_decoder.*`)              | Apache 2.0 | [github.com/google/draco](https://github.com/google/draco)                               |
| Basis Universal (`basis_transcoder.*`) | Apache 2.0 | [github.com/BinomialLLC/basis_universal](https://github.com/BinomialLLC/basis_universal) |
