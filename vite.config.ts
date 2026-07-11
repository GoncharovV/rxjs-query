/// <reference types="vitest/config" />
// import * as path from 'path';

import { defineConfig } from 'vite';


export default defineConfig({
  // plugins: [react()],
  root: 'preview',

  test: {
    root: 'src',
    globals: true,
  },
});
