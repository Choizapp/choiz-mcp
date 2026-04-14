# Choiz Account MCP Server

MCP server for Choiz account management. Provides tools to lookup accounts, change emails, reset passwords, and enable/disable treatment subscriptions.

## Quick start (local)

```bash
npm install
npm run build
```

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "choiz-account": {
      "command": "node",
      "args": ["/Users/YOUR_USER/path/to/choiz-mcp-account/dist/index.js"],
      "env": {
        "MCP_API_KEY": "choiz-mcp-dev-2026"
      }
    }
  }
}
```

Restart Claude Code. The 6 tools are available immediately — no `npm run dev`, no manual steps.

## How it works

```
Claude Code ──stdio──→ MCP process ──admin JWT──→ login-core / choiz-core / my-account-core
                        (auto-login at startup, JWT cached + auto-refreshed)
```

- **Stdio mode** (default): Claude Code launches the process, communicates via stdin/stdout. Zero manual setup.
- **HTTP mode**: set `MCP_PORT=3100` to run as an HTTP server for deployment. API key required in `Authorization: Bearer <key>` or `x-api-key` header.
- **No Redis, no sessions, no OAuth** — stateless API key + in-memory JWT cache.

## Tools

| Tool | Description |
|---|---|
| `lookup_account` | Find an account by email or phone |
| `get_treatments` | List treatments and subscription state |
| `change_email` | Change email across all services (login, my-account, medical-form, chat, notification) |
| `reset_password` | Admin-reset a user's password |
| `enable_subscription` | Re-enable a treatment subscription |
| `disable_subscription` | Disable a treatment subscription |

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `MCP_API_KEY` | Yes | — | API key for MCP access |
| `MCP_PORT` | No | — | Set to enable HTTP mode |
| `CHOIZ_ADMIN_EMAIL` | No | `admin@choiz.com` | Admin account for backend calls |
| `CHOIZ_ADMIN_PASSWORD` | No | `admin` | Admin password |
| `LOGIN_CORE_BASE_URL` | No | dev URL | login-core-mx base URL |
| `CHOIZ_CORE_BASE_URL` | No | dev URL | choiz-core-mx base URL |
| `MY_ACCOUNT_CORE_BASE_URL` | No | dev URL | my-account-core-mx base URL |
| `*_API_KEY` | No | dev keys | Service-to-service API keys |

All backend URLs and keys default to the **dev environment**. Override for staging/prod.

## Deployment (HTTP mode)

```bash
npm run build
MCP_PORT=3100 MCP_API_KEY=your-key node dist/index.js
```

Claude Code connects with:
```json
{
  "mcpServers": {
    "choiz-account": {
      "type": "sse",
      "url": "https://your-deploy-url/mcp",
      "headers": { "Authorization": "Bearer your-key" }
    }
  }
}
```

## Development

```bash
npm run dev         # stdio mode with tsx watch
npm run build       # compile TypeScript
npm run typecheck   # type check without emitting
npm run lint        # biome linter
```
