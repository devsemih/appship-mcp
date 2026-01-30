# appship

Appship MCP server for Claude Code - AI-powered App Store optimization.

## Installation

```bash
# 1. Login with your API key
npx appship login

# 2. Add to Claude Code
claude mcp add appship -- npx appship
```

Get your API key from [appship.dev/dashboard](https://appship.dev/dashboard)

## Commands

```bash
npx appship login   # Authenticate with API key
npx appship logout  # Remove credentials
npx appship whoami  # Show current user
```

## Available Tools

Once connected, Claude can use these tools:

| Tool | Description | Credits |
|------|-------------|---------|
| `get_user_info` | Get account info, credits, projects | 0 |
| `list_apple_apps` | List apps from App Store Connect | 0 |
| `generate_metadata` | Generate title, subtitle, description, keywords | 1 |
| `generate_whats_new` | Generate release notes | 1 |
| `generate_keywords` | Generate ASO-optimized keywords | 1 |

## Example Usage

After setup, just ask Claude:

- "Show my Appship account info"
- "List my Apple apps"
- "Generate metadata for my app called TaskMaster - a todo list app"
- "Write release notes for these changes: fixed login bug, added dark mode"

## License

MIT
