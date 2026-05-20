# Performance Audit Progress

## Lighthouse Scores

| Run | Date | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|---|
| Baseline (pre-audit) | 2026-05-20 | 39 | 93 | 100 | 91 |

## Core Web Vitals

| Run | FCP | LCP | Speed Index | TBT | TTI | CLS |
|---|---|---|---|---|---|---|
| Baseline (pre-audit) | 3.7s | 9.9s | 3.7s | 1,870ms | 10.0s | 0.048 |

## Network Payload

| Run | Total | Media | JS | Images |
|---|---|---|---|---|
| Baseline (pre-audit) | 29.7 MB | 25.9 MB | 552 KB | 2.3 MB |

> Baseline captured from live site: https://apple-iphone.rickycodes.dev/ (before any audit fixes deployed)

---

## Fixes Landed

| # | Issue | File | Status |
|---|---|---|---|
| 1 | `preload="auto"` → `preload="metadata"` on carousel videos | `VideoCarousel.jsx` | Done |
| 2 | GSAP tween storm in `onUpdate` → direct style mutation | `VideoCarousel.jsx` | Done |

---

## Remaining (by priority)

### Critical
- [ ] `Model.jsx` — move `gsap.timeline()` into a `useRef` (issue #3)

### High
- [ ] `Model.jsx` Canvas — add `frameloop="demand"`, `dpr={[1, 2]}`, `gl={{ powerPreference: "high-performance" }}` (issue #4)
- [ ] Wire up `invalidate()` in `IPhone.jsx` and GSAP ticker (issue #5)
- [ ] `ModelView.jsx` — replace `new THREE.Vector3(0,0,0)` with `[0,0,0]` (issue #6)
- [ ] `IPhone.jsx` — disable shadows where not visually necessary (issue #7)
- [ ] `Hero.jsx` — debounce resize handler (issue #8)
- [ ] `index.html` — add `<link rel="preload">` for `scene.glb` and hero videos (issue #10)
- [ ] Verify `scene.glb` Draco compression (issue #9)

### Medium
- [ ] `Highlights.jsx` — add ScrollTrigger to heading/link animations (issue #13)
- [ ] `Features.jsx` / `HowItWorks.jsx` — remove `autoPlay`, trigger `.play()` from ScrollTrigger (issue #14)
- [ ] `main.jsx` — lower Sentry sample rates; remove wrong React Router integration (issues #11, #12)
- [ ] `IPhone.jsx` — scope `needsUpdate` to only changed materials (issue #15)

### Low
- [ ] `vite.config.js` — manual chunk splitting for three.js + R3F (issue #16)
- [ ] Convert JPEGs to WebP (issue #18)
- [ ] `IPhone.jsx` — `.map()` → `.forEach()` for side effects (issue #17)
