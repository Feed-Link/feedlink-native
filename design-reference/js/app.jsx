// Main App Router for FeedLink PWA

function App() {
  const [screen, setScreen] = React.useState('splash');
  const [params, setParams] = React.useState({});
  const [user, setUser] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('fl_user')); } catch { return null; }
  });
  const [toasts, showToast] = useToast();
  const [unreadCount, setUnreadCount] = React.useState(0);
  const pollRef = React.useRef(null);
  const prevUnreadRef = React.useRef(0);

  const navigate = React.useCallback((s, p = {}) => {
    setScreen(s);
    setParams(p);
    window.scrollTo(0, 0);
  }, []);

  // ── Notification polling ──────────────────────────────────────
  const POLL_INTERVAL = 30000; // 30 seconds

  const pollNotifications = React.useCallback(async () => {
    if (!api.getToken()) return;
    try {
      const res = await api.getNotifications('?per_page=1');
      const count = res.data?.unread_count || 0;
      setUnreadCount(count);
      // Toast only when count increased AND user is not on notifications screen
      if (count > prevUnreadRef.current && !['donor-notifications','recipient-notifications'].includes(screen)) {
        const latest = res.data?.items?.[0];
        if (latest && !latest.read_at) showToast(latest.title || 'New notification', 'info');
      }
      prevUnreadRef.current = count;
    } catch {}
  }, [screen]);

  React.useEffect(() => {
    const token = api.getToken();
    const authScreens = ['splash','onboarding','login','register','verify-otp','forgot-password','reset-password'];
    if (!token || authScreens.includes(screen)) {
      clearInterval(pollRef.current);
      return;
    }
    // Immediate poll on screen change
    pollNotifications();
    // Start interval
    clearInterval(pollRef.current);
    pollRef.current = setInterval(pollNotifications, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [screen, pollNotifications]);
  // ─────────────────────────────────────────────────────────────

  // Handle back-button for Android PWA
  React.useEffect(() => {
    const handler = (e) => {
      const authScreens = ['splash','onboarding','login','register','verify-otp','forgot-password','reset-password'];
      const homeScreens = ['donor-home','recipient-home'];
      if (homeScreens.includes(screen) || authScreens.includes(screen)) {
        // Let the system handle it (close app)
      } else {
        e.preventDefault();
        const role = localStorage.getItem('fl_role');
        navigate(role === 'donor' ? 'donor-home' : 'recipient-home');
      }
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [screen]);

  // Register logout handler for token expiry
  React.useEffect(() => {
    window.__feedlinkLogout = () => {
      clearInterval(pollRef.current);
      setUser(null);
      navigate('login');
    };
    return () => { delete window.__feedlinkLogout; };
  }, []);

  const ctx = { navigate, user, setUser, showToast, unreadCount, setUnreadCount };

  const screenMap = {
    // Auth
    'splash': <SplashScreen />,
    'onboarding': <OnboardingScreen />,
    'register': <RegisterScreen params={params} />,
    'verify-otp': <VerifyOTPScreen params={params} />,
    'login': <LoginScreen />,
    'forgot-password': <ForgotPasswordScreen />,
    'reset-password': <ResetPasswordScreen params={params} />,
    // Donor
    'donor-home': <DonorHome />,
    'donor-listings': <DonorListings />,
    'create-listing': <CreateListing />,
    'donor-listing-detail': <DonorListingDetail params={params} />,
    'donor-map': <DonorMap />,
    'donor-notifications': <DonorNotifications />,
    'donor-profile': <DonorProfile />,
    'donor-edit-profile': <DonorEditProfile />,
    // Recipient
    'recipient-home': <RecipientHome />,
    'recipient-listing-detail': <RecipientListingDetail params={params} />,
    'recipient-claims': <RecipientClaims />,
    'recipient-map': <RecipientMap />,
    'recipient-requests': <RecipientRequests />,
    'create-request': <CreateRequest />,
    'recipient-request-detail': <RecipientRequestDetail params={params} />,
    'recipient-notifications': <RecipientNotifications />,
    'recipient-profile': <RecipientProfile />,
    'recipient-edit-profile': <RecipientEditProfile />,
  };

  return (
    <AppContext.Provider value={ctx}>
      <Toast toasts={toasts} />
      {screenMap[screen] || <SplashScreen />}
    </AppContext.Provider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
