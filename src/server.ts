import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { getApiKey } from "./lib/credentials.js";
import {
  getUserInfo,
  listAppleApps,
  generateMetadata,
  generateWhatsNew,
  generateKeywords,
  getAppVersions,
  submitMetadata,
  ApiError,
} from "./lib/api.js";

const TOOLS = [
  {
    name: "get_user_info",
    description: "Get current user info including credits, Apple connection status, and projects",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "list_apple_apps",
    description: "List all apps from connected App Store Connect account",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "generate_metadata",
    description: "Generate complete App Store metadata (title, subtitle, description, keywords) using AI. Costs 1 credit.",
    inputSchema: {
      type: "object" as const,
      properties: {
        appName: {
          type: "string",
          description: "Name of the app",
        },
        appDescription: {
          type: "string",
          description: "Brief description of what the app does",
        },
        locale: {
          type: "string",
          description: "Target locale (e.g., 'en-US', 'tr'). Defaults to 'en-US'",
        },
      },
      required: ["appName", "appDescription"],
    },
  },
  {
    name: "generate_whats_new",
    description: "Generate release notes / What's New text using AI. Costs 1 credit.",
    inputSchema: {
      type: "object" as const,
      properties: {
        appName: {
          type: "string",
          description: "Name of the app",
        },
        changes: {
          type: "string",
          description: "List of changes, bug fixes, or new features in this release",
        },
        locale: {
          type: "string",
          description: "Target locale (e.g., 'en-US', 'tr'). Defaults to 'en-US'",
        },
      },
      required: ["appName", "changes"],
    },
  },
  {
    name: "generate_keywords",
    description: "Generate optimized App Store keywords for ASO using AI. Costs 1 credit.",
    inputSchema: {
      type: "object" as const,
      properties: {
        appName: {
          type: "string",
          description: "Name of the app",
        },
        appDescription: {
          type: "string",
          description: "Brief description of what the app does",
        },
        currentKeywords: {
          type: "string",
          description: "Current keywords (optional, for optimization)",
        },
        locale: {
          type: "string",
          description: "Target locale (e.g., 'en-US', 'tr'). Defaults to 'en-US'",
        },
      },
      required: ["appName", "appDescription"],
    },
  },
  {
    name: "get_app_versions",
    description: "Get all versions of an app from App Store Connect. Shows editable (PREPARE_FOR_SUBMISSION) and live (READY_FOR_SALE) versions. Free to use.",
    inputSchema: {
      type: "object" as const,
      properties: {
        appId: {
          type: "string",
          description: "The App Store Connect app ID",
        },
      },
      required: ["appId"],
    },
  },
  {
    name: "submit_metadata",
    description: "Submit metadata to App Store Connect for a specific locale. If app is live, provide newVersionString to create a new version. Keywords should be comma-separated. Costs 1 credit.",
    inputSchema: {
      type: "object" as const,
      properties: {
        appId: {
          type: "string",
          description: "The App Store Connect app ID",
        },
        locale: {
          type: "string",
          description: "Target locale (e.g., 'en-US', 'tr-TR')",
        },
        description: {
          type: "string",
          description: "App description",
        },
        keywords: {
          type: "string",
          description: "Keywords as comma-separated string (max 100 chars total)",
        },
        promotionalText: {
          type: "string",
          description: "Promotional text (max 170 chars)",
        },
        whatsNew: {
          type: "string",
          description: "What's New / Release notes (max 4000 chars)",
        },
        newVersionString: {
          type: "string",
          description: "New version number if app is live (e.g., '1.0.1', '1.1.0', '2.0.0')",
        },
        platform: {
          type: "string",
          enum: ["IOS", "MAC_OS", "TV_OS", "VISION_OS"],
          description: "Target platform (defaults to IOS)",
        },
      },
      required: ["appId", "locale"],
    },
  },
];

export async function startServer(): Promise<void> {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.error("Error: Not authenticated.");
    console.error("Run 'npx appship login' to authenticate.");
    process.exit(1);
  }

  const server = new Server(
    {
      name: "appship",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case "get_user_info": {
          const user = await getUserInfo();
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(user, null, 2),
              },
            ],
          };
        }

        case "list_apple_apps": {
          const apps = await listAppleApps();
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(apps, null, 2),
              },
            ],
          };
        }

        case "generate_metadata": {
          const { appName, appDescription, locale } = args as {
            appName: string;
            appDescription: string;
            locale?: string;
          };
          const metadata = await generateMetadata(appName, appDescription, locale);
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(metadata, null, 2),
              },
            ],
          };
        }

        case "generate_whats_new": {
          const { appName, changes, locale } = args as {
            appName: string;
            changes: string;
            locale?: string;
          };
          const result = await generateWhatsNew(appName, changes, locale);
          return {
            content: [
              {
                type: "text" as const,
                text: result.whatsNew,
              },
            ],
          };
        }

        case "generate_keywords": {
          const { appName, appDescription, currentKeywords, locale } = args as {
            appName: string;
            appDescription: string;
            currentKeywords?: string;
            locale?: string;
          };
          const result = await generateKeywords(appName, appDescription, currentKeywords, locale);
          return {
            content: [
              {
                type: "text" as const,
                text: result.keywords,
              },
            ],
          };
        }

        case "get_app_versions": {
          const { appId } = args as { appId: string };
          const versions = await getAppVersions(appId);
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(versions, null, 2),
              },
            ],
          };
        }

        case "submit_metadata": {
          const { appId, locale, description, keywords, promotionalText, whatsNew, newVersionString, platform } = args as {
            appId: string;
            locale: string;
            description?: string;
            keywords?: string;
            promotionalText?: string;
            whatsNew?: string;
            newVersionString?: string;
            platform?: "IOS" | "MAC_OS" | "TV_OS" | "VISION_OS";
          };
          const result = await submitMetadata(appId, {
            locale,
            description,
            keywords,
            promotionalText,
            whatsNew,
            newVersionString,
            platform,
          });
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        default:
          return {
            content: [
              {
                type: "text" as const,
                text: `Unknown tool: ${name}`,
              },
            ],
            isError: true,
          };
      }
    } catch (error) {
      const message = error instanceof ApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Unknown error occurred";

      return {
        content: [
          {
            type: "text" as const,
            text: `Error: ${message}`,
          },
        ],
        isError: true,
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
