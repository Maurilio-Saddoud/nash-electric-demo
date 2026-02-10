/*
  Database placeholder for Phase 2.
  - Preferred: Supabase Postgres
  - Alternative: Turso/SQLite
  Swap this file to a real DB client and keep the same route boundaries.
*/

export function getDbStatus() {
  return {
    provider: "mock",
    connected: true
  };
}

