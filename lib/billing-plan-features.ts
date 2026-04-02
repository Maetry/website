import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

export type BillingPlanFeatureTitlesByCode = Record<string, string[]>;

const BILLING_PLANS_PATH = path.resolve(
  process.cwd(),
  "..",
  "API",
  "MicroServices",
  "Payments",
  "Sources",
  "Resources",
  "BillingPlans.yaml",
);

function humanizeFeatureCode(code: string) {
  return code
    .split("_")
    .map((segment) => {
      const lowercased = segment.toLowerCase();
      return lowercased.charAt(0).toUpperCase() + lowercased.slice(1);
    })
    .join(" ");
}

export async function loadBillingPlanFeatureTitles(): Promise<BillingPlanFeatureTitlesByCode> {
  const source = await readFile(BILLING_PLANS_PATH, "utf8");
  const featuresByPlan: BillingPlanFeatureTitlesByCode = {};

  let currentPlanCode: string | null = null;
  let insideFeaturesBlock = false;

  for (const line of source.split(/\r?\n/)) {
    const planMatch = line.match(/^  ([a-z0-9_]+):\s*$/);
    if (planMatch) {
      currentPlanCode = planMatch[1];
      featuresByPlan[currentPlanCode] = [];
      insideFeaturesBlock = false;
      continue;
    }

    if (!currentPlanCode) {
      continue;
    }

    if (/^\s{4}features:\s*$/.test(line)) {
      insideFeaturesBlock = true;
      continue;
    }

    if (!insideFeaturesBlock) {
      continue;
    }

    const featureMatch = line.match(/^\s{6}([a-z0-9_]+):\s*(true|false)\s*$/);
    if (featureMatch) {
      if (featureMatch[2] === "true") {
        featuresByPlan[currentPlanCode].push(humanizeFeatureCode(featureMatch[1]));
      }
      continue;
    }

    if (/^\s{4}[a-z_]+:/.test(line) || /^\s{2}[a-z0-9_]+:\s*$/.test(line)) {
      insideFeaturesBlock = false;
    }
  }

  return featuresByPlan;
}
