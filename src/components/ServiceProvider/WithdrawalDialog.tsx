/* eslint-disable */
import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import { Button } from "../../components/Button";
import { useToast } from "../hooks/use-toast";
import { Loader2, Wallet, IndianRupee, X } from "lucide-react";
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

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setAmount("");
    }
  }, [open]);

  const numericAmount = parseFloat(amount) || 0;
  const isValidAmount = numericAmount > 0 && numericAmount <= availableBalance;
  const minWithdrawal = 500;

  const handleAmountChange = (value: string) => {
    // Allow only numbers and decimal point
    const regex = /^\d*\.?\d*$/;
    if (regex.test(value)) {
      setAmount(value);
    }
  };

  const handleMaxAmount = () => {
    setAmount(availableBalance.toString());
  };

  const handleConfirmWithdrawal = async () => {
    if (!serviceProviderId) {
      toast({
        title: "Error",
        description: "Service provider ID is missing",
        variant: "destructive",
      });
      return;
    }

    if (!isValidAmount) {
      toast({
        title: "Invalid Amount",
        description: `Please enter a valid amount between ₹1 and ₹${availableBalance.toLocaleString("en-IN")}`,
        variant: "destructive",
      });
      return;
    }

    // REMOVED: Minimum withdrawal validation check
    
    setLoading(true);
    try {
      const response = await PaymentInstance.post(
        `/api/service-providers/${serviceProviderId}/withdraw`,
        {
          amount: numericAmount,
          payout_mode: "BANK",
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast({
          title: "Success!",
          description: `Withdrawal request of ₹${numericAmount.toLocaleString("en-IN")} has been initiated successfully.`,
          variant: "default",
        });

        // Call success callback if provided
        if (onWithdrawalSuccess) {
          onWithdrawalSuccess();
        }

        // Close dialog
        handleClose();
      } else {
        throw new Error("Failed to process withdrawal");
      }
    } catch (error: any) {
      let errorMessage = "Failed to process withdrawal request";
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data?.message || "Invalid withdrawal request";
        } else if (error.response.status === 402) {
          errorMessage = "Insufficient balance for withdrawal";
        } else if (error.response.status === 422) {
          errorMessage = "Validation error. Please check the entered amount.";
        } else if (error.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Withdrawal Failed",
        description: errorMessage,
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
      PaperProps={{
        style: {
          borderRadius: '12px',
          padding: 0,
        }
      }}
    >
      <DialogHeader className="flex items-center justify-between">
  <span className="flex items-center gap-2">
    <Wallet className="h-5 w-5" />
    Request Withdrawal
  </span>

  <button
    onClick={handleClose}
    className="text-white hover:text-gray-200 focus:outline-none"
    aria-label="Close"
  >
    <X className="h-6 w-6" />
  </button>
</DialogHeader>

      <DialogContent style={{ padding: '24px' }}>
        <div className="space-y-6">
             <p className="text-sm text-muted-foreground mt-1">
          Withdraw your available balance to your bank account
        </p>
          {/* Available Balance Card */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
           
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-blue-700 font-medium">Available Balance</p>
                <div className="flex items-center gap-1 mt-1">
                  <IndianRupee className="h-6 w-6 text-blue-900" />
                  <span className="text-2xl font-bold text-blue-900">
                    {availableBalance.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-700 font-medium">Min. Withdrawal</p>
                <div className="flex items-center gap-1 mt-1 justify-end">
                  <IndianRupee className="h-4 w-4 text-blue-900" />
                  <span className="text-base font-semibold text-blue-900">{minWithdrawal}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Amount Input Section - FIXED */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-gray-700 font-medium text-sm">
                Enter Amount (₹)
              </Label>
              
              <div className="relative group">
                {/* Currency Symbol */}
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <span className="text-xl text-gray-500 font-medium">₹</span>
                </div>
                
                {/* Input Field */}
                <input
                  id="amount"
                  type="text"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full h-14 pl-12 pr-28 text-2xl font-medium border border-gray-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           placeholder:text-gray-400 text-gray-900
                           transition-all duration-200"
                  style={{ 
                    fontSize: '28px',
                    lineHeight: '1.2',
                  }}
                />
                
                {/* Max Button */}
                <button
                  type="button"
                  onClick={handleMaxAmount}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 
                           px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 
                           hover:bg-blue-100 active:bg-blue-200 
                           border border-blue-200 rounded-md
                           transition-colors duration-150"
                >
                  Max
                </button>
              </div>
            </div>
            
            {/* Validation Messages - Updated to remove min withdrawal check */}
            {amount && !isValidAmount && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-medium flex items-center gap-2">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {numericAmount > availableBalance
                    ? `Amount exceeds available balance (₹${availableBalance.toLocaleString("en-IN")})`
                    : `Amount must be greater than 0`} {/* Updated message */}
                </p>
              </div>
            )}
            
            {/* Summary Card */}
            {isValidAmount && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                <p className="text-sm font-medium text-gray-700">Summary</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Withdrawal Amount</span>
                    <span className="font-semibold text-gray-900">
                      ₹{numericAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Remaining Balance</span>
                    <span className="font-semibold text-green-600">
                      ₹{(availableBalance - numericAmount).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="h-px bg-gray-200"></div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Processing Time</span>
                    <span className="font-medium text-gray-700">2-3 business days</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payout Method Info */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="bg-white p-2 rounded-lg">
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-blue-800">Bank Transfer</p>
                <p className="text-sm text-blue-600 mt-1">
                  Amount will be transferred to your registered bank account within 2-3 business days
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Updated to remove min withdrawal disable condition */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="px-8 h-11 text-gray-700 border-gray-300 hover:bg-gray-50 rounded-lg"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmWithdrawal}
            disabled={!isValidAmount || loading}
            className="px-8 h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg
                     disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Withdraw"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalDialog;