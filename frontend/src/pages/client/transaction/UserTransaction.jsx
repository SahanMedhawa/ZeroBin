import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import UserDrawer from "../components/UserDrawer";
import {
  getUserTransactions,
  updateTransaction,
} from "../../../api/transactionApi";
import { toast } from "react-toastify"; // Assuming react-toastify is used for notifications
import PaymentGateway from "../components/PaymentGateway";

const UserTransaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [paidTransactions, setPaidTransactions] = useState([]);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

  const fetchAllUserTransactions = async () => {
    try {
      const res = await getUserTransactions();
      const unpaidTransactions = res.filter(
        (transaction) => !transaction.isPaid
      );
      setTransactions(unpaidTransactions);
      const paidTransactions = res.filter(
        (paidTransaction) => paidTransaction.isPaid
      );
      setPaidTransactions(paidTransactions);
      // console.log(`paidTransactions => `, paidTransactions);
    } catch (error) {
      toast.error(error.message, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      console.error("Error fetching transactions: ", error.message);
    }
  };

  useEffect(() => {
    fetchAllUserTransactions();
  }, []);

  const handleCheckboxChange = (transactionId) => {
    setSelectedTransactions((prevSelected) =>
      prevSelected.includes(transactionId)
        ? prevSelected.filter((id) => id !== transactionId)
        : [...prevSelected, transactionId]
    );
  };

  const handleMakePaidClick = () => {
    if (selectedTransactions.length === 0) {
      toast.error("Please select at least one transaction", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return;
    }
    setPaymentModalOpen(true);
  };

  const handleClosePayment = () => {
    setPaymentModalOpen(false);
  };

  const handlePaymentSubmit = async () => {
    try {
      await Promise.all(
        selectedTransactions.map((transactionId) =>
          updateTransaction(transactionId)
        )
      );
      toast.success("Payments marked as successful", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      setPaymentModalOpen(false);
      setSelectedTransactions([]);
      fetchAllUserTransactions();
    } catch (error) {
      toast.error("Payment failed");
    }
  };

  // Calculate the summary based on selected transactions
  const selectedSummary = transactions.reduce(
    (acc, transaction) => {
      if (selectedTransactions.includes(transaction._id)) {
        if (transaction.isRefund) {
          acc.refunded += transaction.amount;
        } else {
          acc.toBePaid += transaction.amount;
        }
      }
      return acc;
    },
    { refunded: 0, toBePaid: 0 }
  );

  selectedSummary.total = selectedSummary.toBePaid - selectedSummary.refunded;

  const totalUnpaidAmount = transactions.reduce((acc, transaction) => {
    return acc + (transaction.isPaid ? 0 : transaction.amount);
  }, 0);

  const totalPaidAmount = paidTransactions.reduce((acc, transaction) => {
    return acc + (transaction.isPaid ? transaction.amount : 0);
  }, 0);

  function getTypeClassName(type) {
    switch (type) {
      case true:
        return "bg-green-100 text-green-800";
      case false:
        return "bg-red-100 text-red-800";
      default:
        return "";
    }
  }

  console.log(`transaction => `, transactions);

  return (
    <UserDrawer>
      <div className="mb-6 p-4 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Summary</h2>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-yellow-100 p-5 rounded-lg text-left flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-600">
              Total Amount To Be Paid
            </h3>
            <p className="text-[35px] font-bold text-yellow-600">
              LKR {totalUnpaidAmount}.00
            </p>
          </div>

          <div className="bg-green-100 p-5 rounded-lg text-left flex items-center justify-between">
            <div className="flex flex-col justify-start items-start">
              <h3 className="text-lg font-semibold text-gray-600">
                Total Amount Paid
              </h3>
              <Link to="/user/my-transaction/history">
                <button
                  onClick={() => console.log("View Transaction History")}
                  className="bg-gray-600 text-white mt-2 py-2.5 px-4 rounded-lg hover:bg-gray-700"
                >
                  View Transactions History
                </button>
              </Link>
            </div>
            <p className="text-[35px] font-bold text-green-600">
              LKR {totalPaidAmount}.00
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-row gap-3">
        {/* Item Details */}
        <div className="mb-6 p-6 bg-white shadow-md rounded-lg">
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Transaction Details
            </h2>
            <p className="text-gray-500">Details transaction with more info</p>
          </div>
          <div className="space-y-4">
            {transactions.length > 0 ? (
              transactions
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((transaction) => (
                  <div
                    className="grid grid-cols-4 items-center py-3 border-b"
                    key={transaction._id}
                  >
                    <div className="col-span-1 flex items-center space-x-7">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.includes(transaction._id)}
                        onChange={() => handleCheckboxChange(transaction._id)}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <p className="text-gray-800 font-semibold">
                        {transaction.description}
                      </p>
                    </div>
                    <div className="col-span-1 text-center text-gray-600">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </div>
                    <div className="col-span-1 text-center ">
                      <span
                        className={`uppercase font-semibold text-[12px] px-2.5 py-0.5 rounded ${getTypeClassName(
                          transaction.isPaid
                        )}`}
                      >
                        {transaction.isPaid ? "Paid" : "Not Paid"}
                      </span>
                    </div>
                    <div
                      className={`col-span-1 text-right font-semibold ${
                        transaction.isRefund ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      LKR {transaction.amount}.00
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-md text-gray-600 font-semibold text-center py-4">
                No unpaid transaction requests found!
              </p>
            )}
          </div>
        </div>
        {/* Summary Details */}
        <div className="p-6 bg-white shadow-md rounded-lg mb-6 w-[45%] h-fit">
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-lg font-semibold text-gray-700">Subtotal</p>
            <p className="text-lg text-gray-800">
              LKR {selectedSummary.toBePaid}.00
            </p>
          </div>
          <div className="flex items-center justify-between py-2">
            <p className="text-lg font-semibold text-gray-700">Discount</p>
            <p className="text-lg text-gray-500 cursor-pointer">LKR 0.00</p>
          </div>
          <div className="flex items-center justify-between py-2">
            <p className="text-lg font-semibold text-gray-700">Tax</p>
            <p className="text-lg text-gray-500 cursor-pointer">LKR 0.00</p>
          </div>
          <div className="flex items-center justify-between border-t pt-4 mb-5">
            <p className="text-xl font-semibold text-green-600">Total</p>
            <p className="text-xl font-bold text-green-700">
              LKR {selectedSummary.total}.00
            </p>
          </div>
          {/* Payment Button */}
          <div className="flex justify-center">
            <button
              onClick={handleMakePaidClick}
              className="bg-green-600 text-white w-full py-2.5 rounded-lg hover:bg-green-700"
            >
              Make Payment
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <PaymentGateway
          onSubmitPayment={handlePaymentSubmit}
          onClose={handleClosePayment}
        />
      )}
    </UserDrawer>
  );
};

export default UserTransaction;
