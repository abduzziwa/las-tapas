/**
 * Next.js instrumentation hook — runs once when the server process starts.
 * Checks whether the database is empty and seeds it with initial data if so.
 * This makes the app fully self-bootstrapping: spin up the Docker stack and
 * everything is ready with no manual steps.
 */
export async function register() {
  // Only run in the Node.js runtime (not the Edge runtime)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { ensureDatabaseSeeded } = await import('./lib/ensure-seed');
    await ensureDatabaseSeeded();
  }
}
