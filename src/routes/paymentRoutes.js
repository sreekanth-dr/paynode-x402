
import express from "express";
import { ethers } from "ethers";
import Payment from "../models/payment.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { payer, transaction, network } = req.query;

    // Validate payer wallet address
    if (payer && !ethers.isAddress(payer)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet address",
      });
    }

    // Validate transaction hash
    if (
      transaction &&
      !/^0x[a-fA-F0-9]{64}$/.test(transaction)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction hash",
      });
    }

    // Validate network
    if (network && network !== "eip155:84532") {
      return res.status(400).json({
        success: false,
        message: "Unsupported network",
      });
    }

    // Validate pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (
      !Number.isInteger(page) ||
      !Number.isInteger(limit) ||
      page < 1 ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid page or limit. Limit must be between 1 and 100.",
      });
    }

    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};

    if (payer) filter.payer = payer;
    if (transaction) filter.transaction = transaction;
    if (network) filter.network = network;

    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPayments = await Payment.countDocuments(filter);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalPayments / limit),
      totalPayments,
      payments,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
