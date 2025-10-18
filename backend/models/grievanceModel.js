import mongoose from "mongoose";

/**
 * Grievance Management Schema
 * Handles citizen complaints about garbage collection issues
 * Integrates with existing sensor-based garbage collection system
 */

// ============ CONSTANTS ============

/**
 * Valid statuses for grievance workflow
 */
const GRIEVANCE_STATUSES = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed"
};

/**
 * Valid severity levels
 */
const GRIEVANCE_SEVERITIES = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical"
};

/**
 * Expected resolution time in hours based on severity
 */
const RESOLUTION_TIME_HOURS = {
  [GRIEVANCE_SEVERITIES.CRITICAL]: 2,
  [GRIEVANCE_SEVERITIES.HIGH]: 8,
  [GRIEVANCE_SEVERITIES.MEDIUM]: 24,
  [GRIEVANCE_SEVERITIES.LOW]: 72
};

/**
 * Priority score weights for calculation
 */
const PRIORITY_WEIGHTS = {
  SEVERITY: {
    [GRIEVANCE_SEVERITIES.CRITICAL]: 40,
    [GRIEVANCE_SEVERITIES.HIGH]: 30,
    [GRIEVANCE_SEVERITIES.MEDIUM]: 20,
    [GRIEVANCE_SEVERITIES.LOW]: 10
  },
  AGE_MULTIPLIER: 0.5,
  MAX_AGE_SCORE: 30,
  ESCALATION_BONUS: 20
};

/**
 * Validation limits
 */
const VALIDATION_LIMITS = {
  DESCRIPTION_MAX: 500,
  DESCRIPTION_MIN: 10,
  NOTE_MAX: 1000,
  PRIORITY_MAX: 100,
  PRIORITY_MIN: 0
};

/**
 * Time conversion constants
 */
const TIME_CONSTANTS = {
  MS_PER_HOUR: 1000 * 60 * 60,
  HOURS_PER_DAY: 24
};

/**
 * Color mappings for UI
 */
const COLOR_MAPS = {
  SEVERITY: {
    [GRIEVANCE_SEVERITIES.LOW]: 'green',
    [GRIEVANCE_SEVERITIES.MEDIUM]: 'yellow',
    [GRIEVANCE_SEVERITIES.HIGH]: 'orange',
    [GRIEVANCE_SEVERITIES.CRITICAL]: 'red'
  },
  STATUS: {
    [GRIEVANCE_STATUSES.OPEN]: 'red',
    [GRIEVANCE_STATUSES.IN_PROGRESS]: 'blue',
    [GRIEVANCE_STATUSES.RESOLVED]: 'green',
    [GRIEVANCE_STATUSES.CLOSED]: 'gray'
  }
};

