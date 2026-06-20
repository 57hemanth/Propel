import React, { useState, useEffect } from 'react';
import AdminLogin from './components/AdminLogin';
import ProposalViewer from './components/ProposalViewer';
import ProposalHistory from './components/ProposalHistory';
import SettingsPanel from './components/SettingsPanel';
import { Proposal, SavedDraft, AgencyProfile, ProposalRequest } from './types';
import { Settings, History as HistoryIcon, FileText, Compass, Sparkles, Loader2, LayoutDashboard } from 'lucide-react';

const DEFAULT_AGENCY_PROFILE: AgencyProfile = {
  agencyName: "Karan's Agency",
  founderName: "Karan",
  team: [
    { name: "Karan", role: "Agency Founder & Tech Lead", bio: "Leads technical strategy and product architectures." },
    { name: "Siddharth", role: "Senior UX/UI Product Designer", bio: "Designs intuitive visitor loops and brand aesthetics." },
    { name: "Meera", role: "Lead Full-Stack Engineer", bio: "Develops blazing-fast frontend code and secure API setups." }
  ],
  pricingRange: "$3,000 - $25,000",
  defaultContactEmail: "team@karanagency.com",
  defaultTerms: "50% upfront, 50% upon project completion and launch."
};

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for Draft generation
  const [clientName, setClientName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [templateStyle, setTemplateStyle] = useState('Standard Agency');

  const [activeTab, setActiveTab] = useState<'create' | 'settings'>('create');
  
  const [drafts, setDrafts] = useState<SavedDraft[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  
  const [agencyProfile, setAgencyProfile] = useState<AgencyProfile>(() => {
    const saved = localStorage.getItem('agency_profile');
    return saved ? JSON.parse(saved) : DEFAULT_AGENCY_PROFILE;
  });

  useEffect(() => {
    const savedDrafts = localStorage.getItem('proposal_drafts');
    if (savedDrafts) {
      const parsed = JSON.parse(savedDrafts);
      setDrafts(parsed);
      if (parsed.length > 0) {
        setActiveDraftId(parsed[0].id);
      }
    }
  }, []);

  const saveProfile = (newProfile: AgencyProfile) => {
    setAgencyProfile(newProfile);
    localStorage.setItem('agency_profile', JSON.stringify(newProfile));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !serviceDescription.trim()) return;
    
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/proposal/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          clientName,
          serviceCategory: templateStyle,
          description: serviceDescription,
          agencyProfile
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const newDraft: SavedDraft = {
          id: generateId(),
          request: {
            clientName,
            serviceCategory: templateStyle,
            description: serviceDescription
          },
          proposal: {
            ...data.proposal,
            id: generateId()
          },
          createdAt: new Date().toISOString()
        };

        const updatedDrafts = [newDraft, ...drafts];
        setDrafts(updatedDrafts);
        localStorage.setItem('proposal_drafts', JSON.stringify(updatedDrafts));
        
        setActiveDraftId(newDraft.id);
        
        // Reset form
        setClientName('');
        setServiceDescription('');
      } else {
        setError(data.error || 'Failed to generate proposal.');
      }
    } catch (err) {
      setError('Connection failure. Could not reach server.');
    } finally {
      setIsGenerating(false);
    }
  };

  const activeDraft = drafts.find(d => d.id === activeDraftId);

  const handleUpdateDraft = (updatedProposal: Proposal) => {
    const updatedDrafts = drafts.map(d => {
      if (d.id === activeDraftId) {
        return { ...d, proposal: updatedProposal };
      }
      return d;
    });
    setDrafts(updatedDrafts);
    localStorage.setItem('proposal_drafts', JSON.stringify(updatedDrafts));
  };

  const handleDeleteDraft = (id: string) => {
    const updatedDrafts = drafts.filter(d => d.id !== id);
    setDrafts(updatedDrafts);
    localStorage.setItem('proposal_drafts', JSON.stringify(updatedDrafts));
    if (activeDraftId === id) {
      setActiveDraftId(updatedDrafts.length > 0 ? updatedDrafts[0].id : null);
    }
  };

  if (!token) {
    return <AdminLogin onLoginSuccess={setToken} />;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      {/* Navbar adhering to Sleek Interface */}
      <nav className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
            <div className="w-4 h-4 bg-white rounded-sm rotate-45"></div>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">
            Propel<span className="text-indigo-600">.ai</span>
          </span>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'create' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Compass className="h-4 w-4" />
            <span>Studio</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'settings' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Agency Settings</span>
          </button>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-medium text-slate-600">Secure Admin Session</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs uppercase shadow-sm">
            {agencyProfile.founderName.charAt(0)}
          </div>
        </div>
      </nav>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Form or Settings Menu */}
        {activeTab === 'create' ? (
          <aside className="w-[380px] bg-white border-r border-slate-200 p-8 flex flex-col shrink-0 justify-between overflow-y-auto">
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Draft Proposal</h1>
                <p className="text-sm text-slate-500 mt-1">Enter client details to generate a professional draft.</p>
              </div>

              <form onSubmit={handleGenerate} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Client Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Corp"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-sm"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Service Description</label>
                  <textarea
                    required
                    placeholder="What are they looking for? Be specific about requirements."
                    value={serviceDescription}
                    onChange={(e) => setServiceDescription(e.target.value)}
                    className="w-full h-40 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none text-sm leading-relaxed"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Template Style</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTemplateStyle('Standard Agency')}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors border ${
                        templateStyle === 'Standard Agency' 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Standard Agency
                    </button>
                    <button
                      type="button"
                      onClick={() => setTemplateStyle('Creative Brief')}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors border ${
                        templateStyle === 'Creative Brief' 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Creative Brief
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-100 font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isGenerating || !clientName || !serviceDescription}
                  className="w-full py-4 mt-2 bg-slate-900 text-white rounded-xl font-semibold shadow-lg shadow-slate-200 flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isGenerating ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Gathering Draft...</>
                  ) : (
                    <><Sparkles className="w-5 h-5" /> Generate Proposal</>
                  )}
                </button>
              </form>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
               <ProposalHistory 
                 drafts={drafts} 
                 activeDraftId={activeDraftId} 
                 onSelectDraft={(d) => setActiveDraftId(d.id)} 
                 onDeleteDraft={handleDeleteDraft}
               />
            </div>
          </aside>
        ) : (
          <aside className="w-[380px] bg-white border-r border-slate-200 p-8 flex flex-col shrink-0">
             <div className="space-y-1 mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                <p className="text-sm text-slate-500">Configure global app behaviors.</p>
             </div>
             <p className="text-sm text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                You are currently managing settings for <strong>{agencyProfile.agencyName}</strong>. 
                Switch over to this tab any time to modify the team structure before generating your next proposal.
             </p>
          </aside>
        )}

        {/* Main Content Area */}
        <section className="flex-1 bg-slate-100/80 flex items-start justify-center overflow-auto p-4 sm:p-10 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
           {activeTab === 'create' ? (
             activeDraft ? (
               <div className="w-full max-w-4xl mx-auto h-full pointer-events-auto">
                 <ProposalViewer 
                   proposal={activeDraft.proposal}
                   onUpdateProposal={handleUpdateDraft}
                 />
               </div>
             ) : (
               <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                 <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 mb-6">
                   <LayoutDashboard className="h-10 w-10 text-slate-300" />
                 </div>
                 <h2 className="text-xl font-bold text-slate-700">Workspace Ready</h2>
                 <p className="text-slate-500 mt-2 text-sm text-center max-w-sm">
                   Fill out the client details on the left to instantly generate a professional proposal draft.
                 </p>
               </div>
             )
           ) : (
             <div className="w-full max-w-3xl mx-auto py-4">
               <SettingsPanel 
                 currentProfile={agencyProfile} 
                 onSaveProfile={saveProfile} 
                 onResetDefaults={() => saveProfile(DEFAULT_AGENCY_PROFILE)} 
               />
             </div>
           )}
        </section>
      </main>
    </div>
  );
}
