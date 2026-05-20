# Code Patterns, Debugging & Reference

---

## Code Patterns to Enforce

### DO — R3F Canvas with correct performance props
```jsx
<Canvas
  frameloop="demand"
  dpr={[1, 2]}
  gl={{ powerPreference: "high-performance", antialias: window.devicePixelRatio < 2 }}
  shadows
  eventSource={document.getElementById("root")}
>
  <View.Port />
</Canvas>
```

### DO — Invalidate on demand (R3F dirty-flag equivalent)
```jsx
// Inside any R3F child component:
const { invalidate } = useThree();
// Call after any state change that visually affects the scene:
invalidate();
```

### DO — GSAP timeline in a ref, not component body
```js
// ✅ Correct:
const tl = useRef(gsap.timeline());

// ❌ Never in component body — re-created every render → memory leak:
const tl = gsap.timeline();
```

### DO — Fix GSAP tween storm (VideoCarousel progress bar)
```js
// ❌ Current — spawns a new tween every frame inside onUpdate:
onUpdate: () => {
  gsap.to(span[videoId], { width: `${progress}%` });
}

// ✅ Mutate the style property directly:
onUpdate: () => {
  if (span[videoId]) span[videoId].style.width = `${progress}%`;
  if (videoDivRef.current[videoId]) {
    const w = window.innerWidth < 1200 ? "10vw" : "4vw";
    videoDivRef.current[videoId].style.width = w;
  }
}
```

### DO — Debounced resize handler
```js
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(handleVideoSrcSet, 150);
});
```

### DO — Stable Three.js values in JSX
```jsx
// ❌ Allocates a new Vector3 every render:
<OrbitControls target={new THREE.Vector3(0, 0, 0)} />

// ✅ Drei accepts arrays; no allocation:
<OrbitControls target={[0, 0, 0]} />
```

### DO — Scoped material updates (IPhone.jsx)
```js
// These material keys are the ones that should NOT get the body color —
// they are screen, glass, and logo surfaces.
const SKIP_COLOR = new Set([
  "zFdeDaGNRwzccye",
  "ujsvqBWRMnqdwPx",
  "hUlRcbieVuIiOXG",
  "jlzuBkUzuJqgiAK",
  "xNrofRCqOXXHVZt",
]);

Object.entries(materials).forEach(([key, mat]) => {
  if (!SKIP_COLOR.has(key)) {
    mat.color.set(props.item.color[0]);
    mat.needsUpdate = true;
  }
});
```

### DO — GSAP ScrollTrigger on section headings
```js
// ❌ Current Highlights.jsx — fires on mount, ignores scroll position:
gsap.to("#title", { opacity: 1, y: 0 });

// ✅ Fires when the element scrolls into view:
gsap.to("#title", {
  opacity: 1,
  y: 0,
  scrollTrigger: {
    trigger: "#title",
    start: "top 85%",
    toggleActions: "restart reverse restart reverse",
  },
});
```

### DO — Video play triggered by scroll, not autoPlay
```jsx
// ❌ Current — autoPlay + preload="none" conflict:
<video autoPlay preload="none" ref={videoRef}>

// ✅ Remove autoPlay; call .play() from ScrollTrigger:
<video preload="none" muted playsInline ref={videoRef}>
// In useGSAP:
gsap.to("#exploreVideo", {
  scrollTrigger: {
    trigger: "#exploreVideo",
    toggleActions: "play pause reverse restart",
    start: "-10% bottom",
    onEnter: () => videoRef.current.play(),
    onLeaveBack: () => videoRef.current.pause(),
  },
});
```

### DO — Vite manual chunk splitting
```js
// vite.config.js
build: {
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
```

---

## Debugging Performance

```jsx
// Drop inside a <View> in ModelView.jsx during dev only.
// Remove before committing.
import { useThree } from "@react-three/fiber";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { useEffect } from "react";

function DebugStats() {
  const { gl } = useThree();
  useEffect(() => {
    const stats = new Stats();
    document.body.appendChild(stats.dom);
    const id = setInterval(() => {
      console.table(gl.info.render);  // draw calls, triangles, points
      console.table(gl.info.memory);  // geometries, textures
    }, 5000);
    return () => { clearInterval(id); document.body.removeChild(stats.dom); };
  }, [gl]);
  return null;
}
```

---

## Performance Budgets

| Metric | Target |
|---|---|
| Initial JS bundle | < 200 KB gzipped |
| Primary model (scene.glb) | < 3 MB |
| Total texture memory | < 50 MB GPU |
| Time to interactive (desktop) | < 3s on fast 3G |
| Steady-state FPS | 60fps desktop / 30fps mobile |
| Draw calls per frame | < 50 |
| `gl.info.memory.geometries` | < 20 after full load |

---

## Development Commands

```bash
npm run dev          # Dev server with HMR
npm run build        # Production build
npm run preview      # Preview production build

# Check/compress GLB with Draco:
npx gltf-pipeline -i public/models/scene.glb -o public/models/scene.glb --draco.compressionLevel 10

# Inspect GLB metadata:
npx gltf-pipeline -i public/models/scene.glb --stats
```
