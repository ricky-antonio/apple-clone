# Optimization Roadmap

Each section below is a self-contained prompt to paste at the start of a fresh session.
Run them in order. Clear the agent between each one.

Sessions 1–3 are Critical. Sessions 4–8 are High priority. Sessions 9–12 are Medium. Sessions 13–14 are Low. Run the Closing Session last.

---

## Session 1 — VideoCarousel: Kill the preload + tween storm

```
Read src/components/VideoCarousel.jsx in full.

Fix two confirmed bugs:

BUG 1 — preload="auto" on all 4 videos:
Every carousel video downloads in full on page load. Change every <video> tag's
preload attribute from "auto" to "none". There are 4 video elements inside the
hightlightsSlides.map() — change all of them.

BUG 2 — gsap.to() called inside onUpdate (~60×/sec):
In the second useEffect (the progress-bar one), the onUpdate callback currently
calls gsap.to(videoDivRef.current[videoId], { width: ... }) and
gsap.to(span[videoId], { width: ..., backgroundColor: "white" }).
This spawns hundreds of new tweens every second.

Fix: replace both gsap.to() calls inside onUpdate with direct style mutations:
- videoDivRef.current[videoId].style.width = (width value based on window.innerWidth)
- span[videoId].style.width = `${currentProgress}%`
- span[videoId].style.backgroundColor = "white"

The onComplete callback (which resets width to "12px" and color to "#afafaf") is
fine — it only runs once, leave it using gsap.to().

After editing, verify: no gsap.to() call exists inside any onUpdate callback in
this file.

If you notice any other issues while reading this file that are not already listed
in .claude/issues.md, add them there under the appropriate severity heading before
making any fixes.

Before starting: summarize in plain English what you are about to do and confirm with me.
```

---

## Session 2 — Model: Fix GSAP timeline memory leak

```
Read src/components/Model.jsx in full.

Fix one confirmed bug:

BUG — gsap.timeline() created in the component body:
The line `const tl = gsap.timeline()` sits directly in the Model component body,
outside any hook. This means a brand-new timeline is created on every React render,
and the old ones are never cleaned up.

Fix: convert tl to a ref. Replace:
  const tl = gsap.timeline();
with:
  const tl = useRef(gsap.timeline());

Then update the two animateWithGsapTimeline() call sites inside the useEffect
(which fires when `size` changes) to pass tl.current instead of tl:
  animateWithGsapTimeline(tl.current, ...)

useRef is already imported at the top of this file — no import changes needed.

If you notice any other issues while reading this file that are not already listed
in .claude/issues.md, add them there under the appropriate severity heading before
making any fixes.

Before starting: summarize in plain English what you are about to do and confirm with me.
```

---

## Session 3 — Canvas: Add missing performance props

```
Read src/components/Model.jsx in full.

Fix the R3F Canvas configuration. The <Canvas> element currently has no frameloop,
dpr, or gl props — it renders every animation frame even when nothing moves, uses
an uncapped device pixel ratio, and doesn't request the high-performance GPU.

Make these three changes to the <Canvas> element:

1. Add frameloop="demand"
   Stops continuous rendering. The scene only re-renders when invalidate() is
   called. Session 4 wires up invalidate() — do not skip Session 4 after this one.

2. Add dpr={[1, 2]}
   Caps the device pixel ratio at 2. Prevents 3× or 4× rendering on high-DPR
   devices.

3. Add gl={{ powerPreference: "high-performance" }}
   Requests the discrete GPU on dual-GPU machines.

The Canvas currently looks like:
  <Canvas
    className="w-full h-full"
    style={{ position: "fixed", top: 0, bottom: 0, right: 0, left: 0, overflow: "hidden" }}
    eventSource={document.getElementById("root")}
  >

After your change it should have all three new props in addition to the existing ones.
Do not change anything else in this file.

If you notice any other issues while reading this file that are not already listed
in .claude/issues.md, add them there under the appropriate severity heading before
making any fixes.

Before starting: summarize in plain English what you are about to do and confirm with me.
```

---

## Session 4 — Canvas: Wire up invalidate() so demand rendering works

