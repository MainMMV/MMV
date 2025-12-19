
import { defineConfig } from 'vite';

export default defineConfig({
  // Explicitly allow your Render host to prevent the "Blocked request" security error
  server: {
    allowedHosts: ["mmv9309.onrender.com"],
  },
  preview: {
    allowedHosts: ["mmv9309.onrender.com"],
  },
  // This tells Vite to look for these variables in your Render Dashboard
  // and make them available to the app code as process.env.VARIABLE_NAME
  define: {
    'process.env.AUTH_PIN': JSON.stringify(process.env.AUTH_PIN),
    'process.env.NEON_CONNECTION_STRING': JSON.stringify(process.env.NEON_CONNECTION_STRING),
  },
});
