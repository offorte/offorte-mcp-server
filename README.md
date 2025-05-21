# Offorte MCP Server

MCP server for the Offorte API - Create & send proposals using AI.
For more information about the protocol, check [https://modelcontextprotocol.io/](https://modelcontextprotocol.io/).
Check [Offorte](https://www.offorte.com) for more info about the proposal software.

**Early technology**
Please note that MCP (Model Context Protocol) is a relatively new approach to AI integration.
While powerful, it's still evolving and may occasionally produce unexpected or undesired results.

## Goal & coverage

The goal of this project is too create & send proposals using AI via the protocol.
Because of the experimental character, the full Offorte API is not covered and have limited the implementation to get, create & send proposal related tools.
Tools which could lead to an LLM updating and deleting stuff are not yet implemented.
Update and delete commands might be added in the future, based on reallife results & user feedback.

## Offorte API

The MCP server is using the Offorte Public API v2
Checkout the [documentation](https://www.offorte.com/api-docs/) for more information.

## MCP Server Configuration

```json
{
	"mcpServers": {
		"offorte": {
			"command": "node",
			"args": ["/path/to/directory/offorte-mcp-server/dist/server.js"],
			"env": {
				"OFFORTE_ACCOUNT_NAME": "youraccountname",
				"OFFORTE_API_KEY": "xxx"
			}
		}
	}
}
```

## Development

To get started, clone the repository and install the dependencies.
Make sure you have an .env file and it includes the proper values.

```bash
git clone https://github.com/offorte/offorte-mcp-server.git
cd offorte-mcp-server
pnpm install
pnpm dev
```

### Commands

Check the NPM scripts for all commands, below is a short summary of the most important onces.

| Script         | Info                                         |
| -------------- | -------------------------------------------- |
| `pnpm build`   | Build the project for production             |
| `pnpm start`   | Start the production server                  |
| `pnpm dev`     | Start the development server with hot reload |
| `pnpm inspect` | Inspect the server configuration             |
| `pnpm lint`    | Run linting checks                           |
| `pnpm format`  | Format code using Prettier and ESLint        |
