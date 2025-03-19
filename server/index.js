const { McpServer, ResourceTemplate } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const { ethers } = require("ethers");
const dotenv = require("dotenv");
const artifact = require('../artifacts/contracts/SimpleERC20.sol/SimpleERC20.json')

// Load environment variables from .env file
dotenv.config();

// ERC-20 Token ABI & Bytecode
const ERC20_ABI = artifact.abi
const ERC20_BYTECODE = artifact.bytecode

// Chain configuration map using chainId as key
const INFURA_KEY = process.env.INFURA_KEY
const CHAIN_CONFIG = {
  1: { name: "Ethereum", currency: "ETH", rpcUrl: `https://mainnet.infura.io/v3/${INFURA_KEY}` },
  137: { name: "Polygon", currency: "POL", rpcUrl: `https://polygon-mainnet.infura.io/v3/${INFURA_KEY}` },
  56: { name: "BSC", currency: "BNB", rpcUrl: `https://bsc-mainnet.infura.io/v3/${INFURA_KEY}` },
  42161: { name: "Arbitrum", currency: "ETH", rpcUrl: `https://arbitrum-mainnet.infura.io/v3/${INFURA_KEY}` },
  10: { name: "Optimism", currency: "ETH", rpcUrl: `https://optimism-mainnet.infura.io/v3/${INFURA_KEY}` },
  59144: { name: "Linea", currency: "ETH", rpcUrl: `https://linea-mainnet.infura.io/v3/${INFURA_KEY}` },
  8453: { name: "Base", currency: "ETH", rpcUrl: `https://base-mainnet.infura.io/v3/${INFURA_KEY}` },
  81457: { name: "Blast", currency: "ETH", rpcUrl: `https://blast-mainnet.infura.io/v3/${INFURA_KEY}` },
  11297108109: { name: "Palm", currency: "PALM", rpcUrl: `https://palm-mainnet.infura.io/v3/${INFURA_KEY}` },
  43114: { name: "Avalanche", currency: "AVAX", rpcUrl: `https://avalanche-mainnet.infura.io/v3/${INFURA_KEY}` },
  42220: { name: "Celo", currency: "CELO", rpcUrl: `https://celo-mainnet.infura.io/v3/${INFURA_KEY}` },
  324: { name: "ZkSync", currency: "ETH", rpcUrl: `https://zksync-mainnet.infura.io/v3/${INFURA_KEY}` },
  5000: { name: "Mantle", currency: "MNT", rpcUrl: `https://mantle-mainnet.infura.io/v3/${INFURA_KEY}` },
  204: { name: "opBNB", currency: "BNB", rpcUrl: `https://opbnb-mainnet.infura.io/v3/${INFURA_KEY}` },
  534352: { name: "Scroll", currency: "ETH", rpcUrl: `https://scroll-mainnet.infura.io/v3/${INFURA_KEY}` },
  1923: { name: "Swellchain", currency: "ETH", rpcUrl: `https://swellchain-mainnet.infura.io/v3/${INFURA_KEY}` },
  130: { name: "Unichain", currency: "ETH", rpcUrl: `https://unichain-mainnet.infura.io/v3/${INFURA_KEY}` },
  23448594291968334: { name: "Starknet", currency: "ETH", rpcUrl: `https://starknet-mainnet.infura.io/v3/${INFURA_KEY}`},
  80094: { name: "Berachain", currency: "BERA", rpcUrl: `https://rpc.berachain.com/`},
  999: { name: "Hyperliquid", currency: "HYPE", rpcUrl: `https://rpc.hyperliquid.xyz/evm`},
  146: { name: "Sonic", currency: "S", rpcUrl: `https://rpc.soniclabs.com`},
  1337: { name: "Localhost", currency: "ETH", rpcUrl: `http://127.0.0.1:8545` }  
};
const CHAIN_LIST = Object.entries(CHAIN_CONFIG).map(e => `${e[0]}: ${e[1].name}`)

