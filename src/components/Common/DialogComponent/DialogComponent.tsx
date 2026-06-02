/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { styled } from "@mui/material/styles";
import { X } from "lucide-react";
import { Button, dialogActionsClassName } from "../../Button/button";
import { IconButton } from "../../Button/icon-button";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const DialogComponent = ({
  open,
  onClose,
  title,
  children,
  onSave,
  disableConfirm = false,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  onSave?: () => void;
  disableConfirm?: boolean;
}) => {
  const getButtonText = () => {
    if (title === "Select your Booking") {
      return "Confirm";
    }
    return "Add to Cart";
  };

  return (
    <BootstrapDialog onClose={onClose} aria-labelledby="customized-dialog-title" open={open}>
      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        {title}
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        className="absolute right-2 top-2 text-slate-500 hover:bg-slate-100"
      >
        <X className="h-5 w-5" />
      </IconButton>
      <DialogContent dividers>{children}</DialogContent>
      <DialogActions className={dialogActionsClassName}>
        <Button
          type="button"
          autoFocus
          variant="dialogPrimary"
          onClick={onSave}
          disabled={disableConfirm}
        >
          {getButtonText()}
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
};

export default DialogComponent;
