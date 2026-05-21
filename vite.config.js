import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

function preloadCssPlugin() {
  return {
    name: 'preload-css',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html.replace(
          /(<link[^>]+rel="stylesheet"[^>]+href="([^"]+\.css)"[^>]*>)/,
          '<link rel="preload" as="style" href="$2">$1'
        );
      }
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), sentryVitePlugin({
    org: "jsm-csb",
    project: "javascript-react"
  }), preloadCssPlugin()],

  build: {
    sourcemap: true,
    modulePreload: {
      resolveDependencies(filename, deps) {
        return deps.filter(dep => !dep.includes('three') && !dep.includes('r3f'));
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
          r3f: ["@react-three/fiber", "@react-three/drei"],
          gsap: ["gsap", "@gsap/react"],
        },
      },
    },
  }
})