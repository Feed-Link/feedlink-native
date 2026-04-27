// Shared Components for FeedLink PWA
// Exported to window for cross-script access

const C = {
  green: 'rgb(22,163,74)',
  greenDark: 'rgb(21,128,61)',
  amber: 'rgb(245,158,11)',
  textDark: 'rgb(28,25,23)',
  textMid: 'rgb(120,113,108)',
  textLight: 'rgb(168,163,158)',
  border: 'rgb(231,229,228)',
  bg: 'rgb(250,250,249)',
  surface: 'rgb(255,255,255)',
  surface2: 'rgb(245,244,243)',
  tagGreen: 'rgb(220,252,228)',
  tagAmber: 'rgb(254,243,196)',
  blue: 'rgb(61,133,220)',
  red: 'rgb(220,38,38)',
};
window.C = C;

// Toast system
function Toast({ toasts }) {
  return React.createElement('div', {
    style: { position:'fixed', top:60, left:'50%', transform:'translateX(-50%)', zIndex:9999, display:'flex', flexDirection:'column', gap:8, alignItems:'center', pointerEvents:'none', width:'90%', maxWidth:360 }
  }, toasts.map(t =>
    React.createElement('div', { key:t.id, style:{
      background: t.type==='error' ? 'rgba(220,38,38,0.95)' : t.type==='success' ? 'rgba(22,163,74,0.95)' : 'rgba(28,25,23,0.92)',
      color:'#fff', padding:'12px 20px', borderRadius:16, fontSize:13, fontWeight:600,
      boxShadow:'0 8px 32px rgba(0,0,0,0.2)', backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
      textAlign:'center', maxWidth:'100%', pointerEvents:'auto', letterSpacing:0.1
    }}, t.msg)
  ));
}

function useToast() {
  const [toasts, setToasts] = React.useState([]);
  const show = React.useCallback((msg, type='info', duration=3000) => {
    const id = Date.now();
    setToasts(p => [...p, {id, msg, type}]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), duration);
  }, []);
  return [toasts, show];
}
window.Toast = Toast;
window.useToast = useToast;

// AppContext
const AppContext = React.createContext({});
window.AppContext = AppContext;

