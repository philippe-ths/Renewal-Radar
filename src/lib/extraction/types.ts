export interface ExtractionResult {
  is_renewal: boolean;
  category: "home" | "car" | null;
  provider: string | null;
  policy_number: string | null;
  renewal_date: string | null; // ISO date string
  premium_annual: number | null;
  premium_monthly: number | null;
  currency: string;
  evidence: {
    category: string | null;
    provider: string | null;
    policy_number: string | null;
    renewal_date: string | null;
    premium: string | null;
  };
}
