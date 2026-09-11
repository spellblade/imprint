export type VaultGroup =
  | "identity"
  | "contact"
  | "address"
  | "work"
  | "custom";

export type VaultField = {
  id: string;
  key: string;
  label: string;
  value: string;
  group: VaultGroup;
  sensitive?: boolean;
};

export type Profile = {
  id: string;
  name: string;
  fields: VaultField[];
};

export type DetectedField = {
  id: string;
  name: string;
  label: string;
  type: string;
  tag: "input" | "select" | "textarea";
  required: boolean;
  placeholder?: string;
  autocomplete?: string;
  options?: string[];
  skipReason?: string;
};

export type FieldMapping = {
  fieldId: string;
  vaultKey: string | null;
  value: string;
  confidence: number;
  source: "heuristic" | "ai" | "user" | "saved";
  needsInput?: boolean;
  question?: string;
  saveAsKey?: string;
  saveAsLabel?: string;
};

export type SavedForm = {
  id: string;
  name: string;
  siteId: string;
  url: string;
  siteName: string;
  fields: DetectedField[];
  mappings: FieldMapping[];
  savedAt: number;
  lastFilledAt?: number;
  fillCount: number;
};

export type SampleSite = {
  id: string;
  name: string;
  host: string;
  path: string;
  title: string;
  blurb: string;
  theme: "careers" | "checkout" | "civic" | "clinic" | "signup";
};

export type ScanState = {
  fields: DetectedField[];
  mappings: FieldMapping[];
  activeFieldId: string | null;
  filling: boolean;
  filledIds: string[];
  pendingAsks: FieldMapping[];
};