```
Read src/components/ModelView.jsx in full.
Read src/components/IPhone.jsx in full.

Context: Session 3 added frameloop="demand" to the Canvas. This means the scene
will NOT re-render on its own — it only renders when invalidate() is called.
Without wiring invalidate(), color swaps and GSAP-driven rotation animations will
appear frozen. This session fixes that.

There are two places that need invalidate() wired up:

--- Fix 1: IPhone.jsx — color change re-render ---

useThree() is already available in IPhone.jsx because it renders inside the Canvas
tree. Add this to the component:

  const { invalidate } = useThree();

Then at the end of the useEffect that updates material colors (the one that
depends on [materials, props.item]), call invalidate() as the last line so the
scene re-renders after the color swap:

  useEffect(() => {
    Object.entries(materials).forEach(([key, mat]) => {
      // ... existing color logic ...
    });
    invalidate(); // trigger one re-render after color update
  }, [materials, props.item]);

Add useThree to the existing import from "@react-three/fiber".

--- Fix 2: ModelView.jsx — GSAP animation re-renders ---

GSAP animations that rotate the Three.js model group (via animateWithGsapTimeline
in Model.jsx) mutate Three.js objects directly. With frameloop="demand" these
mutations won't trigger re-renders unless we subscribe to the GSAP ticker.

Add a small helper component inside ModelView.jsx:

  function GsapInvalidator() {
    const { invalidate } = useThree();
    useEffect(() => {
      gsap.ticker.add(invalidate);
      return () => gsap.ticker.remove(invalidate);
    }, [invalidate]);
    return null;
  }

Then render <GsapInvalidator /> inside the <View> element, as the first child,
before <Lights />.

Add the useEffect import if not already present. Add gsap import if not already
present (import gsap from "gsap").

Note: OrbitControls with makeDefault already calls invalidate() on its own during
user drag — no changes needed there.

If you notice any other issues while reading these files that are not already
listed in .claude/issues.md, add them there under the appropriate severity heading
before making any fixes.

Before starting: summarize in plain English what you are about to do and confirm with me.
```

---

## Session 5 — Hero: Debounce the resize handler

```
Read src/components/Hero.jsx in full.

Fix one confirmed bug:

BUG — resize listener fires on every resize event with no debounce:
The useEffect adds `window.addEventListener("resize", handleVideoSrcSet)`.
Every tiny window resize fires handleVideoSrcSet immediately, which calls
setVideoSrc() and potentially triggers a video source swap and re-render.

Fix: debounce the handler with a 150ms delay. Replace the useEffect with:

  useEffect(() => {
    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleVideoSrcSet, 150);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

No other changes. Do not add or remove any imports.

If you notice any other issues while reading this file that are not already listed
in .claude/issues.md, add them there under the appropriate severity heading before
making any fixes.

Before starting: summarize in plain English what you are about to do and confirm with me.
```

---

## Session 6 — ModelView: Fix Vector3 allocation per render

```
Read src/components/ModelView.jsx in full.

Fix one confirmed bug:

BUG — new THREE.Vector3(0, 0, 0) allocated in JSX prop:
The <OrbitControls> component receives `target={new THREE.Vector3(0, 0, 0)}`.
This allocates a new Three.js Vector3 object on every React render.

Fix: @react-three/drei's OrbitControls accepts a plain array for target.
Replace:
  target={new THREE.Vector3(0, 0, 0)}
with:
  target={[0, 0, 0]}

After this change, check whether `import * as THREE from "three"` is still needed.
If Vector3 was the only usage of THREE in this file, remove the import entirely.
If THREE is used elsewhere in the file, leave the import.

If you notice any other issues while reading this file that are not already listed
in .claude/issues.md, add them there under the appropriate severity heading before
making any fixes.

Before starting: summarize in plain English what you are about to do and confirm with me.
```

---

## Session 7 — index.html: Add preload hints for critical assets

```
Read index.html in full.

Add <link rel="preload"> hints for the two most critical assets so the browser
starts fetching them during HTML parse, before JavaScript executes.

Add these two lines inside the <head>, after the existing <link> for the favicon:

  <link rel="preload" href="/models/scene.glb" as="fetch" crossorigin>
  <link rel="preload" href="/assets/videos/hero.mp4" as="video" type="video/mp4">

Notes:
- scene.glb uses as="fetch" with crossorigin because GLB files are fetched by
  Three.js via XHR/fetch, not as a traditional browser resource type.
- hero.mp4 uses as="video".
- Do not add preload hints for the carousel videos — those should stay lazy
  (preload="none" was fixed in Session 1).
- Do not change anything else in index.html.

If you notice any other issues while reading this file that are not already listed
in .claude/issues.md, add them there under the appropriate severity heading before
making any fixes.

Before starting: summarize in plain English what you are about to do and confirm with me.
```