// BottomNav Donor
function DonorNav({ active, navigate }) {
  const tabs = [
    { key:'donor-home', label:'Home', icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M3 12L12 3l9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { key:'donor-listings', label:'Listings', icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/></svg> },
    { key:'donor-map', label:'Map', icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2"/></svg> },
    { key:'donor-notifications', label:'Alerts', icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
    { key:'donor-profile', label:'Profile', icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
  ];
  return <BottomNavBar tabs={tabs} active={active} navigate={navigate} accentColor={C.amber} />;
}

// BottomNav Recipient
function RecipientNav({ active, navigate }) {
  const tabs = [
    { key:'recipient-home', label:'Home', icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M3 12L12 3l9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { key:'recipient-claims', label:'Claims', icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2"/></svg> },
    { key:'recipient-map', label:'Map', icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2"/></svg> },
    { key:'recipient-notifications', label:'Alerts', icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
    { key:'recipient-profile', label:'Profile', icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
  ];
  return <BottomNavBar tabs={tabs} active={active} navigate={navigate} accentColor={C.green} />;
}

function BottomNavBar({ tabs, active, navigate, accentColor }) {
  return (
    <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'rgba(255,255,255,0.85)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', borderTop:`1px solid rgba(0,0,0,0.06)`, display:'flex', zIndex:100, paddingBottom:'env(safe-area-inset-bottom)', boxSizing:'border-box' }}>
      {tabs.map(t => {
        const isActive = active === t.key;
        return (
          <button key={t.key} onClick={() => navigate(t.key)}
            style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3, border:'none', background:'none', cursor:'pointer', color: isActive ? accentColor : C.textLight, padding:'10px 0 12px', minHeight:64, transition:'color 0.15s' }}>
            <span style={{ color: isActive ? accentColor : C.textLight, transition:'color 0.15s' }}>{t.icon}</span>
            <span style={{ fontSize:10, fontWeight:700, letterSpacing:0.2 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Back button header
function ScreenHeader({ title, onBack, rightEl }) {
  return (
    <div style={{ position:'sticky', top:0, zIndex:50, background:'rgba(250,250,249,0.88)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', padding:'calc(env(safe-area-inset-top) + 12px) 16px 12px', display:'flex', alignItems:'center', gap:12 }}>
      {onBack && (
        <button onClick={onBack} style={{ width:38, height:38, borderRadius:'50%', background:C.surface2, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" stroke={C.textDark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      )}
      <span style={{ flex:1, fontWeight:700, fontSize:18, color:C.textDark }}>{title}</span>
      {rightEl}
    </div>
  );
}
window.ScreenHeader = ScreenHeader;

// Input field
function Input({ label, value, onChange, placeholder, type='text', required }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{ marginBottom:16 }}>
      {label && <label style={{ display:'block', fontWeight:600, fontSize:12, color:C.textMid, marginBottom:6, letterSpacing:0.3, textTransform:'uppercase' }}>{label}{required && <span style={{color:C.red}}> *</span>}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width:'100%', height:48, borderRadius:14, border:`2px solid ${focused ? C.green : 'transparent'}`, background:C.surface2, padding:'0 14px', fontSize:14, color:C.textDark, boxSizing:'border-box', outline:'none', fontFamily:'Inter,sans-serif', transition:'border-color 0.15s, box-shadow 0.15s', boxShadow: focused ? `0 0 0 4px rgba(22,163,74,0.1)` : 'none' }} />
    </div>
  );
}
window.Input = Input;

// Textarea
function TextArea({ label, value, onChange, placeholder, rows=3 }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{ marginBottom:16 }}>
      {label && <label style={{ display:'block', fontWeight:600, fontSize:12, color:C.textMid, marginBottom:6, letterSpacing:0.3, textTransform:'uppercase' }}>{label}</label>}
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width:'100%', borderRadius:14, border:`2px solid ${focused ? C.green : 'transparent'}`, background:C.surface2, padding:'12px 14px', fontSize:14, color:C.textDark, boxSizing:'border-box', outline:'none', fontFamily:'Inter,sans-serif', resize:'vertical', transition:'border-color 0.15s, box-shadow 0.15s', boxShadow: focused ? `0 0 0 4px rgba(22,163,74,0.1)` : 'none' }} />
    </div>
  );
}
window.TextArea = TextArea;

// Pill button
function Btn({ children, onClick, variant='primary', fullWidth, size='md', disabled, style: extraStyle }) {
  const gradMap = {
    primary: `linear-gradient(135deg, rgb(34,197,94), rgb(21,128,61))`,
    amber: `linear-gradient(135deg, rgb(251,191,36), rgb(217,119,6))`,
  };
  const bgMap = { primary: gradMap.primary, amber: gradMap.amber, outline: C.surface, danger: C.surface, ghost: 'transparent' };
  const colorMap = { primary: '#fff', amber: '#fff', outline: C.textDark, danger: C.red, ghost: C.textMid };
  const borderMap = { outline: `1.5px solid ${C.border}`, danger: `1.5px solid rgb(250,202,202)` };
  const shadowMap = { primary: '0 2px 8px rgba(22,163,74,0.25)', amber: '0 2px 8px rgba(245,158,11,0.25)' };
  const sz = { sm: { h:34, px:16, fs:12 }, md: { h:48, px:22, fs:15 }, lg: { h:54, px:24, fs:16 } };
  const s = sz[size] || sz.md;
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ height:s.h, padding:`0 ${s.px}px`, borderRadius:99, background: disabled ? C.surface2 : (bgMap[variant] || bgMap.primary), color: disabled ? C.textLight : colorMap[variant], border: borderMap[variant]||'none', cursor: disabled ? 'not-allowed':'pointer', fontWeight:700, fontSize:s.fs, fontFamily:'Inter,sans-serif', width: fullWidth ? '100%':'auto', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6, boxShadow: disabled ? 'none' : (shadowMap[variant]||'none'), transition:'opacity 0.15s, transform 0.1s', letterSpacing: variant==='primary'||variant==='amber' ? 0.1 : 0, ...extraStyle }}>
      {children}
    </button>
  );
}
window.Btn = Btn;

// Status badge
function StatusBadge({ status }) {
  const map = {
    active: { bg:'rgba(245,158,11,0.12)', color:C.amber, label:'Active' },
    claimed: { bg:'rgba(61,133,220,0.12)', color:C.blue, label:'Claimed' },
    completed: { bg:'rgba(22,163,74,0.12)', color:C.green, label:'Completed' },
    expired: { bg:'rgba(168,163,158,0.15)', color:C.textLight, label:'Expired' },
    cancelled: { bg:'rgba(220,38,38,0.1)', color:C.red, label:'Cancelled' },
    pending: { bg:'rgba(245,158,11,0.12)', color:C.amber, label:'Pending' },
    confirmed: { bg:'rgba(22,163,74,0.12)', color:C.green, label:'Confirmed' },
    rejected: { bg:'rgba(220,38,38,0.1)', color:C.red, label:'Rejected' },
    open: { bg:'rgba(22,163,74,0.12)', color:C.green, label:'Open' },
    accepted: { bg:'rgba(61,133,220,0.12)', color:C.blue, label:'Accepted' },
    fulfilled: { bg:'rgba(22,163,74,0.12)', color:C.green, label:'Fulfilled' },
  };
  const s = map[status] || map.active;
  return <span style={{ display:'inline-block', padding:'4px 11px', borderRadius:99, background:s.bg, color:s.color, fontSize:10, fontWeight:700, letterSpacing:0.4 }}>{s.label}</span>;
}
window.StatusBadge = StatusBadge;

// Tag chip
function TagChip({ tag, selected, onClick }) {
  const labels = { for_humans:'For Humans', for_animals:'For Animals', for_both:'For Both', cooked:'Cooked', raw_ingredients:'Raw Ingredients', packaged:'Packaged' };
  return (
    <button onClick={onClick} style={{ height:32, padding:'0 16px', borderRadius:99, border:'none', background: selected ? C.green : C.surface2, color: selected ? '#fff' : C.textMid, fontSize:12, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'Inter,sans-serif', transition:'all 0.15s', boxShadow: selected ? '0 2px 8px rgba(22,163,74,0.2)' : 'none' }}>
      {labels[tag]||tag}
    </button>
  );
}
window.TagChip = TagChip;

// ListingCard
function ListingCard({ listing, onPress, actionLabel, onAction, actionColor }) {
  const timeLeft = listing.expires_at ? (() => {
    const diff = new Date(listing.expires_at) - new Date();
    if (diff <= 0) return null;
    const h = Math.floor(diff/3600000), m = Math.floor((diff%3600000)/60000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  })() : null;
  return (
    <div onClick={onPress} style={{ background:C.surface, borderRadius:18, padding:'14px', display:'flex', gap:14, cursor: onPress?'pointer':'default', marginBottom:12, boxShadow:'0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)', transition:'box-shadow 0.15s' }}>
      <div style={{ width:72, height:72, borderRadius:14, background:C.tagAmber, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, overflow:'hidden' }}>
        {listing.photos?.[0] ? <img src={listing.photos[0]} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : '🌾'}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:700, fontSize:15, color:C.textDark, marginBottom:5, lineHeight:1.3 }}>{listing.title}</div>
        <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:6, flexWrap:'wrap' }}>
          <StatusBadge status={listing.status} />
          {listing.distance_km != null && <span style={{ fontSize:10, fontWeight:700, color:C.green, background:C.tagGreen, padding:'3px 8px', borderRadius:99 }}>{listing.distance_km.toFixed(1)} km</span>}
          {timeLeft && <span style={{ fontSize:10, fontWeight:700, color:C.amber, background:C.tagAmber, padding:'3px 8px', borderRadius:99 }}>⏱ {timeLeft}</span>}
        </div>
        <div style={{ fontSize:12, color:C.textLight }}>{listing.quantity}</div>
        {actionLabel && (
          <div style={{ marginTop:8 }}>
            <Btn size="sm" onClick={e => { e.stopPropagation(); onAction && onAction(); }} style={{ background: actionColor||C.green, color:'#fff' }}>{actionLabel}</Btn>
          </div>
        )}
      </div>
    </div>
  );
}
window.ListingCard = ListingCard;

// Loading spinner
function Spinner({ size=36, color }) {
  return (
    <div style={{ display:'flex', justifyContent:'center', padding:'40px 0' }}>
      <div style={{ width:size, height:size, border:`3px solid ${C.border}`, borderTopColor: color||C.green, borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
    </div>
  );
}
window.Spinner = Spinner;

// Empty state
function EmptyState({ icon='📭', title, subtitle }) {
  return (
    <div style={{ textAlign:'center', padding:'60px 24px' }}>
      <div style={{ width:72, height:72, borderRadius:24, background:C.surface2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, margin:'0 auto 16px' }}>{icon}</div>
      <div style={{ fontWeight:700, fontSize:17, color:C.textDark, marginBottom:6 }}>{title}</div>
      {subtitle && <div style={{ fontSize:13, color:C.textLight, lineHeight:1.5 }}>{subtitle}</div>}
    </div>
  );
}
window.EmptyState = EmptyState;

// Avatar
function Avatar({ name, size=44, color }) {
  const initials = (name||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
  const bg = color || C.green;
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:size*0.4, color:'#fff', flexShrink:0 }}>
      {initials}
    </div>
  );
}
window.Avatar = Avatar;

// Confirm modal
function ConfirmModal({ title, message, onConfirm, onCancel, confirmLabel='Confirm', danger }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'flex-end' }}>
      <div style={{ background:C.surface, width:'100%', borderRadius:'24px 24px 0 0', padding:24 }}>
        <div style={{ fontWeight:700, fontSize:17, color:C.textDark, marginBottom:8 }}>{title}</div>
        <div style={{ fontSize:14, color:C.textMid, marginBottom:24 }}>{message}</div>
        <div style={{ display:'flex', gap:10 }}>
          <Btn fullWidth variant="outline" onClick={onCancel}>Cancel</Btn>
          <Btn fullWidth variant={danger?'danger':'primary'} style={danger?{background:C.red,color:'#fff',border:'none'}:{}} onClick={onConfirm}>{confirmLabel}</Btn>
        </div>
      </div>
    </div>
  );
}
window.ConfirmModal = ConfirmModal;

// Sheet modal
function BottomSheet({ title, children, onClose }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:150, display:'flex', alignItems:'flex-end' }} onClick={onClose}>
      <div style={{ background:C.surface, width:'100%', borderRadius:'24px 24px 0 0', padding:'8px 0 24px', maxHeight:'85vh', overflowY:'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ width:40, height:4, borderRadius:99, background:C.border, margin:'0 auto 16px' }} />
        {title && <div style={{ fontWeight:700, fontSize:16, color:C.textDark, padding:'0 20px 16px' }}>{title}</div>}
        {children}
      </div>
    </div>
  );
}
window.BottomSheet = BottomSheet;

