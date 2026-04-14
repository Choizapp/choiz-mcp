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

## Install

Add to Claude Desktop or Claude Code. See the [setup guide on Notion](https://www.notion.so/choiz-latam/choiz-account-3429ca25ffdb80b5ae0eea61764246d4).

## Development

```bash
git clone https://github.com/Choizapp/choiz-mcp.git
cd choiz-mcp
npm install
npm run build
npm run dev
```
