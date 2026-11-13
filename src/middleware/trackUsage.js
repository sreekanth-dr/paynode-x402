
import Usage from "../models/usage.js";

const trackUsage = async (req, res, next) => {
  try {
    if (req.customer) {
      await Usage.create({
        customer: req.customer._id,
        endpoint: req.originalUrl,
        method: req.method,
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default trackUsage;
