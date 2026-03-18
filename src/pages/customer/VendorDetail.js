import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { API } from "../../context/AuthContext";
import { useAuth } from "../../context/AuthContext";

export default function VendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vendor, setVendor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    API.get(`/vendors/${id}`).then(r => { setVendor(r.data.vendor); setReviews(r.data.reviews); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ paddingTop:100, textAlign:"center", fontSize:"1.2rem" }}>Loading...</div>;
  if (!vendor) return <div style={{ paddingTop:100, textAlign:"center" }}>Vendor not found</div>;

  const allImgs = [vendor.coverImage, ...vendor.images].filter(Boolean);

  return (
    <div style={{ paddingTop:64 }}>
      <Navbar />
      <div style={s.page}>
        {/* Image Gallery */}
        <div style={s.gallery}>
          <div style={{ ...s.mainImg, backgroundImage:`url(${allImgs[activeImg] || "https://via.placeholder.com/800x400"})` }} />
          <div style={s.thumbRow}>
            {allImgs.map((img,i) => (
              <div key={i} style={{ ...s.thumb, backgroundImage:`url(${img})`, border: i===activeImg ? "2px solid #c9a84c":"2px solid transparent" }} onClick={() => setActiveImg(i)} />
            ))}
          </div>
        </div>

        <div style={s.content}>
          {/* Header */}
          <div style={s.header}>
            <div style={{ flex:1 }}>
              <div style={s.catBadge}>{vendor.category?.replace(/_/g," ")}</div>
              <h1 style={s.title}>{vendor.businessName}</h1>
              <p style={{ color:"#7a6b8a", marginBottom:8 }}>📍 {vendor.location?.address}, {vendor.location?.city}, {vendor.location?.state} - {vendor.location?.pincode}</p>
              <div style={{ display:"flex", gap:16, alignItems:"center" }}>
                <span style={{ color:"#f59e0b", fontSize:"1.1rem" }}>★ {vendor.ratings?.average || "New"}</span>
                <span style={{ color:"#7a6b8a", fontSize:"0.85rem" }}>({vendor.ratings?.count || 0} reviews)</span>
                <span style={{ color:"#7a6b8a", fontSize:"0.85rem" }}>• {vendor.totalBookings || 0} bookings</span>
              </div>
            </div>
            <div style={s.priceBox}>
              <p style={{ color:"#7a6b8a", fontSize:"0.8rem", marginBottom:4 }}>Starting from</p>
              <p style={s.price}>₹{vendor.pricing?.startingPrice?.toLocaleString()}</p>
              <p style={{ color:"#7a6b8a", fontSize:"0.75rem", marginBottom:16 }}>per {vendor.pricing?.priceUnit?.replace(/_/g," ")}</p>
              <button style={s.bookBtn} onClick={() => user ? navigate(`/book/${vendor._id}`) : navigate("/login")}>
                {user ? "Book Now" : "Login to Book"}
              </button>
              <button style={s.enquireBtn}>Send Enquiry</button>
            </div>
          </div>

          {/* About */}
          <div style={s.section}>
            <h2 style={s.secTitle}>About</h2>
            <p style={{ color:"#555", lineHeight:1.8 }}>{vendor.description}</p>
          </div>

          {/* Amenities */}
          {vendor.amenities?.length > 0 && (
            <div style={s.section}>
              <h2 style={s.secTitle}>Amenities</h2>
              <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
                {vendor.amenities.map(a => <span key={a} style={s.amenityTag}>✓ {a}</span>)}
              </div>
            </div>
          )}

          {/* Capacity */}
          {(vendor.capacity?.min || vendor.capacity?.max) && (
            <div style={s.section}>
              <h2 style={s.secTitle}>Capacity</h2>
              <p style={{ color:"#555" }}>{vendor.capacity.min} – {vendor.capacity.max} guests</p>
            </div>
          )}

          {/* Contact */}
          <div style={s.section}>
            <h2 style={s.secTitle}>Contact</h2>
            <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
              {vendor.contact?.phone   && <a href={`tel:${vendor.contact.phone}`}  style={s.contactChip}>📞 {vendor.contact.phone}</a>}
              {vendor.contact?.email   && <a href={`mailto:${vendor.contact.email}`} style={s.contactChip}>✉️ {vendor.contact.email}</a>}
              {vendor.contact?.website && <a href={vendor.contact.website} style={s.contactChip} target="_blank" rel="noreferrer">🌐 Website</a>}
            </div>
          </div>

          {/* Reviews */}
          <div style={s.section}>
            <h2 style={s.secTitle}>Reviews ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <p style={{ color:"#7a6b8a" }}>No reviews yet. Be the first to review!</p>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {reviews.map(r => (
                  <div key={r._id} style={s.reviewCard}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                      <strong style={{ fontSize:"0.95rem" }}>{r.user?.name}</strong>
                      <span style={{ color:"#f59e0b" }}>{"★".repeat(r.rating)}</span>
                    </div>
                    <p style={{ color:"#555", fontSize:"0.88rem", lineHeight:1.6 }}>{r.comment}</p>
                    {r.reply?.text && (
                      <div style={s.replyBox}>
                        <strong style={{ fontSize:"0.8rem", color:"#7e22ce" }}>Vendor Reply:</strong>
                        <p style={{ fontSize:"0.85rem", marginTop:4 }}>{r.reply.text}</p>
                      </div>
                    )}
                    <p style={{ color:"#aaa", fontSize:"0.75rem", marginTop:8 }}>{new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page:       { maxWidth:1100, margin:"0 auto", padding:"32px 4%" },
  gallery:    { marginBottom:32 },
  mainImg:    { height:420, backgroundSize:"cover", backgroundPosition:"center", borderRadius:12, marginBottom:12 },
  thumbRow:   { display:"flex", gap:8, overflowX:"auto" },
  thumb:      { width:80, height:60, backgroundSize:"cover", backgroundPosition:"center", borderRadius:6, cursor:"pointer", flexShrink:0 },
  content:    {},
  header:     { display:"flex", gap:24, alignItems:"flex-start", marginBottom:32, flexWrap:"wrap" },
  catBadge:   { background:"#f3e8ff", color:"#7e22ce", fontSize:"0.72rem", padding:"3px 12px", borderRadius:20, display:"inline-block", marginBottom:8, textTransform:"capitalize" },
  title:      { fontFamily:"'Cormorant Garamond',serif", fontSize:"2.2rem", fontWeight:600, marginBottom:8 },
  priceBox:   { background:"#fff", border:"2px solid #c9a84c", borderRadius:12, padding:24, minWidth:220, textAlign:"center", boxShadow:"0 4px 16px rgba(201,168,76,0.15)" },
  price:      { fontFamily:"'Cormorant Garamond',serif", fontSize:"2rem", color:"#c9a84c", fontWeight:700 },
  bookBtn:    { width:"100%", padding:"12px", background:"#c9a84c", color:"#1a0a2e", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer", marginBottom:10, fontSize:"0.95rem" },
  enquireBtn: { width:"100%", padding:"12px", background:"transparent", color:"#1a0a2e", border:"2px solid #1a0a2e", borderRadius:8, fontWeight:600, cursor:"pointer", fontSize:"0.9rem" },
  section:    { marginBottom:32, paddingTop:24, borderTop:"1px solid #ede8f5" },
  secTitle:   { fontFamily:"'Cormorant Garamond',serif", fontSize:"1.6rem", marginBottom:16 },
  amenityTag: { background:"#f0fdf4", color:"#16a34a", padding:"6px 14px", borderRadius:20, fontSize:"0.82rem", border:"1px solid #bbf7d0" },
  contactChip:{ background:"#f8f4ff", color:"#7e22ce", padding:"8px 16px", borderRadius:8, fontSize:"0.85rem", textDecoration:"none", border:"1px solid #e9d5ff" },
  reviewCard: { background:"#fafafa", border:"1px solid #ede8f5", borderRadius:10, padding:16 },
  replyBox:   { background:"#f3e8ff", borderRadius:8, padding:12, marginTop:10 },
};
