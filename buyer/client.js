
import "dotenv/config";

import { privateKeyToAccount } from "viem/accounts";
import { x402Client } from "@x402/core/client";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { wrapFetchWithPayment } from "@x402/fetch";

// 1. Load buyer wallet
const account = privateKeyToAccount(
  process.env.BUYER_PRIVATE_KEY
);

console.log("Buyer:", account.address);

// 2. Configure x402 payment client
const client = new x402Client();

client.register(
  "eip155:84532",
  new ExactEvmScheme(account)
);

// 3. Enable automatic payment
const paidFetch = wrapFetchWithPayment(fetch, client);

// 4. Request PayNode API
async function makePayment() {
  try {
    const response = await paidFetch(
      "http://localhost:5000/api/wallet/0x493845988f9c7A9dFD68F82548CD1A563df19618"
    );

    const data = await response.json();

    console.log("HTTP Status:", response.status);
    console.log("API Data:", data);

    console.log(
      "Payment receipt:",
      response.headers.get("PAYMENT-RESPONSE")
    );

  } catch (error) {
    console.error("Payment failed:", error.message);
  }
}

makePayment();
