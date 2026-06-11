/* eslint-disable */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
  Fade,
} from "@mui/material";
import dayjs from "dayjs";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  Plus,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Star,
  Wallet as WalletIcon,
  X,
} from "lucide-react";
import { IconButton } from "../Button/icon-button";
import { useLanguage } from "src/context/LanguageContext";
import { useAppUser } from "src/context/AppUserContext";
import { resolveCustomerId } from "src/services/couponService";
import {
  CustomerWallet,
  WalletTransaction,
  WalletTxCategory,
  fetchCustomerWallet,
  formatWalletMoney,
  formatWalletTransactionDisplayLabel,
  getWalletTransactionCategory,
  groupWalletTransactions,
  isCreditTransaction,
  topUpCustomerWallet,
  WALLET_TOPUP_MAX_INR,
  WALLET_TOPUP_MIN_INR,
} from "src/services/walletService";
import { isPaymentCancelledError } from "src/services/bookingService";

interface WalletDialogProps {
  open: boolean;
  onClose: () => void;
}

const TOP_UP_PRESETS = [500, 1000, 2000, 5000];
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const dialogSlotProps: {
  paper: { className: string };
  backdrop: { className: string };
} = {
  paper: {
    className:
      "relative w-[calc(100%-1.5rem)] max-w-lg overflow-hidden rounded-2xl shadow-2xl ring-1 ring-slate-900/10 m-0 sm:mx-4",
  },
  backdrop: { className: "bg-slate-900/40 backdrop-blur-[2px]" },
};

function categoryLabelKey(
  category: WalletTxCategory
): "walletTxTopUp" | "walletTxRefund" | "walletTxBooking" | "walletTxOther" {
  switch (category) {
    case "topup":
      return "walletTxTopUp";
    case "refund":
      return "walletTxRefund";
    case "booking":
      return "walletTxBooking";
    default:
      return "walletTxOther";
  }
}

function TransactionIcon({
  category,
  isCredit,
}: {
  category: WalletTxCategory;
  isCredit: boolean;
}) {
  const base =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105";
  if (category === "refund") {
    return (
      <div className={`${base} bg-sky-100 text-sky-600`}>
        <RotateCcw className="h-4 w-4" strokeWidth={2.25} />
      </div>
    );
  }
  if (isCredit) {
    return (
      <div className={`${base} bg-emerald-100 text-emerald-600`}>
        <ArrowDownLeft className="h-4 w-4" strokeWidth={2.25} />
      </div>
    );
  }
  return (
    <div className={`${base} bg-rose-50 text-rose-500`}>
      <ArrowUpRight className="h-4 w-4" strokeWidth={2.25} />
    </div>
  );
}

function ShimmerBlock({ className }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-slate-200/80 ${className ?? ""}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[wallet-shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

function BalanceSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 p-3.5">
      <ShimmerBlock className="mb-2 h-2.5 w-20" />
      <ShimmerBlock className="mb-3 h-7 w-36" />
      <ShimmerBlock className="h-8 w-28 rounded-lg" />
    </div>
  );
}

function TransactionSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.25 }}
      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5"
    >
      <ShimmerBlock className="h-9 w-9 rounded-xl" />
      <div className="flex-1 space-y-2">
        <ShimmerBlock className="h-3.5 w-28" />
        <ShimmerBlock className="h-3 w-16" />
      </div>
      <ShimmerBlock className="h-4 w-12" />
    </motion.div>
  );
}

