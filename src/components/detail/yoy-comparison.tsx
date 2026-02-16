import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatGBP } from "@/lib/utils/currency";

interface YoYData {
  year: string;
  premiumAnnual: number | null;
  renewalDate: string | null;
}

export function YoYComparison({ data }: { data: YoYData[] }) {
  if (data.length < 2) return null;

  // Sort by year descending
  const sorted = [...data].sort((a, b) => (b.year > a.year ? 1 : -1));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Year-over-Year</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 font-medium text-muted-foreground">
                Year
              </th>
              <th className="text-right py-2 font-medium text-muted-foreground">
                Annual Premium
              </th>
              <th className="text-right py-2 font-medium text-muted-foreground">
                Change
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const prev = sorted[i + 1];
              let change: string | null = null;
              let changeColor = "";

              if (prev && row.premiumAnnual && prev.premiumAnnual) {
                const diff = row.premiumAnnual - prev.premiumAnnual;
                const pct = ((diff / prev.premiumAnnual) * 100).toFixed(1);
                change = `${diff >= 0 ? "+" : ""}${formatGBP(diff)} (${diff >= 0 ? "+" : ""}${pct}%)`;
                changeColor = diff > 0 ? "text-red-600" : diff < 0 ? "text-green-600" : "";
              }

              return (
                <tr key={row.year} className="border-b last:border-0">
                  <td className="py-2">{row.year}</td>
                  <td className="py-2 text-right">
                    {formatGBP(row.premiumAnnual)}
                  </td>
                  <td className={`py-2 text-right ${changeColor}`}>
                    {change || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
