import{defineConfig}from'@playwright/test';
import{resolve}from'node:path';
// Explicitly selected only by the Node canary; normal test discovery excludes *.fixture.ts.
export default defineConfig({testDir:'.',testMatch:'primary-failure.fixture.ts',workers:1,retries:0,timeout:10000,reporter:'list',outputDir:resolve('.local/bm3-primary-canary',String(process.pid))});