const grievanceSchema = mongoose.Schema(
  {
    // ============ CORE GRIEVANCE FIELDS ============
    
    /**
     * Reference to the garbage bin this grievance is about
     * Links to existing Garbage model via binId field
     */
    binId: {
      type: String,
      required: [true, "Bin ID is required"],
      validate: {
        validator: async function(binId) {
          // Validate that the bin exists in the Garbage collection
          const Garbage = mongoose.model('Garbage');
          const bin = await Garbage.findOne({ binId: binId });
          return !!bin;
        },
        message: "Referenced bin does not exist"
      }
    },

    /**
     * Reference to the garbage model document
     * Used for displaying special markers on collector maps
     */
    garbageId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Garbage ID is required"],
      ref: "Garbage"
    },

    /**
     * User who created the grievance
     * Must be the owner of the bin
     */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "User ID is required"],
      ref: "User",
      validate: {
        validator: async function(userId) {
          // Validate that user owns the bin they're complaining about
          const Garbage = mongoose.model('Garbage');
          const bin = await Garbage.findOne({ 
            binId: this.binId, 
            user: userId 
          });
          return !!bin;
        },
        message: "User can only create grievances for their own bins"
      }
    },

    /**
     * Area where the bin is located
     * Auto-populated from bin data for filtering and assignment
     */
    areaId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Area ID is required"],
      ref: "Area"
    },

    /**
     * Severity level of the grievance
     * Determines priority and response time
     */
    severity: {
      type: String,
      required: [true, "Severity level is required"],
      enum: {
        values: Object.values(GRIEVANCE_SEVERITIES),
        message: `Severity must be one of: ${Object.values(GRIEVANCE_SEVERITIES).join(', ')}`
      }
    },

    /**
     * Detailed description of the issue
     * Limited to 500 characters for conciseness
     */
    description: {
      type: String,
      required: [true, "Description is required"],
      maxLength: [VALIDATION_LIMITS.DESCRIPTION_MAX, `Description cannot exceed ${VALIDATION_LIMITS.DESCRIPTION_MAX} characters`],
      minLength: [VALIDATION_LIMITS.DESCRIPTION_MIN, `Description must be at least ${VALIDATION_LIMITS.DESCRIPTION_MIN} characters`],
      trim: true
    },

    /**
     * Current status of the grievance
     * Follows a specific workflow: Open → In Progress → Resolved/Closed
     */
    status: {
      type: String,
      enum: {
        values: Object.values(GRIEVANCE_STATUSES),
        message: `Status must be one of: ${Object.values(GRIEVANCE_STATUSES).join(', ')}`
      },
      default: GRIEVANCE_STATUSES.OPEN
    },

    /**
     * Collector assigned to resolve this grievance
     * Must be a collector assigned to the same area
     */
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collector",
      required: false,
      validate: {
        validator: async function(collectorId) {
          if (!collectorId) return true; // Optional field
          
          const Collector = mongoose.model('Collector');
          const collector = await Collector.findById(collectorId);
          
          if (!collector) return false;
          
          // Check if collector is assigned to this area
          return collector.assignedAreas.includes(this.areaId);
        },
        message: "Assigned collector must be assigned to the grievance area"
      }
    },

    /**
     * Resolution notes and communication history
     * Tracks all interactions and updates
     */
    notes: [
      {
        content: {
          type: String,
          required: [true, "Note content is required"],
          maxLength: [VALIDATION_LIMITS.NOTE_MAX, `Note cannot exceed ${VALIDATION_LIMITS.NOTE_MAX} characters`],
          trim: true
        },
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          required: [true, "Note author is required"],
          refPath: "notes.addedByModel"
        },
        addedByModel: {
          type: String,
          required: [true, "Note author model is required"],
          enum: {
            values: ["User", "Collector", "Admin"],
            message: "Note author must be User, Collector, or Admin"
          }
        },
        timestamp: {
          type: Date,
          default: Date.now
        },
        noteType: {
          type: String,
          enum: ["Update", "Resolution", "Assignment", "System"],
          default: "Update"
        }
      }
    ],

    // ============ METADATA FIELDS ============

    /**
     * Priority score for routing optimization
     * Calculated based on severity, age, and area load
     */
    priorityScore: {
      type: Number,
      default: 0,
      min: VALIDATION_LIMITS.PRIORITY_MIN,
      max: VALIDATION_LIMITS.PRIORITY_MAX
    },

    /**
     * Expected resolution time based on severity
     * Used for SLA tracking and escalation
     */
    expectedResolutionTime: {
      type: Date
    },

    /**
     * Actual resolution timestamp
     * Set when status changes to Resolved
     */
    resolvedAt: {
      type: Date
    },

    /**
     * Auto-escalation flag for overdue grievances
     * Triggers when expected resolution time is exceeded
     */
    isEscalated: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    collection: "grievances"
  }
);

// ============ INDEXES FOR PERFORMANCE ============

// Compound index for admin dashboard queries (status + severity)
grievanceSchema.index({ status: 1, severity: -1 });

// Area-based queries for collector assignment
grievanceSchema.index({ areaId: 1, status: 1 });

// Collector assignment queries
grievanceSchema.index({ assignedTo: 1, status: 1 });

// User grievance history
grievanceSchema.index({ userId: 1, createdAt: -1 });

// Bin-specific grievances
grievanceSchema.index({ binId: 1, status: 1 });

// Priority-based sorting
grievanceSchema.index({ priorityScore: -1, createdAt: -1 });

// Escalation queries
grievanceSchema.index({ isEscalated: 1, expectedResolutionTime: 1 });

// ============ VIRTUAL PROPERTIES ============

/**
 * Virtual property for grievance age in hours
 * Useful for priority calculation and SLA tracking
 */
grievanceSchema.virtual('ageInHours').get(function() {
  return Math.floor((Date.now() - this.createdAt) / TIME_CONSTANTS.MS_PER_HOUR);
});

/**
 * Virtual property for time until expected resolution
 * Negative values indicate overdue grievances
 */
grievanceSchema.virtual('timeToResolution').get(function() {
  if (!this.expectedResolutionTime) return null;
  return Math.floor((this.expectedResolutionTime - Date.now()) / TIME_CONSTANTS.MS_PER_HOUR);
});

/**
 * Virtual property for severity color coding
 * Used in frontend for visual indicators
 */
