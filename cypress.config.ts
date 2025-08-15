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
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome') {
          // Chrome stability flags to prevent crashes
          launchOptions.args.push('--disable-features=VizDisplayCompositor');
          launchOptions.args.push('--disable-gpu-sandbox');
          launchOptions.args.push('--disable-software-rasterizer');
          launchOptions.args.push('--disable-background-timer-throttling');
          launchOptions.args.push('--disable-backgrounding-occluded-windows');
          launchOptions.args.push('--disable-renderer-backgrounding');
          launchOptions.args.push('--disable-features=TranslateUI');
          launchOptions.args.push('--disable-ipc-flooding-protection');
          launchOptions.args.push('--no-sandbox');
          launchOptions.args.push('--disable-dev-shm-usage');
          return launchOptions;
        }
      });
    },
    defaultCommandTimeout: 8000,
    pageLoadTimeout: 60000,
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    retries: {
      runMode: 1,
      openMode: 0
    },
    experimentalStudio: false,
    chromeWebSecurity: false,
    experimentalMemoryManagement: true,
    numTestsKeptInMemory: 1,
    waitForAnimations: false,
    animationDistanceThreshold: 20,
    requestTimeout: 10000,
    responseTimeout: 10000,
  },
});
