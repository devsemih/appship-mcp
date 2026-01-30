import { getCredentials, getApiKey } from "../lib/credentials.js";
import { getUserInfo } from "../lib/api.js";

export async function whoamiCommand(): Promise<void> {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.log("\n  Not logged in.");
    console.log("  Run 'npx appship login' to authenticate.\n");
    return;
  }

  const creds = getCredentials();
  const source = process.env.APPSHIP_API_KEY ? "environment variable" : "credentials file";

  try {
    const user = await getUserInfo();
    console.log("\n  Appship Account\n");
    console.log(`  Email:   ${user.email}`);
    console.log(`  Credits: ${user.credits}`);
    console.log(`  Apple:   ${user.hasAppleCredentials ? "Connected" : "Not connected"}`);
    console.log(`  Source:  ${source}\n`);
  } catch (error) {
    if (creds?.email) {
      console.log(`\n  Logged in as: ${creds.email}`);
      console.log(`  Source: ${source}`);
      console.log("  (Could not fetch account details)\n");
    } else {
      console.error("\n  Error: Could not verify credentials.\n");
      process.exit(1);
    }
  }
}
