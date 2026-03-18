import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { API } from "../../context/AuthContext";

const CATS = [
  { value:"banquet_hall", label:"Banquet Hall", icon:"🏛️" },
  { value:"catering",     label:"Catering",     icon:"🍽️" },
  { value:"decoration",   label:"Decoration",   icon:"🌸" },
  { value:"photography",  label:"Photography",  icon:"📸" },
  { value:"pandit",       label:"Pandit Ji",    icon:"🙏" },
  { value:"event_manager",label:"Event Manager",icon:"📋" },
  { value:"mehendi",      label:"Mehendi",      icon:"✋" },
  { value:"makeup",       label:"Makeup",       icon:"💄" },
  { value:"music_dj",     label:"Music / DJ",   icon:"🎵" },
  { value:"tent_house",   label:"Tent House",   icon:"⛺" },
  { value:"horse_carriage",label:"Baraat",      icon:"🐴" },
  { value:"videography",  label:"Videography",  icon:"🎬" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch]     = useState("");
  const [city,   setCity]       = useState("");
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    API.get("/vendors?sort=featured&limit=6").then(r => setFeatured(r.data.vendors)).catch(() => {});
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (city)   params.set("city",   city);
    navigate(`/vendors?${params}`);
  };

  return (
    <div>
      <Navbar />

      {/* HERO */}
      <section style={s.hero}>
        <div style={s.heroOverlay} />
        <div style={s.heroContent}>
          <p style={s.heroTag}>✦ India's #1 Wedding Planning Platform ✦</p>
          <h1 style={s.heroH1}>Plan Your <em style={{ color:"#c9a84c", fontStyle:"italic" }}>Dream</em> Wedding</h1>
          <p style={s.heroSub}>Book verified vendors — halls, caterers, decorators, pandits & more</p>

          <div style={s.searchBox}>
            <input style={s.searchInput} placeholder="Search vendors, services..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key==="Enter" && handleSearch()} />
            <input style={{ ...s.searchInput, borderLeft:"1px solid #ede8f5" }} placeholder="City..." value={city} onChange={e => setCity(e.target.value)} onKeyDown={e => e.key==="Enter" && handleSearch()} />
            <button style={s.searchBtn} onClick={handleSearch}>Search</button>
          </div>

          <div style={{ display:"flex", gap:12, marginTop:16, flexWrap:"wrap", justifyContent:"center" }}>
            {["Delhi","Mumbai","Jaipur","Bangalore","Hyderabad"].map(c => (
              <button key={c} style={s.cityChip} onClick={() => navigate(`/vendors?city=${c}`)}>{c}</button>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Browse by <span style={{ color:"#c9a84c" }}>Category</span></h2>
        <p style={s.sectionSub}>Everything you need for a perfect wedding</p>
        <div style={s.catGrid}>
          {CATS.map(cat => (
            <div key={cat.value} style={s.catCard} onClick={() => navigate(`/vendors?category=${cat.value}`)}>
              <div style={s.catIcon}>{cat.icon}</div>
              <div style={s.catLabel}>{cat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED VENDORS */}
      {featured.length > 0 && (
        <section style={{ ...s.section, background:"#f9f5ff" }}>
          <h2 style={s.sectionTitle}>Featured <span style={{ color:"#c9a84c" }}>Vendors</span></h2>
          <p style={s.sectionSub}>Top-rated vendors trusted by thousands of couples</p>
          <div style={s.vendorGrid}>
            {featured.map(v => <VendorCard key={v._id} vendor={v} />)}
          </div>
          <div style={{ textAlign:"center", marginTop:40 }}>
            <button style={s.viewAllBtn} onClick={() => navigate("/vendors")}>View All Vendors →</button>
          </div>
        </section>
      )}

      {/* WHY US */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Why Choose <span style={{ color:"#c9a84c" }}>WeddingWala?</span></h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:24, marginTop:40 }}>
          {[
            { icon:"✅", title:"Verified Vendors",   desc:"All vendors are background-checked and verified" },
            { icon:"💰", title:"Best Prices",        desc:"Compare quotes and get the best deals" },
            { icon:"⭐", title:"Trusted Reviews",    desc:"Real reviews from real couples" },
            { icon:"🤝", title:"Dedicated Support",  desc:"24/7 support for your wedding journey" },
          ].map(f => (
            <div key={f.title} style={s.featureCard}>
              <div style={{ fontSize:"2.5rem", marginBottom:12 }}>{f.icon}</div>
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.3rem", marginBottom:8 }}>{f.title}</h3>
              <p style={{ color:"#7a6b8a", fontSize:"0.9rem", lineHeight:1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* VENDOR CTA */}
      <section style={s.vendorCTA}>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2.5rem", color:"#fff", marginBottom:12 }}>Are you a Wedding Vendor?</h2>
        <p style={{ color:"rgba(255,255,255,0.8)", marginBottom:28, fontSize:"1rem" }}>Join thousands of vendors and grow your business with WeddingWala</p>
        <button style={s.ctaBtn} onClick={() => navigate("/register?role=vendor")}>Register as Vendor</button>
      </section>

      {/* FOOTER */}
      <footer style={s.footer}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.5rem", color:"#c9a84c", marginBottom:8 }}>💍 WeddingWala</div>
        <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.85rem" }}>© 2025 WeddingWala. All rights reserved.</p>
      </footer>
    </div>
  );
}

function VendorCard({ vendor }) {
  const navigate = useNavigate();
  return (
    <div style={s.vCard} onClick={() => navigate(`/vendors/${vendor._id}`)}>
      <div style={{ ...s.vImg, backgroundImage:`url(${vendor.coverImage || "https://via.placeholder.com/400x250?text="+vendor.businessName})` }}>
        {vendor.isFeatured && <span style={s.featuredBadge}>⭐ Featured</span>}
        <span style={s.catBadge}>{vendor.category?.replace(/_/g," ")}</span>
      </div>
      <div style={s.vBody}>
        <h3 style={s.vName}>{vendor.businessName}</h3>
        <p style={{ color:"#7a6b8a", fontSize:"0.82rem", marginBottom:6 }}>📍 {vendor.location?.city}, {vendor.location?.state}</p>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ color:"#c9a84c", fontWeight:600 }}>₹{vendor.pricing?.startingPrice?.toLocaleString()}+</span>
          <span style={{ color:"#f59e0b", fontSize:"0.85rem" }}>★ {vendor.ratings?.average || "New"} ({vendor.ratings?.count || 0})</span>
        </div>
      </div>
    </div>
  );
}

const s = {
  hero:       { minHeight:"100vh", background:"linear-gradient(135deg,#1a0a2e 0%,#2d0f4e 60%,#1a0a2e 100%)", display:"flex", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"80px 5% 60px", position:"relative" },
  heroOverlay:{ position:"absolute", inset:0, background:"radial-gradient(ellipse at center, rgba(201,168,76,0.08) 0%, transparent 70%)" },
  heroContent:{ position:"relative", zIndex:1, maxWidth:760 },
  heroTag:    { color:"#c9a84c", fontSize:"0.75rem", letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:16 },
  heroH1:     { fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(3rem,7vw,5.5rem)", color:"#fff", lineHeight:1.1, marginBottom:16 },
  heroSub:    { color:"rgba(255,255,255,0.7)", fontSize:"1.1rem", marginBottom:36 },
  searchBox:  { display:"flex", background:"#fff", borderRadius:12, overflow:"hidden", maxWidth:620, margin:"0 auto", boxShadow:"0 8px 32px rgba(0,0,0,0.25)" },
  searchInput:{ flex:1, padding:"16px 18px", border:"none", outline:"none", fontSize:"0.9rem", color:"#2d1b3d" },
  searchBtn:  { padding:"16px 28px", background:"#c9a84c", color:"#1a0a2e", border:"none", fontWeight:700, fontSize:"0.9rem", cursor:"pointer" },
  cityChip:   { padding:"6px 16px", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", color:"rgba(255,255,255,0.8)", borderRadius:20, fontSize:"0.8rem", cursor:"pointer" },
  section:    { padding:"80px 5%", maxWidth:1200, margin:"0 auto" },
  sectionTitle:{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2.5rem", textAlign:"center", marginBottom:8 },
  sectionSub: { color:"#7a6b8a", textAlign:"center", marginBottom:40 },
  catGrid:    { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:16 },
  catCard:    { background:"#fff", border:"1px solid #ede8f5", borderRadius:12, padding:"24px 16px", textAlign:"center", cursor:"pointer", transition:"all 0.2s", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" },
  catIcon:    { fontSize:"2.2rem", marginBottom:10 },
  catLabel:   { fontSize:"0.82rem", fontWeight:500, color:"#2d1b3d" },
  vendorGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:24 },
  vCard:      { background:"#fff", borderRadius:12, overflow:"hidden", cursor:"pointer", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", transition:"transform 0.2s,box-shadow 0.2s" },
  vImg:       { height:180, backgroundSize:"cover", backgroundPosition:"center", position:"relative" },
  featuredBadge:{ position:"absolute", top:10, left:10, background:"#c9a84c", color:"#1a0a2e", fontSize:"0.7rem", padding:"3px 10px", borderRadius:20, fontWeight:700 },
  catBadge:   { position:"absolute", bottom:10, right:10, background:"rgba(26,10,46,0.85)", color:"#fff", fontSize:"0.7rem", padding:"3px 10px", borderRadius:20, textTransform:"capitalize" },
  vBody:      { padding:16 },
  vName:      { fontFamily:"'Cormorant Garamond',serif", fontSize:"1.2rem", fontWeight:600, marginBottom:4 },
  viewAllBtn: { padding:"12px 32px", background:"transparent", border:"2px solid #c9a84c", color:"#c9a84c", borderRadius:8, fontSize:"0.9rem", fontWeight:600, cursor:"pointer" },
  featureCard:{ background:"#fff", borderRadius:12, padding:28, textAlign:"center", boxShadow:"0 2px 12px rgba(0,0,0,0.05)" },
  vendorCTA:  { background:"linear-gradient(135deg,#1a0a2e,#2d0f4e)", padding:"80px 5%", textAlign:"center" },
  ctaBtn:     { padding:"14px 36px", background:"#c9a84c", color:"#1a0a2e", border:"none", borderRadius:8, fontSize:"1rem", fontWeight:700, cursor:"pointer" },
  footer:     { background:"#0d0617", padding:"40px 5%", textAlign:"center" },
};
