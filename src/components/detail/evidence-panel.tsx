import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EvidenceItem {
  label: string;
  value: string | null;
  evidence: string | null;
}

export function EvidencePanel({ items }: { items: EvidenceItem[] }) {
  const withEvidence = items.filter((item) => item.evidence);

  if (withEvidence.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Evidence</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {withEvidence.map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                {item.label}
              </span>
              {item.value && (
                <span className="text-sm font-semibold">{item.value}</span>
              )}
            </div>
            <blockquote className="border-l-2 border-muted-foreground/30 pl-3 text-sm text-muted-foreground italic">
              &ldquo;{item.evidence}&rdquo;
            </blockquote>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
