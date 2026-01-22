/* eslint-disable */
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";

import { Button } from "../../components/Button";
import { Loader2, X } from "lucide-react";
import { DialogHeader } from "../ProviderDetails/CookServicesDialog.styles";
import { Input } from "../Common/input";

interface OtpVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: (otp: string) => Promise<void>;
  verifying: boolean;
  bookingInfo?: {
    clientName?: string;
    service?: string;
    bookingId?: string | number;
  };
}

export function OtpVerificationDialog({
  open,
  onOpenChange,
  onVerify,
  verifying,
  bookingInfo,
}: OtpVerificationDialogProps) {
  const [otpValue, setOtpValue] = useState("");
  const verificationCompletedRef = useRef(false);

  // Reset ref when dialog opens
  useEffect(() => {
    if (open) {
      verificationCompletedRef.current = false;
    }
  }, [open]);

  // Handle successful verification completion
  useEffect(() => {
    // Only run when verifying changes from true to false AND we were previously verifying
    if (!verifying && verificationCompletedRef.current) {
      const timer = setTimeout(() => {
        handleClose();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [verifying]);

  const handleVerify = async () => {
    if (!otpValue.trim()) return;
    
    // Mark that verification is starting
    verificationCompletedRef.current = true;
    await onVerify(otpValue.trim());
    // The dialog will close via the useEffect above when verifying becomes false
  };

  const handleClose = () => {
    setOtpValue("");
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onClose={() => onOpenChange(false)}
    >
      <DialogHeader>
        <DialogTitle>Verify OTP to Complete Service</DialogTitle>
        <button
          onClick={handleClose}
          className="text-white hover:text-gray-200 text-2xl font-light focus:outline-none ml-60"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>
      </DialogHeader>
      <DialogContent>
        {bookingInfo && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm font-medium">
              Service for {bookingInfo.clientName || "Client"}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Booking ID: {bookingInfo.bookingId || "N/A"} • {bookingInfo.service || "Service"}
            </p>
          </div>
        )}
        
        <div className="space-y-4 py-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Please enter the OTP you received from the client to complete the service.
            </p>
            <Input
              placeholder="Enter 6-digit OTP"
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value)}
              type="text"
              maxLength={6}
              className="text-center text-lg tracking-widest"
              disabled={verifying}
            />
          </div>
          
          <p className="text-sm text-muted-foreground">
            Once verified, the service will be marked as completed and your earnings will be credited.
          </p>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={verifying}
          >
            Cancel
          </Button>

          <Button
            onClick={handleVerify}
            disabled={verifying || !otpValue.trim() || otpValue.length < 4}
          >
            {verifying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify & Complete"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}