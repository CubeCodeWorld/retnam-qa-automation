import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({

  testDir: './tests',

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  reporter: 'html',

  use: {

    baseURL:
      'http://localhost/cube%20code%20world_project/retnam/',

    trace: 'on-first-retry',
  },

  projects: [

    // Login sekali dan simpan session admin
    {
  name: 'setup',
  testMatch: /.*\.setup\.ts/,
  use: {
    headless: false,
  },
},

    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'auth/admin.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'auth/admin.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: 'auth/admin.json',
      },
      dependencies: ['setup'],
    },

  ],

});