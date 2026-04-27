// Recipient Screens for FeedLink PWA

function RecipientHome() {
  const { navigate, user, showToast, unreadCount } = React.useContext(AppContext);
  const [listings, setListings] = React.useState([]);
  const [myClaims, setMyClaims] = React.useState([]); // user's active claims
  const [loading, setLoading] = React.useState(true);
  const [radius, setRadius] = React.useState(5);
  const [view, setView] = React.useState('list');
  const mapRef = React.useRef();
  const mapInstance = React.useRef();

  const load = async () => {
    setLoading(true);
    try {
      const lat = user?.latitude||27.7172, lng = user?.longitude||85.3240;
      const [res, claimsRes] = await Promise.all([
        api.getNearbyListings(`?lat=${lat}&lng=${lng}&radius=${radius}&status=active`),
        api.getMyClaimsRecipient(''),
      ]);
      setListings(Array.isArray(res.data)?res.data:[]);
      setMyClaims(Array.isArray(claimsRes.data)?claimsRes.data:[]);
    } catch(e) { showToast(e.message,'error'); }
    finally { setLoading(false); }
  };
  React.useEffect(() => { load(); }, [radius]);

  React.useEffect(() => {
    if (view !== 'map') return;
    setTimeout(() => {
      if (!window.L || mapInstance.current) return;
      const lat = user?.latitude||27.7172, lng = user?.longitude||85.3240;
      const map = window.L.map(mapRef.current,{center:[lat,lng],zoom:14,zoomControl:false});
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OSM'}).addTo(map);
      mapInstance.current = map;
    }, 100);
  }, [view]);

  React.useEffect(() => {
    if (!mapInstance.current || !window.L || view!=='map') return;
    mapInstance.current.eachLayer(l => { if(l instanceof window.L.Marker||l.options?.radius) mapInstance.current.removeLayer(l); });
    listings.forEach(l => {
      if (l.latitude && l.longitude) {
        const icon = window.L.divIcon({ className:'', html:`<div style="background:${C.green};color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 2px 6px rgba(0,0,0,0.25);border:2px solid #fff;">🍱</div>`, iconSize:[32,32], iconAnchor:[16,16] });
        window.L.marker([l.latitude,l.longitude],{icon})
          .bindPopup(`<b style="font-size:13px">${l.title}</b><br><span style="font-size:11px;color:#666">${l.quantity}</span><br><span style="font-size:11px;color:#666">📍 ${l.address||''}</span><br><a href="#" onclick="window.__navigateListing('${l.id}');return false;" style="font-size:12px;color:${C.green};font-weight:700;margin-top:4px;display:inline-block">View listing →</a>`)
          .addTo(mapInstance.current);
      }
    });
    window.__navigateListing = (id) => navigate('recipient-listing-detail', { id });
  }, [listings, view]);

  const [claimTarget, setClaimTarget] = React.useState(null);
  const [claimNote, setClaimNote] = React.useState('');
  const submitClaim = async () => {
    if (!claimTarget) return;
    try {
      await api.claimListing(claimTarget.id, { note:claimNote });
      showToast('Claim submitted!','success');
      setClaimTarget(null); setClaimNote('');
      load();
    } catch(e) { showToast(e.message,'error'); }
  };

  return (
    <div style={{ height:'100dvh', display:'flex', flexDirection:'column', background:C.bg }}>
      {/* Header */}
      <div style={{ padding:'calc(env(safe-area-inset-top) + 12px) 16px 10px', background:C.bg }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
          <div>
            <div style={{ fontWeight:700, fontSize:20, color:C.textDark }}>Find Food Near You</div>
            <div style={{ fontSize:12, color:C.textMid }}>Hi, {user?.name?.split(' ')[0]||'there'} · Using your location</div>
          </div>
          <button onClick={() => navigate('recipient-notifications')} style={{ width:40, height:40, borderRadius:99, background:C.surface, border:`1px solid ${C.border}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, position:'relative' }}>
            🔔{unreadCount>0&&<span style={{position:'absolute',top:0,right:0,width:16,height:16,borderRadius:'50%',background:C.red,fontSize:10,fontWeight:700,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center'}}>{unreadCount}</span>}
          </button>
        </div>
        {/* Search + Request btn */}
        <div style={{ display:'flex', gap:8, marginTop:10 }}>
          <div style={{ flex:1, height:44, borderRadius:99, background:C.surface, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', padding:'0 14px', gap:8, color:C.textLight, fontSize:13 }}>🔍 Search nearby food</div>
          <Btn onClick={() => navigate('create-request')} style={{ background:C.green, color:'#fff', height:44, padding:'0 16px', borderRadius:99, whiteSpace:'nowrap' }} size="md">+ Request</Btn>
        </div>
        {/* Radius pills */}
        <div style={{ display:'flex', gap:6, marginTop:10, alignItems:'center' }}>
          <span style={{ fontSize:11, fontWeight:700, color:C.textMid, marginRight:4 }}>Radius</span>
          {[1,2,5,10].map(r => (
            <button key={r} onClick={() => setRadius(r)} style={{ height:26, padding:'0 12px', borderRadius:99, border: radius===r?`1px solid ${C.green}`:'1px solid '+C.border, background: radius===r?C.green:C.surface, color: radius===r?'#fff':C.textDark, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>{r} km</button>
          ))}
        </div>
        {/* List/Map toggle */}
        <div style={{ display:'flex', background:C.surface2, borderRadius:99, padding:3, marginTop:10 }}>
          {['list','map'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ flex:1, height:30, borderRadius:99, border:'none', background: view===v?C.surface:'transparent', color: view===v?C.textDark:C.textLight, fontWeight: view===v?700:400, fontSize:13, cursor:'pointer', fontFamily:'Inter,sans-serif', textTransform:'capitalize' }}>{v.charAt(0).toUpperCase()+v.slice(1)}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      {view === 'map' ? (
        <div ref={mapRef} style={{ flex:1, background:C.surface2 }}>
          {!window.L && <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:C.textMid,fontSize:13}}>🗺 Map loading…</div>}
        </div>
      ) : (
        <div style={{ flex:1, overflowY:'auto', padding:'8px 16px 80px' }}>
          {loading ? <Spinner /> : listings.length===0
            ? <EmptyState icon="🍱" title="No food nearby" subtitle={`No active listings within ${radius} km`} />
            : listings.map(l => (
              <div key={l.id} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, marginBottom:10, overflow:'hidden' }}>
                <div style={{ display:'flex', gap:12, padding:'12px 14px' }} onClick={() => navigate('recipient-listing-detail',{id:l.id})}>
                  <div style={{ width:76, height:76, borderRadius:8, background:C.tagAmber, flexShrink:0, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32 }}>
                    {l.photos?.[0] ? <img src={l.photos[0]} style={{width:'100%',height:'100%',objectFit:'cover'}} alt="food"/> : '🌾'}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:C.textDark, marginBottom:4 }}>{l.title}</div>
                    <div style={{ fontSize:12, color:C.textMid, marginBottom:4 }}>{l.quantity} · {l.donor?.name}</div>
                    {l.expires_at && (() => { const diff=new Date(l.expires_at)-new Date(); const h=Math.floor(diff/3600000); const m=Math.floor((diff%3600000)/60000); return diff>0 && <div style={{fontSize:11,color:C.green,fontWeight:600}}>⏱ {h>0?`${h}h ${m}m`:`${m}m`} left</div>; })()}
                    {l.distance_km!=null && <span style={{fontSize:10,fontWeight:700,color:C.green,background:C.tagGreen,padding:'2px 8px',borderRadius:99,display:'inline-block',marginTop:4}}>{l.distance_km.toFixed(1)} km</span>}
                  </div>
                </div>
                <div style={{ padding:'0 14px 12px' }}>
                  {(() => {
                    const claim = myClaims.find(c => c.food_listing_id === l.id && ['pending','confirmed'].includes(c.status));
                    if (claim) return (
                      <div style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 12px', background:C.tagGreen, borderRadius:10 }}>
                        <span style={{ fontSize:14 }}>{claim.status==='confirmed'?'✅':'⏳'}</span>
                        <span style={{ fontSize:12, fontWeight:700, color:C.green }}>{claim.status==='confirmed'?'Claim confirmed':'Claim pending'}</span>
                      </div>
                    );
                    return <Btn fullWidth size="sm" onClick={() => setClaimTarget(l)} style={{ background:C.green, color:'#fff' }}>Claim</Btn>;
                  })()}
                </div>
              </div>
            ))
          }
        </div>
      )}

      <RecipientNav active="recipient-home" navigate={navigate} />

      {claimTarget && (
        <BottomSheet title={`Claim: ${claimTarget.title}`} onClose={() => setClaimTarget(null)}>
          <div style={{ padding:'0 20px 20px' }}>
            <div style={{ fontSize:13, color:C.textMid, marginBottom:14 }}>{claimTarget.quantity} · {claimTarget.donor?.name}</div>
            <TextArea label="Note (optional)" value={claimNote} onChange={setClaimNote} placeholder="We are picking up at 7 PM…" rows={3} />
            <Btn fullWidth size="lg" onClick={submitClaim} style={{ background:C.green, color:'#fff' }}>Claim this food</Btn>
            <p style={{ textAlign:'center', fontSize:11, color:C.textMid, marginTop:10 }}>By claiming, you agree to pick up promptly.</p>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}

function RecipientListingDetail({ params }) {
  const { navigate, showToast } = React.useContext(AppContext);
  const [listing, setListing] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [claimNote, setClaimNote] = React.useState('');
  const [showClaimSheet, setShowClaimSheet] = React.useState(false);
  const [completing, setCompleting] = React.useState(false);
  const [myClaim, setMyClaim] = React.useState(null);
  const [cancelling, setCancelling] = React.useState(false);

  const refreshListing = () => api.getRecipientListing(params.id).then(r => setListing(r.data)).catch(()=>{});

  React.useEffect(() => {
    // Load listing + check if user already has a claim for it
    Promise.all([
      api.getRecipientListing(params.id),
      api.getMyClaimsRecipient(''),
    ]).then(([listingRes, claimsRes]) => {
      setListing(listingRes.data);
      const claims = Array.isArray(claimsRes.data) ? claimsRes.data : [];
      const existing = claims.find(c => c.food_listing_id === params.id && ['pending','confirmed'].includes(c.status));
      if (existing) setMyClaim(existing);
    }).catch(e => showToast(e.message,'error')).finally(() => setLoading(false));
  }, [params.id]);

  const submitClaim = async () => {
    try {
      const res = await api.claimListing(params.id, { note:claimNote });
      setMyClaim(res.data || { status:'pending', food_listing_id:params.id });
      showToast('Claim submitted!','success');
      setShowClaimSheet(false);
      refreshListing();
    } catch(e) { showToast(e.message,'error'); }
  };

  const cancelClaim = async () => {
    setCancelling(true);
    try {
      await api.cancelClaim(params.id);
      setMyClaim(null);
      showToast('Claim cancelled','success');
      refreshListing();
    } catch(e) { showToast(e.message,'error'); }
    finally { setCancelling(false); }
  };

  const markComplete = async () => {
    setCompleting(true);
    try {
      await api.completeListing(params.id);
      showToast('Pickup marked complete! 🎉','success');
      refreshListing();
    } catch(e) { showToast(e.message,'error'); }
    finally { setCompleting(false); }
  };

  if (loading) return <div style={{minHeight:'100dvh',display:'flex',alignItems:'center',justifyContent:'center'}}><Spinner /></div>;
  if (!listing) return <EmptyState icon="❌" title="Listing not found" />;

  const timeLeft = (() => {
    if (!listing.expires_at) return null;
    const diff = new Date(listing.expires_at) - new Date();
    if (diff <= 0) return null;
    const h = Math.floor(diff/3600000), m = Math.floor((diff%3600000)/60000);
    return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
  })();

  return (
    <div style={{ minHeight:'100dvh', background:C.bg, paddingBottom:100 }}>
      <ScreenHeader title={listing.title} onBack={() => navigate('recipient-home')} />
      {/* Hero / Photo gallery */}
      {listing.photos && listing.photos.length > 1 ? (
        <div style={{ display:'flex', overflowX:'auto', scrollSnapType:'x mandatory', scrollbarWidth:'none', height:220 }}>
          {listing.photos.map((url, i) => (
            <div key={i} style={{ flexShrink:0, width:'100%', scrollSnapAlign:'start', height:220 }}>
              <img src={url} alt={`photo ${i+1}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ height:200, background: listing.photos?.[0] ? 'transparent' : C.tagAmber, display:'flex', alignItems:'center', justifyContent:'center', fontSize:64, overflow:'hidden' }}>
          {listing.photos?.[0] ? <img src={listing.photos[0]} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/> : '🌾'}
        </div>
      )}
      <div style={{ padding:'16px 16px 0' }}>
        <div style={{ fontWeight:700, fontSize:22, color:C.textDark, marginBottom:8 }}>{listing.title}</div>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', marginBottom:12 }}>
          <StatusBadge status={listing.status} />
          {listing.quantity && <span style={{ fontSize:13, color:C.textMid }}>{listing.quantity}</span>}
          {timeLeft && <span style={{ background:C.tagGreen, color:C.green, fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:99 }}>⏱ {timeLeft}</span>}
        </div>
        {/* Tags */}
        {listing.tags?.length > 0 && (
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
            {listing.tags.map(t => <span key={t.slug||t} style={{ background:C.surface2, borderRadius:99, padding:'4px 12px', fontSize:11, fontWeight:700, color:C.textDark }}>{t.name||t}</span>)}
          </div>
        )}
        {/* Donor card */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 14px', marginBottom:10 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.textMid, marginBottom:8 }}>DONOR</div>
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <Avatar name={listing.donor?.name} size={44} />
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:C.textDark }}>{listing.donor?.name} {listing.donor?.is_verified?'✓':''}</div>
              {listing.donor?.is_verified && <div style={{ fontSize:11, color:C.green }}>Verified on FeedLink</div>}
              {listing.donor?.contact && <div style={{ fontSize:12, color:C.textMid, marginTop:2 }}>📞 {listing.donor.contact}</div>}
            </div>
          </div>
        </div>
        {/* Pickup card */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 14px', marginBottom:10 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.textMid, marginBottom:8 }}>PICKUP</div>
          {listing.address && <div style={{ fontSize:13, color:C.textMid, marginBottom:6 }}>📍 {listing.address}</div>}
          {listing.pickup_before && <div style={{ fontSize:13, color:C.textMid, marginBottom:6 }}>⏱ Pickup before {new Date(listing.pickup_before).toLocaleString()}</div>}
          {listing.pickup_instructions && <div style={{ fontSize:13, color:C.textMid }}>ℹ️ {listing.pickup_instructions}</div>}
        </div>
        {listing.description && <div style={{ fontSize:14, color:C.textMid, lineHeight:1.6, marginBottom:12 }}>{listing.description}</div>}
      </div>
      {/* Bottom action */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, background:C.surface, borderTop:`1px solid ${C.border}`, padding:'12px 16px', paddingBottom:'calc(12px + env(safe-area-inset-bottom))' }}>
        {listing.status === 'active' && !myClaim && (
          <Btn fullWidth size="lg" onClick={() => setShowClaimSheet(true)} style={{ background:C.green, color:'#fff' }}>Claim this food</Btn>
        )}
        {listing.status === 'active' && myClaim && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'10px 0', background: myClaim.status==='confirmed' ? C.tagGreen : C.tagAmber, borderRadius:12 }}>
              <span style={{ fontSize:18 }}>{myClaim.status==='confirmed' ? '✅' : '⏳'}</span>
              <span style={{ fontWeight:700, fontSize:14, color: myClaim.status==='confirmed' ? C.green : C.amber }}>
                {myClaim.status==='confirmed' ? 'Claim confirmed by donor' : 'Claim pending — waiting for donor'}
              </span>
            </div>
            {myClaim.status !== 'confirmed' && (
              <Btn fullWidth size="sm" onClick={cancelClaim} disabled={cancelling} style={{ background:'transparent', color:C.red, border:`1px solid ${C.red}` }}>
                {cancelling ? 'Cancelling…' : 'Cancel my claim'}
              </Btn>
            )}
          </div>
        )}
        {listing.status === 'claimed' && <Btn fullWidth size="lg" onClick={markComplete} disabled={completing} style={{ background:C.green, color:'#fff' }}>{completing?'Marking…':'Mark as Collected ✓'}</Btn>}
        {listing.status === 'completed' && <div style={{ textAlign:'center', fontWeight:700, fontSize:15, color:C.green }}>✅ Pickup completed!</div>}
        {listing.status === 'expired' && <div style={{ textAlign:'center', fontWeight:700, fontSize:15, color:C.textMid }}>⏰ This listing has expired</div>}
        <p style={{ textAlign:'center', fontSize:11, color:C.textMid, marginTop:6 }}>By claiming, you agree to pick up promptly.</p>
      </div>
      {showClaimSheet && (
        <BottomSheet title="Claim this food" onClose={() => setShowClaimSheet(false)}>
          <div style={{ padding:'0 20px 20px' }}>
            <TextArea label="Note (optional)" value={claimNote} onChange={setClaimNote} placeholder="We are picking up at 7 PM…" rows={3} />
            <Btn fullWidth size="lg" onClick={submitClaim} style={{ background:C.green, color:'#fff' }}>Confirm Claim</Btn>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}

function RecipientClaims() {
  const { navigate, showToast } = React.useContext(AppContext);
  const [claims, setClaims] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState('');

  React.useEffect(() => {
    const q = filter ? `?status=${filter}` : '';
    api.getMyClaimsRecipient(q).then(r => setClaims(Array.isArray(r.data)?r.data:[])).catch(e=>showToast(e.message,'error')).finally(()=>setLoading(false));
  }, [filter]);

  const cancelClaim = async (listingId) => {
    try { await api.cancelClaim(listingId); showToast('Claim cancelled','success'); setClaims(p=>p.filter(c=>c.food_listing_id!==listingId)); }
    catch(e) { showToast(e.message,'error'); }
  };

  return (
    <div style={{ minHeight:'100dvh', background:C.bg, paddingBottom:'calc(80px + env(safe-area-inset-bottom))' }}>
      <div style={{ padding:'calc(env(safe-area-inset-top) + 12px) 16px 10px', background:C.bg }}>
        <div style={{ fontWeight:700, fontSize:20, color:C.textDark, marginBottom:12 }}>My Claims</div>
        <div style={{ display:'flex', background:C.surface2, borderRadius:99, padding:3, gap:2 }}>
          {[{k:'',l:'All'},{k:'pending',l:'Pending'},{k:'confirmed',l:'Confirmed'},{k:'rejected',l:'Rejected'}].map(t => (
            <button key={t.k} onClick={()=>setFilter(t.k)} style={{ flex:1, height:28, borderRadius:99, border:'none', background:filter===t.k?C.surface:'transparent', color:filter===t.k?C.textDark:C.textLight, fontWeight:filter===t.k?700:400, fontSize:12, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>{t.l}</button>
          ))}
        </div>
      </div>
      <div style={{ padding:'8px 16px' }}>
        {loading ? <Spinner /> : claims.length===0 ? <EmptyState icon="🤲" title="No claims" subtitle="Claim a listing from the home screen" />
          : claims.map(c => (
            <div key={c.id} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 14px', marginBottom:10 }}>
              <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:8 }}>
                <div style={{ width:44, height:44, borderRadius:8, background:C.tagAmber, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>🌾</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14, color:C.textDark }}>{c.listing?.title||'Listing'}</div>
                  <StatusBadge status={c.status} />
                </div>
              </div>
              {c.note && <div style={{ fontSize:12, color:C.textMid, marginBottom:8 }}>{c.note}</div>}
              <div style={{ display:'flex', gap:8 }}>
                {c.listing?.id && <Btn size="sm" onClick={() => navigate('recipient-listing-detail',{id:c.food_listing_id})} variant="outline">View listing</Btn>}
                {c.status==='pending' && <Btn size="sm" variant="danger" onClick={() => cancelClaim(c.food_listing_id)} style={{ color:C.red, border:`1px solid ${C.border}` }}>Cancel</Btn>}
              </div>
            </div>
          ))
        }
      </div>
      <RecipientNav active="recipient-claims" navigate={navigate} />
    </div>
  );
}

function RecipientMap() {
  const { navigate, user, showToast } = React.useContext(AppContext);
  const [listings, setListings] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const mapRef = React.useRef();
  const mapInstance = React.useRef();
  const lat = user?.latitude||27.7172, lng = user?.longitude||85.3240;

  React.useEffect(() => {
    api.getNearbyListings(`?lat=${lat}&lng=${lng}&radius=5&status=active`).then(r => setListings(Array.isArray(r.data)?r.data:[])).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  React.useEffect(() => {
    if (!window.L || mapInstance.current) return;
    const map = window.L.map(mapRef.current,{center:[lat,lng],zoom:14});
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OSM'}).addTo(map);
    mapInstance.current = map;
  }, []);

  React.useEffect(() => {
    if (!mapInstance.current || !window.L) return;
    listings.forEach(l => {
      if (l.latitude && l.longitude) {
        const icon = window.L.divIcon({ className:'', html:`<div style="background:${C.green};color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 2px 6px rgba(0,0,0,0.25);border:2px solid #fff;">🍱</div>`, iconSize:[32,32], iconAnchor:[16,16] });
        window.L.marker([l.latitude,l.longitude],{icon})
          .bindPopup(`<b style="font-size:13px">${l.title}</b><br><span style="font-size:11px;color:#666">${l.quantity}</span><br><span style="font-size:11px;color:#666">📍 ${l.address||''}</span><br><a href="#" onclick="window.__navigateListing('${l.id}');return false;" style="font-size:12px;color:${C.green};font-weight:700;margin-top:4px;display:inline-block">View listing →</a>`)
          .addTo(mapInstance.current);
      }
    });
    window.__navigateListing = (id) => navigate('recipient-listing-detail', { id });
  }, [listings]);

  return (
    <div style={{ height:'100dvh', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ padding:'calc(env(safe-area-inset-top) + 12px) 16px 10px', background:C.bg }}>
        <div style={{ fontWeight:700, fontSize:20, color:C.textDark }}>Food Near You</div>
        <div style={{ fontSize:12, color:C.textMid }}>{listings.length} listings within 5 km</div>
      </div>
      <div ref={mapRef} style={{ flex:1 }}>
        {!window.L && <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:C.textMid,fontSize:13}}>🗺 Map loading…</div>}
      </div>
      <RecipientNav active="recipient-map" navigate={navigate} />
    </div>
  );
}

function RecipientRequests() {
  const { navigate, showToast } = React.useContext(AppContext);
  const [requests, setRequests] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const load = () => {
    setLoading(true);
    api.getMyRequests().then(r => setRequests(Array.isArray(r.data)?r.data:[])).catch(e=>showToast(e.message,'error')).finally(()=>setLoading(false));
  };
  React.useEffect(load, []);

  const deleteReq = async (id) => {
    try { await api.deleteRequest(id); load(); showToast('Request deleted','success'); }
    catch(e) { showToast(e.message,'error'); }
  };

  return (
    <div style={{ minHeight:'100dvh', background:C.bg, paddingBottom:'calc(80px + env(safe-area-inset-bottom))' }}>
      <div style={{ padding:'calc(env(safe-area-inset-top) + 12px) 16px 10px', background:C.bg, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontWeight:700, fontSize:20, color:C.textDark }}>My Requests</div>
        <Btn size="sm" onClick={() => navigate('create-request')} style={{ background:C.green, color:'#fff' }}>+ New</Btn>
      </div>
      <div style={{ padding:'8px 16px' }}>
        {loading ? <Spinner /> : requests.length===0 ? <EmptyState icon="📋" title="No requests" subtitle="Post a food request to get donations" />
          : requests.map(r => (
            <div key={r.id} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 14px', marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                <div style={{ fontWeight:700, fontSize:14, color:C.textDark, flex:1 }}>{r.title}</div>
                <StatusBadge status={r.status} />
              </div>
              <div style={{ fontSize:12, color:C.textMid, marginBottom:8 }}>{r.quantity_needed} · {r.address}</div>
              {r.needed_by && <div style={{ fontSize:11, color:C.textLight, marginBottom:8 }}>Needed by {new Date(r.needed_by).toLocaleDateString()}</div>}
              <div style={{ display:'flex', gap:8 }}>
                <Btn size="sm" variant="outline" onClick={() => navigate('recipient-request-detail',{id:r.id})}>View</Btn>
                <Btn size="sm" variant="danger" onClick={() => deleteReq(r.id)} style={{ color:C.red, border:`1px solid ${C.border}` }}>Delete</Btn>
              </div>
            </div>
          ))
        }
      </div>
      <RecipientNav active="recipient-home" navigate={navigate} />
    </div>
  );
}

function CreateRequest() {
  const { navigate, showToast } = React.useContext(AppContext);
  const [form, setForm] = React.useState({ title:'', description:'', quantity_needed:'', food_type:'human', tags:[], needed_by:'', address:'', latitude:27.7172, longitude:85.3240 });
  const [loading, setLoading] = React.useState(false);
  const [showLocationPicker, setShowLocationPicker] = React.useState(false);
  const set = k => v => setForm(p=>({...p,[k]:v}));
  const toggleTag = tag => setForm(p => ({ ...p, tags: p.tags.includes(tag) ? p.tags.filter(t=>t!==tag) : [...p.tags, tag] }));

  const toLocalISO = (val) => {
    if (!val) return '';
    const pad = n => String(n).padStart(2, '0');
    const off = -new Date(val).getTimezoneOffset();
    const sign = off >= 0 ? '+' : '-';
    const hh = pad(Math.floor(Math.abs(off) / 60));
    const mm = pad(Math.abs(off) % 60);
    return `${val}:00${sign}${hh}:${mm}`;
  };
  const submit = async () => {
    if (!form.title || !form.quantity_needed) return showToast('Title and quantity required','error');
    if (!form.needed_by) return showToast('Set needed-by date','error');
    setLoading(true);
    try {
      await api.createRequest({ ...form, needed_by: toLocalISO(form.needed_by) });
      showToast('Request posted!','success');
      navigate('recipient-requests');
    } catch(e) { showToast(e.message,'error'); }
    finally { setLoading(false); }
  };
  const min = new Date(); min.setHours(min.getHours()+1);
  return (
    <div style={{ minHeight:'100dvh', background:C.bg, paddingBottom:100 }}>
      <ScreenHeader title="New Request" onBack={() => navigate('recipient-home')} />
      <div style={{ padding:'16px 16px' }}>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:'14px 16px', marginBottom:12 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.textMid, marginBottom:12 }}>DETAILS</div>
          <Input label="Title" value={form.title} onChange={set('title')} placeholder="Need food for 30 people" required />
          <TextArea label="Description" value={form.description} onChange={set('description')} placeholder="Describe your need…" rows={2} />
          <Input label="Quantity Needed" value={form.quantity_needed} onChange={set('quantity_needed')} placeholder="e.g. 20 kg rice" required />
          {/* Address / Location picker */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.textMid, marginBottom:6 }}>ADDRESS</div>
            <div onClick={() => setShowLocationPicker(true)}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', borderRadius:12, border:`1.5px solid ${C.border}`, background:C.surface, cursor:'pointer' }}>
              <span style={{ fontSize:18, flexShrink:0 }}>📍</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, color: form.address ? C.textDark : C.textLight, fontWeight: form.address ? 600 : 400, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {form.address || 'Tap to set location'}
                </div>
                <div style={{ fontSize:11, color:C.textLight, marginTop:2 }}>Tap to choose on map or search</div>
              </div>
              <span style={{ fontSize:14, color:C.textLight, flexShrink:0 }}>›</span>
            </div>
          </div>
          <div>
            <label style={{ display:'block', fontWeight:700, fontSize:13, color:C.textDark, marginBottom:6 }}>Needed by <span style={{color:C.red}}>*</span></label>
            <input type="datetime-local" value={form.needed_by} min={min.toISOString().slice(0,16)} onChange={e => set('needed_by')(e.target.value)}
              style={{ width:'100%', height:44, borderRadius:10, border:`1px solid ${C.border}`, padding:'0 12px', fontSize:13, boxSizing:'border-box', outline:'none', color:C.textDark, background:C.surface, fontFamily:'Inter,sans-serif' }} />
          </div>
        </div>

        {/* Tags */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:'14px 16px', marginBottom:12 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.textMid, marginBottom:12 }}>FOOD TAGS</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {['cooked','raw_ingredients','packaged','for_humans','for_animals','for_both'].map(tag => (
              <TagChip key={tag} tag={tag} selected={form.tags.includes(tag)} onClick={() => toggleTag(tag)} />
            ))}
          </div>
          {form.tags.length === 0 && (
            <div style={{ fontSize:12, color:C.textLight, marginTop:8 }}>Optional — select what kind of food you need</div>
          )}
        </div>
      </div>
      <div style={{ position:'fixed', bottom:0, left:0, right:0, background:C.surface, borderTop:`1px solid ${C.border}`, padding:'12px 16px', paddingBottom:'calc(12px + env(safe-area-inset-bottom))' }}>
        <Btn fullWidth size="lg" onClick={submit} disabled={loading}>{loading?'Posting…':'Post Request'}</Btn>
      </div>
      {showLocationPicker && (
        <LocationPickerModal
          lat={form.latitude} lng={form.longitude} address={form.address}
          onConfirm={(lat, lng, addr) => { setForm(p => ({ ...p, latitude:lat, longitude:lng, address:addr })); setShowLocationPicker(false); }}
          onClose={() => setShowLocationPicker(false)}
        />
      )}
    </div>
  );
}

