import React, { useState, useEffect } from "react";
import AdminDrawer from "../components/AdminDrawer";
import { getAllTransactions } from "../../../api/transactionApi";
import TransactionHistoryModal from "../components/TransactionHistoryModal";
import { toast, ToastContainer } from "react-toastify";

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState({ totalPaid: 0, totalNotPaid: 0 });
  const [userTransactions, setUserTransactions] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchAllTransactions = async () => {
    try {
      setLoading(true);
      const res = await getAllTransactions();
      setTransactions(res);
      calculateTotals(res);
      groupTransactionsByUser(res);
    } catch (error) {
      toast.error("Failed to fetch transactions: " + error.message, {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTransactions();
  }, []);

  const calculateTotals = (transactions) => {
    let totalPaid = 0;
    let totalNotPaid = 0;

    transactions.forEach((transaction) => {
      if (transaction.isPaid) {
        totalPaid += transaction.amount;
      } else {
        totalNotPaid += transaction.amount;
      }
    });

    setTotals({ totalPaid, totalNotPaid });
  };

  const groupTransactionsByUser = (transactions) => {
    const userMap = {};

    transactions.forEach((transaction) => {
      const userId = transaction.user ? transaction.user.email : "Unknown User";
      if (!userMap[userId]) {
        userMap[userId] = {
          totalPaid: 0,
          totalNotPaid: 0,
          transactions: [],
          user: transaction.user,
        };
      }

      if (transaction.isPaid) {
        userMap[userId].totalPaid += transaction.amount;
      } else {
        userMap[userId].totalNotPaid += transaction.amount;
      }

      userMap[userId].transactions.push(transaction);
    });

    setUserTransactions(userMap);
  };

  const handleViewTransactions = (userId) => {
    setSelectedUser(userTransactions[userId]);
    setIsModalOpen(true);
  };

  const filteredUserTransactions = Object.keys(userTransactions).filter((userEmail) => {
    const user = userTransactions[userEmail];
    const matchesSearch = userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.user?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === "paid") {
      matchesStatus = user.totalPaid > 0;
    } else if (statusFilter === "unpaid") {
      matchesStatus = user.totalNotPaid > 0;
    }

    return matchesSearch && matchesStatus;
  });

  const metrics = [
    {
      title: "Total Paid",
      value: `LKR ${totals.totalPaid.toLocaleString()}`,
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-emerald-600 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50",
      isText: true,
    },
    {
      title: "Outstanding",
      value: `LKR ${totals.totalNotPaid.toLocaleString()}`,
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      gradient: "from-red-600 to-rose-600",
      bgGradient: "from-red-50 to-rose-50",
      isText: true,
    },
    {
      title: "Total Users",
      value: Object.keys(userTransactions).length,
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      gradient: "from-blue-900 to-blue-800",
      bgGradient: "from-blue-50 to-indigo-50",
    },
  ];

  return (
    <AdminDrawer>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-indigo-800 bg-clip-text text-transparent mb-2">
            Transaction Management
          </h1>
          <p className="text-gray-600">Monitor payments and outstanding balances</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                placeholder="Search by email or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
              >
                <option value="">All Transactions</option>
                <option value="paid">Has Paid Transactions</option>
                <option value="unpaid">Has Outstanding Balance</option>
              </select>
            </div>

            <div>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("");
                }}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || statusFilter) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-2 hover:text-blue-600"
                  >
                    ×
                  </button>
                </span>
              )}
              {statusFilter && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-100 text-emerald-800">
                  Status: {statusFilter === "paid" ? "Has Paid" : "Has Outstanding"}
                  <button
                    onClick={() => setStatusFilter("")}
                    className="ml-2 hover:text-emerald-600"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Transaction Summary ({filteredUserTransactions.length} users)
            </h3>
        </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Total Paid</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Outstanding</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Transactions</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-2 text-gray-500">Loading transactions...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUserTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No transactions found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredUserTransactions.map((userEmail) => {
                    const user = userTransactions[userEmail];
                    return (
                      <tr key={userEmail} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {user.user?.username?.charAt(0)?.toUpperCase() || userEmail.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {user.user?.username || "Unknown User"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {user.transactions.length} transaction{user.transactions.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                  </td>
                        <td className="px-6 py-4 text-gray-600">{userEmail}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            LKR {user.totalPaid.toLocaleString()}
                          </span>
                  </td>
                  <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.totalNotPaid > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            LKR {user.totalNotPaid.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {user.transactions.length} transactions
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                            onClick={() => handleViewTransactions(userEmail)}
                            className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm font-medium"
                    >
                      View History
                    </button>
                  </td>
                </tr>
                    );
                  })
            )}
          </tbody>
        </table>
          </div>
        </div>

        {/* Transaction History Modal */}
        {isModalOpen && (
          <TransactionHistoryModal
            user={selectedUser}
            onClose={() => setIsModalOpen(false)}
          />
        )}

        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </AdminDrawer>
  );
};

const MetricCard = ({ title, value, icon, gradient, bgGradient, isText = false }) => (
  <div className={`bg-gradient-to-br ${bgGradient} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">{title}</p>
        {isText ? (
          <p className="text-lg font-bold text-gray-800 truncate">
            {value}
          </p>
        ) : (
          <p className={`text-4xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>{value}</p>
        )}
      </div>
      <div className={`p-4 rounded-xl bg-gradient-to-r ${gradient} shadow-lg`}>
        {icon}
      </div>
    </div>
  </div>
);

export default AdminTransactions;