grievanceSchema.virtual('severityColor').get(function() {
  return COLOR_MAPS.SEVERITY[this.severity] || 'gray';
});

/**
 * Virtual property for status color coding
 * Used in frontend for visual indicators
 */
grievanceSchema.virtual('statusColor').get(function() {
  return COLOR_MAPS.STATUS[this.status] || 'gray';
});

// ============ INSTANCE METHODS ============

/**
 * Add a note to the grievance
 * @param {String} content - Note content
 * @param {ObjectId} addedBy - User/Collector/Admin ID
 * @param {String} addedByModel - Model type
 * @param {String} noteType - Type of note
 */
grievanceSchema.methods.addNote = function(content, addedBy, addedByModel, noteType = "Update") {
  this.notes.push({
    content,
    addedBy,
    addedByModel,
    noteType,
    timestamp: new Date()
  });
  
  this.updatedAt = new Date();
  return this;
};

/**
 * Update grievance status with automatic note generation
 * @param {String} newStatus - New status
 * @param {ObjectId} updatedBy - User who updated
 * @param {String} updatedByModel - Model type
 * @param {String} reason - Reason for status change
 */
grievanceSchema.methods.updateStatus = function(newStatus, updatedBy, updatedByModel, reason = "") {
  const oldStatus = this.status;
  this.status = newStatus;
  
  // Set resolution timestamp if resolved
  if (newStatus === GRIEVANCE_STATUSES.RESOLVED && oldStatus !== GRIEVANCE_STATUSES.RESOLVED) {
    this.resolvedAt = new Date();
  }
  
  // Add system note for status change
  const noteContent = reason 
    ? `Status changed from ${oldStatus} to ${newStatus}. Reason: ${reason}`
    : `Status changed from ${oldStatus} to ${newStatus}`;
    
  this.addNote(noteContent, updatedBy, updatedByModel, "Update");
  
  return this;
};

/**
 * Assign grievance to a collector
 * @param {ObjectId} collectorId - Collector to assign
 * @param {ObjectId} assignedBy - Admin who made assignment
 * @param {String} reason - Assignment reason
 */
grievanceSchema.methods.assignToCollector = function(collectorId, assignedBy, reason = "") {
  const oldCollector = this.assignedTo;
  this.assignedTo = collectorId;
  this.status = GRIEVANCE_STATUSES.IN_PROGRESS;
  
  const noteContent = oldCollector 
    ? `Reassigned to new collector. Reason: ${reason}`
    : `Assigned to collector. Reason: ${reason}`;
    
  this.addNote(noteContent, assignedBy, "Admin", "Assignment");
  
  return this;
};

/**
 * Calculate priority score based on severity, age, and area load
 * Higher scores indicate higher priority
 */
grievanceSchema.methods.calculatePriorityScore = function() {
  const severityWeight = PRIORITY_WEIGHTS.SEVERITY[this.severity] || PRIORITY_WEIGHTS.SEVERITY[GRIEVANCE_SEVERITIES.LOW];
  const ageWeight = Math.min(this.ageInHours * PRIORITY_WEIGHTS.AGE_MULTIPLIER, PRIORITY_WEIGHTS.MAX_AGE_SCORE);
  const escalationWeight = this.isEscalated ? PRIORITY_WEIGHTS.ESCALATION_BONUS : 0;
  
  this.priorityScore = severityWeight + ageWeight + escalationWeight;
  return this.priorityScore;
};

// ============ STATIC METHODS ============

/**
 * Get grievances by area with optional status filter
 * @param {ObjectId} areaId - Area ID
 * @param {String} status - Optional status filter
 * @returns {Promise<Array>} Array of grievances
 */
