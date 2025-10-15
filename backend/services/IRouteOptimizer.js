import Collector from "../models/collectorModel.js";
import Grievance from "../models/grievanceModel.js";

/**
 * Route Optimization Interface
 * Provides abstraction for area reassignment and route optimization
 * Follows Interface Segregation Principle (ISP) from SOLID
 * 
 * Current Implementation: Simple area-based reassignment
 * Future: Can be extended for complex route optimization algorithms
 */
class IRouteOptimizer {
  
  /**
   * Trigger route reevaluation for an area
   * Reassigns grievances to optimize collector workload
   * 
   * @param {String} areaId - Area ObjectId to optimize
   * @param {Object} opts - Options for optimization
   * @param {Boolean} opts.urgent - Whether this is urgent reassignment
   * @param {String} opts.grievanceId - Specific grievance triggering optimization
   * @param {String} opts.excludeCollectorId - Collector to exclude from assignment
   * @returns {Promise<Object>} Optimization result
   */
  async triggerReevaluation(areaId, opts = {}) {
    const {
      urgent = false,
      grievanceId = null,
      excludeCollectorId = null
    } = opts;

    try {
      console.log(`🔄 Starting route optimization for area: ${areaId}`);
      
      // Step 1: Get all available collectors in the area
      const availableCollectors = await this._getAvailableCollectors(areaId, excludeCollectorId);
      
      if (availableCollectors.length === 0) {
        return {
          success: false,
          message: "No available collectors found in this area",
          reassignedCount: 0
        };
      }

      // Step 2: Get grievances that need reassignment
      const grievancesToReassign = await this._getGrievancesForReassignment(
        areaId, 
        grievanceId, 
        urgent
      );

      if (grievancesToReassign.length === 0) {
        return {
          success: true,
          message: "No grievances require reassignment",
          reassignedCount: 0
        };
      }

      // Step 3: Calculate current workload for each collector
      const collectorWorkloads = await this._calculateCollectorWorkloads(availableCollectors);

      // Step 4: Perform optimal reassignment
      const reassignmentResults = await this._performOptimalReassignment(
        grievancesToReassign,
        collectorWorkloads,
        urgent
      );

      console.log(`✅ Route optimization completed. Reassigned: ${reassignmentResults.reassignedCount} grievances`);

      return {
        success: true,
        message: `Successfully reassigned ${reassignmentResults.reassignedCount} grievances`,
        reassignedCount: reassignmentResults.reassignedCount,
        assignments: reassignmentResults.assignments,
        optimizationMetrics: {
          totalGrievances: grievancesToReassign.length,
          availableCollectors: availableCollectors.length,
          avgWorkloadBefore: reassignmentResults.avgWorkloadBefore,
          avgWorkloadAfter: reassignmentResults.avgWorkloadAfter
        }
      };

    } catch (error) {
      console.error(`❌ Route optimization failed for area ${areaId}:`, error);
      return {
        success: false,
        message: `Route optimization failed: ${error.message}`,
        reassignedCount: 0,
        error: error.message
      };
    }
  }

  /**
   * Get available collectors in a specific area
   * Excludes collectors that are not available or specifically excluded
   * 
   * @param {String} areaId - Area to search in
   * @param {String} excludeCollectorId - Collector to exclude
   * @returns {Promise<Array>} Available collectors
   * @private
   */
  async _getAvailableCollectors(areaId, excludeCollectorId = null) {
    const query = {
      assignedAreas: areaId,
      statusOfCollector: "Available"
    };

    if (excludeCollectorId) {
      query._id = { $ne: excludeCollectorId };
    }

    return await Collector.find(query)
      .populate("wmaId", "wmaname")
      .sort({ collectorName: 1 });
  }

  /**
   * Get grievances that need reassignment in an area
   * Prioritizes based on urgency and current assignment status
   * 
   * @param {String} areaId - Area to search in
   * @param {String} specificGrievanceId - Specific grievance to include
   * @param {Boolean} urgent - Whether to include only urgent cases
   * @returns {Promise<Array>} Grievances needing reassignment
   * @private
   */
  async _getGrievancesForReassignment(areaId, specificGrievanceId = null, urgent = false) {
    let query = {
      areaId: areaId,
      status: { $in: ["Open", "In Progress"] }
    };

    // If urgent, only get high priority grievances
    if (urgent) {
      query.$or = [
        { severity: { $in: ["Critical", "High"] } },
        { isEscalated: true },
        { assignedTo: null } // Unassigned grievances
      ];
    }

    // If specific grievance mentioned, ensure it's included
    if (specificGrievanceId) {
      query = {
        $or: [
          query,
          { _id: specificGrievanceId }
        ]
      };
    }

    return await Grievance.find(query)
      .populate("userId", "username contact")
      .populate("assignedTo", "collectorName truckNumber")
      .sort({ priorityScore: -1, createdAt: 1 }); // Highest priority first
  }

