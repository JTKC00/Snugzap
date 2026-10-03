// Public product copy, checked against ECHOES at 9c61e4e47f14acc5f28c4f2dd5deffb067a2bb1e.
// Keep content separate from the renderer so future product sections can reuse it.
export const echoes = {
  name: 'ECHOES',
  subtitle: '諸靈回響',
  playUrl: 'https://echoes.snugzap.com/',
  status: 'Playable web demo · Active development',
  tagline: 'A fractured world.\nStories that resonate.',
  positioning: 'A story-driven, single-player turn-based RPG. Build your party, find your rhythm in battle and follow the echoes of other lives.',
  overview: 'Technology and magic coexist in Ashenveil, a world being torn apart by the Rift. As a Resonator, you use the Echo Institute’s resonance technology to connect with Echoes across time and space — and face the Riftborn emerging from the fractures.',
  features: [
    { title: 'A world told through stories', description: 'Follow the main story, then get closer to your companions through their own character routes.' },
    { title: 'Battles with a sense of rhythm', description: 'Read the action timeline and choose skills around elemental resistances, shields and status effects.' },
    { title: 'A party of your own', description: 'Collect characters, arrange your team and develop their strengths as you progress.' },
    { title: 'Progress that stays with you', description: 'Cloud saves keep your journey connected when you return to the game.' },
  ],
  combat: [
    { title: 'Read the timeline', description: 'The action timeline shows who acts next. Speed and action timing shape the flow of each encounter.' },
    { title: 'Choose your response', description: 'Use basic attacks and active skills. Balance cooldowns, elemental resistances, shields and status effects.' },
    { title: 'Adapt to the encounter', description: 'Build a team that can handle different threats, from the frost-tainted streets to Chapter 1’s boss.' },
  ],
  stories: [
    { id: 'main-story', title: 'Main Story', subtitle: 'Your first resonance', description: 'Begin with Chapter 1 in Ashenveil. Meet your companions and investigate the frost spreading through the city as the Rift threatens everyday life.', image: '/echoes/frost-district.webp', width: 1672, height: 941, alt: 'The frozen streets of Ashenveil under a dark blue sky' },
    { id: 'reminiscences', title: 'Reminiscences', subtitle: '追憶短章', description: 'Focused character stories that bring you closer to individual companions. Discover Arlo and Luca through the people, choices and responsibilities that matter to them.', image: '/echoes/arlo-story.webp', width: 941, height: 1672, alt: 'A signal observation point from Arlo’s character story' },
    { id: 'echo-chapters', title: 'Echo Chapters', subtitle: '迴響篇章', description: 'Longer character journeys beyond the main story. Follow Cillian’s route into another part of the ECHOES world.', image: '/echoes/cillian-story.webp', width: 941, height: 1672, alt: 'Purple mist at the entrance to a forest in Cillian’s character story' },
  ],
  characters: [
    { id: 'arlo', name: 'Arlo Lin', nativeName: '阿洛・林', role: 'Field investigator', description: 'An investigator on the front line. Arlo brings a practical blade and a sense of responsibility to your journey through Ashenveil.', image: '/echoes/arlo_lin.webp', alt: 'Arlo Lin in a field uniform and scarf, carrying a short sword' },
    { id: 'luca', name: 'Luca', nativeName: '露卡・醫療學徒', role: 'Medical apprentice', description: 'A companion focused on care. Luca supports the party with healing and protection against contamination.', image: '/echoes/luca_medical_apprentice.webp', alt: 'Luca, a medical apprentice, in a white coat over a green uniform with medical equipment' },
    { id: 'cillian', name: 'Cillian', nativeName: '希里安・諾光', role: 'A story beyond Ashenveil', description: 'A magic-wielding companion with a journey of his own. Meet Cillian through his character route and discover the world behind his echo.', image: '/echoes/cillian_apprentice_sr.webp', alt: 'Cillian in a dark apprentice robe, holding a staff' },
  ],
  development: 'The Chapter 1 web demo is playable now, alongside Arlo, Luca and Cillian’s character routes. ECHOES is actively being developed, with ongoing work on battle pacing, replay value and the wider journey.',
} as const
