import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer = null;
let isConnected = false;

/**
 * Connects to MongoDB Memory Server for testing
 * This creates an in-memory database that doesn't affect your real DB
 */
export const connectTestDB = async () => {
  if (isConnected) {
    console.log("Test database already connected");
    return;
  }

  try {
    // Disconnect from any existing production database connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Download and start MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect mongoose to the in-memory database
    await mongoose.connect(mongoUri);
    isConnected = true;
    console.log("Connected to MongoDB Memory Server for testing");
  } catch (error) {
    console.error("Failed to connect to MongoDB Memory Server:", error.message);
    throw error;
  }
};

/**
 * Disconnects from MongoDB Memory Server and stops the server
 */
export const disconnectTestDB = async () => {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
    isConnected = false;
    console.log("Disconnected from MongoDB Memory Server");
  } catch (error) {
    console.error("Failed to disconnect from MongoDB Memory Server:", error.message);
    throw error;
  }
};

/**
 * Clears all data from test database between tests
 */
export const clearTestDB = async () => {
  // Only clear if we're connected
  if (mongoose.connection.readyState === 0) {
    console.log("Test database not connected, skipping clear");
    return;
  }

  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    console.log("Test database cleared");
  } catch (error) {
    console.error("Failed to clear test database:", error.message);
    throw error;
  }
};

export default {
  connectTestDB,
  disconnectTestDB,
  clearTestDB
};
