import { useState, useEffect } from "react";
import { VendorLayout } from "./VendorDashboard";
import { API } from "../../context/AuthContext";
import toast from "react-hot-toast";

const SC = { pending:"#f59e0b", confirmed:"#16a34a", completed:"#2563eb", cancelled:"#dc2626" };

export default function VendorBookings() {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    API.get("/vendors/my/dashboard").then(r => setData(r.data));
  }, []);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await API.put(`/bookings/${id}/status`, { status });
      setData(p => ({ ...p, bookings: p.bookings.map(b => b._id===id ? {...b,status} : b) }));
      toast.success(`Booking ${status}!`);
    } catch (err) { toast.error("Failed"); }
    finally { setUpdating(null); }
  };

  const bookings = data?.bookings || [];
  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);

  return (
    <VendorLayout title="Bookings">
      <div style={{ display:"flex", gap:10, marginBottom:24, flexWrap:"wrap" }}>
        {["all","pending","confirmed","completed","cancelled"].map(f => (
          <button key={f} style={{ padding:"7px 16px", background: filter===f?"#c9a84c":"#fff", color: filter===f?"#1a0a2e":"#7a6b8a", border:"1px solid", borderColor: filter===f?"#c9a84c":"#ede8f5", borderRadius:20, fontSize:"0.8rem", cursor:"pointer", fontWeight: filter===f?700:400, textTransform:"capitalize" }} onClick={() => setFilter(f)}>
            {f==="all" ? `All (${bookings.length})` : `${f} (${bookings.filter(b=>b.status===f).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:60, color:"#7a6b8a" }}>No bookings found</div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {filtered.map(b => (
            <div key={b._id} style={s.card}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <div>
                    <h3 style={s.customerName}>{b.user?.name}</h3>
                    <p style={{ color:"#7a6b8a", fontSize:"0.8rem" }}>{b.user?.email} • {b.user?.phone}</p>
                  </div>
                  <span style={{ background:SC[b.status]+"20", color:SC[b.status], padding:"3px 12px", borderRadius:20, fontSize:"0.75rem", fontWeight:700, textTransform:"capitalize", alignSelf:"flex-start" }}>{b.status}</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, padding:"12px 0", borderTop:"1px solid #f0eaf8", borderBottom:"1px solid #f0eaf8", marginBottom:12 }}>
                  {[
                    { l:"Event Date",  v:new Date(b.eventDate).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) },
                    { l:"Event Type",  v:b.eventType },
                    { l:"Guests",      v:b.guestCount || "N/A" },
                    { l:"Amount",      v:`₹${b.pricing?.totalAmount?.toLocaleString()}` },
                  ].map(i => (
                    <div key={i.l}>
                      <div style={{ fontSize:"0.68rem", color:"#7a6b8a", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:3 }}>{i.l}</div>
                      <div style={{ fontWeight:600, fontSize:"0.9rem" }}>{i.v}</div>
                    </div>
                  ))}
                </div>
                {b.specialRequests && <p style={{ fontSize:"0.82rem", color:"#555", marginBottom:8 }}>📝 {b.specialRequests}</p>}
                <div style={{ fontSize:"0.75rem", color:"#aaa" }}>Booking ID: {b.bookingId}</div>
              </div>
              {b.status === "pending" && (
                <div style={{ display:"flex", flexDirection:"column", gap:8, marginLeft:16 }}>
                  <button style={s.confirmBtn} disabled={updating===b._id} onClick={() => updateStatus(b._id,"confirmed")}>✅ Confirm</button>
                  <button style={s.rejectBtn}  disabled={updating===b._id} onClick={() => updateStatus(b._id,"cancelled")}>❌ Reject</button>
                </div>
              )}
              {b.status === "confirmed" && (
                <button style={{ ...s.confirmBtn, marginLeft:16 }} disabled={updating===b._id} onClick={() => updateStatus(b._id,"completed")}>✔ Mark Complete</button>
              )}
            </div>
          ))}
        </div>
      )}
    </VendorLayout>
  );
}

const s = {
  card:        { background:"#fff", border:"1px solid #ede8f5", borderRadius:12, padding:20, display:"flex", gap:12, boxShadow:"0 2px 8px rgba(0,0,0,0.04)" },
  customerName:{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.2rem", fontWeight:600, marginBottom:2 },
  confirmBtn:  { padding:"8px 16px", background:"#16a34a", color:"#fff", border:"none", borderRadius:6, fontSize:"0.8rem", cursor:"pointer", fontWeight:600 },
  rejectBtn:   { padding:"8px 16px", background:"transparent", color:"#dc2626", border:"1px solid #dc2626", borderRadius:6, fontSize:"0.8rem", cursor:"pointer" },
};
