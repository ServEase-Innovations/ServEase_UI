/* eslint-disable */
import React, { useEffect } from "react";
import {
  Button,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  Typography,
} from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";
import { useLanguage } from "src/context/LanguageContext";

/**
 * In-app status overlay while Auth0 `loginWithPopup` runs in a child window.
 * Auth0 Universal Login cannot be loaded in a same-page iframe (framing is blocked);
 * the SDK uses a separate window and web_message.
 */
const Auth0SignInDialog: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth0();

  useEffect(() => {
    if (open && isAuthenticated) {
      onClose();
    }
  }, [open, isAuthenticated, onClose]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      disableScrollLock={false}
      sx={{ zIndex: 2000 }}
    >
      <DialogContent
        sx={{
          py: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Box
          sx={(theme) => ({
            width: "100%",
            minHeight: 200,
            borderRadius: 1,
            border: `1px dashed ${theme.palette.divider}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            px: 2,
            py: 2,
            bgcolor: "action.hover",
            mb: 1,
          })}
        >
          <CircularProgress size={40} />
        </Box>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 0.5 }}>
          {t("auth0SigningInTitle")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {t("auth0CompleteInPopupWindow")}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1, maxWidth: 420 }}>
          {t("auth0SignInNote")}
        </Typography>
        <Button
          type="button"
          variant="outlined"
          onClick={onClose}
          sx={{ mt: 2 }}
        >
          {t("cancel")}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default Auth0SignInDialog;
