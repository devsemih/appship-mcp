import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface Credentials {
  apiKey: string;
  email?: string;
}

const APPSHIP_DIR = join(homedir(), ".appship");
const CREDENTIALS_FILE = join(APPSHIP_DIR, "credentials.json");

function ensureDir(): void {
  if (!existsSync(APPSHIP_DIR)) {
    mkdirSync(APPSHIP_DIR, { recursive: true, mode: 0o700 });
  }
}

export function getCredentials(): Credentials | null {
  try {
    if (!existsSync(CREDENTIALS_FILE)) {
      return null;
    }
    const content = readFileSync(CREDENTIALS_FILE, "utf-8");
    return JSON.parse(content) as Credentials;
  } catch {
    return null;
  }
}

export function saveCredentials(credentials: Credentials): void {
  ensureDir();
  writeFileSync(CREDENTIALS_FILE, JSON.stringify(credentials, null, 2), {
    mode: 0o600,
  });
}

export function deleteCredentials(): boolean {
  try {
    if (existsSync(CREDENTIALS_FILE)) {
      unlinkSync(CREDENTIALS_FILE);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function getApiKey(): string | null {
  // First check environment variable
  const envKey = process.env.APPSHIP_API_KEY;
  if (envKey) {
    return envKey;
  }

  // Then check credentials file
  const creds = getCredentials();
  return creds?.apiKey ?? null;
}
