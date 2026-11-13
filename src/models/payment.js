import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    payer: {
      type: String,
      required: true,
    },
    transaction: {
      type: String,
      required: true,
      unique: true,
    },
    network: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    recipient: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Payment", paymentSchema);