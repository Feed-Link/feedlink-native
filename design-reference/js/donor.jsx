// Donor Screens for FeedLink PWA

function DonorHome() {
  const { navigate, user, showToast, unreadCount } = React.useContext(AppContext);
  const [stats, setStats] = React.useState(null);
  const [listings, setListings] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const [s, l] = await Promise.all([
          api.getDonorStats(),
          api.getDonorListings('?status=active&per_page=3'),
        ]);
        setStats(s.data);
        setListings(Array.isArray(l.data) ? l.data : []);
      } catch(e) { showToast(e.message,'error'); }
      finally { setLoading(false); }
    })();
  }, []);

  const name = user?.name?.split(' ')[0] || 'there';
  return (
    <div style={{ minHeight:'100dvh', background:C.bg, paddingBottom:'calc(80px + env(safe-area-inset-bottom))' }}>
      {/* Header */}
      <div style={{ background:`linear-gradient(${C.green} 0%, ${C.greenDark} 100%)`, padding:'calc(env(safe-area-inset-top) + 16px) 16px 20px', position:'relative' }}>
        <div style={{ fontSize:12, color:'rgba(255,255,255,0.85)', fontWeight:500 }}>Hi, {name}</div>
        <div style={{ fontWeight:700, fontSize:22, color:'#fff', marginTop:2 }}>Share food today</div>
        <button onClick={() => navigate('donor-notifications')} style={{ position:'absolute', right:16, top:'calc(env(safe-area-inset-top) + 12px)', width:40, height:40, borderRadius:'50%', background:'rgba(255,255,255,0.15)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
          🔔{unreadCount>0 && <span style={{ position:'absolute', top:0, right:0, width:16, height:16, borderRadius:'50%', background:'rgb(220,175,38)', fontSize:10, fontWeight:700, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>{unreadCount}</span>}
        </button>
        {/* Stats */}
        <div style={{ display:'flex', gap:8, marginTop:16 }}>
          {[
            { label:'Active', val: stats?.listings_active ?? '–' },
            { label:'Claimed', val: stats?.listings_completed ? stats.listings_active+1 : '–' },
            { label:'Done', val: stats?.listings_completed ?? '–' },
          ].map(s => (
            <div key={s.label} style={{ flex:1, background:'rgba(255,255,255,0.15)', borderRadius:12, padding:'10px 8px', textAlign:'center' }}>
              <div style={{ fontWeight:700, fontSize:22, color:'#fff' }}>{s.val}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.8)', fontWeight:500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:'16px 16px 0' }}>
        {/* Post CTA */}
        <div onClick={() => navigate('create-listing')} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:'14px 16px', display:'flex', alignItems:'center', gap:14, cursor:'pointer', marginBottom:16 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:C.tagGreen, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>➕</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:14, color:C.textDark }}>Post new listing</div>
            <div style={{ fontSize:12, color:C.textMid }}>Share surplus food in a minute</div>
          </div>
          <span style={{ fontSize:20, color:C.textLight }}>›</span>
        </div>

        {/* Active listings */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <span style={{ fontWeight:700, fontSize:15, color:C.textDark }}>Your active listings</span>
          <span style={{ fontSize:13, color:C.green, fontWeight:700, cursor:'pointer' }} onClick={() => navigate('donor-listings')}>See all</span>
        </div>
        {loading ? <Spinner /> : listings.length === 0
          ? <EmptyState icon="🍱" title="No active listings" subtitle="Post your first listing to get started" />
          : listings.map(l => <ListingCard key={l.id} listing={l} onPress={() => navigate('donor-listing-detail', { id:l.id })} />)
        }
      </div>
      <DonorNav active="donor-home" navigate={navigate} />
    </div>
  );
}

function DonorListings() {
  const { navigate, showToast } = React.useContext(AppContext);
  const [tab, setTab] = React.useState('active');
  const [listings, setListings] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [meta, setMeta] = React.useState(null);
  const PER_PAGE = 10;

  const tabs = [{ key:'active',label:'Active'},{key:'claimed',label:'Claimed'},{key:'',label:'All'}];

  const fetchListings = async (status, p) => {
    setLoading(true);
    try {
      const parts = [status ? `status=${status}` : '', `page=${p}`, `per_page=${PER_PAGE}`].filter(Boolean).join('&');
      const res = await api.getDonorListings(`?${parts}`);
      setListings(Array.isArray(res.data) ? res.data : []);
      setMeta(res.meta || null);
    } catch(e) { showToast(e.message,'error'); }
    finally { setLoading(false); }
  };

  React.useEffect(() => { setPage(1); }, [tab]);
  React.useEffect(() => { fetchListings(tab, page); }, [tab, page]);

  const lastPage = meta?.last_page || 1;
  const total = meta?.total || 0;

  return (
    <div style={{ minHeight:'100dvh', background:C.bg, paddingBottom:'calc(80px + env(safe-area-inset-bottom))' }}>
      <div style={{ padding:'calc(env(safe-area-inset-top) + 12px) 16px 0', background:C.bg }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <span style={{ fontWeight:700, fontSize:20, color:C.textDark }}>My Listings</span>
          <Btn size="sm" onClick={() => navigate('create-listing')} style={{ background:C.green, color:'#fff' }}>+ New</Btn>
        </div>
        {/* Tab filter */}
        <div style={{ display:'flex', background:C.surface2, borderRadius:99, padding:3, marginBottom:16, gap:2 }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ flex:1, height:30, borderRadius:99, border:'none', background: tab===t.key?C.surface:'transparent', color: tab===t.key?C.textDark:C.textLight, fontWeight: tab===t.key?700:400, fontSize:13, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding:'0 16px' }}>
        {loading ? <Spinner /> : listings.length === 0
          ? <EmptyState icon="📋" title="No listings" subtitle={tab?`No ${tab} listings`:'No listings yet'} />
          : listings.map(l => <ListingCard key={l.id} listing={l} onPress={() => navigate('donor-listing-detail', { id:l.id })} />)
        }
        {!loading && lastPage > 1 && (
          <NotifPagination page={page} lastPage={lastPage} total={total} perPage={PER_PAGE} onChange={p => setPage(p)} />
        )}
      </div>
      <DonorNav active="donor-listings" navigate={navigate} />
    </div>
  );
}

function CreateListing() {
  const { navigate, showToast } = React.useContext(AppContext);
  const ALL_TAGS = ['cooked','raw_ingredients','packaged','for_humans','for_animals','for_both'];
  const MAX_PHOTOS = 4;
  const [form, setForm] = React.useState({ title:'', description:'', quantity:'', tags:[], photos:[], expires_at:'', pickup_before:'', pickup_instructions:'', address:'Thamel, Kathmandu', latitude:27.7172, longitude:85.3240 });
  const [photosPreviews, setPhotosPreviews] = React.useState([]); // [{url, uploading, error}]
  const [loading, setLoading] = React.useState(false);
  const [showLocationPicker, setShowLocationPicker] = React.useState(false);
  const fileInputRef = React.useRef();
  const set = k => v => setForm(p=>({...p,[k]:v}));
  const toggleTag = tag => setForm(p => ({ ...p, tags: p.tags.includes(tag) ? p.tags.filter(t=>t!==tag) : [...p.tags,tag] }));
  const minExpiry = () => { const d = new Date(); d.setHours(d.getHours()+1); return d.toISOString().slice(0,16); };

  // Convert datetime-local value to ISO with local timezone offset (e.g. +05:45)
  // so the server (Asia/Kathmandu) receives the exact time the user picked.
  const toLocalISO = (val) => {
    if (!val) return '';
    const pad = n => String(n).padStart(2, '0');
    const off = -new Date(val).getTimezoneOffset(); // minutes ahead of UTC
    const sign = off >= 0 ? '+' : '-';
    const hh = pad(Math.floor(Math.abs(off) / 60));
    const mm = pad(Math.abs(off) % 60);
    return `${val}:00${sign}${hh}:${mm}`;
  };

  const handlePhotoSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = MAX_PHOTOS - photosPreviews.length;
    const toUpload = files.slice(0, remaining);
    // Add placeholders
    const placeholders = toUpload.map(f => ({ localUrl: URL.createObjectURL(f), uploading: true, cloudUrl: null, error: false }));
    setPhotosPreviews(p => [...p, ...placeholders]);
    // Upload each
    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i];
      const fd = new FormData();
      fd.append('photo', file);
      try {
        const res = await api.uploadPhoto(fd);
        const cloudUrl = res.data?.url;
        setPhotosPreviews(p => p.map((item, idx) =>
          item.localUrl === placeholders[i].localUrl ? { ...item, uploading: false, cloudUrl } : item
        ));
        setForm(p => ({ ...p, photos: [...p.photos, cloudUrl] }));
      } catch(err) {
        showToast('Photo upload failed','error');
        setPhotosPreviews(p => p.map((item) =>
          item.localUrl === placeholders[i].localUrl ? { ...item, uploading: false, error: true } : item
        ));
      }
    }
    e.target.value = '';
  };

  const removePhoto = (idx) => {
    const removed = photosPreviews[idx];
    setPhotosPreviews(p => p.filter((_,i) => i !== idx));
    if (removed.cloudUrl) setForm(p => ({ ...p, photos: p.photos.filter(u => u !== removed.cloudUrl) }));
  };

  const submit = async () => {
    if (!form.title || !form.quantity) return showToast('Title and quantity required','error');
    if (form.tags.length === 0) return showToast('Select at least one tag','error');
    if (!form.expires_at) return showToast('Set expiry time','error');
    if (!form.pickup_before) return showToast('Set pickup deadline','error');
    if (photosPreviews.some(p => p.uploading)) return showToast('Photos still uploading…','error');
    setLoading(true);
    try {
      await api.createListing({ ...form, expires_at: toLocalISO(form.expires_at), pickup_before: toLocalISO(form.pickup_before) });
      showToast('Listing posted!','success');
      navigate('donor-listings');
    } catch(e) { showToast(e.message,'error'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100dvh', background:C.bg, paddingBottom:100 }}>
      <ScreenHeader title="New listing" onBack={() => navigate('donor-listings')} />
      <div style={{ padding:'16px 16px' }}>

        {/* Photos */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:'14px 16px', marginBottom:12 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.textMid, marginBottom:10 }}>PHOTOS</div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {photosPreviews.map((photo, idx) => (
              <div key={idx} style={{ position:'relative', width:72, height:72 }}>
                <img src={photo.localUrl} alt="food"
                  style={{ width:72, height:72, borderRadius:10, objectFit:'cover', border:`1px solid ${photo.error?C.red:C.border}`, opacity: photo.uploading?0.5:1 }} />
                {photo.uploading && (
                  <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.6)', borderRadius:10 }}>
                    <div style={{ width:20, height:20, border:`2px solid ${C.border}`, borderTopColor:C.green, borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
                  </div>
                )}
                {!photo.uploading && (
                  <button onClick={() => removePhoto(idx)}
                    style={{ position:'absolute', top:-6, right:-6, width:20, height:20, borderRadius:'50%', background:C.red, border:'none', color:'#fff', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, lineHeight:1 }}>×</button>
                )}
              </div>
            ))}
            {photosPreviews.length < MAX_PHOTOS && (
              <button onClick={() => fileInputRef.current?.click()}
                style={{ width:72, height:72, borderRadius:10, border:`1.5px dashed ${C.border}`, background:C.surface2, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4, color:C.textLight }}>
                <span style={{ fontSize:22 }}>📷</span>
                <span style={{ fontSize:10, fontWeight:700 }}>Add</span>
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display:'none' }} onChange={handlePhotoSelect} />
          <div style={{ fontSize:11, color:C.textLight, marginTop:8 }}>Up to {MAX_PHOTOS} photos · JPG, PNG, WebP · max 5 MB each</div>
        </div>

        {/* Basics */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:'14px 16px', marginBottom:12 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.textMid, marginBottom:12 }}>BASICS</div>
          <Input label="Title" value={form.title} onChange={set('title')} placeholder="e.g. Fresh dal bhat for 4" required />
          <TextArea label="Description" value={form.description} onChange={set('description')} placeholder="Describe the food…" rows={2} />
          <Input label="Quantity" value={form.quantity} onChange={set('quantity')} placeholder="e.g. Serves 4 · 2 kg" required />
          <Input label="Pickup Instructions" value={form.pickup_instructions} onChange={set('pickup_instructions')} placeholder="e.g. Call before coming" />
          {/* Address / Location picker */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.textMid, marginBottom:6 }}>ADDRESS <span style={{color:C.red}}>*</span></div>
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
        </div>
        {/* Tags */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:'14px 16px', marginBottom:12 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.textMid, marginBottom:10 }}>TAGS <span style={{color:C.red}}>*</span></div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {ALL_TAGS.map(tag => <TagChip key={tag} tag={tag} selected={form.tags.includes(tag)} onClick={() => toggleTag(tag)} />)}
          </div>
        </div>
        {/* Timing */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:'14px 16px', marginBottom:12 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.textMid, marginBottom:12 }}>TIMING</div>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontWeight:700, fontSize:13, color:C.textDark, marginBottom:6 }}>Expires at <span style={{color:C.red}}>*</span></label>
            <input type="datetime-local" value={form.expires_at} min={minExpiry()} onChange={e => set('expires_at')(e.target.value)}
              style={{ width:'100%', height:44, borderRadius:10, border:`1px solid ${C.border}`, padding:'0 12px', fontSize:13, boxSizing:'border-box', outline:'none', color:C.textDark, background:C.surface, fontFamily:'Inter,sans-serif' }} />
          </div>
          <div>
            <label style={{ display:'block', fontWeight:700, fontSize:13, color:C.textDark, marginBottom:6 }}>Pickup before <span style={{color:C.red}}>*</span></label>
            <input type="datetime-local" value={form.pickup_before} min={form.expires_at||minExpiry()} onChange={e => set('pickup_before')(e.target.value)}
              style={{ width:'100%', height:44, borderRadius:10, border:`1px solid ${C.border}`, padding:'0 12px', fontSize:13, boxSizing:'border-box', outline:'none', color:C.textDark, background:C.surface, fontFamily:'Inter,sans-serif' }} />
          </div>
        </div>
      </div>
      <div style={{ position:'fixed', bottom:0, left:0, right:0, background:C.surface, borderTop:`1px solid ${C.border}`, padding:'12px 16px', paddingBottom:'calc(12px + env(safe-area-inset-bottom))' }}>
        <Btn fullWidth size="lg" onClick={submit} disabled={loading || photosPreviews.some(p=>p.uploading)}>
          {loading ? 'Posting…' : photosPreviews.some(p=>p.uploading) ? 'Uploading photos…' : 'Post listing'}
        </Btn>
      </div>
      {showLocationPicker && (
        <LocationPickerModal
          lat={form.latitude} lng={form.longitude} address={form.address}
          onConfirm={(lat, lng, addr) => {
            setForm(p => ({ ...p, latitude: lat, longitude: lng, address: addr }));
            setShowLocationPicker(false);
          }}
          onClose={() => setShowLocationPicker(false)}
        />
      )}
    </div>
  );
}

