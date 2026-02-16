"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function SyncButton({ lastSynced }: { lastSynced?: string | null }) {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSync() {
    setSyncing(true);
    setResult(null);

    try {
      const res = await fetch("/api/gmail/sync", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setResult(data.error || "Sync failed");
        return;
      }

      setResult(
        `Found ${data.emails.newEmails} new emails, ${data.extractions.renewalsFound} renewals extracted`
      );

      // Refresh the page to show new data after a brief delay
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      setResult("Sync failed: " + String(error));
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button onClick={handleSync} disabled={syncing} size="sm">
        <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
        {syncing ? "Syncing..." : "Sync Gmail"}
      </Button>
      {result && (
        <span className="text-sm text-muted-foreground">{result}</span>
      )}
      {!result && lastSynced && (
        <span className="text-xs text-muted-foreground">
          Last synced: {new Date(lastSynced).toLocaleString("en-GB")}
        </span>
      )}
    </div>
  );
}
