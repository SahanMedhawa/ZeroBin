// Single Responsibility: configuration only
const parseNumber = (val, def) => {
  const n = Number(val);
  return Number.isFinite(n) ? n : def;
};

export default {
  multipliers: Object.freeze({
    "Recyclable": parseNumber(process.env.RECYCLABLE_MULTIPLIER, 0.8),
    "Non-Recyclable": parseNumber(process.env.NON_RECYCLABLE_MULTIPLIER, 1.0),
  }),
  currency: "LKR",
  scale: 2, // round to 2 decimals
};