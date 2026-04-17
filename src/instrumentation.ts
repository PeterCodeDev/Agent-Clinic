export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
      const { initBackgroundJobs } = await import('./lib/background');
      initBackgroundJobs();
  }
}
