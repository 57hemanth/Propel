import { useState } from 'react';
import { Proposal } from '../types';
import { 
  Copy, Check, FileDown, Printer, Edit3, Save,
  Calendar, Award
} from 'lucide-react';

interface ProposalViewerProps {
  proposal: Proposal;
  onUpdateProposal?: (updated: Proposal) => void;
}

export default function ProposalViewer({
  proposal,
  onUpdateProposal,
}: ProposalViewerProps) {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [editedProposal, setEditedProposal] = useState<Proposal>({ ...proposal });

  if (proposal.id !== editedProposal.id) {
    setEditedProposal({ ...proposal });
  }

  const handleFieldChange = (key: keyof Proposal, value: any) => {
    setEditedProposal(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNestedFieldChange = (parent: 'pricingEstimate', key: string, value: any) => {
    setEditedProposal(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [key]: value
      }
    }));
  };

  const handleScopeChange = (index: number, key: string, value: any) => {
    const updatedScope = [...editedProposal.scopeTimeline];
    updatedScope[index] = {
      ...updatedScope[index],
      [key]: value
    };
    handleFieldChange('scopeTimeline', updatedScope);
  };

  const handleSaveEdits = () => {
    setIsEditing(false);
    if (onUpdateProposal) {
      onUpdateProposal(editedProposal);
    }
  };

  const getProposalMarkdown = (p: Proposal): string => {
    let md = `# ${p.title}\n\n`;
    md += `**Client Name:** ${p.clientName}\n`;
    md += `**Service Area:** ${p.serviceCategory}\n`;
    md += `**Date:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;
    
    md += `## 1. Executive Summary\n\n${p.executiveSummary}\n\n`;
    
    md += `## 2. Core Project Objectives\n\n`;
    p.keyObjectives.forEach((obj, idx) => {
      md += `${idx + 1}. ${obj}\n`;
    });
    md += `\n`;

    md += `## 3. Scope of Work & Production Timeline\n\n`;
    p.scopeTimeline.forEach((step) => {
      md += `### ${step.phase} (${step.duration})\n`;
      md += `*Description:* ${step.description}\n\n`;
      md += `*Deliverables:*\n`;
      step.deliverables.forEach((item) => {
        md += `- [ ] ${item}\n`;
      });
      md += `\n`;
    });

    md += `## 4. Team Structure & Allocation\n\n${p.teamStructureText}\n\n`;

    md += `## 5. Estimated Financial Investment\n\n`;
    md += `| Milestone / Deliverable Scope | Estimated Value |\n`;
    md += `| :--- | :--- |\n`;
    p.pricingEstimate.details.forEach((item) => {
      md += `| ${item.task} | ${item.amount} |\n`;
    });
    md += `| **TOTAL ESTIMATED INVESTMENT** | **${p.pricingEstimate.total}** |\n\n`;

    md += `## 6. Lean Efficiency Promise (Why Us)\n\n${p.whyOurAgency}\n\n`;

    md += `## 7. Actionable Next Steps\n\n`;
    p.nextSteps.forEach((step, idx) => {
      md += `${idx + 1}. [ ] ${step}\n`;
    });
    
    return md;
  };

  const handleCopyMarkdown = () => {
    const markdown = getProposalMarkdown(editedProposal);
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const markdown = getProposalMarkdown(editedProposal);
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `proposal_${editedProposal.clientName.toLowerCase().replace(/\s+/g, '_')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Top Toolbar controls */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-wrap gap-3 items-center justify-between shadow-sm print:hidden">
        <div className="flex items-center space-x-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
          </span>
          <span className="text-sm font-semibold text-slate-600">
            {isEditing ? 'Live editing active...' : 'Interactive proposal draft ready'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <button
              onClick={handleSaveEdits}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all cursor-pointer shadow-sm shadow-indigo-500/20"
              id="save-proposal-edits-btn"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200 transition-all cursor-pointer"
              id="edit-proposal-btn"
            >
              <Edit3 className="h-4 w-4" />
              <span>Tweak Draft</span>
            </button>
          )}

          <button
            onClick={handleCopyMarkdown}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200 transition-all cursor-pointer"
            title="CopyToClipboard"
            id="copy-markdown-btn"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                <span className="text-emerald-600 font-bold">Copied Markdown!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy Markdown</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200 transition-all cursor-pointer"
            id="download-markdown-btn"
          >
            <FileDown className="h-4 w-4" />
            <span>{downloaded ? 'Saved!' : 'Download .md'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs rounded-lg transition-all cursor-pointer shadow-md shadow-slate-200/50"
            id="print-pdf-btn"
          >
            <Printer className="h-4 w-4" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Document Box */}
      <div 
        className="bg-white w-full shadow-2xl rounded-sm border border-slate-200 p-12 flex flex-col font-sans h-full print:border-none print:shadow-none print:p-0 print:m-0"
        style={{ contentVisibility: 'auto' }}
        id="proposal-printable-document"
      >
        <div className="flex justify-between items-start mb-12 border-b border-slate-100 pb-8">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-600">Proposed for</p>
            {isEditing ? (
              <input
                type="text"
                value={editedProposal.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className="font-serif font-medium text-2xl sm:text-3xl text-slate-900 border-b border-dashed border-indigo-500 focus:outline-none w-[400px] bg-indigo-50 p-1"
              />
            ) : (
              <h2 className="text-2xl font-serif font-medium text-slate-900 italic">
                {editedProposal.title}
              </h2>
            )}
            <p className="text-sm font-semibold text-slate-500 pt-1">
              Focus: {editedProposal.serviceCategory}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</p>
            <p className="text-sm font-medium text-slate-800">
              {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3">Ref ID</p>
            <p className="font-mono text-xs text-slate-600 font-semibold">PP-{editedProposal.id.substring(0, 6).toUpperCase()}</p>
          </div>
        </div>

        <div className="space-y-10">
          {/* Section 1: Executive Summary */}
          <section className="space-y-3" id="sec-executive-summary">
            <h3 className="text-base font-bold border-b border-slate-100 pb-3 text-slate-800 uppercase tracking-wider">
              1. Executive Summary
            </h3>
            <div className="text-slate-700 leading-relaxed text-sm sm:text-base space-y-4">
              {isEditing ? (
                <textarea
                  value={editedProposal.executiveSummary}
                  rows={5}
                  onChange={(e) => handleFieldChange('executiveSummary', e.target.value)}
                  className="w-full text-slate-800 border border-dashed border-indigo-500 focus:outline-none bg-indigo-50/50 p-3 text-sm resize-none rounded-lg"
                />
              ) : (
                <p className="whitespace-pre-line leading-relaxed">
                  {editedProposal.executiveSummary}
                </p>
              )}
            </div>
          </section>

          {/* Section 2: Key Objectives */}
          <section className="space-y-3" id="sec-key-objectives">
            <h3 className="text-base font-bold border-b border-slate-100 pb-3 text-slate-800 uppercase tracking-wider">
              2. Core Project Objectives
            </h3>
            <ul className="space-y-3 mt-2 leading-relaxed text-slate-700 text-sm sm:text-base">
              {editedProposal.keyObjectives.map((obj, index) => (
                <li key={index} className="flex gap-3 items-start">
                  <span className="font-bold text-indigo-600 mt-0.5">•</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={obj}
                      onChange={(e) => {
                        const updated = [...editedProposal.keyObjectives];
                        updated[index] = e.target.value;
                        handleFieldChange('keyObjectives', updated);
                      }}
                      className="w-full text-slate-800 border-b border-dashed border-indigo-500 focus:outline-none bg-indigo-50/50 px-1 text-sm font-medium"
                    />
                  ) : (
                    <span>{obj}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {/* Section 3: Scope of Work */}
          <section className="space-y-4 page-break-after" id="sec-scope-timeline">
             <h3 className="text-base font-bold border-b border-slate-100 pb-3 text-slate-800 uppercase tracking-wider">
              3. Scope & Timeline
            </h3>
            <div className="space-y-6">
              {editedProposal.scopeTimeline.map((step, index) => (
                <div key={index} className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-lg">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-indigo-500" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={step.phase}
                          onChange={(e) => handleScopeChange(index, 'phase', e.target.value)}
                          className="font-bold text-sm text-slate-900 border-b border-dashed border-indigo-500 bg-indigo-50/50 w-full"
                        />
                      ) : (
                        <h4 className="font-bold text-slate-900 text-sm">
                          {step.phase}
                        </h4>
                      )}
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={step.duration}
                        onChange={(e) => handleScopeChange(index, 'duration', e.target.value)}
                        className="text-xs text-indigo-700 bg-indigo-50/50 border-b border-dashed border-indigo-500 w-32"
                      />
                    ) : (
                      <span className="bg-indigo-100/50 text-indigo-700 border border-indigo-100 text-xs px-2.5 py-1 font-semibold rounded-full">
                        {step.duration}
                      </span>
                    )}
                  </div>

                  {isEditing ? (
                    <textarea
                      value={step.description}
                      rows={2}
                      onChange={(e) => handleScopeChange(index, 'description', e.target.value)}
                      className="w-full text-slate-700 focus:outline-none border border-dashed border-indigo-500 bg-indigo-50/50 leading-relaxed text-sm p-2 mb-3 resize-none rounded-lg"
                    />
                  ) : (
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                      {step.description}
                    </p>
                  )}

                  <div>
                    <span className="font-semibold text-[10px] uppercase tracking-wider text-slate-500 block mb-2">
                      Deliverables:
                    </span>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-700">
                      {step.deliverables.map((del, dIdx) => (
                        <li key={dIdx} className="flex gap-2">
                           <span className="text-slate-400">-</span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={del}
                              onChange={(e) => {
                                const updatedDels = [...step.deliverables];
                                updatedDels[dIdx] = e.target.value;
                                handleScopeChange(index, 'deliverables', updatedDels);
                              }}
                              className="w-full text-slate-700 focus:outline-none border-b border-dashed border-indigo-500 bg-indigo-50/50 px-1"
                            />
                          ) : (
                            <span>{del}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: Team Allocation */}
          <section className="space-y-3" id="sec-team-structure">
             <h3 className="text-base font-bold border-b border-slate-100 pb-3 text-slate-800 uppercase tracking-wider">
              4. Agency Setup
            </h3>
            <div className="bg-white border border-slate-200 p-6 rounded-xl flex gap-5 shadow-sm">
              <div className="p-3 bg-slate-50 text-slate-600 rounded-lg shrink-0 border border-slate-200 h-min">
                <Award className="h-6 w-6" />
              </div>
              <div>
                {isEditing ? (
                  <textarea
                    value={editedProposal.teamStructureText}
                    rows={4}
                    onChange={(e) => handleFieldChange('teamStructureText', e.target.value)}
                    className="w-full text-slate-700 bg-indigo-50/50 border border-dashed border-indigo-500 focus:outline-none leading-relaxed resize-none p-3 rounded-lg text-sm"
                  />
                ) : (
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {editedProposal.teamStructureText}
                  </p>
                )}
                <div className="mt-4 text-[10px] font-bold uppercase tracking-widest text-indigo-600">
                  100% Production Allocation • Lean Execution • Speed to Market
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Estimated Investment */}
          <section className="space-y-4" id="sec-pricing-estimate">
             <h3 className="text-base font-bold border-b border-slate-100 pb-3 text-slate-800 uppercase tracking-wider">
              5. Investment
            </h3>
            
            <div className="border border-slate-200 rounded-xl overflow-hidden font-sans text-sm mb-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <th className="py-4 px-6 font-bold">Milestone Area</th>
                    <th className="py-4 px-6 text-right font-bold">Estimated Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {editedProposal.pricingEstimate.details.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-4 px-6 text-slate-800 font-medium">
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.task}
                            onChange={(e) => {
                              const updated = [...editedProposal.pricingEstimate.details];
                              updated[idx] = { ...updated[idx], task: e.target.value };
                              handleNestedFieldChange('pricingEstimate', 'details', updated);
                            }}
                            className="w-full border-b border-dashed border-indigo-500 bg-indigo-50/50 focus:outline-none py-1"
                          />
                        ) : (
                          <span>{item.task}</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right text-slate-900 font-bold">
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.amount}
                            onChange={(e) => {
                              const updated = [...editedProposal.pricingEstimate.details];
                              updated[idx] = { ...updated[idx], amount: e.target.value };
                              handleNestedFieldChange('pricingEstimate', 'details', updated);
                            }}
                            className="w-3/4 text-right border-b border-dashed border-indigo-500 bg-indigo-50/50 focus:outline-none py-1"
                          />
                        ) : (
                          <span>{item.amount}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {/* Total investment banner */}
                  <tr className="bg-slate-900 text-white">
                    <td className="py-5 px-6 font-bold uppercase tracking-widest text-xs">
                      Total Project Investment
                    </td>
                    <td className="py-5 px-6 text-right font-bold text-lg">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProposal.pricingEstimate.total}
                          onChange={(e) => handleNestedFieldChange('pricingEstimate', 'total', e.target.value)}
                          className="text-right font-bold w-full border-b border-dashed border-slate-500 bg-slate-800 focus:outline-none py-1"
                        />
                      ) : (
                        <span>{editedProposal.pricingEstimate.total}</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 6: Next Steps */}
          <section className="space-y-4" id="sec-next-steps">
             <h3 className="text-base font-bold border-b border-slate-100 pb-3 text-slate-800 uppercase tracking-wider">
              6. Next Steps
            </h3>
            <div className="space-y-3 font-sans text-sm text-slate-700">
              {editedProposal.nextSteps.map((step, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="h-6 w-6 rounded-md bg-white border border-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <div className="w-full pt-0.5">
                    {isEditing ? (
                      <input
                        type="text"
                        value={step}
                        onChange={(e) => {
                          const updated = [...editedProposal.nextSteps];
                          updated[idx] = e.target.value;
                          handleFieldChange('nextSteps', updated);
                        }}
                        className="w-full text-slate-800 border-b border-dashed border-indigo-500 bg-indigo-50/50 focus:outline-none font-medium py-1"
                      />
                    ) : (
                      <span className="leading-relaxed">{step}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 7: Why Us */}
           <section className="space-y-3 border-t border-slate-100 pt-8 mt-12" id="sec-why-our-agency">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Commitment to Quality
            </h3>
            <div className="text-slate-600 leading-relaxed text-sm italic">
              {isEditing ? (
                <textarea
                  value={editedProposal.whyOurAgency}
                  rows={3}
                  onChange={(e) => handleFieldChange('whyOurAgency', e.target.value)}
                  className="w-full text-slate-700 bg-indigo-50/50 border border-dashed border-indigo-500 focus:outline-none leading-relaxed resize-none p-3 rounded-lg"
                />
              ) : (
                <p>"{editedProposal.whyOurAgency}"</p>
              )}
            </div>
          </section>

          </div>
      </div>
    </div>
  );
}
