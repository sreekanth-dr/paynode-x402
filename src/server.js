
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import dns from "node:dns";
import { ethers } from "ethers";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import trackUsage from "./middleware/trackUsage.js";

import {
  paymentMiddleware,
  x402ResourceServer,
} from "@x402/express";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";

import Payment from "./models/payment.js";
import customerRoutes from "./routes/customerRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import apiKeyAuth from "./middleware/apiKeyAuth.js";
import usageRoutes from "./routes/usageRoutes.js";


dotenv.config();
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
}));
app.use(express.json());
app.use("/api/usage", usageRoutes);

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const payTo = process.env.PAY_TO_ADDRESS;

const facilitatorClient = new HTTPFacilitatorClient({
  url: "https://x402.org/facilitator",
});

const resourceServer = new x402ResourceServer(facilitatorClient)
  .register("eip155:84532", new ExactEvmScheme())
  .onAfterSettle(async ({ result, requirements }) => {
    if (!result.success) return;

    try {
      await Payment.create({
        payer: result.payer,
        transaction: result.transaction,
        network: result.network,
        amount: requirements.amount,
        token: requirements.asset,
        recipient: requirements.payTo,
      });

      console.log("Payment saved to MongoDB");
    } catch (error) {
      console.error("Payment storage error:", error.message);
    }
  });

// Free health check
app.get("/health", (req, res) => {
  res.json({ success: true, message: "PayNode is running" });
});

// Customer registration
app.use("/api/customers", customerRoutes);

// Payment history
app.use("/api/payments", paymentRoutes);

// API key authentication BEFORE x402
app.use("/api/wallet", apiKeyAuth, trackUsage);
// Paid wallet API
app.use(
  paymentMiddleware(
    {
      "GET /api/wallet/:address": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.01",
            network: "eip155:84532",
            payTo,
          },
        ],
        description: "Get Base Sepolia wallet balance",
      },
    },
    resourceServer,
  ),
);

app.get("/api/wallet/:address", async (req, res, next) => {
  try {
    const { address } = req.params;

    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet address",
      });
    }

    const balance = await provider.getBalance(address);

    res.json({
      success: true,
      data: {
        address,
        network: "Base Sepolia",
        balance: ethers.formatEther(balance),
        currency: "ETH",
      },
    });
  } catch (error) {
    next(error);
  }
});

// Central error handler
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// Homepage
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to PayNode — Powered by x402",
    version: "1.0.0",
    network: "Base Sepolia"
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`PayNode running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
