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
