import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { API } from "../../context/AuthContext";
import toast from "react-hot-toast";

const STATUS_COLORS = { pending:"#f59e0b", confirmed:"#16a34a", completed:"#2563eb", cancelled:"#dc2626" };

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("all");

  useEffect(() => {
    API.get("/bookings/my").then(r => { setBookings(r.data.bookings); setLoading(false); });
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await API.put(`/bookings/${id}/cancel`, { reason: "Customer requested cancellation" });
      setBookings(p => p.map(b => b._id===id ? {...b, status:"cancelled"} : b));
      toast.success("Booking cancelled. Refund will be processed.");
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div style={{ paddingTop:64 }}>
      <Navbar />
      <div style={{ maxWidth:900, margin:"0 auto", padding:"40px 4%" }}>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2.2rem", marginBottom:8 }}>My Bookings</h1>
        <p style={{ color:"#7a6b8a", marginBottom:28 }}>Track all your wedding bookings</p>

        <div style={{ display:"flex", gap:10, marginBottom:28, flexWrap:"wrap" }}>
          {["all","pending","confirmed","completed","cancelled"].map(f => (
            <button key={f} style={{ padding:"7px 18px", background: filter===f ? "#c9a84c":"transparent", color: filter===f ? "#1a0a2e":"#7a6b8a", border:"1px solid", borderColor: filter===f ? "#c9a84c":"#ede8f5", borderRadius:20, fontSize:"0.82rem", cursor:"pointer", fontWeight: filter===f ? 700:400, textTransform:"capitalize" }} onClick={() => setFilter(f)}>
              {f === "all" ? `All (${bookings.length})` : `${f} (${bookings.filter(b=>b.status===f).length})`}
            </button>
          ))}
        </div>

        {loading ? <div style={{ textAlign:"center", padding:60, color:"#7a6b8a" }}>Loading...</div> :
         filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <div style={{ fontSize:"3rem", marginBottom:16 }}>📋</div>
            <h3 style={{ marginBottom:8 }}>No bookings found</h3>
            <button style={{ padding:"10px 24px", background:"#c9a84c", color:"#1a0a2e", border:"none", borderRadius:8, fontWeight:600, cursor:"pointer", marginTop:8 }} onClick={() => navigate("/vendors")}>Browse Vendors</button>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {filtered.map(b => (
              <div key={b._id} style={s.card}>
                <div style={{ ...s.vendorImg, backgroundImage:`url(${b.vendor?.coverImage || "https://via.placeholder.com/100"})` }} />
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                    <h3 style={s.vendorName}>{b.vendor?.businessName}</h3>
                    <span style={{ ...s.statusBadge, background: STATUS_COLORS[b.status]+"20", color: STATUS_COLORS[b.status] }}>{b.status}</span>
                  </div>
                  <p style={{ color:"#7a6b8a", fontSize:"0.82rem", marginBottom:4 }}>📍 {b.vendor?.location?.city} • 🗓️ {new Date(b.eventDate).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</p>
                  <p style={{ color:"#7a6b8a", fontSize:"0.82rem", marginBottom:8 }}>🎉 {b.eventType?.charAt(0).toUpperCase()+b.eventType?.slice(1)} • 👥 {b.guestCount || "N/A"} guests</p>
                  <div style={{ display:"flex", gap:16, alignItems:"center" }}>
                    <span style={{ fontWeight:700, color:"#c9a84c" }}>₹{b.pricing?.totalAmount?.toLocaleString()}</span>
                    <span style={{ fontSize:"0.78rem", color:"#7a6b8a" }}>Booking ID: {b.bookingId}</span>
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:8, alignItems:"flex-end" }}>
                  <button style={s.viewBtn} onClick={() => navigate(`/vendors/${b.vendor?._id}`)}>View Vendor</button>
                  {b.status === "pending" && <button style={s.cancelBtn} onClick={() => handleCancel(b._id)}>Cancel</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  card:       { background:"#fff", border:"1px solid #ede8f5", borderRadius:12, padding:20, display:"flex", gap:16, alignItems:"flex-start", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" },
  vendorImg:  { width:80, height:80, borderRadius:8, backgroundSize:"cover", backgroundPosition:"center", flexShrink:0 },
  vendorName: { fontFamily:"'Cormorant Garamond',serif", fontSize:"1.15rem", fontWeight:600 },
  statusBadge:{ padding:"3px 12px", borderRadius:20, fontSize:"0.75rem", fontWeight:700, textTransform:"capitalize" },
  viewBtn:    { padding:"7px 16px", background:"#1a0a2e", color:"#fff", border:"none", borderRadius:6, fontSize:"0.8rem", cursor:"pointer" },
  cancelBtn:  { padding:"7px 16px", background:"transparent", color:"#dc2626", border:"1px solid #dc2626", borderRadius:6, fontSize:"0.8rem", cursor:"pointer" },
};
