Running shadcn MCP server in Docker

This repository includes a small Docker setup to run the shadcn MCP server in a container.

Files added:
- Dockerfile - Node 20 image with shadcn CLI installed
- docker-compose.mcp.yml - docker-compose file to build and run the MCP server

Quick start (macOS with Docker Desktop):

1. Build & start with docker-compose:

```bash
docker compose -f docker-compose.mcp.yml up --build -d
```

2. Stream logs to watch startup (the container writes to `mcp.log` in the repo):

```bash
tail -f mcp.log
```

3. If the MCP server picks an ephemeral port, inspect `mcp.log` for a "listening" or "ready" message showing the port. If you need to expose that port to the host, stop the container and update `docker-compose.mcp.yml` `ports` mapping accordingly, then restart.

4. To stop and remove the container:

```bash
docker compose -f docker-compose.mcp.yml down
```

Notes:
- The Dockerfile uses Node 20 to satisfy engine warnings seen when running the CLI under Node 18.
- The container bind-mounts the repository so the MCP CLI can read `.mcp.json` and other files.
- We store `mcp.log` on the host so you can read it without `docker logs` if needed.

If you want, I can bring the container up here, capture the first 200 log lines, and confirm the MCP server is ready and reachable from the host. Say "Start it here" and I'll run it and report back.
