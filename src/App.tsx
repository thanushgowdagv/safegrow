import React, { useEffect, useRef, useState } from "react";

/**
 * SafeGrow — Single-file React + Tailwind prototype (App.tsx)
 *
 * Changes in this release:
 * - Integrated mentor verification flow (mentors upload certs, request verification, mock review -> Verified/Rejected).
 * - Mock user portfolio added to dashboard with a simple SVG PieChart and detailed holdings below.
 * - Flashcards about SIP & Mutual Funds added below portfolio on the home/dashboard page.
 *
 * NOTE: This is a frontend prototype. All verification, booking, AI and payments are mocked.
 */

// -----------------------------
// Translations & palette
const TRANSLATIONS: Record<string, any> = {
  en: {
    welcome: "Make your money work — simply and safely",
    signIn: "Sign In",
    signUp: "Sign Up",
    investor: "Investor",
    mentor: "Mentor",
    factsPrefix: "Did you know?",
    investments: "Investment Options",
    getMentor: "Get personalized mentor",
    aiBot: "Ask Finance Bot",
    calculator: "Investment Projections",
    feedback: "Give Feedback",
    mentors: "Mentors",
    home: "Home",
    tag: "Making finance easy for everyone.",
    portfolio: "Your Portfolio",
    holdings: "Holdings",
    flashcards: "Quick learning cards",
    requestVerification: "Request Verification",
    uploadCerts: "Upload Certifications",
    verificationStatus: "Verification status",
  },
  hi: {
    welcome: "अपना पैसा सरल और सुरक्षित तरीके से बढ़ाएँ",
    signIn: "साइन इन",
    signUp: "साइन अप",
    investor: "निवेशक",
    mentor: "मेंटोर",
    factsPrefix: "क्या आप जानते हैं?",
    investments: "निवेश विकल्प",
    getMentor: "व्यक्तिगत मेंटर पाएं",
    aiBot: "फाइनेंस बोट से पूछें",
    calculator: "निवेश पूर्वानुमान",
    feedback: "प्रतिक्रिया दें",
    mentors: "मेंटर्स",
    home: "होम",
    tag: "हर किसी के लिए फाइनेंस आसान बनाना।",
    portfolio: "आपका पोर्टफोलियो",
    holdings: "होल्डिंग्स",
    flashcards: "त्वरित सीखने के कार्ड",
    requestVerification: "सत्यापन का अनुरोध करें",
    uploadCerts: "प्रमाणपत्र अपलोड करें",
    verificationStatus: "सत्यापन स्थिति",
  },
};

const PALETTE = {
  navy: "#0F2C59",
  emerald: "#28B463",
  offWhite: "#F4F6F8",
  blue: "#2563EB",
  red: "#EF4444",
};

// -----------------------------
// Mock domain data
const FACTS = [
  "SIPs historically tend to outperform typical fixed deposit rates over longer horizons.",
  "Mutual funds pool money — professionally managed and diversified.",
  "Starting early reduces monthly SIP amount needed for the same goal (compounding).",
  "Debt funds can be suitable for short-term goals compared to equity SIPs.",
];

type InvDetail = {
  id: string;
  title: string;
  oneLiner: string;
  brief: string;
  stability: number;
  returns: number;
};

const INVESTMENTS: InvDetail[] = [
  { id: "index", title: "Index Fund", oneLiner: "Tracks a market index — low-cost & passive.", brief: "Index funds track a market index (e.g., Nifty 50). Low expense ratio, broad market exposure.", stability: 60, returns: 55 },
  { id: "largecap", title: "Large Cap Equity", oneLiner: "Stability of big companies with moderate growth.", brief: "Large-cap funds invest in well-established companies. Less volatile than small/mid caps.", stability: 50, returns: 60 },
  { id: "midsmall", title: "Mid/Small Cap Equity", oneLiner: "Higher growth potential — higher volatility.", brief: "Mid & small caps can deliver higher returns but with more ups and downs. Best for longer horizons.", stability: 30, returns: 80 },
  { id: "debt", title: "Debt Fund", oneLiner: "Invests in bonds — lower volatility than equity.", brief: "Debt funds invest in bonds and fixed income instruments; useful for capital preservation.", stability: 85, returns: 30 },
  { id: "fd", title: "Bank FD", oneLiner: "Fixed returns, bank-backed stability.", brief: "Fixed Deposits offer guaranteed returns at fixed rates; low volatility and principal protection.", stability: 95, returns: 20 },
  { id: "hybrid", title: "Hybrid Fund", oneLiner: "Mix of equity & debt — balanced risk/return.", brief: "Hybrid funds allocate across equity & debt to balance growth and protection.", stability: 70, returns: 45 },
];

type Mentor = {
  id: string;
  name: string;
  shortBio: string;
  rating: number;
  pricePerSession: number;
  verified: boolean;
  languages?: string[];
};

const MOCK_MENTORS: Mentor[] = [
  { id: "m1", name: "Asha Verma", shortBio: "12+ yrs mutual fund advisor — SIP planning for salaried professionals.", rating: 4.8, pricePerSession: 499, verified: true, languages: ["Hindi", "English"] },
  { id: "m2", name: "Ravi Kumar", shortBio: "Ex-analyst turned mentor — risk profiling & goal-based investing.", rating: 4.6, pricePerSession: 399, verified: true, languages: ["English"] },
  { id: "m3", name: "Priya Singh", shortBio: "Specialist in debt & hybrid strategies for capital preservation.", rating: 4.4, pricePerSession: 299, verified: false, languages: ["Hindi"] },
];

