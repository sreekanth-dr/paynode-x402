
import crypto from "node:crypto";
import Customer from "../models/customer.js";

const apiKeyAuth = async (req, res, next) => {
  try {
    const apiKey = req.header("x-api-key");

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: "API key required",
      });
    }

    const apiKeyHash = crypto
      .createHash("sha256")
      .update(apiKey)
      .digest("hex");

    const customer = await Customer.findOne({ apiKeyHash });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Invalid API key",
      });
    }

    req.customer = customer;
    next();
  } catch (error) {
    next(error);
  }
};

export default apiKeyAuth;
