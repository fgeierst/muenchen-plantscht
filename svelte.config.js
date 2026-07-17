import adapter from "@sveltejs/adapter-cloudflare";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    // adapter-cloudflare deploys this SvelteKit app to Cloudflare Workers
    // with Workers Assets. See https://developers.cloudflare.com/workers/framework-guides/web-apps/sveltekit/
    adapter: adapter(),
  },
};

export default config;