// -----------------------------
// Small utils & mocks
async function checkForScam(text: string) {
  await new Promise((r) => setTimeout(r, 180));
  return { safe: true, reasons: [] as string[] };
}
async function askFinanceBot(question: string) {
  await new Promise((r) => setTimeout(r, 500));
  return `Simple answer: ${question.split("?")[0]}... (mocked — integrate a real AI API)`;
}
function calcSIPFuture(monthly: number, years: number, annualReturnPerc: number) {
  const r = annualReturnPerc / 100 / 12;
  const n = years * 12;
  if (r === 0) return Math.round(monthly * n);
  return Math.round(monthly * (Math.pow(1 + r, n) - 1) / r);
}
function calcLumpSumFuture(lump: number, years: number, annualReturnPerc: number) {
  const r = annualReturnPerc / 100;
  return Math.round(lump * Math.pow(1 + r, years));
}

// -----------------------------
// Small presentational components
function Logo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="SafeGrow logo">
      <rect width="100" height="100" rx="18" fill={PALETTE.navy} />
      <path d="M18 66 L38 40 L55 58 L82 28" stroke={PALETTE.emerald} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function Bar({ label, value, color }: { label: string; value: number; color?: string }) {
  const defaultColor = color ?? (label.toLowerCase().includes("stability") ? PALETTE.emerald : PALETTE.blue);
  const width = Math.max(6, Math.round((value / 100) * 220));
  return (
    <div className="flex items-center gap-3">
      <div style={{ width: 110 }} className="text-xs text-slate-700">{label}</div>
      <div className="bg-slate-200 rounded h-5 w-[220px] relative overflow-hidden">
        <div style={{ width, background: defaultColor }} className="h-5 rounded absolute top-0 left-0" />
        <div className="absolute right-2 top-0 text-xs text-slate-700">{value}%</div>
      </div>
    </div>
  );
}

function Stars({ value }: { value: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className="flex items-center gap-1 text-sm">
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full) return <span key={i}>★</span>;
        if (i === full && half) return <span key={i}>☆</span>;
        return <span key={i}>☆</span>;
      })}
      <span className="text-xs text-slate-500 ml-2">{value.toFixed(1)}</span>
    </div>
  );
}

