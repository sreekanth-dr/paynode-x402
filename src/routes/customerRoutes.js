
import express from "express";
import crypto from "node:crypto";
import Customer from "../models/customer.js";

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    // Check whether customer already exists
    const existingCustomer = await Customer.findOne({ email });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "Customer already registered",
      });
    }

    // Generate API key
    const apiKey = "pn_" + crypto.randomBytes(32).toString("hex");

    // Hash API key before storing
    const apiKeyHash = crypto
      .createHash("sha256")
      .update(apiKey)
      .digest("hex");

    // Save customer
    const customer = await Customer.create({
      name,
      email,
      apiKeyHash,
    });

    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
      },
      apiKey,
    });

  } catch (error) {
    next(error);
  }
});

export default router;
