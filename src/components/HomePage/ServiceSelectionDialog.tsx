import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
} from "@mui/material";
import { IconButton } from "../Button/icon-button";
import { ArrowRight, Copy, X } from "lucide-react";
import { FIRST_BOOKING_COUPON_CODES } from "src/services/couponService";

interface ServiceSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectService: (serviceType: string) => void;
}

const services = [
  {
    id: "COOK",
    title: "Home Cook",
    icon: "👩‍🍳",
    description: "Professional chefs for delicious home-cooked meals",
    gradient: "from-slate-800 via-slate-700 to-cyan-900",
    couponCode: FIRST_BOOKING_COUPON_CODES.COOK,
  },
  {
    id: "MAID",
    title: "Cleaning Help",
    icon: "🧹",
    description: "Professional cleaning services for your home",
    gradient: "from-sky-900 via-sky-800 to-teal-700",
    couponCode: FIRST_BOOKING_COUPON_CODES.MAID,
  },
  {
    id: "NANNY",
    title: "Caregiver",
    icon: "👶",
    description: "Experienced caregivers for your loved ones",
    gradient: "from-purple-900 via-purple-800 to-pink-700",
    couponCode: null,
  },
] as const;

const ServiceSelectionDialog: React.FC<ServiceSelectionDialogProps> = ({
  open,
  onClose,
  onSelectService,
}) => {
  const [snackbar, setSnackbar] = React.useState<string | null>(null);

  const copyCoupon = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setSnackbar(`Coupon "${code}" copied!`);
    } catch {
      setSnackbar("Could not copy coupon. Please copy it manually.");
    }
  };

  const handleSelect = (serviceId: string) => {
    onSelectService(serviceId);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle className="flex items-center justify-between bg-gradient-to-r from-sky-700 to-blue-500 py-3 pr-2 text-white">
          <span className="text-lg font-semibold">Select service</span>
          <IconButton
            onClick={onClose}
            aria-label="Close"
            className="h-8 w-8 text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </IconButton>
        </DialogTitle>

        <DialogContent className="space-y-5 px-4 py-5 sm:px-6">
          <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4 text-center">
            <p className="text-sm text-slate-700">
              Book maid or cook at just{" "}
              <span className="text-xl font-extrabold text-red-600">₹99</span> on your first booking!
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => void copyCoupon(FIRST_BOOKING_COUPON_CODES.MAID)}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-1.5 text-sm font-bold tracking-wide text-white shadow-sm transition hover:brightness-105"
              >
                Maid: {FIRST_BOOKING_COUPON_CODES.MAID}
                <Copy className="h-3.5 w-3.5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => void copyCoupon(FIRST_BOOKING_COUPON_CODES.COOK)}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-slate-700 to-cyan-800 px-4 py-1.5 text-sm font-bold tracking-wide text-white shadow-sm transition hover:brightness-105"
              >
                Cook: {FIRST_BOOKING_COUPON_CODES.COOK}
                <Copy className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Choose your service</h3>
            <div className="space-y-3">
              {services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => handleSelect(service.id)}
                  className={`flex w-full items-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r ${service.gradient} p-4 text-left text-white shadow-md transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500`}
                >
                  <span className="text-2xl" aria-hidden>
                    {service.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{service.title}</span>
                    <span className="mt-0.5 block text-xs text-white/85">
                      {service.description}
                    </span>
                    {service.couponCode ? (
                      <span className="mt-1 block text-[11px] font-semibold text-amber-200">
                        First booking code: {service.couponCode}
                      </span>
                    ) : null}
                  </span>
                  <ArrowRight className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">How to book</p>
            <ol className="mt-2 list-decimal space-y-1 pl-4">
              <li>Copy {FIRST_BOOKING_COUPON_CODES.MAID} (maid) or {FIRST_BOOKING_COUPON_CODES.COOK} (cook)</li>
              <li>Select your preferred service</li>
              <li>Apply the matching coupon at checkout</li>
            </ol>
          </div>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={3500}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSnackbar(null)} sx={{ width: "100%" }}>
          {snackbar}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ServiceSelectionDialog;
