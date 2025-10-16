// Single Responsibility: pricing computation only
import IPricingService from "./IPricingService.js";

export default class PayAsYouThrowPricingService extends IPricingService {
  constructor({ multipliers, scale = 2, currency = "LKR" }) {
    super();
    this.multipliers = multipliers;
    this.scale = scale;
    this.currency = currency;
  }

  computeCharge(area, weightKg, materialType) {
    if (!area || typeof area.basePerKgRate !== "number") {
      throw new Error("Invalid area or basePerKgRate");
    }
    if (!(materialType in this.multipliers)) {
      throw new Error("Invalid materialType");
    }
    if (!Number.isFinite(weightKg) || weightKg <= 0) {
      throw new Error("Invalid weightKg");
    }

    const rate = area.basePerKgRate;
    const multiplier = this.multipliers[materialType];
    const amount = rate * weightKg * multiplier;
    const rounded = Number(amount.toFixed(this.scale));

    return {
      amount: rounded,
      currency: this.currency,
      basePerKgRate: rate,
      multiplier,
    };
  }
}