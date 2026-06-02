/* eslint-disable */
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Box,
} from '@mui/material';
import { Button, dialogActionsClassName } from '../Button/button';
import { IconButton } from '../Button/icon-button';
import { AlertTriangle, X } from 'lucide-react';
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
  severity = 'info',
}) => {
  const isDestructive = severity === 'warning' || severity === 'error';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
          m: 2,
        },
      }}
    >
      <DialogHeader
        style={{
          height: 'auto',
          minHeight: '3.5rem',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flex: 1, minWidth: 0 }}>
          {isDestructive && (
            <AlertTriangle className="h-5 w-5 shrink-0 text-white" aria-hidden />
          )}
          <Typography
            component="h2"
            sx={{
              m: 0,
              p: 0,
              color: '#fff',
              fontSize: { xs: '1.05rem', sm: '1.15rem' },
              fontWeight: 600,
              lineHeight: 1.35,
            }}
          >
            {title}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          disabled={loading}
          aria-label="Close"
          className="h-8 w-8 shrink-0 text-white hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </IconButton>
      </DialogHeader>

      <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6, textAlign: 'center' }}>
          {message}
        </Typography>
      </DialogContent>

      <DialogActions className={dialogActionsClassName}>
        <Button variant="dialogCancel" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          loading={loading}
          variant={isDestructive ? 'destructive' : 'dialogPrimary'}
          className={isDestructive ? 'w-full min-h-11 sm:w-auto sm:min-w-[7.5rem]' : undefined}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
