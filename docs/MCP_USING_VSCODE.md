Starting the shadcn MCP server from VS Code

This project includes `.vscode/mcp.json` which tells MCP-capable tools how to start the shadcn MCP server for editor integrations.

How this works
- VS Code extensions (or other MCP clients) read `.vscode/mcp.json` and will run the configured command as a subprocess when you ask the client to "start MCP server".
- The current command in `.vscode/mcp.json` runs:
  - command: `npx`
  - args: `shadcn@latest mcp`

Steps to start the server from VS Code
1. Open this workspace in VS Code.
2. Install or enable your MCP-capable extension (Copilot/VS Code MCP, Cursor, etc.).
3. Use the extension UI or command palette ("Start MCP server") that integrates with the workspace MCP config. The extension should spawn the configured command and keep it running.

If the extension does not pick up `.vscode/mcp.json` automatically
- Start the server manually in a new terminal inside the workspace:

```bash
npm run mcp:start
```

- Then use the extension to connect to the running server (it may detect it automatically).

Verify the server
- Tail the host `mcp.log` file (the tools will usually log there when started via the repo command):

```bash
tail -f mcp.log
```

- If your MCP client prints a URL or port, point your editor integration to that (host.docker.internal or localhost if started locally).

Notes
- The shadcn CLI's `mcp` subcommand is designed to be spawned by MCP clients; many editors will keep the launched process open as the MCP server's lifecycle. That is the expected flow.
- If you want a standalone, always-on server, let me know and I'll add a supervised wrapper for it (daemon) that can be started via docker-compose and exposes a known port.
