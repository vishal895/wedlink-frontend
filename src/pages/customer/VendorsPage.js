import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { API } from "../../context/AuthContext";

const CATEGORIES = [
  { value:"", label:"All Categories" },
  { value:"banquet_hall", label:"🏛️ Banquet Hall" },
  { value:"catering",     label:"🍽️ Catering" },
  { value:"decoration",   label:"🌸 Decoration" },
  { value:"photography",  label:"📸 Photography" },
  { value:"videography",  label:"🎬 Videography" },
  { value:"pandit",       label:"🙏 Pandit Ji" },
  { value:"event_manager",label:"📋 Event Manager" },
  { value:"mehendi",      label:"✋ Mehendi" },
  { value:"makeup",       label:"💄 Makeup" },
  { value:"music_dj",     label:"🎵 Music/DJ" },
  { value:"tent_house",   label:"⛺ Tent House" },
  { value:"horse_carriage",label:"🐴 Baraat" },
];

export default function VendorsPage() {
  const navigate = useNavigate();
  const [params]  = useSearchParams();

  const [vendors,  setVendors]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [pages,    setPages]    = useState(1);

  const [search,   setSearch]   = useState(params.get("search") || "");
  const [city,     setCity]     = useState(params.get("city")   || "");
  const [category, setCategory] = useState(params.get("category") || "");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort,     setSort]     = useState("featured");
  const [rating,   setRating]   = useState("");

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ sort, page, limit:12 });
      if (search)   q.set("search",    search);
      if (city)     q.set("city",      city);
      if (category) q.set("category",  category);
      if (minPrice) q.set("minPrice",  minPrice);
      if (maxPrice) q.set("maxPrice",  maxPrice);
      if (rating)   q.set("minRating", rating);
      const { data } = await API.get(`/vendors?${q}`);
      setVendors(data.vendors);
      setTotal(data.total);
      setPages(data.pages);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, city, category, minPrice, maxPrice, sort, rating, page]);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  return (
    <div style={{ paddingTop:64 }}>
      <Navbar />

      {/* Search Bar */}
      <div style={s.searchBar}>
        <input style={s.inp} placeholder="Search vendors..." value={search} onChange={e => setSearch(e.target.value)} />
        <input style={s.inp} placeholder="City..." value={city} onChange={e => setCity(e.target.value)} />
        <select style={s.sel} value={category} onChange={e => setCategory(e.target.value)}>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <button style={s.searchBtn} onClick={() => { setPage(1); fetchVendors(); }}>🔍 Search</button>
      </div>

      <div style={s.layout}>
        {/* SIDEBAR FILTERS */}
        <aside style={s.sidebar}>
          <h3 style={s.filterTitle}>Filters</h3>

          <div style={s.filterGroup}>
            <label style={s.filterLabel}>Price Range (₹)</label>
            <input style={s.filterInp} type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
            <input style={{ ...s.filterInp, marginTop:6 }} type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
          </div>

          <div style={s.filterGroup}>
            <label style={s.filterLabel}>Minimum Rating</label>
            {[4,3,2].map(r => (
              <label key={r} style={s.radioRow}>
                <input type="radio" name="rating" value={r} checked={rating==r} onChange={() => setRating(r)} />
                {"★".repeat(r)} & above
              </label>
            ))}
            <label style={s.radioRow}><input type="radio" name="rating" value="" checked={!rating} onChange={() => setRating("")} /> All ratings</label>
          </div>

          <div style={s.filterGroup}>
            <label style={s.filterLabel}>Sort By</label>
            {[
              { v:"featured",   l:"Featured" },
              { v:"rating",     l:"Top Rated" },
              { v:"popular",    l:"Most Popular" },
              { v:"price_low",  l:"Price: Low to High" },
              { v:"price_high", l:"Price: High to Low" },
            ].map(o => (
              <label key={o.v} style={s.radioRow}>
                <input type="radio" name="sort" value={o.v} checked={sort===o.v} onChange={() => setSort(o.v)} /> {o.l}
              </label>
            ))}
          </div>

          <button style={s.clearBtn} onClick={() => { setSearch(""); setCity(""); setCategory(""); setMinPrice(""); setMaxPrice(""); setRating(""); setSort("featured"); }}>Clear All Filters</button>
        </aside>

        {/* RESULTS */}
        <main style={s.main}>
          <div style={s.resultsHeader}>
            <span style={{ color:"#7a6b8a", fontSize:"0.9rem" }}>{loading ? "Loading..." : `${total} vendors found`}</span>
          </div>

          {loading ? (
            <div style={s.loading}>Searching vendors...</div>
          ) : vendors.length === 0 ? (
            <div style={s.empty}>
              <div style={{ fontSize:"3rem", marginBottom:16 }}>🔍</div>
              <h3>No vendors found</h3>
              <p style={{ color:"#7a6b8a" }}>Try adjusting your filters</p>
            </div>
          ) : (
            <div style={s.grid}>
              {vendors.map(v => <VendorCard key={v._id} vendor={v} onClick={() => navigate(`/vendors/${v._id}`)} />)}
            </div>
          )}

          {/* PAGINATION */}
          {pages > 1 && (
            <div style={s.pagination}>
              <button style={s.pageBtn} disabled={page===1} onClick={() => setPage(p => p-1)}>← Prev</button>
              {Array.from({length:pages},(_,i)=>i+1).map(p => (
                <button key={p} style={{ ...s.pageBtn, background: p===page ? "#c9a84c":"transparent", color: p===page ? "#1a0a2e":"#2d1b3d" }} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button style={s.pageBtn} disabled={page===pages} onClick={() => setPage(p => p+1)}>Next →</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function VendorCard({ vendor, onClick }) {
  return (
    <div style={s.vCard} onClick={onClick}>
      <div style={{ ...s.vImg, backgroundImage:`url(${vendor.coverImage || "https://via.placeholder.com/400x250"})` }}>
        {vendor.isFeatured && <span style={s.badge}>⭐ Featured</span>}
      </div>
      <div style={s.vBody}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
          <h3 style={s.vName}>{vendor.businessName}</h3>
          <span style={s.catTag}>{vendor.category?.replace(/_/g," ")}</span>
        </div>
        <p style={{ color:"#7a6b8a", fontSize:"0.8rem", marginBottom:8 }}>📍 {vendor.location?.city}, {vendor.location?.state}</p>
        <p style={{ fontSize:"0.82rem", color:"#555", marginBottom:10, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{vendor.description}</p>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ color:"#c9a84c", fontWeight:700, fontSize:"0.95rem" }}>₹{vendor.pricing?.startingPrice?.toLocaleString()}+</span>
          <span style={{ color:"#f59e0b", fontSize:"0.82rem" }}>★ {vendor.ratings?.average || "New"} ({vendor.ratings?.count || 0})</span>
        </div>
      </div>
    </div>
  );
}

const s = {
  searchBar:  { background:"#1a0a2e", padding:"20px 5%", display:"flex", gap:12, flexWrap:"wrap" },
  inp:        { flex:1, minWidth:160, padding:"10px 14px", borderRadius:8, border:"none", outline:"none", fontSize:"0.9rem" },
  sel:        { flex:1, minWidth:160, padding:"10px 14px", borderRadius:8, border:"none", outline:"none", fontSize:"0.9rem" },
  searchBtn:  { padding:"10px 24px", background:"#c9a84c", color:"#1a0a2e", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer" },
  layout:     { display:"flex", gap:0, maxWidth:1280, margin:"0 auto", padding:"24px 3%" },
  sidebar:    { width:240, flexShrink:0, paddingRight:24 },
  filterTitle:{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.3rem", marginBottom:20, paddingBottom:12, borderBottom:"2px solid #c9a84c" },
  filterGroup:{ marginBottom:24 },
  filterLabel:{ display:"block", fontSize:"0.78rem", fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:"#7a6b8a", marginBottom:10 },
  filterInp:  { width:"100%", padding:"8px 12px", border:"1px solid #ede8f5", borderRadius:6, fontSize:"0.85rem" },
  radioRow:   { display:"flex", alignItems:"center", gap:8, fontSize:"0.85rem", marginBottom:8, cursor:"pointer", color:"#2d1b3d" },
  clearBtn:   { width:"100%", padding:"10px", background:"transparent", border:"1px solid #dc2626", color:"#dc2626", borderRadius:6, fontSize:"0.82rem", cursor:"pointer", marginTop:8 },
  main:       { flex:1 },
  resultsHeader:{ marginBottom:16 },
  loading:    { textAlign:"center", padding:"60px 0", color:"#7a6b8a", fontSize:"1.1rem" },
  empty:      { textAlign:"center", padding:"80px 0" },
  grid:       { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:20 },
  vCard:      { background:"#fff", borderRadius:12, overflow:"hidden", cursor:"pointer", boxShadow:"0 2px 10px rgba(0,0,0,0.06)", transition:"transform 0.2s,box-shadow 0.2s" },
  vImg:       { height:170, backgroundSize:"cover", backgroundPosition:"center", position:"relative" },
  badge:      { position:"absolute", top:8, left:8, background:"#c9a84c", color:"#1a0a2e", fontSize:"0.7rem", padding:"2px 8px", borderRadius:20, fontWeight:700 },
  vBody:      { padding:"14px 16px" },
  vName:      { fontFamily:"'Cormorant Garamond',serif", fontSize:"1.15rem", fontWeight:600, flex:1 },
  catTag:     { background:"#f3e8ff", color:"#7e22ce", fontSize:"0.68rem", padding:"2px 8px", borderRadius:12, whiteSpace:"nowrap", textTransform:"capitalize" },
  pagination: { display:"flex", gap:8, justifyContent:"center", marginTop:40 },
  pageBtn:    { padding:"8px 14px", border:"1px solid #ede8f5", background:"transparent", borderRadius:6, cursor:"pointer", fontSize:"0.85rem" },
};
