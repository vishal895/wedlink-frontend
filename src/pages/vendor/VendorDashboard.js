import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API } from "../../context/AuthContext";
import { useAuth } from "../../context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const NAV = [
  { to:"/vendor/dashboard", icon:"📊", label:"Dashboard" },
  { to:"/vendor/profile",   icon:"🏪", label:"My Profile" },
  { to:"/vendor/bookings",  icon:"📋", label:"Bookings" },
  { to:"/vendor/earnings",  icon:"💰", label:"Earnings" },
];

export function VendorLayout({ children, title }) {
  const { user, logout } = useAuth();
  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#f9f5ff" }}>
      <aside style={ls.sidebar}>
        <div style={ls.logo}>💍 <span style={{ color:"#c9a84c" }}>Wedding</span>Wala</div>
        <div style={ls.vendorTag}>Vendor Panel</div>
        <nav style={{ flex:1 }}>
          {NAV.map(n => (
            <Link key={n.to} to={n.to} style={ls.navItem}>
              <span>{n.icon}</span> {n.label}
            </Link>
          ))}
        </nav>
        <div style={ls.userInfo}>
          <div style={ls.avatar}>{user?.name?.[0]}</div>
          <div>
            <div style={{ fontSize:"0.85rem", fontWeight:600 }}>{user?.name}</div>
            <button onClick={logout} style={ls.logoutBtn}>Logout</button>
          </div>
        </div>
      </aside>
      <main style={ls.main}>
        <div style={ls.topbar}><h1 style={ls.pageTitle}>{title}</h1></div>
        <div style={ls.content}>{children}</div>
      </main>
    </div>
  );
}

