import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatGBP } from "@/lib/utils/currency";
import { format, parseISO, differenceInDays } from "date-fns";

interface RenewalCardProps {
  id: string;
  provider: string | null;
  category: string | null;
  renewalDate: string | null;
  premiumAnnual: number | null;
  premiumMonthly: number | null;
  status: string | null;
  policyNumber: string | null;
}

function getStatusColor(status: string | null, renewalDate: string | null) {
  if (!renewalDate) return "bg-gray-100 text-gray-700";
  const days = differenceInDays(parseISO(renewalDate), new Date());
  if (days < 0) return "bg-red-100 text-red-700";
  if (days <= 30) return "bg-amber-100 text-amber-700";
  return "bg-green-100 text-green-700";
}

function getStatusLabel(status: string | null, renewalDate: string | null) {
  if (!renewalDate) return "Unknown";
  const days = differenceInDays(parseISO(renewalDate), new Date());
  if (days < 0) return "Expired";
  if (days <= 7) return "Due this week";
  if (days <= 30) return "Due soon";
  return "Upcoming";
}

export function RenewalCard({
  id,
  provider,
  category,
  renewalDate,
  premiumAnnual,
  premiumMonthly,
  status,
  policyNumber,
}: RenewalCardProps) {
  const statusColor = getStatusColor(status, renewalDate);
  const statusLabel = getStatusLabel(status, renewalDate);
  const premium = premiumAnnual ?? premiumMonthly;
  const premiumLabel = premiumAnnual ? "/year" : premiumMonthly ? "/month" : "";

  return (
    <Link href={`/renewals/${id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">
                {provider || "Unknown provider"}
              </h3>
              {policyNumber && (
                <p className="text-sm text-muted-foreground">
                  {policyNumber}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {category && (
                <Badge variant="secondary" className="capitalize">
                  {category}
                </Badge>
              )}
              <Badge className={statusColor}>{statusLabel}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-muted-foreground">Renewal date</p>
              <p className="font-medium">
                {renewalDate
                  ? format(parseISO(renewalDate), "d MMM yyyy")
                  : "Unknown"}
              </p>
            </div>
            {premium != null && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Premium</p>
                <p className="font-semibold text-lg">
                  {formatGBP(premium)}
                  <span className="text-sm font-normal text-muted-foreground">
                    {premiumLabel}
                  </span>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
