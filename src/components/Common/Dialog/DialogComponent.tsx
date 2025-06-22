import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import  './DialogComponent.css';



interface DialogComponentProps {
  open: boolean;
  onClose: () => void;
  onSave?: () => void;
  title?: string;
  disableConfirm?: boolean;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
}

const DialogComponent: React.FC<DialogComponentProps> = ({
  open,
  onClose,
  onSave,
  title,
  disableConfirm = false,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  return (
    <div className="dialog-component">
    <Dialog open={open} onClose={onClose} maxWidth="sm" >
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent dividers sx={{ backgroundColor: '#f9f9f9', borderRadius: 2 }}>{children}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {cancelText}
        </Button>
        {onSave && (
          <Button onClick={onSave} disabled={disableConfirm} variant="contained">
            {confirmText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
    </div>
  );
};

export default DialogComponent;
