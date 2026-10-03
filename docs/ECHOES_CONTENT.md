# ECHOES product content

The official product introduction lives at `https://www.snugzap.com/echoes/`.
The game entry point is `https://echoes.snugzap.com/`.

## Content baseline

Copy was checked against the ECHOES repository at
`9c61e4e47f14acc5f28c4f2dd5deffb067a2bb1e` on 2026-10-03:

- `README.md`: Ashenveil, Resonator, Riftborn, playable Chapter 1, turn-based
  action timeline, resistances, shields, status effects, party progression,
  cloud saves and three character routes.
- `src/data/master/characters/characters.json`: Arlo, Luca and Cillian are
  implemented, playable characters. Introductions stay high-level.
- `src/app/view.ts`: distinguishes Reminiscences (追憶短章) and Echo Chapters
  (迴響篇章).

The page does not publish internal gates, QA identities, patch versions or
future Steam availability. `src/echoes.ts` holds product content independently
of the renderer and allows more characters and stories to be added later.
Future subpages remain unpublished until real HTML entries and registry records
exist. No game source or gameplay is changed by this site.

## Artwork provenance

The three images below are byte-identical copies of approved ECHOES runtime
standees at that commit. `release/asset-rights.json` records approval by James,
including marketing and worldwide commercial use. Each source fully decoded
as a 480 × 640 WebP with transparency before being installed here; dimensions
and descriptive alt text are present in the page markup.

| Local image under `public/echoes/` | Source under `src/assets/standees/characters/` | SHA-256 |
| --- | --- | --- |
| `arlo_lin.webp` | `arlo_lin.webp` | `aa9813e64ffc692eda2325b05f6290ba70a04f1aec3b334ff30d09f3fa4c46fb` |
| `luca_medical_apprentice.webp` | `luca_medical_apprentice.webp` | `7f593aed786617a72e575a742ee5764e125737370dda5ffb6328581009c172af` |
| `cillian_apprentice_sr.webp` | `cillian_apprentice_sr.webp` | `d1a5b8a7b5d66bba4e475159cd3462c4f939f4f0de61ebfc414931f4378487e6` |

Approval records: `character-visuals-text-root-batch-b1-standees-v1`,
`character-visuals-text-root-batch-b4-standees-v1` and `character-visuals-text-root-batch-b2-standees-v1`.

These are character illustrations, not combat screenshots. Combat is introduced
through descriptions of implemented mechanics; no mock gameplay capture is
presented as actual game footage. Social metadata reuses the existing verified
Snugzap share image, with page-specific ECHOES title, description and URL.
