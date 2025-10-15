import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserDrawer from "../components/UserDrawer";
import SliderComponent from "../components/Slider";
import { DollarSign, TrendingUp, Trash, CreditCard, AlertTriangle } from "lucide-react";
import { getUserTransactions } from "../../../api/transactionApi";
import { getUserAllGarbages } from "../../../api/garbageApi";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [paidTransactions, setPaidTransactions] = useState([]);
  const [garbageCount, setGarbageCount] = useState(0);

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

  const fetchAllUserGarbages = async () => {
    try {
      const garbages = await getUserAllGarbages();
      setGarbageCount(garbages.length);
    } catch (error) {
      console.error("Error fetching garbages: ", error.message);
    }
  };

  useEffect(() => {
    fetchAllUserGarbages();
    fetchAllUserTransactions();
  }, []);

  // Calculate totals above metrics array
  const totalUnpaidAmount = transactions.reduce((acc, transaction) => {
    return acc + (transaction.isPaid ? 0 : transaction.amount);
  }, 0);

  const totalPaidAmount = paidTransactions.reduce((acc, transaction) => {
    return acc + (transaction.isPaid ? transaction.amount : 0);
  }, 0);

  const metrics = [
    {
      title: "Total spent",
      value: totalPaidAmount ? totalPaidAmount : 0,
      icon: <DollarSign className="h-6 w-6 text-green-500" />,
      color: "border-l-green-500",
    },
    {
      title: "Total unpaid",
      value: totalUnpaidAmount ? totalUnpaidAmount : 0,
      icon: <TrendingUp className="h-6 w-6 text-red-500" />,
      color: "border-l-red-500",
    },
    {
      title: "Garbage Requests",
      value: garbageCount,
      icon: <Trash className="h-6 w-6 text-orange-500" />,
      color: "border-l-orange-500",
    },
    // {
    //   title: "Costs",
    //   value: "24.58 $",
    //   icon: <CreditCard className="h-6 w-6 text-red-500" />,
    //   color: "border-l-red-500",
    // },
  ];

  return (
    <UserDrawer>
      <div className="p-6 bg-gray-100">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/user/my-bin")}
              className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
            >
              <div className="p-2 bg-blue-600 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Manage Smart Bin</p>
                <p className="text-sm text-gray-600">Control sensor & view history</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/user/grievances/create")}
              className="flex items-center space-x-3 p-4 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
            >
              <div className="p-2 bg-red-600 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Report Issue</p>
                <p className="text-sm text-gray-600">Submit collection grievance</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/user/my-transaction")}
              className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
            >
              <div className="p-2 bg-green-600 rounded-lg">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">View Transactions</p>
                <p className="text-sm text-gray-600">Payment history & bills</p>
              </div>
            </button>
          </div>
        </div>

        <SliderComponent />
      </div>
    </UserDrawer>
  );
};

const MetricCard = ({ title, value, icon, color }) => (
  <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
        <p className="text-3xl font-semibold mt-1">{value}</p>
      </div>
      <div
        className={`p-3 rounded-full ${color
          .replace("border-l-", "bg-")
          .replace("500", "100")}`}
      >
        {icon}
      </div>
    </div>
  </div>
);

export default UserDashboard;