window.DonorNav = DonorNav;
window.RecipientNav = RecipientNav;

// Notification pagination bar
function NotifPagination({ page, lastPage, total, perPage, onChange }) {
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  // Build page numbers: always show first, last, current ±1, with ellipsis
  const pages = [];
  const add = (n) => { if (!pages.includes(n) && n >= 1 && n <= lastPage) pages.push(n); };
  add(1); add(lastPage);
  add(page - 1); add(page); add(page + 1);
  pages.sort((a, b) => a - b);

  const btnBase = {
    minWidth: 34, height: 34, borderRadius: 10, border: `1px solid ${C.border}`,
    background: C.surface, color: C.textDark, fontSize: 13, fontWeight: 600,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s',
  };
  const btnActive = { ...btnBase, background: C.green, color: '#fff', border: `1px solid ${C.green}` };
  const btnDisabled = { ...btnBase, opacity: 0.35, cursor: 'default' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '12px 0 4px' }}>
      <div style={{ fontSize: 12, color: C.textMid }}>
        {from}–{to} of {total} notifications
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Prev */}
        <button style={page === 1 ? btnDisabled : btnBase} disabled={page === 1}
          onClick={() => onChange(page - 1)}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        {pages.map((p, i) => {
          const prev = pages[i - 1];
          const showEllipsis = prev && p - prev > 1;
          return (
            <React.Fragment key={p}>
              {showEllipsis && <span style={{ fontSize: 13, color: C.textLight, padding: '0 2px' }}>…</span>}
              <button style={p === page ? btnActive : btnBase} onClick={() => onChange(p)}>{p}</button>
            </React.Fragment>
          );
        })}

        {/* Next */}
        <button style={page === lastPage ? btnDisabled : btnBase} disabled={page === lastPage}
          onClick={() => onChange(page + 1)}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </div>
  );
}
window.NotifPagination = NotifPagination;

