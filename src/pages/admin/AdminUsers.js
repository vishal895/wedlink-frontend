import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "./AdminDashboard";
import { API } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function AdminUsers() {
  const [users, setUsers]   = useState([]);
  const [total, setTotal]   = useState(0);
  const [search, setSearch] = useState("");
  const [role, setRole]     = useState("");
  const [page, setPage]     = useState(1);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams({ page, limit:20 });
    if (search) q.set("search", search);
    if (role)   q.set("role",   role);
    try {
      const { data } = await API.get(`/admin/users?${q}`);
      setUsers(data.users); setTotal(data.total);
    } catch(e) {}
    finally { setLoading(false); }
  }, [search, role, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const toggleStatus = async (id) => {
    try {
      const { data } = await API.put(`/admin/users/${id}/toggle`);
      setUsers(p => p.map(u => u._id===id ? {...u, isActive:data.user.isActive} : u));
      toast.success(`User ${data.user.isActive ? "activated" : "deactivated"}`);
    } catch { toast.error("Failed"); }
  };

  return (
    <AdminLayout title="Users Management">
      {/* Filters */}
      <div style={{ display:"flex", gap:12, marginBottom:24, flexWrap:"wrap" }}>
        <input style={s.inp} placeholder="Search by name, email, phone..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={{ ...s.inp, maxWidth:160 }} value={role} onChange={e => setRole(e.target.value)}>
          <option value="">All Roles</option>
          <option value="user">Customer</option>
          <option value="vendor">Vendor</option>
          <option value="admin">Admin</option>
        </select>
        <button style={s.searchBtn} onClick={fetch}>Search</button>
      </div>

      <div style={s.card}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16, alignItems:"center" }}>
          <h3 style={s.cardTitle}>All Users</h3>
          <span style={{ color:"#7a6b8a", fontSize:"0.85rem" }}>{total} users total</span>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.84rem" }}>
          <thead>
            <tr style={{ borderBottom:"2px solid #ede8f5" }}>
              {["Name","Email","Phone","Role","Joined","Status","Action"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"8px 12px", color:"#7a6b8a", fontWeight:600, fontSize:"0.75rem" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign:"center", padding:40, color:"#7a6b8a" }}>Loading...</td></tr>
            ) : users.map(u => (
              <tr key={u._id} style={{ borderBottom:"1px solid #f5f0fa" }}>
                <td style={s.td}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:32, height:32, background:"#c9a84c", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:"#1a0a2e", fontSize:"0.85rem", flexShrink:0 }}>{u.name?.[0]}</div>
                    <span>{u.name}</span>
                  </div>
                </td>
                <td style={s.td}>{u.email}</td>
                <td style={s.td}>{u.phone}</td>
                <td style={s.td}><span style={{ background:{"user":"#dbeafe","vendor":"#d1fae5","admin":"#fee2e2"}[u.role], color:{"user":"#1e40af","vendor":"#065f46","admin":"#991b1b"}[u.role], padding:"2px 10px", borderRadius:12, fontSize:"0.72rem", fontWeight:700 }}>{u.role}</span></td>
                <td style={s.td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td style={s.td}><span style={{ color: u.isActive ? "#16a34a":"#dc2626", fontWeight:600, fontSize:"0.8rem" }}>{u.isActive ? "Active":"Inactive"}</span></td>
                <td style={s.td}>
                  <button style={{ padding:"5px 12px", background: u.isActive ? "#fee2e2":"#d1fae5", color: u.isActive ? "#991b1b":"#065f46", border:"none", borderRadius:6, fontSize:"0.75rem", cursor:"pointer", fontWeight:600 }} onClick={() => toggleStatus(u._id)}>
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
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
  td:       { padding:"10px 12px", color:"#555" },
};
