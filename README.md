[![MseeP.ai Security Assessment Badge](https://mseep.net/mseep-audited.png)](https://mseep.ai/app/kukapay-token-minter-mcp)

# Token Minter MCP

An MCP server providing tools for AI agents to mint ERC-20 tokens, supporting 21 blockchains.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)
![Status](https://img.shields.io/badge/status-active-brightgreen.svg)

## Features

- Deploy new ERC-20 tokens with customizable parameters.
- Query token metadata (name, symbol, decimals, total supply).
- Initiate token transfers (returns transaction hash without confirmation).
- Retrieve transaction details by hash.
- Check native token balance of the current account.
- Access token metadata via URI.
- Interactive prompt for deployment guidance.

### Tools

- **deployToken**: Deploys a new ERC-20 token (name, symbol, initialSupply, decimals, chainId).
- **transferToken**: Transfers ERC-20 tokens (tokenAddress, toAddress, amount, chainId).
- **getTransactionInfo**: Retrieves transaction details (txHash, chainId).
- **getTokenBalance**: Queries the balance of a specific ERC-20 token for the current account.
- **getTokenInfo**: Queries ERC-20 token metadata (tokenAddress, chainId).
- **getBalance**: Checks native token balance (chainId).

### Resources

- **tokenMetadata**: Exposes token metadata via `token://{chainId}/{address}`.

### Prompts

- **deployTokenGuide**: Guides token deployment with required parameters (chainId).

## Prerequisites

- [Node.js](https://nodejs.org/) v18.x or higher
- [npm](https://www.npmjs.com/) (typically bundled with Node.js)
- A valid [Infura API key](https://infura.io/) for EVM network access
- An Ethereum private key for signing transactions

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/kukapay/token-minter-mcp.git
   cd token-minter-mcp/server
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

## Configuration

```json
{
  "mcpServers": {
    "Token-Minter-MCP": {
      "command": "node",
      "args": ["path/to/token-minter-mcp/server/index.js"],
      "env": {
        "INFURA_KEY": "your infura key",
        "PRIVATE_KEY": "your private key"
      }
    }
  }
}
```



## Usage

1. **Examples**:

    > I want to create a new token called 'RewardToken' with the symbol 'RWD' on Arbitrum. It should have 5 million tokens in initial supply and use 6 decimal places.
    
    ```
    Token deployment initiated on Arbitrum (chainId: 42161)!
    Name: RewardToken
    Symbol: RWD
    Decimals: 6
    Initial Supply: 5000000 tokens
    Transaction Hash: 0xabc123...
    Note: Use 'getTransactionInfo' to check deployment status.
    ```

    > Can you tell me how much POL I have in my wallet on the Polygon network?

    ```
    Account Balance on Polygon (chainId: 137):
    Address: 0xYourAddressHere
    Balance: 25.3478 POL
    ```
    
    > What’s the balance of my newly created token on Polygon?
    
    ```
    Token Balance on Polygon (chainId: 137):
    Address: 0xYourAddressHere
    Token: 0xYourTokenAddressHere
    Symbol: ABCD
    Balance: 10000000.00 ABCD
    ```    

    > Please transfer 150.75 USDC from my account to 0xRecipientAddressHere on Polygon."

    ```
    Transfer initiated on Polygon (chainId: 137)!
    Token: 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
    To: 0xRecipientAddressHere
    Amount: 150.75 (150.75 tokens)
    Transaction Hash: 0xdef456...
    Note: Use 'getTransactionInfo' to check transfer status.
    ```

    > What’s the status of my token deployment transaction with hash 0xabc123... on Arbitrum?

    ```
    Transaction Info on Arbitrum (chainId: 42161):
    Hash: 0xabc123...
    From: 0xYourAddressHere
    To: Contract Creation
    Value: 0 ETH
    Status: Success
    Deployed Contract Address: 0xNewTokenAddressHere
    ```

    > Give me the details of the token at address 0xNewTokenAddressHere on Arbitrum.

    ```
    Token Info on Arbitrum (chainId: 42161):
    Address: 0xNewTokenAddressHere
    Name: RewardToken
    Symbol: RWD
    Decimals: 6
    Total Supply: 5000000
    ```

    > How do I deploy a token on Polygon? What details do I need to provide?

    ```
    To deploy a token on Polygon (chainId: 137), use the "deployToken" tool with these parameters:
    - name: The token's full name (e.g., "MyToken")
    - symbol: The token's ticker (e.g., "MTK")
    - initialSupply: Amount in token units (e.g., 1000000 for 1M tokens, default 1,000,000)
    - decimals: Optional number of decimals (default is 18)
    - chainId: Optional chain ID (default is 1 for Ethereum)
    ```

2. **Local Testing**:

    Intall dependencies:
    
    ```bash
    cd token-minter-mcp
    npm install
    ```

    Start a local Hardhat node:
    
    ```
    npx hardhat node
    ```
    
    Use chainId: 1337 in your prompts to test locally.  

## Supported Networks

| Chain ID       | Network Name | Native Token |
|----------------|--------------|--------------|
| 1              | Ethereum     | ETH          |
| 137            | Polygon      | POL          |
| 56             | BSC          | BNB          |
| 42161          | Arbitrum     | ETH          |
| 10             | Optimism     | ETH          |
| 59144          | Linea        | ETH          |
| 8453           | Base         | ETH          |
| 81457          | Blast        | ETH          |
| 11297108109    | Palm         | PALM         |
| 43114          | Avalanche    | AVAX         |
| 42220          | Celo         | CELO         |
| 324            | zkSync       | ETH          |
| 5000           | Mantle       | MNT          |
| 204            | opBNB        | BNB          |
| 534352         | Scroll       | ETH          |
| 1923           | Swellchain   | ETH          |
| 130            | Unichain     | ETH          |
| 23448594291968334 | Starknet  | ETH          |
| 80094          | Berachain    | BERA         |
| 999            | Hyperliquid  | HYPE         |
| 146            | Sonic        | S            |
| 1337           | Localhost    | ETH          |
    

## License

This project is licensed under the [MIT License](LICENSE). See the `LICENSE` file for details.

