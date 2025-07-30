import { defineConfig } from "cypress";

export default defineConfig({
  env: {
    SUPABASE_URL: 'https://blssdohlfcmyhxtpalcf.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsc3Nkb2hsZmNteWh4dHBhbGNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzY2MDUsImV4cCI6MjA2OTMxMjYwNX0.9rdfNgKhcTcru1KpBPUFCLNcxgc3aasQq7WT-9hAPvM',
  },
  e2e: {
    baseUrl: 'http://localhost:3001',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 120000,
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
  },
});
