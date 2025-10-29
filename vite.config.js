import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
<<<<<<< HEAD:vite.config.js
  base: '/the-Farm/', 
})
=======
  optimizeDeps: {
    include: ['@reduxjs/toolkit', 'react-redux'],
  },
});
>>>>>>> 11a0331 (save changes):the-farm/vite.config.js
