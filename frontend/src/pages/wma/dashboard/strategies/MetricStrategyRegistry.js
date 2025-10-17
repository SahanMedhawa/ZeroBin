/**
 * MetricStrategyRegistry
 *
 * Registry for metric rendering strategies following the Strategy Pattern.
 * Implements Open/Closed Principle - open for extension, closed for modification.
 *
 * New metric types can be added without modifying existing code.
 */
class MetricStrategyRegistry {
  constructor() {
    this.strategies = new Map();
  }

  /**
   * Register a new metric rendering strategy
   * @param {string} type - Unique identifier for the strategy
   * @param {Object} strategy - Strategy object with render method
   */
  register(type, strategy) {
    if (!strategy.render || typeof strategy.render !== "function") {
      throw new Error(`Strategy for type "${type}" must have a render method`);
    }
    this.strategies.set(type, strategy);
    return this;
  }

  /**
   * Get a registered strategy
   * @param {string} type - Strategy identifier
   * @returns {Object} Strategy object
   */
  getStrategy(type) {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      console.warn(`No strategy found for type: ${type}`);
      return this.strategies.get("default");
    }
    return strategy;
  }

  /**
   * Check if a strategy is registered
   * @param {string} type - Strategy identifier
   * @returns {boolean}
   */
  hasStrategy(type) {
    return this.strategies.has(type);
  }

  /**
   * Get all registered strategy types
   * @returns {Array<string>}
   */
  getRegisteredTypes() {
    return Array.from(this.strategies.keys());
  }
}

export const metricStrategyRegistry = new MetricStrategyRegistry();
