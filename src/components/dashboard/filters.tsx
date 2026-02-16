"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useCallback } from "react";

export function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex gap-3 flex-wrap">
      <Select
        value={searchParams.get("category") || ""}
        onChange={(e) => updateFilter("category", e.target.value)}
        className="w-[160px]"
      >
        <option value="">All categories</option>
        <option value="home">Home</option>
        <option value="car">Car</option>
      </Select>

      <Select
        value={searchParams.get("days") || ""}
        onChange={(e) => updateFilter("days", e.target.value)}
        className="w-[160px]"
      >
        <option value="">All dates</option>
        <option value="30">Next 30 days</option>
        <option value="60">Next 60 days</option>
        <option value="90">Next 90 days</option>
      </Select>

      <Input
        placeholder="Search provider or policy..."
        defaultValue={searchParams.get("search") || ""}
        onChange={(e) => {
          const timeout = setTimeout(() => {
            updateFilter("search", e.target.value);
          }, 300);
          return () => clearTimeout(timeout);
        }}
        className="w-[250px]"
      />
    </div>
  );
}