  /**
   * Calculate current workload for each collector
   * Considers number of assigned grievances and their severity
   * 
   * @param {Array} collectors - List of collectors
   * @returns {Promise<Array>} Collectors with workload data
   * @private
   */
  async _calculateCollectorWorkloads(collectors) {
    const workloads = [];

    for (const collector of collectors) {
      // Get assigned grievances
      const assignedGrievances = await Grievance.find({
        assignedTo: collector._id,
        status: { $in: ["In Progress"] }
      });

      // Calculate workload score
      let workloadScore = 0;
      assignedGrievances.forEach(grievance => {
        const severityWeights = {
          'Critical': 4,
          'High': 3,
          'Medium': 2,
          'Low': 1
        };
        workloadScore += severityWeights[grievance.severity] || 1;
      });

      workloads.push({
        collector: collector,
        currentGrievances: assignedGrievances.length,
        workloadScore: workloadScore,
        capacity: this._getCollectorCapacity(collector), // Max grievances they can handle
        availableCapacity: Math.max(0, this._getCollectorCapacity(collector) - assignedGrievances.length)
      });
    }

    // Sort by available capacity (most available first)
    return workloads.sort((a, b) => b.availableCapacity - a.availableCapacity);
  }

  /**
   * Get collector capacity based on their profile
   * This is a simple implementation - can be enhanced with real capacity data
   * 
   * @param {Object} collector - Collector object
   * @returns {Number} Maximum grievances they can handle
   * @private
   */
  _getCollectorCapacity(collector) {
    // Simple capacity model - can be enhanced based on:
    // - Truck size, team size, working hours, historical performance, etc.
    return 10; // Default capacity of 10 grievances per collector
  }

  /**
   * Perform optimal reassignment of grievances to collectors
   * Uses a simple load balancing algorithm
   * 
   * @param {Array} grievances - Grievances to reassign
   * @param {Array} collectorWorkloads - Collectors with workload data
   * @param {Boolean} urgent - Whether this is urgent reassignment
   * @returns {Promise<Object>} Reassignment results
   * @private
   */
  async _performOptimalReassignment(grievances, collectorWorkloads, urgent = false) {
    const assignments = [];
    let reassignedCount = 0;
    
    // Calculate average workload before reassignment
    const avgWorkloadBefore = collectorWorkloads.reduce((sum, c) => sum + c.workloadScore, 0) / collectorWorkloads.length;

    for (const grievance of grievances) {
      // Find the best collector for this grievance
      const bestCollector = this._findBestCollectorForGrievance(
        grievance, 
        collectorWorkloads, 
        urgent
      );

      if (bestCollector && bestCollector.availableCapacity > 0) {
        try {
          // Update grievance assignment
          await grievance.assignToCollector(
            bestCollector.collector._id,
            null, // System assignment - no specific admin
            urgent ? "Urgent route optimization" : "Route optimization"
          );

          await grievance.save();

          // Update collector workload tracking
          bestCollector.currentGrievances++;
          bestCollector.availableCapacity--;
          bestCollector.workloadScore += this._getGrievanceSeverityWeight(grievance.severity);

          assignments.push({
            grievanceId: grievance._id,
            collectorId: bestCollector.collector._id,
            collectorName: bestCollector.collector.collectorName,
            severity: grievance.severity,
            reason: urgent ? "Urgent reassignment" : "Load balancing"
          });

          reassignedCount++;

        } catch (error) {
          console.error(`Failed to reassign grievance ${grievance._id}:`, error);
        }
      }
    }

    // Calculate average workload after reassignment
    const avgWorkloadAfter = collectorWorkloads.reduce((sum, c) => sum + c.workloadScore, 0) / collectorWorkloads.length;

    return {
      reassignedCount,
      assignments,
      avgWorkloadBefore,
      avgWorkloadAfter
    };
  }

