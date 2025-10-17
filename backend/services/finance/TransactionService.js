// Single Responsibility: encapsulate all transaction rules
import ITransactionService from "./ITransactionService.js";
import Transaction from "../../models/transactionModel.js";
import User from "../../models/userModel.js";

const roundTo = (n, scale = 2) => Number(Number(n).toFixed(scale));

export default class TransactionService extends ITransactionService {
  constructor({ currency = "LKR", scale = 2 } = {}) {
    super();
    this.currency = currency;
    this.scale = scale;
  }

  async #ensureUser(userId) {
    if (!userId) throw new Error("Missing userId");
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    return user;
  }

  toDTO(tx) {
    return {
      id: tx._id?.toString(),
      _id: tx._id?.toString(),
      user: tx.user,
      description: tx.description,
      isRefund: tx.isRefund,
      isPaid: tx.isPaid,
      amount: roundTo(tx.amount, this.scale),
      currency: this.currency,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
    };
  }

  async createManual({ userId, description, amount, isPaid = false, isRefund = false }) {
    await this.#ensureUser(userId);

    if (!description || typeof description !== "string") {
      throw new Error("Invalid description");
    }
    if (!Number.isFinite(Number(amount)) || Number(amount) < 0) {
      throw new Error("Invalid amount");
    }

    const tx = new Transaction({
      user: userId,
      description,
      isPaid: Boolean(isPaid),
      isRefund: Boolean(isRefund),
      amount: roundTo(amount, this.scale),
    });

    const saved = await tx.save();
    return this.toDTO(saved);
  }

  async createFromPAYT({ userId, bin, quote }) {
    await this.#ensureUser(userId);

    if (!quote || !Number.isFinite(Number(quote.amount))) {
      throw new Error("Invalid PAYT quote");
    }

    const description = `Garbage Collection (${bin?.type || "Unknown"}) - ${bin?.binId || bin?._id}`;
    const tx = new Transaction({
      user: userId,
      description,
      isPaid: false,
      isRefund: false,
      amount: roundTo(quote.amount, this.scale),
    });

    const saved = await tx.save();
    return this.toDTO(saved);
  }

  async markPaid(transactionId, paymentMeta = {}) {
    const tx = await Transaction.findById(transactionId);
    if (!tx) throw new Error("Transaction not found");
    tx.isPaid = true;
    // Optionally attach simple audit fields
    if (paymentMeta?.note) tx.description = `${tx.description} (Paid: ${paymentMeta.note})`;
    const saved = await tx.save();
    return this.toDTO(saved);
  }

  async getUserTotals(userId) {
    await this.#ensureUser(userId);
    const [agg] = await Transaction.aggregate([
      { $match: { user: Transaction.db.castObjectId(userId) } },
      {
        $group: {
          _id: "$user",
          totalPaid: { $sum: { $cond: ["$isPaid", "$amount", 0] } },
          totalUnpaid: { $sum: { $cond: ["$isPaid", 0, "$amount"] } },
        },
      },
    ]);
    return {
      totalPaid: roundTo(agg?.totalPaid || 0, this.scale),
      totalUnpaid: roundTo(agg?.totalUnpaid || 0, this.scale),
      currency: this.currency,
    };
  }
}