import { defineConfig } from 'astro/config';
// import tailwind from '@astrojs/tailwind';

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: 'https://drozdovdn.github.io',
  // base: 'drozdovdn.github.io',
  integrations: [ react()],

});