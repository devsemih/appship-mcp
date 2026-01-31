# appship

Appship MCP server for Claude Code - AI-powered App Store optimization and metadata management.

## Installation

```bash
# 1. Login with your API key
npx appship login

# 2. Add to Claude Code
claude mcp add appship -- npx appship
```

Get your API key from [appship.ai/dashboard](https://appship.ai/dashboard)

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
| `get_app_versions` | Get all versions of an app (editable/live status) | 0 |
| `generate_metadata` | Generate title, subtitle, description, keywords | 1 |
| `generate_whats_new` | Generate release notes | 1 |
| `generate_keywords` | Generate ASO-optimized keywords | 1 |
| `submit_metadata` | Submit metadata directly to App Store Connect | 1 |

## Tool Details

### get_app_versions

Lists all versions of your app from App Store Connect, showing which versions are editable (PREPARE_FOR_SUBMISSION) and which are live (READY_FOR_SALE).

**Parameters:**
- `appId` (required): The App Store Connect app ID

### submit_metadata

Submits metadata directly to App Store Connect for a specific locale. Automatically handles version management.

**Parameters:**
- `appId` (required): The App Store Connect app ID
- `locale` (required): Target locale (e.g., "en-US", "tr-TR")
- `description`: App description
- `keywords`: Keywords as comma-separated string (max 100 chars)
- `promotionalText`: Promotional text (max 170 chars)
- `whatsNew`: What's New / Release notes (max 4000 chars, only for updates)
- `newVersionString`: Version number for new version (e.g., "1.0.1")
- `platform`: Target platform (IOS, MAC_OS, TV_OS, VISION_OS)

**Notes:**
- If an editable version exists, it will be used automatically
- If the app is live, provide `newVersionString` to create a new version
- `whatsNew` is only available for app updates, not initial releases

## Example Usage

After setup, just ask Claude:

**Account & Apps:**
- "Show my Appship account info"
- "List my Apple apps"
- "Show versions for my app 6746337001"

**Generate Metadata:**
- "Generate metadata for my app called TaskMaster - a todo list app"
- "Write release notes for these changes: fixed login bug, added dark mode"
- "Generate Turkish keywords for my fitness tracking app"

**Submit to App Store Connect:**
- "Submit description and keywords to App Store Connect for my app in en-US locale"
- "Update my app's promotional text on App Store Connect"
- "Create version 1.1.0 and submit metadata for my live app"

## Workflow Example

```
1. Generate metadata:
   "Generate metadata for my photo editing app called PhotoMagic"

2. Review the generated content

3. Submit to App Store Connect:
   "Submit this metadata to App Store Connect for app ID 123456 in en-US"

4. Repeat for other locales:
   "Now generate and submit Turkish metadata for the same app"
```

## License

MIT