function DonorListingDetail({ params }) {
  const { navigate, showToast } = React.useContext(AppContext);
  const [listing, setListing] = React.useState(null);
  const [claims, setClaims] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [confirmModal, setConfirmModal] = React.useState(null);

  const load = async () => {
    try {
      const [l, c] = await Promise.all([api.getDonorListing(params.id), api.getListingClaims(params.id)]);
      setListing(l.data);
      setClaims(Array.isArray(c.data) ? c.data : []);
    } catch(e) { showToast(e.message,'error'); }
    finally { setLoading(false); }
  };
  React.useEffect(() => { load(); }, [params.id]);

  const doConfirm = async (claimId) => {
    try {
      await api.confirmClaim(params.id, claimId);
      showToast('Claim confirmed!','success');
      load();
    } catch(e) { showToast(e.message,'error'); }
  };
  const doReject = async (claimId) => {
    try {
      await api.rejectClaim(params.id, claimId);
      showToast('Claim rejected','success');
      load();
    } catch(e) { showToast(e.message,'error'); }
  };
  const doCancel = async () => {
    try {
      await api.cancelListing(params.id);
      showToast('Listing cancelled','success');
      navigate('donor-listings');
    } catch(e) { showToast(e.message,'error'); }
  };
  const doReopen = async () => {
    try {
      await api.reopenListing(params.id);
      showToast('Listing reopened','success');
      load();
    } catch(e) { showToast(e.message,'error'); }
  };

  if (loading) return <div style={{minHeight:'100dvh',display:'flex',alignItems:'center',justifyContent:'center'}}><Spinner /></div>;
  if (!listing) return <EmptyState icon="❌" title="Listing not found" />;

  const pending = claims.filter(c=>c.status==='pending');
  const confirmed = claims.find(c=>c.status==='confirmed');

  return (
    <div style={{ minHeight:'100dvh', background:C.bg, paddingBottom:100 }}>
      <ScreenHeader title={listing.title} onBack={() => navigate('donor-listings')} />
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
        <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:12, flexWrap:'wrap' }}>
          <StatusBadge status={listing.status} />
          {listing.quantity && <span style={{ fontSize:13, color:C.textMid }}>{listing.quantity}</span>}
        </div>
        {/* Info card */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 14px', marginBottom:12 }}>
          <div style={{ fontSize:13, color:C.textMid, marginBottom:6 }}>📍 {listing.address}</div>
          {listing.expires_at && <div style={{ fontSize:13, color:C.textMid, marginBottom:6 }}>⏱ Expires {new Date(listing.expires_at).toLocaleString('en-US',{weekday:'short',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</div>}
          {listing.pickup_before && <div style={{ fontSize:13, color:C.textMid }}>🚶 Pickup before {new Date(listing.pickup_before).toLocaleString('en-US',{weekday:'short',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</div>}
        </div>
        {/* Claims */}
        {listing.status === 'active' && (
          <div>
            <div style={{ fontWeight:700, fontSize:15, color:C.textDark, marginBottom:10 }}>Pending requests ({pending.length})</div>
            {pending.length === 0 ? <div style={{ fontSize:13, color:C.textMid, marginBottom:12 }}>No requests yet.</div>
              : pending.map(claim => (
                <div key={claim.id} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 14px', marginBottom:10 }}>
                  <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:8 }}>
                    <Avatar name={claim.recipient?.name} size={40} />
                    <div>
                      <div style={{ fontWeight:700, fontSize:14, color:C.textDark }}>{claim.recipient?.name}</div>
                      {claim.recipient?.is_verified && <div style={{ fontSize:11, color:C.green }}>✓ Verified</div>}
                    </div>
                    <StatusBadge status={claim.status} />
                  </div>
                  {claim.note && <div style={{ fontSize:12, color:C.textMid, marginBottom:10 }}>{claim.note}</div>}
                  <div style={{ display:'flex', gap:8 }}>
                    <Btn size="sm" onClick={() => doConfirm(claim.id)} style={{ background:C.green, color:'#fff', flex:1 }}>✓ Confirm</Btn>
                    <Btn size="sm" variant="outline" onClick={() => doReject(claim.id)} style={{ flex:1 }}>
                      <span style={{color:C.red}}>✗ Reject</span>
                    </Btn>
                  </div>
                </div>
              ))
            }
          </div>
        )}
        {confirmed && (
          <div style={{ background:C.tagGreen, border:`1px solid ${C.green}`, borderRadius:12, padding:'12px 14px', marginBottom:12 }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.green, marginBottom:6 }}>CONFIRMED RECIPIENT</div>
            <div style={{ display:'flex', gap:10, alignItems:'center' }}>
              <Avatar name={confirmed.recipient?.name} size={40} color={C.green} />
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:C.textDark }}>{confirmed.recipient?.name}</div>
                {confirmed.note && <div style={{ fontSize:12, color:C.textMid }}>{confirmed.note}</div>}
              </div>
            </div>
            {listing.status === 'claimed' && (
              <Btn size="sm" onClick={() => setConfirmModal({ type:'reopen' })} style={{ marginTop:10, background:C.amber, color:'#fff' }}>Reopen listing</Btn>
            )}
          </div>
        )}
      </div>
      {/* Bottom bar */}
      {(listing.status==='active'||listing.status==='claimed') && (
        <div style={{ position:'fixed', bottom:0, left:0, right:0, background:C.surface, borderTop:`1px solid ${C.border}`, padding:'12px 16px', paddingBottom:'calc(12px + env(safe-area-inset-bottom))' }}>
          <Btn fullWidth variant="outline" onClick={() => setConfirmModal({ type:'cancel' })} style={{ border:`1px solid ${C.border}` }}>
            <span style={{color:C.red}}>🗑 Cancel listing</span>
          </Btn>
        </div>
      )}
      {confirmModal?.type==='cancel' && <ConfirmModal title="Cancel listing?" message="This will notify the recipient if already claimed." confirmLabel="Cancel listing" danger onConfirm={doCancel} onCancel={() => setConfirmModal(null)} />}
      {confirmModal?.type==='reopen' && <ConfirmModal title="Reopen listing?" message="All claims will be restored to pending." confirmLabel="Reopen" onConfirm={doReopen} onCancel={() => setConfirmModal(null)} />}
    </div>
  );
}