  /**
   * Find the best collector for a specific grievance
   * Considers workload, capacity, and grievance priority
   * 
   * @param {Object} grievance - Grievance to assign
   * @param {Array} collectorWorkloads - Available collectors with workload data
   * @param {Boolean} urgent - Whether this is urgent assignment
   * @returns {Object|null} Best collector or null if none available
   * @private
   */
  _findBestCollectorForGrievance(grievance, collectorWorkloads, urgent = false) {
    // Filter collectors with available capacity
    const availableCollectors = collectorWorkloads.filter(c => c.availableCapacity > 0);
    
    if (availableCollectors.length === 0) return null;

    // For urgent cases, prefer collectors with lowest current workload
    if (urgent || grievance.severity === "Critical") {
      return availableCollectors.reduce((best, current) => 
        current.workloadScore < best.workloadScore ? current : best
      );
    }

    // For normal cases, use round-robin with capacity consideration
    // Find collector with most available capacity
    return availableCollectors.reduce((best, current) => 
      current.availableCapacity > best.availableCapacity ? current : best
    );
  }

  /**
   * Get severity weight for workload calculation
   * 
   * @param {String} severity - Grievance severity
   * @returns {Number} Weight value
   * @private
   */
  _getGrievanceSeverityWeight(severity) {
    const weights = {
      'Critical': 4,
      'High': 3,
      'Medium': 2,
      'Low': 1
    };
    return weights[severity] || 1;
  }

  /**
   * Get optimization recommendations without performing reassignment
   * Useful for preview/analysis before actual optimization
   * 
   * @param {String} areaId - Area to analyze
   * @returns {Promise<Object>} Optimization recommendations
   */
  async getOptimizationRecommendations(areaId) {
    try {
      const availableCollectors = await this._getAvailableCollectors(areaId);
      const grievances = await this._getGrievancesForReassignment(areaId);
      const workloads = await this._calculateCollectorWorkloads(availableCollectors);

      // Analyze current distribution
      const totalGrievances = grievances.length;
      const unassignedGrievances = grievances.filter(g => !g.assignedTo).length;
      const criticalGrievances = grievances.filter(g => g.severity === "Critical").length;
      const escalatedGrievances = grievances.filter(g => g.isEscalated).length;

      // Calculate workload imbalance
      const workloadScores = workloads.map(w => w.workloadScore);
      const avgWorkload = workloadScores.reduce((sum, score) => sum + score, 0) / workloadScores.length;
      const workloadVariance = workloadScores.reduce((sum, score) => sum + Math.pow(score - avgWorkload, 2), 0) / workloadScores.length;

      return {
        areaId,
        totalCollectors: availableCollectors.length,
        totalGrievances,
        unassignedGrievances,
        criticalGrievances,
        escalatedGrievances,
        workloadMetrics: {
          averageWorkload: avgWorkload,
          workloadVariance,
          isBalanced: workloadVariance < 2, // Threshold for balanced workload
        },
        recommendations: this._generateRecommendations(workloads, grievances)
      };

    } catch (error) {
      console.error(`Failed to generate recommendations for area ${areaId}:`, error);
      throw error;
    }
  }

  /**
   * Generate optimization recommendations based on current state
   * 
   * @param {Array} workloads - Collector workload data
   * @param {Array} grievances - Current grievances
   * @returns {Array} List of recommendations
   * @private
   */
  _generateRecommendations(workloads, grievances) {
    const recommendations = [];

    // Check for unassigned grievances
    const unassigned = grievances.filter(g => !g.assignedTo).length;
    if (unassigned > 0) {
      recommendations.push({
        type: "assignment",
        priority: "high",
        message: `${unassigned} grievances are unassigned and need immediate attention`
      });
    }

    // Check for workload imbalance
    const workloadScores = workloads.map(w => w.workloadScore);
    const maxWorkload = Math.max(...workloadScores);
    const minWorkload = Math.min(...workloadScores);
    
    if (maxWorkload - minWorkload > 5) {
      recommendations.push({
        type: "rebalance",
        priority: "medium",
        message: "Workload is imbalanced between collectors. Consider redistributing grievances"
      });
    }

    // Check for overloaded collectors
    const overloaded = workloads.filter(w => w.availableCapacity <= 0);
    if (overloaded.length > 0) {
      recommendations.push({
        type: "capacity",
        priority: "high",
        message: `${overloaded.length} collectors are at full capacity. Consider adding more collectors or redistributing workload`
      });
    }

    // Check for critical/escalated grievances
    const critical = grievances.filter(g => g.severity === "Critical" || g.isEscalated).length;
    if (critical > 0) {
      recommendations.push({
        type: "urgent",
        priority: "critical",
        message: `${critical} grievances require urgent attention due to high severity or escalation`
      });
    }

    return recommendations;
  }
}

// Export singleton instance following Singleton pattern
const routeOptimizer = new IRouteOptimizer();
export default routeOptimizer;
