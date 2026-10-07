import { defineConfig } from 'vitest/config';
export default defineConfig({test:{server:{deps:{inline:['@chainlink/cre-sdk']}},include:['packages/**/test/**/*.test.ts','apps/**/test/**/*.test.ts','cre/workflows/**/test/**/*.test.ts']}});
