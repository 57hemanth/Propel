export interface TeamMember {
  name: string;
  role: string;
  bio: string;
}

export interface AgencyProfile {
  agencyName: string;
  founderName: string;
  team: TeamMember[];
  pricingRange: string;
  defaultContactEmail: string;
  defaultTerms: string;
}

export interface ProposalRequest {
  clientName: string;
  serviceCategory: string;
  description: string;
  customDeliverables?: string[];
  timelineWeeks?: number;
  budget?: string;
  difficultyTone?: 'standard' | 'persuasive' | 'technical' | 'urgent';
}

export interface ActionPlanStep {
  phase: string;
  duration: string;
  description: string;
  deliverables: string[];
}

export interface Proposal {
  id: string;
  clientName: string;
  serviceCategory: string;
  dateGenerated: string;
  title: string;
  executiveSummary: string;
  keyObjectives: string[];
  scopeTimeline: ActionPlanStep[];
  teamStructureText: string;
  pricingEstimate: {
    total: string;
    details: Array<{ task: string; amount: string }>;
  };
  whyOurAgency: string;
  nextSteps: string[];
}

export interface SavedDraft {
  id: string;
  request: ProposalRequest;
  proposal: Proposal;
  createdAt: string;
}
