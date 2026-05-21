# Confirmed Issues

Issues below are verified against actual source files. Update this file as issues are fixed — strike through resolved items or remove them.

> **Standing instruction for Claude:** If you discover any bug or performance issue during a session that is not already listed here, add it to this file under the appropriate severity heading (Critical / High / Medium / Low) before making any fixes. Do this even if the issue is outside the scope of the current session — log it and continue with the assigned work.

---

## Critical

1. **`VideoCarousel.jsx` — `preload="auto"` on all 4 carousel videos**
   All highlight videos download in full on initial page load. Change to `preload="none"`.

2. **`VideoCarousel.jsx` — `gsap.to()` called inside `onUpdate`**
   The progress-bar `useEffect` calls `gsap.to(videoDivRef...)` and `gsap.to(span[videoId]...)` inside the `onUpdate` callback (~60×/sec). Spawns hundreds of tweens per second. Replace with direct style mutation.

3. **`Model.jsx` — `gsap.timeline()` created in component body**
   `const tl = gsap.timeline()` runs on every React render, leaking a new timeline each time. Move into a `useRef`.

---

## High

4. **`Model.jsx` — R3F Canvas missing `frameloop`, `dpr`, and `gl` props**
   Canvas defaults to `frameloop="always"` (renders every RAF), uncapped DPR, and no `powerPreference`. Add `frameloop="demand"`, `dpr={[1, 2]}`, `gl={{ powerPreference: "high-performance" }}`.

5. **No `invalidate()` calls after adding `frameloop="demand"`**
   Once `frameloop="demand"` is set, the scene only re-renders when explicitly told to. Two things need wiring: (a) `IPhone.jsx` must call `invalidate()` after updating material colors so the color swap is visible; (b) GSAP animations that mutate Three.js objects (model rotation via `animateWithGsapTimeline`) need a GSAP ticker subscriber that calls `invalidate()` on each tick so animated transitions render. OrbitControls with `makeDefault` already handles its own `invalidate()` for drag interactions.

6. **`ModelView.jsx` — `new THREE.Vector3()` allocated in JSX prop**
   `target={new THREE.Vector3(0, 0, 0)}` allocates a new object on every render. Replace with `target={[0, 0, 0]}`.

7. **`IPhone.jsx` — all ~30 meshes have `castShadow` and `receiveShadow`**
   Every mesh participates in shadow calculations. Disable globally on Canvas or per-mesh where shadows aren't visually necessary.

8. **`Hero.jsx` — resize handler has no debounce**
   `handleVideoSrcSet` fires on every `resize` event with no throttle, triggering React state updates at high frequency.

~~9. **`public/models/scene.glb` — Draco compression status unverified**
   The GLB has not been inspected for Draco compression. If uncompressed, it may be significantly larger than necessary. Verify and apply Draco compression if missing.~~ ✓ Verified: `KHR_draco_mesh_compression` is present (867 KB). No changes needed.

10. **`index.html` — no `<link rel="preload">` for critical assets**
    No preload hints for `scene.glb` or hero videos.

---

## Medium

~~11. **`main.jsx` — Sentry sampling at 100% in production**
    `tracesSampleRate: 1.0` and `replaysSessionSampleRate: 1.0` capture everything. Lower to `0.1` for production.~~ ✓ Fixed: both lowered to `0.1`; `replaysOnErrorSampleRate` left at `1.0`.

~~12. **`main.jsx` — wrong Sentry integration**
    `reactRouterV6BrowserTracingIntegration` is used but the app has no React Router. Remove it.~~ ✓ Fixed: removed integration and cleaned up unused `React` default import.

13. **`Highlights.jsx` — heading animations fire without ScrollTrigger**
    `gsap.to("#title")` and `gsap.to(".link")` run on mount regardless of scroll position. Add `scrollTrigger` config.

~~14. **`Features.jsx` / `HowItWorks.jsx` — `autoPlay` conflicts with `preload="none"`**
    Both videos have `autoPlay` + `preload="none"`. Remove `autoPlay`; call `.play()` from ScrollTrigger `onComplete`.~~ ✓ Fixed: removed `autoPlay` from both; `Features.jsx` uses existing `onComplete` trigger; `HowItWorks.jsx` now uses `onEnter`/`onLeaveBack` ScrollTrigger.

~~15. **`IPhone.jsx` — `needsUpdate = true` set on all materials unconditionally**
    On every color change all materials are marked dirty, forcing GPU re-upload of everything.~~ ✓ Fixed: `needsUpdate` moved inside the if-block; only materials whose color actually changed are marked dirty.

---

## Low

~~16. **`vite.config.js` — no manual chunk splitting**
    Three.js + R3F ship in the same chunk as app code. Add `build.rollupOptions.output.manualChunks`.~~ ✓ Fixed: `three`, `r3f`, and `gsap` now build as separate cacheable chunks.

~~17. **`IPhone.jsx` — `.map()` used for side effects**
    `Object.entries(materials).map(...)` used for side effects. Change to `.forEach()`.~~ ✓ Fixed: loop already uses `.forEach()`.

~~18. **Image assets — JPEGs not converted to WebP**
    Color variant images (`black.jpg`, `blue.jpg`, `white.jpg`, `yellow.jpg`) and explore images (`explore1.jpg`, `explore2.jpg`) are raw JPEGs. Converting to WebP saves ~25–35% file size with no visual difference.~~ ✓ Fixed: all 6 converted to WebP at quality 85 (~60–66% size reduction on color images); imports updated in `src/utils/index.js`.

---

## Not a Bug (investigated, intentional)

- **`Model.jsx` — Canvas `position: fixed` covering full viewport** — This is the required pattern for `@react-three/drei`'s `View` component. The Canvas must be fixed and full-screen so `View.Port` can render to arbitrary DOM regions. The `eventSource={document.getElementById("root")}` prop correctly routes pointer events. No fix needed.

---

## Refactor Priority Order

1. **Critical (fix first):**
   - `VideoCarousel.jsx` — `preload="auto"` → `preload="none"` on all 4 videos
   - `VideoCarousel.jsx` — fix GSAP tween storm in `onUpdate` (direct style mutation)
   - `Model.jsx` — move `gsap.timeline()` into a `useRef`

2. **High:**
   - `Model.jsx` Canvas — add `frameloop="demand"`, `dpr={[1, 2]}`, `gl={{ powerPreference: "high-performance" }}`
   - Wire up `invalidate()` in `IPhone.jsx` and GSAP ticker after `frameloop="demand"` is set
   - `ModelView.jsx` — replace `new THREE.Vector3(0,0,0)` with `[0,0,0]`
   - `Hero.jsx` — add 150ms debounce to resize listener
   - `index.html` — add `<link rel="preload">` for `scene.glb` and hero videos
   - Verify `scene.glb` uses Draco compression; apply if missing

3. **Medium:**
   - `Highlights.jsx` — add `scrollTrigger` to heading/link animations
   - `Features.jsx` / `HowItWorks.jsx` — remove `autoPlay`; trigger `.play()` from ScrollTrigger
   - `main.jsx` — lower Sentry sample rates; remove wrong React Router integration
   - `IPhone.jsx` — scope `needsUpdate` to only changed materials

4. **Low:**
   - `vite.config.js` — add manual chunk splitting for three.js + R3F
   - ~~Image assets — convert JPEGs to WebP~~ ✓
   - Mobile — reduce Canvas quality on `window.innerWidth < 768`
