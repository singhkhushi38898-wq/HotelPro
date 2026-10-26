import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, Check, ChevronDown, Hotel, LogOut, Menu, ShieldCheck, Sparkles, UserRound, X } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const fallbackRooms = [
  { _id: "demo-1", name: "Deluxe King Room", type: "Deluxe", description: "A calm, sunlit room with a king bed and elegant details.", pricePerNight: 4200, capacity: 2, amenities: ["Wi-Fi", "Breakfast", "Air conditioning"], imageUrl: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80" },
  { _id: "demo-2", name: "Premium Twin Room", type: "Premium", description: "Thoughtful comforts and room to unwind after a busy day.", pricePerNight: 3500, capacity: 2, amenities: ["Wi-Fi", "Workspace", "Air conditioning"], imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80" },
  { _id: "demo-3", name: "Executive Suite", type: "Suite", description: "A spacious suite made for a little extra indulgence.", pricePerNight: 7800, capacity: 3, amenities: ["Wi-Fi", "Breakfast", "Living area"], imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80" }
];
const money = n => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

export default function App() {
  const [rooms, setRooms] = useState(fallbackRooms);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("hotelpro_user") || "null"));
  const [token, setToken] = useState(() => localStorage.getItem("hotelpro_token") || "");
  const [bookings, setBookings] = useState([]);
  const [modal, setModal] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ checkIn: "", checkOut: "", guests: "2" });
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [authMode, setAuthMode] = useState("login");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");

  async function api(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "Something went wrong.");
    return data;
  }
  async function loadRooms() {
    try { const data = await api("/rooms"); if (data.length) setRooms(data); }
    catch { /* Demo cards stay visible while backend is offline. */ }
  }
  async function loadBookings() {
    if (!token) return;
    try { setBookings(await api("/bookings/my")); } catch { /* Handled on actions. */ }
  }
  useEffect(() => { loadRooms(); }, []);
  useEffect(() => { loadBookings(); }, [token]);
  const nights = useMemo(() => filters.checkIn && filters.checkOut ? Math.max(1, Math.ceil((new Date(filters.checkOut) - new Date(filters.checkIn)) / 86400000)) : 1, [filters.checkIn, filters.checkOut]);

  function saveSession(data) {
    localStorage.setItem("hotelpro_token", data.token);
    localStorage.setItem("hotelpro_user", JSON.stringify(data.user));
    setToken(data.token); setUser(data.user); setModal(""); setNotice(`Welcome, ${data.user.name}!`);
  }
  async function submitAuth(event) {
    event.preventDefault(); setLoading(true); setNotice("");
    try { saveSession(await api(`/auth/${authMode === "login" ? "login" : "register"}`, { method: "POST", body: JSON.stringify(authForm) })); }
    catch (err) { setNotice(err.message); }
    finally { setLoading(false); }
  }
  function logout() {
    localStorage.removeItem("hotelpro_token"); localStorage.removeItem("hotelpro_user");
    setToken(""); setUser(null); setBookings([]); setNotice("You have signed out.");
  }
  async function bookRoom(room) {
    if (!token) { setSelectedRoom(room); setAuthMode("login"); setModal("auth"); setNotice("Please sign in to book a room."); return; }
    if (room._id.startsWith("demo-")) { setNotice("Connect the backend and add demo rooms before making a booking."); return; }
    if (!filters.checkIn || !filters.checkOut || new Date(filters.checkOut) <= new Date(filters.checkIn)) { setNotice("Choose valid check-in and check-out dates first."); return; }
    setSelectedRoom(room);
    setPaymentMethod("upi");
    setModal("payment");
  }
  async function confirmBooking() {
    if (!selectedRoom) return;
    setLoading(true);
    try {
      await api("/bookings", { method: "POST", body: JSON.stringify({ roomId: selectedRoom._id, checkIn: filters.checkIn, checkOut: filters.checkOut, guests: Number(filters.guests), paymentMethod }) });
      setNotice("Booking confirmed. Payment method: " + ({ upi: "UPI (demo)", card: "Card (demo)", hotel: "Pay at hotel" }[paymentMethod]) + ". No online payment was charged in this demo.");
      setModal(""); await loadBookings();
    } catch (err) { setNotice(err.message); }
    finally { setLoading(false); }
  }
  async function cancelBooking(id) {
    try { await api(`/bookings/${id}/cancel`, { method: "PATCH" }); setNotice("Booking cancelled."); await loadBookings(); }
    catch (err) { setNotice(err.message); }
  }
  return <div className="app-shell">
    <div className="announcement"><Sparkles size={14}/> A more considered stay starts here <span>·</span> Thoughtful hospitality, made simple</div>
    <header className="navbar wrap">
      <a className="brand" href="#home"><span className="brand-mark"><Hotel size={21}/></span><span>hotel<span className="brand-light">pro</span><small>STAY BEAUTIFULLY</small></span></a>
      <button className="mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu">{mobileMenu ? <X/> : <Menu/>}</button>
      <nav className={mobileMenu ? "nav-links open" : "nav-links"}>
        <a href="#rooms" onClick={() => setMobileMenu(false)}>Our rooms</a><a href="#experience" onClick={() => setMobileMenu(false)}>The experience</a>
        {user && <button className="nav-link-button" onClick={() => { setModal("bookings"); setMobileMenu(false); }}>My bookings</button>}
        {user?.role === "admin" && <span className="admin-pill">Admin</span>}
        {user ? <button className="button button-outline nav-cta" onClick={logout}><LogOut size={16}/> Sign out</button> : <button className="button button-dark nav-cta" onClick={() => { setAuthMode("login"); setModal("auth"); }}><UserRound size={16}/> Sign in</button>}
      </nav>
    </header>
    <main>
      <section className="hero wrap" id="home">
        <div className="hero-copy"><div className="eyebrow"><span className="eyebrow-line"/> THE ART OF A BETTER STAY</div><h1>Arrive as you are.<br/><em>Leave inspired.</em></h1><p className="hero-description">A thoughtful stay, where warm hospitality and little luxuries come together. Your next favourite place is closer than you think.</p><div className="hero-actions"><a className="button button-dark" href="#rooms">Explore our rooms <ArrowRight size={17}/></a><a className="text-link" href="#experience">Discover HotelPro <ArrowRight size={15}/></a></div><div className="hero-trust"><div className="avatar-stack"><span>H</span><span>P</span><span>+</span></div><div><strong>A stay worth remembering</strong><small>Comfort, care, and a personal touch.</small></div></div></div>
        <div className="hero-visual"><img className="hero-image" src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1400&q=85" alt="Elegant, sunlit hotel bedroom"/><div className="image-caption"><span className="caption-icon"><Sparkles size={18}/></span><div><strong>Your quiet kind of luxury</strong><small>Every detail, considered.</small></div><span className="caption-arrow"><ArrowRight size={18}/></span></div><div className="floating-note"><span className="note-star">✳</span><span><strong>Made for slowing down</strong><small>Stay a little longer.</small></span></div></div><div className="hero-side-label">HOSPITALITY, REIMAGINED · EST. WITH CARE</div>
      </section>
      <section className="booking-strip wrap" aria-label="Search booking dates">
        <div className="booking-field"><CalendarDays/><label>CHECK IN<input type="date" min={new Date().toISOString().slice(0,10)} value={filters.checkIn} onChange={e => setFilters({...filters,checkIn:e.target.value})}/></label></div><div className="booking-divider"/>
        <div className="booking-field"><CalendarDays/><label>CHECK OUT<input type="date" min={filters.checkIn || new Date().toISOString().slice(0,10)} value={filters.checkOut} onChange={e => setFilters({...filters,checkOut:e.target.value})}/></label></div><div className="booking-divider"/>
        <div className="booking-field"><UserRound/><label>GUESTS<select value={filters.guests} onChange={e => setFilters({...filters,guests:e.target.value})}><option value="1">1 guest</option><option value="2">2 guests</option><option value="3">3 guests</option><option value="4">4 guests</option></select></label><ChevronDown className="select-chevron"/></div><a className="button button-green search-button" href="#rooms">Find your stay <ArrowRight size={17}/></a>
      </section>
      {notice && <div className="notice wrap" role="status"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss notice"><X size={16}/></button></div>}
      <section className="rooms-section wrap" id="rooms"><div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line"/> YOUR SPACE TO UNWIND</div><h2>Rooms with <em>room to breathe.</em></h2></div><p>From slow mornings to restful nights, find a space that feels just right.</p></div>
        <div className="rooms-grid">{rooms.map((room,index) => <article className="room-card" key={room._id}><div className="room-photo"><img src={room.imageUrl || fallbackRooms[index % fallbackRooms.length].imageUrl} alt={room.name}/><span className="room-tag">{room.type}</span><button className="room-save" aria-label={`View ${room.name}`} onClick={() => {setSelectedRoom(room);setModal("room");}}>↗</button></div><div className="room-info"><div className="room-title-line"><h3>{room.name}</h3><span className="room-capacity"><UserRound size={14}/> {room.capacity}</span></div><p>{room.description}</p><div className="amenities">{(room.amenities||[]).slice(0,3).map(a=><span key={a}>{a}</span>)}</div><div className="room-footer"><div><strong>{money(room.pricePerNight)}</strong><small> / night</small></div><button className="text-link" onClick={() => bookRoom(room)}>Book room <ArrowRight size={15}/></button></div></div></article>)}</div>
        <div className="rooms-footnote"><span><ShieldCheck size={16}/> Secure reservations</span><span><Check size={16}/> Thoughtfully selected rooms</span><span><Sparkles size={16}/> Comfort in every detail</span></div>
      </section>
      <section className="experience-section" id="experience"><div className="wrap experience-inner"><div className="experience-image"><img src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80" alt="Peaceful hotel interior"/></div><div className="experience-copy"><div className="eyebrow"><span className="eyebrow-line"/> THE HOTELPRO DIFFERENCE</div><h2>It's not just where you stay.<br/><em>It's how you feel.</em></h2><p>We believe the best stays are made of the small things: a welcoming arrival, a room that feels right, and the freedom to simply be.</p><div className="experience-points"><div><span>01</span><div><strong>Easy by design</strong><small>Clear booking and a smoother journey from start to finish.</small></div></div><div><span>02</span><div><strong>Care in every detail</strong><small>Thoughtful spaces designed around your comfort.</small></div></div><div><span>03</span><div><strong>Your stay, your way</strong><small>A personal experience with the essentials taken care of.</small></div></div></div><a className="button button-dark" href="#rooms">Find your room <ArrowRight size={17}/></a></div></div></section>
    </main>
    <footer className="footer"><div className="wrap footer-inner"><a className="brand footer-brand" href="#home"><span className="brand-mark"><Hotel size={21}/></span><span>hotel<span className="brand-light">pro</span><small>STAY BEAUTIFULLY</small></span></a><p>Thoughtful stays. Memorable moments.</p><span>© {new Date().getFullYear()} HotelPro</span></div></footer>
    {modal && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal("");}}><section className="modal-card" role="dialog" aria-modal="true" aria-label="HotelPro dialog"><button className="modal-close" onClick={()=>setModal("")} aria-label="Close"><X/></button>
      {modal==="auth" && <><div className="modal-symbol"><Hotel/></div><div className="eyebrow centered">WELCOME TO HOTELPRO</div><h2>{authMode==="login"?"Good to have you back.":"Make yourself at home."}</h2><p className="modal-subtitle">{authMode==="login"?"Sign in to manage your stay.":"Create an account to start booking."}</p><form className="auth-form" onSubmit={submitAuth}>{authMode==="register"&&<label>Full name<input required minLength="2" value={authForm.name} onChange={e=>setAuthForm({...authForm,name:e.target.value})} placeholder="Your name"/></label>}<label>Email address<input type="email" required value={authForm.email} onChange={e=>setAuthForm({...authForm,email:e.target.value})} placeholder="you@example.com"/></label><label>Password<input type="password" required minLength="8" value={authForm.password} onChange={e=>setAuthForm({...authForm,password:e.target.value})} placeholder="At least 8 characters"/></label><button className="button button-green full-button" disabled={loading}>{loading?"Please wait…":authMode==="login"?"Sign in":"Create account"} <ArrowRight size={17}/></button></form><p className="auth-switch">{authMode==="login"?"New to HotelPro?":"Already have an account?"} <button onClick={()=>setAuthMode(authMode==="login"?"register":"login")}>{authMode==="login"?"Create an account":"Sign in"}</button></p><p className="secure-note"><ShieldCheck size={14}/> Your account is protected.</p></>}
      {modal==="room"&&selectedRoom&&<><img className="modal-room-image" src={selectedRoom.imageUrl||fallbackRooms[0].imageUrl} alt={selectedRoom.name}/><div className="eyebrow"><span className="eyebrow-line"/> {selectedRoom.type}</div><h2>{selectedRoom.name}</h2><p>{selectedRoom.description}</p><p><strong>{money(selectedRoom.pricePerNight)}</strong> / night · Up to {selectedRoom.capacity} guests</p><div className="amenities modal-amenities">{(selectedRoom.amenities||[]).map(a=><span key={a}>{a}</span>)}</div><button className="button button-green full-button" onClick={()=>{setModal("");bookRoom(selectedRoom);}}>Book this room <ArrowRight size={17}/></button></>}
      {modal==="payment"&&selectedRoom&&<><div className="modal-symbol"><ShieldCheck/></div><div className="eyebrow centered">SECURE CHECKOUT</div><h2>Choose payment</h2><p className="modal-subtitle">{selectedRoom.name} · {filters.checkIn} to {filters.checkOut}</p><div className="checkout-total"><span>Total for {nights} night(s)</span><strong>{money(nights * selectedRoom.pricePerNight)}</strong></div><div className="payment-options"><label className={paymentMethod==="upi"?"payment-option selected":"payment-option"}><input type="radio" name="paymentMethod" value="upi" checked={paymentMethod==="upi"} onChange={()=>setPaymentMethod("upi")}/><span><strong>UPI</strong><small>Google Pay, PhonePe, Paytm (demo)</small></span></label><label className={paymentMethod==="card"?"payment-option selected":"payment-option"}><input type="radio" name="paymentMethod" value="card" checked={paymentMethod==="card"} onChange={()=>setPaymentMethod("card")}/><span><strong>Credit / Debit Card</strong><small>Visa, Mastercard, RuPay (demo)</small></span></label><label className={paymentMethod==="hotel"?"payment-option selected":"payment-option"}><input type="radio" name="paymentMethod" value="hotel" checked={paymentMethod==="hotel"} onChange={()=>setPaymentMethod("hotel")}/><span><strong>Pay at hotel</strong><small>Pay when you arrive</small></span></label></div><p className="payment-disclaimer">Demo project checkout: UPI and card are sample options only. No real payment is processed or charged.</p><button className="button button-green full-button" onClick={confirmBooking} disabled={loading}>{loading?"Processing…":"Confirm booking"} <ArrowRight size={17}/></button></>}
      {modal==="bookings"&&<><div className="modal-symbol"><CalendarDays/></div><div className="eyebrow centered">YOUR TRAVEL, IN ONE PLACE</div><h2>My bookings</h2><p className="modal-subtitle">Your upcoming plans and past stays.</p>{bookings.length===0?<div className="empty-state">No bookings yet. Your next stay is waiting for you.</div>:<div className="booking-list">{bookings.map(b=><article className="booking-item" key={b._id}><div><strong>{b.room?.name||"Hotel room"}</strong><small>{new Date(b.checkIn).toLocaleDateString()} – {new Date(b.checkOut).toLocaleDateString()}</small><small>{b.guests} guest(s) · {money(b.totalPrice)}</small>{b.paymentMethod&&<small>Payment: {({upi:"UPI (demo)",card:"Card (demo)",hotel:"Pay at hotel"}[b.paymentMethod]||b.paymentMethod)}</small>}</div><div className="booking-status"><span className={b.status==="cancelled"?"status-cancelled":"status-confirmed"}>{b.status}</span>{b.status==="confirmed"&&<button onClick={()=>cancelBooking(b._id)}>Cancel</button>}</div></article>)}</div>}</>}
    </section></div>}
  </div>;
}
