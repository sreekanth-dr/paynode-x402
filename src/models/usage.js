
import mongoose from "mongoose";

const usageSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    endpoint: String,
    method: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Usage ||
  mongoose.model("Usage", usageSchema);
