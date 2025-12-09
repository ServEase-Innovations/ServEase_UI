/* eslint-disable */
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography
} from '@mui/material';
import { Button } from '../Button/button';
import { X } from 'lucide-react';
import { DialogHeader } from '../ProviderDetails/CookServicesDialog.styles';

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  severity?: 'info' | 'warning' | 'error' | 'success';
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  severity = 'info'
}) => {
  const getSeverityColor = () => {
    switch (severity) {
      case 'warning':
        return 'bg-sky-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {/* <DialogTitle className={`flex items-center justify-between ${getSeverityColor()} p-2`}>
        <span className="font-semibold">{title}</span>
        <IconButton
          onClick={onClose}
          size="small"
          className="hover:bg-black/10"
          disabled={loading}
        >
          <X className="h-4 w-4" />
        </IconButton>
      </DialogTitle> */}
         <DialogHeader className="flex justify-between items-center px-4 py-2 bg-blue-600 rounded-t-lg">
                <DialogTitle className="text-xl font-semibold text-white">
                  <span className="font-semibold">{title}</span>
                </DialogTitle>
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-200 text-2xl font-light focus:outline-none"
                  aria-label="Close"
                >
                  &times;
                </button>
              </DialogHeader>
      
      <DialogContent className="p-6">
        <Typography variant="body1" className="text-gray-700 mt-4">
          {message}
        </Typography>
      </DialogContent>
      
      <DialogActions className="p-2 gap-3">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
          className="min-w-24"
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          loading={loading}
          className="min-w-24"
          variant={severity === 'error' ? 'destructive' : 'default'}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;