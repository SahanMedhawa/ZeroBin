import Transaction from "../models/transactionModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import User from "../models/userModel.js";
import TransactionService from "../services/finance/TransactionService.js";

// DIP: depend on service abstraction (concrete injected here)
const transactionService = new TransactionService({ currency: "LKR", scale: 2 });

// @desc    Create a new transaction
// @route   POST /api/transactions
/**
 * Creates a new transaction for a user.
 *
 * @async
 * @function createTransaction
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.userID - The ID of the user.
 * @param {string} req.body.description - The description of the transaction.
 * @param {boolean} req.body.isRefund - Indicates if the transaction is a refund.
 * @param {boolean} req.body.isPaid - Indicates if the transaction is paid.
 * @param {number} req.body.amount - The amount of the transaction.
 * @param {Object} res - The response object.
 * @throws Will throw an error if the user is not found.
 * @throws Will throw an error if the transaction creation fails.
 * @returns {Promise<void>} - Returns a promise that resolves to void.
 */
const createTransaction = asyncHandler(async (req, res) => {
  // Accept both userID (preferred) and user for compatibility
  const userId = req.body.userID || req.body.user;
  const { description, isRefund = false, isPaid = false, amount } = req.body;

  const dto = await transactionService.createManual({
    userId,
    description,
    amount,
    isPaid,
    isRefund,
  });

  res.status(201).json(dto);
});

/**
 * Retrieves all transactions from the database, populates user details, and sorts them by creation date in descending order.
 *
 * @function getAllTransactions
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Returns a JSON response with the list of transactions.
 */
const getAllTransactions = asyncHandler(async (req, res) => {
  // Get all transactions (admin) — map to DTO for consistency
  const transactions = await Transaction.find({})
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  const dtos = transactions.map((t) => transactionService.toDTO(t));
  res.status(200).json(dtos);
});

/**
 * Get a transaction by its ID.
 *
 * This function retrieves a transaction from the database using the provided ID
 * and populates the user field with the user's name and email. If the transaction
 * is found, it returns the transaction data with a 200 status code. If not, it
 * returns a 404 status code with a "Transaction not found" message.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.id - The ID of the transaction to retrieve.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the response is sent.
 */
const getTransactionById = asyncHandler(async (req, res) => {
  // Get a transaction by ID — map to DTO
  const transaction = await Transaction.findById(req.params.id).populate("user", "name email");
  if (transaction) {
    return res.status(200).json(transactionService.toDTO(transaction));
  }
  res.status(404).json({ message: "Transaction not found" });
});

/**
 * Retrieves all transactions for a specific user.
 *
 * This function fetches all transactions associated with the authenticated user,
 * populates the user details, and sorts them by creation date in descending order.
 * If transactions are found, it returns them with a 200 status code. If no transactions
 * are found, it returns a 404 status code with a "No transactions found for this user" message.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the response is sent.
 */
const getTransactionsByUser = asyncHandler(async (req, res) => {
  // Get transactions for current user — map to DTO
  const transactions = await Transaction.find({ user: req.user._id })
    .populate("user", "username email")
    .sort({ createdAt: -1 });

  if (transactions.length > 0) {
    return res.status(200).json(transactions.map((t) => transactionService.toDTO(t)));
  }
  res.status(404).json({ message: "No transactions found for this user" });
});

/**
 * Retrieves all transactions for a specific user by user ID.
 *
 * This function fetches all transactions associated with the provided user ID,
 * populates the user details, and sorts them by creation date in descending order.
 * If transactions are found, it returns them with a 200 status code. If no transactions
 * are found, it returns a 404 status code with a "No transactions found for this user" message.
 *
 * @param {Object} req - The request object, which should contain the user ID in the params.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the response is sent.
 */
const getTransactionsByUserId = asyncHandler(async (req, res) => {
  // Get transactions by userId (admin) — map to DTO
  const transactions = await Transaction.find({ user: req.params.userId })
    .populate("user", "username email")
    .sort({ createdAt: -1 });

  if (transactions.length > 0) {
    return res.status(200).json(transactions.map((t) => transactionService.toDTO(t)));
  }
  res.status(404).json({ message: "No transactions found for this user" });
});

/**
 * Updates a transaction's payment status.
 *
 * This function updates the payment status of a transaction identified by its ID.
 * If the transaction is found, it updates the `isPaid` field with the provided value
 * and saves the updated transaction. If the transaction is not found, it returns a
 * 404 status code with a "Transaction not found" message.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.id - The ID of the transaction to update.
 * @param {Object} req.body - The body of the request.
 * @param {boolean} req.body.isPaid - The new payment status of the transaction.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the response is sent.
 */
const updateTransaction = asyncHandler(async (req, res) => {
  const { isPaid } = req.body;
  const id = req.params.id;

  if (isPaid === true) {
    const dto = await transactionService.markPaid(id, { note: "via user portal" });
    return res.status(200).json(dto);
  }

  // fallback to minimal update when not marking as paid
  const transaction = await Transaction.findById(id);
  if (transaction) {
    transaction.isPaid = isPaid !== undefined ? isPaid : transaction.isPaid;
    const updated = await transaction.save();
    return res.status(200).json(transactionService.toDTO(updated));
  }
  res.status(404).json({ message: "Transaction not found" });
});

export {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  getTransactionsByUser,
  getTransactionsByUserId,
  updateTransaction,
};
