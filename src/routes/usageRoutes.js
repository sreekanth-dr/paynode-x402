
import express from "express";
import apiKeyAuth from "../middleware/apiKeyAuth.js";
import Usage from "../models/usage.js";

const router = express.Router();

router.get("/", apiKeyAuth, async (req, res, next) => {
  try {
    const usage = await Usage.find({
      customer: req.customer._id,
    }).sort({ timestamp: -1 });

    res.json({
      success: true,
      count: usage.length,
      usage,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
