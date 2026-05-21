/* eslint-disable */
import React from "react";
import { EnhancedProviderDetails } from "../../types/ProviderDetailsType";
import { MaidStyledDialog, MaidStyledContent } from "./MaidServiceDialog.styles";
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
}) => (
  <MaidStyledDialog
    open={open}
    onClose={handleClose}
    fullWidth
    aria-labelledby="cook-flow-title"
  >
    <MaidStyledContent>
      <ServiceBookingFlow
        serviceKind="cook"
        active={open}
        presentation="dialog"
        onClose={handleClose}
        providerDetails={providerDetails}
        sendDataToParent={sendDataToParent}
      />
    </MaidStyledContent>
  </MaidStyledDialog>
);

export default CookServicesDialog;
