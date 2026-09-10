export interface UsageUpdateOptions {
  remaining: number;
  resetAt: string;
  observedAt?: string;
  currentPath?: string;
  historyPath?: string;
}

export interface UsageObservation {
  observedAt: string;
  remainingPercent: number;
  resetAt: string;
  planCostMonthlyUsd: 20;
  source: "automatically read from Codex CLI usage status";
}

export function validateInput(remaining: number, resetAt: string): void;
export function localIsoDateTime(date?: Date): string;
export function parseArguments(args: string[]): { remaining: number; resetAt: string };
export function updateUsage(options: UsageUpdateOptions): Promise<UsageObservation>;
