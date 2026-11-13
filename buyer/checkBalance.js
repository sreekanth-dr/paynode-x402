
import "dotenv/config";
import { ethers } from "ethers";
import { privateKeyToAccount } from "viem/accounts";

const account = privateKeyToAccount(
  process.env.BUYER_PRIVATE_KEY
);

const provider = new ethers.JsonRpcProvider(
  process.env.RPC_URL
);

const USDC_ADDRESS =
  "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

const usdc = new ethers.Contract(
  USDC_ADDRESS,
  ["function balanceOf(address) view returns (uint256)",
   "function decimals() view returns (uint8)"],
  provider
);

const ethBalance = await provider.getBalance(account.address);
const usdcBalance = await usdc.balanceOf(account.address);
const decimals = await usdc.decimals();

console.log("Buyer:", account.address);
console.log("ETH:", ethers.formatEther(ethBalance));
console.log("USDC:", ethers.formatUnits(usdcBalance, decimals));
