import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { renewals, emails } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { RenewalDetail } from "@/components/detail/renewal-detail";
import { EvidencePanel } from "@/components/detail/evidence-panel";
import { YoYComparison } from "@/components/detail/yoy-comparison";
import { PackSection } from "@/components/pack/pack-section";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { formatGBP } from "@/lib/utils/currency";

export const dynamic = "force-dynamic";

export default function RenewalDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const renewal = db
    .select()
    .from(renewals)
    .where(eq(renewals.id, params.id))
    .get();

  if (!renewal) notFound();

  // Get associated email
  let email = null;
  if (renewal.emailId) {
    email = db
      .select()
      .from(emails)
      .where(eq(emails.id, renewal.emailId))
      .get() || null;
  }

  // Year-over-year: find renewals with same provider + category
  const yoyData =
    renewal.provider && renewal.category
      ? db
          .select()
          .from(renewals)
          .where(
            and(
              eq(renewals.provider, renewal.provider),
              eq(renewals.category, renewal.category)
            )
          )
          .all()
          .map((r) => ({
            year: r.renewalDate ? r.renewalDate.slice(0, 4) : "Unknown",
            premiumAnnual: r.premiumAnnual,
            renewalDate: r.renewalDate,
          }))
      : [];

  // Evidence items
  const evidenceItems = [
    {
      label: "Category",
      value: renewal.category,
      evidence: renewal.evidenceCategory,
    },
    {
      label: "Provider",
      value: renewal.provider,
      evidence: renewal.evidenceProvider,
    },
    {
      label: "Policy Number",
      value: renewal.policyNumber,
      evidence: renewal.evidencePolicy,
    },
    {
      label: "Renewal Date",
      value: renewal.renewalDate,
      evidence: renewal.evidenceDate,
    },
    {
      label: "Premium",
      value: formatGBP(renewal.premiumAnnual),
      evidence: renewal.evidencePremium,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to timeline
        </Button>
      </Link>

      <RenewalDetail renewal={renewal} email={email} />

      <EvidencePanel items={evidenceItems} />

      <YoYComparison data={yoyData} />

      <PackSection renewalId={renewal.id} />
    </div>
  );
}
