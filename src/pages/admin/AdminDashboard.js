import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API } from "../../context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const ANAV = [
  { to:"/admin",          icon:"📊", label:"Dashboard" },
  { to:"/admin/users",    icon:"👥", label:"Users" },
  { to:"/admin/vendors",  icon:"🏪", label:"Vendors" },
  { to:"/admin/bookings", icon:"📋", label:"Bookings" },
];

export function AdminLayout({ children, title }) {
  const { user, logout } = useAuth();
  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#f5f0fa" }}>
      <aside style={ls.sidebar}>
        <div style={ls.logo}>💍 <span style={{ color:"#c9a84c" }}>Wedding</span>Wala</div>
        <div style={ls.adminTag}>Admin Panel</div>
        <nav style={{ flex:1 }}>
          {ANAV.map(n => (
            <Link key={n.to} to={n.to} style={ls.navItem}><span>{n.icon}</span> {n.label}</Link>
          ))}
        </nav>
        <div style={ls.userInfo}>
          <div style={ls.avatar}>{user?.name?.[0]}</div>
          <div>
            <div style={{ fontSize:"0.85rem", fontWeight:600, color:"#fff" }}>{user?.name}</div>
            <button onClick={logout} style={ls.logoutBtn}>Logout</button>
          </div>
        </div>
      </aside>
      <main style={{ flex:1, overflow:"auto" }}>
        <div style={ls.topbar}><h1 style={ls.pageTitle}>{title}</h1></div>
        <div style={{ padding:"28px 32px" }}>{children}</div>
      </main>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get("/admin/dashboard").then(r => setData(r.data)).catch(e => console.error(e));
  }, []);

  if (!data) return <AdminLayout title="Dashboard"><div style={{ textAlign:"center", padding:60 }}>Loading...</div></AdminLayout>;

  const { stats, monthly, recentBookings, topVendors } = data;

  return (
    <AdminLayout title="Admin Dashboard">
      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:16, marginBottom:28 }}>
        {[
          { label:"Total Users",     value:stats.totalUsers,    icon:"👥", color:"#7e22ce", link:"/admin/users" },
          { label:"Total Vendors",   value:stats.totalVendors,  icon:"🏪", color:"#2563eb", link:"/admin/vendors" },
          { label:"Total Bookings",  value:stats.totalBookings, icon:"📋", color:"#16a34a", link:"/admin/bookings" },
          { label:"Pending Approvals", value:stats.pendingVendors, icon:"⏳", color:"#f59e0b", link:"/admin/vendors?isApproved=false" },
          { label:"Platform Revenue", value:`₹${(stats.totalRevenue||0).toLocaleString()}`, icon:"💰", color:"#c9a84c", link:"#" },
        ].map(c => (
          <Link to={c.link} key={c.label} style={{ textDecoration:"none" }}>
            <div style={cs.statCard}>
              <div style={{ fontSize:"2rem", marginBottom:8 }}>{c.icon}</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2rem", fontWeight:700, color:c.color }}>{c.value}</div>
              <div style={{ fontSize:"0.78rem", color:"#7a6b8a", marginTop:4 }}>{c.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:24, marginBottom:24 }}>
        {/* Revenue Chart */}
        <div style={cs.card}>
          <h3 style={cs.cardTitle}>Monthly Bookings & Revenue</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly}>
              <XAxis dataKey="month" tick={{ fontSize:10 }} />
              <YAxis yAxisId="left" tick={{ fontSize:10 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize:10 }} />
              <Tooltip />
              <Bar yAxisId="left"  dataKey="bookings" fill="#1a0a2e" radius={[3,3,0,0]} name="Bookings" />
              <Bar yAxisId="right" dataKey="revenue"  fill="#c9a84c" radius={[3,3,0,0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Vendors */}
        <div style={cs.card}>
          <h3 style={cs.cardTitle}>Top Vendors</h3>
          {topVendors?.map((v, i) => (
            <div key={v._id} style={{ display:"flex", gap:12, alignItems:"center", padding:"10px 0", borderBottom:"1px solid #f0eaf8" }}>
              <div style={{ width:28, height:28, background:"#c9a84c", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.8rem", fontWeight:700, color:"#1a0a2e", flexShrink:0 }}>{i+1}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:"0.85rem", fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{v.businessName}</div>
                <div style={{ fontSize:"0.72rem", color:"#7a6b8a" }}>{v.category?.replace(/_/g," ")} • {v.location?.city}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:"0.82rem", fontWeight:700, color:"#c9a84c" }}>₹{(v.totalEarnings||0).toLocaleString()}</div>
                <div style={{ fontSize:"0.7rem", color:"#7a6b8a" }}>{v.totalBookings} bookings</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Bookings */}
      <div style={cs.card}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <h3 style={cs.cardTitle}>Recent Bookings</h3>
          <Link to="/admin/bookings" style={{ color:"#c9a84c", fontSize:"0.85rem", fontWeight:600 }}>View All →</Link>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.84rem" }}>
          <thead>
            <tr style={{ borderBottom:"2px solid #ede8f5" }}>
              {["ID","Customer","Vendor","Event","Date","Amount","Status"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"8px 10px", color:"#7a6b8a", fontWeight:600, fontSize:"0.75rem" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentBookings?.map(b => (
              <tr key={b._id} style={{ borderBottom:"1px solid #f5f0fa" }}>
                <td style={cs.td}>{b.bookingId}</td>
                <td style={cs.td}>{b.user?.name}</td>
                <td style={cs.td}>{b.vendor?.businessName}</td>
                <td style={cs.td}>{b.eventType}</td>
                <td style={cs.td}>{new Date(b.eventDate).toLocaleDateString()}</td>
                <td style={cs.td}>₹{b.pricing?.totalAmount?.toLocaleString()}</td>
                <td style={cs.td}><span style={{ background:{"pending":"#fef3c7","confirmed":"#d1fae5","cancelled":"#fee2e2","completed":"#dbeafe"}[b.status], color:{"pending":"#92400e","confirmed":"#065f46","cancelled":"#991b1b","completed":"#1e40af"}[b.status], padding:"2px 8px", borderRadius:12, fontSize:"0.7rem", fontWeight:700 }}>{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

const ls = {
  sidebar:  { width:240, background:"#0d0617", display:"flex", flexDirection:"column", padding:"24px 0", minHeight:"100vh", position:"sticky", top:0 },
  logo:     { fontFamily:"'Cormorant Garamond',serif", fontSize:"1.4rem", color:"#fff", padding:"0 20px 8px" },
  adminTag: { fontSize:"0.65rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"#c9a84c", padding:"0 20px 20px", borderBottom:"1px solid rgba(255,255,255,0.08)", marginBottom:16 },
  navItem:  { display:"flex", alignItems:"center", gap:12, padding:"11px 20px", color:"rgba(255,255,255,0.7)", textDecoration:"none", fontSize:"0.88rem" },
  userInfo: { display:"flex", alignItems:"center", gap:12, padding:"16px 20px", borderTop:"1px solid rgba(255,255,255,0.08)", marginTop:"auto" },
  avatar:   { width:34, height:34, background:"#c9a84c", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:"#1a0a2e" },
  logoutBtn:{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:"0.75rem", cursor:"pointer", padding:0 },
  topbar:   { background:"#fff", padding:"18px 32px", borderBottom:"1px solid #ede8f5", position:"sticky", top:0, zIndex:10 },
  pageTitle:{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.8rem" },
};
const cs = {
  statCard: { background:"#fff", borderRadius:12, padding:20, textAlign:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.05)", border:"1px solid #ede8f5" },
  card:     { background:"#fff", borderRadius:12, padding:24, boxShadow:"0 2px 8px rgba(0,0,0,0.05)", border:"1px solid #ede8f5" },
  cardTitle:{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.3rem", marginBottom:16 },
  td:       { padding:"9px 10px", color:"#555" },
};
