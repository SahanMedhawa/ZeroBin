import jwt from "jsonwebtoken";
import Collector from "../models/collectorModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

/**
 * Middleware to authenticate collector users using JWT.
 * 
 * This middleware reads the JWT from the 'jwt_collector' cookie, verifies it, and attaches
 * the authenticated collector user to the request object. If the token is invalid or missing,
 * it responds with a 401 status and an appropriate error message.
 * 
 * @function authenticateCollector
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws Will throw an error if the token is invalid or missing
 */
const authenticateCollector = asyncHandler(async (req, res, next) => {
  let token;

  // Check JWT in 'Authorization' header or 'jwt_collector' cookie
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]; // Extract token from Authorization header
  } else if (req.cookies.jwt_collector) {
    token = req.cookies.jwt_collector; // Extract token from 'jwt_collector' cookie
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.collector = await Collector.findById(decoded.collectorNIC).select(
        "-truckNumber"
      );
      
      if (!req.collector) {
        res.status(401);
        throw new Error("Collector not found");
      }
      
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no Collector token");
  }
});

export { authenticateCollector };
