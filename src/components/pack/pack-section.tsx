"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Copy, Check } from "lucide-react";

export function PackSection({ renewalId }: { renewalId: string }) {
  const [pack, setPack] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generatePack() {
    setLoading(true);
    try {
      const res = await fetch(`/api/renewals/${renewalId}/pack`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.content) {
        setPack(data.content);
      }
    } catch (error) {
      console.error("Pack generation failed:", error);
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard() {
    if (!pack) return;
    await navigator.clipboard.writeText(pack);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!pack) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Renewal Pack</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Generate a renewal pack with a summary, comparison checklist,
            negotiation script, and more.
          </p>
          <Button onClick={generatePack} disabled={loading}>
            <FileText className="mr-2 h-4 w-4" />
            {loading ? "Generating..." : "Generate Pack"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Renewal Pack</CardTitle>
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            {copied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none whitespace-pre-wrap">
          {pack}
        </div>
      </CardContent>
    </Card>
  );
}