function DonorMap() {
  const { navigate, user, showToast } = React.useContext(AppContext);
  const [requests, setRequests] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState('');
  const [offerNote, setOfferNote] = React.useState('');
  const [offerTarget, setOfferTarget] = React.useState(null);
  const mapRef = React.useRef();
  const mapInstance = React.useRef();

  const lat = user?.latitude || 27.7172, lng = user?.longitude || 85.3240;

  const load = async () => {
    setLoading(true);
    try {
      const q = `?lat=${lat}&lng=${lng}&radius=5${filter?`&status=${filter}`:''}`;
      const res = await api.getDonorRequests(q);
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch(e) { showToast(e.message,'error'); }
    finally { setLoading(false); }
  };
  React.useEffect(() => { load(); }, [filter]);

  React.useEffect(() => {
    if (!window.L || mapInstance.current) return;
    const map = window.L.map(mapRef.current, { center:[lat,lng], zoom:14, zoomControl:false });
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{ attribution:'© OSM' }).addTo(map);
    mapInstance.current = map;
  }, []);

  React.useEffect(() => {
    if (!mapInstance.current || !window.L) return;
    mapInstance.current.eachLayer(l => { if (l instanceof window.L.Marker) mapInstance.current.removeLayer(l); });
    requests.forEach(r => {
      if (r.latitude && r.longitude) {
        window.L.circleMarker([r.latitude,r.longitude],{ radius:10, color:C.green, fillColor:C.green, fillOpacity:0.9 })
          .bindPopup(`<b>${r.title}</b><br>${r.quantity_needed||''}<br><small>${r.address||''}</small>`)
          .addTo(mapInstance.current);
      }
    });
  }, [requests]);

  const offerHelp = async () => {
    if (!offerTarget) return;
    try {
      await api.acceptRequest(offerTarget.id, { note:offerNote });
      showToast('Offer sent!','success');
      setOfferTarget(null); setOfferNote('');
      load();
    } catch(e) { showToast(e.message,'error'); }
  };

  return (
    <div style={{ height:'100dvh', display:'flex', flexDirection:'column', background:C.bg }}>
      {/* Header */}
      <div style={{ padding:'calc(env(safe-area-inset-top) + 12px) 16px 10px', background:C.bg }}>
        <div style={{ fontWeight:700, fontSize:20, color:C.textDark, marginBottom:10 }}>Nearby Requests</div>
        <div style={{ display:'flex', gap:8 }}>
          {[{k:'',l:'All'},{k:'human',l:'Human'},{k:'animal',l:'Animal'}].map(f=>(
            <button key={f.k} onClick={()=>setFilter(f.k)} style={{ padding:'6px 16px', borderRadius:99, border: filter===f.k?`1px solid ${C.green}`:'1px solid '+C.border, background: filter===f.k?C.green:C.surface, color: filter===f.k?'#fff':C.textDark, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>{f.l}</button>
          ))}
        </div>
      </div>
      {/* Map */}
      <div ref={mapRef} style={{ flex:'0 0 280px', background:C.surface2 }}>
        {!window.L && <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:C.textMid,fontSize:13}}>🗺 Map loading…</div>}
      </div>
      {/* List */}
      <div style={{ flex:1, overflowY:'auto', padding:'0 16px 80px' }}>
        <div style={{ fontWeight:700, fontSize:15, color:C.textDark, padding:'14px 0 8px' }}>Nearby Requests</div>
        {loading ? <Spinner /> : requests.length===0 ? <EmptyState icon="🔍" title="No requests nearby" />
          : requests.map(r => (
            <div key={r.id} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 14px', marginBottom:10, display:'flex', gap:12, alignItems:'center' }}>
              <Avatar name={r.recipient?.name} size={44} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:14, color:C.textDark }}>{r.recipient?.name}</div>
                <div style={{ display:'flex', gap:6, marginBottom:4 }}>
                  {r.distance_km!=null && <span style={{ fontSize:10, fontWeight:700, color:C.green, background:C.tagGreen, padding:'2px 8px', borderRadius:99 }}>{r.distance_km.toFixed(1)} km</span>}
                </div>
                <div style={{ fontSize:12, color:C.textMid }}>{r.title} · {r.quantity_needed}</div>
              </div>
              <Btn size="sm" onClick={() => setOfferTarget(r)} style={{ background:C.green, color:'#fff', flexShrink:0 }}>Offer Help</Btn>
            </div>
          ))
        }
      </div>
      <DonorNav active="donor-map" navigate={navigate} />
      {offerTarget && (
        <BottomSheet title={`Offer to: ${offerTarget.recipient?.name}`} onClose={() => setOfferTarget(null)}>
          <div style={{ padding:'0 20px 20px' }}>
            <div style={{ fontSize:14, color:C.textMid, marginBottom:14 }}>{offerTarget.title} · {offerTarget.quantity_needed}</div>
            <TextArea label="Note (optional)" value={offerNote} onChange={setOfferNote} placeholder="I can deliver tomorrow morning…" rows={3} />
            <Btn fullWidth size="lg" onClick={offerHelp} style={{ background:C.green, color:'#fff' }}>Send Offer</Btn>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}

function DonorNotifications() {
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
      const res = await api.getNotifications(`?page=${p}&per_page=${PER_PAGE}`);
      setItems(res.data?.items || []);
      setUnread(res.data?.unread_count || 0);
      setMeta(res.data?.meta || null);
    } catch(e) { showToast(e.message,'error'); }
    finally { setLoading(false); }
  };
  React.useEffect(() => { load(page); }, [page]);

  // Clear badge when screen is open
  React.useEffect(() => { setUnreadCount(0); }, []);

  const markAllRead = async () => {
    try { await api.markAllRead(); load(page); }
    catch(e) { showToast(e.message,'error'); }
  };
  const markRead = async (id) => {
    try { await api.markNotificationRead(id); load(page); }
    catch(e) {}
  };

  const icons = { claim_received:'🍱', claim_confirmed:'✅', claim_rejected:'❌', pickup_completed:'🎉', listing_expired_uncollected:'⏰', request_accepted:'🤝', acceptance_confirmed:'✅', acceptance_rejected:'❌', listing_cancelled:'🗑', listing_reopened:'🔄' };

  const lastPage = meta?.last_page || 1;
  const total = meta?.total || 0;

  return (
    <div style={{ minHeight:'100dvh', background:C.bg, paddingBottom:'calc(80px + env(safe-area-inset-bottom))' }}>
      <div style={{ padding:'calc(env(safe-area-inset-top) + 12px) 16px 10px', display:'flex', justifyContent:'space-between', alignItems:'center', background:C.bg }}>
        <div>
          <div style={{ fontWeight:700, fontSize:20, color:C.textDark }}>Notifications</div>
          {unread>0 && <div style={{ fontSize:12, color:C.textMid }}>{unread} unread</div>}
        </div>
        {unread>0 && <Btn size="sm" onClick={markAllRead} style={{ background:C.green, color:'#fff' }}>✓✓ Mark all read</Btn>}
      </div>
      <div style={{ padding:'0 16px' }}>
        {loading ? <Spinner /> : items.length===0 ? <EmptyState icon="🔔" title="No notifications" />
          : items.map(n => (
            <div key={n.id} onClick={() => markRead(n.id)}
              style={{ background: !n.read_at?C.tagGreen:C.surface, border:`1px solid ${!n.read_at?C.green:C.border}`, borderRadius:16, padding:'12px 14px', marginBottom:10, display:'flex', gap:12, alignItems:'flex-start', cursor:'pointer', position:'relative' }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background: !n.read_at?C.green:C.surface2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                {icons[n.type]||'🔔'}
              </div>
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
      <DonorNav active="donor-notifications" navigate={navigate} />
    </div>
  );
}

function DonorProfile() {
  const { navigate, user, setUser, showToast } = React.useContext(AppContext);
  const [stats, setStats] = React.useState(null);
  const [confirmLogout, setConfirmLogout] = React.useState(false);

  React.useEffect(() => {
    api.getDonorStats().then(r => setStats(r.data)).catch(()=>{});
  }, []);

  const logout = async () => {
    try { await api.logout(); } catch {}
    api.clearTokens();
    localStorage.removeItem('fl_role');
    localStorage.removeItem('fl_user');
    setUser(null);
    navigate('splash');
  };

  return (
    <div style={{ minHeight:'100dvh', background:C.bg, paddingBottom:'calc(80px + env(safe-area-inset-bottom))' }}>
      {/* Green header */}
      <div style={{ background:`linear-gradient(${C.green} 0%, ${C.greenDark} 100%)`, padding:'calc(env(safe-area-inset-top) + 12px) 16px 80px' }}>
        <div style={{ fontWeight:700, fontSize:20, color:'#fff' }}>Profile</div>
      </div>
      {/* Profile card */}
      <div style={{ padding:'0 16px', marginTop:-52 }}>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:24, padding:'16px 16px', marginBottom:16 }}>
          <div style={{ display:'flex', gap:14, alignItems:'center', marginBottom:14 }}>
            <Avatar name={user?.name} size={64} color={C.green} />
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:17, color:C.textDark }}>{user?.name}</div>
              <div style={{ display:'inline-block', background:C.tagGreen, borderRadius:99, padding:'3px 12px', fontSize:11, fontWeight:700, color:C.green, marginTop:4 }}>Donor</div>
            </div>
            <button onClick={() => navigate('donor-edit-profile')} style={{ width:36, height:36, borderRadius:'50%', background:C.surface2, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>✏️</button>
          </div>
          <div style={{ background:C.surface2, borderRadius:8, padding:'6px 10px', marginBottom:6, fontSize:12, color:C.textDark }}>✉ {user?.email}</div>
          <div style={{ background:C.surface2, borderRadius:8, padding:'6px 10px', fontSize:12, color:C.textDark }}>📞 {user?.contact||'–'}</div>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:'14px 16px', marginBottom:16 }}>
            <div style={{ fontSize:10, fontWeight:700, color:C.textMid, marginBottom:12 }}>IMPACT</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
              {[
                {label:'Completed', val:stats.listings_completed},
                {label:'Recipients', val:stats.unique_recipients_served},
                {label:'Active', val:stats.listings_active},
              ].map(s => (
                <div key={s.label} style={{ textAlign:'center', background:C.bg, borderRadius:12, padding:'10px 8px' }}>
                  <div style={{ fontWeight:700, fontSize:22, color:C.green }}>{s.val}</div>
                  <div style={{ fontSize:10, color:C.textMid, fontWeight:600 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Account */}
        <div style={{ fontSize:10, fontWeight:700, color:C.textMid, marginBottom:8 }}>ACCOUNT</div>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, overflow:'hidden', marginBottom:16 }}>
          {[
            { label:'Edit profile', action: () => navigate('donor-edit-profile') },
            { label:'About FeedLink', action: ()=>{} },
          ].map((item, i, arr) => (
            <div key={item.label}>
              <div onClick={item.action} style={{ padding:'16px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer' }}>
                <span style={{ fontWeight:700, fontSize:14, color:C.textDark }}>{item.label}</span>
                <span style={{ fontSize:18, color:C.textLight }}>›</span>
              </div>
              {i < arr.length-1 && <div style={{ height:1, background:C.border, margin:'0 16px' }} />}
            </div>
          ))}
        </div>

        <Btn fullWidth variant="danger" size="lg" onClick={() => setConfirmLogout(true)}>Log out</Btn>
      </div>
      <DonorNav active="donor-profile" navigate={navigate} />
      {confirmLogout && <ConfirmModal title="Log out?" message="You will need to log in again." confirmLabel="Log out" danger onConfirm={logout} onCancel={() => setConfirmLogout(false)} />}
    </div>
  );
}

function DonorEditProfile() {
  const { navigate, user, setUser, showToast } = React.useContext(AppContext);
  const [form, setForm] = React.useState({ name: user?.name||'', contact: user?.contact||'' });
  const [loading, setLoading] = React.useState(false);
  const set = k => v => setForm(p=>({...p,[k]:v}));
  const submit = async () => {
    setLoading(true);
    try {
      const res = await api.updateProfile(form);
      localStorage.setItem('fl_user', JSON.stringify(res.data));
      setUser(res.data);
      showToast('Profile updated!','success');
      navigate('donor-profile');
    } catch(e) { showToast(e.message,'error'); }
    finally { setLoading(false); }
  };
  return (
    <div style={{ minHeight:'100dvh', background:C.bg, paddingBottom:100 }}>
      <ScreenHeader title="Edit Profile" onBack={() => navigate('donor-profile')} />
      <div style={{ padding:'20px 24px' }}>
        <Input label="Full Name" value={form.name} onChange={set('name')} placeholder="Your name" />
        <Input label="Phone Number" value={form.contact} onChange={set('contact')} placeholder="98XXXXXXXX" />
        <Btn fullWidth size="lg" onClick={submit} disabled={loading} style={{ marginTop:8 }}>{loading?'Saving…':'Save Changes'}</Btn>
      </div>
    </div>
  );
}

Object.assign(window, { DonorHome, DonorListings, CreateListing, DonorListingDetail, DonorMap, DonorNotifications, DonorProfile, DonorEditProfile });
