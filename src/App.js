import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Customer Pages
import HomePage       from "./pages/customer/HomePage";
import VendorsPage    from "./pages/customer/VendorsPage";
import VendorDetail   from "./pages/customer/VendorDetail";
import BookingPage    from "./pages/customer/BookingPage";
import MyBookings     from "./pages/customer/MyBookings";
import LoginPage      from "./pages/customer/LoginPage";
import RegisterPage   from "./pages/customer/RegisterPage";

// Vendor Pages
import VendorDashboard    from "./pages/vendor/VendorDashboard";
import VendorProfile      from "./pages/vendor/VendorProfile";
import VendorBookings     from "./pages/vendor/VendorBookings";
import VendorEarnings     from "./pages/vendor/VendorEarnings";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers     from "./pages/admin/AdminUsers";
import AdminVendors   from "./pages/admin/AdminVendors";
import AdminBookings  from "./pages/admin/AdminBookings";

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",fontSize:"1.2rem"}}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"           element={<HomePage />} />
      <Route path="/vendors"    element={<VendorsPage />} />
      <Route path="/vendors/:id" element={<VendorDetail />} />
      <Route path="/login"      element={<LoginPage />} />
      <Route path="/register"   element={<RegisterPage />} />

      {/* Customer */}
      <Route path="/book/:vendorId" element={<PrivateRoute roles={["user"]}><BookingPage /></PrivateRoute>} />
      <Route path="/my-bookings"    element={<PrivateRoute roles={["user"]}><MyBookings /></PrivateRoute>} />

      {/* Vendor */}
      <Route path="/vendor/dashboard" element={<PrivateRoute roles={["vendor"]}><VendorDashboard /></PrivateRoute>} />
      <Route path="/vendor/profile"   element={<PrivateRoute roles={["vendor"]}><VendorProfile /></PrivateRoute>} />
      <Route path="/vendor/bookings"  element={<PrivateRoute roles={["vendor"]}><VendorBookings /></PrivateRoute>} />
      <Route path="/vendor/earnings"  element={<PrivateRoute roles={["vendor"]}><VendorEarnings /></PrivateRoute>} />

      {/* Admin */}
      <Route path="/admin"           element={<PrivateRoute roles={["admin"]}><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/users"     element={<PrivateRoute roles={["admin"]}><AdminUsers /></PrivateRoute>} />
      <Route path="/admin/vendors"   element={<PrivateRoute roles={["admin"]}><AdminVendors /></PrivateRoute>} />
      <Route path="/admin/bookings"  element={<PrivateRoute roles={["admin"]}><AdminBookings /></PrivateRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { fontFamily: "Jost", fontSize: "0.9rem" } }} />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
