# PayNode — Powered by x402


**Live API:** [https://paynode-x402.onrender.com](https://paynode-x402.onrender.com)

A paid blockchain data API that allows developers to retrieve wallet information through automatic USDC payments using the **x402 payment protocol**.

> **Testnet Project:** PayNode currently runs on the Base Sepolia testnet and uses test ETH for gas fees and test USDC for x402 API payments. Both assets have no real monetary value.

---

## Overview

PayNode provides a paid API to retrieve blockchain wallet balances.

Instead of traditional subscriptions or API billing, PayNode uses the x402 protocol to enable pay-per-request API access.

### How It Works

1. A developer registers and receives an API key.
2. The developer requests a protected API endpoint.
3. PayNode responds with HTTP 402 Payment Required.
4. The x402 client automatically creates and signs a payment authorization.
5. The x402 facilitator verifies and settles the payment.
6. PayNode returns the requested blockchain data.
7. Payment details are stored in MongoDB.

## Tech Stack

- Node.js
- Express.js
- x402 Payment Protocol (v2)
- ethers.js
- viem
- MongoDB Atlas
- Mongoose
- Base Sepolia Testnet
- Render

## Network Configuration

| Property      | Value                                        |
| ------------- | -------------------------------------------- |
| Network       | Base Sepolia Testnet                         |
| Network ID    | `eip155:84532`                               |
| Payment Token | Test USDC                                    |
| USDC Contract | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |
| API Price     | $0.01 test USDC per request                  |
| Facilitator   | x402.org                                     |

## Testnet Assets

PayNode uses two testnet assets:

- **Test ETH:** Used to pay blockchain gas fees.
- **Test USDC:** Used to make x402 payments for API access.

The buyer signs the USDC payment authorization. The facilitator submits the settlement transaction and pays its gas fee.

Both assets have no real monetary value.

## Project Structure

```text
paynode-x402/
├── src/
│   ├── models/
│   │   ├── payment.js
│   │   └── customer.js
│   ├── middleware/
│   │   ├── apiKeyAuth.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── paymentRoutes.js
│   │   └── customerRoutes.js
│   └── server.js
├── buyer/
│   ├── client.js
│   ├── checkWallet.js
│   └── checkBalance.js
├── .env
├── .gitignore
├── package.json
└── package-lock.json
```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/sreekanth-dr/paynode-x402.git
cd paynode-x402
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root.

**Server configuration:**

```env
PORT=5000
RPC_URL=YOUR_BASE_SEPOLIA_RPC_URL
PAY_TO_ADDRESS=YOUR_SELLER_WALLET_ADDRESS
MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
CLIENT_URL=http://localhost:3000
```

**Buyer configuration** (used by the buyer client):

```env
BUYER_PRIVATE_KEY=YOUR_TESTNET_BUYER_PRIVATE_KEY
PAYNODE_API_KEY=YOUR_CUSTOMER_API_KEY
```

Never commit `.env` or expose private keys and API keys.

### 4. Start the Server

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

Local server:

```text
http://localhost:5000
```

## API Endpoints

### 1. Health Check

```http
GET /health
```

Checks whether the API server is running.

### 2. Register Customer

```http
POST /api/customers/register
```

Request body:

```json
{
  "name": "Developer",
  "email": "developer@example.com"
}
```

Returns a newly generated API key. Store it securely because it is only returned during registration.

### 3. Get Wallet Balance — Paid API

```http
GET /api/wallet/:address
```

Required header:

```http
x-api-key: YOUR_API_KEY
```

**Price:** $0.01 test USDC per request.

Example successful response:

```json
{
  "success": true,
  "data": {
    "address": "YOUR_WALLET_ADDRESS",
    "network": "Base Sepolia",
    "balance": "0.001",
    "currency": "ETH"
  }
}
```

### 4. Get Payment History

```http
GET /api/payments
```

Supported query parameters:

- `payer` — Filter by payer address.
- `transaction` — Filter by transaction hash.
- `network` — Filter by network.
- `page` — Pagination page.
- `limit` — Number of records per page.

Example:

```http
GET /api/payments?page=1&limit=5
```

## Payment Flow

```text
        Customer
            |
            v
    API Request + API Key
            |
            v
        PayNode API
            |
            v
   HTTP 402 Payment Required
            |
            v
       x402 Client
            |
            v
   USDC Payment Authorization
            |
            v
    x402 Facilitator
            |
            v
   Payment Settlement on Base
            |
            v
      MongoDB Record
            |
            v
    Wallet Balance Response
```

## Database

MongoDB stores customer and payment information.

**Customer collection:**

- Customer name
- Email
- Hashed API key

**Payment collection:**

- Payer address
- Transaction hash
- Network
- Payment amount
- Token contract address
- Recipient address
- Timestamp

## Deployment

PayNode is deployed as a Render Web Service.

**Live API:** [https://paynode-x402.onrender.com](https://paynode-x402.onrender.com)

**GitHub Repository:** [https://github.com/sreekanth-dr/paynode-x402](https://github.com/sreekanth-dr/paynode-x402)

## Security

- API keys are stored as SHA-256 hashes.
- API key authentication protects the wallet endpoint.
- Environment variables are used for sensitive configuration.
- Helmet, CORS, and rate limiting are configured.
- Payment settlement is handled through the x402 facilitator.

This is a testnet project, not a production payment service. Do not use exposed or test credentials with real funds.

## Future Improvements

- Developer dashboard.
- API usage analytics.
- API key management and revocation.
- Additional blockchain data endpoints.
- Support for more EVM networks.
- Production payment monitoring.

## Author

**Sreekanth DR**

GitHub: [https://github.com/sreekanth-dr](https://github.com/sreekanth-dr)

---

**PayNode — Making blockchain data accessible through pay-per-request APIs.**