// Load and validate private key
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY environment variable is required");
}

// Function to get provider based on chainId
function getProvider(chainId) {
  const config = CHAIN_CONFIG[chainId];
  if (!config) {
    throw new Error(`Unsupported chainId: ${chainId}. Supported chainIds: ${CONFIG_LIST.join("\n")}`);
  }
  return new ethers.JsonRpcProvider(config.rpcUrl);
}

// Function to get provider and signer based on chainId
function getProviderAndSigner(chainId) {
  const provider = getProvider(chainId);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  return { provider, signer };
}

// Create MCP server
const server = new McpServer({
  name: "token-minter-mcp",
  version: "1.0.0",
});

// Tool to deploy a new ERC-20 token with decimals and default initialSupply
server.tool(
  "deployToken",
  "Deploys a new ERC-20 token on the specified EVM-compatible chain with customizable decimals and initial supply. Returns the transaction hash without waiting for confirmation.",
  {
    name: z.string().min(1).max(32).describe("Token name"),
    symbol: z.string().min(1).max(10).describe("Token symbol"),
    initialSupply: z.number().positive().optional().default(1000000).describe("Initial supply in token units (will be multiplied by 10^decimals, default 1,000,000)"),
    decimals: z.number().min(0).max(18).optional().default(18).describe("Number of decimal places (0-18, default 18)"),
    chainId: z.number().optional().default(1).describe("Target chain ID (e.g., 1 for Ethereum, 137 for Polygon)")
  },
  async ({ name, symbol, initialSupply, decimals, chainId }) => {
    try {
      const { signer, provider } = getProviderAndSigner(chainId);
      
      const balance = await provider.getBalance(signer.address);      
      const chainName = CHAIN_CONFIG[chainId]?.name || `chain-${chainId}`;
      const currency = CHAIN_CONFIG[chainId]?.currency || "native token";
      if(balance === BigInt(0)){
        throw new Error(`Insufficient ${currency} balance on ${chainName} (chainId: ${chainId})!\nAddress: ${address}\nBalance: 0 ${currency}\nPlease deposit some ${currency} to your account to cover gas fees for deployment.`)
      }      
      
      const factory = new ethers.ContractFactory(ERC20_ABI, ERC20_BYTECODE, signer);
      const contract = await factory.deploy(name, symbol, initialSupply, decimals);
      const txHash = contract.deploymentTransaction()?.hash;

      return {
        content: [{
          type: "text",
          text: `Token deployment initiated on ${chainName} (chainId: ${chainId})!\nName: ${name}\nSymbol: ${symbol}\nDecimals: ${decimals}\nInitial Supply: ${initialSupply} tokens)\nTransaction Hash: ${txHash}\nNote: Use 'getTransactionInfo' to check deployment status.`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error initiating token deployment on chainId ${chainId}: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// Tool to query token information
server.tool(
  "getTokenInfo",
  "Queries information about an existing ERC-20 token, including name, symbol, decimals, and total supply.",
  {
    tokenAddress: z.string().describe("Token contract address"),
    chainId: z.number().optional().default(1).describe("Chain ID (e.g., 1 for Ethereum, 137 for Polygon)")
  },
  async ({ tokenAddress, chainId }) => {
    try {
      const provider = getProvider(chainId);
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply()
      ]);
      const chainName = CHAIN_CONFIG[chainId]?.name || `chain-${chainId}`;

      return {
        content: [{
          type: "text",
          text: `Token Info on ${chainName} (chainId: ${chainId}):\nAddress: ${tokenAddress}\nName: ${name}\nSymbol: ${symbol}\nDecimals: ${decimals}\nTotal Supply: ${ethers.formatUnits(totalSupply, decimals)}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error fetching token info on chainId ${chainId}: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// Tool: Query current account balance
server.tool(
  "getBalance",
  "Queries the native token balance (e.g., ETH or POL) of the current account on the specified chain.",
  {
    chainId: z.number().optional().default(1).describe("Chain ID (e.g., 1 for Ethereum, 137 for Polygon)")
  },
  async ({ chainId }) => {
    try {
      const { signer, provider } = getProviderAndSigner(chainId);
      const address = signer.address;
      const balance = await provider.getBalance(address);
      const chainName = CHAIN_CONFIG[chainId]?.name || `chain-${chainId}`;

      return {
        content: [{
          type: "text",
          text: `Account Balance on ${chainName} (chainId: ${chainId}):\nAddress: ${address}\nBalance: ${ethers.formatEther(balance)} ${chainName === "Polygon" ? "MATIC" : "ETH"}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error fetching account balance on chainId ${chainId}: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// Tool: Query ERC-20 token balance
server.tool(
  "getTokenBalance",
  "Queries the balance of a specific ERC-20 token for the current account on the specified chain.",
  {
    tokenAddress: z.string().describe("Token contract address"),
    chainId: z.number().optional().default(1).describe("Chain ID (e.g., 1 for Ethereum, 137 for Polygon)")
  },
  async ({ tokenAddress, chainId }) => {
    try {
      const { signer, provider } = getProviderAndSigner(chainId);
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const [balance, decimals, symbol] = await Promise.all([
        contract.balanceOf(signer.address),
        contract.decimals(),
        contract.symbol()
      ]);
      const chainName = CHAIN_CONFIG[chainId]?.name || `chain-${chainId}`;

      return {
        content: [{
          type: "text",
          text: `Account Token Balance on ${chainName} (chainId: ${chainId}):\nAddress: ${signer.address}\nToken: ${tokenAddress}\nSymbol: ${symbol}\nBalance: ${ethers.formatUnits(balance, decimals)} ${symbol}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error fetching token balance on chainId ${chainId}: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// Tool: Transfer tokens
server.tool(
  "transferToken",
  "Transfers a specified amount of ERC-20 tokens to a recipient address and waits for transaction confirmation.",
  {
    tokenAddress: z.string().describe("Token contract address"),
    toAddress: z.string().describe("Recipient address"),
    amount: z.number().positive().describe("Amount to transfer in token units (will be multiplied by 10^decimals)"),
    chainId: z.number().optional().default(1).describe("Chain ID (e.g., 1 for Ethereum, 137 for Polygon)")
  },
  async ({ tokenAddress, toAddress, amount, chainId }) => {
    try {
      const { signer, provider } = getProviderAndSigner(chainId);
      
      const balance = await provider.getBalance(signer.address);      
      const chainName = CHAIN_CONFIG[chainId]?.name || `chain-${chainId}`;
      const currency = CHAIN_CONFIG[chainId]?.currency || "native token";
      if(balance === BigInt(0)){
        throw new Error(`Insufficient ${currency} balance on ${chainName} (chainId: ${chainId})!\nAddress: ${address}\nBalance: 0 ${currency}\nPlease deposit some ${currency} to your account to cover gas fees for deployment.`)
      }      

      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      const decimals = await contract.decimals();
      const adjustedAmount = ethers.parseUnits(amount.toString(), decimals);
      const tx = await contract.transfer(toAddress, adjustedAmount);

      return {
        content: [{
          type: "text",
          text: `Transfer initiated on ${chainName} (chainId: ${chainId})!\nToken: ${tokenAddress}\nTo: ${toAddress}\nAmount: ${amount} (${ethers.formatUnits(adjustedAmount, decimals)} tokens)\nTransaction Hash: ${tx.hash}\nNote: Use 'getTransactionInfo' to check transfer status.`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error transferring token on chainId ${chainId}: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// Tool: Query transaction information (include contract address if deployment)
server.tool(
  "getTransactionInfo",
  "Retrieves details about a transaction, including sender, recipient, value, status, and deployed contract address if applicable.",
  {
    txHash: z.string().describe("Transaction hash"),
    chainId: z.number().optional().default(1).describe("Chain ID (e.g., 1 for Ethereum, 137 for Polygon)")
  },
  async ({ txHash, chainId }) => {
    try {
      const provider = getProvider(chainId);
      const tx = await provider.getTransaction(txHash);
      const receipt = await provider.getTransactionReceipt(txHash);
      const chainName = CHAIN_CONFIG[chainId]?.name || `chain-${chainId}`;

      if (!tx) {
        throw new Error("Transaction not found");
      }

      const status = receipt ? (receipt.status === 1 ? "Success" : "Failed") : "Pending";
      let info = `Transaction Info on ${chainName} (chainId: ${chainId}):\nHash: ${txHash}\nFrom: ${tx.from}\nTo: ${tx.to || "Contract Creation"}\nValue: ${ethers.formatEther(tx.value)} ETH\nStatus: ${status}`;

      if (receipt && receipt.contractAddress) {
        info += `\nDeployed Contract Address: ${receipt.contractAddress}`;
      }

      return {
        content: [{
          type: "text",
          text: info
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error fetching transaction info on chainId ${chainId}: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// Resource to expose token metadata
server.resource(
  "tokenMetadata",
  new ResourceTemplate("token://{chainId}/{address}", { list: undefined }),
  async (uri, { chainId, address }) => {
    try {
      const provider = x(chainId);
      const contract = new ethers.Contract(address, ERC20_ABI, provider);
      const [name, symbol, decimals] = await Promise.all([contract.name(), contract.symbol(), contract.decimals()]);
      const chainName = CHAIN_CONFIG[chainId]?.name || `chain-${chainId}`;

      return {
        contents: [{
          uri: uri.href,
          text: `Token Metadata on ${chainName} (chainId: ${chainId}):\nName: ${name}\nSymbol: ${symbol}\nDecimals: ${decimals}`
        }]
      };
    } catch (error) {
      return {
        contents: [{
          uri: uri.href,
          text: `Error on chainId ${chainId}: ${error.message}`
        }]
      };
    }
  }
);

// Prompt for generating token deployment instructions
server.prompt(
  "deployTokenGuide",
  {
    chainId: z.string().optional().default("1").describe("Target chain ID (e.g., '1' for Ethereum, '137' for Polygon)")
  },
  ({ chainId }) => {
    const parsedChainId = parseInt(chainId, 10);
    const chainName = CHAIN_CONFIG[parsedChainId]?.name || `chain-${chainId}`;
    return {
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `Guide me through deploying a new token on chainId ${chainId}. What parameters do I need to provide?`
        }
      }, {
        role: "assistant",
        content: {
          type: "text",
          text: `To deploy a token on ${chainName} (chainId: ${chainId}), use the "deployToken" tool with these parameters:\n- name: The token's full name (e.g., "MyToken")\n- symbol: The token's ticker (e.g., "MTK")\n- initialSupply: Amount in token units (e.g., 1000000 for 1M tokens, default 1,000,000)\n- decimals: Optional number of decimals (default is 18)\n- chainId: Optional chain ID (default is 1 for Ethereum)`
        }
      }]
    };
  }
);

// Main function to start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  //console.log(await server._registeredTools.deployToken.callback({name:"aa",symbol:"aaa", initialSupply: 1000000, decimals: 18, chainId:1337}))
  //console.log(await server._registeredTools.getTransactionInfo.callback({txHash: '0x0c06a50c486fd01cf795663f8a625e957ff3c46bc64d6fbc6ea7b066d417bfff', chainId: 1337}))
  //console.log(await server._registeredTools.transferToken.callback({tokenAddress: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707', toAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', amount: 100, chainId:1337}))
  //console.log(await server._registeredTools.getBalance.callback({chainId: 1337}))
  //console.log(await server._registeredTools.getTokenBalance.callback({tokenAddress: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707', chainId: 1337}))
  //console.log(await server._registeredTools.getTokenInfo.callback({tokenAddress: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707', chainId: 1337}))
}

main().catch(console.error);