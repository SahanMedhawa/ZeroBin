import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDrawer from '../components/AdminDrawer';
import { ToastContainer, toast } from "react-toastify";
import { deleteCollector, getAllCollectors } from '../../../api/collectorApi';

function AdminCollectors() {
  const [collectors, setCollectors] = useState([]);
  const [filteredCollectors, setFilteredCollectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCollectorId, setSelectedCollectorId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [wmaFilter, setWmaFilter] = useState("");
  const navigate = useNavigate();

  const fetchAllCollectors = async () => {
    try {
      setLoading(true);
      const res = await getAllCollectors();
      setCollectors(res);
      setFilteredCollectors(res);
    } catch (error) {
      toast.error("Failed to fetch collectors: " + error.message, {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCollectors();
  }, []);

  const handleDeleteClick = (id) => {
    setSelectedCollectorId(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteCollector = async () => {
    if (selectedCollectorId) {
      try {
        setLoading(true);
        await deleteCollector(selectedCollectorId);
        setCollectors((currentCollector) =>
          currentCollector.filter((collector) => collector._id !== selectedCollectorId)
        );
        setDeleteModalOpen(false);
        toast.success("Collector deleted successfully!", {
          position: "bottom-right",
          autoClose: 3000,
        });
      } catch (error) {
        toast.error("Failed to delete collector: " + error.message, {
          position: "bottom-right",
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditClick = (collector) => {
    navigate("/admin/collectors/update", { state: { collector } });
  };

  const filterCollectors = () => {
    let filtered = collectors;
    
    if (statusFilter) {
      filtered = filtered.filter((collector) => collector.statusOfCollector === statusFilter);
    }

    if (searchFilter !== "") {
      filtered = filtered.filter((collector) =>
        collector.collectorName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        collector.collectorNIC.toLowerCase().includes(searchFilter.toLowerCase()) ||
        collector.truckNumber.toLowerCase().includes(searchFilter.toLowerCase())
      );
    }

    if (wmaFilter !== "") {
      filtered = filtered.filter((collector) => 
        collector.wmaId?.wmaname?.toLowerCase().includes(wmaFilter.toLowerCase())
      );
    }

    setFilteredCollectors(filtered);
  };

  useEffect(() => {
    filterCollectors();
  }, [statusFilter, searchFilter, wmaFilter, collectors]);

  const getUniqueWMAs = () => {
    const wmas = collectors
      .filter(collector => collector.wmaId?.wmaname)
      .map(collector => collector.wmaId.wmaname);
    return [...new Set(wmas)];
  };

  const metrics = [
    {
      title: "Total Collectors",
      value: collectors.length,
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      gradient: "from-blue-900 to-blue-800",
      bgGradient: "from-blue-50 to-indigo-50",
    },
    {
      title: "Available",
      value: collectors.filter((collector) => collector.statusOfCollector === 'Available').length,
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-emerald-600 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50",
    },
    {
      title: "Not Available",
      value: collectors.filter((collector) => collector.statusOfCollector === 'Not-Available').length,
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-red-600 to-rose-600",
      bgGradient: "from-red-50 to-rose-50",
    },
  ];

  return (
    <AdminDrawer>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-indigo-800 bg-clip-text text-transparent mb-2">
            Collector Management
          </h1>
          <p className="text-gray-600">Manage waste collectors and their assignments</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <input
                type="text"
                placeholder="Search collectors..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
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
                <option value="Available">Available</option>
                <option value="Not-Available">Not Available</option>
              </select>
            </div>

            <div>
              <select
                value={wmaFilter}
                onChange={(e) => setWmaFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
              >
                <option value="">All WMAs</option>
                {getUniqueWMAs().map((wma) => (
                  <option key={wma} value={wma}>
                    {wma}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                onClick={() => {
                  setSearchFilter("");
                  setStatusFilter("");
                  setWmaFilter("");
                }}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {(searchFilter || statusFilter || wmaFilter) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchFilter && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Search: "{searchFilter}"
                  <button
                    onClick={() => setSearchFilter("")}
                    className="ml-2 hover:text-blue-600"
                  >
                    ×
                  </button>
                </span>
              )}
              {statusFilter && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-100 text-emerald-800">
                  Status: {statusFilter}
                  <button
                    onClick={() => setStatusFilter("")}
                    className="ml-2 hover:text-emerald-600"
                  >
                    ×
                  </button>
                </span>
              )}
              {wmaFilter && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                  WMA: {wmaFilter}
                  <button
                    onClick={() => setWmaFilter("")}
                    className="ml-2 hover:text-purple-600"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Collectors Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Registered Collectors ({filteredCollectors.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Collector</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">WMA</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Truck No</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">NIC</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Contact</th>
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
                        <span className="ml-2 text-gray-500">Loading collectors...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredCollectors.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      No collectors found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredCollectors
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((collector) => (
                      <tr key={collector._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                              {collector.profileImage ? (
                                <img
                                  src={collector.profileImage}
                                  alt="Profile"
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-semibold">
                                  {collector.collectorName?.charAt(0)?.toUpperCase() || 'C'}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{collector.collectorName}</p>
                              <p className="text-sm text-gray-500">ID: {collector._id.slice(-6)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {collector.wmaId ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {collector.wmaId.wmaname}
                            </span>
                          ) : (
                            <span className="text-gray-400">No WMA assigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{collector.truckNumber}</td>
                        <td className="px-6 py-4 text-gray-600">{collector.collectorNIC}</td>
                        <td className="px-6 py-4 text-gray-600">{collector.contactNo}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              collector.statusOfCollector === 'Available' ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            <span className={`text-sm font-medium ${
                              collector.statusOfCollector === 'Available' ? 'text-green-700' : 'text-red-700'
                            }`}>
                              {collector.statusOfCollector}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEditClick(collector)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Collector"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(collector._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Collector"
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
                Are you sure you want to delete this collector? This action cannot be undone and may affect ongoing collection schedules.
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
                  onClick={handleDeleteCollector}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    "Delete Collector"
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

export default AdminCollectors;