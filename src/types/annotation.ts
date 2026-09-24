export interface BoundingBox {
  id: string;
  label: string;
  // Normalized 0 to 1000 scale [ymin, xmin, ymax, xmax]
  box_2d: [number, number, number, number];
  confidence?: number;
  isAiSuggested?: boolean;
  reviewed?: boolean;
  rationale?: string;
}

export interface VisionItem {
  id: string;
  name: string;
  imageUrl: string;
  width: number;
  height: number;
  status: 'unannotated' | 'ai_suggested' | 'annotated' | 'reviewed';
  boxes: BoundingBox[];
  tags?: string[];
  notes?: string;
}

export interface NEREntity {
  id: string;
  text: string;
  label: string;
  start: number;
  end: number;
  confidence?: number;
  isAiSuggested?: boolean;
}

export interface TextItem {
  id: string;
  title: string;
  text: string;
  entities: NEREntity[];
  classification?: {
    category: string;
    confidence: number;
    rationale?: string;
  };
  status: 'unannotated' | 'ai_suggested' | 'annotated' | 'reviewed';
}

export interface RLHFItem {
  id: string;
  prompt: string;
  responseA: {
    modelName: string;
    text: string;
    score?: number;
  };
  responseB: {
    modelName: string;
    text: string;
    score?: number;
  };
  preference?: 'A' | 'B' | 'TIE';
  evaluatorNotes?: string;
  aiCritique?: {
    preferred: 'A' | 'B' | 'TIE';
    scoreA: number;
    scoreB: number;
    justification: string;
    strengthsA?: string[];
    strengthsB?: string[];
    suggestedGoldResponse?: string;
  };
  status: 'unannotated' | 'annotated' | 'reviewed';
}

export interface TaxonomyClass {
  id: string;
  name: string;
  color: string;
  hotkey: string;
  description: string;
  dosAndDonts?: string;
}

export interface AuditIssue {
  itemId: string;
  itemName: string;
  severity: 'high' | 'medium' | 'low';
  type: 'missing_label' | 'inconsistency' | 'boundary_error' | 'outlier' | 'low_confidence';
  description: string;
  suggestedFix: string;
}

export interface AuditReport {
  healthScore: number;
  summary: string;
  issues: AuditIssue[];
  auditedAt: string;
}

export type ActiveWorkspace = 'vision' | 'ner' | 'rlhf' | 'audit' | 'taxonomy';
