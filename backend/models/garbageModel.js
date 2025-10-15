import mongoose from "mongoose";

/**
 * Garbage Collection Schema
 * Enhanced with IoT sensor simulation capabilities
 * Supports one bin per user with sensor-based fill level monitoring
 */
const garbageSchema = mongoose.Schema(
  {
    // ============ EXISTING FIELDS ============
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Reference to the User who made the request
    },
    address: {
      type: String,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Recyclable", "Non-Recyclable"],
    },
    area: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Area", // Reference to the Area where the garbage will be collected
    },
    weight: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Pending", "Collected", "In Progress", "Cancelled"],
      default: "Pending",
    },
    assignedCollector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collector",
      required: false,
    },
    assignedWma: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WMA",
      required: false,
    },
    collectionDate: {
      type: Date,
      required: false,
    },

    // ============ NEW: SENSOR INTEGRATION FIELDS ============
    
    /**
     * Sensor Data - Simulates IoT bin sensor readings
     * Tracks fill level, percentage, and update history
     */
    sensorData: {
      fillLevel: {
        type: String,
        enum: ["Empty", "Low", "Medium", "High", "Full"],
        default: "Empty",
      },
      fillPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
      isAutoDetected: {
        type: Boolean,
        default: false, // true if from IoT sensor, false if manual
      },
      updateHistory: [
        {
          level: {
            type: String,
            enum: ["Empty", "Low", "Medium", "High", "Full"],
          },
          percentage: {
            type: Number,
            min: 0,
            max: 100,
          },
          updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "sensorData.updateHistory.updatedByModel",
          },
          updatedByModel: {
            type: String,
            enum: ["User", "Collector", "WMA"],
          },
          timestamp: {
            type: Date,
            default: Date.now,
          },
          method: {
            type: String,
            enum: ["manual", "sensor", "system"],
            default: "manual",
          },
        },
      ],
    },

    /**
     * Bin Registration - Enforces one bin per user
     */
    isBinRegistered: {
      type: Boolean,
      default: false, // User can only create one request (bin registration)
    },

    /**
     * Unique Bin Identifier
     * Format: BIN-{userId}-{timestamp}
     */
    binId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values but enforces uniqueness for non-null
    },

    /**
     * Collection Visibility - Controls when collectors see the bin
     * Auto-set to true when fillLevel is "Full" or "High"
     */
    isVisibleToCollectors: {
      type: Boolean,
      default: false,
    },

    /**
     * Notification Tracking
     * Prevents duplicate notifications to collectors
     */
    autoNotificationSent: {
      type: Boolean,
      default: false,
    },
  },
  { 
    timestamps: true,
    // Enable automatic index creation
    autoIndex: true,
  }
);

// ============ INDEXES FOR PERFORMANCE ============

// Compound index for user bin lookup
garbageSchema.index({ user: 1, isBinRegistered: 1 });

// Compound index for collector queries (area + visibility + status)
garbageSchema.index({ area: 1, isVisibleToCollectors: 1, status: 1 });

// Index for bin ID lookups
garbageSchema.index({ binId: 1 });

// Index for sensor-based queries
garbageSchema.index({ "sensorData.fillLevel": 1 });

// Index for timestamp-based queries
garbageSchema.index({ createdAt: -1 });

// ============ VIRTUAL PROPERTIES ============

/**
 * Virtual property to check if bin needs attention
 */
garbageSchema.virtual("needsCollection").get(function () {
  return (
    this.sensorData.fillLevel === "Full" || 
    this.sensorData.fillLevel === "High"
  );
});

/**
 * Virtual property to get fill status color
 */
garbageSchema.virtual("fillStatusColor").get(function () {
  const colorMap = {
    Empty: "green",
    Low: "blue",
    Medium: "yellow",
    High: "orange",
    Full: "red",
  };
  return colorMap[this.sensorData.fillLevel] || "gray";
});

// ============ INSTANCE METHODS ============

/**
 * Update sensor fill level
 * @param {String} fillLevel - Empty, Low, Medium, High, Full
 * @param {ObjectId} updatedBy - User/Admin/Collector who made the change
 * @param {String} updatedByModel - Model name (User, Collector, WMA)
 * @param {String} method - manual, sensor, or system
 */
