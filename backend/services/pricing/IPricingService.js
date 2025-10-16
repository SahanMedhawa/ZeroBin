// Interface Segregation & DIP: abstract contract for pricing
export default class IPricingService {
  // eslint-disable-next-line no-unused-vars
  computeCharge(area, weightKg, materialType) {
    throw new Error("NotImplemented: computeCharge(area, weightKg, materialType)");
  }
}