// Simple SVG PieChart. Expects data -> [{label, value, color}]
function PieChart({ data, size = 200 }: { data: { label: string; value: number; color: string }[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let cumulative = 0;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;
  function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return { x: cx + radius * Math.cos(angleInRadians), y: cy + radius * Math.sin(angleInRadians) };
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Portfolio distribution">
      {data.map((d, idx) => {
        const startAngle = (cumulative / total) * 360;
        cumulative += d.value;
        const endAngle = (cumulative / total) * 360;
        const start = polarToCartesian(cx, cy, r, endAngle);
        const end = polarToCartesian(cx, cy, r, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        const pathData = `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
        return <path key={idx} d={pathData} fill={d.color} stroke="#fff" strokeWidth={1} />;
      })}
      <circle cx={cx} cy={cy} r={r * 0.38} fill="#fff" />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" className="text-xs" fill="#0F2C59">Portfolio</text>
    </svg>
  );
}

// -----------------------------
// Main App
export default function App(): JSX.Element {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const t = (k: string) => TRANSLATIONS[lang][k] ?? k;

  // routing & auth
  const [page, setPage] = useState<number>(1); // 1 auth, 2 investments, 3 comparison, 4 ai, 5 projections, 6 mentors list, 7 mentor detail, 8 dashboard, 9 verification (mentor)
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin");
  const [authRole, setAuthRole] = useState<"investor" | "mentor">("investor");

  // auth fields
  const [invSignupName, setInvSignupName] = useState("");
  const [invSignupEmail, setInvSignupEmail] = useState("");
  const [invSignupPass, setInvSignupPass] = useState("");

  const [mentorSignupName, setMentorSignupName] = useState("");
  const [mentorSignupEmail, setMentorSignupEmail] = useState("");
  const [mentorSignupBio, setMentorSignupBio] = useState("");
  const [mentorFiles, setMentorFiles] = useState<File[]>([]);
  const mentorFileRef = useRef<HTMLInputElement | null>(null);
  const [mentorVerificationStatus, setMentorVerificationStatus] = useState<"Not submitted" | "Pending" | "Verified" | "Rejected">("Not submitted");

  const [invLoginEmail, setInvLoginEmail] = useState("");
  const [invLoginPass, setInvLoginPass] = useState("");
  const [mentorLoginEmail, setMentorLoginEmail] = useState("");
  const [mentorLoginPass, setMentorLoginPass] = useState("");

  const [currentUser, setCurrentUser] = useState<{ name: string; role: "investor" | "mentor" } | null>(null);

  // investments UI state
  const [openInv, setOpenInv] = useState<string | null>(null);
  const [selectedInvs, setSelectedInvs] = useState<string[]>(["index"]);

  // ai & projections
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [monthly, setMonthly] = useState<number>(2000);
  const [years, setYears] = useState<number>(10);
  const [annReturn, setAnnReturn] = useState<number>(10);
  const [lumpSum, setLumpSum] = useState<number>(0);

  // mentors
  const [mentors, setMentors] = useState<Mentor[]>(MOCK_MENTORS);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  // facts ticker
  const [factIndex, setFactIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFactIndex((i) => (i + 1) % FACTS.length), 5000);
    return () => clearInterval(id);
  }, []);

  // ---- Mock user portfolio data ----
  const mockPortfolio = {
    total: 125000, // rupees
    breakdown: [
      { label: "Large Cap Equity", value: 42000, color: PALETTE.blue },
      { label: "Index Funds", value: 30000, color: PALETTE.emerald },
      { label: "Debt Funds", value: 25000, color: "#F59E0B" },
      { label: "Bank FD", value: 20000, color: "#9CA3AF" },
      { label: "Cash", value: 5000, color: PALETTE.red },
    ],
    holdings: [
      { name: "ABC Largecap Fund", type: "Large Cap", invested: 20000, current: 23800 },
      { name: "Nifty Index Fund", type: "Index", invested: 15000, current: 21000 },
      { name: "Stable Debt Fund", type: "Debt", invested: 25000, current: 26500 },
      { name: "Bank FD", type: "FD", invested: 20000, current: 21000 },
      { name: "Cash", type: "Cash", invested: 5000, current: 5000 },
    ],
  };

  // demo flashcards content
  const flashcards = [
    { title: "What is SIP?", short: "Small, regular investments (monthly) into mutual funds to harness compounding.", detail: "SIP (Systematic Investment Plan) spreads investment over time, reduces timing risk, and benefits from rupee-cost averaging." },
    { title: "Why mutual funds?", short: "Professionally managed, diversified and accessible with small amounts.", detail: "Mutual funds pool money from many investors and are managed by professionals who pick securities aligned with fund objectives." },
    { title: "Debt vs Equity", short: "Debt = lower returns, lower volatility. Equity = higher upside, higher volatility.", detail: "Choose debt for short-term goals and capital preservation; equity for long-term growth." },
  ];

  // Protect: if not logged in, redirect to auth
  useEffect(() => {
    if (!currentUser && page > 1 && page !== 1) {
      setPage(1);
      setAuthTab("signin");
      setAuthRole("investor");
    }
  }, [currentUser, page]);

  // --------- Auth handlers (mock) -----------
  function handleInvestorSignup() {
    if (!invSignupName || !invSignupEmail || !invSignupPass) { alert("Please fill all investor fields."); return; }
    alert("Investor signup recorded (mock). Please sign in.");
    setAuthTab("signin");
    setAuthRole("investor");
  }
  function handleMentorFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setMentorFiles(files);
    setMentorVerificationStatus(files.length ? "Pending" : "Not submitted");
  }
  function handleMentorSignup() {
    if (!mentorSignupName || !mentorSignupEmail) { alert("Please fill mentor name & email."); return; }
    setMentorVerificationStatus(mentorFiles.length ? "Pending" : "Not submitted");
    // Add mentor to mock list (unverified)
    const newMentor: Mentor = {
      id: `m${Date.now()}`,
      name: mentorSignupName,
      shortBio: mentorSignupBio || "Mentor profile",
      rating: 4.2,
      pricePerSession: 399,
      verified: false,
      languages: ["English"],
    };
    setMentors((s) => [newMentor, ...s]);
    alert("Mentor signup recorded (mock). Please sign in. Request verification to begin review.");
    setAuthTab("signin");
    setAuthRole("mentor");
  }

  function handleInvestorLogin() {
    if (!invLoginEmail || !invLoginPass) { alert("Please enter investor credentials."); return; }
    setCurrentUser({ name: invLoginEmail.split("@")[0] || invLoginEmail, role: "investor" });
    setPage(8);
  }
  function handleMentorLogin() {
    if (!mentorLoginEmail || !mentorLoginPass) { alert("Please enter mentor credentials."); return; }
    setCurrentUser({ name: mentorLoginEmail.split("@")[0] || mentorLoginEmail, role: "mentor" });
    setPage(9); // mentors see verification dashboard first
  }
  function logout() {
    setCurrentUser(null);
    setPage(1);
    setAuthTab("signin");
    setAuthRole("investor");
  }

  // Mentor verification request (mentor user)
  function requestMentorVerification() {
    if (mentorFiles.length === 0) { alert("Please upload certification files before requesting verification."); return; }
    setMentorVerificationStatus("Pending");
    // simulate review by "platform admin" after 2.2s: randomly verify or reject (mock)
    setTimeout(() => {
      const approved = Math.random() > 0.12; // 88% chance approved (for demo)
      setMentorVerificationStatus(approved ? "Verified" : "Rejected");
      alert(`Verification result (mock): ${approved ? "Verified" : "Rejected"}`);
      // update mentors list if current mentor exists (best effort)
      if (mentorSignupEmail) {
        setMentors((prev) => prev.map(m => m.name === mentorSignupName ? { ...m, verified: approved } : m));
      }
    }, 2200);
  }

  // Mentor verification admin mock (accessible to all mentors in this prototype via page 9)
  function submitCertsAdminApprove() {
    // admin approving current uploaded certs (mock)
    if (mentorFiles.length === 0) { alert("No certs uploaded."); return; }
    setMentorVerificationStatus("Verified");
    alert("Admin (mock) approved your verification.");
  }

  // ---------- Mentor marketplace ----------
  function openMentorsList() {
    if (!currentUser || currentUser.role !== "investor") {
      alert("Only investors can browse mentors. Please sign in as an investor.");
      setAuthTab("signin");
      setAuthRole("investor");
      setPage(1);
      return;
    }
    setPage(6);
  }
  function openMentorDetail(id: string) {
    const m = mentors.find((x) => x.id === id) || null;
    setSelectedMentor(m);
    setPage(7);
  }
  function bookMentorSession(m: Mentor) {
    alert(`Mock booking: ${m.name}\nPrice: ₹${m.pricePerSession}\n(Integrate payment gateway for real bookings)`);
  }

  // comparisons
  function toggleSelection(id: string) {
    setSelectedInvs((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  // guard nav
  function guardTo(next: number, investorOnly = false) {
    if (!currentUser) {
      alert("Please sign in to access this feature.");
      setAuthTab("signin");
      setAuthRole("investor");
      setPage(1);
      return;
    }
    if (investorOnly && currentUser.role !== "investor") {
      alert("This feature is only available to investors.");
      return;
    }
    setPage(next);
  }

  // goHome
  function goHome() {
    if (currentUser) setPage(currentUser.role === "mentor" ? 9 : 8);
    else setPage(1);
  }

  // -------------------------
  // UI
  return (
    <div style={{ background: PALETTE.offWhite }} className="min-h-screen text-slate-900">
      {/* HEADER */}
      <header style={{ background: PALETTE.navy }} className="text-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between p-4 gap-4">
          <div className="flex items-center gap-4">
            <button aria-label="Home" onClick={goHome} className="flex items-center gap-3 focus:outline-none">
              <Logo />
              <div className="leading-tight">
                <div className="font-semibold text-lg">SafeGrow</div>
                <div className="text-xs opacity-90">{t("tag")}</div>
              </div>
            </button>
          </div>

          {/* Center nav: only visible when signed in, otherwise empty placeholder */}
          {currentUser ? (
            <nav className="hidden md:flex items-center gap-2">
              <button onClick={() => setPage(currentUser.role === "mentor" ? 9 : 8)} className="px-4 py-2 rounded-full text-sm font-medium" style={{ color: "white", background: "transparent" }}>Home</button>
              <button onClick={() => guardTo(2)} className="px-4 py-2 rounded-full text-sm font-medium" style={{ color: "white", background: "transparent" }}>{t("investments")}</button>
              <button onClick={() => guardTo(3)} className="px-4 py-2 rounded-full text-sm font-medium" style={{ color: "white", background: "transparent" }}>Comparison</button>
              <button onClick={() => guardTo(4)} className="px-4 py-2 rounded-full text-sm font-medium" style={{ color: "white", background: "transparent" }}>{t("aiBot")}</button>
              <button onClick={() => guardTo(5)} className="px-4 py-2 rounded-full text-sm font-medium" style={{ color: "white", background: PALETTE.emerald }}>{t("calculator")}</button>
              <button onClick={() => { if (currentUser.role === "investor") setPage(6); else alert("Mentor marketplace is for investors only."); }} className="px-4 py-2 rounded-full text-sm font-medium" style={{ color: "white", background: "transparent" }}>{t("mentors")}</button>
            </nav>
          ) : (
            <div className="hidden md:flex items-center gap-2" style={{ width: 420 }} />
          )}

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <select value={lang} onChange={(e) => setLang(e.target.value as any)} className="rounded px-2 py-1 text-sm text-slate-800" aria-label="Select language">
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
              </select>
            </div>

            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="text-sm text-white hidden sm:block">{currentUser.name}</div>
                <div className="w-px h-6 bg-white/30 hidden sm:block" />
                <button onClick={logout} className="px-3 py-2 rounded-full text-sm font-medium bg-white text-[#0F2C59] shadow-sm">Logout</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => { setAuthTab("signin"); setAuthRole("investor"); setPage(1); }} className="px-3 py-2 rounded-full text-sm font-medium bg-white text-[#0F2C59]">{t("signIn")}</button>
                <button onClick={() => { setAuthTab("signup"); setAuthRole("investor"); setPage(1); }} className="px-3 py-2 rounded-full text-sm font-medium border border-white/30" style={{ background: "transparent", color: "white" }}>{t("signUp")}</button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile nav (show limited actions) */}
        <div className="md:hidden max-w-6xl mx-auto px-4 pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2">
              {currentUser ? (
                <>
                  <button onClick={() => guardTo(2)} className="px-3 py-2 rounded text-sm bg-white/10">Invest</button>
                  <button onClick={() => guardTo(3)} className="px-3 py-2 rounded text-sm bg-white/10">Compare</button>
                </>
              ) : (
                <button onClick={() => { setAuthTab("signin"); setAuthRole("investor"); setPage(1); }} className="px-3 py-2 rounded text-sm bg-white/10">Sign In</button>
              )}
            </div>

            <div className="flex gap-2">
              {currentUser ? (
                <button onClick={() => guardTo(5)} className="px-3 py-2 rounded text-sm" style={{ background: PALETTE.emerald, color: "white" }}>Projections</button>
              ) : (
                <button onClick={() => { setAuthTab("signup"); setAuthRole("investor"); setPage(1); }} className="px-3 py-2 rounded text-sm border border-white/20 text-white">Sign Up</button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* AUTH HOME (page 1) */}
        {page === 1 && (
          <section className="bg-white rounded shadow-sm p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{t("welcome")}</h2>
                    <div className="text-sm text-slate-600 mt-1">{t("tag")}</div>
                  </div>
                  <div className="text-xs text-slate-500">Switch: <strong>{authRole === "investor" ? t("investor") : t("mentor")}</strong></div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setAuthTab("signin")} className={`px-3 py-2 rounded ${authTab === "signin" ? "bg-[#0F2C59] text-white" : "bg-slate-100"}`}>Sign in</button>
                  <button onClick={() => setAuthTab("signup")} className={`px-3 py-2 rounded ${authTab === "signup" ? "bg-[#0F2C59] text-white" : "bg-slate-100"}`}>Sign up</button>

                  <div className="ml-4 flex items-center gap-2">
                    <button onClick={() => setAuthRole("investor")} className={`px-2 py-1 rounded text-sm ${authRole === "investor" ? "bg-[#28B463] text-white" : "bg-white border"}`}>{t("investor")}</button>
                    <button onClick={() => setAuthRole("mentor")} className={`px-2 py-1 rounded text-sm ${authRole === "mentor" ? "bg-[#0F2C59] text-white" : "bg-white border"}`}>{t("mentor")}</button>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded text-sm text-slate-700">
                  <strong>{t("factsPrefix")}</strong>
                  <div className="mt-2">{FACTS[factIndex]}</div>
                </div>

                <div className="mt-2 text-xs text-slate-500">Features: Investments, Comparison, Ask Finance Bot, Investment Projections, Mentor Marketplace, Feedback & Ratings, Multilingual & voice-ready UI (mocked).</div>
              </div>

              <div className="w-full md:w-1/2 bg-white p-4 rounded shadow-sm">
                {/* Sign in / sign up forms */}
                {authTab === "signin" && authRole === "investor" && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Investor Sign In</h3>
                    <input value={invLoginEmail} onChange={(e) => setInvLoginEmail(e.target.value)} placeholder="Email or phone" className="w-full border rounded px-3 py-2 mb-2" />
                    <input value={invLoginPass} onChange={(e) => setInvLoginPass(e.target.value)} placeholder="Password" type="password" className="w-full border rounded px-3 py-2 mb-3" />
                    <div className="flex gap-2">
                      <button onClick={handleInvestorLogin} className="px-4 py-2 rounded" style={{ background: PALETTE.emerald, color: "white" }}>Sign in as Investor</button>
                      <button onClick={() => { setAuthTab("signup"); setAuthRole("investor"); }} className="px-4 py-2 rounded border">Go to Sign up</button>
                    </div>
                  </div>
                )}

                {authTab === "signin" && authRole === "mentor" && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Mentor Sign In</h3>
                    <input value={mentorLoginEmail} onChange={(e) => setMentorLoginEmail(e.target.value)} placeholder="Email or phone" className="w-full border rounded px-3 py-2 mb-2" />
                    <input value={mentorLoginPass} onChange={(e) => setMentorLoginPass(e.target.value)} placeholder="Password" type="password" className="w-full border rounded px-3 py-2 mb-3" />
                    <div className="flex gap-2">
                      <button onClick={handleMentorLogin} className="px-4 py-2 rounded" style={{ background: PALETTE.navy, color: "white" }}>Sign in as Mentor</button>
                      <button onClick={() => { setAuthTab("signup"); setAuthRole("mentor"); }} className="px-4 py-2 rounded border">Go to Sign up</button>
                    </div>
                    <div className="text-xs text-slate-500 mt-3">{t("verificationStatus")}: <strong>{mentorVerificationStatus}</strong></div>
                  </div>
                )}

                {authTab === "signup" && authRole === "investor" && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Investor Sign Up</h3>
                    <input value={invSignupName} onChange={(e) => setInvSignupName(e.target.value)} placeholder="Full name" className="w-full border rounded px-3 py-2 mb-2" />
                    <input value={invSignupEmail} onChange={(e) => setInvSignupEmail(e.target.value)} placeholder="Email or phone" className="w-full border rounded px-3 py-2 mb-2" />
                    <input value={invSignupPass} onChange={(e) => setInvSignupPass(e.target.value)} placeholder="Password" type="password" className="w-full border rounded px-3 py-2 mb-3" />
                    <div className="flex gap-2">
                      <button onClick={handleInvestorSignup} className="px-4 py-2 rounded" style={{ background: PALETTE.emerald, color: "white" }}>Create Investor</button>
                      <button onClick={() => { setAuthTab("signin"); setAuthRole("investor"); }} className="px-4 py-2 rounded border">Back to Sign in</button>
                    </div>
                  </div>
                )}

                {authTab === "signup" && authRole === "mentor" && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Mentor Sign Up</h3>
                    <input value={mentorSignupName} onChange={(e) => setMentorSignupName(e.target.value)} placeholder="Full name" className="w-full border rounded px-3 py-2 mb-2" />
                    <input value={mentorSignupEmail} onChange={(e) => setMentorSignupEmail(e.target.value)} placeholder="Email or phone" className="w-full border rounded px-3 py-2 mb-2" />
                    <textarea value={mentorSignupBio} onChange={(e) => setMentorSignupBio(e.target.value)} placeholder="Short bio" className="w-full border rounded px-3 py-2 mb-2" rows={3} />
                    <div className="mb-2">
                      <label className="text-xs block mb-1">{t("uploadCerts")}</label>
                      <input ref={mentorFileRef} type="file" multiple onChange={handleMentorFilesChange} className="text-sm" />
                      <div className="text-xs text-slate-500 mt-1">Status: <strong>{mentorVerificationStatus}</strong></div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleMentorSignup} className="px-4 py-2 rounded" style={{ background: PALETTE.navy, color: "white" }}>Submit Mentor Signup</button>
                      <button onClick={() => { setAuthTab("signin"); setAuthRole("mentor"); }} className="px-4 py-2 rounded border">Back to Sign in</button>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">After submission mentors go through a mock verification queue. Replace with KYC in production.</div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* DASHBOARD - Investor (page 8) */}
        {page === 8 && currentUser && currentUser.role === "investor" && (
          <section className="bg-white rounded shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-600">Welcome back</div>
                <div className="text-xl font-semibold">{currentUser.name} • <span className="text-sm text-slate-500">{currentUser.role}</span></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setPage(2)} className="px-3 py-2 rounded bg-white" style={{ color: PALETTE.navy }}>{t("investments")}</button>
                <button onClick={openMentorsList} className="px-3 py-2 rounded" style={{ background: PALETTE.emerald, color: "white" }}>Find a Mentor</button>
                <button onClick={logout} className="px-3 py-2 rounded border">Logout</button>
              </div>
            </div>

            {/* Portfolio area */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="col-span-2 bg-white rounded shadow-sm p-4">
                <h3 className="font-semibold">{t("portfolio")}</h3>
                <div className="mt-3 grid md:grid-cols-2 gap-4 items-center">
                  <div>
                    <PieChart data={mockPortfolio.breakdown.map(b => ({ label: b.label, value: b.value, color: b.color }))} size={220} />
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Total invested</div>
                    <div className="text-2xl font-semibold mt-1">₹{mockPortfolio.total.toLocaleString()}</div>
                    <div className="mt-3 text-sm">
                      <div><strong>Unrealized gains:</strong> ₹{(mockPortfolio.holdings.reduce((s, h) => s + (h.current - h.invested), 0)).toLocaleString()}</div>
                      <div className="text-xs text-slate-500 mt-2">This is a mock portfolio for demo. Connect with your accounts or SIPs to show real data.</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium text-sm">{t("holdings")}</h4>
                  <div className="mt-2 space-y-2">
                    {mockPortfolio.holdings.map((h, idx) => (
                      <div key={idx} className="p-3 rounded bg-slate-50 flex items-center justify-between">
                        <div>
                          <div className="font-medium">{h.name}</div>
                          <div className="text-xs text-slate-500">{h.type}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">₹{h.current.toLocaleString()}</div>
                          <div className={`text-xs ${h.current - h.invested >= 0 ? "text-emerald-600" : "text-red-500"}`}>{h.current - h.invested >= 0 ? `+₹${(h.current - h.invested).toLocaleString()}` : `-₹${Math.abs(h.current - h.invested).toLocaleString()}`}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right column: quick actions & flashcards */}
              <aside className="bg-white rounded shadow-sm p-4 space-y-4">
                <div>
                  <div className="text-xs text-slate-500">Quick actions</div>
                  <div className="mt-2 flex flex-col gap-2">
                    <button onClick={() => setPage(5)} className="px-3 py-2 rounded" style={{ background: PALETTE.emerald, color: "white" }}>Investment Projections</button>
                    <button onClick={() => setPage(2)} className="px-3 py-2 rounded border">Explore Investments</button>
                    <button onClick={() => setPage(6)} className="px-3 py-2 rounded border">Browse Mentors</button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm">{t("flashcards")}</h4>
                  <div className="mt-2 space-y-2">
                    {flashcards.map((f, i) => (
                      <details key={i} className="p-3 rounded bg-slate-50">
                        <summary className="font-medium cursor-pointer">{f.title}</summary>
                        <div className="text-sm text-slate-700 mt-2">{f.short}</div>
                        <div className="text-xs text-slate-500 mt-2">{f.detail}</div>
                      </details>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </section>
        )}

        {/* MENTOR VERIFICATION DASH (page 9) - mentors view */}
        {page === 9 && currentUser && currentUser.role === "mentor" && (
          <section className="bg-white rounded shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-600">Welcome</div>
                <div className="text-xl font-semibold">{currentUser.name} • <span className="text-sm text-slate-500">{currentUser.role}</span></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setPage(2)} className="px-3 py-2 rounded border">Explore (investor-only)</button>
                <button onClick={logout} className="px-3 py-2 rounded border">Logout</button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded">
                <h4 className="font-medium">Verification</h4>
                <div className="mt-2 text-sm text-slate-700">Upload certifications and request verification. Platform will review and update the status (mock).</div>

                <div className="mt-3">
                  <label className="text-xs block mb-1">{t("uploadCerts")}</label>
                  <input ref={mentorFileRef} type="file" multiple onChange={handleMentorFilesChange} className="text-sm" />
                  <div className="text-xs text-slate-500 mt-2">Uploaded files: {mentorFiles.length}</div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button onClick={requestMentorVerification} className="px-3 py-2 rounded" style={{ background: PALETTE.navy, color: "white" }}>{t("requestVerification")}</button>
                  <button onClick={submitCertsAdminApprove} className="px-3 py-2 rounded border">(Mock) Admin Approve</button>
                </div>

                <div className="mt-3 text-xs">Status: <strong>{mentorVerificationStatus}</strong></div>
                <div className="mt-2 text-xs text-slate-500">Note: This is a mocked flow. Integrate a secure KYC/verification pipeline for production.</div>
              </div>

              <div className="bg-white p-4 rounded shadow-sm">
                <h4 className="font-medium">Profile preview</h4>
                <div className="mt-2">
                  <div className="font-medium">{mentorSignupName || currentUser.name}</div>
                  <div className="text-xs text-slate-500 mt-1">{mentorSignupBio || "Your short bio will appear here."}</div>
                  <div className="mt-3">
                    <div className="text-xs"><strong>Verified:</strong> {mentorVerificationStatus === "Verified" ? "Yes" : "No"}</div>
                    <div className="text-xs mt-1">Price per session (mock): ₹399</div>
                    <div className="text-xs mt-1">Languages: English</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Investments, Comparison, AI, Projections, Mentors list, Mentor detail pages follow same protected structure as earlier — only their code is included when page === X and currentUser set */}
        {/* PAGE 2 - Investments */}
        {page === 2 && currentUser && (
          <section className="bg-white rounded shadow-sm p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t("investments")}</h2>
              <div className="flex gap-2">
                <button onClick={() => setPage(3)} className="px-3 py-1 rounded border">Compare</button>
                <button onClick={() => setPage(5)} className="px-3 py-1 rounded" style={{ background: PALETTE.emerald, color: "white" }}>{t("calculator")}</button>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {INVESTMENTS.map((inv) => (
                <div key={inv.id} className="rounded bg-white shadow-sm">
                  <button onClick={() => setOpenInv((o) => (o === inv.id ? null : inv.id))} className="w-full text-left px-4 py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{inv.title}</div>
                      <div className="text-xs text-slate-500">{inv.oneLiner}</div>
                    </div>
                    <div className="text-xs text-slate-400">{openInv === inv.id ? "−" : "+"}</div>
                  </button>
                  {openInv === inv.id && (
                    <div className="px-4 pb-4 pt-2 text-sm text-slate-700">
                      <div>{inv.brief}</div>
                      <div className="mt-3"><Bar label="Stability" value={inv.stability} /></div>
                      <div className="mt-2"><Bar label="Returns (relative)" value={inv.returns} /></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PAGE 3 - Comparison */}
        {page === 3 && currentUser && (
          <section className="bg-white rounded shadow-sm p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Comparison — Risk vs Returns</h2>
              <div className="flex gap-2">
                <button onClick={() => setPage(2)} className="px-3 py-1 rounded border">Back</button>
                <button onClick={() => alert("Export CSV mocked")} className="px-3 py-1 rounded border">Export</button>
              </div>
            </div>

            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded bg-white shadow-sm">
                <h3 className="font-medium text-sm mb-2">Select investment types</h3>
                <div className="space-y-2">
                  {INVESTMENTS.map((inv) => (
                    <label key={inv.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={selectedInvs.includes(inv.id)} onChange={() => toggleSelection(inv.id)} />
                      <div>
                        <div className="font-medium">{inv.title}</div>
                        <div className="text-xs text-slate-500">{inv.oneLiner}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="mt-4 text-xs text-slate-500">Tip: Select 2–4 options to compare visually.</div>
              </div>

              <div className="p-4 rounded bg-white shadow-sm">
                <h3 className="font-medium text-sm mb-3">Visual comparison</h3>
                <div className="space-y-3">
                  {selectedInvs.length === 0 && <div className="text-sm text-slate-500">No selections — pick investments to compare.</div>}
                  {selectedInvs.map((id) => {
                    const inv = INVESTMENTS.find((x) => x.id === id)!;
                    return (
                      <div key={id} className="p-3 rounded bg-slate-50">
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-medium">{inv.title}</div>
                          <div className="text-xs text-slate-500">Stability {inv.stability}% • Returns {inv.returns}%</div>
                        </div>
                        <div className="space-y-2">
                          <Bar label="Stability" value={inv.stability} />
                          <Bar label="Returns" value={inv.returns} />
                        </div>
                      </div>
                    );
                  })}
                  {selectedInvs.length > 0 && (
                    <div className="mt-3 p-3 bg-white rounded shadow-sm text-sm">
                      <div className="font-medium">How to read this</div>
                      <div className="text-xs text-slate-600 mt-1">Higher stability means fewer price swings. Higher returns usually imply more volatility — choose based on your horizon & risk tolerance.</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* PAGE 4 - AI Bot */}
        {page === 4 && currentUser && (
          <section className="bg-white rounded shadow-sm p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t("aiBot")}</h2>
              <div><button onClick={() => setPage(2)} className="px-3 py-1 rounded border">Back</button></div>
            </div>

            <div className="mt-4">
              <AiChat onAnswer={(a) => setAiAnswer(a)} />
              {aiAnswer && (
                <div className="mt-3 p-3 bg-slate-50 rounded">
                  <h4 className="font-medium">Answer</h4>
                  <p className="mt-1 text-sm">{aiAnswer}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* PAGE 5 - Investment Projections */}
        {page === 5 && currentUser && (
          <section className="bg-white rounded shadow-sm p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t("calculator")}</h2>
              <div><button onClick={() => setPage(2)} className="px-3 py-1 rounded border">Back</button></div>
            </div>

            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded bg-white shadow-sm">
                <h3 className="font-medium text-sm">Projection Inputs</h3>
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="text-xs block">Monthly SIP (₹)</label>
                    <input type="number" className="w-full border rounded px-2 py-1" value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="text-xs block">Lump-sum (optional, ₹)</label>
                    <input type="number" className="w-full border rounded px-2 py-1" value={lumpSum} onChange={(e) => setLumpSum(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="text-xs block">Tenure (years)</label>
                    <input type="number" className="w-full border rounded px-2 py-1" value={years} onChange={(e) => setYears(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="text-xs block">Expected annual return (%)</label>
                    <input type="number" className="w-full border rounded px-2 py-1" value={annReturn} onChange={(e) => setAnnReturn(Number(e.target.value))} />
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button onClick={() => {
                      const sipFuture = calcSIPFuture(monthly, years, annReturn);
                      const lumpFuture = lumpSum ? calcLumpSumFuture(lumpSum, years, annReturn) : 0;
                      alert(`Projected SIP future value: ₹${sipFuture}\nProjected Lump-sum future value: ₹${lumpFuture}`);
                    }} className="px-4 py-2 rounded" style={{ background:"transparent", color:"white" }}>
                      Quick estimate
                    </button>
                    <button onClick={() => { setMonthly(2000); setLumpSum(0); setYears(10); setAnnReturn(10); }} className="px-3 py-2 rounded border">Reset</button>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded bg-white shadow-sm">
                <h3 className="font-medium text-sm">Projected Returns (detailed)</h3>
                <div className="mt-3 space-y-2 text-sm text-slate-700">
                  <div><strong>SIP future value:</strong> ₹{calcSIPFuture(monthly, years, annReturn).toLocaleString()}</div>
                  <div><strong>Lump-sum future value:</strong> ₹{(lumpSum ? calcLumpSumFuture(lumpSum, years, annReturn) : 0).toLocaleString()}</div>
                  <div><strong>Estimated total invested:</strong> ₹{(monthly * years * 12 + lumpSum).toLocaleString()}</div>
                  <div className="text-xs text-slate-500">Note: Projections assume constant annualized return. Market returns vary.</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* PAGE 6 - Mentors list */}
        {page === 6 && currentUser && currentUser.role === "investor" && (
          <section className="bg-white rounded shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Mentors</h2>
              <div><button onClick={() => setPage(8)} className="px-3 py-1 rounded border">Back</button></div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {mentors.map((m) => (
                <article key={m.id} className="bg-white rounded shadow-sm p-4 flex gap-4 items-start">
                  <div className="w-16 h-16 rounded bg-slate-100 flex items-center justify-center text-xl font-semibold">
                    {m.name.split(" ").map(n => n[0]).slice(0,2).join("")}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium">{m.name}{m.verified && <span className="text-xs text-emerald-500 ml-2">✔ Verified</span>}</div>
                        <div className="text-xs text-slate-500 mt-1">{m.shortBio}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">₹{m.pricePerSession}</div>
                        <div className="text-xs text-slate-500">per session</div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Stars value={m.rating} />
                        <div className="text-xs text-slate-500">{m.languages?.join(", ")}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openMentorDetail(m.id)} className="px-3 py-1 rounded bg-white border">View</button>
                        <button onClick={() => bookMentorSession(m)} className="px-3 py-1 rounded" style={{ background: PALETTE.emerald, color: "white" }}>Book</button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* PAGE 7 - Mentor detail */}
        {page === 7 && currentUser && currentUser.role === "investor" && selectedMentor && (
          <section className="bg-white rounded shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-lg font-semibold">{selectedMentor.name} {selectedMentor.verified && <span className="text-xs text-emerald-500 ml-2">✔ Verified</span>}</div>
                <div className="text-xs text-slate-500">{selectedMentor.languages?.join(", ")}</div>
              </div>
              <div>
                <div className="text-sm font-semibold">₹{selectedMentor.pricePerSession}</div>
                <div className="text-xs text-slate-500">per session</div>
              </div>
            </div>

            <div className="text-sm text-slate-700 mb-4">{selectedMentor.shortBio}</div>

            <div className="flex items-center gap-4 mb-4">
              <Stars value={selectedMentor.rating} />
              <div className="text-xs text-slate-500">Rating based on mock data</div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => bookMentorSession(selectedMentor)} className="px-4 py-2 rounded" style={{ background: PALETTE.emerald, color: "white" }}>
                Book Session · ₹{selectedMentor.pricePerSession}
              </button>
              <button onClick={() => setPage(6)} className="px-4 py-2 rounded bg-white border">Back to mentors</button>
            </div>
          </section>
        )}
      </main>

      <footer className="text-center text-xs text-slate-500 py-6">SafeGrow prototype • Replace mocked flows with production services (KYC, verification, AI, payments).</footer>
    </div>
  );
}

// -----------------------------
// Subcomponents

function AiChat({ onAnswer }: { onAnswer: (s: string) => void }) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!q.trim()) return;
    setLoading(true);
    const scam = await checkForScam(q);
    if (!scam.safe) {
      onAnswer("This message looks suspicious. Please do not rely on unverified investment advice.");
      setLoading(false);
      return;
    }
    const reply = await askFinanceBot(q);
    onAnswer(reply);
    setLoading(false);
  }

  return (
    <div>
      <textarea value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask a simple question..." className="w-full border rounded px-2 py-2" />
      <div className="flex gap-2 mt-2">
        <button onClick={submit} className="px-3 py-1 rounded" style={{ background: PALETTE.navy, color: "white" }}>Ask</button>
        <button onClick={() => setQ("Explain SIP in simple terms.")} className="px-3 py-1 rounded border">Example</button>
      </div>
      {loading && <div className="mt-2 text-sm text-slate-500">Thinking...</div>}
    </div>
  );
}
