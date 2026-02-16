import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatGBP } from "@/lib/utils/currency";
import { format, parseISO } from "date-fns";

interface RenewalDetailProps {
  renewal: {
    id: string;
    category: string | null;
    provider: string | null;
    policyNumber: string | null;
    renewalDate: string | null;
    premiumAnnual: number | null;
    premiumMonthly: number | null;
    currency: string | null;
    status: string | null;
  };
  email: {
    subject: string | null;
    fromAddress: string | null;
    date: string | null;
    hasPdf: boolean | null;
    pdfFilename: string | null;
  } | null;
}

export function RenewalDetail({ renewal, email }: RenewalDetailProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{renewal.provider || "Unknown Provider"}</CardTitle>
            {renewal.policyNumber && (
              <p className="text-sm text-muted-foreground mt-1">
                Policy: {renewal.policyNumber}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {renewal.category && (
              <Badge variant="secondary" className="capitalize">
                {renewal.category}
              </Badge>
            )}
            {renewal.status && (
              <Badge
                className={
                  renewal.status === "expired"
                    ? "bg-red-100 text-red-700"
                    : renewal.status === "due_soon"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-green-100 text-green-700"
                }
              >
                {renewal.status.replace("_", " ")}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Renewal Date</p>
            <p className="font-semibold">
              {renewal.renewalDate
                ? format(parseISO(renewal.renewalDate), "d MMMM yyyy")
                : "Unknown"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Annual Premium</p>
            <p className="font-semibold">
              {formatGBP(renewal.premiumAnnual)}
            </p>
          </div>
          {renewal.premiumMonthly && (
            <div>
              <p className="text-sm text-muted-foreground">Monthly Premium</p>
              <p className="font-semibold">
                {formatGBP(renewal.premiumMonthly)}
              </p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Currency</p>
            <p className="font-semibold">{renewal.currency || "GBP"}</p>
          </div>
        </div>

        {email && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Source Email
            </h4>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Subject:</span>{" "}
                {email.subject}
              </p>
              <p>
                <span className="text-muted-foreground">From:</span>{" "}
                {email.fromAddress}
              </p>
              <p>
                <span className="text-muted-foreground">Date:</span>{" "}
                {email.date}
              </p>
              {email.hasPdf && email.pdfFilename && (
                <p>
                  <span className="text-muted-foreground">Attachment:</span>{" "}
                  {email.pdfFilename}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
