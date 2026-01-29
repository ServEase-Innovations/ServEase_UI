/* eslint-disable */
import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import { Button } from "../../components/Button";
import { Badge } from "../../components/Common/Badge";
import { Loader2, ArrowUpRight, ArrowDownRight, Receipt, X } from "lucide-react";
import PaymentInstance from "src/services/paymentInstance";
import { useToast } from "../hooks/use-toast";
import { DialogHeader } from "../ProviderDetails/CookServicesDialog.styles";

interface LedgerEntry {
  ledger_id: string;
  engagement_id: string | null;
  amount: number;
  direction: "CREDIT" | "DEBIT";
  reason: "DAILY_EARNED" | "WITHDRAWAL" | "SERVICE_FEE" | "SECURITY_DEPOSIT" | "REFUND" | "OTHER";
  reference_type: string;
  reference_id: string;
  created_at: string;
}

interface PayoutHistoryResponse {
  success: boolean;
  serviceproviderid: string;
  summary: {
    total_earned: number;
    total_withdrawn: number;
    available_to_withdraw: number;
    wallet_balance: number;
    security_deposit_paid: boolean;
    security_deposit_amount: number;
  };
  ledger: LedgerEntry[];
  payouts?: Array<{
    payout_id: string;
    engagement_id: string;
    gross_amount: number;
    provider_fee: number;
    tds_amount: number;
    net_amount: number;
    payout_mode: string | null;
    status: string;
    created_at: string;
  }>;
}

interface WithdrawalHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceProviderId: number | null;
}

export function WithdrawalHistoryDialog({
  open,
  onOpenChange,
  serviceProviderId,
}: WithdrawalHistoryDialogProps) {
  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] = useState<PayoutHistoryResponse | null>(null);
  const { toast } = useToast();
  const [selectedFilter, setSelectedFilter] = useState<"all" | "credit" | "debit">("all");

  useEffect(() => {
    if (open && serviceProviderId) {
      fetchWithdrawalHistory();
    }
  }, [open, serviceProviderId]);

  const fetchWithdrawalHistory = async () => {
    if (!serviceProviderId) return;

    setLoading(true);
    try {
      // You might need to adjust the API endpoint based on your actual API
      const response = await PaymentInstance.get(
        `/api/service-providers/${serviceProviderId}/payouts?detailed=true&include_ledger=true`
      );

      if (response.status === 200) {
        setHistoryData(response.data);
      } else {
        throw new Error(`Failed to fetch history: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching withdrawal history:", error);
      toast({
        title: "Error",
        description: "Failed to load withdrawal history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "SUCCESS":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case "pending":
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case "failed":
      case "FAILED":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getReasonText = (reason: LedgerEntry["reason"]) => {
    switch (reason) {
      case "DAILY_EARNED":
        return "Service Payment";
      case "WITHDRAWAL":
        return "Withdrawal";
      case "SERVICE_FEE":
        return "Service Fee";
      case "SECURITY_DEPOSIT":
        return "Security Deposit";
      case "REFUND":
        return "Refund";
      default:
        return "Transaction";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const filteredLedger = historyData?.ledger?.filter((entry) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "credit") return entry.direction === "CREDIT";
    if (selectedFilter === "debit") return entry.direction === "DEBIT";
    return true;
  });
  const handleClose = () => {
    onOpenChange(false);
  };
  return (
    <Dialog   open={open}
      onClose={handleClose}>
             <DialogHeader className="flex items-center justify-between">
          <DialogTitle className="text-xl font-semibold">
            Withdrawal History
          </DialogTitle>
          
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 focus:outline-none"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
       
        </DialogHeader>

      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
    <p> View your earnings, withdrawals, and transaction history</p>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !historyData ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No history data available</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={fetchWithdrawalHistory}
            >
              Retry
            </Button>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <div className="text-sm text-blue-600 font-medium mb-1">
                  Total Earned
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  {formatAmount(historyData.summary.total_earned)}
                </div>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <div className="text-sm text-green-600 font-medium mb-1">
                  Available Balance
                </div>
                <div className="text-2xl font-bold text-green-700">
                  {formatAmount(historyData.summary.available_to_withdraw)}
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
                <div className="text-sm text-orange-600 font-medium mb-1">
                  Total Withdrawn
                </div>
                <div className="text-2xl font-bold text-orange-700">
                  {formatAmount(historyData.summary.total_withdrawn)}
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex space-x-2 mb-4">
              <Button
                variant={selectedFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("all")}
              >
                All Transactions
              </Button>
              <Button
                variant={selectedFilter === "credit" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("credit")}
              >
                <ArrowUpRight className="h-4 w-4 mr-2 text-green-600" />
                Earnings
              </Button>
              <Button
                variant={selectedFilter === "debit" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("debit")}
              >
                <ArrowDownRight className="h-4 w-4 mr-2 text-red-600" />
                Withdrawals
              </Button>
            </div>

            {/* Transaction History */}
            <div className="flex-1 overflow-y-auto border rounded-lg">
              <div className="divide-y">
                {filteredLedger && filteredLedger.length > 0 ? (
                  filteredLedger.map((entry) => (
                    <div
                      key={entry.ledger_id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-full ${
                              entry.direction === "CREDIT"
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {entry.direction === "CREDIT" ? (
                              <ArrowUpRight className="h-5 w-5" />
                            ) : (
                              <ArrowDownRight className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">
                              {getReasonText(entry.reason)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(entry.created_at)}
                              {entry.engagement_id && (
                                <span className="ml-2">
                                  • Engagement #{entry.engagement_id}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`font-bold ${
                              entry.direction === "CREDIT"
                                ? "text-green-700"
                                : "text-red-700"
                            }`}
                          >
                            {entry.direction === "CREDIT" ? "+" : "-"}
                            {formatAmount(entry.amount)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {entry.direction === "CREDIT" ? "Credit" : "Debit"}
                          </div>
                        </div>
                      </div>
                      {entry.reference_type && (
                        <div className="mt-2 text-xs text-gray-500">
                          Ref: {entry.reference_type} #{entry.reference_id}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No transactions found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {selectedFilter !== "all"
                        ? `No ${selectedFilter} transactions`
                        : "Start providing services to see transactions"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Payout History Section (if available) */}
            {historyData.payouts && historyData.payouts.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Payout Requests</h3>
                <div className="border rounded-lg divide-y">
                  {historyData.payouts.map((payout) => (
                    <div key={payout.payout_id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            Payout #{payout.payout_id}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(payout.created_at)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            {formatAmount(payout.net_amount)}
                          </div>
                          <div className="text-sm">
                            {getStatusBadge(payout.status)}
                          </div>
                        </div>
                      </div>
                      {payout.engagement_id && (
                        <div className="mt-2 text-sm">
                          <span className="text-muted-foreground">
                            Engagement #{payout.engagement_id}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div> */}
      </DialogContent>
    </Dialog>
  );
}