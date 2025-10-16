import React, { useState, useEffect } from "react";
import AdminDrawer from "../components/AdminDrawer";
import AuthService from "../../../api/wmaApi";
import { getAllCollectorsInWma } from "../../../api/collectorApi";
import { ToastContainer, toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function AdminWMAs() {
  const [wmas, setWMAs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedWMAId, setSelectedWMAId] = useState(null);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredWMAs = wmas.filter((wma) =>
    wma.wmaname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wma.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wma.authNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (id) => {
    setSelectedWMAId(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteWMA = async () => {
    if (selectedWMAId) {
      try {
        setLoading(true);
        await AuthService.deleteWma(selectedWMAId);
        setWMAs((currentWMA) =>
          currentWMA.filter((wma) => wma._id !== selectedWMAId)
        );
        setDeleteModalOpen(false);
        toast.success("WMA account deleted successfully!", {
          position: "bottom-right",
          autoClose: 3000,
        });
      } catch (error) {
        toast.error("Failed to delete WMA: " + error.message, {
          position: "bottom-right",
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchAllWMAs = async () => {
    try {
      setLoading(true);
      const res = await AuthService.getAllWmas();

      const wmasWithCollectorCounts = await Promise.all(
        res.map(async (wma) => {
          try {
          const collectors = await getAllCollectorsInWma(wma._id);
          return {
            ...wma,
            collectorCount: collectors.length,
          };
          } catch (error) {
            return {
              ...wma,
              collectorCount: 0,
            };
          }
        })
      );
      setWMAs(wmasWithCollectorCounts);
    } catch (error) {
      toast.error("Failed to fetch WMAs: " + error.message, {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllWMAs();
  }, []);

  const calculateTotalWMAs = () => {
    return wmas.length;
  };

  const getTotalCollectors = () => {
    return wmas.reduce((total, wma) => total + wma.collectorCount, 0);
  };

  const findWMAWithHighestCollectors = () => {
    if (wmas.length === 0) return "N/A";
    const wmaWithHighestCollectors = wmas.reduce((maxWMA, currentWMA) =>
      currentWMA.collectorCount > maxWMA.collectorCount ? currentWMA : maxWMA
    );
    return wmaWithHighestCollectors.wmaname;
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    // Header
      doc.setFont("helvetica", "bold");
    doc.setTextColor("59", "130", "246");
    doc.setFontSize(20);
    doc.text("ZeroBin Admin Portal", 14, 20);

      doc.setFont("helvetica", "normal");
    doc.setTextColor("0", "0", "0");
    doc.setFontSize(16);
    doc.text("WMA Management Report", 14, 35);

      doc.setFontSize(11);
      doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 45);
    doc.text(`Total WMAs: ${calculateTotalWMAs()}`, 14, 55);
    doc.text(`Total Collectors: ${getTotalCollectors()}`, 14, 65);

    // Table data
    const tableData = filteredWMAs.map((wma) => [
      wma.wmaname,
      wma.email,
      wma.authNumber,
      wma.collectorCount.toString(),
      wma.address || "N/A",
      wma.contact || "N/A",
    ]);

      autoTable(doc, {
      startY: 75,
      head: [["WMA Name", "Email", "Auth Number", "Collectors", "Address", "Contact"]],
      body: tableData,
        theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
    });

      const generatedDate = new Date().toLocaleDateString().replace(/\//g, "-");
    doc.save(`WMA_Report_${generatedDate}.pdf`);
    toast.success("Report generated successfully!", {
        position: "bottom-right",
        autoClose: 3000,
      });
    };

  const metrics = [
    {
      title: "Total WMAs",
      value: calculateTotalWMAs(),
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      gradient: "from-blue-900 to-blue-800",
      bgGradient: "from-blue-50 to-indigo-50",
    },
    {
      title: "Total Collectors",
      value: getTotalCollectors(),
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      gradient: "from-emerald-600 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50",
    },
    {
      title: "Top Performer",
      value: findWMAWithHighestCollectors(),
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      gradient: "from-purple-600 to-indigo-600",
      bgGradient: "from-purple-50 to-indigo-50",
      isText: true,
    },
  ];

  return (
      <AdminDrawer>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-indigo-800 bg-clip-text text-transparent mb-2">
            WMA Management
        </h1>
          <p className="text-gray-600">Manage Waste Management Authorities and their operations</p>
          </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
          </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1">
          <input
            type="text"
                placeholder="Search by WMA name, email, or authorization number..."
            value={searchTerm}
            onChange={handleSearchChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
            <button
              onClick={downloadPDF}
              className="px-6 py-3 bg-gradient-to-r from-blue-900 to-indigo-800 text-white rounded-xl font-semibold hover:from-blue-800 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Report
            </button>
          </div>

          {/* Active Filters */}
          {searchTerm && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-2 hover:text-blue-600"
                >
                  ×
                </button>
              </span>
            </div>
          )}
        </div>

        {/* WMAs Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Registered WMAs ({filteredWMAs.length})
            </h3>
          </div>
          
          {/* Desktop Table View - Hidden on mobile */}
          <div className="hidden lg:block">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">WMA</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Contact Info</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Auth Number</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700">Collectors</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Location</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-2 text-gray-500">Loading WMAs...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredWMAs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No WMAs found matching your criteria
                    </td>
                  </tr>
                ) : (
              filteredWMAs.map((wma) => (
                    <tr key={wma._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                            {wma.profileImage ? (
                              <img
                                src={wma.profileImage}
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-semibold">
                                {wma.wmaname?.charAt(0)?.toUpperCase() || 'W'}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{wma.wmaname}</p>
                            <p className="text-xs text-gray-500">ID: {wma._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-900 truncate max-w-[200px]" title={wma.email}>
                            {wma.email}
                          </p>
                          <p className="text-xs text-gray-500">
                            {wma.contact || "No contact"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                          {wma.authNumber}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full bg-emerald-100">
                          <span className="text-base font-bold text-emerald-700">{wma.collectorCount}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-600 truncate max-w-[180px]" title={wma.address || "Not provided"}>
                          {wma.address || "Not provided"}
                        </p>
                  </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleDeleteClick(wma._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete WMA"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
          </div>

          {/* Mobile Card View - Visible on mobile/tablet */}
          <div className="lg:hidden divide-y divide-gray-200">
            {loading ? (
              <div className="px-6 py-12 text-center">
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2 text-gray-500">Loading WMAs...</span>
                </div>
              </div>
            ) : filteredWMAs.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No WMAs found matching your criteria
              </div>
            ) : (
              filteredWMAs.map((wma) => (
                <div key={wma._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                      {wma.profileImage ? (
                        <img
                          src={wma.profileImage}
                          alt="Profile"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold text-lg">
                          {wma.wmaname?.charAt(0)?.toUpperCase() || 'W'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1">{wma.wmaname}</h4>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {wma.authNumber}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteClick(wma._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      title="Delete WMA"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-600 break-all">{wma.email}</span>
                    </div>
                    
                    {wma.contact && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="text-gray-600">{wma.contact}</span>
                      </div>
                    )}
                    
                    {wma.address && (
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-gray-600">{wma.address}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="font-semibold text-emerald-700">{wma.collectorCount} Collectors</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this WMA account? This action cannot be undone and will affect all associated collectors.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteWMA}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    "Delete WMA"
                  )}
                </button>
              </div>
            </div>
          </div>
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
}

const MetricCard = ({ title, value, icon, gradient, bgGradient, isText = false }) => (
  <div className={`bg-gradient-to-br ${bgGradient} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">{title}</p>
        {isText ? (
          <p className="text-lg font-bold text-gray-800 truncate max-w-[120px]" title={value}>
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

export default AdminWMAs;
