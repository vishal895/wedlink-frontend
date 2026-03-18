import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { API } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function BookingPage() {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    eventDate:"", eventEndDate:"", eventType:"wedding",
    guestCount:"", timeSlot:"", specialRequests:""
  });

  useEffect(() => {
    API.get(`/vendors/${vendorId}`).then(r => setVendor(r.data.vendor));
  }, [vendorId]);

  const base     = vendor?.pricing?.startingPrice || 0;
  const taxes    = Math.round(base * 0.18);
  const total    = base + taxes;
  const advance  = Math.round(total * 0.3);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("/bookings", { vendorId, ...form, guestCount: Number(form.guestCount) });
      toast.success("Booking confirmed! 🎉");
      navigate("/my-bookings");
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally { setLoading(false); }
  };

  if (!vendor) return <div style={{ paddingTop:100, textAlign:"center" }}>Loading...</div>;

  return (
    <div style={{ paddingTop:64 }}>
      <Navbar />
      <div style={s.page}>
        <div style={s.left}>
          <h1 style={s.title}>Complete Your Booking</h1>
          <p style={s.sub}>Booking: <strong>{vendor.businessName}</strong></p>

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <div style={s.row}>
              <div style={{ flex:1 }}>
                <label style={s.label}>Event Date *</label>
                <input style={s.input} type="date" value={form.eventDate} onChange={e => setForm(p=>({...p,eventDate:e.target.value}))} required min={new Date().toISOString().split("T")[0]} />
              </div>
              <div style={{ flex:1 }}>
                <label style={s.label}>Event End Date</label>
                <input style={s.input} type="date" value={form.eventEndDate} onChange={e => setForm(p=>({...p,eventEndDate:e.target.value}))} min={form.eventDate} />
              </div>
            </div>

            <div style={s.row}>
              <div style={{ flex:1 }}>
                <label style={s.label}>Event Type *</label>
                <select style={s.input} value={form.eventType} onChange={e => setForm(p=>({...p,eventType:e.target.value}))} required>
                  {["wedding","engagement","reception","haldi","mehendi","sangeet","other"].map(t => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex:1 }}>
                <label style={s.label}>Guest Count</label>
                <input style={s.input} type="number" placeholder="e.g. 200" value={form.guestCount} onChange={e => setForm(p=>({...p,guestCount:e.target.value}))} min="1" />
              </div>
            </div>

            <div>
              <label style={s.label}>Preferred Time Slot</label>
              <select style={s.input} value={form.timeSlot} onChange={e => setForm(p=>({...p,timeSlot:e.target.value}))}>
                <option value="">Select time slot</option>
                {["Morning (6am-12pm)","Afternoon (12pm-5pm)","Evening (5pm-9pm)","Night (9pm onwards)","Full Day"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={s.label}>Special Requests</label>
              <textarea style={{ ...s.input, height:100, resize:"vertical" }} placeholder="Any special requirements, dietary needs, etc." value={form.specialRequests} onChange={e => setForm(p=>({...p,specialRequests:e.target.value}))} />
            </div>

            <button type="submit" style={s.btn} disabled={loading}>{loading ? "Processing..." : "Confirm Booking"}</button>
          </form>
        </div>

        {/* Price Summary */}
        <div style={s.summary}>
          <div style={{ ...s.summaryImg, backgroundImage:`url(${vendor.coverImage || "https://via.placeholder.com/300x180"})` }} />
          <h3 style={s.vendorName}>{vendor.businessName}</h3>
          <p style={{ color:"#7a6b8a", fontSize:"0.82rem", marginBottom:20 }}>📍 {vendor.location?.city}, {vendor.location?.state}</p>

          <div style={s.priceRows}>
            <div style={s.priceRow}><span>Base Price</span><span>₹{base.toLocaleString()}</span></div>
            <div style={s.priceRow}><span>GST (18%)</span><span>₹{taxes.toLocaleString()}</span></div>
            <hr style={{ border:"none", borderTop:"1px dashed #ede8f5", margin:"8px 0" }} />
            <div style={{ ...s.priceRow, fontWeight:700, fontSize:"1rem" }}><span>Total</span><span style={{ color:"#c9a84c" }}>₹{total.toLocaleString()}</span></div>
            <div style={{ ...s.priceRow, color:"#16a34a", fontSize:"0.85rem" }}><span>Advance (30%)</span><span>₹{advance.toLocaleString()}</span></div>
          </div>

          <div style={s.note}>
            <p style={{ fontSize:"0.8rem", color:"#7a6b8a", lineHeight:1.6 }}>
              ✅ Free cancellation before 7 days<br/>
              💰 30% advance to confirm booking<br/>
              🔒 Secure payment guaranteed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page:       { maxWidth:960, margin:"0 auto", padding:"40px 4%", display:"flex", gap:40, alignItems:"flex-start" },
  left:       { flex:1 },
  title:      { fontFamily:"'Cormorant Garamond',serif", fontSize:"2rem", marginBottom:4 },
  sub:        { color:"#7a6b8a", marginBottom:32, fontSize:"0.9rem" },
  row:        { display:"flex", gap:16 },
  label:      { display:"block", fontSize:"0.78rem", fontWeight:600, color:"#2d1b3d", marginBottom:6, letterSpacing:"0.05em" },
  input:      { width:"100%", padding:"11px 14px", border:"1.5px solid #ede8f5", borderRadius:8, fontSize:"0.9rem", outline:"none", background:"#fff" },
  btn:        { padding:"14px", background:"#c9a84c", color:"#1a0a2e", border:"none", borderRadius:8, fontWeight:700, fontSize:"1rem", cursor:"pointer" },
  summary:    { width:280, flexShrink:0, background:"#fff", borderRadius:12, border:"1px solid #ede8f5", overflow:"hidden", boxShadow:"0 4px 16px rgba(0,0,0,0.06)", position:"sticky", top:84 },
  summaryImg: { height:160, backgroundSize:"cover", backgroundPosition:"center" },
  vendorName: { fontFamily:"'Cormorant Garamond',serif", fontSize:"1.3rem", padding:"16px 16px 4px" },
  priceRows:  { padding:"0 16px 16px" },
  priceRow:   { display:"flex", justifyContent:"space-between", fontSize:"0.88rem", padding:"6px 0", color:"#555" },
  note:       { background:"#f9f5ff", padding:16, borderTop:"1px solid #ede8f5" },
};
