/* eslint-disable */
import React from "react";
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
}) => (
  <MaidStyledDialog
    open={open}
    onClose={handleClose}
    fullWidth
    aria-labelledby="maid-flow-title"
  >
    <MaidStyledContent>
      <ServiceBookingFlow
        serviceKind="maid"
        active={open}
        presentation="dialog"
        onClose={handleClose}
        providerDetails={providerDetails}
        sendDataToParent={sendDataToParent}
      />
    </MaidStyledContent>
  </MaidStyledDialog>
);

export default MaidServiceDialog;
