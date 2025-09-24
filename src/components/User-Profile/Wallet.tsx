/* eslint-disable */
import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import { Button } from "../../components/Button/button";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import PaymentInstance from "src/services/paymentInstance";

interface WalletDialogProps {
  open: boolean;
  onClose: () => void;
}

const WalletDialog: React.FC<WalletDialogProps> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState("transactions");
  const { user: auth0User, isAuthenticated } = useAuth0();

  interface Wallet {
    balance: number;
    transactions: {
      transaction_id: number;
      transaction_type: string;
      amount: number;
      description: string;
      created_at: string;
      status: string;
    }[];
    rewards: number;
  }

  const [wallet, setWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    if (open && isAuthenticated && auth0User?.customerid) {
      console.log("Fetching wallet for user:", auth0User.customerid);

      PaymentInstance
        .get(`/api/wallets/${auth0User.customerid}`)
        .then((response) => {
          console.log("Wallet API Response:", response.data);
          setWallet(response.data);
        })
        .catch((error) => {
          console.error("Wallet fetch error:", error);
        });
    }
  }, [open, isAuthenticated, auth0User]);

  // fallback dummy wallet
  const walletData = {
    balance: 5420,
    transactions: [
      { id: 1, type: "credit", amount: 2000, description: "Home Cook Service", date: "Aug 28, 2025", status: "Completed" },
      { id: 2, type: "debit", amount: 1500, description: "Maid Service", date: "Aug 25, 2025", status: "Completed" },
    ],
    rewards: 450,
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {/* Header */}
      <DialogTitle className="flex justify-between items-center">
        <span className="text-xl font-bold text-gray-800">My Wallet</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </DialogTitle>

      {/* Content */}
      <DialogContent dividers>
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 rounded-xl shadow-lg mb-5">
          <p className="text-blue-100 text-sm">Current Balance</p>
          <p className="text-3xl font-bold my-2">₹{wallet ? wallet.balance : walletData.balance}</p>
          <div className="flex gap-3 mt-4">
            <button className="flex-1 bg-white text-blue-600 font-semibold py-2.5 rounded-lg hover:bg-blue-50 transition-colors">
              ➕ Add Money
            </button>
            <button className="flex-1 bg-blue-700 bg-opacity-30 text-white font-semibold py-2.5 rounded-lg hover:bg-opacity-40 transition-colors">
              🔄 Transfer
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
            Transactions
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
            Rewards
            {activeTab === "rewards" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "transactions" ? (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Recent Transactions</h3>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
              {(wallet?.transactions || []).map((transaction) => (
                <div key={transaction.transaction_id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center h-10 w-10 rounded-full ${
                      transaction.transaction_type === "credit"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {transaction.transaction_type === "credit" ? "⬆" : "⬇"}
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-xs text-gray-500">
                      {transaction.created_at} • {transaction.status}
                    </p>
                  </div>
                  <div
                    className={`font-semibold ${
                      transaction.transaction_type === "credit" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {transaction.transaction_type === "credit" ? "+" : "-"}₹{transaction.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Your Rewards</h3>
            <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white p-5 rounded-xl shadow">
              <div className="flex items-center justify-center gap-3 mb-3">
                ⭐ <span className="text-2xl font-bold">{wallet?.rewards ?? walletData.rewards} Points</span>
              </div>
              <p className="text-amber-100 text-center text-sm mb-4">
                Earn more points by completing services and referring friends
              </p>
              <button className="w-full bg-white bg-opacity-20 text-white font-semibold py-2.5 rounded-lg hover:bg-opacity-30 transition-colors">
                View Rewards Catalog
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WalletDialog;
