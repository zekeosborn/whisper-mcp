# Whisper MCP
An MCP (Model Context Protocol) that allows you to whisper (send message as NFT) to any Monad testnet address.

![Built on Monad Badge](https://cdn.osbrn.xyz/built-on-monad-badge.png)

## Supported Tools

| Tool Name    | Description                                               | Prompt Example                                                                                                                                              |
|--------------|-----------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `whisper`    | Whisper (send message as NFT) to any Monad testnet address. | `whisper` lovely quotes to `<address>` using purple theme. <br><br> `whisper` "Hey, how's it going?" to `<address>` using purple background and white text. |

## Requirements
- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/en/download)
- [Claude Desktop](https://claude.ai/download)

## Getting Started

1. Clone this repository

```
git clone https://github.com/zekeosborn/whisper-mcp.git
```

2. Install dependencies

```
npm install
```

## Build the Project

```
npm run build
```

## Add the MCP server to Claude Desktop

1. Open "Claude Desktop"
2. Open Settings (Claude > Settings > Developer)
3. Click Edit Config and open `claude_desktop_config.json`
4. Add details about the MCP server and save the file

```
{
  "mcpServers": {
    "whisper-mcp": {
      "command": "node",
      "args": [
        "<absolute-path-to-project>/packages/mcp/build/index.js"
      ],
      "env": {
        "WHISPER_API_URL": "https://whisper.zekeosborn.xyz",
        "NFT_CONTRACT_ADDRESS": "0x510b63E0436263daE3859c2daFACEDC614f5E857",
        "PRIVATE_KEY": "",
        "RPC_URL": ""
      }
    }
  }
}
```

Add your private key (with the 0x prefix).  
You can also add your own RPC, or leave it empty to use the default RPC.

5. Restart "Claude Desktop"
