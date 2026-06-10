/* eslint-disable */
import React, { useCallback, useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import dayjs from "dayjs";
import { DialogHeader } from "../ProviderDetails/CookServicesDialog.styles";
import { useLanguage } from "src/context/LanguageContext";
import { useAppUser } from "src/context/AppUserContext";
import { resolveCustomerId } from "src/services/couponService";
import {
  CustomerWallet,
  fetchCustomerWallet,
  formatWalletTransactionLabel,
  isCreditTransaction,
} from "src/services/walletService";
interface WalletDialogProps {
  open: boolean;
  onClose: () => void;
}

const WalletDialog: React.FC<WalletDialogProps> = ({ open, onClose }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("transactions");
  const { appUser } = useAppUser();
  const customerId = resolveCustomerId(appUser);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [wallet, setWallet] = useState<CustomerWallet | null>(null);

  const loadWallet = useCallback(async () => {
    if (!customerId) {
      setHasError(true);
      setWallet(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);
    try {
      const data = await fetchCustomerWallet(customerId);
      setWallet(data);
    } catch (error) {
      console.error("Wallet fetch error:", error);
      setHasError(true);
      setWallet(null);
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    if (open) {
      void loadWallet();
    }
  }, [open, loadWallet]);

  useEffect(() => {
    if (!open) {
      setIsLoading(false);
      setHasError(false);
      setWallet(null);
    }
  }, [open]);

  // Render loading state
  if (isLoading) {
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogHeader>
        <DialogTitle className="flex justify-between items-center">
          <span className="text-xl font-bold text-white-800">{t("myWallet")}</span>
           <button
      onClick={onClose}
      className="text-white hover:text-gray-200 text-2xl font-light focus:outline-none absolute right-4 top-1/2 transform -translate-y-1/2"
      aria-label={t("close")}
    >
     
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </DialogTitle>
        </DialogHeader>
        <DialogContent dividers>
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-700">{t("loadingWallet")}</p>
            <p className="text-gray-500 mt-2">{t("retrievingAccountInfo")}</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Render error state
  if (hasError) {
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogHeader>
        <DialogTitle className="flex justify-between items-center">
          <span className="text-xl font-bold text-white-800">{t("myWallet")}</span>
           <button
      onClick={onClose}
      className="text-white hover:text-gray-200 text-2xl font-light focus:outline-none absolute right-4 top-1/2 transform -translate-y-1/2"
      aria-label={t("close")}
    >
     
     
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </DialogTitle>
        </DialogHeader>
        <DialogContent dividers>
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-700 mb-2">{t("noWalletFound")}</p>
            <p className="text-gray-500 mb-6">{t("noWalletMessage")}</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => void loadWallet()}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t("tryAgain")}
              </button>
              <button 
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {/* Header */}
      <DialogHeader>
      <DialogTitle className="flex justify-between items-center">
        <span className="text-xl font-bold text-white-800">{t("myWallet")}</span>
          <button
      onClick={onClose}
      className="text-white hover:text-gray-200 text-2xl font-light focus:outline-none absolute right-4 top-1/2 transform -translate-y-1/2"
      aria-label={t("close")}
    >
     
     
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </DialogTitle>
      </DialogHeader>

      {/* Content */}
      <DialogContent dividers>
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 rounded-xl shadow-lg mb-5">
          <p className="text-blue-100 text-sm">{t("currentBalance")}</p>
          <p className="text-3xl font-bold my-2">
            ₹{Number(wallet?.balance ?? 0).toLocaleString("en-IN", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}
          </p>
          <div className="flex gap-3 mt-4">
            <button className="flex-1 bg-white text-blue-600 font-semibold py-2.5 rounded-lg hover:bg-blue-50 transition-colors">
              ➕ {t("addMoney")}
            </button>
            <button className="flex-1 bg-blue-700 bg-opacity-30 text-white font-semibold py-2.5 rounded-lg hover:bg-opacity-40 transition-colors">
              🔄 {t("transfer")}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-3 font-medium text-sm relative ${
              activeTab === "transactions" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("transactions")}
          >
            {t("transactions")}
            {activeTab === "transactions" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
            )}
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm relative ${
              activeTab === "rewards" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("rewards")}
          >
            {t("rewards")}
            {activeTab === "rewards" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "transactions" ? (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">{t("recentTransactions")}</h3>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
              {(wallet?.transactions ?? []).length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-500">
                  No transactions yet. Refunds and credits will appear here.
                </p>
              ) : (
                (wallet?.transactions ?? []).map((transaction) => {
                  const isCredit = isCreditTransaction(transaction.transaction_type);
                  const dateLabel = transaction.created_at
                    ? dayjs(transaction.created_at).format("MMM D, YYYY")
                    : "";
                  return (
                    <div key={transaction.transaction_id} className="flex items-center">
                      <div
                        className={`flex items-center justify-center h-10 w-10 rounded-full ${
                          isCredit ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        }`}
                      >
                        {isCredit ? "⬆" : "⬇"}
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="font-medium text-gray-900">
                          {formatWalletTransactionLabel(transaction)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {dateLabel}
                          {transaction.status ? ` • ${transaction.status}` : ""}
                        </p>
                      </div>
                      <div
                        className={`font-semibold ${
                          isCredit ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isCredit ? "+" : "-"}₹
                        {Number(transaction.amount).toLocaleString("en-IN")}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">{t("yourRewards")}</h3>
            <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white p-5 rounded-xl shadow">
              <div className="flex items-center justify-center gap-3 mb-3">
                ⭐ <span className="text-2xl font-bold">{wallet?.rewards ?? 0} {t("points")}</span>
              </div>
              <p className="text-amber-100 text-center text-sm mb-4">
                {t("earnMorePoints")}
              </p>
              <button className="w-full bg-white bg-opacity-20 text-white font-semibold py-2.5 rounded-lg hover:bg-opacity-30 transition-colors">
                {t("viewRewardsCatalog")}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WalletDialog;