import React, { useState } from 'react';
import { Save, User, Mail, ShieldAlert, Award, Sliders, RotateCcw } from 'lucide-react';
import { AgencyProfile } from '../types';

interface SettingsPanelProps {
  currentProfile: AgencyProfile;
  onSaveProfile: (profile: AgencyProfile) => void;
  onResetDefaults: () => void;
}

export default function SettingsPanel({
  currentProfile,
  onSaveProfile,
  onResetDefaults,
}: SettingsPanelProps) {
  const [profile, setProfile] = useState<AgencyProfile>({ ...currentProfile });
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (field: keyof AgencyProfile, value: any) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
    setIsSaved(false);
  };

  const handleTeamMemberChange = (index: number, key: 'name' | 'role' | 'bio', value: string) => {
    const updatedTeam = [...profile.team];
    updatedTeam[index] = {
      ...updatedTeam[index],
      [key]: value,
    };
    setProfile((prev) => ({
      ...prev,
      team: updatedTeam,
    }));
    setIsSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(profile);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xl shadow-slate-200/40">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Sliders className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Agency Profile & Settings</h3>
            <p className="text-sm text-slate-500 mt-1">Configure default parameters for the agency structure and team</p>
          </div>
        </div>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to reset all team profiles to original defaults?')) {
              onResetDefaults();
              setTimeout(() => {
                const refreshed = localStorage.getItem('agency_profile');
                if (refreshed) {
                  setProfile(JSON.parse(refreshed));
                }
              }, 50);
            }
          }}
          type="button"
          className="inline-flex items-center space-x-1 border border-slate-200 text-xs px-3 py-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 font-medium transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8" id="agency-settings-form">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Agency Name
            </label>
            <input
              type="text"
              required
              value={profile.agencyName}
              onChange={(e) => handleChange('agencyName', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Founder / Primary Contact
            </label>
            <input
              type="text"
              required
              value={profile.founderName}
              onChange={(e) => handleChange('founderName', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Default Contact Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                value={profile.defaultContactEmail}
                onChange={(e) => handleChange('defaultContactEmail', e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Standard Client Budget Context
            </label>
            <input
              type="text"
              required
              value={profile.pricingRange}
              placeholder="e.g. $5,000 - $30,000"
              onChange={(e) => handleChange('pricingRange', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Award className="h-5 w-5 text-indigo-600" />
            <h4 className="text-base font-bold text-slate-900">Constraint 2: Professional 3-Person Team Structure</h4>
          </div>
          <p className="text-sm text-slate-600 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            For speed and quality, Karan's agency operates as a tight-knit <strong>3-person team</strong>. Editing these profiles feeds directly into the AI proposal writer to generate accurate custom team chapters.
          </p>

          <div className="space-y-4">
            {profile.team.map((member, idx) => (
              <div key={idx} className="p-5 bg-white rounded-xl border border-slate-200 space-y-4 shadow-sm shadow-slate-100">
                <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  <User className="h-4 w-4" />
                  <span>Team Member {idx + 1}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Name"
                      value={member.name}
                      onChange={(e) => handleTeamMemberChange(idx, 'name', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Role (e.g. Lead Designer)"
                      value={member.role}
                      onChange={(e) => handleTeamMemberChange(idx, 'role', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <textarea
                    required
                    placeholder="Short bio & expertise to highlight in proposal..."
                    value={member.bio}
                    rows={2}
                    onChange={(e) => handleTeamMemberChange(idx, 'bio', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none font-sans"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Default Investment Payment Terms
          </label>
          <textarea
            required
            value={profile.defaultTerms}
            rows={2}
            onChange={(e) => handleChange('defaultTerms', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans"
          />
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
            <ShieldAlert className="h-4 w-4" />
            <span>Updates apply immediately on subsequent drafts</span>
          </div>
          
          <button
            type="submit"
            id="settings-save-button"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white font-semibold hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 cursor-pointer text-sm"
          >
            <Save className="h-4 w-4" />
            <span>{isSaved ? 'Defaults Saved!' : 'Save Agency Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
