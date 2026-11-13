import "dotenv/config";
import { privateKeyToAccount } from "viem/accounts";

const account = privateKeyToAccount(
  process.env.BUYER_PRIVATE_KEY
);

console.log("Buyer wallet:", account.address);