/* eslint-disable */
import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent } from "@mui/material";
import { Button } from "../../components/Button";
import { useToast } from "../hooks/use-toast";
import {
  Loader2,
  Wallet,
  X,
  Building2,
  Info,
  AlertCircle,
} from "lucide-react";
import PaymentInstance from "src/services/paymentInstance";
import { DialogHeader } from "../ProviderDetails/CookServicesDialog.styles";
import { Label } from "../Common/label";
import { Input } from "../Common/input";

interface WithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceProviderId: number | null;
  availableBalance: number;
  onWithdrawalSuccess?: () => void;
}

type WithdrawResponse = {
  success?: boolean;
  message?: string;
  net_amount?: number;
  remaining_balance?: number;
  requested_amount?: number;
  payout_id?: string;
};

function parseApiErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== "object") {
    return fallback;
  }
  const err = error as {
    response?: { data?: { error?: string; message?: string } };
    message?: string;
  };
  const d = err.response?.data;
  if (d && typeof d === "object") {
    if (typeof d.error === "string" && d.error) {
      return d.error;
    }
    if (typeof d.message === "string" && d.message) {
      return d.message;
    }
  }
  if (typeof err.message === "string" && err.message && !err.message.startsWith("Request failed")) {
    return err.message;
  }
  return fallback;
}

