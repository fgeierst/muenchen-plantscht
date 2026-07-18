import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      // SPA fallback: a single shell HTML file is generated and the router
      // takes over in the browser. Named index.html so directory requests
      // to /mp/ resolve on a plain FTP host.
      fallback: "index.html",
    }),
    paths: {
      base: "/mp",
    },
  },
};

export default config;
