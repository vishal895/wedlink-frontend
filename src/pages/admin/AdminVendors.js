import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "./AdminDashboard";
import { API } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [total, setTotal]     = useState(0);
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("");
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams({ limit:50 });
    if (search) q.set("search", search);
    if (filter !== "") q.set("isApproved", filter);
    try {
      const { data } = await API.get(`/admin/vendors?${q}`);
      setVendors(data.vendors); setTotal(data.total);
    } catch(e) {}
    finally { setLoading(false); }
  }, [search, filter]);

  useEffect(() => { fetch(); }, [fetch]);

  const toggleApproval = async (id, current) => {
    try {
      await API.put(`/admin/vendors/${id}/approve`, { isApproved: !current });
      setVendors(p => p.map(v => v._id===id ? {...v, isApproved:!current} : v));
      toast.success(`Vendor ${!current ? "approved" : "rejected"}`);
    } catch { toast.error("Failed"); }
  };

  const toggleFeatured = async (id, current) => {
    try {
      await API.put(`/admin/vendors/${id}/featured`);
      setVendors(p => p.map(v => v._id===id ? {...v, isFeatured:!current} : v));
      toast.success(`Vendor ${!current ? "featured" : "unfeatured"}`);
    } catch { toast.error("Failed"); }
  };

  return (
    <AdminLayout title="Vendors Management">
      <div style={{ display:"flex", gap:12, marginBottom:24, flexWrap:"wrap" }}>
        <input style={s.inp} placeholder="Search vendors..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={{ ...s.inp, maxWidth:200 }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Vendors</option>
          <option value="false">Pending Approval</option>
          <option value="true">Approved</option>
        </select>
        <button style={s.searchBtn} onClick={fetch}>Search</button>
      </div>

      {/* Pending Banner */}
      {vendors.filter(v => !v.isApproved).length > 0 && (
        <div style={{ background:"#fef9c3", border:"1px solid #fde047", borderRadius:8, padding:"12px 16px", marginBottom:16, fontSize:"0.88rem" }}>
          ⚠️ <strong>{vendors.filter(v=>!v.isApproved).length} vendors</strong> are pending approval
        </div>
      )}

      <div style={s.card}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
          <h3 style={s.cardTitle}>All Vendors</h3>
          <span style={{ color:"#7a6b8a", fontSize:"0.85rem" }}>{total} vendors</span>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.83rem" }}>
          <thead>
            <tr style={{ borderBottom:"2px solid #ede8f5" }}>
              {["Business","Owner","Category","City","Bookings","Earnings","Status","Actions"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"8px 10px", color:"#7a6b8a", fontWeight:600, fontSize:"0.72rem" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={8} style={{ textAlign:"center", padding:40, color:"#7a6b8a" }}>Loading...</td></tr> :
             vendors.map(v => (
              <tr key={v._id} style={{ borderBottom:"1px solid #f5f0fa" }}>
                <td style={s.td}>
                  <div style={{ fontWeight:600 }}>{v.businessName}</div>
                  {v.isFeatured && <span style={{ fontSize:"0.65rem", color:"#c9a84c" }}>⭐ Featured</span>}
                </td>
                <td style={s.td}>{v.owner?.name}<br/><span style={{ fontSize:"0.72rem", color:"#7a6b8a" }}>{v.owner?.email}</span></td>
                <td style={s.td}><span style={{ background:"#f3e8ff", color:"#7e22ce", padding:"2px 8px", borderRadius:10, fontSize:"0.7rem" }}>{v.category?.replace(/_/g," ")}</span></td>
                <td style={s.td}>{v.location?.city}</td>
                <td style={s.td}>{v.totalBookings || 0}</td>
                <td style={s.td}>₹{(v.totalEarnings||0).toLocaleString()}</td>
                <td style={s.td}><span style={{ background: v.isApproved ? "#d1fae5":"#fef3c7", color: v.isApproved ? "#065f46":"#92400e", padding:"2px 10px", borderRadius:12, fontSize:"0.72rem", fontWeight:700 }}>{v.isApproved ? "Approved":"Pending"}</span></td>
                <td style={s.td}>
                  <div style={{ display:"flex", gap:6 }}>
                    <button style={{ padding:"4px 10px", background: v.isApproved ? "#fee2e2":"#d1fae5", color: v.isApproved ? "#991b1b":"#065f46", border:"none", borderRadius:5, fontSize:"0.72rem", cursor:"pointer", fontWeight:600 }} onClick={() => toggleApproval(v._id, v.isApproved)}>
                      {v.isApproved ? "Revoke" : "Approve"}
                    </button>
                    <button style={{ padding:"4px 10px", background: v.isFeatured ? "#f3f4f6":"#fef9c3", color: v.isFeatured ? "#6b7280":"#92400e", border:"none", borderRadius:5, fontSize:"0.72rem", cursor:"pointer" }} onClick={() => toggleFeatured(v._id, v.isFeatured)}>
                      {v.isFeatured ? "Unfeature" : "Feature"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

const s = {
  inp:      { flex:1, minWidth:200, padding:"10px 14px", border:"1.5px solid #ede8f5", borderRadius:8, fontSize:"0.88rem", outline:"none", background:"#fff" },
  searchBtn:{ padding:"10px 20px", background:"#1a0a2e", color:"#fff", border:"none", borderRadius:8, fontWeight:600, cursor:"pointer" },
  card:     { background:"#fff", borderRadius:12, padding:24, boxShadow:"0 2px 8px rgba(0,0,0,0.05)", border:"1px solid #ede8f5" },
  cardTitle:{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.3rem" },
  td:       { padding:"9px 10px", color:"#555" },
};
