import { differenceInDays, parseISO } from "date-fns";

export type DateBucket = "overdue" | "30" | "60" | "90" | "90+";

export function getDateBucket(renewalDate: string): DateBucket {
  const days = differenceInDays(parseISO(renewalDate), new Date());
  if (days < 0) return "overdue";
  if (days <= 30) return "30";
  if (days <= 60) return "60";
  if (days <= 90) return "90";
  return "90+";
}

export function computeStatus(
  renewalDate: string
): "expired" | "due_soon" | "upcoming" {
  const days = differenceInDays(parseISO(renewalDate), new Date());
  if (days < 0) return "expired";
  if (days <= 30) return "due_soon";
  return "upcoming";
}
