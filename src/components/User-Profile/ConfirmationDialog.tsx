/* eslint-disable */
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import { Button } from '../Button/button';
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
          size="small"
          sx={{
            color: '#fff',
            flexShrink: 0,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
          }}
        >
          <X className="h-5 w-5" />
        </IconButton>
      </DialogHeader>

      <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6, textAlign: 'center' }}>
          {message}
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 1.5,
          gap: 1.5,
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          '& > *': { m: '0 !important' },
        }}
      >
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
          className="min-h-11 w-full sm:min-w-[7.5rem] sm:w-auto"
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          loading={loading}
          className="min-h-11 w-full sm:min-w-[7.5rem] sm:w-auto"
          variant={isDestructive ? 'destructive' : 'default'}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
