import React, { useState, useEffect } from 'react';
import { auth, db } from './firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updatePassword,
  signOut
} from "firebase/auth";
import {
  doc, setDoc, getDoc, onSnapshot, updateDoc,
  collection, query, where, addDoc, deleteDoc, serverTimestamp,
  getDocs, writeBatch
} from "firebase/firestore";
import OwnerDashboard from './OwnerDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [messages, setMessages] = useState([]);
  const [visits, setVisits] = useState([]);

  // Owner Auth States
  const [ownerAuthMode, setOwnerAuthMode] = useState("login"); // "login" | "signup" | "success"
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [ownerFile, setOwnerFile] = useState(null);

  useEffect(() => {
    let unsubscribeFirestore = null;
    let unsubscribeListings = null;
    let unsubscribeMessages = null;
    let unsubscribeVisits = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Cleanup previous listeners if they exist (on re-auth/signout)
      if (unsubscribeFirestore) unsubscribeFirestore();
      if (unsubscribeListings) unsubscribeListings();
      if (unsubscribeMessages) unsubscribeMessages();
      if (unsubscribeVisits) unsubscribeVisits();

      if (firebaseUser) {
        // 🆔 USER DATA LISTENER
        unsubscribeFirestore = onSnapshot(doc(db, "owners", firebaseUser.uid), (userDoc) => {
          if (userDoc.exists()) {
            setUser({ uid: firebaseUser.uid, ...userDoc.data(), role: "owner" });
          } else {
            setUser(null);
          }
          setLoading(false);
        });

        // 🏠 REAL-TIME PROPERTIES LISTENER
        const q = query(collection(db, "listings"), where("owner_uid", "==", firebaseUser.uid));
        unsubscribeListings = onSnapshot(q, (snapshot) => {
          setProperties(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // 💬 REAL-TIME MESSAGES LISTENER
        const qMessages = query(collection(db, "messages"), where("ownerId", "==", firebaseUser.uid));
        unsubscribeMessages = onSnapshot(qMessages, (snapshot) => {
          let loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          loaded.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));
          setMessages(loaded);
        });

        // 📅 REAL-TIME VISITS LISTENER
        const qVisits = query(collection(db, "visits"), where("ownerId", "==", firebaseUser.uid));
        unsubscribeVisits = onSnapshot(qVisits, (snapshot) => {
          let loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          loaded.sort((a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0));
          setVisits(loaded);
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
      if (unsubscribeListings) unsubscribeListings();
      if (unsubscribeMessages) unsubscribeMessages();
      if (unsubscribeVisits) unsubscribeVisits();
    };
  }, []);

  const getMaskedEmail = (phoneNum) => `${phoneNum.replace(/\s+/g, '').trim()}@urbanghar.com`;

  const handleOwnerSubmit = async (e) => {
    e.preventDefault();
    if (ownerAuthMode === "login") {
      try {
        const maskedEmail = getMaskedEmail(ownerPhone);
        const userCredential = await signInWithEmailAndPassword(auth, maskedEmail, ownerPassword);
        const userDoc = await getDoc(doc(db, "owners", userCredential.user.uid));
        if (userDoc.exists() && userDoc.data().status !== "active") {
          await auth.signOut();
          alert("Your account is under verification. This typically takes up to 48 hours.");
        }
      } catch (error) {
        alert("Login failed. Check your credentials.");
      }
    } else {
      if (!ownerName || !ownerPhone || !ownerEmail || !ownerPassword || !ownerFile) {
        return alert("Please fill all fields and upload KYC document.");
      }
      try {
        const maskedEmail = getMaskedEmail(ownerPhone);
        const userCredential = await createUserWithEmailAndPassword(auth, maskedEmail, ownerPassword);
        const uid = userCredential.user.uid;

        await setDoc(doc(db, "owners", uid), {
          name: ownerName,
          phone: ownerPhone,
          email: ownerEmail,
          status: "pending_verification",
          createdAt: new Date().toISOString()
        });

        setOwnerAuthMode("success");
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          alert("This phone number is already registered. Please log in instead.");
          setOwnerAuthMode("login");
        } else {
          alert("Signup failed: " + error.message);
        }
      }
    }
  };

  const handleUpdateProfile = async (updates) => {
    try {
      const userRef = doc(db, "owners", auth.currentUser.uid);

      // 1. Update Firestore
      await updateDoc(userRef, {
        name: updates.name,
        phone: updates.phone
      });

      // 2. Update Auth Password if provided
      if (updates.password && updates.password.length >= 6) {
        await updatePassword(auth.currentUser, updates.password);
      }

      // 3. Sync Name across all Properties
      const q = query(collection(db, "listings"), where("owner_uid", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const batch = writeBatch(db);
        querySnapshot.forEach((docSnap) => {
          batch.update(docSnap.ref, {
            owner_name: updates.name
          });
        });
        await batch.commit();
      }

      // UI will auto-update via the onSnapshot listener already in useEffect!
      alert("Profile updated successfully!");
    } catch (error) {
      alert("Update failed: " + error.message);
    }
  };

  const handleAddProperty = async (propData) => {
    try {
      await addDoc(collection(db, "listings"), {
        ...propData,
        owner_uid: auth.currentUser.uid,
        owner_name: user.name,
        createdAt: new Date().toISOString()
      });
      alert("Property listed successfully!");
    } catch (error) {
      alert("Error adding property: " + error.message);
    }
  };

  const handleUpdatePropertyStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "listings", id), { status: newStatus });
    } catch (error) {
      alert("Error updating status: " + error.message);
    }
  };

  const handleEditProperty = async (id, updatedData) => {
    try {
      await updateDoc(doc(db, "listings", id), updatedData);
    } catch (error) {
      alert("Error updating property: " + error.message);
    }
  };

  const handleReplyMessage = async (replyText, targetUserId, propertyId, propertyName) => {
    try {
      await addDoc(collection(db, "messages"), {
        propertyId,
        propertyName,
        ownerId: auth.currentUser.uid,
        userId: targetUserId,
        text: replyText,
        senderId: auth.currentUser.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      alert("Error sending reply: " + error.message);
    }
  };

  const handleDeleteProperty = async (id) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        await deleteDoc(doc(db, "listings", id));
      } catch (error) {
        alert("Error deleting property: " + error.message);
      }
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 font-black text-indigo-600">UrbanGhar...</div>;

  if (user) {
    return <OwnerDashboard
      user={user}
      properties={properties}
      messages={messages}
      visits={visits}
      onAddProperty={handleAddProperty}
      onEditProperty={handleEditProperty}
      onDeleteProperty={handleDeleteProperty}
      onReplyMessage={handleReplyMessage}
      onUpdatePropertyStatus={handleUpdatePropertyStatus}
      onUpdateProfile={handleUpdateProfile}
      onBackToApp={() => auth.signOut()}
    />;
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9] font-sans text-slate-900 flex items-center justify-center p-4">

      {ownerAuthMode === "success" ? (
        <div className="bg-white rounded-[1.5rem] shadow-2xl p-10 text-center max-w-md w-full">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 text-5xl shadow-inner ring-[12px] ring-emerald-50/50">✅</div>
          <h3 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Application Received</h3>
          <p className="text-slate-500 text-[15px] font-medium leading-relaxed mb-10">
            Your owner account is securely under verification. This process typically takes up to 48 hours for KYC compliance.
          </p>
          <button onClick={() => {
            setOwnerAuthMode("login");
            setOwnerName("");
            setOwnerPhone("");
            setOwnerEmail("");
            setOwnerPassword("");
            setOwnerFile(null);
          }} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Go to Login</button>
        </div>
      ) : (
        <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-4xl flex flex-col md:flex-row max-h-[90vh] overflow-y-auto overflow-x-hidden animate-in zoom-in duration-300">

          {/* Left: Illustration */}
          <div className="hidden md:flex flex-col items-center justify-center w-5/12 bg-gradient-to-br from-indigo-50 to-violet-100 p-10 relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-6 right-8 w-20 h-20 bg-indigo-200/40 rounded-full"></div>
            <div className="absolute bottom-8 left-4 w-16 h-16 bg-violet-200/50 rounded-full"></div>
            {/* Main illustration */}
            <div className="relative z-10">
              <div className="w-36 h-36 bg-indigo-200 rounded-full flex items-center justify-center text-7xl shadow-lg shadow-indigo-200">
                👨‍💼
              </div>
              {/* House badge */}
              <div className="absolute -top-2 -right-4 w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-lg border border-indigo-100">
                🏠
              </div>
              {/* Key tag */}
              <div className="absolute -bottom-4 -left-6 px-3 py-1.5 bg-white rounded-xl shadow-lg text-xs font-black text-indigo-700 flex items-center gap-1.5 border border-indigo-50">
                🔑 Property Partner
              </div>
            </div>
            <p className="text-indigo-700 font-black text-sm uppercase tracking-widest mt-12 text-center relative z-10">Property Partner Portal</p>
          </div>

          {/* Right: Form */}
          <div className="p-8 md:p-14 w-full md:w-7/12 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-sm border border-slate-100">
                <img src="/favicon.svg" className="w-full h-full object-contain" alt="UrbanGhar Logo" />
              </div>
              <span className="font-black text-slate-800 text-lg">UrbanGhar</span>
            </div>

            <div className="flex bg-slate-100/70 p-1 rounded-xl mb-6 max-w-xs">
              <button onClick={() => { setOwnerAuthMode("login"); setOwnerPassword(""); }} className={`flex-1 py-1.5 rounded-lg text-[13px] font-bold transition-all ${ownerAuthMode === 'login' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>LOGIN</button>
              <button onClick={() => { setOwnerAuthMode("signup"); setOwnerPassword(""); }} className={`flex-1 py-1.5 rounded-lg text-[13px] font-bold transition-all ${ownerAuthMode === 'signup' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>JOIN AS OWNER</button>
            </div>

            <h3 className="text-[28px] font-semibold text-[#222222] mb-1 leading-tight">
              {ownerAuthMode === "login" ? "Welcome Back, Partner" : "Become a Property Partner"}
            </h3>
            <p className="text-[#666666] text-[14px] mb-8 max-w-sm">
              {ownerAuthMode === "login" ? "Access your dashboard to manage listings, leads & visits." : "List your PG and reach thousands of students & professionals."}
            </p>

            <form onSubmit={handleOwnerSubmit} className="space-y-4">
              {ownerAuthMode === "signup" && (
                <>
                  <div className="relative border border-[#CCCCCC] rounded-xl focus-within:border-[#222222] transition-all overflow-hidden bg-white">
                    <label className="absolute top-2 left-4 text-[11px] text-[#666666]">Full Name</label>
                    <input required type="text" className="w-full pl-4 pr-4 pt-6 pb-2 outline-none text-[15px] font-medium text-[#222222] bg-transparent" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
                  </div>
                  <div className="relative border border-[#CCCCCC] rounded-xl focus-within:border-[#222222] transition-all overflow-hidden bg-white">
                    <label className="absolute top-2 left-4 text-[11px] text-[#666666]">Gmail ID</label>
                    <input required type="email" className="w-full pl-4 pr-4 pt-6 pb-2 outline-none text-[15px] font-medium text-[#222222] bg-transparent" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} />
                  </div>
                </>
              )}

              <div className="relative border border-[#CCCCCC] rounded-xl focus-within:border-[#222222] transition-all overflow-hidden bg-white">
                <label className="absolute top-2 left-4 text-[11px] text-[#666666]">Mobile Number</label>
                <div className="flex items-center pt-6 pb-2">
                  <span className="pl-4 pr-1 font-medium text-[#222222]">+91 - </span>
                  <input required type="tel" className="flex-1 px-2 outline-none text-[15px] font-medium text-[#222222] bg-transparent" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} />
                </div>
              </div>

              <div className="relative border border-[#CCCCCC] rounded-xl focus-within:border-[#222222] transition-all overflow-hidden bg-white">
                <label className="absolute top-2 left-4 text-[11px] text-[#666666]">{ownerAuthMode === 'login' ? 'Password' : 'Create Password'}</label>
                <input required type="password" placeholder="••••••••" className="w-full pl-4 pr-4 pt-6 pb-2 outline-none text-[15px] font-medium text-[#222222] bg-transparent" value={ownerPassword} onChange={(e) => setOwnerPassword(e.target.value)} />
              </div>

              {ownerAuthMode === "signup" && (
                <div className="border-2 border-dashed border-[#CCCCCC] rounded-xl p-5 text-center hover:border-indigo-400 hover:bg-indigo-50/40 transition-colors relative cursor-pointer group">
                  <input required type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => setOwnerFile(e.target.files[0])} accept="image/*,.pdf" />
                  <div className="w-10 h-10 bg-slate-100 group-hover:bg-indigo-100 text-slate-400 group-hover:text-indigo-600 rounded-xl flex items-center justify-center text-xl mx-auto mb-2 transition-colors">{ownerFile ? "✅" : "📄"}</div>
                  <p className="text-[13px] font-bold text-[#444444] max-w-[200px] mx-auto truncate">{ownerFile ? ownerFile.name : "Upload Aadhaar Card"}</p>
                </div>
              )}

              <div className="pt-2">
                <button type="submit" className="w-full py-4 rounded-xl font-bold text-[15px] transition-all bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
                  {ownerAuthMode === "login" ? "Access Dashboard" : "Submit Application"}
                </button>
              </div>
            </form>

            <p className="text-[11px] text-[#888888] mt-8 leading-relaxed max-w-sm">
              By proceeding, I confirm that I have received, read, and agree to:<br />
              <a href="#" className="underline hover:text-[#222222]">Data Sharing for Loan Eligibility</a>, <a href="#" className="underline hover:text-[#222222]">Third-Party Sharing with Dealers and OEMs</a>, <a href="#" className="underline hover:text-[#222222]">Privacy Policy</a>, <a href="#" className="underline hover:text-[#222222]">Terms & Conditions</a>, <a href="#" className="underline hover:text-[#222222]">Consent Declaration</a> and certified CIC.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
