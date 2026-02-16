// Gmail search queries for UK insurance renewal emails
const RENEWAL_QUERIES = [
  'subject:(renewal OR "renewal notice" OR "renewal invitation" OR "your renewal" OR "policy renewal")',
  'subject:("insurance renewal" OR "home insurance" OR "car insurance" OR "motor insurance" OR "buildings insurance")',
  'from:(admiral OR directline OR aviva OR axa OR churchill OR lv OR "legal and general" OR "more than" OR hastings OR esure OR "confused.com" OR comparethemarket OR gocompare OR moneysupermarket)',
  'subject:("your policy" OR "policy documents" OR "your premium" OR "annual premium")',
];

export function buildSearchQuery(daysBack: number = 365): string {
  const dateFilter = `newer_than:${daysBack}d`;
  const combined = RENEWAL_QUERIES.map((q) => `(${q})`).join(" OR ");
  return `(${combined}) ${dateFilter}`;
}

export function buildProviderQuery(
  provider: string,
  daysBack: number = 730
): string {
  return `from:${provider} subject:(renewal OR policy OR premium) newer_than:${daysBack}d`;
}