---

## Session 8 — scene.glb: Verify and apply Draco compression

```
The primary 3D model is at public/models/scene.glb. Its compression status has
not been verified. Draco compression can reduce GLB file size by 60–90% for
geometry-heavy models, which directly cuts download time.

Do the following:

STEP 1 — Check current file size:
Run: ls -lh public/models/scene.glb
Note the size. If it is already under 1 MB, Draco is likely applied — report
the size and stop here (no further changes needed).

STEP 2 — If over 1 MB, check for Draco encoding:
Run: npx gltf-pipeline --input public/models/scene.glb --stats
Look for "Draco" in the output. If Draco is already present, report and stop.

STEP 3 — If Draco is NOT present, apply it:
Run: npx gltf-pipeline -i public/models/scene.glb -o public/models/scene.glb --draco.compressionLevel 10
Note the new file size and report the reduction.

STEP 4 — If Draco was applied, update IPhone.jsx to use DRACOLoader:
Read src/components/IPhone.jsx.
Add the decoder path so drei's useGLTF can decompress the file:
  import { useGLTF, useTexture } from "@react-three/drei";
  // At the bottom of the file, update the preload line to:
  useGLTF.preload("/models/scene.glb");
  // And before the component, set the decoder path:
  useGLTF.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");

The decoder path uses Google's CDN, which is the standard approach and avoids
bundling the WASM decoder yourself.

If you notice any other issues while reading these files that are not already
listed in .claude/issues.md, add them there under the appropriate severity heading
before making any fixes.

Before starting: summarize in plain English what you are about to do and confirm with me.
```

---

## Session 9 — Highlights: Add ScrollTrigger to heading animations

```
Read src/components/Highlights.jsx in full.
Also read src/utils/animations.js to understand the animateWithGsap helper.

Fix one confirmed bug:

BUG — heading and link animations fire on mount, ignoring scroll position:
Inside useGSAP, `gsap.to("#title", { opacity: 1, y: 0 })` and
`gsap.to(".link", { opacity: 1, y: 0, ... })` run immediately when the component
mounts, regardless of whether the section is visible. On a tall page the animation
completes before the user ever scrolls to Highlights.

Fix: wrap both animations with ScrollTrigger so they fire when the elements
enter the viewport. Use the existing animateWithGsap helper from
"../utils/animations" — it already handles ScrollTrigger config.

The animateWithGsap helper signature is:
  animateWithGsap(target, animationProps, scrollProps?)
It sets: trigger = target, toggleActions = "restart reverse restart reverse",
start = "top 85%", then spreads any scrollProps on top.

Replace the useGSAP body:
- Use animateWithGsap for "#title" instead of a bare gsap.to()
- Add a scrollTrigger block to the existing gsap.to(".link") call
- Preserve the existing stagger: 0.25 on the link animation

If you notice any other issues while reading these files that are not already listed
in .claude/issues.md, add them there under the appropriate severity heading before
making any fixes.

Before starting: summarize in plain English what you are about to do and confirm with me.
```

---

## Session 10 — Features & HowItWorks: Fix autoPlay conflict

```
Read src/components/Features.jsx in full.
Read src/components/HowItWorks.jsx in full.

Fix one confirmed bug in each file:

BUG — autoPlay + preload="none" conflict:
Both files have a <video> with autoPlay AND preload="none". The browser will
try to autoPlay before any data is buffered, causing a silent failure or delay.
The GSAP ScrollTrigger in both files is already the correct mechanism for
controlling playback — autoPlay is redundant and harmful here.

Fix for Features.jsx:
- Remove the `autoPlay` attribute from the #exploreVideo <video> element.
- The existing ScrollTrigger already calls `videoRef.current.play()` in its
  onComplete callback. That is the correct trigger — leave it as-is.

Fix for HowItWorks.jsx:
- Remove the `autoPlay` attribute from the <video> inside .hiw-video.
- This video currently has no ScrollTrigger to start it. Add one inside the
  existing useGSAP callback:

    gsap.to(videoRef.current, {
      scrollTrigger: {
        trigger: "#chip",
        start: "20% bottom",
        onEnter: () => videoRef.current?.play(),
        onLeaveBack: () => videoRef.current?.pause(),
      },
    });

Do not change anything else in either file.

If you notice any other issues while reading these files that are not already listed
in .claude/issues.md, add them there under the appropriate severity heading before
making any fixes.

Before starting: summarize in plain English what you are about to do and confirm with me.
```

