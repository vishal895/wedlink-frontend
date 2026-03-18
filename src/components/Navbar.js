import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaBars, FaTimes, FaUserCircle } from "react-icons/fa";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); };

  const getDashLink = () => {
    if (user?.role === "vendor") return "/vendor/dashboard";
    if (user?.role === "admin")  return "/admin";
    return "/my-bookings";
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>
        💍 <span style={{ color: "#c9a84c" }}>Wedding</span>Wala
      </Link>

      <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
        <Link to="/vendors" style={styles.link}>Find Vendors</Link>
        <Link to="/vendors?category=banquet_hall" style={styles.link}>Venues</Link>
        <Link to="/vendors?category=catering" style={styles.link}>Catering</Link>

        {!user ? (
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => navigate("/login")}  style={styles.btnOutline}>Login</button>
            <button onClick={() => navigate("/register")} style={styles.btnFill}>Sign Up</button>
          </div>
        ) : (
          <div style={{ position: "relative" }} onMouseEnter={() => setDropdown(true)} onMouseLeave={() => setDropdown(false)}>
            <button style={styles.userBtn}>
              <FaUserCircle size={20} /> {user.name.split(" ")[0]} ▾
            </button>
            {dropdown && (
              <div style={styles.dropdown}>
                <Link to={getDashLink()} style={styles.dropItem}>Dashboard</Link>
                {user.role === "user" && <Link to="/my-bookings" style={styles.dropItem}>My Bookings</Link>}
                {user.role === "vendor" && <>
                  <Link to="/vendor/profile"  style={styles.dropItem}>My Profile</Link>
                  <Link to="/vendor/bookings" style={styles.dropItem}>Bookings</Link>
                  <Link to="/vendor/earnings" style={styles.dropItem}>Earnings</Link>
                </>}
                <hr style={{ border: "none", borderTop: "1px solid #ede8f5", margin: "4px 0" }} />
                <button onClick={handleLogout} style={{ ...styles.dropItem, color: "#dc2626", border: "none", background: "none", width: "100%", textAlign: "left", cursor: "pointer" }}>Logout</button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav:      { position: "fixed", top: 0, width: "100%", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 5%", height: 64, background: "rgba(26,10,46,0.97)", backdropFilter: "blur(10px)" },
  logo:     { fontFamily: "'Cormorant Garamond',serif", fontSize: "1.5rem", color: "#fff", textDecoration: "none" },
  link:     { color: "rgba(255,255,255,0.8)", textDecoration: "none", fontSize: "0.85rem", letterSpacing: "0.05em", transition: "color 0.2s" },
  btnOutline: { padding: "7px 18px", border: "1px solid #c9a84c", color: "#c9a84c", background: "transparent", borderRadius: 4, fontSize: "0.82rem", cursor: "pointer" },
  btnFill:    { padding: "7px 18px", background: "#c9a84c", color: "#1a0a2e", border: "none", borderRadius: 4, fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" },
  userBtn:    { display: "flex", alignItems: "center", gap: 8, background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.4)", color: "#c9a84c", padding: "7px 14px", borderRadius: 4, fontSize: "0.85rem", cursor: "pointer" },
  dropdown:   { position: "absolute", right: 0, top: "100%", background: "#fff", border: "1px solid #ede8f5", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 180, padding: "6px 0", zIndex: 100 },
  dropItem:   { display: "block", padding: "9px 16px", fontSize: "0.85rem", color: "#2d1b3d", textDecoration: "none", transition: "background 0.2s" },
};
