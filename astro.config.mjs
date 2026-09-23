// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    // site: 'https://holmanalv.github.io',
    // base:'/Holman-Portfolio',

    i18n:{
        locales: ['es', 'en'],
        defaultLocale: 'en',
        routing: {
            prefixDefaultLocale: true
        },
    },
});
