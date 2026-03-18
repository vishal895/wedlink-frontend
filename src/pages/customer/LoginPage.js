import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email:"", password:"" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === "admin")  navigate("/admin");
      else if (user.role === "vendor") navigate("/vendor/dashboard");
      else navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <Link to="/" style={s.logo}>💍 WeddingWala</Link>
        <h2 style={s.title}>Welcome Back</h2>
        <p style={s.sub}>Login to continue planning your dream wedding</p>

        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <label style={s.label}>Email Address</label>
            <input style={s.input} type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} required />
          </div>
          <div>
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(p=>({...p,password:e.target.value}))} required />
          </div>
          <button type="submit" style={s.btn} disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
        </form>

        <p style={s.footer}>Don't have an account? <Link to="/register" style={s.link}>Sign Up</Link></p>
        <p style={s.footer}>Vendor? <Link to="/register?role=vendor" style={s.link}>Register your business →</Link></p>
      </div>
    </div>
  );
}

const s = {
  page:  { minHeight:"100vh", background:"linear-gradient(135deg,#1a0a2e,#2d0f4e)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 },
  card:  { background:"#fff", borderRadius:16, padding:"48px 40px", width:"100%", maxWidth:440, boxShadow:"0 20px 60px rgba(0,0,0,0.3)" },
  logo:  { display:"block", textAlign:"center", fontFamily:"'Cormorant Garamond',serif", fontSize:"1.6rem", color:"#c9a84c", textDecoration:"none", marginBottom:24 },
  title: { fontFamily:"'Cormorant Garamond',serif", fontSize:"2rem", textAlign:"center", marginBottom:6 },
  sub:   { color:"#7a6b8a", textAlign:"center", fontSize:"0.88rem", marginBottom:28 },
  label: { display:"block", fontSize:"0.8rem", fontWeight:600, color:"#2d1b3d", marginBottom:6, letterSpacing:"0.05em" },
  input: { width:"100%", padding:"11px 14px", border:"1.5px solid #ede8f5", borderRadius:8, fontSize:"0.9rem", outline:"none", transition:"border 0.2s" },
  btn:   { padding:"13px", background:"#c9a84c", color:"#1a0a2e", border:"none", borderRadius:8, fontWeight:700, fontSize:"1rem", cursor:"pointer", marginTop:8 },
  footer:{ textAlign:"center", fontSize:"0.85rem", color:"#7a6b8a", marginTop:16 },
  link:  { color:"#c9a84c", fontWeight:600 },
};