const WithdrawalDialog: React.FC<WithdrawalDialogProps> = ({
  open,
  onOpenChange,
  serviceProviderId,
  availableBalance,
  onWithdrawalSuccess,
}) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setAmount("");
    }
  }, [open]);

  const numericAmount = useMemo(
    () => (amount === "" ? 0 : Math.round((parseFloat(amount) || 0) * 100) / 100),
    [amount]
  );

  const tdsAmount = useMemo(
    () => Number((numericAmount * 0.01).toFixed(2)),
    [numericAmount]
  );
  const netToBank = useMemo(
    () => Number((numericAmount - tdsAmount).toFixed(2)),
    [numericAmount, tdsAmount]
  );

  const hasBalance = availableBalance > 0;
  const isValidAmount =
    hasBalance && numericAmount > 0 && numericAmount <= availableBalance + 0.0001;

  const handleAmountChange = (value: string) => {
    const cleaned = value.replace(/[^\d.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      return;
    }
    if (parts[1] && parts[1].length > 2) {
      return;
    }
    setAmount(cleaned);
  };

  const handleMaxAmount = () => {
    setAmount((Math.floor(availableBalance * 100) / 100).toFixed(2));
  };

  const handleConfirmWithdrawal = async () => {
    if (!serviceProviderId) {
      toast({
        title: "Something went wrong",
        description: "We could not identify your provider account. Please sign in again.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidAmount) {
      if (!hasBalance) {
        toast({
          title: "No available balance",
          description: "There is no balance to withdraw at the moment.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Check the amount",
        description:
          numericAmount > availableBalance
            ? `The maximum you can request is ₹${availableBalance.toLocaleString("en-IN")}.`
            : "Enter an amount above ₹0.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await PaymentInstance.post<WithdrawResponse>(
        `/api/service-providers/${serviceProviderId}/withdraw`,
        {
          amount: numericAmount,
          payout_mode: "BANK",
        }
      );

      if (response.status !== 200 && response.status !== 201) {
        throw new Error("Unexpected response from server");
      }

      const data = response.data;
      const net =
        typeof data.net_amount === "number" ? data.net_amount : netToBank;
      const remaining =
        typeof data.remaining_balance === "number"
          ? data.remaining_balance
          : availableBalance - numericAmount;

      toast({
        title: "Withdrawal requested",
        description: `We recorded ₹${numericAmount.toLocaleString("en-IN")} (wallet balance ≈ ₹${remaining.toLocaleString("en-IN")}). About ₹${net.toLocaleString("en-IN")} should reach your bank after 1% TDS, typically in 2–3 working days.`,
        variant: "default",
      });

      if (onWithdrawalSuccess) {
        onWithdrawalSuccess();
      }
      handleClose();
    } catch (error) {
      toast({
        title: "Could not submit request",
        description: parseApiErrorMessage(error, "Please try again in a moment."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount("");
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      scroll="body"
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: "hidden",
        },
      }}
    >
      <DialogHeader className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 min-w-0 text-lg font-semibold">
          <Wallet className="h-5 w-5 shrink-0" />
          <span className="truncate">Request withdrawal</span>
        </span>
        <button
          type="button"
          onClick={handleClose}
          className="text-white/90 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded p-0.5"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>
      </DialogHeader>

      <DialogContent
        className="p-0"
        style={{ padding: 0, paddingBottom: 24, paddingTop: 0, paddingLeft: 0, paddingRight: 0 }}
      >
        <div className="px-5 pt-4 pb-2 space-y-1">
          <p className="text-sm text-slate-600 leading-relaxed">
            We transfer the net amount (after 1% TDS) to your <strong>registered bank account</strong> within 2–3
            business days.
          </p>
        </div>

        {!hasBalance && (
          <div className="px-5 pb-2">
            <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-amber-900">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-950">No balance to withdraw</p>
                <p className="text-sm mt-1 text-amber-800/90">
                  Complete bookings to earn payouts. When money is available here, you can request a bank transfer.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="px-5 space-y-5 pb-1">
          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100/80 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Available</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-sm font-semibold text-slate-500">₹</span>
                  <span className="text-2xl font-bold tabular-nums text-slate-900">
                    {hasBalance
                      ? availableBalance.toLocaleString("en-IN", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })
                      : "0"}
                  </span>
                </div>
              </div>
              {hasBalance && (
                <button
                  type="button"
                  onClick={handleMaxAmount}
                  className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Use max
                </button>
              )}
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <Info className="h-3.5 w-3.5 shrink-0" />
              <span>Minimum request ₹1 · Wallet is debited by the amount you request</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sp-withdraw-amount" className="text-slate-800 text-sm font-medium">
              How much to withdraw? (₹)
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium" aria-hidden>
                ₹
              </div>
              <Input
                id="sp-withdraw-amount"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0.00"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                disabled={!hasBalance}
                className="h-12 pl-9 pr-3 text-lg font-medium tabular-nums border-slate-300"
              />
            </div>
          </div>

          {amount && !isValidAmount && hasBalance && (
            <div className="flex gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>
                {numericAmount > availableBalance
                  ? `Amount is higher than your available ₹${availableBalance.toLocaleString("en-IN")}.`
                  : "Enter a positive amount to continue."}
              </p>
            </div>
          )}

          {isValidAmount && hasBalance && (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-800">Request summary</p>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Deducted from wallet</dt>
                  <dd className="font-medium text-slate-900 tabular-nums">
                    ₹{numericAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">TDS (1%)</dt>
                  <dd className="text-slate-800 tabular-nums">₹{tdsAmount.toLocaleString("en-IN")}</dd>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between gap-2">
                  <dt className="text-slate-800 font-medium">Expected in bank (approx.)</dt>
                  <dd className="font-semibold text-emerald-700 tabular-nums">
                    ₹{netToBank.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </dd>
                </div>
                <div className="flex justify-between gap-2 text-slate-500 text-xs">
                  <dt>Wallet after request</dt>
                  <dd className="tabular-nums">
                    ₹
                    {Math.max(0, availableBalance - numericAmount).toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          <div className="flex gap-3 rounded-xl border border-sky-200 bg-sky-50/60 p-4 text-slate-800">
            <div className="mt-0.5 rounded-md bg-white p-2 text-sky-600 shadow-sm">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900">Bank transfer</p>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                Payouts use your KYC-registered account. If details need updating, contact support before withdrawing.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 pt-2 mt-2 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="px-5 h-10 rounded-lg border-slate-300"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirmWithdrawal}
            disabled={!isValidAmount || loading || !hasBalance}
            className="px-5 h-10 min-w-[120px] bg-[#0a2a66] hover:bg-[#0d3490] text-white rounded-lg disabled:bg-slate-200 disabled:text-slate-500"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting…
              </span>
            ) : (
              "Submit request"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalDialog;
