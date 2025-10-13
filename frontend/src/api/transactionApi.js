import ApiHelper from "../helpers/apiHelper";

/**
 * Creates a new transaction.
 *
 * @async
 * @function createTransaction
 * @param {Object} transaction - The transaction data to create.
 * @returns {Promise<Object>} A promise that resolves to the created transaction object.
 * @throws Will throw an error if the creation operation fails.
 */
const createTransaction = async (transaction) => {
  try {
    const createdTransaction = await new ApiHelper().post(
      "transactions",
      transaction
    );
    return createdTransaction;
  } catch (error) {
    console.error("Error creating transaction:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

/**
 * Fetches all transactions.
 *
 * @async
 * @function getAllTransactions
 * @returns {Promise<Object[]>} A promise that resolves to an array of transaction objects.
 * @throws Will throw an error if the fetch operation fails.
 */
const getAllTransactions = async () => {
  try {
    const transactions = await new ApiHelper().get("transactions", {});
    return transactions;
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

/**
 * Fetches transactions for the current user.
 *
 * @async
 * @function getUserTransactions
 * @returns {Promise<Object[]>} A promise that resolves to an array of transaction objects.
 * @throws Will throw an error if the fetch operation fails.
 */
const getUserTransactions = async () => {
  try {
    const userTransactions = await new ApiHelper().get(`transactions/user`, {});
    return userTransactions;
  } catch (error) {
    console.error("Error fetching user transactions:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

/**
 * Fetches a transaction by its ID.
 *
 * @async
 * @function getTransactionById
 * @param {string} id - The ID of the transaction to fetch.
 * @returns {Promise<Object>} A promise that resolves to the transaction object.
 * @throws Will throw an error if the fetch operation fails.
 */
const getTransactionById = async (id) => {
  try {
    const transaction = await new ApiHelper().get(`transactions/${id}`, {});
    return transaction;
  } catch (error) {
    console.error("Error fetching transaction:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

/**
 * Fetches transactions for a given user ID.
 *
 * @async
 * @function getTransactionsByUserId
 * @param {string} userId - The ID of the user whose transactions are to be fetched.
 * @returns {Promise<Object[]>} A promise that resolves to an array of transaction objects.
 * @throws Will throw an error if the fetch operation fails.
 */
const getTransactionsByUserId = async (userId) => {
  try {
    const transactions = await new ApiHelper().get(
      `transactions/${userId}`,
      {}
    );
    return transactions;
  } catch (error) {
    console.error("Error fetching transactions by user ID:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

/**
 * Updates a transaction to mark it as paid.
 *
 * @async
 * @function updateTransaction
 * @param {string} id - The ID of the transaction to update.
 * @returns {Promise<Object>} The updated transaction object.
 * @throws Will throw an error if the update operation fails.
 */
const updateTransaction = async (id) => {
  try {
    const updatedTransaction = await new ApiHelper().put(`transactions/${id}`, {
      isPaid: true,
    });
    return updatedTransaction;
  } catch (error) {
    console.error("Error updating transaction:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

export {
  createTransaction,
  getAllTransactions,
  getUserTransactions,
  getTransactionById,
  getTransactionsByUserId,
  updateTransaction,
};
