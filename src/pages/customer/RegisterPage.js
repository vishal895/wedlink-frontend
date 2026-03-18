import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const defaultRole = params.get("role") || "user";

  const [form, setForm] = useState({ name:"", email:"", phone:"", password:"", role: defaultRole });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      if (user.role === "vendor") navigate("/vendor/dashboard");
      else navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <Link to="/" style={s.logo}>💍 WeddingWala</Link>
        <h2 style={s.title}>Create Account</h2>
        <p style={s.sub}>{form.role === "vendor" ? "Register your wedding business" : "Start planning your dream wedding"}</p>

        {/* Role Toggle */}
        <div style={s.roleToggle}>
          <button style={{ ...s.roleBtn, background: form.role==="user" ? "#c9a84c":"transparent", color: form.role==="user" ? "#1a0a2e":"#7a6b8a" }} onClick={() => setForm(p=>({...p,role:"user"}))}>
            👤 I'm a Customer
          </button>
          <button style={{ ...s.roleBtn, background: form.role==="vendor" ? "#c9a84c":"transparent", color: form.role==="vendor" ? "#1a0a2e":"#7a6b8a" }} onClick={() => setForm(p=>({...p,role:"vendor"}))}>
            🏪 I'm a Vendor
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {[
            { key:"name",     type:"text",     ph:"Full Name",      label:"Full Name" },
            { key:"email",    type:"email",    ph:"Email Address",  label:"Email" },
            { key:"phone",    type:"tel",      ph:"+91 9876543210", label:"Phone Number" },
            { key:"password", type:"password", ph:"Min 6 characters",label:"Password" },
          ].map(f => (
            <div key={f.key}>
              <label style={s.label}>{f.label}</label>
              <input style={s.input} type={f.type} placeholder={f.ph} value={form[f.key]} onChange={e => setForm(p=>({...p,[f.key]:e.target.value}))} required />
            </div>
          ))}
          <button type="submit" style={s.btn} disabled={loading}>{loading ? "Creating..." : "Create Account"}</button>
        </form>

        <p style={s.footer}>Already have an account? <Link to="/login" style={s.link}>Login</Link></p>
      </div>
    </div>
  );
}

const s = {
  page:      { minHeight:"100vh", background:"linear-gradient(135deg,#1a0a2e,#2d0f4e)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 },
  card:      { background:"#fff", borderRadius:16, padding:"44px 40px", width:"100%", maxWidth:460, boxShadow:"0 20px 60px rgba(0,0,0,0.3)" },
  logo:      { display:"block", textAlign:"center", fontFamily:"'Cormorant Garamond',serif", fontSize:"1.6rem", color:"#c9a84c", textDecoration:"none", marginBottom:20 },
  title:     { fontFamily:"'Cormorant Garamond',serif", fontSize:"2rem", textAlign:"center", marginBottom:6 },
  sub:       { color:"#7a6b8a", textAlign:"center", fontSize:"0.88rem", marginBottom:20 },
  roleToggle:{ display:"flex", background:"#f5f0fa", borderRadius:10, padding:4, marginBottom:20, gap:4 },
  roleBtn:   { flex:1, padding:"9px 8px", border:"none", borderRadius:7, fontSize:"0.83rem", fontWeight:600, cursor:"pointer", transition:"all 0.2s" },
  label:     { display:"block", fontSize:"0.8rem", fontWeight:600, color:"#2d1b3d", marginBottom:5 },
  input:     { width:"100%", padding:"10px 14px", border:"1.5px solid #ede8f5", borderRadius:8, fontSize:"0.9rem", outline:"none" },
  btn:       { padding:"13px", background:"#c9a84c", color:"#1a0a2e", border:"none", borderRadius:8, fontWeight:700, fontSize:"1rem", cursor:"pointer", marginTop:6 },
  footer:    { textAlign:"center", fontSize:"0.85rem", color:"#7a6b8a", marginTop:14 },
  link:      { color:"#c9a84c", fontWeight:600 },
};
