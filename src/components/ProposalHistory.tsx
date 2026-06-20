import { SavedDraft } from '../types';
import { History, Trash2, Calendar, FileText, ArrowRight } from 'lucide-react';

interface ProposalHistoryProps {
  drafts: SavedDraft[];
  activeDraftId: string | null;
  onSelectDraft: (draft: SavedDraft) => void;
  onDeleteDraft: (id: string) => void;
}

export default function ProposalHistory({
  drafts,
  activeDraftId,
  onSelectDraft,
  onDeleteDraft,
}: ProposalHistoryProps) {
  if (drafts.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="inline-flex p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-300 mb-3">
          <History className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-700">No recent drafts</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
          Proposals will be automatically saved locally for easy access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
        <History className="h-4 w-4 text-indigo-600" />
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Local History</h3>
        <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-md font-mono font-bold">
          {drafts.length}
        </span>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {drafts.map((draft) => {
          const isActive = activeDraftId === draft.id;
          const dateStr = new Date(draft.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={draft.id}
              className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-indigo-50 border-indigo-200 text-slate-900 shadow-sm shadow-indigo-100'
                  : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600'
              }`}
              onClick={() => onSelectDraft(draft)}
            >
              <div className="flex-1 min-w-0 pr-3">
                <div className="flex items-center space-x-2 mb-1.5">
                  <FileText className={`h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className={`text-sm font-bold truncate max-w-[150px] block ${isActive ? 'text-indigo-950' : 'text-slate-900'}`}>
                    {draft.proposal.clientName}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase font-semibold ${isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 transition'}`}>
                    {draft.proposal.serviceCategory.split(' ')[0]}
                  </span>
                </div>
                
                <h4 className={`text-xs font-medium truncate ${isActive ? 'text-indigo-800' : 'text-slate-500 group-hover:text-slate-700 transition'}`}>
                  {draft.proposal.title}
                </h4>

                <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-2 font-medium">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{dateStr}</span>
                </div>
              </div>

              <div className="flex items-center space-x-1 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete the proposal draft for ${draft.proposal.clientName}?`)) {
                      onDeleteDraft(draft.id);
                    }
                  }}
                  type="button"
                  id={`delete-draft-btn-${draft.id}`}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer opacity-70 group-hover:opacity-100"
                  title="Remove Proposal"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className={`p-1.5 rounded-full ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5'} transition-all`}>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
