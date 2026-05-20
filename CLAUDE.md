# CLAUDE.md — iPhone Landing Page Clone

## Project Overview

An Apple iPhone 15 Pro landing page clone. The site mimics Apple's aesthetic: cinematic scroll-driven animations, a rotating 3D iPhone model, and smooth section transitions.

**Goals for this revamp:** eliminate slow initial loads, fix frame drops and interactive hangs, optimize all rendering and asset loading.

**Out of scope:** changing visual design, replacing Three.js/R3F, adding new sections, any backend work.

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 + Vite 6 (plugin-react-swc) |
| 3D Rendering | Three.js 0.174 via @react-three/fiber 9 + @react-three/drei 10 |
| Scroll Animation | GSAP 3.12 + @gsap/react |
| Styling | Tailwind CSS 3.4 + PostCSS |
| Error Monitoring | Sentry (@sentry/react + @sentry/vite-plugin) |
| Assets | GLB model (`public/models/scene.glb`), MP4 videos, JPG/PNG/SVG images |
| Deployment | Static hosting (Vercel / Netlify / GitHub Pages) |

---

## Architecture

```
.
├── index.html                          # App entry — mounts React root, no preload hints yet
├── vite.config.js                      # Vite + Sentry plugin, no chunk splitting yet
├── tailwind.config.js
├── public/
│   ├── models/
│   │   └── scene.glb                   # Primary iPhone 3D model (GLB, Draco status unverified)
│   └── assets/
│       ├── images/
│       │   ├── apple.svg / bag.svg / search.svg / right.svg  # Navbar icons
│       │   ├── pause.svg / play.svg / replay.svg              # Carousel controls
│       │   ├── chip.jpeg / frame.png / hero.jpeg              # Section imagery
│       │   └── black.jpg / blue.jpg / white.jpg / yellow.jpg / explore1.jpg / explore2.jpg
│       └── videos/
│           ├── hero.mp4 / smallHero.mp4                       # Hero section (responsive)
│           ├── highlight-first.mp4 / hightlight-sec.mp4 / hightlight-third.mp4 / hightlight-fourth.mp4
│           ├── explore.mp4                                    # Features section
│           └── frame.mp4                                      # HowItWorks section
└── src/
    ├── main.jsx                        # React entry + Sentry init (sample rates at 1.0, wrong integration)
    ├── App.jsx                         # Root — Navbar Hero Highlights Model Features HowItWorks Footer
    ├── index.css                       # Global styles + Tailwind; canvas { touch-action: none } required
    ├── constants/index.js              # Nav links, highlight slides, model colors, sizes, footer links
    ├── utils/
    │   ├── animations.js               # Shared GSAP helpers: animateWithGsap, animateWithGsapTimeline
    │   └── index.js                    # Asset imports/exports (all loaded statically at module level)
    └── components/
        ├── Navbar.jsx                  # Static nav bar
        ├── Hero.jsx                    # Hero video (responsive); resize listener needs debounce
        ├── Highlights.jsx              # Section header + VideoCarousel; animations missing ScrollTrigger
        ├── VideoCarousel.jsx           # Video carousel with GSAP progress bar (tween storm + preload issues)
        ├── Model.jsx                   # Color/size picker + R3F Canvas (timeline leak, missing Canvas props)
        ├── ModelView.jsx               # R3F View per model size; Vector3 allocated every render
        ├── IPhone.jsx                  # 30 meshes from useGLTF; needsUpdate too broad; all have shadows
        ├── Lights.jsx                  # Environment(256) + 3 SpotLights — resolution already correct
        ├── Loader.jsx                  # BeatLoader shown via Suspense while GLTF resolves
        ├── Features.jsx                # Explore video with autoPlay+preload="none" conflict
        ├── HowItWorks.jsx              # Frame video with autoPlay+preload="none" conflict
        └── Footer.jsx                  # Static footer
```

---

## Slash Commands

| Command | Purpose |
|---|---|
| `/project:checklist` | Full performance audit checklist — check off items as fixes land |
| `/project:patterns` | Code patterns, debugging snippet, performance budgets, dev commands |

---

## Notes for Claude

- **Always read the target file before editing** — never assume the current implementation.
- **R3F, not raw Three.js** — configure the renderer via Canvas props (`gl`, `dpr`, `frameloop`, `shadows`). Use `useThree()` inside the Canvas tree to access `gl`, `camera`, or call `invalidate()`. Do not call `renderer` directly.
- **GSAP helpers** live in `src/utils/animations.js` — prefer extending helpers over inline per-component tweens.
- **Do not touch:** `useGLTF.preload("/models/scene.glb")` at the bottom of `IPhone.jsx` (correct); `Environment resolution={256}` in `Lights.jsx` (already optimized); `canvas { touch-action: none }` in `index.css` (required by R3F).
- **Prefer surgical fixes** — don't rewrite working code to fix one bug. Don't introduce abstractions that aren't needed.
- **R3F fiber 9 docs:** https://docs.pmnd.rs/react-three-fiber (breaking changes from v8).

@.claude/issues.md
