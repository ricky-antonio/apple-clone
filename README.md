# Apple iPhone 15 Pro — Landing Page Clone

A pixel-faithful recreation of Apple's iPhone 15 Pro product page, built to demonstrate advanced React animation and 3D rendering techniques. Features cinematic scroll-driven transitions, an interactive 3D model viewer, and a custom video carousel — all optimized for smooth performance across devices.

**Live demo:** [ricky-antonio.github.io/apple-clone](https://ricky-antonio.github.io/apple-clone) <!-- replace with your actual URL -->

![Preview](public/assets/images/hero.jpeg)

---

## What's in it

- **Interactive 3D iPhone model** — rendered with Three.js via React Three Fiber. Users can rotate the model by dragging and switch between four finish colors (Black Titanium, Blue Titanium, White Titanium, Natural Titanium). The Canvas uses `frameloop="demand"` so the GPU only draws when something actually changes.
- **Scroll-driven animations** — every section transition uses GSAP ScrollTrigger, matching the timing and easing of Apple's original page.
- **Video carousel** — four auto-advancing highlight clips with a GSAP-animated progress bar and manual scrubbing. Videos use `preload="none"` so only the active clip loads.
- **Responsive hero video** — swaps between full and mobile sources based on viewport width.
- **Error monitoring** — Sentry integrated for production error and performance tracking.

---

## Tech stack

| | |
|---|---|
| Framework | React 19 + Vite 6 (SWC) |
| 3D | Three.js 0.174, @react-three/fiber 9, @react-three/drei 10 |
| Animation | GSAP 3.12 + ScrollTrigger + @gsap/react |
| Styling | Tailwind CSS 3.4 |
| Monitoring | Sentry (@sentry/react) |
| Deployment | Vercel / Netlify / GitHub Pages |

---

## Engineering highlights

**Demand rendering with React Three Fiber**
The Canvas runs `frameloop="demand"` rather than the default continuous loop. A `GsapInvalidator` component subscribes `invalidate()` to GSAP's global ticker so the scene re-renders during animation, then goes fully idle when no animation is active. This eliminates constant GPU load while the user reads other sections of the page.

**GSAP tween storm fix**
The original video carousel implementation called `gsap.to()` inside an `onUpdate` callback (~60 calls/sec), creating hundreds of orphaned tweens per minute. Replaced with direct DOM style mutation for zero GC pressure during playback.

**Timeline memory management**
GSAP timelines for the model rotation were being created on every React render. Moved into a `useRef` so one timeline is created and reused for the component's lifetime.

**Scoped material updates**
The iPhone model has ~30 meshes. Color changes now set `needsUpdate = true` only on materials whose color actually changed, rather than forcing a full GPU re-upload of every material on each color swap.

---

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Project structure

```
src/
  components/
    Hero.jsx          # Responsive hero video with resize handling
    Highlights.jsx    # Section header + VideoCarousel
    VideoCarousel.jsx # GSAP-driven video carousel with progress bar
    Model.jsx         # Color/size picker + R3F Canvas
    ModelView.jsx     # R3F View per model size
    IPhone.jsx        # 3D iPhone model (GLTF, ~30 meshes)
    Lights.jsx        # Three-point lighting + environment map
    Features.jsx      # Explore section with scroll-triggered video
    HowItWorks.jsx    # Chip section with scroll-triggered video
  utils/
    animations.js     # Shared GSAP helpers
    index.js          # Asset exports
  constants/
    index.js          # Nav links, model colors/sizes, slide data
```

---

## License

This project is for portfolio and educational purposes. All Apple trademarks, product images, and videos remain the property of Apple Inc.
