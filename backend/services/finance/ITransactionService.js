// Dependency Inversion: controller depends on this abstraction
export default class ITransactionService {
  // Create a manual transaction (admin/ops)
  // eslint-disable-next-line no-unused-vars
  async createManual({ userId, description, amount, isPaid = false, isRefund = false }) {
    throw new Error("NotImplemented: createManual");
  }

  // Create a transaction from a PAYT quote at collection time
  // eslint-disable-next-line no-unused-vars
  async createFromPAYT({ userId, bin, quote }) {
    throw new Error("NotImplemented: createFromPAYT");
  }

  // Mark as paid with optional metadata
  // eslint-disable-next-line no-unused-vars
  async markPaid(transactionId, paymentMeta) {
    throw new Error("NotImplemented: markPaid");
  }

  // Summaries for dashboards
  // eslint-disable-next-line no-unused-vars
  async getUserTotals(userId) {
    throw new Error("NotImplemented: getUserTotals");
  }

  // Map entity → DTO
  // eslint-disable-next-line no-unused-vars
  toDTO(transaction) {
    throw new Error("NotImplemented: toDTO");
  }
}