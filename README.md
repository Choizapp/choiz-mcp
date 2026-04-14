# @choizapp/mcp-account

MCP server for Choiz account management.

## Tools

| Tool | Description |
|---|---|
| `lookup_account` | Find an account by email or phone |
| `get_treatments` | List treatments and subscription state |
| `change_email` | Change email across all services |
| `reset_password` | Admin-reset a user's password |
| `enable_subscription` | Re-enable a treatment subscription |
| `disable_subscription` | Disable a treatment subscription |

## Setup

### Install

```bash
npm install @choizapp/mcp-account --registry=https://npm.pkg.github.com
```

### Configure Claude Code

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "choiz-account": {
      "command": "npx",
      "args": ["-y", "@choizapp/mcp-account"],
      "env": {
        "MCP_API_KEY": "",
        "CHOIZ_ADMIN_EMAIL": "",
        "CHOIZ_ADMIN_PASSWORD": "",
        "LOGIN_CORE_BASE_URL": "",
        "CHOIZ_CORE_BASE_URL": "",
        "MY_ACCOUNT_CORE_BASE_URL": "",
        "LOGIN_CORE_API_KEY": "",
        "CHOIZ_CORE_API_KEY": "",
        "MY_ACCOUNT_CORE_API_KEY": "",
        "CHECKOUT_API_KEY": ""
      }
    }
  }
}
```

Ask your team lead for the env values. Restart Claude Code after saving.

## Development

```bash
git clone https://github.com/Choizapp/choiz-mcp.git
cd choiz-mcp
npm install
npm run build
npm run dev       # stdio mode with tsx watch
```
