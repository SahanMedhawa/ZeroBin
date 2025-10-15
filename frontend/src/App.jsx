import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/ProtectedRoute";
import CollectorProtectedRoute from "./components/CollectorProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Home from "./pages/client/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AuthSuccess from "./pages/auth/AuthSuccess";
import UserGarbageRequest from "./pages/client/garbage/UserGarbageRequest";
import UserDashboard from "./pages/client/dashboard/UserDashboard";
import UserTransaction from "./pages/client/transaction/UserTransaction";
import UserProfile from "./pages/client/profile/profile";
import UserTransactionHistory from "./pages/client/transaction/UserTransactionHistory";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminGarbage from "./pages/admin/garbage/AdminGarbage";
import AdminTransactions from "./pages/admin/transactions/AdminTransactions";
// Removed: UserSmartDeviceRequest - Dead code (one bin per user enforced)
import AdminGarbageUpdate from "./pages/admin/garbage/AdminGarbageUpdate";
import AdminUsers from "./pages/admin/users/AdminUsers";
import AdminWMAs from "./pages/admin/wmas/AdminWMAs";
import AdminGrievances from "./pages/admin/grievances/AdminGrievances";

import WMADashboard from "./pages/wma/dashboard/WMADashboard";
import WMACollectors from "./pages/wma/collectors/ViewCollectors";
import WMAProfile from "./pages/wma/profile/WMAProfile";
import WMASchedules from "./pages/wma/schedule/ViewSchedules";
import WMATransaction from "./pages/wma/transaction/WMATransaction";
import CreateSchedule from "./pages/wma/schedule/CreateSchedule";
import AdminCollectors from "./pages/admin/collectors/AdmonCollectors";
import AdminCollectorUpdate from "./pages/admin/collectors/AdminCollectorUpdate";
import WmaCollectorUpdate from "./pages/wma/collectors/UpdateCollector";
import WmaCollectorCreate from "./pages/wma/collectors/AddCollectors";
import ScheduleUpdate from "./pages/wma/schedule/ScheduleUpdate";
// Removed: Admin smart device pages - Dead code (replaced by Smart Bin system)
// import AdminDevice from "./pages/admin/device/AdminDevice";
// import AdminDeviceUpdate from "./pages/admin/device/AdminDeviceUpdate";

import CollectorLogin from "./pages/collector/auth/CollectorLogin";
import CollectorLoginRedirect from "./pages/collector/auth/CollectorLoginRedirect";
import CollectorDashboard from "./pages/collector/dashboard/CollectorDashboard";
import CollectorSchedule from "./pages/collector/schedule/CollectorSchedule";
import CollectorMap from "./pages/collector/map/CollectorMap";
import CollectorScanner from "./pages/collector/scanner/CollectorScanner";
import CollectorEarnings from "./pages/collector/earnings/CollectorEarnings";
// import UpdateGarbage from "./pages/collector/updateGarbage/UpdateGarbage";
import AdminAreaManagement from "./pages/admin/areas/AdminAreaManagement";
import WMAServiceAreas from "./pages/wma/areas/WMAServiceAreas";

// Sensor-based Bin Management
import BinManagement from "./pages/client/bin/BinManagement";
import FullBinsCollector from "./pages/collector/bins/FullBinsCollector";

