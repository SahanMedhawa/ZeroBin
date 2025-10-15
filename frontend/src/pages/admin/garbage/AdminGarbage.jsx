import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminDrawer from "../components/AdminDrawer";
import { deleteGarbage, getAllGarbages } from "../../../api/garbageApi";
import { ToastContainer, toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getAllAreas } from "../../../api/areaApi";

const AdminGarbage = () => {
  const [garbages, setGarbages] = useState([]);
  const [filteredGarbages, setFilteredGarbages] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedGarbageId, setSelectedGarbageId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchAllAreas = async () => {
    try {
      const res = await getAllAreas();
      setAreas(res);
    } catch (error) {
      toast.error("Failed to fetch areas: " + error.message, {
        position: "bottom-right",
        autoClose: 3000,
      });
    }
  };

  const fetchAllGarbages = async () => {
    try {
      setLoading(true);
      const res = await getAllGarbages();
      setGarbages(res);
      setFilteredGarbages(res);
    } catch (error) {
      toast.error("Failed to fetch garbage requests: " + error.message, {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllGarbages();
    fetchAllAreas();
  }, []);

  const filterGarbages = () => {
    let filtered = garbages;
    
    if (statusFilter) {
      filtered = filtered.filter((garbage) => garbage.status === statusFilter);
    }
    if (typeFilter) {
      filtered = filtered.filter((garbage) => garbage.type === typeFilter);
    }
    if (areaFilter !== "") {
      filtered = filtered.filter((garbage) => garbage.area?.name === areaFilter);
    }
    if (searchTerm !== "") {
      filtered = filtered.filter((garbage) =>
        garbage.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        garbage.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredGarbages(filtered);
  };

  useEffect(() => {
    filterGarbages();
  }, [statusFilter, typeFilter, areaFilter, searchTerm, garbages]);

  const handleDeleteClick = (id) => {
    setSelectedGarbageId(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteGarbage = async () => {
    if (selectedGarbageId) {
      try {
        setLoading(true);
        await deleteGarbage(selectedGarbageId);
        setGarbages((currentGarbage) =>
          currentGarbage.filter((garbage) => garbage._id !== selectedGarbageId)
        );
        setDeleteModalOpen(false);
        toast.success("Garbage request deleted successfully!", {
          position: "bottom-right",
          autoClose: 3000,
        });
      } catch (error) {
        toast.error("Failed to delete garbage request: " + error.message, {
          position: "bottom-right",
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditClick = (garbage) => {
    navigate("/admin/garbage/update", { state: { garbage } });
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
    doc.text("Garbage Collection Report", 14, 35);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 45);

    // Summary data
    const summaryData = [
      ["Total Requests", filteredGarbages.length],
      ["Collected", filteredGarbages.filter(g => g.status === "Collected").length],
      ["In Progress", filteredGarbages.filter(g => g.status === "In Progress").length],
      ["Pending", filteredGarbages.filter(g => g.status === "Pending").length],
      ["Recyclable", filteredGarbages.filter(g => g.type === "Recyclable").length],
      ["Non-Recyclable", filteredGarbages.filter(g => g.type === "Non-Recyclable").length],
    ];

    autoTable(doc, {
      startY: 55,
      head: [["Summary", "Count"]],
      body: summaryData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
    });

    const generatedDate = new Date().toLocaleDateString().replace(/\//g, "-");
    doc.save(`Garbage_Report_${generatedDate}.pdf`);
    toast.success("Report generated successfully!", {
      position: "bottom-right",
      autoClose: 3000,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Collected":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Recyclable":
        return "bg-emerald-100 text-emerald-800";
      case "Non-Recyclable":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const metrics = [
    {
      title: "Total Requests",
      value: garbages.length,
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      gradient: "from-blue-900 to-blue-800",
      bgGradient: "from-blue-50 to-indigo-50",
    },
    {
      title: "Collected",
      value: garbages.filter(g => g.status === "Collected").length,
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-emerald-600 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50",
    },
    {
      title: "Pending",
      value: garbages.filter(g => g.status === "Pending").length,
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-yellow-500 to-orange-500",
      bgGradient: "from-yellow-50 to-orange-50",
    },
  ];

  return (
    <AdminDrawer>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-indigo-800 bg-clip-text text-transparent mb-2">
        Garbage Management
      </h1>
          <p className="text-gray-600">Monitor and manage waste collection requests</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div>
              <input
                type="text"
                placeholder="Search by user..."
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
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Collected">Collected</option>
                <option value="In Progress">In Progress</option>
              </select>
            </div>

            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
              >
                <option value="">All Types</option>
                <option value="Recyclable">Recyclable</option>
                <option value="Non-Recyclable">Non-Recyclable</option>
              </select>
            </div>

            <div>
              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
              >
                <option value="">All Areas</option>
                {areas.map((area) => (
                  <option key={area._id} value={area.name}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                onClick={downloadPDF}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-900 to-indigo-800 text-white rounded-xl font-semibold hover:from-blue-800 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Report
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || statusFilter || typeFilter || areaFilter) && (
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Search: "{searchTerm}"
                  <button onClick={() => setSearchTerm("")} className="ml-2 hover:text-blue-600">×</button>
                </span>
              )}
              {statusFilter && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-100 text-emerald-800">
                  Status: {statusFilter}
                  <button onClick={() => setStatusFilter("")} className="ml-2 hover:text-emerald-600">×</button>
                </span>
              )}
              {typeFilter && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                  Type: {typeFilter}
                  <button onClick={() => setTypeFilter("")} className="ml-2 hover:text-purple-600">×</button>
                </span>
              )}
              {areaFilter && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                  Area: {areaFilter}
                  <button onClick={() => setAreaFilter("")} className="ml-2 hover:text-orange-600">×</button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Garbage Requests Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Garbage Requests ({filteredGarbages.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Area</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date Requested</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-2 text-gray-500">Loading requests...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredGarbages.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      No garbage requests found matching your criteria
                    </td>
                  </tr>
                ) : (
              filteredGarbages
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((garbage) => (
                      <tr key={garbage._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {garbage.user?.username?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {garbage.user?.username || "Unknown User"}
                              </p>
                              <p className="text-sm text-gray-500">ID: {garbage._id.slice(-6)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {garbage.user?.contact || "Not provided"}
                    </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(garbage.type)}`}>
                        {garbage.type}
                      </span>
                    </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900">{garbage.area?.name || "N/A"}</span>
                            {garbage.area?.type && (
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                garbage.area.type === "weightBased" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                              }`}>
                        {garbage.area.type === "weightBased" ? "W" : "F"}
                      </span>
                            )}
                          </div>
                    </td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(garbage.createdAt).toLocaleDateString()}
                    </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(garbage.status)}`}>
                        {garbage.status}
                      </span>
                    </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                      {garbage.status !== "Collected" && (
                              <button
                          onClick={() => handleEditClick(garbage)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Request"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteClick(garbage._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Request"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this garbage request? This action cannot be undone.
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
                  onClick={handleDeleteGarbage}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    "Delete Request"
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
};

const MetricCard = ({ title, value, icon, gradient, bgGradient }) => (
  <div className={`bg-gradient-to-br ${bgGradient} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">{title}</p>
        <p className={`text-4xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>{value}</p>
      </div>
      <div className={`p-4 rounded-xl bg-gradient-to-r ${gradient} shadow-lg`}>
        {icon}
      </div>
    </div>
  </div>
);

export default AdminGarbage;