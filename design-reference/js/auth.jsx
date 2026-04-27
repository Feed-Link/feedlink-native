// Auth Screens for FeedLink PWA

function SplashScreen() {
  const { navigate } = React.useContext(AppContext);
  React.useEffect(() => {
    const t = setTimeout(() => {
      const token = api.getToken();
      const role = localStorage.getItem('fl_role');
      if (token && role) navigate(role === 'donor' ? 'donor-home' : 'recipient-home');
      else navigate('onboarding');
    }, 2000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{ height:'100dvh', background:`linear-gradient(${C.green} 0%, ${C.greenDark} 100%)`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <div style={{ width:96, height:96, borderRadius:24, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:48 }}>🌿</div>
      <div style={{ fontWeight:800, fontSize:32, color:'#fff', letterSpacing:-1 }}>FeedLink</div>
      <div style={{ fontSize:14, color:'rgba(255,255,255,0.8)', textAlign:'center', maxWidth:260 }}>Share food. Reduce waste. Feed your community.</div>
      <div style={{ marginTop:32, width:36, height:36, border:'3px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
    </div>
  );
}

function OnboardingScreen() {
  const { navigate } = React.useContext(AppContext);
  const [role, setRole] = React.useState('donor');
  return (
    <div style={{ minHeight:'100dvh', background:C.bg, display:'flex', flexDirection:'column', padding:'60px 24px 40px' }}>
      <div style={{ fontWeight:700, fontSize:26, color:C.textDark, marginBottom:6 }}>I want to…</div>
      <div style={{ fontSize:14, color:C.textMid, marginBottom:32 }}>Pick how you'd like to use FeedLink.</div>
      <div style={{ display:'flex', flexDirection:'column', gap:14, flex:1 }}>
        {[
          { value:'donor', title:'Donate Food', sub:'I have surplus food to share', icon:'🍱' },
          { value:'recipient', title:'Receive Food', sub:"I'm looking for food for my community", icon:'🤲' },
        ].map(opt => (
          <div key={opt.value} onClick={() => setRole(opt.value)}
            style={{ borderRadius:20, border:`2px solid ${role===opt.value?C.amber:C.border}`, background:role===opt.value?'rgba(245,158,11,0.04)':C.surface, padding:20, cursor:'pointer', position:'relative', display:'flex', gap:16, alignItems:'center' }}>
            <div style={{ width:56, height:56, borderRadius:16, background: role===opt.value?'rgba(245,158,11,0.12)':C.surface2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, flexShrink:0 }}>{opt.icon}</div>
            <div>
              <div style={{ fontWeight:700, fontSize:17, color:C.textDark }}>{opt.title}</div>
              <div style={{ fontSize:13, color:C.textMid, marginTop:4 }}>{opt.sub}</div>
            </div>
            {role===opt.value && <div style={{ position:'absolute', right:16, top:16, width:24, height:24, borderRadius:'50%', background:C.amber, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff' }}>✓</div>}
          </div>
        ))}
      </div>
      <div style={{ marginTop:'auto', paddingTop:32 }}>
        <Btn fullWidth size="lg" variant="amber" onClick={() => navigate('register', { role })}>Continue →</Btn>
        <p style={{ textAlign:'center', fontSize:14, color:C.textMid, marginTop:16 }}>
          Already have an account?{' '}
          <span style={{ color:C.amber, fontWeight:700, cursor:'pointer' }} onClick={() => navigate('login')}>Log in</span>
        </p>
      </div>
    </div>
  );
}

function RegisterScreen({ params }) {
  const { navigate, showToast } = React.useContext(AppContext);
  const role = params?.role || 'donor';
  const [form, setForm] = React.useState({ name:'', email:'', contact:'', password:'', terms:false });
  const [loading, setLoading] = React.useState(false);
  const set = k => v => setForm(p => ({ ...p, [k]:v }));
  const submit = async () => {
    if (!form.name || !form.email || !form.contact || !form.password) return showToast('Please fill all fields','error');
    if (!form.terms) return showToast('Please accept the terms','error');
    if (form.contact.length > 10) return showToast('Contact max 10 digits','error');
    setLoading(true);
    try {
      await api.register({ name:form.name, email:form.email, contact:form.contact, password:form.password, role, location:{ lat:27.7172, long:85.3240 }, terms_accepted:true });
      showToast('Registered! Check your email for OTP.','success');
      navigate('verify-otp', { email:form.email, context:'register', role });
    } catch(e) { showToast(e.message,'error'); }
    finally { setLoading(false); }
  };
  return (
    <div style={{ minHeight:'100dvh', background:C.bg }}>
      <ScreenHeader title="Create Account" onBack={() => navigate('onboarding')} />
      <div style={{ padding:'20px 24px 100px' }}>
        <div style={{ display:'inline-block', background:C.tagAmber, borderRadius:99, padding:'5px 14px', fontSize:12, fontWeight:700, color:'rgb(136,100,18)', marginBottom:24 }}>
          Signing up as {role === 'donor' ? 'Donor' : 'Recipient'}
        </div>
        <Input label="Full Name" value={form.name} onChange={set('name')} placeholder="Samaya Mahate" required />
        <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="hello@example.com" required />
        <Input label="Phone Number" value={form.contact} onChange={set('contact')} placeholder="98XXXXXXXX" required />
        <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Min 6 characters" required />
        <label style={{ display:'flex', gap:10, alignItems:'flex-start', cursor:'pointer', marginBottom:24 }}>
          <input type="checkbox" checked={form.terms} onChange={e => set('terms')(e.target.checked)} style={{ marginTop:2, flexShrink:0, width:18, height:18, accentColor:C.green }} />
          <span style={{ fontSize:12, color:C.textDark }}>I agree to the <span style={{color:C.green,fontWeight:700}}>Terms & Conditions</span> and <span style={{color:C.green,fontWeight:700}}>Privacy Policy</span>.</span>
        </label>
        <Btn fullWidth size="lg" variant="amber" onClick={submit} disabled={loading}>{loading ? 'Creating…' : 'Create Account'}</Btn>
        <p style={{ textAlign:'center', fontSize:14, color:C.textMid, marginTop:20 }}>
          Already have an account?{' '}
          <span style={{ color:C.amber, fontWeight:700, cursor:'pointer' }} onClick={() => navigate('login')}>Log in</span>
        </p>
      </div>
    </div>
  );
}

function VerifyOTPScreen({ params }) {
  const { navigate, showToast } = React.useContext(AppContext);
  const email = params?.email || '';
  const context = params?.context || 'register';
  const role = params?.role;
  const [otp, setOtp] = React.useState(['','','','','','']);
  const [loading, setLoading] = React.useState(false);
  const [resendTimer, setResendTimer] = React.useState(45);
  const refs = Array.from({length:6}, () => React.useRef());
  React.useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(p => p-1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);
  const handleChange = (i, v) => {
    const val = v.replace(/\D/,'').slice(0,1);
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 5) refs[i+1].current?.focus();
  };
  const handleKey = (i, e) => { if (e.key==='Backspace' && !otp[i] && i>0) refs[i-1].current?.focus(); };
  const submit = async () => {
    const code = otp.join('');
    if (code.length < 6) return showToast('Enter full 6-digit code','error');
    setLoading(true);
    try {
      const res = context === 'reset'
        ? await api.resetPassword({ email, otp:code, password:params.password, password_confirmation:params.password })
        : await api.verifyOtp({ email, otp:code });
      if (res.data?.access_token) {
        api.setTokens(res.data.access_token, res.data.refresh_token);
        const profile = await api.getProfile();
        const userRole = profile.data?.roles?.[0] || role || 'donor';
        localStorage.setItem('fl_role', userRole);
        localStorage.setItem('fl_user', JSON.stringify(profile.data));
        showToast('Welcome to FeedLink!', 'success');
        navigate(userRole === 'donor' ? 'donor-home' : 'recipient-home');
      } else {
        showToast('Verified!', 'success');
        navigate('login');
      }
    } catch(e) { showToast(e.message,'error'); }
    finally { setLoading(false); }
  };
  const resend = async () => {
    try { await api.resendOtp({ email }); setResendTimer(45); showToast('Code resent!','success'); }
    catch(e) { showToast(e.message,'error'); }
  };
  return (
    <div style={{ minHeight:'100dvh', background:C.bg }}>
      <ScreenHeader title="Verify Email" onBack={() => navigate(context==='reset'?'forgot-password':context==='login'?'login':'register')} />
      <div style={{ padding:'32px 24px' }}>
        <div style={{ fontWeight:700, fontSize:22, color:C.textDark, marginBottom:8 }}>Verify your email</div>
        <div style={{ fontSize:14, color:C.textMid, marginBottom:32 }}>We sent a 6-digit code to <strong>{email}</strong></div>
        <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:32 }}>
          {otp.map((v,i) => (
            <input key={i} ref={refs[i]} maxLength={1} value={v} onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKey(i,e)}
              style={{ width:46, height:60, borderRadius:12, border:`2px solid ${v?C.amber:C.border}`, textAlign:'center', fontSize:22, fontWeight:700, color:C.textDark, background:C.surface, outline:'none', fontFamily:'Inter,sans-serif' }} />
          ))}
        </div>
        <Btn fullWidth size="lg" variant="amber" onClick={submit} disabled={loading}>{loading?'Verifying…':'Verify'}</Btn>
        <p style={{ textAlign:'center', fontSize:14, marginTop:20 }}>
          {resendTimer > 0
            ? <span style={{ color:C.textMid, fontWeight:700 }}>Resend code in {resendTimer}s</span>
            : <span style={{ color:C.amber, fontWeight:700, cursor:'pointer' }} onClick={resend}>Resend code</span>}
        </p>
      </div>
    </div>
  );
}

function LoginScreen() {
  const { navigate, showToast, setUser } = React.useContext(AppContext);
  const [form, setForm] = React.useState({ email:'', password:'' });
  const [loading, setLoading] = React.useState(false);
  const set = k => v => setForm(p => ({...p,[k]:v}));
  const submit = async () => {
    if (!form.email || !form.password) return showToast('Please fill all fields','error');
    setLoading(true);
    try {
      const res = await api.login({ email:form.email, password:form.password });
      api.setTokens(res.data.access_token, res.data.refresh_token);
      const profile = await api.getProfile();
      const role = profile.data?.roles?.[0] || 'donor';
      localStorage.setItem('fl_role', role);
      localStorage.setItem('fl_user', JSON.stringify(profile.data));
      setUser(profile.data);
      navigate(role === 'donor' ? 'donor-home' : 'recipient-home');
    } catch(e) {
      // If login fails because email is not verified, send OTP and redirect to verify screen
      const msg = (e.message || '').toLowerCase();
      const isUnverified = msg.includes('verif') || msg.includes('not verified') || msg.includes('email');
      if (isUnverified && form.email) {
        try { await api.resendOtp({ email: form.email }); } catch(_) {}
        showToast('Please verify your email first. A code has been sent.', 'error');
        navigate('verify-otp', { email: form.email, context: 'login' });
      } else {
        showToast(e.message, 'error');
      }
    }
    finally { setLoading(false); }
  };
  return (
    <div style={{ minHeight:'100dvh', background:C.bg }}>
      <div style={{ padding:'60px 24px 40px', display:'flex', flexDirection:'column', alignItems:'center' }}>
        <div style={{ width:64, height:64, borderRadius:16, background:C.amber, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, marginBottom:20 }}>🌿</div>
        <div style={{ fontWeight:700, fontSize:26, color:C.textDark, marginBottom:4 }}>Welcome back</div>
        <div style={{ fontSize:14, color:C.textMid, marginBottom:32 }}>Log in to your FeedLink account</div>
        <div style={{ width:'100%' }}>
          <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="hello@example.com" />
          <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder="••••••••••" />
          <div style={{ textAlign:'right', marginTop:-8, marginBottom:20 }}>
            <span style={{ fontSize:14, fontWeight:700, color:C.amber, cursor:'pointer' }} onClick={() => navigate('forgot-password')}>Forgot password?</span>
          </div>
          <Btn fullWidth size="lg" variant="amber" onClick={submit} disabled={loading}>{loading?'Logging in…':'Log In'}</Btn>
          <p style={{ textAlign:'center', fontSize:14, color:C.textMid, marginTop:20 }}>
            Don't have an account?{' '}
            <span style={{ color:C.amber, fontWeight:700, cursor:'pointer' }} onClick={() => navigate('onboarding')}>Sign up</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function ForgotPasswordScreen() {
  const { navigate, showToast } = React.useContext(AppContext);
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const submit = async () => {
    if (!email) return showToast('Enter your email','error');
    setLoading(true);
    try {
      await api.forgotPassword({ email });
      showToast('Reset code sent!','success');
      navigate('reset-password', { email });
    } catch(e) { showToast(e.message,'error'); }
    finally { setLoading(false); }
  };
  return (
    <div style={{ minHeight:'100dvh', background:C.bg }}>
      <ScreenHeader title="Reset Password" onBack={() => navigate('login')} />
      <div style={{ padding:'32px 24px' }}>
        <div style={{ fontWeight:700, fontSize:22, color:C.textDark, marginBottom:8 }}>Reset Password</div>
        <div style={{ fontSize:14, color:C.textMid, marginBottom:32 }}>Enter your email and we'll send you a reset code.</div>
        <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="hello@example.com" />
        <Btn fullWidth size="lg" variant="amber" onClick={submit} disabled={loading}>{loading?'Sending…':'Send Reset Code'}</Btn>
      </div>
    </div>
  );
}

function ResetPasswordScreen({ params }) {
  const { navigate, showToast } = React.useContext(AppContext);
  const [form, setForm] = React.useState({ otp:'', password:'', confirm:'' });
  const [loading, setLoading] = React.useState(false);
  const set = k => v => setForm(p=>({...p,[k]:v}));
  const submit = async () => {
    if (!form.otp || !form.password || !form.confirm) return showToast('Fill all fields','error');
    if (form.password !== form.confirm) return showToast('Passwords do not match','error');
    if (form.password.length < 6) return showToast('Password min 6 characters','error');
    setLoading(true);
    try {
      const res = await api.resetPassword({ email:params?.email, otp:form.otp, password:form.password, password_confirmation:form.confirm });
      if (res.data?.access_token) {
        api.setTokens(res.data.access_token, res.data.refresh_token);
        const profile = await api.getProfile();
        const role = profile.data?.roles?.[0] || 'donor';
        localStorage.setItem('fl_role', role);
        localStorage.setItem('fl_user', JSON.stringify(profile.data));
        showToast('Password reset!','success');
        navigate(role==='donor'?'donor-home':'recipient-home');
      }
    } catch(e) { showToast(e.message,'error'); }
    finally { setLoading(false); }
  };
  return (
    <div style={{ minHeight:'100dvh', background:C.bg }}>
      <ScreenHeader title="Create New Password" onBack={() => navigate('forgot-password')} />
      <div style={{ padding:'32px 24px' }}>
        <div style={{ fontWeight:700, fontSize:22, color:C.textDark, marginBottom:8 }}>Create New Password</div>
        <div style={{ fontSize:14, color:C.textMid, marginBottom:24 }}>Enter the 6-digit code from your email.</div>
        <div style={{ marginBottom:20 }}>
          <label style={{ display:'block', fontWeight:700, fontSize:13, color:C.textDark, marginBottom:6 }}>OTP Code</label>
          <input maxLength={6} value={form.otp} onChange={e => set('otp')(e.target.value.replace(/\D/,''))}
            placeholder="000000" style={{ width:'100%', height:48, borderRadius:12, border:`1px solid ${C.border}`, background:C.surface, padding:'0 14px', fontSize:18, fontWeight:700, textAlign:'center', letterSpacing:8, boxSizing:'border-box', outline:'none', fontFamily:'Inter,sans-serif' }} />
        </div>
        <Input label="New Password" type="password" value={form.password} onChange={set('password')} placeholder="Min 6 characters" />
        <Input label="Confirm Password" type="password" value={form.confirm} onChange={set('confirm')} placeholder="Repeat password" />
        <Btn fullWidth size="lg" variant="amber" onClick={submit} disabled={loading}>{loading?'Resetting…':'Reset Password'}</Btn>
      </div>
    </div>
  );
}

Object.assign(window, { SplashScreen, OnboardingScreen, RegisterScreen, VerifyOTPScreen, LoginScreen, ForgotPasswordScreen, ResetPasswordScreen });