const WalletDialog: React.FC<WalletDialogProps> = ({ open, onClose }) => {
  const { t } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<"transactions" | "rewards">("transactions");
  const { appUser } = useAppUser();
  const customerId = resolveCustomerId(appUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [wallet, setWallet] = useState<CustomerWallet | null>(null);
  const [addMoneyOpen, setAddMoneyOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [displayBalance, setDisplayBalance] = useState(0);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    severity: "success" | "error" | "info";
    message: string;
  }>({ open: false, severity: "info", message: "" });

  const parsedTopUpAmount = Number(topUpAmount);
  const topUpAmountValid =
    Number.isFinite(parsedTopUpAmount) &&
    parsedTopUpAmount >= WALLET_TOPUP_MIN_INR &&
    parsedTopUpAmount <= WALLET_TOPUP_MAX_INR;

  const customerPrefill = useMemo(
    () => ({
      name: [appUser?.firstname, appUser?.lastname].filter(Boolean).join(" ").trim() || undefined,
      email: appUser?.emailid || appUser?.email || undefined,
      contact: appUser?.mobileno || undefined,
    }),
    [appUser]
  );

  const transactionGroups = useMemo(
    () => groupWalletTransactions(wallet?.transactions ?? []),
    [wallet?.transactions]
  );

  const motionDuration = prefersReducedMotion ? 0.01 : 0.35;

  const loadWallet = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!customerId) {
        setHasError(true);
        setWallet(null);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      if (opts?.silent) setIsRefreshing(true);
      else setIsLoading(true);
      setHasError(false);

      try {
        const data = await fetchCustomerWallet(customerId);
        setWallet(data);
        setDisplayBalance(Number(data.balance ?? 0));
      } catch (error) {
        console.error("Wallet fetch error:", error);
        setHasError(true);
        if (!opts?.silent) setWallet(null);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [customerId]
  );

  useEffect(() => {
    if (open) void loadWallet();
  }, [open, loadWallet]);

  useEffect(() => {
    if (!open) {
      setIsLoading(false);
      setIsRefreshing(false);
      setHasError(false);
      setWallet(null);
      setAddMoneyOpen(false);
      setTopUpAmount("");
      setTopUpLoading(false);
      setActiveTab("transactions");
      setDisplayBalance(0);
    }
  }, [open]);

  const handleTopUp = async () => {
    if (!customerId || !topUpAmountValid || topUpLoading) return;

    setTopUpLoading(true);
    try {
      const result = await topUpCustomerWallet(
        customerId,
        parsedTopUpAmount,
        customerPrefill
      );
      setAddMoneyOpen(false);
      setTopUpAmount("");
      await loadWallet({ silent: true });
      setDisplayBalance(Number(result.balance ?? 0));
      setSnackbar({
        open: true,
        severity: "success",
        message: result.alreadyProcessed
          ? t("walletTopUpAlreadyDone")
          : t("walletTopUpSuccess").replace(
              "{amount}",
              parsedTopUpAmount.toLocaleString("en-IN")
            ),
      });
    } catch (error) {
      if (isPaymentCancelledError(error)) {
        setSnackbar({
          open: true,
          severity: "info",
          message: t("walletTopUpCancelled"),
        });
      } else {
        const msg =
          error &&
          typeof error === "object" &&
          "response" in error &&
          (error as { response?: { data?: { error?: string } } }).response?.data?.error;
        setSnackbar({
          open: true,
          severity: "error",
          message:
            typeof msg === "string" && msg.trim() ? msg : t("walletTopUpFailed"),
        });
      }
    } finally {
      setTopUpLoading(false);
    }
  };

  const renderAddMoneyPanelContent = () => (
    <div className="rounded-lg bg-white/95 p-3 text-slate-900 shadow-inner backdrop-blur-sm">
      <p className="text-xs leading-relaxed text-slate-500">{t("walletTopUpHint")}</p>

      <div className="mt-2 grid grid-cols-4 gap-1.5">
        {TOP_UP_PRESETS.map((preset, i) => {
          const selected = parsedTopUpAmount === preset;
          return (
            <motion.button
              key={preset}
              type="button"
              disabled={topUpLoading}
              onClick={() => setTopUpAmount(String(preset))}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: motionDuration, ease: EASE_OUT }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
              className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-colors duration-200 ${
                selected
                  ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/25"
                  : "border-slate-200/80 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/60"
              }`}
            >
              {formatWalletMoney(preset, { compact: true })}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-2">
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {t("enterAmount")}
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
            ₹
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={WALLET_TOPUP_MIN_INR}
            max={WALLET_TOPUP_MAX_INR}
            value={topUpAmount}
            disabled={topUpLoading}
            onChange={(e) => setTopUpAmount(e.target.value)}
            placeholder={`${WALLET_TOPUP_MIN_INR} – ${WALLET_TOPUP_MAX_INR.toLocaleString("en-IN")}`}
            className={`w-full rounded-lg border bg-white py-2 pl-7 pr-2.5 text-sm font-medium text-slate-900 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/25 ${
              topUpAmount.length > 0 && !topUpAmountValid
                ? "border-rose-300 focus:border-rose-400"
                : "border-slate-200 focus:border-blue-500"
            }`}
          />
        </div>
        <p className="mt-1.5 text-xs text-slate-400">
          {t("walletTopUpLimits")
            .replace("{min}", String(WALLET_TOPUP_MIN_INR))
            .replace("{max}", WALLET_TOPUP_MAX_INR.toLocaleString("en-IN"))}
        </p>
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <ShieldCheck className="h-3 w-3 text-emerald-600" strokeWidth={2} />
          {t("securePaymentNote")}
        </div>
        <motion.button
          type="button"
          disabled={!topUpAmountValid || topUpLoading}
          onClick={() => void handleTopUp()}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
          className="inline-flex min-h-[34px] items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3.5 text-xs font-semibold text-white shadow-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-45"
        >
          {topUpLoading ? (
            <>
              <CircularProgress size={16} color="inherit" />
              {t("processing")}
            </>
          ) : (
            t("proceedToPay")
          )}
        </motion.button>
      </div>
    </div>
  );

  const renderBalanceCard = () => (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: motionDuration, ease: EASE_OUT }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0a52c4] via-[#2563eb] to-[#1e40af] px-3.5 py-3 text-white shadow-md shadow-blue-900/10"
    >
      <div className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/[0.07] blur-xl" />

      <div className="relative flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-200/85">
            {t("currentBalance")}
          </p>
          <motion.p
            key={displayBalance}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="mt-0.5 text-2xl font-bold leading-none tracking-tight"
          >
            {formatWalletMoney(displayBalance)}
          </motion.p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <motion.button
            type="button"
            onClick={() => setAddMoneyOpen((v) => !v)}
            disabled={topUpLoading}
            aria-expanded={addMoneyOpen}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
            className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-50 disabled:opacity-60"
          >
            <Plus
              className={`h-3.5 w-3.5 transition-transform duration-300 ${addMoneyOpen ? "rotate-45" : ""}`}
              strokeWidth={2.5}
            />
            {addMoneyOpen ? t("closeAddMoney") : t("addMoney")}
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-300 ${addMoneyOpen ? "rotate-180" : ""}`}
            />
          </motion.button>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/15">
            <WalletIcon className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{
          height: addMoneyOpen ? "auto" : 0,
          opacity: addMoneyOpen ? 1 : 0,
          marginTop: addMoneyOpen ? 10 : 0,
        }}
        transition={{ duration: motionDuration, ease: EASE_OUT }}
        className="overflow-hidden"
      >
        <div className="border-t border-white/15 pt-2.5">
          {addMoneyOpen ? renderAddMoneyPanelContent() : null}
        </div>
      </motion.div>
    </motion.div>
  );

  const renderTransactionRow = (transaction: WalletTransaction, index: number) => {
    const isCredit = isCreditTransaction(transaction.transaction_type);
    const category = getWalletTransactionCategory(transaction);
    const timeLabel = transaction.created_at
      ? dayjs(transaction.created_at).format("h:mm A")
      : "";

    return (
      <motion.div
        key={transaction.transaction_id}
        initial={prefersReducedMotion ? false : { opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.04, duration: 0.28, ease: EASE_OUT }}
        className="group flex items-center gap-2.5 rounded-xl border border-slate-100/90 bg-white px-3 py-2.5 shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-slate-200 hover:shadow-md"
      >
        <TransactionIcon category={category} isCredit={isCredit} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-800">
            {formatWalletTransactionDisplayLabel(transaction)}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
            <span
              className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                category === "topup"
                  ? "bg-emerald-50 text-emerald-600"
                  : category === "booking"
                    ? "bg-rose-50 text-rose-500"
                    : category === "refund"
                      ? "bg-sky-50 text-sky-600"
                      : "bg-slate-100 text-slate-500"
              }`}
            >
              {t(categoryLabelKey(category))}
            </span>
            <span className="text-slate-400">{timeLabel}</span>
          </p>
        </div>
        <p
          className={`shrink-0 text-sm font-bold tabular-nums ${
            isCredit ? "text-emerald-600" : "text-rose-500"
          }`}
        >
          {isCredit ? "+" : "−"}
          {formatWalletMoney(transaction.amount)}
        </p>
      </motion.div>
    );
  };

  const renderTransactionsTab = () => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          <TransactionSkeleton delay={0} />
          <TransactionSkeleton delay={0.06} />
          <TransactionSkeleton delay={0.12} />
        </div>
      );
    }

    if ((wallet?.transactions ?? []).length === 0) {
      return (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: motionDuration, ease: EASE_OUT }}
          className="rounded-2xl border border-dashed border-slate-200/80 bg-white/60 px-6 py-10 text-center"
        >
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-slate-50 shadow-sm ring-1 ring-slate-100">
            <WalletIcon className="h-6 w-6 text-slate-400" strokeWidth={1.75} />
          </div>
          <p className="text-base font-semibold text-slate-800">{t("noTransactionsYet")}</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">{t("noTransactionsHint")}</p>
          <motion.button
            type="button"
            onClick={() => setAddMoneyOpen(true)}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20"
          >
            <Plus className="h-4 w-4" />
            {t("addMoney")}
          </motion.button>
        </motion.div>
      );
    }

    let rowIndex = 0;
    return (
      <motion.div
        animate={{ opacity: isRefreshing ? 0.55 : 1 }}
        transition={{ duration: 0.2 }}
        className="wallet-scroll max-h-[min(20rem,45vh)] space-y-4 overflow-y-auto pr-0.5"
      >
        {transactionGroups.map((group) => (
          <section key={group.key}>
            <h4 className="mb-2 px-0.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              {group.labelKey === "walletEarlier" && group.dateLabel
                ? group.dateLabel
                : t(group.labelKey)}
            </h4>
            <div className="space-y-1.5">
              {group.items.map((tx) => renderTransactionRow(tx, rowIndex++))}
            </div>
          </section>
        ))}
      </motion.div>
    );
  };

  const renderRewardsTab = () => (
    <div className="rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 p-5 text-white shadow-lg shadow-orange-500/20">
      <div className="flex items-center justify-center gap-2">
        <Star className="h-6 w-6 fill-white/90 text-white" />
        <span className="text-2xl font-bold tabular-nums">
          {wallet?.rewards ?? 0} {t("points")}
        </span>
      </div>
      <p className="mt-2 text-center text-sm text-amber-50/95">{t("earnMorePoints")}</p>
      <button
        type="button"
        disabled
        className="mt-4 w-full cursor-not-allowed rounded-xl bg-white/15 py-2.5 text-sm font-semibold text-white/75 backdrop-blur-sm"
      >
        {t("rewardsComingSoon")}
      </button>
    </div>
  );

  const renderBody = () => {
    if (hasError && !wallet) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-10 text-center"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <WalletIcon className="h-7 w-7 text-slate-400" />
          </div>
          <p className="text-lg font-semibold text-slate-800">{t("noWalletFound")}</p>
          <p className="mt-1 text-sm text-slate-500">{t("noWalletMessage")}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => void loadWallet()}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              {t("tryAgain")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              {t("close")}
            </button>
          </div>
        </motion.div>
      );
    }

    return (
      <>
        {isLoading ? <BalanceSkeleton /> : renderBalanceCard()}

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: motionDuration, ease: EASE_OUT }}
          className="mt-3.5 flex items-center justify-between gap-2"
        >
          <div className="relative inline-flex rounded-xl bg-slate-100/90 p-1 ring-1 ring-slate-200/50">
            {(
              [
                { id: "transactions" as const, label: t("transactions") },
                { id: "rewards" as const, label: t("rewards") },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative z-10 rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                  activeTab === tab.id ? "text-blue-700" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.span
                    layoutId="wallet-tab-bg"
                    className="absolute inset-0 rounded-lg bg-white shadow-sm ring-1 ring-slate-200/60"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                )}
                <span className="relative flex items-center gap-1">
                  {tab.label}
                  {tab.id === "transactions" && !isLoading && (
                    <span className="text-xs font-medium text-slate-400">
                      {wallet?.transactions?.length ?? 0}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>

          <Tooltip title={t("refreshWallet")} enterDelay={400}>
            <motion.button
              type="button"
              onClick={() => void loadWallet({ silent: true })}
              disabled={isRefreshing || isLoading}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.92 }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-500 shadow-sm transition-colors duration-200 hover:border-slate-300 hover:text-slate-700 disabled:opacity-50"
              aria-label={t("refreshWallet")}
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                strokeWidth={2}
              />
            </motion.button>
          </Tooltip>
        </motion.div>

        <div className="mt-4 min-h-[12rem]">
          <motion.div
            key={activeTab}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
          >
            {activeTab === "transactions" ? renderTransactionsTab() : renderRewardsTab()}
          </motion.div>
        </div>
      </>
    );
  };

  return (
    <>
      <style>{`
        @keyframes wallet-shimmer {
          100% { transform: translateX(100%); }
        }
        .wallet-scroll {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }
        .wallet-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .wallet-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }
        .wallet-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        scroll="body"
        aria-labelledby="wallet-dialog-title"
        TransitionComponent={Fade}
        transitionDuration={{ enter: 280, exit: 200 }}
        slotProps={dialogSlotProps}
      >
        <div className="border-b border-white/10 bg-gradient-to-r from-sky-700 via-slate-800 to-slate-900 px-4 py-3.5 pr-12 text-white sm:px-5 sm:py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-200/90 sm:text-xs">
            {t("walletHeaderCaption")}
          </p>
          <DialogTitle
            className="!m-0 !p-0 !pt-0.5 !text-base !font-semibold !leading-tight !text-white sm:!text-lg"
            component="div"
            id="wallet-dialog-title"
          >
            {t("myWallet")}
          </DialogTitle>
        </div>
        <IconButton
          aria-label={t("close")}
          onClick={onClose}
          className="!absolute !right-2 !top-2 h-9 w-9 !rounded-lg !text-white hover:!bg-white/10 sm:!right-3 sm:!top-3"
        >
          <X className="h-5 w-5" />
        </IconButton>

        <DialogContent className="!p-0">
          <p className="border-b border-slate-100 bg-slate-50/80 px-4 py-2 text-left text-xs leading-snug text-slate-600 sm:px-5 sm:text-sm">
            <WalletIcon
              className="mr-1.5 -mt-0.5 inline h-3.5 w-3.5 text-sky-600 sm:h-4 sm:w-4"
              aria-hidden
            />
            {t("walletSubtitle")}
          </p>
          <div className="bg-slate-100/80 px-4 py-3 sm:px-5 sm:py-3.5">{renderBody()}</div>
        </DialogContent>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={5000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          TransitionComponent={Fade}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            variant="filled"
            sx={{ width: "100%", borderRadius: "12px" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Dialog>
    </>
  );
};

export default WalletDialog;