function RecipientRequestDetail({ params }) {
  const { navigate, showToast } = React.useContext(AppContext);
  const [request, setRequest] = React.useState(null);
  const [acceptances, setAcceptances] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const load = async () => {
    try {
      const [r, a] = await Promise.all([api.getRequest(params.id), api.getRequestAcceptances(params.id)]);
      setRequest(r.data); setAcceptances(Array.isArray(a.data)?a.data:[]);
    } catch(e) { showToast(e.message,'error'); }
    finally { setLoading(false); }
  };
  React.useEffect(load,[params.id]);
  const confirm = async (accId) => {
    try { await api.confirmAcceptance(params.id, accId); showToast('Donor confirmed!','success'); load(); } catch(e) { showToast(e.message,'error'); }
  };
  const reject = async (accId) => {
    try { await api.rejectAcceptance(params.id, accId); showToast('Offer rejected','success'); load(); } catch(e) { showToast(e.message,'error'); }
  };
  const complete = async () => {
    try { await api.completeRequest(params.id); showToast('Request fulfilled!','success'); load(); } catch(e) { showToast(e.message,'error'); }
  };
  if (loading) return <div style={{minHeight:'100dvh',display:'flex',alignItems:'center',justifyContent:'center'}}><Spinner /></div>;
  if (!request) return <EmptyState icon="❌" title="Not found" />;
  return (
    <div style={{ minHeight:'100dvh', background:C.bg, paddingBottom:'calc(80px + env(safe-area-inset-bottom))' }}>
      <ScreenHeader title={request.title} onBack={() => navigate('recipient-requests')} />
      <div style={{ padding:'16px 16px' }}>
        <div style={{ fontWeight:700, fontSize:20, color:C.textDark, marginBottom:8 }}>{request.title}</div>
        <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
          <StatusBadge status={request.status} />
          {request.quantity_needed && <span style={{ fontSize:13, color:C.textMid }}>{request.quantity_needed}</span>}
        </div>
        {request.description && <div style={{ fontSize:14, color:C.textMid, lineHeight:1.6, marginBottom:14 }}>{request.description}</div>}
        {request.needed_by && <div style={{ fontSize:13, color:C.textMid, marginBottom:14 }}>Needed by {new Date(request.needed_by).toLocaleString()}</div>}
        <div style={{ fontWeight:700, fontSize:15, color:C.textDark, marginBottom:10 }}>Donor offers ({acceptances.length})</div>
        {acceptances.length===0 ? <div style={{fontSize:13,color:C.textMid,marginBottom:12}}>No offers yet. Donors near you will see this request.</div>
          : acceptances.map(a => (
            <div key={a.id} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 14px', marginBottom:10 }}>
              <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:8 }}>
                <Avatar name={a.donor?.name||a.donor_id} size={40} />
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14, color:C.textDark }}>{a.donor?.name||'Donor'}</div>
                  <StatusBadge status={a.status} />
                </div>
              </div>
              {a.note && <div style={{ fontSize:12, color:C.textMid, marginBottom:10 }}>{a.note}</div>}
              {a.status==='pending' && (
                <div style={{ display:'flex', gap:8 }}>
                  <Btn size="sm" onClick={() => confirm(a.id)} style={{ background:C.green, color:'#fff', flex:1 }}>✓ Confirm</Btn>
                  <Btn size="sm" variant="outline" onClick={() => reject(a.id)} style={{ flex:1 }}><span style={{color:C.red}}>✗ Reject</span></Btn>
                </div>
              )}
            </div>
          ))
        }
        {request.status==='accepted' && (
          <Btn fullWidth size="lg" onClick={complete} style={{ background:C.green, color:'#fff', marginTop:16 }}>Mark as Fulfilled ✓</Btn>
        )}
      </div>
    </div>
  );
}

