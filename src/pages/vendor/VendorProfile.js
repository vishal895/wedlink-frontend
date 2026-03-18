import { useState, useEffect } from "react";
import { VendorLayout } from "./VendorDashboard";
import { API } from "../../context/AuthContext";
import toast from "react-hot-toast";

const CATS = ["banquet_hall","catering","decoration","photography","videography","pandit","event_manager","mehendi","makeup","music_dj","tent_house","horse_carriage","invitation_cards","jewellery","bridal_wear","groom_wear"];

export default function VendorProfile() {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    businessName:"", category:"banquet_hall", description:"", tagline:"",
    location:{ city:"", state:"", address:"", pincode:"" },
    pricing:{ startingPrice:"", maxPrice:"", priceUnit:"per_event" },
    capacity:{ min:"", max:"" },
    contact:{ phone:"", email:"", website:"" },
    amenities:"",
  });

  useEffect(() => {
    API.get("/vendors/my/dashboard").then(r => {
      setLoading(false);
      if (r.data.vendor) {
        const v = r.data.vendor;
        setVendor(v);
        setForm({ ...v, amenities: v.amenities?.join(", ") || "" });
      }
    }).catch(() => setLoading(false));
  }, []);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const setNested = (parent, key, val) => setForm(p => ({ ...p, [parent]: { ...p[parent], [key]: val } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, amenities: form.amenities.split(",").map(a => a.trim()).filter(Boolean) };
      if (vendor) {
        await API.put(`/vendors/${vendor._id}`, payload);
        toast.success("Profile updated!");
      } else {
        await API.post("/vendors", payload);
        toast.success("Profile created! Awaiting admin approval.");
      }
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
  };

  const F = ({ label, children }) => (
    <div style={{ marginBottom:16 }}>
      <label style={s.label}>{label}</label>
      {children}
    </div>
  );

  return (
    <VendorLayout title="My Business Profile">
      {loading ? <div style={{ textAlign:"center", padding:60 }}>Loading...</div> : (
        <form onSubmit={handleSubmit}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32 }}>
            {/* Basic Info */}
            <div style={s.section}>
              <h3 style={s.secTitle}>Basic Information</h3>
              <F label="Business Name *"><input style={s.input} value={form.businessName} onChange={e => set("businessName",e.target.value)} required /></F>
              <F label="Category *">
                <select style={s.input} value={form.category} onChange={e => set("category",e.target.value)}>
                  {CATS.map(c => <option key={c} value={c}>{c.replace(/_/g," ").replace(/\b\w/g,l=>l.toUpperCase())}</option>)}
                </select>
              </F>
              <F label="Tagline"><input style={s.input} placeholder="e.g. Making memories since 2015" value={form.tagline} onChange={e => set("tagline",e.target.value)} /></F>
              <F label="Description *"><textarea style={{ ...s.input, height:120, resize:"vertical" }} value={form.description} onChange={e => set("description",e.target.value)} required /></F>
              <F label="Amenities (comma separated)"><input style={s.input} placeholder="AC, Parking, DJ, Valet..." value={form.amenities} onChange={e => set("amenities",e.target.value)} /></F>
            </div>

            <div>
              {/* Location */}
              <div style={s.section}>
                <h3 style={s.secTitle}>Location</h3>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <F label="City *"><input style={s.input} value={form.location.city} onChange={e => setNested("location","city",e.target.value)} required /></F>
                  <F label="State *"><input style={s.input} value={form.location.state} onChange={e => setNested("location","state",e.target.value)} required /></F>
                  <F label="Pincode"><input style={s.input} value={form.location.pincode} onChange={e => setNested("location","pincode",e.target.value)} /></F>
                </div>
                <F label="Full Address"><input style={s.input} value={form.location.address} onChange={e => setNested("location","address",e.target.value)} /></F>
              </div>

              {/* Pricing */}
              <div style={s.section}>
                <h3 style={s.secTitle}>Pricing</h3>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <F label="Starting Price (₹) *"><input style={s.input} type="number" value={form.pricing.startingPrice} onChange={e => setNested("pricing","startingPrice",e.target.value)} required /></F>
                  <F label="Max Price (₹)"><input style={s.input} type="number" value={form.pricing.maxPrice} onChange={e => setNested("pricing","maxPrice",e.target.value)} /></F>
                </div>
                <F label="Price Unit">
                  <select style={s.input} value={form.pricing.priceUnit} onChange={e => setNested("pricing","priceUnit",e.target.value)}>
                    {["per_event","per_plate","per_hour","per_day"].map(u => <option key={u} value={u}>{u.replace(/_/g," ")}</option>)}
                  </select>
                </F>
              </div>

              {/* Contact */}
              <div style={s.section}>
                <h3 style={s.secTitle}>Contact</h3>
                <F label="Phone"><input style={s.input} value={form.contact.phone} onChange={e => setNested("contact","phone",e.target.value)} /></F>
                <F label="Business Email"><input style={s.input} type="email" value={form.contact.email} onChange={e => setNested("contact","email",e.target.value)} /></F>
                <F label="Website"><input style={s.input} type="url" placeholder="https://" value={form.contact.website} onChange={e => setNested("contact","website",e.target.value)} /></F>
              </div>
            </div>
          </div>

          <button type="submit" style={s.btn} disabled={saving}>{saving ? "Saving..." : vendor ? "Update Profile" : "Create Profile"}</button>
        </form>
      )}
    </VendorLayout>
  );
}

const s = {
  section: { background:"#fff", borderRadius:12, padding:20, marginBottom:20, border:"1px solid #ede8f5" },
  secTitle:{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.2rem", marginBottom:16, paddingBottom:10, borderBottom:"1px solid #ede8f5" },
  label:   { display:"block", fontSize:"0.78rem", fontWeight:600, color:"#7a6b8a", marginBottom:5, letterSpacing:"0.05em", textTransform:"uppercase" },
  input:   { width:"100%", padding:"10px 12px", border:"1.5px solid #ede8f5", borderRadius:8, fontSize:"0.88rem", outline:"none" },
  btn:     { padding:"13px 36px", background:"#c9a84c", color:"#1a0a2e", border:"none", borderRadius:8, fontWeight:700, fontSize:"1rem", cursor:"pointer" },
};
