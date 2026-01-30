import * as readline from "node:readline";
import { saveCredentials } from "../lib/credentials.js";
import { validateApiKey } from "../lib/api.js";

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function loginCommand(): Promise<void> {
  console.log("\n  Appship Login\n");
  console.log("  Get your API key from: https://appship.ai/dashboard\n");

  const apiKey = await prompt("  API Key: ");

  if (!apiKey) {
    console.error("\n  Error: API key is required.\n");
    process.exit(1);
  }

  if (!apiKey.startsWith("as_live_")) {
    console.error("\n  Error: Invalid API key format. Key should start with 'as_live_'\n");
    process.exit(1);
  }

  console.log("\n  Validating...");

  const result = await validateApiKey(apiKey);

  if (!result.valid) {
    console.error("\n  Error: Invalid API key. Please check and try again.\n");
    process.exit(1);
  }

  saveCredentials({ apiKey, email: result.email });

  console.log(`\n  Success! Logged in as ${result.email || "user"}`);
  console.log("  Credentials saved to ~/.appship/credentials.json\n");
}