export default function VendorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/vendors/my/dashboard").then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <VendorLayout title="Dashboard"><div style={{ textAlign:"center", padding:60 }}>Loading...</div></VendorLayout>;
  if (!data?.vendor) return <VendorLayout title="Dashboard">
    <div style={{ textAlign:"center", padding:60 }}>
      <h3 style={{ marginBottom:16 }}>Setup your vendor profile first</h3>
      <Link to="/vendor/profile" style={{ padding:"12px 24px", background:"#c9a84c", color:"#1a0a2e", borderRadius:8, fontWeight:700, textDecoration:"none" }}>Create Profile →</Link>
    </div>
  </VendorLayout>;

  const { stats, monthly, vendor, bookings, reviews } = data;

  return (
    <VendorLayout title="Dashboard">
      {/* Approval Banner */}
      {!vendor.isApproved && (
        <div style={{ background:"#fef9c3", border:"1px solid #fde047", borderRadius:8, padding:"12px 16px", marginBottom:24, fontSize:"0.88rem" }}>
          ⏳ Your profile is under review. You'll be notified once approved by admin.
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:16, marginBottom:28 }}>
        {[
          { label:"Total Bookings",   value:stats.totalBookings,   icon:"📋", color:"#7e22ce" },
          { label:"Confirmed",        value:stats.confirmed,        icon:"✅", color:"#16a34a" },
          { label:"Pending",          value:stats.pending,          icon:"⏳", color:"#f59e0b" },
          { label:"Total Earnings",   value:`₹${stats.totalEarnings.toLocaleString()}`, icon:"💰", color:"#c9a84c" },
          { label:"Paid Earnings",    value:`₹${stats.paidEarnings.toLocaleString()}`,  icon:"✅", color:"#2563eb" },
          { label:"Avg Rating",       value:vendor.ratings.average || "New", icon:"⭐", color:"#f59e0b" },
        ].map(c => (
          <div key={c.label} style={cs.statCard}>
            <div style={{ fontSize:"2rem", marginBottom:8 }}>{c.icon}</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.8rem", fontWeight:700, color:c.color }}>{c.value}</div>
            <div style={{ fontSize:"0.78rem", color:"#7a6b8a", marginTop:4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:24 }}>
        {/* Earnings Chart */}
        <div style={cs.card}>
          <h3 style={cs.cardTitle}>Monthly Earnings (Last 6 months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly}>
              <XAxis dataKey="month" tick={{ fontSize:11 }} />
              <YAxis tick={{ fontSize:11 }} />
              <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
              <Bar dataKey="earnings" fill="#c9a84c" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Reviews */}
        <div style={cs.card}>
          <h3 style={cs.cardTitle}>Recent Reviews</h3>
          {reviews?.length === 0 ? <p style={{ color:"#7a6b8a", fontSize:"0.85rem" }}>No reviews yet</p> :
           reviews?.map(r => (
            <div key={r._id} style={cs.reviewRow}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <strong style={{ fontSize:"0.82rem" }}>{r.user?.name}</strong>
                <span style={{ color:"#f59e0b", fontSize:"0.78rem" }}>{"★".repeat(r.rating)}</span>
              </div>
              <p style={{ fontSize:"0.8rem", color:"#555", overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{r.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Bookings */}
      <div style={{ ...cs.card, marginTop:24 }}>
        <h3 style={cs.cardTitle}>Recent Bookings</h3>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.85rem" }}>
          <thead>
            <tr style={{ borderBottom:"2px solid #ede8f5" }}>
              {["Booking ID","Customer","Event","Date","Amount","Status"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"8px 12px", color:"#7a6b8a", fontWeight:600, fontSize:"0.78rem" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings?.slice(0,8).map(b => (
              <tr key={b._id} style={{ borderBottom:"1px solid #f0eaf8" }}>
                <td style={cs.td}>{b.bookingId}</td>
                <td style={cs.td}>{b.user?.name}</td>
                <td style={cs.td}>{b.eventType}</td>
                <td style={cs.td}>{new Date(b.eventDate).toLocaleDateString()}</td>
                <td style={cs.td}>₹{b.pricing?.totalAmount?.toLocaleString()}</td>
                <td style={cs.td}><span style={{ background:{"pending":"#fef3c7","confirmed":"#d1fae5","cancelled":"#fee2e2","completed":"#dbeafe"}[b.status], color:{"pending":"#92400e","confirmed":"#065f46","cancelled":"#991b1b","completed":"#1e40af"}[b.status], padding:"2px 10px", borderRadius:20, fontSize:"0.72rem", fontWeight:700 }}>{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        <Link to="/vendor/bookings" style={{ display:"inline-block", marginTop:12, color:"#c9a84c", fontSize:"0.85rem", fontWeight:600 }}>View all bookings →</Link>
      </div>
    </VendorLayout>
  );
}

const ls = {
  sidebar:    { width:240, background:"#1a0a2e", display:"flex", flexDirection:"column", padding:"24px 0", minHeight:"100vh", position:"sticky", top:0 },
  logo:       { fontFamily:"'Cormorant Garamond',serif", fontSize:"1.4rem", color:"#fff", padding:"0 20px 8px" },
  vendorTag:  { fontSize:"0.65rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"#c9a84c", padding:"0 20px 20px", borderBottom:"1px solid rgba(255,255,255,0.1)", marginBottom:16 },
  navItem:    { display:"flex", alignItems:"center", gap:12, padding:"11px 20px", color:"rgba(255,255,255,0.7)", textDecoration:"none", fontSize:"0.88rem", transition:"all 0.2s" },
  userInfo:   { display:"flex", alignItems:"center", gap:12, padding:"16px 20px", borderTop:"1px solid rgba(255,255,255,0.1)", marginTop:"auto" },
  avatar:     { width:36, height:36, background:"#c9a84c", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:"#1a0a2e", fontSize:"1rem" },
  logoutBtn:  { background:"none", border:"none", color:"rgba(255,255,255,0.5)", fontSize:"0.75rem", cursor:"pointer", padding:0 },
  main:       { flex:1, overflow:"auto" },
  topbar:     { background:"#fff", padding:"20px 32px", borderBottom:"1px solid #ede8f5", position:"sticky", top:0, zIndex:10 },
  pageTitle:  { fontFamily:"'Cormorant Garamond',serif", fontSize:"1.8rem", color:"#2d1b3d" },
  content:    { padding:"28px 32px" },
};
const cs = {
  statCard:   { background:"#fff", borderRadius:12, padding:20, textAlign:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.05)", border:"1px solid #ede8f5" },
  card:       { background:"#fff", borderRadius:12, padding:24, boxShadow:"0 2px 8px rgba(0,0,0,0.05)", border:"1px solid #ede8f5" },
  cardTitle:  { fontFamily:"'Cormorant Garamond',serif", fontSize:"1.3rem", marginBottom:16, color:"#2d1b3d" },
  reviewRow:  { padding:"10px 0", borderBottom:"1px solid #f0eaf8" },
  td:         { padding:"10px 12px", color:"#555" },
};