// Location Picker Modal (shared between donor + recipient)
function LocationPickerModal({ lat, lng, address, onConfirm, onClose }) {
  const [search, setSearch] = React.useState('');
  const [results, setResults] = React.useState([]);
  const [searching, setSearching] = React.useState(false);
  const [pin, setPin] = React.useState({ lat, lng });
  const [pinAddress, setPinAddress] = React.useState(address);
  const [geocoding, setGeocoding] = React.useState(false);
  const mapRef = React.useRef(null);
  const mapInstanceRef = React.useRef(null);
  const markerRef = React.useRef(null);
  const searchTimerRef = React.useRef(null);

  const formatNominatim = (addr) => {
    const local = addr.neighbourhood || addr.suburb || addr.city_district || addr.quarter || addr.village;
    const city = addr.city || addr.town || addr.county || addr.state_district;
    return [local, city].filter(Boolean).join(', ');
  };

  const reverseGeocode = async (rlat, rlng) => {
    setGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${rlat}&lon=${rlng}&format=json&accept-language=en`);
      const data = await res.json();
      const formatted = formatNominatim(data.address || {}) || (data.display_name || '').split(',').slice(0,2).join(',').trim() || `${rlat.toFixed(4)}, ${rlng.toFixed(4)}`;
      setPinAddress(formatted);
    } catch { setPinAddress(`${rlat.toFixed(4)}, ${rlng.toFixed(4)}`); }
    finally { setGeocoding(false); }
  };

  React.useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = L.map(mapRef.current, { zoomControl: true }).setView([pin.lat, pin.lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OSM' }).addTo(map);
    const marker = L.marker([pin.lat, pin.lng], { draggable: true }).addTo(map);
    markerRef.current = marker;
    mapInstanceRef.current = map;
    const onMove = async (nlat, nlng) => { marker.setLatLng([nlat, nlng]); setPin({ lat:nlat, lng:nlng }); await reverseGeocode(nlat, nlng); };
    marker.on('dragend', e => { const ll = e.target.getLatLng(); onMove(ll.lat, ll.lng); });
    map.on('click', e => onMove(e.latlng.lat, e.latlng.lng));
    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  const moveTo = (nlat, nlng, addr) => {
    setPin({ lat:nlat, lng:nlng }); setPinAddress(addr); setResults([]); setSearch('');
    if (mapInstanceRef.current && markerRef.current) { mapInstanceRef.current.setView([nlat, nlng], 16); markerRef.current.setLatLng([nlat, nlng]); }
  };

  const doSearch = async (q) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=6&countrycodes=np&accept-language=en`);
      const data = await res.json();
      setResults(data.map(r => ({ display: formatNominatim(r.address) || r.display_name.split(',').slice(0,2).join(',').trim(), lat: parseFloat(r.lat), lng: parseFloat(r.lon) })));
    } catch {} finally { setSearching(false); }
  };

  const handleSearchChange = (v) => { setSearch(v); clearTimeout(searchTimerRef.current); searchTimerRef.current = setTimeout(() => doSearch(v), 500); };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async pos => { const { latitude:mlat, longitude:mlng } = pos.coords; moveTo(mlat, mlng, ''); await reverseGeocode(mlat, mlng); }, () => {});
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:2000, background:'rgba(0,0,0,0.55)', display:'flex', flexDirection:'column' }}>
      <div style={{ background:C.bg, borderRadius:'20px 20px 0 0', flex:1, display:'flex', flexDirection:'column', marginTop:52, overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px 12px', borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:C.textMid, lineHeight:1, padding:0 }}>✕</button>
          <span style={{ fontWeight:700, fontSize:16, color:C.textDark, flex:1 }}>Pick location</span>
          <button onClick={useMyLocation} style={{ background:'none', border:`1.5px solid ${C.green}`, borderRadius:8, padding:'4px 10px', fontSize:12, color:C.green, fontWeight:700, cursor:'pointer' }}>📍 My location</button>
        </div>
        <div style={{ padding:'10px 16px 6px', position:'relative', flexShrink:0 }}>
          <input value={search} onChange={e => handleSearchChange(e.target.value)} placeholder="Search: Pepsicola, Thamel, Baneshwor…"
            style={{ width:'100%', padding:'10px 14px 10px 36px', borderRadius:12, border:`1.5px solid ${C.border}`, fontSize:14, background:C.surface, color:C.textDark, outline:'none', fontFamily:'Inter,sans-serif' }} />
          <span style={{ position:'absolute', left:28, top:'50%', transform:'translateY(-50%)', fontSize:15, pointerEvents:'none' }}>🔍</span>
          {searching && <span style={{ position:'absolute', right:28, top:'50%', transform:'translateY(-50%)', fontSize:12, color:C.textMid }}>…</span>}
          {results.length > 0 && (
            <div style={{ position:'absolute', left:16, right:16, top:'100%', background:C.surface, borderRadius:12, boxShadow:'0 4px 20px rgba(0,0,0,0.13)', zIndex:10, overflow:'hidden', marginTop:2 }}>
              {results.map((r, i) => (
                <div key={i} onClick={() => moveTo(r.lat, r.lng, r.display)}
                  style={{ padding:'11px 14px', fontSize:13, color:C.textDark, borderBottom: i < results.length-1 ? `1px solid ${C.border}` : 'none', cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:12 }}>📍</span> {r.display}
                </div>
              ))}
            </div>
          )}
        </div>
        <div ref={mapRef} style={{ flex:1, minHeight:0 }} />
        <div style={{ padding:'12px 16px', paddingBottom:'calc(12px + env(safe-area-inset-bottom))', borderTop:`1px solid ${C.border}`, background:C.surface, flexShrink:0 }}>
          <div style={{ fontSize:13, color:C.textMid, marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
            <span>📍</span>
            <span style={{ color: geocoding ? C.textMid : C.textDark, fontWeight:600 }}>{geocoding ? 'Finding address…' : (pinAddress || 'Tap map to set location')}</span>
          </div>
          <Btn fullWidth size="lg" onClick={() => onConfirm(pin.lat, pin.lng, pinAddress)} disabled={geocoding || !pinAddress}>Confirm location</Btn>
        </div>
      </div>
    </div>
  );
}
window.LocationPickerModal = LocationPickerModal;
