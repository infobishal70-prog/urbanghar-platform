import React, { useState } from 'react';

const OwnerDashboard = ({ user, properties, messages = [], visits = [], onAddProperty, onEditProperty, onDeleteProperty, onUpdatePropertyStatus, onUpdateProfile, onReplyMessage, onBackToApp }) => {
  const [activeTab, setActiveTab] = useState('listings');
  
  // Property Add States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPropId, setEditingPropId] = useState(null);
  const [newProp, setNewProp] = useState({
    name: "", address: "", rent: "", type: "Boys PG", totalBeds: "", availableBeds: "",
    amenities: []
  });

  const availableAmenities = ["Free WiFi", "24/7 Power", "AC Rooms", "CCTV"];

  const toggleAmenity = (amt) => {
    setNewProp(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amt) 
        ? prev.amenities.filter(a => a !== amt) 
        : [...prev.amenities, amt]
    }));
  };

  const openEditModal = (prop) => {
    setEditingPropId(prop.id);
    setNewProp({
      name: prop.name || "",
      address: prop.address || "",
      rent: prop.rent || "",
      type: prop.type || "Boys PG",
      totalBeds: prop.totalBeds || "",
      availableBeds: prop.availableBeds || "",
      amenities: prop.amenities || []
    });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingPropId(null);
    setNewProp({ name: "", address: "", rent: "", type: "Boys PG", totalBeds: "", availableBeds: "", amenities: [] });
  };
  
  // Profile Edit States
  const [editName, setEditName] = useState(user.name);
  const [editPhone, setEditPhone] = useState(user.phone || "");
  const [editPassword, setEditPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Chat/Messages state
  const [activeChat, setActiveChat] = useState(null);
  const [replyInput, setReplyInput] = useState("");

  // Group messages
  const conversations = {};
  messages.forEach(msg => {
     const key = `${msg.userId}_${msg.propertyId}`;
     if (!conversations[key]) {
       conversations[key] = { 
         key,
         userId: msg.userId, 
         userName: msg.userName, 
         userPhone: msg.userPhone, 
         propertyId: msg.propertyId, 
         propertyName: msg.propertyName,
         allMessages: [] 
       };
     }
     // Insert at bottom since they are sorted desending from snapshot, wait, snapshot sort:
     // b.createdAt - a.createdAt (descending), so newest first.
     // To show old->new in chat, we should reverse, or we can just push.
     conversations[key].allMessages.unshift(msg); 
  });
  const conversationList = Object.values(conversations);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">

      {/* SIDEBAR */}
      <aside className="w-full md:w-72 bg-white border-r border-slate-200 shrink-0 flex flex-col md:h-screen sticky top-0 z-20 md:static p-6 md:p-0">
        <div className="md:p-6 md:border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-3 mb-1">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1 shadow-sm">
                <img src="/favicon.svg" className="w-full h-full object-contain" alt="Logo" />
              </div>
              <span className="font-bold text-slate-900 text-lg tracking-tight">UrbanGhar</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 ml-9">Owner Portal</p>
          </div>
          <button onClick={onBackToApp} className="md:hidden p-2 text-slate-400 hover:bg-slate-50 rounded-lg font-bold">
            Close ✕
          </button>
        </div>

        <nav className="flex-1 md:p-4 space-y-2 overflow-y-auto mt-6 md:mt-0 flex md:flex-col gap-2 md:gap-0 pb-2 md:pb-0 overflow-x-auto md:overflow-hidden whitespace-nowrap">
          <button
            onClick={() => setActiveTab('listings')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${activeTab === 'listings' ? 'bg-indigo-50 text-indigo-700 md:shadow-inner' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <span className="text-xl">📋</span> My Properties
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${activeTab === 'leads' ? 'bg-indigo-50 text-indigo-700 md:shadow-inner' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <span className="text-xl">👥</span> Lead Tracker
          </button>
          <button
            onClick={() => setActiveTab('kyc')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${activeTab === 'kyc' ? 'bg-indigo-50 text-indigo-700 md:shadow-inner' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <span className="text-xl">🛡️</span> KYC Vault
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${activeTab === 'account' ? 'bg-indigo-50 text-indigo-700 md:shadow-inner' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <span className="text-xl">👤</span> Account
          </button>
        </nav>

        <div className="md:p-4 md:border-t border-slate-100 mt-4 md:mt-0">
          <button onClick={onBackToApp} className="w-full py-4 bg-white border border-slate-200 hover:border-slate-800 text-rose-500 font-bold rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2">
            Log Out ✕
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto md:h-screen relative bg-slate-50">
        <header className="px-6 md:px-10 py-6 md:sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md pb-6 md:pb-8 md:pt-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 capitalize">
              {activeTab === 'listings' ? 'Unified Listing Manager' : activeTab === 'leads' ? 'Lead Tracking Dashboard' : 'Automated KYC Vault'}
            </h2>
            <p className="text-slate-500 font-medium mt-2 max-w-2xl leading-relaxed">
              {activeTab === 'listings' ? 'Manage your property inventory, rent prices, and real-time availability statuses below. Control your supply side effortlessly.' :
                activeTab === 'leads' ? 'Monitor exactly how many students viewed your properties and manage scheduled visit leads.' :
                activeTab === 'kyc' ? 'Securely upload and manage your Aadhaar ID. A verified tag acts as a powerful trust signal for tenants.' :
                                     'Manage your partner profile, contact information, and account security settings here.'}
            </p>
          </div>
          {activeTab === 'listings' && (
            <button 
              onClick={() => {
                setEditingPropId(null);
                setNewProp({ name: "", address: "", rent: "", type: "Boys PG", totalBeds: "", availableBeds: "", amenities: [] });
                setShowAddModal(true);
              }}
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all shrink-0 w-full sm:w-auto"
            >
              + Add New PG
            </button>
          )}
        </header>

        <div className="px-6 md:px-10 pb-16 max-w-5xl">

          {/* TAB: LISTINGS */}
          {activeTab === 'listings' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="bg-white rounded-[2rem] p-3 shadow-sm border border-slate-100 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Property Details</th>
                      <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-400 w-36">Rent / Mo</th>
                      <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-400 w-56">Availability Status</th>
                      <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((prop, idx) => (
                      <tr key={prop.id} className={idx !== properties.length - 1 ? "border-b border-slate-50" : ""}>
                        <td className="px-6 py-6">
                          <div className="font-bold text-slate-900 text-[15px]">{prop.name}</div>
                          <div className="text-[13px] font-medium text-slate-500 mt-1 flex items-center gap-1">📍 {prop.address}</div>
                          <div className="flex gap-2 mt-2">
                             <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-black uppercase text-slate-500 rounded-md">{prop.type}</span>
                             <span className="px-2 py-0.5 bg-indigo-50 text-[10px] font-black uppercase text-indigo-600 rounded-md">{prop.availableBeds}/{prop.totalBeds} Beds Avail.</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 font-bold text-slate-900">₹ {prop.rent}</td>
                        <td className="px-6 py-6">
                          <select 
                            value={prop.status || "Available Now"}
                            onChange={(e) => onUpdatePropertyStatus(prop.id, e.target.value)}
                            className="bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
                          >
                            <option>Available Now</option>
                            <option>Filling Fast</option>
                            <option>Fully Booked</option>
                            <option>Under Maintenance</option>
                          </select>
                        </td>
                        <td className="px-6 py-6 text-right space-x-2">
                           <button onClick={() => openEditModal(prop)} className="text-[11px] font-black text-slate-400 uppercase hover:text-slate-900">Edit</button>
                           <button onClick={() => onDeleteProperty(prop.id)} className="text-[11px] font-black text-rose-400 uppercase hover:text-rose-600">Delete</button>
                        </td>
                      </tr>
                    ))}
                    {properties.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No properties listed yet. Click "+ Add New PG" to start.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: LEADS */}
          {activeTab === 'leads' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:shadow-blue-100/50 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 text-xl">💬</div>
                  <h5 className="text-slate-500 font-bold text-sm uppercase tracking-wide mb-1">Total Conversations</h5>
                  <p className="text-4xl font-black text-slate-900">{conversationList.length}</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:shadow-orange-100/50 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-5 text-xl">📅</div>
                  <h5 className="text-slate-500 font-bold text-sm uppercase tracking-wide mb-1">Scheduled Visits</h5>
                  <p className="text-4xl font-black text-slate-900">{visits.length}</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 text-xl">✨</div>
                  <h5 className="text-slate-500 font-bold text-sm uppercase tracking-wide mb-1">Conversion</h5>
                  <p className="text-4xl font-black text-slate-900">8.4%</p>
                </div>
              </div>

              {/* Scheduled Visits */}
              <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100">
                <h4 className="text-xl font-black text-slate-900 mb-8 flex items-center justify-between">
                  Scheduled Property Visits
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">Live Active</span>
                </h4>
                <div className="space-y-8">
                  {visits.length === 0 && <p className="text-slate-400 font-bold">No scheduled visits yet.</p>}
                  {visits.map((visit) => (
                    <div key={visit.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 pb-8 border-b border-slate-100 last:border-0 last:pb-0 group">
                      <div className="w-16 h-16 rounded-[1.25rem] bg-orange-50 shrink-0 border border-orange-100 overflow-hidden flex items-center justify-center text-3xl">
                        📅
                      </div>
                      <div className="flex-1 w-full flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h5 className="text-lg font-black text-slate-900">{visit.userName}</h5>
                            <span className="px-2 py-1 text-[10px] uppercase font-black tracking-widest rounded-md bg-orange-50 text-orange-600">
                              {visit.status}
                            </span>
                          </div>
                          <p className="text-[14px] text-slate-500 font-medium">
                            Viewing: <span className="font-bold text-slate-700">{visit.propertyName}</span>
                          </p>
                          <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-wide">Date: <span className="text-indigo-600">{visit.date}</span> at <span className="text-indigo-600">{visit.time}</span></p>
                        </div>
                        <div className="shrink-0 flex gap-2">
                          <a href={`tel:${visit.userPhone}`} className="px-5 py-3 bg-slate-50 hover:bg-slate-800 text-slate-700 hover:text-white border border-slate-200 hover:border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest transition-all inline-flex items-center gap-2">
                            📞 {visit.userPhone}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Messages / Conversations */}
              <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100">
                <h4 className="text-xl font-black text-slate-900 mb-8 flex items-center justify-between">
                  Tenant Messages
                </h4>
                <div className="space-y-8">
                  {conversationList.length === 0 && <p className="text-slate-400 font-bold">No messages received yet.</p>}
                  {conversationList.map((conv) => (
                    <div key={conv.key} className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 pb-8 border-b border-slate-100 last:border-0 last:pb-0 group">
                      <div className="w-16 h-16 rounded-[1.25rem] bg-slate-100 shrink-0 border border-slate-200 overflow-hidden flex items-center justify-center">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.userName}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="" />
                      </div>
                      <div className="flex-1 w-full flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h5 className="text-lg font-black text-slate-900">{conv.userName}</h5>
                            <span className="px-2 py-1 text-[10px] uppercase font-black tracking-widest rounded-md bg-blue-50 text-blue-600">
                              New Message
                            </span>
                          </div>
                          <p className="text-[14px] text-slate-500 font-medium">
                            Enquiry for <span className="font-bold text-slate-700">{conv.propertyName}</span>
                          </p>
                          <p className="text-xs font-bold text-slate-400 mt-2 truncate max-w-sm border-l-2 border-indigo-200 pl-2 opacity-80">
                            "{conv.allMessages[conv.allMessages.length - 1]?.text}"
                          </p>
                        </div>
                        <div className="shrink-0">
                          <button onClick={() => setActiveChat(conv)} className="px-5 py-3 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-100 hover:border-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all inline-flex items-center gap-2 w-full justify-center sm:w-auto">
                            💬 Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: KYC VAULT */}
          {activeTab === 'kyc' && (
            <div className="bg-white p-8 sm:p-14 rounded-[3rem] shadow-sm border border-slate-100 text-center max-w-2xl mx-auto mt-6 relative overflow-hidden animate-in fade-in duration-500">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>

              <div className="w-24 h-24 bg-emerald-50 text-emerald-600 mx-auto rounded-3xl flex items-center justify-center text-4xl mb-6 ring-8 ring-emerald-50/50 shadow-inner">
                🛡️
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Digital KYC Vault</h3>
              <p className="text-slate-500 text-lg mb-12 leading-relaxed font-medium px-4">Verify your identity to unlock premium owner features and build extreme trust with tenants. Upload a clear photo of your Aadhaar or PAN card.</p>

              <div
                onClick={() => alert("Simulating native file explorer... Secure KYC Document uploaded to UrbanGhar Vault successfully!")}
                className="border-2 border-dashed border-slate-300 rounded-[2rem] p-12 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all cursor-pointer group shadow-sm bg-slate-50/50"
              >
                <div className="w-20 h-20 bg-white shadow-sm border border-slate-100 group-hover:bg-emerald-100 text-slate-500 group-hover:text-emerald-600 mx-auto rounded-2xl flex items-center justify-center text-3xl transition-colors mb-5 group-hover:scale-110 group-hover:-translate-y-1">
                  📄
                </div>
                <h4 className="text-lg font-black text-slate-900 mb-2">Click to browse or drag document here</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">JPG, PNG, PDF formats strictly</p>
              </div>

              <div className="mt-10 pt-10 border-t border-slate-100 flex items-center justify-between text-left bg-emerald-50/50 border border-emerald-100/50 p-5 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500 text-white shadow-lg shadow-emerald-200 rounded-xl flex items-center justify-center text-xl">✔️</div>
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-base">Aadhaar Card.jpg</h5>
                    <p className="text-[13px] text-emerald-700 font-bold mt-0.5">Verified on Oct 12, 2025</p>
                  </div>
                </div>
                <button className="text-slate-400 font-black text-xs uppercase hover:text-rose-500 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">Remove</button>
              </div>
            </div>
          )}

          {/* TAB: ACCOUNT */}
          {activeTab === 'account' && (
            <div className="max-w-xl mx-auto py-10 animate-in fade-in zoom-in duration-300">
              <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-indigo-100 border border-slate-100 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
                
                <div className="relative inline-block mb-10">
                  <div className="w-28 h-28 rounded-[2.5rem] bg-indigo-50 flex items-center justify-center shadow-inner overflow-hidden border-4 border-white">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                      className="w-full h-full object-cover" 
                      alt="Avatar" 
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-white w-10 h-10 rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center text-lg cursor-pointer hover:bg-slate-50 transition-colors">📸</div>
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">{user.name}</h3>

                <div className="space-y-6 text-left">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">FULL NAME</label>
                    <input 
                      type="text" 
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all placeholder:font-medium"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">MOBILE NUMBER</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold border-r pr-3 border-slate-200 mr-2 text-sm">+91</span>
                      <input 
                        type="text" 
                        className="w-full pl-20 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">NEW PASSWORD (OPTIONAL)</label>
                    <input 
                      type="password" 
                      placeholder="Min 6 characters"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all placeholder:font-medium"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                    />
                  </div>

                  <button 
                    disabled={isSaving}
                    onClick={async () => {
                      setIsSaving(true);
                      await onUpdateProfile({ name: editName, phone: editPhone, password: editPassword });
                      setIsSaving(false);
                      setEditPassword("");
                    }}
                    className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 mt-4"
                  >
                    {isSaving ? "Updating Profile..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* ADD PG MODAL */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
               <div className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-300">
                  <div className="p-5 sm:p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                     <h3 className="text-xl sm:text-2xl font-black text-slate-900">{editingPropId ? "Edit Property" : "Add New Property"}</h3>
                     <button onClick={handleCloseModal} className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center font-bold">✕</button>
                  </div>
                  
                  <div className="p-5 sm:p-8 space-y-6 sm:space-y-8 overflow-y-auto">
                     <div className="grid md:grid-cols-2 gap-6">
                        <div>
                           <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">PG NAME</label>
                           <input placeholder="e.g. Urban Stay Elite" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:bg-white focus:border-indigo-500" value={newProp.name} onChange={e => setNewProp({...newProp, name: e.target.value})} />
                        </div>
                        <div>
                           <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">PG TYPE</label>
                           <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:bg-white focus:border-indigo-500 cursor-pointer" value={newProp.type} onChange={e => setNewProp({...newProp, type: e.target.value})}>
                              <option>Boys PG</option>
                              <option>Girls PG</option>
                              <option>Co-living</option>
                           </select>
                        </div>
                     </div>

                     <div>
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">PG ADDRESS</label>
                        <input placeholder="Enter full address of the property" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:bg-white focus:border-indigo-500" value={newProp.address} onChange={e => setNewProp({...newProp, address: e.target.value})} />
                     </div>

                     <div className="grid md:grid-cols-3 gap-6">
                        <div>
                           <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">RENT / MO (₹)</label>
                           <input type="number" placeholder="8500" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:bg-white focus:border-indigo-500" value={newProp.rent} onChange={e => setNewProp({...newProp, rent: e.target.value})} />
                        </div>
                        <div>
                           <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">TOTAL BEDS</label>
                           <input type="number" placeholder="20" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:bg-white focus:border-indigo-500" value={newProp.totalBeds} onChange={e => setNewProp({...newProp, totalBeds: e.target.value})} />
                        </div>
                        <div>
                           <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">AVAIL. BEDS</label>
                           <input type="number" placeholder="5" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:bg-white focus:border-indigo-500" value={newProp.availableBeds} onChange={e => setNewProp({...newProp, availableBeds: e.target.value})} />
                        </div>
                     </div>

                     <div>
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-4 block">INCLUDED AMENITIES</label>
                        <div className="flex flex-wrap gap-3">
                           {availableAmenities.map(amt => (
                              <button 
                                 key={amt}
                                 onClick={() => toggleAmenity(amt)}
                                 className={`px-5 py-3 rounded-xl font-bold text-xs transition-all ${newProp.amenities.includes(amt) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                              >
                                 {amt}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="p-5 sm:p-8 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                     <button onClick={handleCloseModal} className="flex-1 py-4 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                     <button 
                        onClick={async () => {
                           if (!newProp.name || !newProp.address || !newProp.rent) return alert("Please fill mandatory fields.");
                           if (editingPropId) {
                             await onEditProperty(editingPropId, newProp);
                           } else {
                             await onAddProperty(newProp);
                           }
                           handleCloseModal();
                        }}
                        className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-indigo-100 transition-all"
                     >
                        {editingPropId ? "Update Listing" : "Confirm Listing"}
                     </button>
                  </div>
               </div>
            </div>
          )}
          {/* CHAT/REPLY MODAL */}
          {activeChat && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setActiveChat(null)}></div>
               <div className="bg-white w-full max-w-xl rounded-2xl sm:rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col h-[70vh] sm:h-[80vh] animate-in zoom-in duration-300">
                  <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10 shrink-0">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100">
                           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeChat.userName}`} className="w-full h-full object-cover" />
                        </div>
                        <div>
                           <h3 className="text-lg font-black text-slate-900">{activeChat.userName}</h3>
                           <p className="text-xs text-slate-500 font-bold">{activeChat.propertyName}</p>
                        </div>
                     </div>
                     <button onClick={() => setActiveChat(null)} className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center font-bold">✕</button>
                  </div>
                  
                  <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
                     {activeChat.allMessages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm font-medium shadow-sm ${msg.senderId === user.uid ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}`}>
                             {msg.text}
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="p-4 sm:p-6 border-t border-slate-100 bg-white shrink-0">
                     <form 
                        className="flex gap-2 sm:gap-3"
                        onSubmit={async (e) => {
                           e.preventDefault();
                           if (!replyInput.trim()) return;
                           await onReplyMessage(replyInput, activeChat.userId, activeChat.propertyId, activeChat.propertyName);
                           setReplyInput("");
                        }}
                     >
                        <input 
                           type="text" 
                           placeholder="Type your reply..." 
                           className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all placeholder:font-medium text-slate-800"
                           value={replyInput}
                           onChange={e => setReplyInput(e.target.value)}
                        />
                        <button type="submit" className="px-6 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all shrink-0">
                           Send
                        </button>
                     </form>
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OwnerDashboard;