garbageSchema.methods.updateSensorLevel = function (
  fillLevel,
  updatedBy,
  updatedByModel = "User",
  method = "manual"
) {
  const percentageMap = {
    Empty: 0,
    Low: 25,
    Medium: 50,
    High: 75,
    Full: 100,
  };

  this.sensorData.fillLevel = fillLevel;
  this.sensorData.fillPercentage = percentageMap[fillLevel];
  this.sensorData.lastUpdated = new Date();

  // Add to history
  this.sensorData.updateHistory.push({
    level: fillLevel,
    percentage: percentageMap[fillLevel],
    updatedBy,
    updatedByModel,
    timestamp: new Date(),
    method,
  });

  // Auto-visibility: Show to collectors if Full or High
  const wasVisible = this.isVisibleToCollectors;
  this.isVisibleToCollectors = fillLevel === "Full" || fillLevel === "High";

  // Reset notification flag if it becomes invisible
  if (!this.isVisibleToCollectors && wasVisible) {
    this.autoNotificationSent = false;
  }

  // IMPORTANT: If bin was collected and now goes High/Full again, reset status to Pending
  // This allows collectors to see and collect it again
  if (this.isVisibleToCollectors && this.status === "Collected") {
    this.status = "Pending";
  }

  return this;
};

/**
 * Reset sensor after collection
 * @param {ObjectId} collectorId - Collector who collected the bin
 */
garbageSchema.methods.resetSensor = function (collectorId) {
  this.sensorData.fillLevel = "Empty";
  this.sensorData.fillPercentage = 0;
  this.sensorData.lastUpdated = new Date();
  this.sensorData.updateHistory.push({
    level: "Empty",
    percentage: 0,
    updatedBy: collectorId,
    updatedByModel: "Collector",
    timestamp: new Date(),
    method: "system",
  });

  this.isVisibleToCollectors = false;
  this.autoNotificationSent = false;

  return this;
};

// ============ STATIC METHODS ============

/**
 * Get bins needing collection in a specific area
 * @param {ObjectId} areaId - Area ID
 * @returns {Promise<Array>} Array of bins needing collection
 */
garbageSchema.statics.findFullBinsByArea = function (areaId) {
  return this.find({
    area: areaId,
    isBinRegistered: true,
    isVisibleToCollectors: true,
    status: { $in: ["Pending", "In Progress"] },
  })
    .populate("user", "username email contact address")
    .populate("area", "name district postalCode")
    .populate("assignedCollector", "collectorName truckNumber")
    .sort({ "sensorData.fillPercentage": -1, createdAt: -1 }); // Fullest bins first
};

/**
 * Check if user already has a registered bin
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Boolean>} True if user has a bin
 */
garbageSchema.statics.userHasBin = async function (userId) {
  const bin = await this.findOne({
    user: userId,
    isBinRegistered: true,
  });
  return !!bin;
};

/**
 * Get user's registered bin
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Object>} User's bin or null
 */
garbageSchema.statics.getUserBin = function (userId) {
  return this.findOne({
    user: userId,
    isBinRegistered: true,
  })
    .populate("user", "username email contact address")
    .populate("area", "name district postalCode")
    .populate("assignedCollector", "collectorName truckNumber")
    .populate("assignedWma", "wmaname");
};

// ============ MIDDLEWARE (HOOKS) ============

/**
 * Pre-save middleware to validate bin registration
 */
garbageSchema.pre("save", async function (next) {
  // If this is a new bin registration, check for duplicates
  if (this.isNew && this.isBinRegistered) {
    const existingBin = await this.constructor.findOne({
      user: this.user,
      isBinRegistered: true,
      _id: { $ne: this._id },
    });

    if (existingBin) {
      const error = new Error(
        "User already has a registered bin. Only one bin per user allowed."
      );
      error.name = "DuplicateBinError";
      return next(error);
    }
  }

  next();
});

/**
 * Post-save middleware for logging
 */
garbageSchema.post("save", function (doc) {
  console.log(`Bin ${doc.binId} saved - Fill Level: ${doc.sensorData.fillLevel}`);
});

// Ensure virtuals are included in JSON and Object outputs
garbageSchema.set("toJSON", { virtuals: true });
garbageSchema.set("toObject", { virtuals: true });

const Garbage = mongoose.model("Garbage", garbageSchema);

export default Garbage;
