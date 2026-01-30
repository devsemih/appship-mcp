import { getApiKey } from "./credentials.js";

const API_BASE_URL = process.env.APPSHIP_API_URL || "https://appship.up.railway.app/api";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface UserInfo {
  email: string;
  credits: number;
  hasAppleCredentials: boolean;
  projects: Array<{
    id: string;
    name: string;
    bundleId?: string;
  }>;
}

export interface AppleApp {
  id: string;
  name: string;
  bundleId: string;
  sku?: string;
}

export interface GeneratedMetadata {
  title: string;
  subtitle: string;
  description: string;
  keywords: string;
  whatsNew?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new ApiError(401, "Not authenticated. Run 'npx appship login' first.");
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText })) as { error?: string };
    throw new ApiError(response.status, errorData.error || response.statusText);
  }

  return response.json() as Promise<T>;
}

export async function getUserInfo(): Promise<UserInfo> {
  return request<UserInfo>("/user/me");
}

export async function validateApiKey(apiKey: string): Promise<{ valid: boolean; email?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/user/me`, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
    });

    if (response.ok) {
      const data = await response.json() as { email: string };
      return { valid: true, email: data.email };
    }
    return { valid: false };
  } catch {
    return { valid: false };
  }
}

export async function listAppleApps(): Promise<AppleApp[]> {
  const response = await request<{ apps: AppleApp[] }>("/projects/apple-apps");
  return response.apps;
}

export async function generateMetadata(
  appName: string,
  appDescription: string,
  locale?: string
): Promise<GeneratedMetadata> {
  return request<GeneratedMetadata>("/generate/metadata", {
    method: "POST",
    body: JSON.stringify({ appName, appDescription, locale }),
  });
}

export async function generateWhatsNew(
  appName: string,
  changes: string,
  locale?: string
): Promise<{ whatsNew: string }> {
  return request<{ whatsNew: string }>("/generate/whats-new", {
    method: "POST",
    body: JSON.stringify({ appName, changes, locale }),
  });
}

export async function generateKeywords(
  appName: string,
  appDescription: string,
  currentKeywords?: string,
  locale?: string
): Promise<{ keywords: string }> {
  return request<{ keywords: string }>("/generate/keywords", {
    method: "POST",
    body: JSON.stringify({ appName, appDescription, currentKeywords, locale }),
  });
}
