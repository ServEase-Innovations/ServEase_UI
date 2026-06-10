/* eslint-disable */
import React, { useState } from "react";
import { EnhancedProviderDetails } from "../../types/ProviderDetailsType";
import { MaidStyledDialog, MaidStyledContent } from "./MaidServiceDialog.styles";
import ServiceBookingFlow from "./ServiceBookingFlow";

interface MaidServiceDialogProps {
  open: boolean;
  handleClose: () => void;
  providerDetails?: EnhancedProviderDetails;
  sendDataToParent?: (data: string) => void;
}

/** Modal booking flow for maid on-demand checkout. */
const MaidServiceDialog: React.FC<MaidServiceDialogProps> = ({
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
      fullWidth
      aria-labelledby="maid-flow-title"
      $successOverlay={successShowing}
    >
      <MaidStyledContent $successOverlay={successShowing}>
        <ServiceBookingFlow
          serviceKind="maid"
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

export default MaidServiceDialog;
