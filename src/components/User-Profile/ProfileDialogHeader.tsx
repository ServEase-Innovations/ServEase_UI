import React from "react";
import { Box, Typography } from "@mui/material";
import { X, type LucideIcon } from "lucide-react";
import { IconButton } from "../Button/icon-button";
import { DialogHeader } from "../ProviderDetails/CookServicesDialog.styles";

export type ProfileDialogHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  onClose: () => void;
  closeDisabled?: boolean;
};

/** Consistent modal header for My Bookings / profile dialogs. */
const ProfileDialogHeader: React.FC<ProfileDialogHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  onClose,
  closeDisabled = false,
}) => (
  <DialogHeader
    style={{
      height: "auto",
      minHeight: "3.5rem",
      padding: "14px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flex: 1, minWidth: 0 }}>
      {Icon ? <Icon className="h-5 w-5 shrink-0 text-white" aria-hidden /> : null}
      <Box sx={{ minWidth: 0 }}>
        {subtitle ? (
          <Typography
            component="p"
            sx={{
              m: 0,
              mb: subtitle ? 0.25 : 0,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.85)",
              lineHeight: 1.2,
            }}
          >
            {subtitle}
          </Typography>
        ) : null}
        <Typography
          component="h2"
          sx={{
            m: 0,
            p: 0,
            color: "#fff",
            fontSize: { xs: "1.05rem", sm: "1.15rem" },
            fontWeight: 600,
            lineHeight: 1.35,
          }}
        >
          {title}
        </Typography>
      </Box>
    </Box>
    <IconButton
      type="button"
      onClick={onClose}
      disabled={closeDisabled}
      aria-label="Close"
      className="h-8 w-8 shrink-0 text-white hover:bg-white/10"
    >
      <X className="h-5 w-5" />
    </IconButton>
  </DialogHeader>
);

export default ProfileDialogHeader;
