import { RenewalCard } from "./renewal-card";
import { getDateBucket, type DateBucket } from "@/lib/utils/dates";

interface Renewal {
  id: string;
  provider: string | null;
  category: string | null;
  renewalDate: string | null;
  premiumAnnual: number | null;
  premiumMonthly: number | null;
  status: string | null;
  policyNumber: string | null;
}

const BUCKET_LABELS: Record<DateBucket, string> = {
  overdue: "Overdue",
  "30": "Next 30 days",
  "60": "31-60 days",
  "90": "61-90 days",
  "90+": "90+ days",
};

const BUCKET_ORDER: DateBucket[] = ["overdue", "30", "60", "90", "90+"];

export function Timeline({ renewals }: { renewals: Renewal[] }) {
  const buckets = new Map<DateBucket, Renewal[]>();

  for (const bucket of BUCKET_ORDER) {
    buckets.set(bucket, []);
  }

  for (const renewal of renewals) {
    if (!renewal.renewalDate) {
      buckets.get("90+")!.push(renewal);
      continue;
    }
    const bucket = getDateBucket(renewal.renewalDate);
    buckets.get(bucket)!.push(renewal);
  }

  const nonEmptyBuckets = BUCKET_ORDER.filter(
    (b) => buckets.get(b)!.length > 0
  );

  if (nonEmptyBuckets.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {nonEmptyBuckets.map((bucket) => (
        <div key={bucket}>
          <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
            {BUCKET_LABELS[bucket]}
            <span className="ml-2 text-sm font-normal">
              ({buckets.get(bucket)!.length})
            </span>
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {buckets.get(bucket)!.map((renewal) => (
              <RenewalCard key={renewal.id} {...renewal} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
