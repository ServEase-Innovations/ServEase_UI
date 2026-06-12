/* eslint-disable */
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import { UserRound, Users } from "lucide-react";
import { Button } from "../../components/Button/button";

export type OnDemandRebookDialogBooking = {
  serviceProviderId: number;
  serviceProviderName: string;
};

interface OnDemandRebookDialogProps {
  open: boolean;
  onClose: () => void;
  booking: OnDemandRebookDialogBooking | null;
  canCheckSameProvider: boolean;
  sameProviderDisabledReason?: string | null;
  checkingSameProvider: boolean;
  sameProviderError?: string | null;
  onBookSameProvider: () => void;
  onChooseDifferentProvider: () => void;
}

const OnDemandRebookDialog: React.FC<OnDemandRebookDialogProps> = ({
  open,
  onClose,
  booking,
  canCheckSameProvider,
  sameProviderDisabledReason,
  checkingSameProvider,
  sameProviderError,
  onBookSameProvider,
  onChooseDifferentProvider,
}) => {
  const providerName =
    booking?.serviceProviderName?.trim() || "your previous provider";
  const hasAssignedProvider =
    Boolean(booking?.serviceProviderId) && booking!.serviceProviderId > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Book again</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.55 }}>
          Your schedule is prefilled from your last visit. Book with the same provider, or
          continue to on-demand checkout and we will match you with an available provider
          near you.
        </Typography>

        {sameProviderError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {sameProviderError}
          </Alert>
        ) : null}

        <Stack spacing={1.25}>
          {hasAssignedProvider ? (
            <Button
              variant="cta"
              className="w-full justify-center min-h-[44px]"
              onClick={onBookSameProvider}
              disabled={!canCheckSameProvider || checkingSameProvider}
            >
              {checkingSameProvider ? (
                <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />
              ) : (
                <UserRound className="h-4 w-4 mr-2 shrink-0" />
              )}
              Book with {providerName} again
            </Button>
          ) : null}

          {hasAssignedProvider && !canCheckSameProvider && sameProviderDisabledReason ? (
            <Typography variant="caption" color="text.secondary" sx={{ px: 0.5 }}>
              {sameProviderDisabledReason}
            </Typography>
          ) : null}

          <Button
            variant="outline"
            className="w-full justify-center min-h-[44px]"
            onClick={onChooseDifferentProvider}
            disabled={checkingSameProvider}
          >
            <Users className="h-4 w-4 mr-2 shrink-0" />
            {hasAssignedProvider
              ? "Book with a different provider"
              : "Continue to booking"}
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="ghost" onClick={onClose} disabled={checkingSameProvider}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OnDemandRebookDialog;
