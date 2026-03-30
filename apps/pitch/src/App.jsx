import React, { useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';
import firebaseLogo from './assets/firebase.svg';
import tailwindLogo from './assets/tailwind.svg';

const Card = ({ title, desc, children, delay }) => (
  <div className={`p-8 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] hover:bg-slate-800/80 transition-all duration-500 shadow-2xl animate-in fade-in slide-in-from-bottom flex flex-col`} style={{ animationDelay: delay }}>
    <h3 className="text-2xl font-black text-white mb-3">{title}</h3>
    <p className="text-slate-400 text-[15px] leading-relaxed mb-6 font-bold">{desc}</p>
    <div className="mt-auto">{children}</div>
  </div>
);

const CodeBlock = ({ label, code }) => (
  <div className="mt-4 rounded-xl overflow-hidden border border-slate-700/50 shadow-inner">
    <div className="bg-slate-900/80 px-4 py-2 text-[10px] font-black tracking-widest uppercase text-slate-500 border-b border-slate-800 flex justify-between">
      <span>{label}</span>
      <span className="text-emerald-500">Firebase Firestore</span>
    </div>
    <pre className="p-4 text-[12px] font-mono leading-relaxed bg-black/40 text-indigo-300 overflow-x-auto">
      <code>{code}</code>
    </pre>
  </div>
);

const App = () => {
  useEffect(() => {
    // Force reset body overflow just in case the old presentation mode locked it
    document.body.style.overflow = 'auto';
  }, []);

  return (
    <div className="h-screen w-full overflow-y-auto overflow-x-hidden bg-slate-950 font-sans text-slate-50 selection:bg-indigo-500 selection:text-white relative">

      {/* 🚀 FIXED HEADER */}
      <header className="fixed top-0 inset-x-0 z-50 flex flex-wrap gap-4 items-center justify-between px-4 sm:px-8 py-3 sm:py-5 bg-slate-900/70 backdrop-blur-2xl border-b border-slate-800 shadow-2xl">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.5)]">
            <img src="/favicon.svg" alt="logo" className="w-6 h-6 sm:w-7 sm:h-7 object-contain invert brightness-0" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white leading-none">UrbanGhar</h1>
            <span className="text-[9px] sm:text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mt-1">Ecosystem Architecture Deck</span>
          </div>
        </div>
        <a href="http://localhost:5174" target="_blank" rel="noopener noreferrer" className="px-4 py-2 sm:px-6 sm:py-3 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-white/20 whitespace-nowrap">
          Exit to Live App ✕
        </a>
      </header>

      {/* 🌟 HERO SECTION */}
      <section className="relative min-h-[95vh] flex flex-col items-center justify-center px-8 text-center pt-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.15)_0,rgba(15,23,42,1)_100%)] -z-10"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-indigo-500/20 blur-[150px] rounded-full animate-pulse -z-10"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-violet-500/20 blur-[150px] rounded-full animate-pulse delay-1000 -z-10"></div>

        <div className="px-5 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-indigo-400 text-xs font-black tracking-[0.3em] uppercase mb-10 shadow-lg backdrop-blur-sm transform hover:scale-105 transition-transform cursor-default">
          Comprehensive Platform Breakdown
        </div>

        <h2 className="text-5xl sm:text-6xl md:text-8xl font-black mb-6 sm:mb-8 leading-[1.1] max-w-5xl mx-auto drop-shadow-2xl">
          UrbanGhar.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 animate-gradient bg-[length:200%_auto]">Breaking Ecosystem.</span>
        </h2>

        <p className="text-xl md:text-2xl text-slate-400 font-bold max-w-4xl mx-auto mb-16 leading-relaxed">
          UrbanGhar is engineered as three independent, hyper-focused React portals connected natively through Firebase's instantaneous real-time WebSockets. This architecture ensures total isolation of concerns while maintaining a global, live data state.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mx-auto mt-10">
          <div className="p-6 bg-slate-900/50 rounded-3xl border border-indigo-500/30 backdrop-blur-md">
            <h4 className="text-3xl font-black text-indigo-400 mb-2">01</h4>
            <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">User Portal</p>
          </div>
          <div className="p-6 bg-slate-900/50 rounded-3xl border border-violet-500/30 backdrop-blur-md">
            <h4 className="text-3xl font-black text-violet-400 mb-2">02</h4>
            <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">Owner Management</p>
          </div>
          <div className="p-6 bg-slate-900/50 rounded-3xl border border-emerald-500/30 backdrop-blur-md">
            <h4 className="text-3xl font-black text-emerald-400 mb-2">03</h4>
            <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">Admin Center</p>
          </div>
        </div>

        <div className="mt-16 mb-4 animate-bounce">
          <svg className="w-8 h-8 text-indigo-500 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </section>

      {/* 🚀 APP 1: HOME/CONSUMER DISCOVERY */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 relative border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">

          <div className="flex flex-col lg:flex-row gap-16 items-center mb-16">
            <div className="lg:w-1/2">
              <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs uppercase tracking-widest mb-6 border border-blue-500/30">Consumer Interface</div>
              <h2 className="text-5xl font-black text-white mb-6">01 | The User Portal</h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-6 font-bold">
                The public-facing frontend built for speed and high-conversion student/tenant acquisition.
              </p>
              <ul className="space-y-4 text-slate-300 font-bold">
                <li className="flex gap-4 items-start"><span className="text-blue-500 text-xl font-black">✓</span> <span><strong className="text-white">Live Listing Streams:</strong> Utilizing onSnapshot listeners, the UI repaints instantly when an owner updates rent or availability—zero refreshes required.</span></li>
                <li className="flex gap-4 items-start"><span className="text-blue-500 text-xl font-black">✓</span> <span><strong className="text-white">Encrypted Contact Engine:</strong> Direct chat mapping via Firestore root collections (messages/visits) targets owner UIDs for secure, instant communication.</span></li>
                <li className="flex gap-4 items-start"><span className="text-blue-500 text-xl font-black">✓</span> <span><strong className="text-white">State Management:</strong> High-definition imagery and property modals managed via local React state for a "Zero-Latency" feel.</span></li>
              </ul>
            </div>

            {/* UI Mockup Illustration */}
            <div className="lg:w-1/2 w-full">
              <div className="w-full bg-slate-800 rounded-[2.5rem] border border-slate-700 shadow-2xl overflow-hidden relative group">
                <div className="h-10 bg-slate-900 border-b border-slate-700 flex items-center px-6 gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div><div className="w-3 h-3 rounded-full bg-amber-500"></div><div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <div className="ml-4 flex-1 h-5 bg-slate-800 rounded-md"></div>
                </div>
                <div className="p-6 h-[400px] bg-white/5 relative">
                  <div className="w-full h-40 bg-[url('https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center rounded-2xl mb-4 group-hover:scale-105 transition-transform duration-700"></div>
                  <div className="h-6 w-3/4 bg-blue-500 rounded-md mb-2"></div>
                  <div className="h-4 w-1/2 bg-slate-600 rounded-md mb-6"></div>
                  <div className="flex gap-3 mt-auto">
                    <div className="h-10 w-1/2 bg-blue-600 rounded-xl"></div>
                    <div className="h-10 w-1/2 border border-slate-600 rounded-xl"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:max-w-4xl mx-auto gap-8">
            <Card title="Live Pulse Data Streams" desc="Instant data mapping securely handled on the frontend via Google's ultra-low latency WebSocket connections." delay="0s">
              <CodeBlock label="Example: The Live Pulse" code={`// Example: The Live Pulse
onSnapshot(query(collection(db, "listings")), snap => {
  const pgs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  setPgListings(pgs); // UI instantly repaints
});`} />
            </Card>
          </div>
        </div>
      </section>

      {/* 🛡️ APP 2: OWNER PARTNER MANAGEMENT */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 relative bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">

          <div className="flex flex-col lg:flex-row-reverse gap-16 items-center mb-16">
            <div className="lg:w-1/2">
              <div className="inline-block px-4 py-1.5 rounded-full bg-violet-500/20 text-violet-400 font-bold text-xs uppercase tracking-widest mb-6 border border-violet-500/30">B2B Powerhouse</div>
              <h2 className="text-5xl font-black text-white mb-6">02 | Owner Management</h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-6 font-bold">
                An isolated powerhouse for property managers to control their listings and track inbound leads.
              </p>
              <ul className="space-y-4 text-slate-300 font-bold">
                <li className="flex gap-4 items-start"><span className="text-violet-500 text-xl font-black">✓</span> <span><strong className="text-white">KYC Verification Gate:</strong> Strict middleware prevents access until the Admin marks the account as active.</span></li>
                <li className="flex gap-4 items-start"><span className="text-violet-500 text-xl font-black">✓</span> <span><strong className="text-white">Scoped Multi-Tenancy:</strong> Advanced Firestore indexing ensures owners only ever see data (chats/visits) strictly scoped to their unique ownerId.</span></li>
                <li className="flex gap-4 items-start"><span className="text-violet-500 text-xl font-black">✓</span> <span><strong className="text-white">One-Click Deployment:</strong> Manual property entry that maps immediately to the global listings collection.</span></li>
              </ul>
            </div>

            {/* UI Mockup Illustration */}
            <div className="lg:w-1/2 w-full">
              <div className="w-full bg-slate-900 rounded-[2.5rem] border border-violet-500/30 shadow-[0_0_50px_rgba(139,92,246,0.1)] overflow-hidden relative">
                <div className="flex h-[400px]">
                  <div className="w-1/3 border-r border-slate-800 bg-slate-950 p-6 flex flex-col gap-4">
                    <div className="w-12 h-12 bg-violet-600 rounded-full mb-6 relative"><div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900"></div></div>
                    <div className="h-6 bg-slate-800 rounded"></div>
                    <div className="h-6 bg-violet-500/20 text-violet-400 rounded"></div>
                    <div className="h-6 bg-slate-800 rounded"></div>
                  </div>
                  <div className="flex-1 p-6 relative bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.1)_0,transparent_100%)]">
                    <div className="flex gap-4 mb-8">
                      <div className="w-1/2 h-24 bg-slate-800 rounded-2xl border border-slate-700"></div>
                      <div className="w-1/2 h-24 bg-slate-800 rounded-2xl border border-slate-700"></div>
                    </div>
                    <div className="w-full h-8 bg-slate-800 rounded mb-4"></div>
                    <div className="w-3/4 h-8 bg-slate-800 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:max-w-4xl mx-auto gap-8">
            <Card title="Database Security Logic" desc="Owners are completely locked out of the core app if their KYC isn't verified." delay="0s">
              <CodeBlock label="Security Logic: Verification Middleware" code={`// Security Logic: Verification Middleware
const userDoc = await getDoc(doc(db, "owners", uid));
if (userDoc.exists() && userDoc.data().status !== "active") {
  await auth.signOut();
  alert("Account under verification.");
}`} />
            </Card>
          </div>
        </div>
      </section>

      {/* 📊 APP 3: ADMIN COMMAND CENTER */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 relative border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">

          <div className="flex flex-col lg:flex-row gap-16 items-center mb-16">
            <div className="lg:w-1/2">
              <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs uppercase tracking-widest mb-6 border border-emerald-500/30">The "God-View" Terminal</div>
              <h2 className="text-5xl font-black text-white mb-6">03 | Admin Center</h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-6 font-bold">
                A restricted, internal terminal for total platform oversight and data-driven decision-making.
              </p>
              <ul className="space-y-4 text-slate-300 font-bold">
                <li className="flex gap-4 items-start"><span className="text-emerald-500 text-xl font-black">✓</span> <span><strong className="text-white">Real-time KPI Tracking:</strong> Aggregates data arrays across consumers, owners, and visits to render live conversion metrics.</span></li>
                <li className="flex gap-4 items-start"><span className="text-emerald-500 text-xl font-black">✓</span> <span><strong className="text-white">Client-Side Export Engine:</strong> Uses xlsx utility plugins to compile thousands of rows into Excel spreadsheets directly in the browser's RAM, reducing server overhead to 0.</span></li>
                <li className="flex gap-4 items-start"><span className="text-emerald-500 text-xl font-black">✓</span> <span><strong className="text-white">Global Moderation:</strong> Instant updateDoc triggers that grant or revoke platform access in milliseconds.</span></li>
              </ul>
            </div>

            {/* UI Mockup Illustration */}
            <div className="lg:w-1/2 w-full">
              <div className="w-full h-[400px] bg-white rounded-[2.5rem] shadow-[0_30px_60px_rgba(16,185,129,0.2)] overflow-hidden relative flex flex-col p-8 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-slate-900">Platform Analytics</h3>
                  <div className="px-4 py-2 bg-emerald-100 text-emerald-700 font-black text-xs rounded-xl uppercase">Export XLSX</div>
                </div>
                {/* Simulated Recharts bar chart */}
                <div className="flex-1 flex items-end gap-4 border-b-2 border-slate-100 pb-4">
                  <div className="flex-1 bg-indigo-500 rounded-t-xl h-[40%] hover:brightness-110 shadow-sm"></div>
                  <div className="flex-1 bg-emerald-400 rounded-t-xl h-[80%] hover:brightness-110 shadow-sm"></div>
                  <div className="flex-1 bg-pink-500 rounded-t-xl h-[60%] hover:brightness-110 shadow-sm"></div>
                  <div className="flex-1 bg-violet-500 rounded-t-xl h-[30%] hover:brightness-110 shadow-sm"></div>
                </div>
                <div className="flex justify-between mt-4">
                  <div className="h-2 w-16 bg-slate-200 rounded"></div>
                  <div className="h-2 w-16 bg-slate-200 rounded"></div>
                  <div className="h-2 w-16 bg-slate-200 rounded"></div>
                  <div className="h-2 w-16 bg-slate-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:max-w-4xl mx-auto gap-8">
            <Card title="XLSX Export Generation" desc="By passing local JSON maps into 'xlsx' utility plugins via the browser, UrbanGhar admins can rip thousands of rows to Excel in milliseconds." delay="0s">
              <CodeBlock label="Local Excel Compilation (Zero Backend Overhead)" code={`// Local Excel Compilation (Zero Backend Overhead)
import * as XLSX from 'xlsx';
const sheet = XLSX.utils.json_to_sheet(rawListingsMap);
XLSX.writeFile(wb, "UrbanGhar_Report.xlsx");`} />
            </Card>
          </div>
        </div>
      </section>

      {/* 🖼️ PORTAL SIGNUPS SHOWCASE */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 relative bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-14">
            <div className="inline-block px-4 py-1.5 rounded-full bg-rose-500/20 text-rose-400 font-bold text-xs uppercase tracking-widest mb-6 border border-rose-500/30">Authentication UX</div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">Portal Sign-In Screens</h2>
            <p className="text-slate-400 text-lg font-bold max-w-2xl mx-auto">All three portals share a unified split-layout design system — each with a unique identity, illustration, and persona tailored to their audience.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── 01: Consumer / Home Portal ── */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-black">01</div>
                <div>
                  <p className="text-white font-black text-sm">Consumer Portal</p>
                  <p className="text-slate-500 text-[11px] font-bold">localhost:5174</p>
                </div>
              </div>
              {/* Browser Frame */}
              <div className="w-full bg-slate-800 rounded-2xl border border-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.1)] overflow-hidden">
                <div className="h-8 bg-slate-900 border-b border-slate-700 flex items-center px-4 gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <div className="ml-3 flex-1 h-4 bg-slate-800 rounded text-[9px] text-slate-500 flex items-center px-2 font-mono">localhost:5174</div>
                </div>
                {/* Modal Preview */}
                <div className="p-4 bg-slate-700/30">
                  <div className="bg-white rounded-xl overflow-hidden flex h-44 shadow-2xl">
                    {/* Left illus */}
                    <div className="w-2/5 bg-[#F6F7F9] flex flex-col items-center justify-center p-3 gap-2">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">🏠</div>
                      <div className="text-[8px] font-black text-blue-600 uppercase tracking-wider text-center">User Portal</div>
                    </div>
                    {/* Right form */}
                    <div className="flex-1 p-3 flex flex-col justify-center gap-2">
                      <div className="flex gap-1 mb-1">
                        <div className="flex-1 h-4 bg-slate-100 rounded text-[7px] text-slate-600 flex items-center justify-center font-black">LOGIN</div>
                        <div className="flex-1 h-4 bg-white border border-slate-200 rounded text-[7px] text-slate-400 flex items-center justify-center">SIGNUP</div>
                      </div>
                      <div className="h-3 bg-slate-800 rounded w-4/5 mb-0.5"></div>
                      <div className="h-2 bg-slate-200 rounded w-3/4 mb-1"></div>
                      <div className="border border-slate-200 rounded-md px-2 py-1.5 relative">
                        <div className="text-[7px] text-slate-400 leading-none mb-0.5">Mobile Number</div>
                        <div className="text-[8px] font-bold text-slate-700">+91 - </div>
                      </div>
                      <div className="border border-slate-200 rounded-md px-2 py-1.5 relative">
                        <div className="text-[7px] text-slate-400 leading-none mb-0.5">Password</div>
                        <div className="text-[8px] font-bold text-slate-400">••••••••</div>
                      </div>
                      <div className="h-5 bg-slate-300 rounded-md flex items-center justify-center">
                        <span className="text-[8px] font-black text-white">Sign In</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-blue-300 font-bold text-xs mb-1">Audience</p>
                <p className="text-slate-300 text-sm font-bold">Students & Working Professionals looking for PG accommodations in Bhubaneswar.</p>
              </div>
            </div>

            {/* ── 02: Owner Portal ── */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 text-xs font-black">02</div>
                <div>
                  <p className="text-white font-black text-sm">Owner Portal</p>
                  <p className="text-slate-500 text-[11px] font-bold">localhost:5175</p>
                </div>
              </div>
              {/* Browser Frame */}
              <div className="w-full bg-slate-800 rounded-2xl border border-violet-500/20 shadow-[0_0_40px_rgba(139,92,246,0.1)] overflow-hidden">
                <div className="h-8 bg-slate-900 border-b border-slate-700 flex items-center px-4 gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <div className="ml-3 flex-1 h-4 bg-slate-800 rounded text-[9px] text-slate-500 flex items-center px-2 font-mono">localhost:5175</div>
                </div>
                {/* Modal Preview */}
                <div className="p-4 bg-slate-700/30">
                  <div className="bg-white rounded-xl overflow-hidden flex h-44 shadow-2xl">
                    {/* Left illus */}
                    <div className="w-2/5 bg-[#F0F4FF] flex flex-col items-center justify-center p-3 gap-2">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-2xl">🏢</div>
                      <div className="text-[8px] font-black text-indigo-700 uppercase tracking-wider text-center">Partner Portal</div>
                    </div>
                    {/* Right form */}
                    <div className="flex-1 p-3 flex flex-col justify-center gap-2">
                      <div className="flex gap-1 mb-1">
                        <div className="flex-1 h-4 bg-slate-100 rounded text-[7px] text-slate-600 flex items-center justify-center font-black">LOGIN</div>
                        <div className="flex-1 h-4 bg-white border border-slate-200 rounded text-[7px] text-slate-400 flex items-center justify-center">JOIN</div>
                      </div>
                      <div className="h-3 bg-slate-800 rounded w-4/5 mb-0.5"></div>
                      <div className="h-2 bg-slate-200 rounded w-3/4 mb-1"></div>
                      <div className="border border-slate-200 rounded-md px-2 py-1.5 relative">
                        <div className="text-[7px] text-slate-400 leading-none mb-0.5">Mobile Number</div>
                        <div className="text-[8px] font-bold text-slate-700">+91 - </div>
                      </div>
                      <div className="border border-slate-200 rounded-md px-2 py-1.5 relative">
                        <div className="text-[7px] text-slate-400 leading-none mb-0.5">Password</div>
                        <div className="text-[8px] font-bold text-slate-400">••••••••</div>
                      </div>
                      <div className="h-5 bg-indigo-500 rounded-md flex items-center justify-center">
                        <span className="text-[8px] font-black text-white">Access Dashboard</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4">
                <p className="text-violet-300 font-bold text-xs mb-1">Audience</p>
                <p className="text-slate-300 text-sm font-bold">KYC-verified PG owners & property managers who list and manage their accommodations.</p>
              </div>
            </div>

            {/* ── 03: Admin / Management Portal ── */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-black">03</div>
                <div>
                  <p className="text-white font-black text-sm">Admin Portal</p>
                  <p className="text-slate-500 text-[11px] font-bold">localhost:5176</p>
                </div>
              </div>
              {/* Browser Frame */}
              <div className="w-full bg-slate-800 rounded-2xl border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)] overflow-hidden">
                <div className="h-8 bg-slate-900 border-b border-slate-700 flex items-center px-4 gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <div className="ml-3 flex-1 h-4 bg-slate-800 rounded text-[9px] text-slate-500 flex items-center px-2 font-mono">localhost:5176</div>
                </div>
                {/* Modal Preview */}
                <div className="p-4 bg-slate-700/30">
                  <div className="bg-white rounded-xl overflow-hidden flex h-44 shadow-2xl">
                    {/* Left illus - dark admin theme */}
                    <div className="w-2/5 bg-[#0F172A] flex flex-col items-center justify-center p-3 gap-2">
                      <div className="w-12 h-12 rounded-full bg-indigo-900/50 border border-indigo-500/30 flex items-center justify-center text-2xl">📊</div>
                      <div className="text-[8px] font-black text-indigo-400 uppercase tracking-wider text-center">Admin Center</div>
                    </div>
                    {/* Right form */}
                    <div className="flex-1 p-3 flex flex-col justify-center gap-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-4 h-4 bg-indigo-600 rounded flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-sm"></div>
                        </div>
                        <div className="h-2 bg-slate-800 rounded w-16"></div>
                      </div>
                      <div className="h-3 bg-slate-800 rounded w-3/5 mb-0.5"></div>
                      <div className="h-2 bg-slate-200 rounded w-4/5 mb-1"></div>
                      <div className="border border-slate-200 rounded-md px-2 py-1.5 relative">
                        <div className="text-[7px] text-slate-400 leading-none mb-0.5">Admin ID</div>
                        <div className="text-[8px] font-bold text-slate-400">admin@urbanghar.com</div>
                      </div>
                      <div className="border border-slate-200 rounded-md px-2 py-1.5 relative">
                        <div className="text-[7px] text-slate-400 leading-none mb-0.5">Password</div>
                        <div className="text-[8px] font-bold text-slate-400">••••••••</div>
                      </div>
                      <div className="h-5 bg-slate-900 rounded-md flex items-center justify-center">
                        <span className="text-[8px] font-black text-white">Authenticate</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <p className="text-emerald-300 font-bold text-xs mb-1">Audience</p>
                <p className="text-slate-300 text-sm font-bold">Internal UrbanGhar admins with full platform oversight, KYC control & analytics access.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 💻 TECH STACK SECTION */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 relative bg-slate-950 border-t border-slate-800 flex flex-col items-center">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-12 sm:mb-16 drop-shadow-xl text-center">
          The Tech Stack
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
          {/* Frontend */}
          <div className="bg-slate-900/80 p-8 rounded-[2rem] border border-indigo-500/30 shadow-[0_0_30px_rgba(79,70,229,0.1)] hover:scale-[1.02] transition-transform flex flex-col gap-4">
            <span className="text-indigo-400 font-black text-xs uppercase tracking-widest">Frontend</span>
            <div className="flex items-center gap-5">
              <img src={reactLogo} alt="React" className="w-12 h-12" />
              <img src={viteLogo} alt="Vite" className="w-12 h-12" />
              <p className="text-white font-bold text-xl ml-2 leading-tight">React.js + Vite<br /><span className="text-sm font-medium text-slate-400">Micro-frontend</span></p>
            </div>
          </div>

          {/* Backend */}
          <div className="bg-slate-900/80 p-8 rounded-[2rem] border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)] hover:scale-[1.02] transition-transform flex flex-col gap-4">
            <span className="text-emerald-400 font-black text-xs uppercase tracking-widest">Backend</span>
            <div className="flex items-center gap-5">
              <img src={firebaseLogo} alt="Firebase" className="w-12 h-12" />
              <p className="text-white font-bold text-xl ml-2 leading-tight">Firebase<br /><span className="text-sm font-medium text-slate-400">Firestore, Auth, Hosting</span></p>
            </div>
          </div>

          {/* Styling */}
          <div className="bg-slate-900/80 p-8 rounded-[2rem] border border-violet-500/30 shadow-[0_0_30px_rgba(139,92,246,0.1)] hover:scale-[1.02] transition-transform flex flex-col gap-4">
            <span className="text-violet-400 font-black text-xs uppercase tracking-widest">Styling</span>
            <div className="flex items-center gap-5">
              <img src={tailwindLogo} alt="Tailwind CSS" className="w-12 h-12" />
              <p className="text-white font-bold text-xl ml-2 leading-tight">Tailwind CSS<br /><span className="text-sm font-medium text-slate-400">Utility-First Design</span></p>
            </div>
          </div>

          {/* Data Processing */}
          <div className="bg-slate-900/80 p-8 rounded-[2rem] border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:scale-[1.02] transition-transform flex flex-col gap-4">
            <span className="text-blue-400 font-black text-xs uppercase tracking-widest">Data Processing</span>
            <div className="flex items-center gap-5">
              <svg viewBox="0 0 48 48" className="w-12 h-12">
                <path fill="#4CAF50" d="M41,10H25v28h16c0.553,0,1-0.447,1-1V11C42,10.447,41.553,10,41,10z" />
                <path fill="#43A047" d="M32,15h7v3h-7V15z M32,22h7v3h-7V22z M32,29h7v3h-7V29z" />
                <path fill="#2E7D32" d="M25,10h7v28h-7V10z" />
                <path fill="#1B5E20" d="M25,15h7v3h-7V15z M25,22h7v3h-7V22z M25,29h7v3h-7V29z" />
                <path fill="#388E3C" d="M7,12h18v24H7C5.895,36,5,35.105,5,34V14C5,12.895,5.895,12,7,12z" />
                <path fill="#FFFFFF" d="M11.646,28l2.489-4.996L11.53,18h2.3l1.516,3.673L16.89,18h2.247l-2.673,5.068L19.267,28h-2.316l-1.637-3.924L13.79,28H11.646z" />
              </svg>
              <p className="text-white font-bold text-xl ml-2 leading-tight">XLSX.js<br /><span className="text-sm font-medium text-slate-400">Local zero-load reporting</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* 🏁 BOTTOM CLOSING */}
      <section className="py-20 sm:py-32 px-4 sm:px-8 flex items-center justify-center bg-indigo-600 text-center relative overflow-hidden min-h-[60vh]">
        <div className="absolute inset-0 bg-slate-950 mix-blend-overlay opacity-50"></div>

        <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white shadow-2xl rounded-3xl p-4 sm:p-5 mb-8 sm:mb-10 transform -rotate-6 hover:rotate-6 transition-transform">
            <img src="/favicon.svg" alt="logo" className="w-full h-full object-contain" />
          </div>

          <div className="mb-8 sm:mb-12">
            <p className="text-emerald-400 font-black text-xl sm:text-2xl md:text-3xl uppercase tracking-widest mb-4 sm:mb-6 drop-shadow-sm">Architecture Status: Ready for Execution.</p>
            <p className="text-lg sm:text-xl md:text-2xl text-slate-100 font-bold max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
              This deck confirms the unified data schema connecting our distinct Vite micro-frontends.
            </p>
          </div>

          <a href="http://localhost:5174" target="_blank" rel="noopener noreferrer" className="mt-8 px-6 py-4 sm:px-10 sm:py-5 bg-white text-indigo-700 rounded-2xl font-black text-xs sm:text-sm md:text-base uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-2xl hover:scale-110 transform">
            Kill Presentation & View Primary Portal
          </a>
        </div>
      </section>

    </div>
  );
};

export default App;
