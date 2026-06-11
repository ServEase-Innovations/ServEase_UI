/* eslint-disable */
import React, { useState } from "react";
import { EnhancedProviderDetails } from "../../types/ProviderDetailsType";
import {
  MaidStyledDialog,
  MaidStyledContent,
  bookingDialogSlotProps,
} from "./MaidServiceDialog.styles";
import ServiceBookingFlow from "./ServiceBookingFlow";

interface CookServicesDialogProps {
  open: boolean;
  handleClose: () => void;
  providerDetails?: EnhancedProviderDetails;
  sendDataToParent?: (data: string) => void;
}

/** Modal booking flow for cook on-demand checkout. */
const CookServicesDialog: React.FC<CookServicesDialogProps> = ({
  open,
  handleClose,
  providerDetails,
  sendDataToParent,
}) => {
  const [successShowing, setSuccessShowing] = useState(false);

  const handleDialogClose = (
    _event: object,
    reason: "backdropClick" | "escapeKeyDown"
  ) => {
    if (successShowing) return;
    if (reason === "backdropClick") return;
    handleClose();
  };

  return (
    <MaidStyledDialog
      open={open}
      onClose={handleDialogClose}
      maxWidth={false}
      scroll="body"
      aria-labelledby="cook-flow-title"
      slotProps={bookingDialogSlotProps}
      disableEnforceFocus
      $successOverlay={successShowing}
    >
      <MaidStyledContent $successOverlay={successShowing}>
        <ServiceBookingFlow
          serviceKind="cook"
          active={open}
          presentation="dialog"
          onClose={handleClose}
          providerDetails={providerDetails}
          sendDataToParent={sendDataToParent}
          onSuccessDialogChange={setSuccessShowing}
        />
      </MaidStyledContent>
    </MaidStyledDialog>
  );
};

export default CookServicesDialog;
