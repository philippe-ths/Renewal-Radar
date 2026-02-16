import { Suspense } from "react";
import { db } from "@/lib/db";
import { renewals } from "@/lib/db/schema";
import { getStoredToken } from "@/lib/gmail/auth";
import { eq, like, or, and, sql } from "drizzle-orm";
import { Timeline } from "@/components/dashboard/timeline";
import { Filters } from "@/components/dashboard/filters";
import { SyncButton } from "@/components/dashboard/sync-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: { category?: string; search?: string; days?: string };
}

export default function DashboardPage({ searchParams }: PageProps) {
  const token = getStoredToken();
  const isConnected = !!token;

  // Build query conditions
  const conditions = [];

  if (searchParams.category === "home" || searchParams.category === "car") {
    conditions.push(eq(renewals.category, searchParams.category));
  }

  if (searchParams.search) {
    conditions.push(
      or(
        like(renewals.provider, `%${searchParams.search}%`),
        like(renewals.policyNumber, `%${searchParams.search}%`)
      )!
    );
  }

  if (searchParams.days) {
    const daysNum = parseInt(searchParams.days);
    if (!isNaN(daysNum)) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysNum);
      conditions.push(
        sql`${renewals.renewalDate} <= ${futureDate.toISOString().split("T")[0]}`
      );
    }
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const allRenewals = db
    .select()
    .from(renewals)
    .where(where)
    .orderBy(sql`${renewals.renewalDate} ASC`)
    .all();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Renewals Timeline</h2>
          {isConnected && token?.email && (
            <p className="text-sm text-muted-foreground">
              Connected as {token.email}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isConnected ? (
            <SyncButton />
          ) : (
            <Link href="/api/gmail/connect">
              <Button>Connect Gmail</Button>
            </Link>
          )}
        </div>
      </div>

      {isConnected && (
        <Suspense>
          <Filters />
        </Suspense>
      )}

      {!isConnected && (
        <div className="text-center py-16 space-y-4">
          <h3 className="text-xl font-semibold">Get started</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Connect your Gmail account to automatically find and track your
            home and car insurance renewals.
          </p>
          <Link href="/api/gmail/connect">
            <Button size="lg">Connect Gmail</Button>
          </Link>
        </div>
      )}

      {isConnected && allRenewals.length === 0 && (
        <div className="text-center py-16 space-y-4">
          <h3 className="text-xl font-semibold">No renewals found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Click &ldquo;Sync Gmail&rdquo; to search your inbox for insurance renewal emails.
          </p>
        </div>
      )}

      {allRenewals.length > 0 && <Timeline renewals={allRenewals} />}
    </div>
  );
}
