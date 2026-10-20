"use client";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }), cache: "no-store",
      });
      if (!response.ok) throw new Error(response.status === 401 ? "Incorrect password" : "Unable to sign in. Please try again.");
      window.location.replace("/");
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to sign in"); }
    finally { setLoading(false); }
  }
  return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#f7f5f2",fontFamily:"Arial, sans-serif",padding:20}}>
    <section style={{background:"white",padding:36,borderRadius:12,width:"100%",maxWidth:420,boxShadow:"0 10px 32px #00000012"}}>
      <div style={{height:5,background:"#c1272d",marginBottom:25}} />
      <strong style={{fontSize:14,letterSpacing:1}}>LONDON SPORT</strong>
      <h1 style={{fontSize:26,marginBottom:6}}>London Early Warning System</h1>
      <p style={{color:"#555",lineHeight:1.5}}>Enter the shared access password to continue.</p>
      <form onSubmit={login}>
        <label htmlFor="password" style={{display:"block",marginBottom:8,fontWeight:600}}>Access password</label>
        <input id="password" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required style={{width:"100%",boxSizing:"border-box",padding:12,border:"1px solid #aaa",borderRadius:6,fontSize:16}} />
        {error && <p role="alert" style={{color:"#ad2020"}}>{error}</p>}
        <button disabled={loading} type="submit" style={{width:"100%",marginTop:18,padding:13,background:"#202020",color:"white",border:0,borderRadius:6,cursor:"pointer",fontWeight:600}}>{loading ? "Signing in…" : "Access system"}</button>
      </form>
    </section>
  </main>;
}
