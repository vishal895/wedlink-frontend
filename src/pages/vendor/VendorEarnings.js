import { useState, useEffect } from "react";
import { VendorLayout } from "./VendorDashboard";
import { API } from "../../context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function VendorEarnings() {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get("/vendors/my/dashboard").then(r => setData(r.data));
  }, []);

  if (!data) return <VendorLayout title="Earnings"><div style={{ textAlign:"center", padding:60 }}>Loading...</div></VendorLayout>;

  const { stats, monthly } = data;

  return (
    <VendorLayout title="Earnings & Revenue">
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:28 }}>
        {[
          { label:"Total Revenue",    value:`₹${stats.totalEarnings.toLocaleString()}`,   color:"#c9a84c", icon:"💰" },
          { label:"Paid to Date",     value:`₹${stats.paidEarnings.toLocaleString()}`,    color:"#16a34a", icon:"✅" },
          { label:"Pending Payment",  value:`₹${stats.pendingPayments.toLocaleString()}`, color:"#f59e0b", icon:"⏳" },
        ].map(c => (
          <div key={c.label} style={{ background:"#fff", borderRadius:12, padding:24, border:"1px solid #ede8f5", boxShadow:"0 2px 8px rgba(0,0,0,0.04)", textAlign:"center" }}>
            <div style={{ fontSize:"2.5rem", marginBottom:8 }}>{c.icon}</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2rem", fontWeight:700, color:c.color }}>{c.value}</div>
            <div style={{ fontSize:"0.8rem", color:"#7a6b8a", marginTop:4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
        <div style={{ background:"#fff", borderRadius:12, padding:24, border:"1px solid #ede8f5" }}>
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.3rem", marginBottom:20 }}>Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthly}>
              <XAxis dataKey="month" tick={{ fontSize:11 }} />
              <YAxis tick={{ fontSize:11 }} />
              <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
              <Bar dataKey="earnings" fill="#c9a84c" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background:"#fff", borderRadius:12, padding:24, border:"1px solid #ede8f5" }}>
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.3rem", marginBottom:20 }}>Booking Summary</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {[
              { label:"Total Bookings",  value:stats.totalBookings,  color:"#7e22ce" },
              { label:"Confirmed",       value:stats.confirmed,       color:"#16a34a" },
              { label:"Completed",       value:stats.completed,       color:"#2563eb" },
              { label:"Pending",         value:stats.pending,         color:"#f59e0b" },
              { label:"Cancelled",       value:stats.cancelled,       color:"#dc2626" },
            ].map(i => (
              <div key={i.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid #f0eaf8" }}>
                <span style={{ fontSize:"0.88rem", color:"#555" }}>{i.label}</span>
                <span style={{ fontWeight:700, color:i.color, fontSize:"1.2rem" }}>{i.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </VendorLayout>
  );
}