// Grievance Management
import CreateGrievance from "./pages/client/grievances/CreateGrievance";
import UserGrievances from "./pages/client/grievances/UserGrievances";
import CollectorGrievances from "./pages/collector/grievances/CollectorGrievances";

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Public routes - accessible to everyone */}
          <Route path="/" element={<Home />} />

          {/* Auth routes - only for non-authenticated users */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/auth/success" element={<AuthSuccess />} />

          {/* Protected User routes */}
          <Route path="/user/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          {/* Removed: Garbage Request page - replaced by Smart Bin system */}
          {/* <Route path="/user/my-garbage" element={<ProtectedRoute><UserGarbageRequest /></ProtectedRoute>} /> */}
          <Route path="/user/my-bin" element={<ProtectedRoute><BinManagement /></ProtectedRoute>} />
          <Route path="/user/grievances" element={<ProtectedRoute><UserGrievances /></ProtectedRoute>} />
          <Route path="/user/grievances/create" element={<ProtectedRoute><CreateGrievance /></ProtectedRoute>} />
          <Route path="/user/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route
            path="/user/my-transaction"
            element={<ProtectedRoute><UserTransaction /></ProtectedRoute>}
          />
          <Route
            path="/user/my-transaction/history"
            element={<ProtectedRoute><UserTransactionHistory /></ProtectedRoute>}
          />
          {/* Removed: Smart Device Request - one bin per user enforced */}
          {/* <Route path="/user/smartDevice" element={<ProtectedRoute><UserSmartDeviceRequest /></ProtectedRoute>} /> */}

          {/* Protected WMA Routes */}
          <Route path="/wma/dashboard" element={<ProtectedRoute><WMADashboard /></ProtectedRoute>} />
          <Route path="/wma/service-areas" element={<ProtectedRoute><WMAServiceAreas /></ProtectedRoute>} />
          <Route path="/wma/collectors" element={<ProtectedRoute><WMACollectors /></ProtectedRoute>} />
          <Route
            path="/wma/collectors/update"
            element={<ProtectedRoute><WmaCollectorUpdate /></ProtectedRoute>}
          />
          <Route
            path="/wma/collectors/create"
            element={<ProtectedRoute><WmaCollectorCreate /></ProtectedRoute>}
          />
          <Route path="/wma/transactions" element={<ProtectedRoute><WMATransaction /></ProtectedRoute>} />
          <Route
            path="/wma/schedules/update"
            element={<ProtectedRoute><ScheduleUpdate /></ProtectedRoute>}
          />
          <Route
            path="/wma/schedules/create"
            element={<ProtectedRoute><CreateSchedule /></ProtectedRoute>}
          />
          <Route path="/wma/schedules" element={<ProtectedRoute><WMASchedules /></ProtectedRoute>} />
          <Route path="/wma/profile" element={<ProtectedRoute><WMAProfile /></ProtectedRoute>} />

          {/* Protected Collector Routes */}
          <Route path="/collector/login" element={<CollectorLoginRedirect />} />
          <Route path="/collector/dashboard" element={<CollectorProtectedRoute><CollectorDashboard /></CollectorProtectedRoute>} />
          <Route path="/collector/full-bins" element={<CollectorProtectedRoute><FullBinsCollector /></CollectorProtectedRoute>} />
          <Route path="/collector/schedule" element={<CollectorProtectedRoute><CollectorSchedule /></CollectorProtectedRoute>} />
          <Route path="/collector/map" element={<CollectorProtectedRoute><CollectorMap /></CollectorProtectedRoute>} />
          <Route path="/collector/scanner" element={<CollectorProtectedRoute><CollectorScanner /></CollectorProtectedRoute>} />
          <Route path="/collector/earnings" element={<CollectorProtectedRoute><CollectorEarnings /></CollectorProtectedRoute>} />
          <Route path="/collector/grievances" element={<CollectorProtectedRoute><CollectorGrievances /></CollectorProtectedRoute>} />
          {/* Removed: Old updateGarbage - replaced by FullBinsCollector collection */}
          {/* <Route path="/collector/updateGarbage" element={<CollectorProtectedRoute><UpdateGarbage /></CollectorProtectedRoute>} /> */}

          {/* Protected Admin routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/areas" element={<ProtectedRoute><AdminAreaManagement /></ProtectedRoute>} />
          <Route path="/admin/garbage" element={<ProtectedRoute><AdminGarbage /></ProtectedRoute>} />
          <Route
            path="/admin/garbage/update"
            element={<ProtectedRoute><AdminGarbageUpdate /></ProtectedRoute>}
          />
          <Route
            path="/admin/transactions"
            element={<ProtectedRoute><AdminTransactions /></ProtectedRoute>}
          />
          <Route path="/admin/collectors" element={<ProtectedRoute><AdminCollectors /></ProtectedRoute>} />
          <Route
            path="/admin/collectors/update"
            element={<ProtectedRoute><AdminCollectorUpdate /></ProtectedRoute>}
          />
          <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/wmas" element={<ProtectedRoute><AdminWMAs /></ProtectedRoute>} />
          <Route path="/admin/grievances" element={<ProtectedRoute><AdminGrievances /></ProtectedRoute>} />
          {/* Removed: Admin smart device routes - Dead code (replaced by Smart Bin system) */}
          {/* <Route path="/admin/devices" element={<ProtectedRoute><AdminDevice /></ProtectedRoute>} /> */}
          {/* <Route path="/admin/devices/update" element={<ProtectedRoute><AdminDeviceUpdate /></ProtectedRoute>} /> */}
        </Routes>
      </Router>
    </>
  );
}

export default App;