---

## Session 11 — Sentry: Fix sample rates and wrong integration

```
Read src/main.jsx in full.

Fix two confirmed bugs in the Sentry.init() call:

BUG 1 — sample rates at 100%:
tracesSampleRate: 1.0 and replaysSessionSampleRate: 1.0 capture every transaction
and every session replay in production. This adds measurable runtime overhead and
Sentry ingestion cost. replaysOnErrorSampleRate: 1.0 is intentional for error
sessions — leave that one unchanged.

Fix: lower tracesSampleRate to 0.1 and replaysSessionSampleRate to 0.1.

BUG 2 — wrong Sentry integration:
reactRouterV6BrowserTracingIntegration is imported and used, but this app has
no React Router anywhere. Using it adds overhead and produces misleading traces.

Fix: remove reactRouterV6BrowserTracingIntegration from the integrations array.
Keep browserTracingIntegration() and replayIntegration() — those are correct.

Also clean up the import at the top of the file. The
reactRouterV6BrowserTracingIntegration was passed `useEffect: React.useEffect`,
which is the only reason React was imported from "react" alongside the default
import. Check whether React is still needed after removing it — StrictMode still
requires React, so keep the import but remove the { useEffect } named import if
it is no longer used.

If you notice any other issues while reading this file that are not already listed
in .claude/issues.md, add them there under the appropriate severity heading before
making any fixes.

Before starting: summarize in plain English what you are about to do and confirm with me.
```

---

## Session 12 — IPhone: Scope material updates

```
Read src/components/IPhone.jsx in full.

Fix two confirmed issues in this file:

BUG 1 — needsUpdate = true set on ALL materials unconditionally:
The useEffect that runs when props.item changes calls
`material[1].needsUpdate = true` on every single material, including the glass,
screen, and logo surfaces that intentionally skip the color change. This forces
the GPU to re-upload all materials even when only a subset changed.

Context: the useEffect already has an if-block that limits which materials get
a new color:
  if (material[0] !== "zFdeDaGNRwzccye" && ...)
Only the materials that pass this condition have their color changed. Only those
should be marked needsUpdate.

Fix: move the `material[1].needsUpdate = true` line from outside the if-block
to inside it, so it only runs for materials whose color was actually changed.

BUG 2 — .map() used for side effects:
The same loop uses Object.entries(materials).map(...) but the return value of
map is never used — it's only called for its side effects (setting color and
needsUpdate). This is misleading and allocates an unused array.

Fix: change .map() to .forEach().

If you notice any other issues while reading this file that are not already listed
in .claude/issues.md, add them there under the appropriate severity heading before
making any fixes.

Before starting: summarize in plain English what you are about to do and confirm with me.
```

---

## Session 13 — Vite: Add chunk splitting for large dependencies

```
Read vite.config.js in full.

Three.js, @react-three/fiber, @react-three/drei, and gsap together are ~1.5 MB+
minified. Without chunk splitting they ship in the same bundle as app code, which
means the browser must download and parse all of it before the page becomes
interactive.

Add manual chunk splitting to the Vite build config so these libraries load as
separate cacheable chunks:

export default defineConfig({
  plugins: [...existing plugins, keep them unchanged...],
  build: {
    sourcemap: true,  // keep existing
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
          r3f: ["@react-three/fiber", "@react-three/drei"],
          gsap: ["gsap", "@gsap/react"],
        },
      },
    },
  },
});

Keep everything else in the file exactly as-is (plugins, sourcemap setting).

After editing, run `npm run build` and confirm it completes without errors.
Report the sizes of the output chunks listed in the build log — specifically the
three, r3f, and gsap chunks vs the main app chunk.

If you notice any other issues while reading this file that are not already listed
in .claude/issues.md, add them there under the appropriate severity heading before
making any fixes.

Before starting: summarize in plain English what you are about to do and confirm with me.
```

---

## Session 14 — Images: Convert JPEGs to WebP

