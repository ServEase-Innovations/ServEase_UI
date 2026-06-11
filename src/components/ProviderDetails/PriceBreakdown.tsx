import { IconButton } from "src/components/Button/icon-button";
import React, { useState } from "react";
import { Box, Typography, Popover } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import type { QuoteBreakdownRow } from "src/utils/quoteBreakdown";
import { formatInr } from "src/utils/maidPricingUtils";
import type { PaymentTotals } from "src/utils/paymentTotals";
import {
  MaidCardSub,
  MaidCardTitle,
  MaidMetricLabel,
  MaidMetricRow,
  MaidMetricValue,
} from "./MaidServiceDialog.styles";

export interface PriceBreakdownProps {
  rows: QuoteBreakdownRow[];
  loading?: boolean;
  paymentTotals?: PaymentTotals | null;
  walletApplied?: number;
  amountPayable?: number;
  walletAppliedLabel?: string;
  walletPayableLabel?: string;
}

const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  rows,
  loading,
  paymentTotals,
  walletApplied = 0,
  amountPayable,
  walletAppliedLabel = "Wallet applied",
  walletPayableLabel = "Amount payable",
}) => {
  const [infoAnchor, setInfoAnchor] = useState<HTMLElement | null>(null);

  if (loading || rows.length === 0) return null;

  const lineRows = rows.filter((r) => r.kind !== "total");
  const totalRow = rows.find((r) => r.kind === "total");
  const showTaxesInfo =
    paymentTotals != null && paymentTotals.taxes_and_fees > 0;

  return (
    <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #e2e8f0" }}>
      <MaidCardTitle style={{ marginBottom: 4, fontSize: "0.95rem" }}>
        Price breakup
      </MaidCardTitle>
      <MaidCardSub style={{ marginBottom: 12 }}>
        How your total is calculated
      </MaidCardSub>

      {lineRows.map((row, idx) => (
        <MaidMetricRow
          key={`${row.kind}-${idx}-${row.label}`}
          style={{
            marginBottom: 8,
            alignItems: "flex-start",
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0, pr: 1 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
              <MaidMetricLabel
                style={{
                  color:
                    row.kind === "discount" || row.kind === "savings"
                      ? "#15803d"
                      : "#64748b",
                  whiteSpace: "normal",
                  flex: 1,
                }}
              >
                {row.label}
              </MaidMetricLabel>
              {row.kind === "taxes_fees" && showTaxesInfo ? (
                <IconButton
                  size="small"
                  aria-label="Taxes and fees breakdown"
                  onClick={(e) => setInfoAnchor(e.currentTarget)}
                  sx={{
                    p: 0.25,
                    mt: -0.25,
                    color: "#0b5bd3",
                  }}
                >
                  <InfoOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              ) : null}
            </Box>
            {row.detail ? (
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                {row.detail}
              </Typography>
            ) : null}
          </Box>
          <MaidMetricValue
            style={{
              color:
                row.kind === "discount" || row.kind === "savings"
                  ? "#15803d"
                  : "#1e293b",
              fontWeight:
                row.kind === "discount" || row.kind === "savings" ? 600 : 500,
              whiteSpace: "nowrap",
            }}
          >
            {row.kind === "discount" || row.kind === "savings" ? "−" : ""}
            {formatInr(Math.abs(row.amount))}
          </MaidMetricValue>
        </MaidMetricRow>
      ))}

      <Popover
        open={Boolean(infoAnchor)}
        anchorEl={infoAnchor}
        onClose={() => setInfoAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: { p: 2, maxWidth: 280, borderRadius: 2 },
          },
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
          Taxes & fees breakup
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
          <Typography variant="body2" color="text.secondary">
            Platform fee
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {formatInr(paymentTotals!.platform_fee)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2" color="text.secondary">
            GST (18% on platform fee)
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {formatInr(paymentTotals!.gst)}
          </Typography>
        </Box>
      </Popover>

      {walletApplied > 0 ? (
        <MaidMetricRow style={{ marginBottom: 8 }}>
          <MaidMetricLabel style={{ color: "#15803d", fontWeight: 600 }}>
            {walletAppliedLabel}
          </MaidMetricLabel>
          <MaidMetricValue style={{ color: "#15803d", fontWeight: 600 }}>
            −{formatInr(walletApplied)}
          </MaidMetricValue>
        </MaidMetricRow>
      ) : null}

      {totalRow ? (
        <MaidMetricRow
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: "1px dashed #cbd5e1",
          }}
        >
          <MaidMetricLabel style={{ fontWeight: 700, color: "#0f172a" }}>
            {walletApplied > 0 ? walletPayableLabel : totalRow.label}
          </MaidMetricLabel>
          <MaidMetricValue style={{ fontWeight: 700, color: "#0b5bd3", fontSize: "1.05rem" }}>
            {formatInr(
              walletApplied > 0 && amountPayable != null
                ? amountPayable
                : totalRow.amount
            )}
          </MaidMetricValue>
        </MaidMetricRow>
      ) : null}
    </Box>
  );
};

export default PriceBreakdown;
