# Offorte MCP Server <!-- omit in toc -->

MCP server for Offorte - Create & send proposals using AI.

This server acts as the bridge between AI agents and Offorte's proposal engine.
It enables external models to create and send proposals via Offorte.
Built for automation workflows, the [MCP](https://modelcontextprotocol.io/) makes it easy to integrate proposal actions into AI tools, chat interfaces, and autonomous systems.

> **Early technology**
> Please note that MCP (Model Context Protocol) is a new approach to AI integration.
> While powerful, it's still evolving and may occasionally produce unexpected or undesired results.

## Table of Contents <!-- omit in toc -->

- [About Offorte](#about-offorte)
- [Goals \& Coverage](#goals--coverage)
- [Prerequisites](#prerequisites)
- [Available Tools](#available-tools)
- [MCP Clients](#mcp-clients)
- [Running over HTTP](#running-over-http)
- [Development](#development)

## About Offorte

Offorte is automated proposal software which helps businesses create, send, and track beautiful interactive proposals.
Built for speed, flexibility, and real-world use, it combines automation and smart workflows without sacrificing the personal touch.
[Learn more about Offorte](https://www.offorte.com).

### API <!-- omit in toc -->

The MCP server is using the Offorte Public API v2.
Read the [API documentation](https://www.offorte.com/api-docs/) for more information.

### Demo <!-- omit in toc -->

Experience the future of proposals: voice-triggered, AI-powered, fully automated.
See how Offorte connects voice and workflow in [this real demo](https://www.offorte.com/en/blog/proposal-software/handsfree-proposal-sending-with-mcp).

## Goals & Coverage

The goal of this project is too create & send proposals using AI via the protocol.
Because of the experimental character, the full Offorte API is not covered.
The tools cover the proposal workflow: list, create, copy, change, send and delete proposals, add people to organisations, fix contact details, and keep the product catalog current.
The only delete tool is `delete_proposal`, which moves a proposal to the trashcan. Contacts, contact people, products and product directories cannot be deleted.
`update_proposal_status` does not change the status of a won proposal, because that deletes its approval data for good.
Webhook tools are not implemented.
More tools might be added in the future, based on reallife results & user feedback.

## Prerequisites

- Node.js `24.x` LTS (`>=24`, see `.nvmrc`)
- Offorte API Key (see [Authentication Section](https://www.offorte.com/api-docs/authentication#api-keys) of the Offorte API Docs)
    - The server calls the Offorte API gateway at `https://gateway.offorte.com/api/v2/` and sends the key as `Authorization: Bearer <key>`.
    - The gateway needs a V2 API key (it starts with `ofk_`). An account administrator creates it on the Integrations and API settings page in Offorte. Older API keys do not work on the gateway.
    - Still on an older key? Pin the last version before the gateway (`npx -y @offorte/mcp-server@0`) until you have a V2 key.
- PNPM for development
- `TRANSPORT_TYPE` (optional): `stdio` (default) or `httpStream`. See [Running over HTTP](#running-over-http).

## Available Tools

### Context & Setup <!-- omit in toc -->

- **get_initial_context** – **IMPORTANT:** Must be called before using any other tools to initialize context and get usage instructions. Over stdio, other tools fail until it has run. Over HTTP, the server asks the agent to call it first, but does not block other tools

### Account <!-- omit in toc -->

- **get_users** – Lists all account users for the current account

### Automations <!-- omit in toc -->

- **get_automation_sets** – Lists automation sets which are used as an optional input to create a new proposal

### Contacts <!-- omit in toc -->

- **create_contact** – Create a new contact (organisation or person/individual)
- **create_contact_person** – Add a new person to an existing organisation
- **get_contact_details** - Get all details for a contact by id
- **search_contact_organisations** - Search for organisations by name in the contacts
- **search_contact_people** - Search for people by name in the contacts
- **update_contact** – Change an organisation or a person contact. Only the sent fields change
- **update_contact_person** – Change a person of an organisation. Only the sent fields change

### Favorites <!-- omit in toc -->

- **get_proposal_templates** – Lists proposal templates which are used as starting points to create new proposals

### Proposals <!-- omit in toc -->

- **copy_proposal** – Copy a proposal into a new proposal with status edit and a new link
- **create_proposal** – Create a new proposal, optionally with an automation set, a directory and tags
- **delete_proposal** – Move a proposal to the trashcan. A user can restore it in Offorte
- **get_proposal_details** – Get all details for a proposal by id, including its price tables with their Unique IDs and rows
- **get_proposal_directories** – Get all proposal directories grouped by status
- **list_proposals** – List proposals by status, optionally of one directory, 50 per page
- **search_proposals** – Search for proposals by query
- **send_proposal** – Send a proposal to its assigned contacts
- **update_proposal** – Change proposal details: name, user, contact and receivers, tags, custom fields, manual total, design or text template. Only the sent fields change
- **update_proposal_pricetables** – Replace all rows of the named price tables in a proposal. Tables need a Unique ID. A Unique ID is text: copy it exactly from the price table settings, including any leading zeroes (`001` is not `1`), and never guess or normalize it. Won and lost proposals cannot be updated
- **update_proposal_status** – Change the status of a proposal. Won, lost and closed can run automations. A won proposal cannot change status with this tool

### Products <!-- omit in toc -->

- **create_product** – Add a product to the product catalog
- **create_product_directory** – Create a product directory
- **get_product_directories** – Lists the product directories
- **get_products** – Lists the products of one product directory
- **update_product** – Replace all values of a product. Send every field, also the ones that do not change
- **update_product_directory** – Rename a product directory

### Settings <!-- omit in toc -->

- **get_design_templates** – Lists available design templates which are used to create new proposals
- **get_email_templates** – Lists available email templates which are used to send proposals
- **get_tags** – Lists the existing tags
- **get_text_templates** – Lists available language text templates which are used to create new proposals
- **get_vat_groups** – Lists the VAT groups which are used for products

## MCP Clients

Currently, this MCP server has only been tested with Claude Desktop.
More client examples will be added in the future.

### Claude Desktop Configuration <!-- omit in toc -->

Find your `claude_desktop_config.json` at `Claude > Settings > Developer > Edit Config` and depending on which option you'd like, add **JUST ONE** of the following:

#### NPX <!-- omit in toc -->

Running it straight from the npm registry.

```json
{
	"mcpServers": {
		"offorte-proposals": {
			"command": "npx",
			"args": ["-y", "@offorte/mcp-server"],
			"env": {
				"OFFORTE_ACCOUNT_NAME": "<YOUR_ACCOUNT_NAME>",
				"OFFORTE_API_KEY": "<YOUR_TOKEN>"
			}
		}
	}
}
```

#### Local Node <!-- omit in toc -->

Dependencies should have been installed & the project is build before you use this method (`pnpm install`).

```json
{
	"mcpServers": {
		"offorte-proposals": {
			"command": "node",
			"args": ["/path/to/directory/offorte-mcp-server/dist/server.js"],
			"env": {
				"OFFORTE_ACCOUNT_NAME": "<YOUR_ACCOUNT_NAME>",
				"OFFORTE_API_KEY": "<YOUR_TOKEN>"
			}
		}
	}
}
```

## Running over HTTP

Set `TRANSPORT_TYPE=httpStream` to serve MCP over Streamable HTTP at `/mcp`.
The endpoint serves clients on protocol revisions `2026-07-28` and `2025-11-25`. It keeps no sessions, so a load balancer can send any request to any instance.

| Variable        | Default     | Info                                                                                     |
| --------------- | ----------- | ---------------------------------------------------------------------------------------- |
| `HOST`          | `localhost` | The listen address. Use `0.0.0.0` in a container                                         |
| `PORT`          | `3000`      | The listen port                                                                          |
| `ALLOWED_HOSTS` | none        | Comma-separated host names. When set, a request to `/mcp` with another `Host` gets `403` |

The server answers browser pages from `localhost` only. On a `localhost` address, a request to `/mcp` from any other page gets `403`.
`GET /health` answers `200` while the process runs. `GET /ready` answers `503` from the start of a shutdown.
On `SIGTERM`, the server keeps serving for 5 seconds, then stops taking connections and waits at most 30 seconds for running requests. Give the container a stop grace period of at least 40 seconds.

### Credentials <!-- omit in toc -->

- **One account:** set `OFFORTE_ACCOUNT_NAME` and `OFFORTE_API_KEY`. Every request uses this account. Anyone who can reach the port acts as this account, so do not expose the port. A request with an `X-Offorte-Account` header gets `400`.
- **Credentials per request:** set neither variable. Every request to `/mcp` must send `Authorization: Bearer ofk_<key>` and `X-Offorte-Account: <account name>`. A request without both gets `401`. The server uses the key only for that request and keeps no data between requests.

### Upgrading from 2.x <!-- omit in toc -->

All modes:

- Invalid tool input now gives a tool result with `isError: true`. Its text starts with `Input validation error: Invalid arguments for tool`. 2.x answered with JSON-RPC error `-32602`.
- An unknown tool now gives JSON-RPC error `-32602`. 2.x gave `-32601`.
- When the Offorte API answers in an unexpected format, the error text keeps its first part. The list of problems after it now uses Zod 4 wording.
- An Offorte API call stops after 30 seconds. After a write times out, the tool says that the change may have been saved.
- A call that the Offorte API rate-limits (status `429`) now says to wait and to run calls one after the other. 2.x gave `Request failed: Request failed with status code 429`.
- `get_initial_context` now sends the full account context. 2.x cut off the start of the account name and date labels, and the `<context>` tags.

HTTP mode:

- The legacy SSE endpoint `/sse` is gone. Point your client at `/mcp`. `TRANSPORT_TYPE=sse` still starts the HTTP mode.
- `FASTMCP_HOST` and other `FASTMCP_*` variables are not read. Use `HOST` and `PORT`.
- `/ready` answers `200` while the server takes requests. It no longer waits for a first session.
- Browser pages from other sites no longer get CORS headers, on any address. 2.x sent `Access-Control-Allow-Origin: *` to every page.
- On a `localhost` address, a request to `/mcp` from a page on another site now gets `403`. 2.x answered it.
- Only `localhost`, `127.0.0.1`, and `[::1]` count as local origins. A page on a name such as `app.localhost` or on another `127.x.x.x` address also gets `403` from a local server.

## Development

To get started, clone the repository and install the dependencies.
Make sure you have an .env file and it includes the proper values.

```bash
git clone https://github.com/offorte/offorte-mcp-server.git
cd offorte-mcp-server
pnpm install
pnpm dev
```

### Commands <!-- omit in toc -->

Check the NPM scripts for all commands, below is a short summary of the most important onces.

| Script         | Info                                  |
| -------------- | ------------------------------------- |
| `pnpm build`   | Build the project for production      |
| `pnpm start`   | Start the production server           |
| `pnpm dev`     | Start the development server          |
| `pnpm inspect` | Inspect the server                    |
| `pnpm test`    | Build, then run the contract tests    |
| `pnpm lint`    | Check formatting, lint, and types     |
| `pnpm format`  | Format code using Prettier and ESLint |

`pnpm dev` opens the MCP Inspector in the terminal, and `pnpm inspect` opens it in the browser. Both run the source and need Node.js `24.22.1` or newer.
The contract tests compare every tool with values recorded from the FastMCP version (commit `4037cda`) in `test/contract/baseline.json`. Later changes to tool descriptions and to the `get_initial_context` text are made in that file on purpose.
`node --expose-gc --import tsx test/memory-check.ts` checks that HTTP mode does not grow its memory per request.
