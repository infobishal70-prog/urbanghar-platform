import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Cell, PieChart, Pie 
} from 'recharts';
import { 
  TrendingUp, Users, MapPin, Star, ShieldCheck, 
  BarChart3, MessageSquare, LayoutDashboard, Settings, LogOut, CheckCircle, XCircle 
} from 'lucide-react';
import { auth, db } from './firebaseConfig';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';

const App = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [activeTab, setActiveTab] = useState('analytics');
  const [pendingOwners, setPendingOwners] = useState([]);
  const [fetchError, setFetchError] = useState(null);

  // Ecosystem States for Realtime Insights
  const [consumersCount, setConsumersCount] = useState(0);
  const [ownersCount, setOwnersCount] = useState(0);
  const [visitsCount, setVisitsCount] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [listings, setListings] = useState([]);

  // AUTH OBSERVER
  React.useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
  }, []);

  // FETCH DASHBOARD DATA
  useEffect(() => {
    if (!user) return;
    
    // Listen to Pending Owners
    const qPending = query(collection(db, "owners"), where("status", "==", "pending_verification"));
    const unsubPending = onSnapshot(qPending, (snapshot) => {
      setPendingOwners(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setFetchError(null);
    }, (error) => setFetchError(error.message));

    // Listen to Entire Ecosystem Sizes
    const unsubConsumers = onSnapshot(collection(db, "consumers"), snap => setConsumersCount(snap.size));
    const unsubOwners = onSnapshot(collection(db, "owners"), snap => setOwnersCount(snap.size));
    const unsubVisits = onSnapshot(collection(db, "visits"), snap => setVisitsCount(snap.size));
    const unsubReviews = onSnapshot(collection(db, "reviews"), snap => setReviewsCount(snap.size));
    
    // Listen to Full Real-time Listings for Aggregation
    const unsubListings = onSnapshot(collection(db, "listings"), (snap) => {
      setListings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubPending(); unsubConsumers(); unsubOwners(); unsubVisits(); unsubReviews(); unsubListings();
    };
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Direct login without role check (as previous)
      const finalEmail = email.includes('@') ? email.trim() : `${email.trim()}@urbanghar.com`;
      await signInWithEmailAndPassword(auth, finalEmail, password);
    } catch (error) {
      alert("Admin Login Failed: " + error.message + " (Hint: If using phone, just enter the 10-digit number)");
    }
  };

  const handleLogout = () => signOut(auth);

  const handleVerification = async (userId, newStatus) => {
    const finalStatus = newStatus === 'approved' ? 'active' : 'rejected';
    try {
      await updateDoc(doc(db, "users", userId), { status: finalStatus });
      alert(`Account ${finalStatus} successfully!`);
    } catch (error) {
      alert("Error updating status: " + error.message);
    }
  };

  // MOCK ANALYTICS FOR EMPTY CHARTS
  const conversionData = [
    { name: 'Jan', rate: 2.1 },
    { name: 'Feb', rate: 3.5 },
    { name: 'Mar', rate: 4.8 },
    { name: 'Apr', rate: 7.2 },
  ];

  // LIVE INSIGHT CALCULATIONS
  const totalUsers = consumersCount + ownersCount;
  const avgConversionRaw = totalUsers > 0 ? ((visitsCount / totalUsers) * 100).toFixed(1) : "0.0";
  
  const calculateLocalityPopularity = () => {
    const locMap = {};
    listings.forEach(l => {
        let loc = (l.location || l.address || "Unknown City").split(',')[0].trim();
        locMap[loc] = (locMap[loc] || 0) + 1;
    });
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#3b82f6'];
    return Object.entries(locMap)
      .map(([name, count], idx) => ({ name, count, color: colors[idx % colors.length] }))
      .sort((a,b) => b.count - a.count)
      .slice(0, 4); // Top 4 places
  };
  
  const liveLocalityData = calculateLocalityPopularity().length > 0 
      ? calculateLocalityPopularity() 
      : [{ name: "No Data", count: 0, color: '#e2e8f0'}];

  // EXCEL EXPORT ENGINE
  const handleExportData = () => {
     // 1. Metric Array
     const summaryData = [
         { Metric: "Total Platform Users", Value: totalUsers },
         { Metric: "Average Platform Conversion (%)", Value: avgConversionRaw },
         { Metric: "Total Property Listings", Value: listings.length },
         { Metric: "Total Visits Configured", Value: visitsCount },
         { Metric: "Total Reviews Handled", Value: reviewsCount },
         { Metric: "Verified Consumer Signups", Value: consumersCount },
         { Metric: "Verified Partner Accounts", Value: ownersCount }
     ];
     // 2. Localities
     const rawLocality = liveLocalityData.map(loc => ({ Locality: loc.name, PropertiesListed: loc.count }));
     
     // 3. Raw Listings Master Data
     const rawListings = listings.map(l => ({
        ID: l.id,
        Title: l.title,
        Type: String(l.type || "").toUpperCase(),
        Location: l.location,
        BasePrice: l.price,
        Owner: l.owner_name || l.owner,
        BedsAssigned: `${l.availableBeds || "0"}/${l.totalBeds || "0"}`,
        ActiveStatus: l.status || "Available"
     }));

     // Build virtual book mapping
     const wb = XLSX.utils.book_new();
     XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), "Platform High-Level");
     XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rawLocality), "Analytics By Region");
     XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rawListings), "Live Property Database");
     
     // Trigger binary download
     XLSX.writeFile(wb, `UrbanGhar_Ecosystem_Report_${new Date().toLocaleDateString().replace(/\//g,'-')}.xlsx`);
  };

  const mockReviews = [
    { id: 1, user: "Amit S.", property: "Elite Boys Stay", rating: 5, comment: "Amazing facilities and very clean!", status: "approved" },
    { id: 2, user: "Priya K.", property: "Zolo Scholar", rating: 4, comment: "Good security, but food can be better.", status: "pending" },
  ];

  if (authLoading) return <div className="h-screen flex items-center justify-center bg-slate-50 font-black text-indigo-600 animate-pulse text-2xl">URBANGHAR ADMIN...</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F7F9] font-sans p-4">
        <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-4xl flex flex-col md:flex-row max-h-[90vh] overflow-y-auto overflow-x-hidden animate-in zoom-in duration-300">
          
          {/* Left: Illustration */}
          <div className="hidden md:flex flex-col items-center justify-center w-5/12 bg-[#0F172A] p-10 relative overflow-hidden">
            {/* Glow effects */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/15 blur-[70px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/15 blur-[70px] rounded-full"></div>
            {/* Main illustration */}
            <div className="relative z-10">
              <div className="w-36 h-36 bg-indigo-900/60 border-2 border-indigo-500/30 rounded-full flex items-center justify-center text-7xl shadow-2xl shadow-indigo-900">
                👩‍💻
              </div>
              {/* Chart badge */}
              <div className="absolute -top-2 -right-4 w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/50">
                📊
              </div>
              {/* Live status tag */}
              <div className="absolute -bottom-4 -left-8 px-3 py-1.5 bg-slate-800 border border-indigo-500/30 rounded-xl flex items-center gap-2 shadow-lg">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-indigo-300 uppercase tracking-wider">Live Analytics</span>
              </div>
            </div>
            <p className="text-indigo-400 font-black text-sm uppercase tracking-widest mt-12 text-center relative z-10">Internal Admin Command Center</p>
          </div>

          {/* Right: Form */}
          <div className="p-8 md:p-14 w-full md:w-7/12 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center p-1.5 shadow-lg shadow-indigo-200">
                <img src="/favicon.svg" className="w-full h-full object-contain invert brightness-0" alt="UrbanGhar Logo" />
              </div>
              <div>
                <span className="font-black text-slate-800 text-lg block leading-none">UrbanGhar</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin Center</span>
              </div>
            </div>

            <h3 className="text-[28px] font-semibold text-[#222222] mb-1 leading-tight">Admin Portal</h3>
            <p className="text-[#666666] text-[14px] mb-8 max-w-sm">
              Internal Access Only — For authorized UrbanGhar administrators.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative border border-[#CCCCCC] rounded-xl focus-within:border-[#222222] transition-all overflow-hidden bg-white">
                <label className="absolute top-2 left-4 text-[11px] text-[#666666]">Admin ID</label>
                <input 
                  required type="text"
                  className="w-full pl-4 pr-4 pt-6 pb-2 outline-none text-[15px] font-medium text-[#222222] bg-transparent"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="relative border border-[#CCCCCC] rounded-xl focus-within:border-[#222222] transition-all overflow-hidden bg-white">
                <label className="absolute top-2 left-4 text-[11px] text-[#666666]">Password</label>
                <input 
                  required type="password" placeholder="••••••••"
                  className="w-full pl-4 pr-4 pt-6 pb-2 outline-none text-[15px] font-medium text-[#222222] bg-transparent"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full py-4 rounded-xl font-bold text-[15px] transition-all bg-slate-900 hover:bg-slate-800 text-white shadow-lg">
                  Authenticate
                </button>
              </div>
            </form>

            <p className="text-[11px] text-[#888888] mt-8 leading-relaxed max-w-sm">
              This portal is restricted to authorized administrators only. Unauthorized access attempts are logged and monitored. By proceeding, you agree to our <a href="#" className="underline hover:text-[#222222]">Internal Usage Policy</a> and <a href="#" className="underline hover:text-[#222222]">Security Terms</a>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-sans text-slate-900">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-72 bg-white border-r border-slate-200 flex flex-col md:h-screen sticky top-0 shrink-0 z-20">
        <div className="p-4 sm:p-8 border-b border-slate-100 flex items-center md:items-start md:flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <img src="/favicon.svg" className="w-6 h-6 invert brightness-0" alt="" />
            </div>
            <span className="font-black text-xl tracking-tight hidden sm:block">UrbanGhar</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-0 md:mt-3 md:ml-12">Internal Admin</p>
        </div>

        <nav className="flex-1 p-3 sm:p-6 flex md:flex-col gap-2 overflow-x-auto whitespace-nowrap">
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <LayoutDashboard size={20} /> Data Insights
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'reviews' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <MessageSquare size={20} /> Review Engine
            {pendingOwners.length > 0 && <span className="ml-auto bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingOwners.length}</span>}
          </button>
        </nav>

        <div className="p-3 sm:p-6 border-t border-slate-100 hidden md:block">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center md:justify-start gap-4 px-5 py-4 rounded-2xl font-bold text-rose-500 hover:bg-rose-50 transition-all"
          >
            <LogOut size={20} /> <span className="hidden md:block">System Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto w-full">
        
        <header className="mb-12">
          <h1 className="text-4xl font-black tracking-tight mb-3">
            {activeTab === 'analytics' ? 'Platform Insights' : activeTab === 'verification' ? 'Partner Verification' : 'Quality Assurance'}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-slate-500 font-medium text-lg">
              {activeTab === 'analytics' ? 'Real-time performance metrics across all urban localities.' : 
               activeTab === 'verification' ? `Manage and approve ${pendingOwners.length} pending owner applications.` :
               'Moderate and verify tenant reviews to maintain listing integrity.'}
            </p>
            {activeTab === 'analytics' && (
              <button 
                onClick={handleExportData} 
                className="px-6 py-3.5 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex items-center gap-2 border border-emerald-100 hover:border-emerald-600 shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Export Excel Data
              </button>
            )}
          </div>
        </header>

        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* KPI GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { label: 'Avg Conversion', value: avgConversionRaw + '%', icon: <TrendingUp />, color: 'blue' },
                { label: 'Platform Users', value: totalUsers.toString(), icon: <Users />, color: 'indigo' },
                { label: 'Verified Reviews', value: reviewsCount.toString(), icon: <Star />, color: 'orange' },
                { label: 'Active Listings', value: listings.length.toString(), icon: <ShieldCheck />, color: 'emerald' },
              ].map((kpi, i) => (
                <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <div className={`w-12 h-12 rounded-2xl bg-${kpi.color}-50 text-${kpi.color}-600 flex items-center justify-center mb-4 text-xl`}>{kpi.icon}</div>
                  <h5 className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">{kpi.label}</h5>
                  <p className="text-3xl font-black text-slate-900">{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* CHARTS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
              <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-[3rem] border border-slate-100 shadow-sm w-full overflow-hidden">
                <h4 className="text-xl font-black mb-8 flex items-center gap-3"><BarChart3 size={20} className="text-indigo-600" /> Locality Popularity</h4>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={liveLocalityData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} dy={10} />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px'}}
                        cursor={{fill: '#f8fafc'}}
                      />
                      <Bar dataKey="count" radius={[10, 10, 10, 10]} barSize={40}>
                        {liveLocalityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-[3rem] border border-slate-100 shadow-sm w-full overflow-hidden">
                <h4 className="text-xl font-black mb-8 flex items-center gap-3"><TrendingUp size={20} className="text-emerald-600" /> Conversion Trends</h4>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={conversionData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} dy={10} />
                      <YAxis hide domain={[0, 10]} />
                      <Tooltip 
                        contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px'}}
                      />
                      <Line type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={5} dot={{r: 6, fill: '#6366f1', strokeWidth: 3, stroke: '#fff'}} activeDot={{r: 8, strokeWidth: 0}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-10 animate-in fade-in duration-700">
            
            {/* Owner Applications Section */}
            <div className="bg-white rounded-2xl sm:rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden w-full">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-xl font-black">Partner Applications</h4>
                <span className="bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-orange-100">
                  {pendingOwners.length} Pending Approval
                </span>
              </div>
              <div className="divide-y divide-slate-50">
                {fetchError && (
                  <div className="p-8 bg-rose-50 text-rose-600 font-bold text-sm text-center">
                    ⚠️ Connection Error: {fetchError}
                  </div>
                )}
                {pendingOwners.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No pending applications</p>
                  </div>
                ) : (
                  pendingOwners.map((owner) => (
                    <div key={owner.id} className="p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 hover:bg-slate-50/50 transition-colors">
                      <div className="w-14 h-14 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-black shrink-0">
                        {owner.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h5 className="font-black text-lg">{owner.name}</h5>
                          <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase font-black tracking-tighter">Owner</span>
                        </div>
                        <div className="flex gap-4 text-xs font-medium text-slate-400">
                          <span>📞 +91 {owner.phone}</span>
                          <span>📧 {owner.email}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                        <button onClick={() => handleVerification(owner.id, 'approved')} className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-emerald-50 text-emerald-600 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all">Approve & Activate</button>
                        <button onClick={() => handleVerification(owner.id, 'rejected')} className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-rose-50 text-rose-600 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all">Reject</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>


          </div>
        )}

      </main>

    </div>
  );
};

export default App;
