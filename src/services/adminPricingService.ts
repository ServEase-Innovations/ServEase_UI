import PaymentInstance from "./paymentInstance";
import { paymentsPricingPaths } from "src/config/urls";
import type { MaidQuoteRequest, PricingQuoteResponse } from "./pricingService";

export interface PricingRule {
  rule_id: number;
  plan_id: number;
  rule_type: string;
  priority: number;
  condition_json: Record<string, unknown>;
  effect_json: Record<string, unknown>;
  effective_from?: string;
  effective_to?: string | null;
  is_active: boolean;
}

export interface PricingPlan {
  plan_id: number;
  service_type: string;
  booking_type: string;
  code: string;
  name: string;
  unit: string;
  base_rate_min: number | string;
  base_rate_max: number | string;
  constraints_json: Record<string, unknown>;
  effective_from?: string;
  effective_to?: string | null;
  is_active: boolean;
  rules?: PricingRule[];
}

export async function fetchAdminPricingPlans(serviceType = "MAID", activeOnly = false) {
  const { data } = await PaymentInstance.get<{ success: boolean; plans: PricingPlan[] }>(
    "/api/admin/pricing/plans",
    { params: { serviceType, activeOnly: activeOnly ? "true" : "false" } }
  );
  return data.plans ?? [];
}

export async function savePricingPlan(plan: Partial<PricingPlan> & { code: string; service_type: string; booking_type: string }) {
  const { data } = await PaymentInstance.put<{ success: boolean; plan: PricingPlan }>(
    "/api/admin/pricing/plans",
    {
      ...plan,
      constraints_json: plan.constraints_json ?? {},
    }
  );
  return data.plan;
}

export async function savePricingRule(rule: Partial<PricingRule> & { plan_id: number; rule_type: string }) {
  const { data } = await PaymentInstance.put<{ success: boolean; rule: PricingRule }>(
    "/api/admin/pricing/rules",
    rule
  );
  return data.rule;
}

export async function setPlanActive(planId: number, isActive: boolean) {
  const { data } = await PaymentInstance.patch<{ success: boolean; plan: PricingPlan }>(
    `/api/admin/pricing/plans/${planId}/active`,
    { is_active: isActive }
  );
  return data.plan;
}

export async function previewPricingQuote(body: MaidQuoteRequest) {
  const { data } = await PaymentInstance.post<PricingQuoteResponse>(paymentsPricingPaths.quote, {
    serviceType: body.serviceType || "MAID",
    bookingType: body.bookingType,
    customerId: body.customerId,
    startDate: body.startDate,
    endDate: body.endDate ?? body.startDate,
    durationHours: body.durationHours,
    hoursPerDay: body.hoursPerDay,
    ratePreference: body.ratePreference || "mid",
  });
  return data;
}
