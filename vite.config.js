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
    rollupOptions: {
      output: {
        // Only split the EAGER vendor libs (react, gsap) into their own chunks
        // for cross-deploy caching. Deliberately do NOT name-chunk three /
        // @react-three: they're reachable only via the lazy() Model import, so
        // Vite's default splitting keeps them in async chunks that load on
        // scroll. Forcing them into named chunks pulled React / the vite-preload
        // helper into the r3f chunk, making the entry import ~335 KB of 3D code
        // eagerly and parse it before first paint.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("@gsap") || /[\\/]node_modules[\\/]gsap[\\/]/.test(id)) return "gsap";
          if (/[\\/]node_modules[\\/](react-dom|react|scheduler)[\\/]/.test(id)) return "react";
        },
      },
    },
  }
})