function RecipientNotifications() {
  const { navigate, showToast, setUnreadCount } = React.useContext(AppContext);
  const [items, setItems] = React.useState([]);
  const [unread, setUnread] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [meta, setMeta] = React.useState(null);
  const PER_PAGE = 15;

  const load = async (p = page) => {
    setLoading(true);
    try {
      const r = await api.getNotifications(`?page=${p}&per_page=${PER_PAGE}`);
      setItems(r.data?.items || []);
      setUnread(r.data?.unread_count || 0);
      setMeta(r.data?.meta || null);
    } catch(e) { showToast(e.message,'error'); }
    finally { setLoading(false); }
  };
  React.useEffect(() => { load(page); }, [page]);
  // Clear badge when screen is open
  React.useEffect(() => { setUnreadCount(0); }, []);

  const icons = { claim_confirmed:'✅', claim_rejected:'❌', pickup_completed:'🎉', request_accepted:'🤝', acceptance_confirmed:'✅', acceptance_rejected:'❌', acceptance_withdrawn:'↩️', request_fulfilled:'🎊', listing_reopened:'🔄', listing_cancelled:'🗑' };

  const lastPage = meta?.last_page || 1;
  const total = meta?.total || 0;

  return (
    <div style={{ minHeight:'100dvh', background:C.bg, paddingBottom:'calc(80px + env(safe-area-inset-bottom))' }}>
      <div style={{ padding:'calc(env(safe-area-inset-top) + 12px) 16px 10px', display:'flex', justifyContent:'space-between', alignItems:'center', background:C.bg }}>
        <div>
          <div style={{ fontWeight:700, fontSize:20, color:C.textDark }}>Notifications</div>
          {unread>0 && <div style={{ fontSize:12, color:C.textMid }}>{unread} unread</div>}
        </div>
        {unread>0 && <Btn size="sm" onClick={() => api.markAllRead().then(() => load(page))} style={{ background:C.green, color:'#fff' }}>✓✓ Mark all read</Btn>}
      </div>
      <div style={{ padding:'0 16px' }}>
        {loading ? <Spinner /> : items.length===0 ? <EmptyState icon="🔔" title="No notifications" />
          : items.map(n => (
            <div key={n.id} onClick={() => api.markNotificationRead(n.id).then(() => load(page)).catch(()=>{})}
              style={{ background:!n.read_at?C.tagGreen:C.surface, border:`1px solid ${!n.read_at?C.green:C.border}`, borderRadius:16, padding:'12px 14px', marginBottom:10, display:'flex', gap:12, alignItems:'flex-start', cursor:'pointer' }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:!n.read_at?C.green:C.surface2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{icons[n.type]||'🔔'}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:13, color:C.textDark, marginBottom:2 }}>{n.title}</div>
                <div style={{ fontSize:12, color:C.textMid }}>{n.body}</div>
                <div style={{ fontSize:11, color:C.textLight, marginTop:4 }}>{new Date(n.created_at).toLocaleString()}</div>
              </div>
              {!n.read_at && <div style={{ width:8, height:8, borderRadius:'50%', background:C.green, flexShrink:0, marginTop:4 }} />}
            </div>
          ))
        }
        {!loading && lastPage > 1 && (
          <NotifPagination page={page} lastPage={lastPage} total={total} perPage={PER_PAGE} onChange={p => setPage(p)} />
        )}
      </div>
      <RecipientNav active="recipient-notifications" navigate={navigate} />
    </div>
  );
}