grievanceSchema.statics.getByArea = function(areaId, status = null) {
  const query = { areaId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate("userId", "username email contact")
    .populate("areaId", "name district")
    .populate("assignedTo", "collectorName truckNumber")
    .sort({ priorityScore: -1, createdAt: -1 });
};

/**
 * Get grievances assigned to a specific collector
 * @param {ObjectId} collectorId - Collector ID
 * @param {String} status - Optional status filter
 * @returns {Promise<Array>} Array of assigned grievances
 */
grievanceSchema.statics.getAssignedToCollector = function(collectorId, status = null) {
  const query = { assignedTo: collectorId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate("userId", "username email contact address")
    .populate("areaId", "name district")
    .populate("garbageId", "binId location latitude longitude status")
    .sort({ priorityScore: -1, createdAt: -1 });
};

/**
 * Get grievance statistics for dashboard
 * @param {Object} filters - Optional filters (areaId, dateRange, etc.)
 * @returns {Promise<Object>} Statistics object
 */
grievanceSchema.statics.getStatistics = async function(filters = {}) {
  const matchStage = {};
  
  if (filters.areaId) matchStage.areaId = filters.areaId;
  if (filters.startDate) matchStage.createdAt = { $gte: filters.startDate };
  if (filters.endDate) {
    matchStage.createdAt = matchStage.createdAt || {};
    matchStage.createdAt.$lte = filters.endDate;
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        open: { $sum: { $cond: [{ $eq: ["$status", "Open"] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } },
        closed: { $sum: { $cond: [{ $eq: ["$status", "Closed"] }, 1, 0] } },
        critical: { $sum: { $cond: [{ $eq: ["$severity", "Critical"] }, 1, 0] } },
        high: { $sum: { $cond: [{ $eq: ["$severity", "High"] }, 1, 0] } },
        escalated: { $sum: { $cond: ["$isEscalated", 1, 0] } },
        avgResolutionTime: {
          $avg: {
            $cond: [
              { $ne: ["$resolvedAt", null] },
              { $subtract: ["$resolvedAt", "$createdAt"] },
              null
            ]
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0,
    critical: 0, high: 0, escalated: 0, avgResolutionTime: 0
  };
};

// ============ MIDDLEWARE (HOOKS) ============

/**
 * Pre-save middleware to auto-populate area and calculate priority
 */
grievanceSchema.pre('save', async function(next) {
  try {
    // Auto-populate areaId from bin data if not set
    if (!this.areaId && this.binId) {
      await this._populateAreaFromBin();
    }
    
    // Set expected resolution time based on severity
    if (this.isNew && !this.expectedResolutionTime) {
      this._setExpectedResolutionTime();
    }
    
    // Calculate priority score
    this.calculatePriorityScore();
    
    // Check for escalation
    this._checkAndSetEscalation();
    
    next();
  } catch (error) {
    // Log pre-save errors for debugging
    console.error(`[GRIEVANCE_MODEL] Pre-save error: ID=${this._id}, BinId=${this.binId}, Error=${error.message}`);
    next(error);
  }
});

/**
 * Helper: Populate area from bin data
 * @private
 */
grievanceSchema.methods._populateAreaFromBin = async function() {
  const Garbage = mongoose.model('Garbage');
  const bin = await Garbage.findOne({ binId: this.binId });
  if (bin) {
    this.areaId = bin.area;
  }
};

/**
 * Helper: Set expected resolution time based on severity
 * @private
 */
grievanceSchema.methods._setExpectedResolutionTime = function() {
  const hours = RESOLUTION_TIME_HOURS[this.severity] || RESOLUTION_TIME_HOURS[GRIEVANCE_SEVERITIES.MEDIUM];
  this.expectedResolutionTime = new Date(Date.now() + hours * TIME_CONSTANTS.MS_PER_HOUR);
};

/**
 * Helper: Check if grievance should be escalated
 * @private
 */
grievanceSchema.methods._checkAndSetEscalation = function() {
  if (this.expectedResolutionTime && Date.now() > this.expectedResolutionTime && !this.isEscalated) {
    this.isEscalated = true;
    // Log escalation event
    console.log(`[GRIEVANCE_MODEL] Auto-escalated: ID=${this._id}, Severity=${this.severity}, Area=${this.areaId}, ExpectedTime=${this.expectedResolutionTime}`);
  }
};

/**
 * Post-save middleware for logging and notifications
 */
grievanceSchema.post('save', function(doc) {
  // Only log significant changes, not every save (avoid spam)
  if (doc.isNew) {
    // Log new grievance creation at model level
    console.log(`[GRIEVANCE_MODEL] Created: ID=${doc._id}, Status=${doc.status}, Severity=${doc.severity}, Priority=${doc.priorityScore}`);
  } else if (doc.isModified('status')) {
    // Log status changes
    console.log(`[GRIEVANCE_MODEL] Status changed: ID=${doc._id}, NewStatus=${doc.status}, Severity=${doc.severity}`);
  } else if (doc.isModified('assignedTo')) {
    // Log assignment changes
    console.log(`[GRIEVANCE_MODEL] Assignment changed: ID=${doc._id}, AssignedTo=${doc.assignedTo}`);
  }
  
  // TODO: Add notification logic here (email, SMS, push notifications)
  // This would integrate with a notification service
});

// Ensure virtual fields are serialized
grievanceSchema.set('toJSON', { virtuals: true });
grievanceSchema.set('toObject', { virtuals: true });

const Grievance = mongoose.model("Grievance", grievanceSchema);

export default Grievance;
