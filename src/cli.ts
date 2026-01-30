#!/usr/bin/env node

import { Command } from "commander";
import { loginCommand } from "./commands/login.js";
import { logoutCommand } from "./commands/logout.js";
import { whoamiCommand } from "./commands/whoami.js";
import { startServer } from "./server.js";

const program = new Command();

program
  .name("appship-mcp")
  .description("Appship MCP server for Claude Code")
  .version("1.0.0");

program
  .command("login")
  .description("Authenticate with your Appship API key")
  .action(loginCommand);

program
  .command("logout")
  .description("Remove stored credentials")
  .action(logoutCommand);

program
  .command("whoami")
  .description("Show current authenticated user")
  .action(whoamiCommand);

program
  .command("serve", { isDefault: true, hidden: true })
  .description("Start MCP server (used by Claude)")
  .action(startServer);

program.parse();
