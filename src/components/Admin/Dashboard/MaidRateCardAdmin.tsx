/* eslint-disable */
import { IconButton } from "src/components/Button/icon-button";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from "@mui/material";
import {
  Calculator,
  ChevronDown,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Button } from "../../Common/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../Common/Card";
import { cn } from "../../utils";
import {
  fetchAdminPricingPlans,
  previewPricingQuote,
  savePricingPlan,
  savePricingRule,
  setPlanActive,
  type PricingPlan,
  type PricingRule,
} from "src/services/adminPricingService";

const RULE_TYPES = [
  "FIXED_RATE",
  "NTH_BOOKING_SAME_DAY",
  "PERCENT_OFF",
  "FIXED_PACKAGE",
  "INCREMENTAL_HOUR_DISCOUNT",
] as const;

function num(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function formatInr(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function ruleSummary(r: PricingRule): string {
  const c = r.condition_json || {};
  const e = r.effect_json || {};
  switch (r.rule_type) {
    case "FIXED_RATE":
      return `₹${e.amount}/hr promo`;
    case "NTH_BOOKING_SAME_DAY":
      return `${c.n}th booking same day → ₹${e.amount}/hr`;
    case "PERCENT_OFF":
      return `${e.percent}% off (${c.durationDaysMin}–${c.durationDaysMax} days)`;
    case "FIXED_PACKAGE":
      return `${c.hours}h package ₹${e.amountMin}–${e.amountMax}`;
    case "INCREMENTAL_HOUR_DISCOUNT":
      return `Hour ${c.fromHour}+ : ${e.percent}% off incremental`;
    default:
      return r.rule_type;
  }
}

type PlanForm = {
  plan_id?: number;
  service_type: string;
  booking_type: string;
  code: string;
  name: string;
  unit: string;
  base_rate_min: string;
  base_rate_max: string;
  hoursPerDayMin: string;
  hoursPerDayMax: string;
  maxDurationDays: string;
  effective_from: string;
  is_active: boolean;
};

type RuleForm = {
  rule_id?: number;
  plan_id: number;
  rule_type: string;
  priority: string;
  is_active: boolean;
  n: string;
  hours: string;
  fromHour: string;
  durationDaysMin: string;
  durationDaysMax: string;
  amount: string;
  amountMin: string;
  amountMax: string;
  percent: string;
  displayHourlyMin: string;
  displayHourlyMax: string;
};

function planToForm(p?: PricingPlan): PlanForm {
  const c = p?.constraints_json || {};
  return {
    plan_id: p?.plan_id,
    service_type: p?.service_type || "MAID",
    booking_type: p?.booking_type || "ON_DEMAND",
    code: p?.code || "",
    name: p?.name || "",
    unit: p?.unit || "HOUR",
    base_rate_min: String(p?.base_rate_min ?? ""),
    base_rate_max: String(p?.base_rate_max ?? ""),
    hoursPerDayMin: c.hoursPerDayMin != null ? String(c.hoursPerDayMin) : "",
    hoursPerDayMax: c.hoursPerDayMax != null ? String(c.hoursPerDayMax) : "",
    maxDurationDays: c.maxDurationDays != null ? String(c.maxDurationDays) : "",
    effective_from: p?.effective_from?.toString().slice(0, 10) || new Date().toISOString().slice(0, 10),
    is_active: p?.is_active !== false,
  };
}

function ruleToForm(r: PricingRule | null, planId: number): RuleForm {
  const c = r?.condition_json || {};
  const e = r?.effect_json || {};
  return {
    rule_id: r?.rule_id,
    plan_id: planId,
    rule_type: r?.rule_type || "FIXED_RATE",
    priority: String(r?.priority ?? 10),
    is_active: r?.is_active !== false,
    n: c.n != null ? String(c.n) : "6",
    hours: c.hours != null ? String(c.hours) : "2",
    fromHour: c.fromHour != null ? String(c.fromHour) : "3",
    durationDaysMin: c.durationDaysMin != null ? String(c.durationDaysMin) : "",
    durationDaysMax: c.durationDaysMax != null ? String(c.durationDaysMax) : "",
    amount: e.amount != null ? String(e.amount) : "99",
    amountMin: e.amountMin != null ? String(e.amountMin) : "",
    amountMax: e.amountMax != null ? String(e.amountMax) : "",
    percent: e.percent != null ? String(e.percent) : "",
    displayHourlyMin: e.displayHourlyMin != null ? String(e.displayHourlyMin) : "",
    displayHourlyMax: e.displayHourlyMax != null ? String(e.displayHourlyMax) : "",
  };
}

function buildCondition(form: RuleForm): Record<string, unknown> {
  switch (form.rule_type) {
    case "FIXED_RATE":
      return { kind: "DEFAULT_PROMO" };
    case "NTH_BOOKING_SAME_DAY":
      return { kind: "NTH_BOOKING_SAME_DAY_IST", n: Number(form.n) };
    case "PERCENT_OFF":
      return {
        durationDaysMin: Number(form.durationDaysMin),
        durationDaysMax: Number(form.durationDaysMax),
      };
    case "FIXED_PACKAGE":
      return { hours: Number(form.hours) };
    case "INCREMENTAL_HOUR_DISCOUNT":
      return { fromHour: Number(form.fromHour) };
    default:
      return {};
  }
}

function buildEffect(form: RuleForm): Record<string, unknown> {
  switch (form.rule_type) {
    case "FIXED_RATE":
    case "NTH_BOOKING_SAME_DAY":
      return { amount: Number(form.amount), unit: "HOUR" };
    case "PERCENT_OFF": {
      const eff: Record<string, unknown> = { percent: Number(form.percent) };
      if (form.displayHourlyMin) eff.displayHourlyMin = Number(form.displayHourlyMin);
      if (form.displayHourlyMax) eff.displayHourlyMax = Number(form.displayHourlyMax);
      return eff;
    }
    case "FIXED_PACKAGE":
      return { amountMin: Number(form.amountMin), amountMax: Number(form.amountMax) };
    case "INCREMENTAL_HOUR_DISCOUNT":
      return { percent: Number(form.percent) };
    default:
      return {};
  }
}

export default function MaidRateCardAdmin() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [planDialog, setPlanDialog] = useState<{ open: boolean; form: PlanForm } | null>(null);
  const [ruleDialog, setRuleDialog] = useState<{ open: boolean; form: RuleForm } | null>(null);
  const [saving, setSaving] = useState(false);

  const [preview, setPreview] = useState({
    bookingType: "ON_DEMAND",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    durationHours: "2",
    hoursPerDay: "7",
    customerId: "",
  });
  const [quoteResult, setQuoteResult] = useState<string | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchAdminPricingPlans("MAID", false);
      setPlans(rows);
      setExpanded((prev) => {
        if (Object.keys(prev).length) return prev;
        const init: Record<number, boolean> = {};
        rows.forEach((p) => {
          init[p.plan_id] = true;
        });
        return init;
      });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } }; message?: string };
      setError(err?.response?.data?.error || err?.message || "Failed to load rate cards");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSavePlan = async () => {
    if (!planDialog) return;
    const f = planDialog.form;
    setSaving(true);
    setMessage(null);
    try {
      const constraints: Record<string, unknown> = {};
      if (f.hoursPerDayMin) constraints.hoursPerDayMin = Number(f.hoursPerDayMin);
      if (f.hoursPerDayMax) constraints.hoursPerDayMax = Number(f.hoursPerDayMax);
      if (f.maxDurationDays) constraints.maxDurationDays = Number(f.maxDurationDays);

      await savePricingPlan({
        plan_id: f.plan_id,
        service_type: f.service_type,
        booking_type: f.booking_type,
        code: f.code,
        name: f.name,
        unit: f.unit,
        base_rate_min: num(f.base_rate_min),
        base_rate_max: num(f.base_rate_max),
        constraints_json: constraints,
        effective_from: f.effective_from,
        is_active: f.is_active,
      });
      setPlanDialog(null);
      setMessage("Plan saved.");
      await load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } }; message?: string };
      setError(err?.response?.data?.error || err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRule = async () => {
    if (!ruleDialog) return;
    const f = ruleDialog.form;
    setSaving(true);
    setMessage(null);
    try {
      await savePricingRule({
        rule_id: f.rule_id,
        plan_id: f.plan_id,
        rule_type: f.rule_type,
        priority: Number(f.priority),
        condition_json: buildCondition(f),
        effect_json: buildEffect(f),
        is_active: f.is_active,
      });
      setRuleDialog(null);
      setMessage("Rule saved.");
      await load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } }; message?: string };
      setError(err?.response?.data?.error || err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (plan: PricingPlan) => {
    try {
      await setPlanActive(plan.plan_id, !plan.is_active);
      setMessage(plan.is_active ? "Plan deactivated." : "Plan activated.");
      await load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } }; message?: string };
      setError(err?.response?.data?.error || err?.message || "Update failed");
    }
  };

  const runPreview = async () => {
    setQuoteLoading(true);
    setQuoteResult(null);
    try {
      const res = await previewPricingQuote({
        bookingType: preview.bookingType,
        startDate: preview.startDate,
        endDate: preview.endDate,
        durationHours: preview.durationHours ? Number(preview.durationHours) : undefined,
        hoursPerDay: preview.hoursPerDay ? Number(preview.hoursPerDay) : undefined,
        customerId: preview.customerId ? Number(preview.customerId) : undefined,
        ratePreference: "mid",
      });
      setQuoteResult(
        `Total: ${formatInr(res.total)} · Plan: ${res.plan_code}\n` +
          (res.quote?.line_items?.map((l) => `• ${l.description}: ${formatInr(l.amount)}`).join("\n") || "")
      );
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } }; message?: string };
      setQuoteResult(err?.response?.data?.error || err?.message || "Quote failed");
    } finally {
      setQuoteLoading(false);
    }
  };

  const sortedPlans = useMemo(
    () => [...plans].sort((a, b) => a.booking_type.localeCompare(b.booking_type)),
    [plans]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Maid rate card</h2>
          <p className="text-sm text-slate-600">
            Edit hourly, short-term, and monthly base rates plus promos. Changes apply to new quotes after save.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-1">Refresh</span>
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() =>
              setPlanDialog({
                open: true,
                form: planToForm({
                  service_type: "MAID",
                  booking_type: "ON_DEMAND",
                  code: "",
                  name: "",
                  unit: "HOUR",
                  base_rate_min: 0,
                  base_rate_max: 0,
                  constraints_json: {},
                  is_active: true,
                } as PricingPlan),
              })
            }
          >
            <Plus className="h-4 w-4" />
            Add plan
          </Button>
        </div>
      </div>

      {error && (
        <Alert severity="error">
          {error}
        </Alert>
      )}
      {message && (
        <Alert severity="success" onClose={() => setMessage(null)}>
          {message}
        </Alert>
      )}

      {loading && !plans.length ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
        </div>
      ) : (
        <div className="space-y-3">
          {sortedPlans.map((plan) => {
            const open = expanded[plan.plan_id] ?? false;
            const rules = plan.rules || [];
            return (
              <Card key={plan.plan_id} className={cn("border-slate-200/90", !plan.is_active && "opacity-60")}>
                <CardHeader className="py-3">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-start gap-2 text-left"
                      onClick={() => setExpanded((e) => ({ ...e, [plan.plan_id]: !open }))}
                    >
                      {open ? (
                        <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                      ) : (
                        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                      )}
                      <div className="min-w-0">
                        <CardTitle className="text-base">{plan.name}</CardTitle>
                        <CardDescription className="mt-0.5">
                          <span className="font-mono text-xs">{plan.code}</span>
                          {" · "}
                          {plan.booking_type} · {plan.unit} · {formatInr(num(plan.base_rate_min))}–
                          {formatInr(num(plan.base_rate_max))}
                        </CardDescription>
                      </div>
                    </button>
                    <div className="flex shrink-0 items-center gap-1">
                      <Chip
                        size="small"
                        label={plan.is_active ? "Active" : "Inactive"}
                        color={plan.is_active ? "success" : "default"}
                      />
                      <IconButton
                        size="small"
                        title="Edit plan"
                        onClick={() => setPlanDialog({ open: true, form: planToForm(plan) })}
                      >
                        <Pencil className="h-4 w-4" />
                      </IconButton>
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={plan.is_active}
                            onChange={() => void handleToggleActive(plan)}
                          />
                        }
                        label=""
                        sx={{ m: 0 }}
                      />
                    </div>
                  </div>
                </CardHeader>
                <Collapse in={open}>
                  <CardContent className="space-y-3 border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Rules</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setRuleDialog({ open: true, form: ruleToForm(null, plan.plan_id) })
                        }
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add rule
                      </Button>
                    </div>
                    {rules.length === 0 ? (
                      <p className="text-sm text-slate-500">No rules — base rate only.</p>
                    ) : (
                      <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                        {rules.map((r) => (
                          <li
                            key={r.rule_id}
                            className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
                          >
                            <span className={cn(!r.is_active && "text-slate-400 line-through")}>
                              <span className="font-medium text-slate-800">{r.rule_type}</span>
                              <span className="text-slate-500"> · prio {r.priority} · </span>
                              {ruleSummary(r)}
                            </span>
                            <IconButton
                              size="small"
                              onClick={() => setRuleDialog({ open: true, form: ruleToForm(r, plan.plan_id) })}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </IconButton>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Collapse>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="border-sky-200/60 bg-sky-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calculator className="h-4 w-4 text-sky-700" />
            Quote preview
          </CardTitle>
          <CardDescription>Test how the current rate card prices a booking before customers checkout.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Box className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <FormControl size="small" fullWidth>
              <InputLabel>Booking type</InputLabel>
              <Select
                label="Booking type"
                value={preview.bookingType}
                onChange={(e) => setPreview((p) => ({ ...p, bookingType: e.target.value }))}
              >
                <MenuItem value="ON_DEMAND">ON_DEMAND</MenuItem>
                <MenuItem value="SHORT_TERM">SHORT_TERM</MenuItem>
                <MenuItem value="MONTHLY">MONTHLY</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="Start date"
              type="date"
              value={preview.startDate}
              onChange={(e) => setPreview((p) => ({ ...p, startDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              size="small"
              label="End date"
              type="date"
              value={preview.endDate}
              onChange={(e) => setPreview((p) => ({ ...p, endDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              size="small"
              label="Duration (hours)"
              value={preview.durationHours}
              onChange={(e) => setPreview((p) => ({ ...p, durationHours: e.target.value }))}
              fullWidth
            />
            <TextField
              size="small"
              label="Hours per day"
              value={preview.hoursPerDay}
              onChange={(e) => setPreview((p) => ({ ...p, hoursPerDay: e.target.value }))}
              fullWidth
            />
            <TextField
              size="small"
              label="Customer ID (6th-visit promo)"
              value={preview.customerId}
              onChange={(e) => setPreview((p) => ({ ...p, customerId: e.target.value }))}
              fullWidth
            />
          </Box>
          <Button type="button" size="sm" onClick={() => void runPreview()} disabled={quoteLoading}>
            {quoteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
            <span className="ml-1">Calculate quote</span>
          </Button>
          {quoteResult && (
            <pre className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800">
              {quoteResult}
            </pre>
          )}
        </CardContent>
      </Card>

      {/* Plan dialog */}
      <Dialog open={!!planDialog?.open} onClose={() => setPlanDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{planDialog?.form.plan_id ? "Edit plan" : "New plan"}</DialogTitle>
        <DialogContent className="space-y-3 pt-2">
          {planDialog && (
            <>
              <TextField
                label="Code"
                size="small"
                fullWidth
                value={planDialog.form.code}
                disabled={!!planDialog.form.plan_id}
                onChange={(e) =>
                  setPlanDialog({ ...planDialog, form: { ...planDialog.form, code: e.target.value } })
                }
              />
              <TextField
                label="Name"
                size="small"
                fullWidth
                value={planDialog.form.name}
                onChange={(e) =>
                  setPlanDialog({ ...planDialog, form: { ...planDialog.form, name: e.target.value } })
                }
              />
              <FormControl size="small" fullWidth>
                <InputLabel>Booking type</InputLabel>
                <Select
                  label="Booking type"
                  value={planDialog.form.booking_type}
                  onChange={(e) =>
                    setPlanDialog({
                      ...planDialog,
                      form: { ...planDialog.form, booking_type: e.target.value },
                    })
                  }
                >
                  <MenuItem value="ON_DEMAND">ON_DEMAND</MenuItem>
                  <MenuItem value="SHORT_TERM">SHORT_TERM</MenuItem>
                  <MenuItem value="MONTHLY">MONTHLY</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>Unit</InputLabel>
                <Select
                  label="Unit"
                  value={planDialog.form.unit}
                  onChange={(e) =>
                    setPlanDialog({ ...planDialog, form: { ...planDialog.form, unit: e.target.value } })
                  }
                >
                  <MenuItem value="HOUR">HOUR</MenuItem>
                  <MenuItem value="DAY">DAY</MenuItem>
                  <MenuItem value="MONTH">MONTH</MenuItem>
                </Select>
              </FormControl>
              <Box className="grid grid-cols-2 gap-2">
                <TextField
                  label="Base min (₹)"
                  size="small"
                  type="number"
                  value={planDialog.form.base_rate_min}
                  onChange={(e) =>
                    setPlanDialog({
                      ...planDialog,
                      form: { ...planDialog.form, base_rate_min: e.target.value },
                    })
                  }
                />
                <TextField
                  label="Base max (₹)"
                  size="small"
                  type="number"
                  value={planDialog.form.base_rate_max}
                  onChange={(e) =>
                    setPlanDialog({
                      ...planDialog,
                      form: { ...planDialog.form, base_rate_max: e.target.value },
                    })
                  }
                />
              </Box>
              {planDialog.form.unit === "DAY" && (
                <Box className="grid grid-cols-3 gap-2">
                  <TextField
                    label="Hrs/day min"
                    size="small"
                    type="number"
                    value={planDialog.form.hoursPerDayMin}
                    onChange={(e) =>
                      setPlanDialog({
                        ...planDialog,
                        form: { ...planDialog.form, hoursPerDayMin: e.target.value },
                      })
                    }
                  />
                  <TextField
                    label="Hrs/day max"
                    size="small"
                    type="number"
                    value={planDialog.form.hoursPerDayMax}
                    onChange={(e) =>
                      setPlanDialog({
                        ...planDialog,
                        form: { ...planDialog.form, hoursPerDayMax: e.target.value },
                      })
                    }
                  />
                  <TextField
                    label="Max days"
                    size="small"
                    type="number"
                    value={planDialog.form.maxDurationDays}
                    onChange={(e) =>
                      setPlanDialog({
                        ...planDialog,
                        form: { ...planDialog.form, maxDurationDays: e.target.value },
                      })
                    }
                  />
                </Box>
              )}
              <TextField
                label="Effective from"
                size="small"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={planDialog.form.effective_from}
                onChange={(e) =>
                  setPlanDialog({
                    ...planDialog,
                    form: { ...planDialog.form, effective_from: e.target.value },
                  })
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={planDialog.form.is_active}
                    onChange={(e) =>
                      setPlanDialog({
                        ...planDialog,
                        form: { ...planDialog.form, is_active: e.target.checked },
                      })
                    }
                  />
                }
                label="Active"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button type="button" variant="outline" onClick={() => setPlanDialog(null)}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleSavePlan()} disabled={saving}>
            {saving ? "Saving…" : "Save plan"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rule dialog */}
      <Dialog open={!!ruleDialog?.open} onClose={() => setRuleDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{ruleDialog?.form.rule_id ? "Edit rule" : "New rule"}</DialogTitle>
        <DialogContent>
          {ruleDialog && (
            <Box className="grid gap-3 pt-1">
              <FormControl size="small" fullWidth>
                <InputLabel>Rule type</InputLabel>
                <Select
                  label="Rule type"
                  value={ruleDialog.form.rule_type}
                  onChange={(e) =>
                    setRuleDialog({
                      ...ruleDialog,
                      form: { ...ruleDialog.form, rule_type: e.target.value },
                    })
                  }
                >
                  {RULE_TYPES.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Priority (higher runs first)"
                size="small"
                type="number"
                value={ruleDialog.form.priority}
                onChange={(e) =>
                  setRuleDialog({ ...ruleDialog, form: { ...ruleDialog.form, priority: e.target.value } })
                }
              />

              {(ruleDialog.form.rule_type === "FIXED_RATE" ||
                ruleDialog.form.rule_type === "NTH_BOOKING_SAME_DAY") && (
                <>
                  {ruleDialog.form.rule_type === "NTH_BOOKING_SAME_DAY" && (
                    <TextField
                      label="Nth booking same day"
                      size="small"
                      type="number"
                      value={ruleDialog.form.n}
                      onChange={(e) =>
                        setRuleDialog({ ...ruleDialog, form: { ...ruleDialog.form, n: e.target.value } })
                      }
                    />
                  )}
                  <TextField
                    label="Promo rate (₹/hr)"
                    size="small"
                    type="number"
                    value={ruleDialog.form.amount}
                    onChange={(e) =>
                      setRuleDialog({ ...ruleDialog, form: { ...ruleDialog.form, amount: e.target.value } })
                    }
                  />
                </>
              )}

              {ruleDialog.form.rule_type === "PERCENT_OFF" && (
                <>
                  <Box className="grid grid-cols-2 gap-2">
                    <TextField
                      label="Days min"
                      size="small"
                      type="number"
                      value={ruleDialog.form.durationDaysMin}
                      onChange={(e) =>
                        setRuleDialog({
                          ...ruleDialog,
                          form: { ...ruleDialog.form, durationDaysMin: e.target.value },
                        })
                      }
                    />
                    <TextField
                      label="Days max"
                      size="small"
                      type="number"
                      value={ruleDialog.form.durationDaysMax}
                      onChange={(e) =>
                        setRuleDialog({
                          ...ruleDialog,
                          form: { ...ruleDialog.form, durationDaysMax: e.target.value },
                        })
                      }
                    />
                  </Box>
                  <TextField
                    label="Percent off"
                    size="small"
                    type="number"
                    value={ruleDialog.form.percent}
                    onChange={(e) =>
                      setRuleDialog({ ...ruleDialog, form: { ...ruleDialog.form, percent: e.target.value } })
                    }
                  />
                  <Box className="grid grid-cols-2 gap-2">
                    <TextField
                      label="Display ₹/hr min (optional)"
                      size="small"
                      type="number"
                      value={ruleDialog.form.displayHourlyMin}
                      onChange={(e) =>
                        setRuleDialog({
                          ...ruleDialog,
                          form: { ...ruleDialog.form, displayHourlyMin: e.target.value },
                        })
                      }
                    />
                    <TextField
                      label="Display ₹/hr max (optional)"
                      size="small"
                      type="number"
                      value={ruleDialog.form.displayHourlyMax}
                      onChange={(e) =>
                        setRuleDialog({
                          ...ruleDialog,
                          form: { ...ruleDialog.form, displayHourlyMax: e.target.value },
                        })
                      }
                    />
                  </Box>
                </>
              )}

              {ruleDialog.form.rule_type === "FIXED_PACKAGE" && (
                <>
                  <TextField
                    label="Package hours"
                    size="small"
                    type="number"
                    value={ruleDialog.form.hours}
                    onChange={(e) =>
                      setRuleDialog({ ...ruleDialog, form: { ...ruleDialog.form, hours: e.target.value } })
                    }
                  />
                  <Box className="grid grid-cols-2 gap-2">
                    <TextField
                      label="Amount min (₹)"
                      size="small"
                      type="number"
                      value={ruleDialog.form.amountMin}
                      onChange={(e) =>
                        setRuleDialog({
                          ...ruleDialog,
                          form: { ...ruleDialog.form, amountMin: e.target.value },
                        })
                      }
                    />
                    <TextField
                      label="Amount max (₹)"
                      size="small"
                      type="number"
                      value={ruleDialog.form.amountMax}
                      onChange={(e) =>
                        setRuleDialog({
                          ...ruleDialog,
                          form: { ...ruleDialog.form, amountMax: e.target.value },
                        })
                      }
                    />
                  </Box>
                </>
              )}

              {ruleDialog.form.rule_type === "INCREMENTAL_HOUR_DISCOUNT" && (
                <>
                  <TextField
                    label="From hour #"
                    size="small"
                    type="number"
                    value={ruleDialog.form.fromHour}
                    onChange={(e) =>
                      setRuleDialog({ ...ruleDialog, form: { ...ruleDialog.form, fromHour: e.target.value } })
                    }
                  />
                  <TextField
                    label="Percent off incremental"
                    size="small"
                    type="number"
                    value={ruleDialog.form.percent}
                    onChange={(e) =>
                      setRuleDialog({ ...ruleDialog, form: { ...ruleDialog.form, percent: e.target.value } })
                    }
                  />
                </>
              )}

              <FormControlLabel
                control={
                  <Switch
                    checked={ruleDialog.form.is_active}
                    onChange={(e) =>
                      setRuleDialog({
                        ...ruleDialog,
                        form: { ...ruleDialog.form, is_active: e.target.checked },
                      })
                    }
                  />
                }
                label="Active"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button type="button" variant="outline" onClick={() => setRuleDialog(null)}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleSaveRule()} disabled={saving}>
            {saving ? "Saving…" : "Save rule"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
