import { deleteCredentials, getCredentials } from "../lib/credentials.js";

export async function logoutCommand(): Promise<void> {
  const creds = getCredentials();

  if (!creds) {
    console.log("\n  You are not logged in.\n");
    return;
  }

  const deleted = deleteCredentials();

  if (deleted) {
    console.log("\n  Logged out successfully.");
    console.log("  Credentials removed from ~/.appship/credentials.json\n");
  } else {
    console.error("\n  Error: Failed to remove credentials.\n");
    process.exit(1);
  }
}