```
Read src/utils/index.js in full.

The following image files are raw JPEGs and have not been converted to WebP.
WebP typically achieves 25–35% smaller file sizes at equivalent visual quality:
  public/assets/images/black.jpg
  public/assets/images/blue.jpg
  public/assets/images/white.jpg
  public/assets/images/yellow.jpg
  public/assets/images/explore1.jpg
  public/assets/images/explore2.jpg

Do the following:

STEP 1 — Install sharp as a dev dependency:
  npm install --save-dev sharp

STEP 2 — Create a one-off conversion script at scripts/convert-images.js:

  import sharp from "sharp";
  import { readdirSync } from "fs";
  import { join, basename } from "path";

  const files = [
    "public/assets/images/black.jpg",
    "public/assets/images/blue.jpg",
    "public/assets/images/white.jpg",
    "public/assets/images/yellow.jpg",
    "public/assets/images/explore1.jpg",
    "public/assets/images/explore2.jpg",
  ];

  for (const file of files) {
    const out = file.replace(/\.jpe?g$/i, ".webp");
    await sharp(file).webp({ quality: 85 }).toFile(out);
    console.log(`${file} → ${out}`);
  }

STEP 3 — Run the script:
  node scripts/convert-images.js

STEP 4 — Update imports in src/utils/index.js:
Change every .jpg import that was converted to reference the .webp file instead:
  import yellow from "/assets/images/yellow.webp";
  import blue from "/assets/images/blue.webp";
  import white from "/assets/images/white.webp";
  import black from "/assets/images/black.webp";
  import explore1 from "/assets/images/explore1.webp";
  import explore2 from "/assets/images/explore2.webp";

STEP 5 — Verify the originals still exist (do not delete the .jpg files yet —
leave that for after testing confirms the WebP versions display correctly).

Run `npm run dev` and visually confirm the color swatches and explore images
still display correctly.

If you notice any other issues while reading these files that are not already
listed in .claude/issues.md, add them there under the appropriate severity heading
before making any fixes.

Before starting: summarize in plain English what you are about to do and confirm with me.
```

---

## Closing Session — Verify, mark resolved, and update docs

```
This is the final audit session. Do the following in order:

STEP 1 — Run the dev server:
  npm run dev
Confirm the page loads without console errors. Check that:
- The 3D model renders and responds to color swaps
- The video carousel plays correctly
- Scroll animations trigger at the right positions

STEP 2 — Read each file and confirm the specific fix was applied:
  src/components/VideoCarousel.jsx
    → all 4 <video> tags have preload="none"
    → no gsap.to() call exists inside any onUpdate callback
  src/components/Model.jsx
    → tl is defined as useRef(gsap.timeline())
    → Canvas has frameloop="demand", dpr={[1, 2]}, gl={{ powerPreference }}
  src/components/ModelView.jsx
    → <GsapInvalidator /> component present and rendered inside <View>
    → OrbitControls target={[0, 0, 0]} (no new THREE.Vector3)
  src/components/IPhone.jsx
    → useThree() imported and invalidate() called at end of color useEffect
    → needsUpdate = true is inside the if-block, not outside
    → .map() changed to .forEach()
  src/components/Hero.jsx
    → resize listener uses clearTimeout / setTimeout debounce (150ms)
  index.html
    → has <link rel="preload"> for scene.glb and hero.mp4
  src/components/Highlights.jsx
    → #title and .link animations use animateWithGsap or have scrollTrigger config
  src/components/Features.jsx
    → no autoPlay on <video>
  src/components/HowItWorks.jsx
    → no autoPlay on <video>; ScrollTrigger calls .play() on scroll
  src/main.jsx
    → tracesSampleRate: 0.1, replaysSessionSampleRate: 0.1
    → reactRouterV6BrowserTracingIntegration removed
  vite.config.js
    → manualChunks present for three, r3f, gsap
  src/utils/index.js
    → color variant and explore images reference .webp files

STEP 3 — Read .claude/issues.md:
For each fix confirmed in Step 2, remove that item from the issues list.
For any items added during the audit that are not yet fixed, leave them and
note them in your final report.

STEP 4 — Run the production build:
  npm run build
Confirm it succeeds. Report the chunk sizes from the build output.

STEP 5 — Final report:
List which fixes are confirmed, which are missing or need follow-up, and what
new issues (if any) were logged to .claude/issues.md during the audit that
still need a session.

Before starting: summarize in plain English what you are about to do and confirm with me.
```

---

## Ready to start

All sessions are documented. Before running Session 1, commit the current state
of the repository as a clean baseline:

```
git add CLAUDE.md ROADMAP.md .claude/
git commit -m "Add audit docs: CLAUDE.md, issues list, slash commands, and roadmap"
```

Then begin with Session 1.