function RecipientProfile() {
  const { navigate, user, setUser, showToast } = React.useContext(AppContext);
  const [confirmLogout, setConfirmLogout] = React.useState(false);
  const logout = async () => {
    try { await api.logout(); } catch {}
    api.clearTokens();
    localStorage.removeItem('fl_role'); localStorage.removeItem('fl_user');
    setUser(null); navigate('splash');
  };
  return (
    <div style={{ minHeight:'100dvh', background:C.bg, paddingBottom:'calc(80px + env(safe-area-inset-bottom))' }}>
      <div style={{ background:`linear-gradient(${C.green} 0%, ${C.greenDark} 100%)`, padding:'calc(env(safe-area-inset-top) + 12px) 16px 80px' }}>
        <div style={{ fontWeight:700, fontSize:20, color:'#fff' }}>Profile</div>
      </div>
      <div style={{ padding:'0 16px', marginTop:-52 }}>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:24, padding:'16px', marginBottom:16 }}>
          <div style={{ display:'flex', gap:14, alignItems:'center', marginBottom:14 }}>
            <Avatar name={user?.name} size={64} color={C.green} />
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:17, color:C.textDark }}>{user?.name}</div>
              <div style={{ display:'inline-block', background:C.tagGreen, borderRadius:99, padding:'3px 12px', fontSize:11, fontWeight:700, color:C.green, marginTop:4 }}>Recipient</div>
            </div>
            <button onClick={() => navigate('recipient-edit-profile')} style={{ width:36, height:36, borderRadius:'50%', background:C.surface2, border:'none', cursor:'pointer', fontSize:16 }}>✏️</button>
          </div>
          <div style={{ background:C.surface2, borderRadius:8, padding:'6px 10px', marginBottom:6, fontSize:12, color:C.textDark }}>✉ {user?.email}</div>
          <div style={{ background:C.surface2, borderRadius:8, padding:'6px 10px', fontSize:12, color:C.textDark }}>📞 {user?.contact||'–'}</div>
        </div>
        <div style={{ fontSize:10, fontWeight:700, color:C.textMid, marginBottom:8 }}>ACCOUNT</div>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, overflow:'hidden', marginBottom:16 }}>
          {[
            {label:'Edit profile', action:()=>navigate('recipient-edit-profile')},
            {label:'My Requests', action:()=>navigate('recipient-requests')},
            {label:'About FeedLink', action:()=>{}},
          ].map((item,i,arr) => (
            <div key={item.label}>
              <div onClick={item.action} style={{ padding:'16px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer' }}>
                <span style={{ fontWeight:700, fontSize:14, color:C.textDark }}>{item.label}</span>
                <span style={{ fontSize:18, color:C.textLight }}>›</span>
              </div>
              {i<arr.length-1 && <div style={{ height:1, background:C.border, margin:'0 16px' }} />}
            </div>
          ))}
        </div>
        <Btn fullWidth variant="danger" size="lg" onClick={() => setConfirmLogout(true)}>Log out</Btn>
      </div>
      <RecipientNav active="recipient-profile" navigate={navigate} />
      {confirmLogout && <ConfirmModal title="Log out?" message="You will need to log in again." confirmLabel="Log out" danger onConfirm={logout} onCancel={() => setConfirmLogout(false)} />}
    </div>
  );
}

