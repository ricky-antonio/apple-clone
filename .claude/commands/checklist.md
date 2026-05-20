# Performance Audit Checklist

> **R3F note:** This project uses `@react-three/fiber`. Configure the renderer via Canvas props (`gl`, `dpr`, `frameloop`, `shadows`) — not by accessing `renderer` directly. Use `useThree()` inside the Canvas tree to read `gl`, `camera`, or call `invalidate()`.

Use this checklist when auditing or verifying fixes. Check off items as they are confirmed resolved.

---

## Rendering Pipeline

- [ ] **Canvas `gl` prop** — `gl={{ powerPreference: "high-performance", antialias: window.devicePixelRatio < 2 }}` on Canvas in `Model.jsx`
- [ ] **Pixel ratio cap** — `dpr={[1, 2]}` on Canvas (currently uncapped)
- [ ] **Frameloop on demand** — `frameloop="demand"` on Canvas; `invalidate()` called after color swap / rotation end
- [ ] **Shadow map autoUpdate** — shadow autoUpdate disabled; `needsUpdate` triggered only on scene change
- [ ] **Draw calls** — profile with `useThree(({ gl }) => gl.info.render.calls)`; target < 50 per frame
- [ ] **Frustum culling** — no mesh sets `frustumCulled={false}` unnecessarily in `IPhone.jsx`

---

## Asset Optimization

- [ ] **Model compression** — `public/models/scene.glb` uses Draco compression (verify with `npx gltf-pipeline -i public/models/scene.glb --draco.compressionLevel 10`)
- [ ] **Texture compression** — color images (`black.jpg`, `blue.jpg`, `white.jpg`, `yellow.jpg`) and explore images converted to WebP
- [ ] **Texture sizing** — no image exceeds 2048×2048
- [ ] **Environment resolution** — `Lights.jsx` uses `resolution={256}` ✅ already correct

---

## Loading Strategy

- [ ] **Preload hints** — `index.html` has `<link rel="preload">` for `scene.glb`, `hero.mp4`, `smallHero.mp4`
- [ ] **Video preload** — `VideoCarousel.jsx` carousel videos use `preload="none"` (was `preload="auto"`)
- [ ] **GLTF caching** — `useGLTF.preload("/models/scene.glb")` present at bottom of `IPhone.jsx` ✅
- [ ] **Suspense boundary** — `<IPhone>` wrapped in `<Suspense fallback={<Loader />}>` in `ModelView.jsx` ✅

---

## Memory Management

- [ ] **GSAP timeline** — `Model.jsx` uses `useRef(gsap.timeline())` (not bare `gsap.timeline()` in component body)
- [ ] **GSAP tween storm** — `VideoCarousel.jsx` `onUpdate` mutates styles directly (no `gsap.to()` inside `onUpdate`)
- [ ] **Three.js object allocation** — `ModelView.jsx` uses `target={[0, 0, 0]}` (not `new THREE.Vector3()`)
- [ ] **Material needsUpdate** — `IPhone.jsx` only marks materials dirty when their color actually changes

---

## Scroll & Interaction

- [ ] **Resize debounce** — `Hero.jsx` resize listener wrapped in 150ms debounce
- [ ] **Highlights ScrollTrigger** — `Highlights.jsx` `#title` and `.link` animations have `scrollTrigger` config
- [ ] **autoPlay removed** — `Features.jsx` and `HowItWorks.jsx` do not use `autoPlay`; `.play()` triggered from ScrollTrigger
- [ ] **GSAP scrub** — `Features.jsx` uses `scrub: 5.5` for image grow ✅ correct

---

## Mobile & Responsiveness

- [ ] **Device-aware Canvas** — mobile (`window.innerWidth < 768`) gets lower `dpr` max and disabled shadows
- [ ] **Touch events** — `canvas { touch-action: none }` in `index.css` ✅
- [ ] **Canvas resize** — R3F handles resize via internal ResizeObserver ✅

---

## Monitoring & Observability

- [ ] **Sentry sample rates** — `tracesSampleRate` and `replaysSessionSampleRate` lowered to `0.1` (or env-var controlled)
- [ ] **Sentry integration** — `reactRouterV6BrowserTracingIntegration` removed (no React Router in this app)

---

## Bundle

- [ ] **Chunk splitting** — `vite.config.js` has `manualChunks` separating `three`, `@react-three/fiber`, `@react-three/drei`, and `gsap` from app code
