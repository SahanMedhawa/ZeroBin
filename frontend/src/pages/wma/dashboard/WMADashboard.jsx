import React, { useEffect, useState } from "react";
import WMADrawer from "../components/WMADrawer";
import SliderComponent from "../components/Slider";
import { DollarSign, TrendingUp, Trash } from "lucide-react";
import { getAllCollectorsInWma} from "../../../api/collectorApi"
import { getAllSchedulesInWma } from "../../../api/scheduleApi"; 
import AuthService from "../../../api/wmaApi";

const WMADashboard = () => {
  const [totalIncome, setTotalIncome] = useState(15000); 
  const [totalSchedules, setTotalSchedules] = useState(0);
  const [registeredCollectors, setRegisteredCollectors] = useState(0);
  const [wmaId, setWmaId] = useState(null); 


  useEffect(() => {
    const fetchData = async () => {
      try {
        const wmaDetails  = await AuthService.getCurrentWmaDetails();
        const currentWmaId = wmaDetails._id;
        setWmaId(currentWmaId); 

        // Fetch total schedules
        const schedules = await getAllSchedulesInWma(currentWmaId);
        setTotalSchedules(schedules.length); 

        // Fetch total collectors
        const collectors = await getAllCollectorsInWma(currentWmaId);
        setRegisteredCollectors(collectors.length); 

      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    fetchData();
  }, []); // Run this effect once on component mount

  const metrics = [
    {
      title: "Total Income",
      value: `$${totalIncome.toLocaleString()}`,
      icon: <DollarSign className="h-6 w-6 text-white" />,
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50",
    },
    {
      title: "Total Schedules",
      value: totalSchedules,
      icon: <TrendingUp className="h-6 w-6 text-white" />,
      gradient: "from-purple-500 to-indigo-600",
      bgGradient: "from-purple-50 to-indigo-50",
    },
    {
      title: "Registered Collectors",
      value: registeredCollectors,
      icon: <Trash className="h-6 w-6 text-white" />,
      gradient: "from-orange-500 to-amber-600",
      bgGradient: "from-orange-50 to-amber-50",
    },
  ];

  return (
    <WMADrawer>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-indigo-800 bg-clip-text text-transparent mb-2">
            WMA Dashboard
          </h1>
          <p className="text-gray-600">Welcome back! Here's your overview.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>
        <SliderComponent />
      </div>
    </WMADrawer>
  );
};

const MetricCard = ({ title, value, icon, gradient, bgGradient }) => (
  <div className={`bg-gradient-to-br ${bgGradient} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">{title}</p>
        <p className="text-4xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent">{value}</p>
      </div>
      <div className={`p-4 rounded-xl bg-gradient-to-r ${gradient} shadow-lg`}>
        {icon}
      </div>
    </div>
  </div>
);

export default WMADashboard;
