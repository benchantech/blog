export function getDatabaseClient() {
  throw new Error("Database access is not configured for the initial static build.");
}
