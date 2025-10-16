import React, { useState, useEffect } from "react";
import AdminDrawer from "../components/AdminDrawer";
import AuthService from "../../../api/userApi";
import { ToastContainer, toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = !areaFilter || (user.area?.name === areaFilter);
    return matchesSearch && matchesArea;
  });

  const handleDeleteClick = (id) => {
    setSelectedUserId(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (selectedUserId) {
      try {
        setLoading(true);
        await AuthService.deleteUser(selectedUserId);
        setUsers((currentUser) =>
          currentUser.filter((user) => user._id !== selectedUserId)
        );
        setDeleteModalOpen(false);
        toast.success("User account deleted successfully!", {
          position: "bottom-right",
          autoClose: 3000,
        });
      } catch (error) {
        toast.error("Failed to delete user: " + error.message, {
          position: "bottom-right",
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const res = await AuthService.getAllUsers();
      setUsers(res);
    } catch (error) {
      toast.error("Failed to fetch users: " + error.message, {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const calculateTotalUsers = () => {
    return users.length;
  };

  const getUniqueAreas = () => {
    const areas = users
      .filter(user => user.area?.name)
      .map(user => user.area.name);
    return [...new Set(areas)];
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Header
      doc.setFont("helvetica", "bold");
    doc.setTextColor("59", "130", "246"); // Blue color
    doc.setFontSize(20);
    doc.text("ZeroBin Admin Portal", 14, 20);
    
      doc.setFont("helvetica", "normal");
    doc.setTextColor("0", "0", "0");
    doc.setFontSize(16);
    doc.text("User Management Report", 14, 35);

      doc.setFontSize(11);
      doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 45);
    doc.text(`Total Users: ${calculateTotalUsers()}`, 14, 55);

    // Table data
    const tableData = filteredUsers
      .filter((user) => user.email !== "thimeshaansar@gmail.com")
      .map((user) => [
        user.username,
        user.email,
        user.area?.name || "N/A",
        user.address || "N/A",
        user.contact || "N/A",
      ]);

      autoTable(doc, {
      startY: 65,
      head: [["Username", "Email", "Area", "Address", "Contact"]],
      body: tableData,
        theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
    });

      const generatedDate = new Date().toLocaleDateString().replace(/\//g, "-");
    doc.save(`User_Report_${generatedDate}.pdf`);
    toast.success("Report generated successfully!", {
        position: "bottom-right",
        autoClose: 3000,
    });
  };

  const metrics = [
    {
      title: "Total Users",
      value: calculateTotalUsers(),
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      gradient: "from-blue-900 to-blue-800",
      bgGradient: "from-blue-50 to-indigo-50",
    },
    {
      title: "Areas Covered",
      value: getUniqueAreas().length,
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      gradient: "from-emerald-600 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50",
    },
    {
      title: "Active Users",
      value: users.filter(u => u.area?.name).length,
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-green-600 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-50",
    },
  ];

  return (
      <AdminDrawer>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-indigo-800 bg-clip-text text-transparent mb-2">
            User Management
        </h1>
          <p className="text-gray-600">Manage registered residents and their accounts</p>
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
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex-1">
          <input
            type="text"
                  placeholder="Search by username or email..."
            value={searchTerm}
            onChange={handleSearchChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="sm:w-48">
                <select
                  value={areaFilter}
                  onChange={(e) => setAreaFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                >
                  <option value="">All Areas</option>
                  {getUniqueAreas().map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
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
          {(searchTerm || areaFilter) && (
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
              {areaFilter && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-100 text-emerald-800">
                  Area: {areaFilter}
                  <button
                    onClick={() => setAreaFilter("")}
                    className="ml-2 hover:text-emerald-600"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Registered Users ({filteredUsers.filter(u => u.email !== "thimeshaansar@gmail.com").length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Area</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Address</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Contact</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-2 text-gray-500">Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No users found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredUsers
                    .filter((user) => user.email !== "thimeshaansar@gmail.com")
                    .map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                              {user.profileImage ? (
                                <img
                                  src={user.profileImage}
                                  alt="Profile"
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-semibold">
                                  {user.username?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.username}</p>
                              <p className="text-sm text-gray-500">ID: {user._id.slice(-6)}</p>
                            </div>
              </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                        <td className="px-6 py-4">
                          {user.area?.name ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                              {user.area.name}
                            </span>
                          ) : (
                            <span className="text-gray-400">Not assigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                          {user.address || "Not provided"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {user.contact || "Not provided"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleDeleteClick(user._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete User"
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
        </div>

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this user account? This action cannot be undone.
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
                  onClick={handleDeleteUser}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    "Delete User"
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

export default AdminUsers;