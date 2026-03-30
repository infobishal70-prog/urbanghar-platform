import { useState, useEffect } from 'react';
import { auth, db } from './firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updatePassword, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, onSnapshot, collection, query, addDoc, serverTimestamp, where } from "firebase/firestore";

// 🚀 Real-time listings will be fetched from Firestore
const fallbackPGs = [
  { id: 1, title: "Elite Boys Stay", location: "Patia, near KIIT University", price: "7,500", rating: "4.8", type: "boys", owner: "Suresh Mohanty", availableBeds: "5", totalBeds: "20", owner_uid: "testOwner1", amenities: ["Free WiFi", "24/7 Power", "AC Rooms", "CCTV"], img: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800", availability: "Available Now" },
  { id: 2, title: "Lotus Girls Niwas", location: "Nayapalli, behind Indradhanu Market", price: "6,800", rating: "4.5", type: "girls", owner: "Priyanka Jena", availableBeds: "2", totalBeds: "15", owner_uid: "testOwner2", amenities: ["Laundry", "Attached Washroom", "Kitchen Access", "Security"], img: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800", availability: "Filling Fast" },
];

function App() {
  const [pgListings, setPgListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [selectedPG, setSelectedPG] = useState(null);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [viewMode, setViewMode] = useState("home"); // "home" or "all"

  // Interaction States
  const [contactMode, setContactMode] = useState("none"); // "none" | "chat" | "schedule"
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");

  // User & Auth States
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");

  // Account Details States
  const [showProfile, setShowProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [isAuthProcessing, setIsAuthProcessing] = useState(false);

  const getMaskedEmail = (phoneNum) => `${phoneNum.replace(/\s+/g, '').trim()}@urbanghar.com`;

  const openProfile = () => {
    if (user) {
      setEditName(user.name);
      setEditPhone(user.phone || "");
      setEditPassword(""); // Clear password field for security
      setShowProfile(true);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const userRef = doc(db, "consumers", auth.currentUser.uid);

      // 1. Update Firestore
      await updateDoc(userRef, {
        name: editName,
        phone: editPhone
      });

      // 2. Update Auth Password if user typed a new one
      if (editPassword.length > 5) {
        await updatePassword(auth.currentUser, editPassword);
      }

      // 3. Update local UI state
      setUser({
        ...user,
        name: editName,
        phone: editPhone,
        photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${editName}`
      });

      setShowProfile(false);
      alert("Profile updated successfully!");
    } catch (error) {
      alert("Update failed: " + error.message);
    }
  };

  const handleSignup = async () => {
    if (!phone || !password || !name) return alert("Please fill all fields");
    setIsAuthProcessing(true);
    try {
      const maskedEmail = getMaskedEmail(phone);
      const userCredential = await createUserWithEmailAndPassword(auth, maskedEmail, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "consumers", uid), {
        name: name,
        phone: phone.trim(),
        role: role,
        createdAt: new Date().toISOString()
      });

      // No need to manually setUser, the useEffect listener will handle it!
      closeAuth();
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        alert("This mobile number is already registered. Try logging in.");
        setMode("login");
      } else {
        alert("Signup Error: " + error.message);
      }
    } finally {
      setIsAuthProcessing(false);
    }
  };

  const handleLogin = async () => {
    if (!phone || !password) return alert("Please enter credentials");
    setIsAuthProcessing(true);
    try {
      const maskedEmail = getMaskedEmail(phone);
      await signInWithEmailAndPassword(auth, maskedEmail, password);
      // No need to manually setUser, the useEffect listener will handle it!
      closeAuth();
    } catch {
      alert("Login failed. Check your mobile number and password.");
    } finally {
      setIsAuthProcessing(false);
    }
  };

  useEffect(() => {
    const q = query(collection(db, "listings"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPGs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.name || "Unnamed PG",
          location: data.address || "Location not specified",
          price: data.rent || "N/A",
          rating: data.rating || "4.5", // Default rating
          type: (data.type || "Co-living").toLowerCase().includes('girls') ? 'girls' : 
                (data.type || "Co-living").toLowerCase().includes('boys') ? 'boys' : 'unisex',
          owner: data.owner_name || "UrbanGhar Partner",
          owner_uid: data.owner_uid,
          availableBeds: data.availableBeds,
          totalBeds: data.totalBeds,
          amenities: data.amenities || [],
          img: data.type?.includes("Girls") 
            ? "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800"
            : "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800",
          availability: data.status || "Available Now"
        };
      });
      
      // If no properties in DB, use fallbacks for visual richness
      setPgListings(fetchedPGs.length > 0 ? fetchedPGs : fallbackPGs);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // 1. Try to get consumer data
          let userDoc = await getDoc(doc(db, "consumers", firebaseUser.uid));
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUser({
              ...data,
              uid: firebaseUser.uid,
              role: data.role || "student",
              photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name || 'User'}`
            });
          } else {
            // 2. Fallback: Check if they are an owner
            userDoc = await getDoc(doc(db, "owners", firebaseUser.uid));
            if (userDoc.exists()) {
               const data = userDoc.data();
               setUser({
                 ...data,
                 uid: firebaseUser.uid,
                 role: "owner",
                 photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name || 'Owner'}`
               });
            } else {
              // 3. Absolute Fallback to prevent logout if DB doc is somehow missing or unreadable
              setUser({
                uid: firebaseUser.uid,
                role: "student",
                name: "Platform User",
                photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=PlatformUser`
              });
            }
          }
        } catch (err) {
          console.error("Auth state fetch error but user is strictly authenticated:", err);
          // 4. Strict Persistence mode: Never drop the user state if Firebase says they are logged in!
          setUser({
            uid: firebaseUser.uid,
            role: "student",
            name: "Platform User (Offline Mode)",
            photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=OfflineUser`
          });
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      unsubAuth();
    };
  }, []);


  useEffect(() => {
     if (selectedPG && contactMode === "chat") {
       const q = query(collection(db, "messages"), 
          where("propertyId", "==", selectedPG.id),
          where("userId", "==", user?.uid || "none")
       );
       const unsubChats = onSnapshot(q, (snap) => {
         let msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
         msgs.sort((a,b) => (a.createdAt?.toDate() || 0) - (b.createdAt?.toDate() || 0));
         setChatMessages(msgs);
       });
       return () => unsubChats();
     }
  }, [selectedPG, contactMode, user]);

  const handleSendMessage = async (e) => {
     e.preventDefault();
     if (!user) return setShowAuthModal(true);
     if (!chatInput.trim() || !selectedPG) return;

     try {
       await addDoc(collection(db, "messages"), {
          propertyId: selectedPG.id,
          propertyName: selectedPG.title,
          ownerId: selectedPG.owner_uid || "fallback_owner",
          userId: user.uid,
          userName: user.name,
          userPhone: user.phone,
          text: chatInput,
          senderId: user.uid,
          createdAt: serverTimestamp()
       });
       setChatInput("");
     } catch (err) {
       alert("Failed to send: " + err.message);
     }
  };

  const handleScheduleVisit = async () => {
     if (!user) return setShowAuthModal(true);
     if (!visitDate || !visitTime || !selectedPG) return alert("Select date and time.");
     
     try {
       await addDoc(collection(db, "visits"), {
          propertyId: selectedPG.id,
          propertyName: selectedPG.title,
          ownerId: selectedPG.owner_uid || "fallback_owner",
          userId: user.uid,
          userName: user.name,
          userPhone: user.phone,
          date: visitDate,
          time: visitTime,
          status: "Scheduled Visit",
          timestamp: serverTimestamp()
       });
       alert("Visit Scheduled Successfully!");
       setContactMode("none");
       setVisitDate("");
       setVisitTime("");
     } catch (err) {
       alert("Failed to schedule: " + err.message);
     }
  };

  const closeAuth = () => {
    setShowAuthModal(false);
    setPhone("");
    setPassword("");
    setName("");
    setMode("login");
  };

  const filteredPGs = pgListings.filter(pg => {
    const matchesSearch = pg.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pg.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = activeType === "all" || pg.type === activeType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">

      {/* Navigation */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setSelectedPG(null); setContactMode("none"); }}>
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg p-2">
            <img src="/favicon.svg" alt="logo" className="w-full h-full object-contain invert brightness-0" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">UrbanGhar</h1>
        </div>

        <div className="flex items-center gap-4">
          {user && <span className="text-xs font-bold text-slate-500 hidden md:block">Hi, {user.name}</span>}
          <div
            onClick={() => user ? openProfile() : setShowAuthModal(true)}
            className="w-10 h-10 rounded-full border-2 border-white shadow-md cursor-pointer overflow-hidden flex items-center justify-center bg-white"
          >
            <img
              src={user ? user.photo : "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"}
              className="w-full h-full object-cover"
              alt="Profile"
            />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      {viewMode === "home" && (
        <header className="px-4 sm:px-6 pt-12 sm:pt-16 pb-8 sm:pb-12 text-center bg-gradient-to-b from-indigo-50/50 to-transparent">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
            Find your stay in <span className="text-indigo-600">Bhubaneswar.</span>
          </h2>

          <div className="mt-10 relative group max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-5 flex items-center text-xl">🔍</div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by college, city or locality (e.g., Patia)"
              className="w-full pl-14 pr-4 py-5 bg-white rounded-2xl shadow-2xl shadow-indigo-100/40 border border-transparent focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button onClick={() => setActiveType("all")} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-md ${activeType === 'all' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-100'}`}>All PGs</button>
            <button onClick={() => setActiveType("girls")} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeType === 'girls' ? 'bg-pink-500 text-white shadow-lg' : 'bg-white border border-slate-200'}`}>Girls Only</button>
            <button onClick={() => setActiveType("boys")} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeType === 'boys' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-slate-200'}`}>Boys Only</button>
          </div>
        </header>
      )}

      {/* PG Grid */}
      <section className={`px-4 max-w-[1400px] mx-auto ${viewMode === "all" ? "pt-12 pb-16" : "pt-8 pb-4"}`}>

        {viewMode === "all" && (
          <div className="flex items-center gap-4 mb-10 px-2">
            <button
              onClick={() => { setViewMode("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6 text-slate-700" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            </button>
            <div>
              <h2 className="text-3xl font-black text-slate-900">All Properties</h2>
              <p className="text-slate-500 text-sm mt-1">Showing {filteredPGs.length} available accommodations</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-2">
          {(viewMode === "home" ? filteredPGs.slice(0, 4) : filteredPGs).map((pg) => (
            <div
              key={pg.id}
              onClick={() => {
                if(user) {
                   setSelectedPG(pg);
                   setContactMode("none");
                } else {
                   setShowAuthModal(true);
                }
              }}
              className="group cursor-pointer bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500"
            >
              <div className="relative h-56 overflow-hidden">
                <img src={pg.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={pg.title} />
                <div className="absolute bottom-4 left-4 px-3 py-1 bg-indigo-600/90 backdrop-blur text-white text-[10px] font-black rounded-lg">⭐ {pg.rating}</div>
                {pg.availability && (
                  <div className={`absolute top-4 left-4 px-3 py-1.5 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-black rounded-lg shadow-lg ${
                    pg.availability.includes('Available Now') ? 'bg-emerald-500/90' :
                    pg.availability.includes('Filling Fast') ? 'bg-rose-500/90' :
                    'bg-blue-500/90'
                  }`}>
                    {pg.availability}
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{pg.title}</h4>
                  <p className="text-xl font-black text-indigo-600">₹{pg.price}</p>
                </div>
                <p className="text-[11px] text-slate-400 mb-6 italic leading-snug">📍 {pg.location}</p>
                <button className="w-full py-3.5 rounded-2xl bg-slate-50 text-indigo-600 font-black text-xs uppercase tracking-widest border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {viewMode === "home" && filteredPGs.length > 4 && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => { setViewMode("all"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold uppercase tracking-widest text-sm shadow-xl shadow-indigo-200 hover:-translate-y-1 transition-all"
            >
              Show More PGs
            </button>
          </div>
        )}
      </section>

      {/* Amenities Section */}
      {viewMode === "home" && (
        <section className="px-6 max-w-[1400px] mx-auto py-8">
          <h3 className="text-2xl md:text-[28px] font-medium text-slate-900 mb-2">Get specific with your favourite amenities</h3>
          <p className="text-slate-500 text-base mb-8">Choose from top features like these – and more – for a personalised stay.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Free parking */}
            <button className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-800 transition-colors group">
              <div className="flex items-center gap-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6 text-slate-700" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75v-13h3c1.933 0 3.5 1.567 3.5 3.5s-1.567 3.5-3.5 3.5h-3m15.75-3.5c0 4.832-3.918 8.75-8.75 8.75s-8.75-3.918-8.75-8.75 3.918-8.75 8.75-8.75 8.75 3.918 8.75 8.75z" /></svg>
                <span className="font-semibold text-slate-800 text-[14px]">Free parking</span>
              </div>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4 text-slate-600 group-hover:text-slate-800 transition-colors stroke-2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>

            {/* Washing machine */}
            <button className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-800 transition-colors group">
              <div className="flex items-center gap-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6 text-slate-700" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8.25V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18V8.25m-18 0V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v2.25m-18 0h18M5.25 6h.008v.008H5.25V6zM7.5 6h.008v.008H7.5V6zm4.5 9a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="font-semibold text-slate-800 text-[14px]">Washing machine</span>
              </div>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4 text-slate-600 group-hover:text-slate-800 transition-colors stroke-2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>

            {/* AC */}
            <button className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-800 transition-colors group">
              <div className="flex items-center gap-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6 text-slate-700" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11.412 15.655L9.75 21.75l3.745-4.012M9.257 13.5H3.75l2.659-2.849m2.048-2.194L6.75 2.25l-3.745 4.012M14.743 10.5h5.507l-2.659 2.849m-2.048 2.194l1.707 6.195 3.745-4.012" /></svg>
                <span className="font-semibold text-slate-800 text-[14px]">AC</span>
              </div>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4 text-slate-600 group-hover:text-slate-800 transition-colors stroke-2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>

            {/* TV */}
            <button className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-800 transition-colors group">
              <div className="flex items-center gap-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6 text-slate-700" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z" /></svg>
                <span className="font-semibold text-slate-800 text-[14px]">TV</span>
              </div>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4 text-slate-600 group-hover:text-slate-800 transition-colors stroke-2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>

          </div>
        </section>
      )}

      {/* Contact Us Section */}
      <section className="bg-white border-t border-slate-200">
        <div className="max-w-[1400px] mx-auto px-6 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Contact Info */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-sm mb-6">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span> Contact Us
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Let's talk about your stay.</h2>
              <p className="text-slate-500 text-lg mb-10 leading-relaxed max-w-lg">
                Have questions about a property, amenities, or our booking process? We're here to help you find the perfect PG in Bhubaneswar.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Email us</h4>
                    <p className="text-slate-500 mt-1">Our friendly team is here to help.</p>
                    <a className="text-indigo-600 font-bold mt-1 inline-block hover:underline" href="mailto:hello@urbanghar.com">hello@urbanghar.com</a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Visit us</h4>
                    <p className="text-slate-500 mt-1">Chat to us in person at our HQ.</p>
                    <p className="text-slate-700 font-bold mt-1">101 Startup Hub, Patia, BBSR</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.432-4.132-7.028-7.028l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Call us</h4>
                    <p className="text-slate-500 mt-1">Mon-Fri from 9am to 6pm.</p>
                    <a className="text-indigo-600 font-bold mt-1 inline-block hover:underline" href="tel:+919876543210">+91 98765 43210</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-6 sm:p-10 rounded-3xl sm:rounded-[2rem] shadow-2xl shadow-indigo-100/50 border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Send us a message</h3>
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Thanks for reaching out! We'll get back to you soon."); }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[13px] font-bold tracking-wide text-slate-700 uppercase mb-2">First name</label>
                    <input type="text" placeholder="First name" className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800 font-medium placeholder:text-slate-400 placeholder:font-normal" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold tracking-wide text-slate-700 uppercase mb-2">Last name</label>
                    <input type="text" placeholder="Last name" className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800 font-medium placeholder:text-slate-400 placeholder:font-normal" />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold tracking-wide text-slate-700 uppercase mb-2">Email</label>
                  <input type="email" placeholder="you@company.com" className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800 font-medium placeholder:text-slate-400 placeholder:font-normal" />
                </div>

                <div>
                  <label className="block text-[13px] font-bold tracking-wide text-slate-700 uppercase mb-2">Message</label>
                  <textarea rows="4" placeholder="Leave us a message..." className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800 font-medium placeholder:text-slate-400 placeholder:font-normal resize-none"></textarea>
                </div>

                <div className="pt-2">
                  <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 hover:-translate-y-0.5">
                    Send Message
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-6 px-6 mt-12 w-full">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[14px] text-slate-600 font-medium">
          <div className="flex flex-wrap items-center gap-2">
            <span>© 2026 UrbanGhar, Inc.</span>
            <span className="text-slate-400">·</span>
            <a href="#" className="hover:underline hover:text-slate-900 transition-colors">Privacy</a>
            <span className="text-slate-400">·</span>
            <a href="#" className="hover:underline hover:text-slate-900 transition-colors">Terms</a>
            <span className="text-slate-400">·</span>
            <a href="#" className="hover:underline hover:text-slate-900 transition-colors">Company details</a>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-slate-900 hover:text-slate-600 transition-colors" aria-label="Facebook">
              <svg fill="currentColor" viewBox="0 0 24 24" className="w-[18px] h-[18px]" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
            </a>
            <a href="#" className="text-slate-900 hover:text-slate-600 transition-colors" aria-label="X (Twitter)">
              <svg fill="currentColor" viewBox="0 0 24 24" className="w-[15px] h-[15px]" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
            <a href="#" className="text-slate-900 hover:text-slate-600 transition-colors" aria-label="Instagram">
              <svg fill="currentColor" viewBox="0 0 24 24" className="w-[18px] h-[18px]" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.469 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
            </a>
          </div>
        </div>
      </footer>

      {/* --- ACCOUNT DETAILS MODAL --- */}
      {showProfile && user && (
        <div className="fixed inset-0 z-[120] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 max-w-sm w-full shadow-2xl relative animate-in zoom-in duration-300">
            <button onClick={() => setShowProfile(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full border-4 border-indigo-50 overflow-hidden">
                <img src={user.photo} alt="User" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-1">{editName || user.name}</h3>
              <p className="text-xs text-slate-400 mb-8 uppercase tracking-widest font-bold">{user.role}</p>

              <div className="space-y-4 text-left">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 ml-2 uppercase">Full Name</label>
                  <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-indigo-500/20 text-base font-medium text-slate-800" value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 ml-2 uppercase">Mobile Number</label>
                  <input type="tel" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-indigo-500/20 text-base font-medium text-slate-800" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 ml-2 uppercase">New Password (Optional)</label>
                  <input type="password" placeholder="Min 6 characters" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-indigo-500/20 text-base font-medium text-slate-800" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} />
                </div>
                <button onClick={handleUpdateProfile} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-lg mt-4 transition-all">Save Changes</button>
                <button onClick={() => { signOut(auth); setShowProfile(false); }} className="w-full py-3 text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-50 rounded-xl transition-all">Sign Out</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- AUTH MODAL --- */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[1.5rem] shadow-2xl relative w-full max-w-4xl flex flex-col md:flex-row max-h-[90vh] overflow-y-auto overflow-x-hidden animate-in zoom-in duration-300">
            
            {/* Close Button */}
            <button onClick={closeAuth} className="absolute top-4 right-4 z-10 p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Left Column: Illustration */}
            <div className="hidden md:flex flex-col items-center justify-center w-5/12 bg-gradient-to-br from-blue-50 to-sky-100 p-8 relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-6 left-6 w-20 h-20 bg-blue-200/50 rounded-full"></div>
              <div className="absolute bottom-10 right-4 w-28 h-28 bg-sky-200/40 rounded-full"></div>
              <div className="absolute top-1/2 right-6 w-10 h-10 bg-blue-300/30 rounded-full"></div>
              {/* Main illustration */}
              <div className="relative z-10">
                <div className="w-36 h-36 bg-blue-200 rounded-full flex items-center justify-center text-7xl shadow-lg shadow-blue-200">
                  🧑‍💻
                </div>
                {/* Thumbs up bubble */}
                <div className="absolute -top-2 -right-3 w-11 h-11 bg-orange-500 rounded-full flex items-center justify-center text-xl shadow-lg border-2 border-white">
                  👍
                </div>
                {/* Chat bubble */}
                <div className="absolute -bottom-5 -left-8 px-3 py-2 bg-white rounded-2xl rounded-bl-none shadow-lg border border-blue-100">
                  <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
                {/* Phone icon badge */}
                <div className="absolute -bottom-2 -right-8 px-3 py-1.5 bg-blue-600 rounded-xl shadow-lg text-white text-[10px] font-black">
                  📱 Find PG
                </div>
              </div>
              <p className="text-blue-700 font-black text-sm uppercase tracking-widest mt-12 text-center relative z-10">Discover Your Perfect Stay</p>
            </div>

            {/* Right Column: Form */}
            <div className="p-8 md:p-14 w-full md:w-7/12 flex flex-col justify-center bg-white">
              <div className="flex bg-blue-50 p-1 rounded-xl mb-6 max-w-xs">
                <button onClick={() => setMode("login")} className={`flex-1 py-1.5 rounded-lg text-[13px] font-bold transition-all ${mode === 'login' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>LOGIN</button>
                <button onClick={() => setMode("signup")} className={`flex-1 py-1.5 rounded-lg text-[13px] font-bold transition-all ${mode === 'signup' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>SIGNUP</button>
              </div>

              <h3 className="text-[28px] font-semibold text-[#222222] mb-1 leading-tight">
                {mode === "login" ? "Welcome Back" : "Create Account"}
              </h3>
              <p className="text-[#666666] text-[14px] mb-8 max-w-sm">
                for Better Experience, Property tracking & Regular updates
              </p>

              <div className="space-y-4">
                {mode === "signup" && (
                  <>
                    <div className="relative border border-[#CCCCCC] rounded-xl focus-within:border-[#222222] transition-all overflow-hidden bg-white">
                      <label className="absolute top-2 left-4 text-[11px] text-[#666666]">Full Name</label>
                      <input type="text" className="w-full pl-4 pr-4 pt-6 pb-2 outline-none text-[15px] font-medium text-[#222222] bg-transparent" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setRole("student")} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${role === 'student' ? 'bg-[#F6F7F9] border-[#222222] text-[#222222] shadow-sm' : 'border-[#CCCCCC] text-[#666666] hover:border-[#999999]'}`}>🎓 Student</button>
                      <button onClick={() => setRole("professional")} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${role === 'professional' ? 'bg-[#F6F7F9] border-[#222222] text-[#222222] shadow-sm' : 'border-[#CCCCCC] text-[#666666] hover:border-[#999999]'}`}>💼 Work</button>
                    </div>
                  </>
                )}

                <div className="relative border border-[#CCCCCC] rounded-xl focus-within:border-[#222222] transition-all overflow-hidden bg-white">
                  <label className="absolute top-2 left-4 text-[11px] text-[#666666]">Mobile Number</label>
                  <div className="flex items-center pt-6 pb-2">
                    <span className="pl-4 pr-1 font-medium text-[#222222]">+91 - </span>
                    <input type="tel" className="flex-1 px-2 outline-none text-[15px] font-medium text-[#222222] bg-transparent" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>

                <div className="relative border border-[#CCCCCC] rounded-xl focus-within:border-[#222222] transition-all overflow-hidden bg-white">
                  <label className="absolute top-2 left-4 text-[11px] text-[#666666]">Password</label>
                  <input type="password" placeholder="••••••••" className="w-full pl-4 pr-4 pt-6 pb-2 outline-none text-[15px] font-medium text-[#222222] bg-transparent" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>

                <div className="pt-2">
                  <button 
                    disabled={isAuthProcessing || !phone || !password || (mode === 'signup' && !name)}
                    onClick={mode === "login" ? handleLogin : handleSignup} 
                    className={`w-full py-4 rounded-xl font-bold text-[15px] transition-all ${
                      (!phone || !password || (mode === 'signup' && !name)) 
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200'
                    }`}
                  >
                    {isAuthProcessing ? "Processing..." : (mode === "login" ? "Sign In" : "Register Now")}
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-[#888888] mt-8 leading-relaxed max-w-sm">
                By proceeding, I confirm that I have received, read, and agree to:<br/>
                <a href="#" className="underline hover:text-[#222222]">Data Sharing for Loan Eligibility</a>, <a href="#" className="underline hover:text-[#222222]">Third-Party Sharing with Dealers and OEMs</a>, <a href="#" className="underline hover:text-[#222222]">Marketing Communication</a>, <a href="#" className="underline hover:text-[#222222]">Privacy Policy</a>, <a href="#" className="underline hover:text-[#222222]">Terms & Conditions</a>, <a href="#" className="underline hover:text-[#222222]">Consent Declaration</a> and certified CIC.
              </p>

            </div>
          </div>
        </div>
      )}

      {/* --- PG DETAILS MODAL --- */}
      {selectedPG && (
        <div className="fixed inset-0 z-[130] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl relative animate-in zoom-in duration-300 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Close Button */}
            <button 
              onClick={() => { setSelectedPG(null); setContactMode("none"); }} 
              className="absolute top-4 right-4 z-10 p-2.5 bg-black/20 hover:bg-black/40 backdrop-blur text-white rounded-full transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Header Image */}
            <div className="relative h-48 sm:h-80 shrink-0">
              <img src={selectedPG.img} className="w-full h-full object-cover" alt={selectedPG.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="px-3 py-1 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl mb-3 inline-block shadow-sm">⭐ {selectedPG.rating} Rating</span>
                    <h3 className="text-3xl font-extrabold text-white leading-tight">{selectedPG.title}</h3>
                    <p className="text-slate-200 text-sm mt-1 flex items-center gap-1.5"><span className="text-indigo-400">📍</span> {selectedPG.location}</p>
                  </div>
                  <div className="text-right pb-1">
                    <p className="text-3xl font-black text-white">₹{selectedPG.price}</p>
                    <p className="text-slate-300 text-xs font-medium uppercase tracking-wider">per month</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 overflow-y-auto bg-slate-50">
              
              {/* Availability Banner */}
              <div className={`p-4 rounded-2xl mb-8 flex items-center gap-4 border ${
                selectedPG.availability?.includes('Available Now') ? 'bg-emerald-50 border-emerald-100 text-emerald-900' :
                selectedPG.availability?.includes('Filling Fast') ? 'bg-rose-50 border-rose-100 text-rose-900' :
                'bg-blue-50 border-blue-100 text-blue-900'
              }`}>
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-xl">
                  {selectedPG.availability?.includes('Available Now') ? '🟢' : selectedPG.availability?.includes('Filling Fast') ? '🔥' : '🗓️'}
                </div>
                <div>
                  <h4 className="font-extrabold text-lg">{selectedPG.availability || "Check Availability"}</h4>
                  <p className="text-sm opacity-80 font-medium">Beds are limited. Contact the owner early to secure your spot.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Details */}
                <div>
                  <h4 className="text-xs font-black tracking-widest uppercase text-slate-400 mb-4">Property Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-white rounded-xl border border-slate-100">
                      <span className="text-slate-500 font-medium text-sm">Type</span>
                      <span className="font-bold text-slate-900 capitalize text-sm">{selectedPG.type} PG</span>
                    </div>
                    <div className="flex justify-between p-3 bg-white rounded-xl border border-slate-100">
                      <span className="text-slate-500 font-medium text-sm">Owner</span>
                      <span className="font-bold text-slate-900 text-sm">{selectedPG.owner}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-white rounded-xl border border-slate-100">
                      <span className="text-slate-500 font-medium text-sm">Avail. Beds</span>
                      <span className="font-bold text-slate-900 text-sm">{selectedPG.availableBeds || "N/A"} / {selectedPG.totalBeds || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <h4 className="text-xs font-black tracking-widest uppercase text-slate-400 mb-4">Included Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPG.amenities?.map((amenity, idx) => (
                      <span key={idx} className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {contactMode === "none" && (
                <div className="mt-8 pt-6 border-t border-slate-200 flex gap-4">
                  <button onClick={() => setContactMode("chat")} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-all shadow-lg shadow-indigo-200">
                    Contact Owner
                  </button>
                  <button onClick={() => setContactMode("schedule")} className="flex-1 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-black rounded-xl transition-all shadow-sm">
                    Schedule Visit
                  </button>
                </div>
              )}

              {contactMode === "chat" && (
                <div className="mt-8 pt-6 border-t border-slate-200 animate-in slide-in-from-bottom-2 duration-300">
                   <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Chat with Owner</h4>
                      <button onClick={() => setContactMode("none")} className="text-xs font-bold text-slate-400 hover:text-slate-900">Cancel</button>
                   </div>
                   <div className="bg-white rounded-2xl border border-slate-200 h-64 flex flex-col overflow-hidden">
                      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
                         {chatMessages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}>
                               <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.senderId === user?.uid ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'}`}>
                                 {msg.text}
                               </div>
                            </div>
                         ))}
                         {chatMessages.length === 0 && <div className="text-center text-slate-400 text-xs font-medium py-10">No messages yet. Send a hi!</div>}
                      </div>
                      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                        <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a message..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-medium outline-none focus:border-indigo-500 focus:bg-white" />
                        <button type="submit" className="bg-indigo-600 w-12 h-10 rounded-xl flex items-center justify-center text-white shrink-0 hover:bg-indigo-700 transition-colors shadow-sm">
                           <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                        </button>
                      </form>
                   </div>
                </div>
              )}

              {contactMode === "schedule" && (
                <div className="mt-8 pt-6 border-t border-slate-200 animate-in slide-in-from-bottom-2 duration-300">
                   <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Schedule a Visit</h4>
                      <button onClick={() => setContactMode("none")} className="text-xs font-bold text-slate-400 hover:text-slate-900">Cancel</button>
                   </div>
                   <div className="grid grid-cols-2 gap-4 mb-4 mt-2">
                      <div>
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Select Date</label>
                         <input type="date" min={new Date().toISOString().split('T')[0]} value={visitDate} onChange={e => setVisitDate(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 shadow-sm" />
                      </div>
                      <div>
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Select Time Range</label>
                         <select value={visitTime} onChange={e => setVisitTime(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 cursor-pointer shadow-sm">
                            <option value="">Choose Time</option>
                            <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                            <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                            <option value="12:00 PM - 01:00 PM">12:00 PM - 01:00 PM</option>
                            <option value="01:00 PM - 02:00 PM">01:00 PM - 02:00 PM</option>
                            <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                            <option value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM</option>
                            <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                            <option value="05:00 PM - 06:00 PM">05:00 PM - 06:00 PM</option>
                         </select>
                      </div>
                   </div>
                   <button onClick={handleScheduleVisit} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-all shadow-lg shadow-indigo-200 mt-2">
                      Confirm Scheduled Visit
                   </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;