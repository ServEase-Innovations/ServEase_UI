import React from "react";
import { ArrowRight } from "lucide-react";
import { FIRST_BOOKING_COUPON_CODE } from "src/services/couponService";

interface FirstBookingOfferProps {
  onPress: () => void;
}

const FirstBookingOffer: React.FC<FirstBookingOfferProps> = ({ onPress }) => {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={`First booking offer, 99 rupees with code ${FIRST_BOOKING_COUPON_CODE}`}
      className="group w-full rounded-2xl border border-amber-200 bg-white text-left shadow-md shadow-slate-900/[0.06] ring-1 ring-amber-100/80 transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
    >
      <div className="flex overflow-hidden rounded-2xl">
        <div
          className="w-1 shrink-0 bg-gradient-to-b from-amber-500 to-orange-600"
          aria-hidden
        />

        <div className="min-w-0 flex-1 px-4 py-3 sm:px-5 sm:py-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
              <span aria-hidden>🔥</span>
              Hot deal
            </span>
            <span className="text-xs font-medium text-slate-500">Tap to book</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-600">First booking</p>
              <div className="mt-0.5 flex items-end gap-1.5">
                <span className="text-3xl font-extrabold leading-none tracking-tight text-red-600">
                  ₹99
                </span>
                <span className="pb-1 text-sm font-semibold text-slate-500">flat</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2.5">
              <div className="rounded-xl bg-amber-50 px-3 py-2 text-center ring-1 ring-amber-100">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                  Code
                </p>
                <p className="text-sm font-extrabold tracking-wide text-amber-900">
                  {FIRST_BOOKING_COUPON_CODE}
                </p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-600 transition group-hover:bg-orange-200">
                <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </div>
          </div>

          <p className="mt-3 border-t border-slate-100 pt-2 text-[11px] leading-relaxed text-slate-500">
            T&C apply · Valid on first booking only
          </p>
        </div>
      </div>
    </button>
  );
};

export default FirstBookingOffer;