function RecipientEditProfile() {
  const { navigate, user, setUser, showToast } = React.useContext(AppContext);
  const [form, setForm] = React.useState({ name:user?.name||'', contact:user?.contact||'' });
  const [loading, setLoading] = React.useState(false);
  const set = k => v => setForm(p=>({...p,[k]:v}));
  const submit = async () => {
    setLoading(true);
    try {
      const res = await api.updateProfile(form);
      localStorage.setItem('fl_user', JSON.stringify(res.data));
      setUser(res.data);
      showToast('Profile updated!','success');
      navigate('recipient-profile');
    } catch(e) { showToast(e.message,'error'); }
    finally { setLoading(false); }
  };
  return (
    <div style={{ minHeight:'100dvh', background:C.bg, paddingBottom:100 }}>
      <ScreenHeader title="Edit Profile" onBack={() => navigate('recipient-profile')} />
      <div style={{ padding:'20px 24px' }}>
        <Input label="Full Name" value={form.name} onChange={set('name')} placeholder="Your name" />
        <Input label="Phone Number" value={form.contact} onChange={set('contact')} placeholder="98XXXXXXXX" />
        <Btn fullWidth size="lg" onClick={submit} disabled={loading} style={{ marginTop:8 }}>{loading?'Saving…':'Save Changes'}</Btn>
      </div>
    </div>
  );
}

Object.assign(window, { RecipientHome, RecipientListingDetail, RecipientClaims, RecipientMap, RecipientRequests, CreateRequest, RecipientRequestDetail, RecipientNotifications, RecipientProfile, RecipientEditProfile });
