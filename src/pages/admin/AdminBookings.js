import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "./AdminDashboard";
import { API } from "../../context/AuthContext";

const SC = { pending:"#f59e0b", confirmed:"#16a34a", completed:"#2563eb", cancelled:"#dc2626" };

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [total, setTotal]       = useState(0);
  const [status, setStatus]     = useState("");
  const [page, setPage]         = useState(1);
  const [pages, setPages]       = useState(1);
  const [loading, setLoading]   = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams({ page, limit:20 });
    if (status) q.set("status", status);
    try {
      const { data } = await API.get(`/admin/bookings?${q}`);
      setBookings(data.bookings); setTotal(data.total);
      setPages(Math.ceil(data.total / 20));
    } catch(e) {}
    finally { setLoading(false); }
  }, [status, page]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <AdminLayout title="All Bookings">
      <div style={{ display:"flex", gap:10, marginBottom:24, flexWrap:"wrap" }}>
        {["","pending","confirmed","completed","cancelled"].map(f => (
          <button key={f} style={{ padding:"7px 16px", background: status===f?"#1a0a2e":"#fff", color: status===f?"#fff":"#7a6b8a", border:"1px solid", borderColor: status===f?"#1a0a2e":"#ede8f5", borderRadius:20, fontSize:"0.8rem", cursor:"pointer", textTransform:"capitalize" }} onClick={() => { setStatus(f); setPage(1); }}>
            {f || "All Bookings"}
          </button>
        ))}
      </div>

      <div style={s.card}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
          <h3 style={s.cardTitle}>Bookings</h3>
          <span style={{ color:"#7a6b8a", fontSize:"0.85rem" }}>{total} total</span>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.83rem" }}>
          <thead>
            <tr style={{ borderBottom:"2px solid #ede8f5" }}>
              {["Booking ID","Customer","Vendor","Event","Date","Guests","Amount","Payment","Status"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"8px 10px", color:"#7a6b8a", fontWeight:600, fontSize:"0.72rem" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={9} style={{ textAlign:"center", padding:40, color:"#7a6b8a" }}>Loading...</td></tr> :
             bookings.map(b => (
              <tr key={b._id} style={{ borderBottom:"1px solid #f5f0fa" }}>
                <td style={s.td}>{b.bookingId}</td>
                <td style={s.td}>{b.user?.name}<br/><span style={{ fontSize:"0.72rem", color:"#7a6b8a" }}>{b.user?.phone}</span></td>
                <td style={s.td}>{b.vendor?.businessName}</td>
                <td style={s.td}><span style={{ textTransform:"capitalize" }}>{b.eventType}</span></td>
                <td style={s.td}>{new Date(b.eventDate).toLocaleDateString()}</td>
                <td style={s.td}>{b.guestCount || "—"}</td>
                <td style={s.td}>₹{b.pricing?.totalAmount?.toLocaleString()}</td>
                <td style={s.td}><span style={{ background:{"unpaid":"#fee2e2","partial":"#fef3c7","paid":"#d1fae5"}[b.payment?.status]||"#f5f5f5", color:{"unpaid":"#991b1b","partial":"#92400e","paid":"#065f46"}[b.payment?.status]||"#555", padding:"2px 8px", borderRadius:10, fontSize:"0.7rem", fontWeight:600 }}>{b.payment?.status}</span></td>
                <td style={s.td}><span style={{ background:SC[b.status]+"20", color:SC[b.status], padding:"2px 8px", borderRadius:10, fontSize:"0.72rem", fontWeight:700 }}>{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>

        {pages > 1 && (
          <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:20 }}>
            <button style={s.pageBtn} disabled={page===1} onClick={() => setPage(p=>p-1)}>← Prev</button>
            <span style={{ padding:"8px 12px", fontSize:"0.85rem", color:"#7a6b8a" }}>Page {page} of {pages}</span>
            <button style={s.pageBtn} disabled={page===pages} onClick={() => setPage(p=>p+1)}>Next →</button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

const s = {
  card:     { background:"#fff", borderRadius:12, padding:24, boxShadow:"0 2px 8px rgba(0,0,0,0.05)", border:"1px solid #ede8f5" },
  cardTitle:{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.3rem" },
  td:       { padding:"9px 10px", color:"#555" },
  pageBtn:  { padding:"7px 16px", border:"1px solid #ede8f5", background:"#fff", borderRadius:6, cursor:"pointer", fontSize:"0.82rem" },
};
