/* eslint-disable */
import styled from "@emotion/styled";
import { Dialog, DialogContent, IconButton } from "@mui/material";

const accent = "#0b5bd3";
const accentSoft = "#e8f1ff";
const accentDark = "#0848b0";
const text = "#0f172a";
const textMuted = "#64748b";
const line = "#e2e8f0";
const surface = "#ffffff";
const canvas = "#f1f5f9";
const radius = "16px";
const radiusSm = "12px";

/** Shared gradient for maid/cook booking dialogs and legacy DialogHeader. */
export const BOOKING_HEADER_GRADIENT =
  "linear-gradient(135deg, #0c1e3d 0%, #0b5bd3 48%, #4f8ff7 100%)";

export const MaidStyledDialog = styled(Dialog)`
  .MuiPaper-root {
    width: min(100vw - 16px, 440px);
    max-height: min(94vh, 820px);
    border-radius: ${radius};
    overflow: hidden;
    margin: 8px;
    box-shadow: 0 24px 48px rgba(15, 23, 42, 0.18);
  }
`;

export const MaidStyledContent = styled(DialogContent)`
  padding: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: ${canvas};
`;

export const MaidPageShell = styled.div`
  min-height: calc(100vh - 64px);
  background: ${canvas};
  padding: 12px 12px 24px;
  font-family:
    "Inter",
    system-ui,
    -apple-system,
    sans-serif;
  color: ${text};
`;

export const MaidPageInner = styled.div`
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
`;

export const MaidRoot = styled.div<{ $page?: boolean }>`
  display: flex;
  flex-direction: column;
  min-height: ${(p) => (p.$page ? "calc(100vh - 88px)" : "min(520px, 80vh)")};
  max-height: ${(p) => (p.$page ? "none" : "min(94vh, 820px)")};
  font-family:
    "Inter",
    system-ui,
    -apple-system,
    sans-serif;
  color: ${text};
  border-radius: ${(p) => (p.$page ? radius : "0")};
  overflow: ${(p) => (p.$page ? "visible" : "hidden")};
  box-shadow: ${(p) => (p.$page ? "0 8px 32px rgba(15, 23, 42, 0.08)" : "none")};
`;

export const MaidHeader = styled.header`
  flex-shrink: 0;
  background: ${BOOKING_HEADER_GRADIENT};
  color: #fff;
  padding: 20px 52px 20px 20px;
  position: relative;
`;

export const MaidHeaderTitle = styled.h1`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: -0.03em;
`;

export const MaidHeaderSub = styled.p`
  margin: 4px 0 0;
  font-size: 0.8125rem;
  opacity: 0.9;
  line-height: 1.4;
`;

export const MaidCloseBtn = styled(IconButton)`
  position: absolute !important;
  right: 10px;
  top: 10px;
  color: #fff !important;
  background: rgba(255, 255, 255, 0.12) !important;

  &:hover {
    background: rgba(255, 255, 255, 0.22) !important;
  }
`;

export const MaidScroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 14px 14px 8px;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const MaidCard = styled.section`
  background: ${surface};
  border: 1px solid ${line};
  border-radius: ${radius};
  padding: 16px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
`;

export const MaidCardTitle = styled.h2`
  margin: 0 0 2px;
  font-size: 0.9375rem;
  font-weight: 700;
  color: ${text};
  letter-spacing: -0.02em;
`;

export const MaidCardSub = styled.p`
  margin: 0 0 14px;
  font-size: 0.75rem;
  color: ${textMuted};
  line-height: 1.4;
`;

export const MaidBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 11px;
  border-radius: 999px;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  background: ${accentSoft};
  color: ${accent};
  margin-bottom: 12px;
`;

export const MaidSummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 16px;

  @media (max-width: 380px) {
    grid-template-columns: 1fr;
  }
`;

export const MaidSummaryTile = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 10px;
  border-radius: ${radiusSm};
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid ${line};
  min-height: 72px;
`;

export const MaidSummaryIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: ${accentSoft};
  color: ${accent};

  svg {
    font-size: 16px;
  }
`;

export const MaidSummaryLabel = styled.span`
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${textMuted};
`;

export const MaidSummaryValue = styled.span`
  font-size: 0.8125rem;
  font-weight: 700;
  color: ${text};
  line-height: 1.3;
  word-break: break-word;
`;

export const MaidSectionHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
`;

export const MaidSectionTitle = styled.h3`
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 700;
  color: ${text};
`;

export const MaidEditToggle = styled.button<{ $open?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border: none;
  border-radius: 999px;
  background: ${(p) => (p.$open ? accentSoft : "#f1f5f9")};
  color: ${accent};
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s ease;

  &:hover {
    background: ${accentSoft};
  }
`;

export const MaidDurationSection = styled.div`
  margin-bottom: 14px;
`;

export const MaidDurationHint = styled.p`
  margin: 0 0 10px;
  font-size: 0.75rem;
  color: ${textMuted};
  line-height: 1.4;
`;

export const MaidDurationChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const MaidDurationChip = styled.button<{ $active?: boolean }>`
  padding: 8px 14px;
  border-radius: 999px;
  border: 1.5px solid ${(p) => (p.$active ? accent : line)};
  background: ${(p) => (p.$active ? accent : surface)};
  color: ${(p) => (p.$active ? "#fff" : text)};
  font-size: 0.8125rem;
  font-weight: ${(p) => (p.$active ? 700 : 600)};
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
  box-shadow: ${(p) => (p.$active ? "0 2px 8px rgba(11, 91, 211, 0.25)" : "none")};

  &:hover:not(:disabled) {
    border-color: ${accent};
    background: ${(p) => (p.$active ? accentDark : accentSoft)};
    color: ${(p) => (p.$active ? "#fff" : accent)};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

export const MaidPickerPanel = styled.div<{ $visible?: boolean }>`
  overflow: hidden;
  max-height: ${(p) => (p.$visible ? "900px" : "0")};
  opacity: ${(p) => (p.$visible ? 1 : 0)};
  transition:
    max-height 0.35s ease,
    opacity 0.25s ease,
    margin 0.25s ease;
  margin-top: ${(p) => (p.$visible ? "4px" : "0")};
`;

export const MaidPickerShell = styled.div`
  padding: 10px;
  border-radius: ${radiusSm};
  border: 1px solid ${line};
  background: #fafbfc;
`;

export const MaidInlineNote = styled.p`
  margin: 10px 0 0;
  padding: 10px 12px;
  border-radius: ${radiusSm};
  font-size: 0.75rem;
  line-height: 1.45;
  color: ${textMuted};
  background: #fffbeb;
  border: 1px solid #fde68a;
`;

export const MaidMetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  font-size: 0.8125rem;
  border-bottom: 1px solid ${line};

  &:last-of-type {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

export const MaidMetricLabel = styled.span`
  color: ${textMuted};
`;

export const MaidMetricValue = styled.span`
  font-weight: 600;
  color: ${text};
  text-align: right;
`;

export const MaidPriceHero = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  padding-top: 4px;
`;

export const MaidPriceBlock = styled.div``;

export const MaidPriceLabel = styled.div`
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${textMuted};
  margin-bottom: 4px;
`;

export const MaidReviewTotal = styled.div<{ $loading?: boolean }>`
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: ${text};
  opacity: ${(p) => (p.$loading ? 0.35 : 1)};
  transition: opacity 0.2s ease;
`;

export const MaidPriceMeta = styled.span`
  font-size: 0.75rem;
  color: ${textMuted};
  text-align: right;
  line-height: 1.4;
  max-width: 120px;
`;

export const MaidQuotePulse = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${accent};
  margin-right: 6px;
  animation: maidPulse 1s ease-in-out infinite;

  @keyframes maidPulse {
    0%,
    100% {
      opacity: 0.35;
      transform: scale(0.9);
    }
    50% {
      opacity: 1;
      transform: scale(1.1);
    }
  }
`;

export const MaidFooter = styled.footer`
  flex-shrink: 0;
  padding: 12px 14px calc(14px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid ${line};
  background: ${surface};
  box-shadow: 0 -8px 32px rgba(15, 23, 42, 0.08);
`;

export const MaidFooterTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

export const MaidFooterMuted = styled.div`
  font-size: 0.6875rem;
  color: ${textMuted};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
`;

export const MaidFooterPrice = styled.div`
  font-size: 1.25rem;
  font-weight: 800;
  color: ${accent};
  letter-spacing: -0.02em;
`;

export const MaidFooterActions = styled.div`
  display: flex;
  gap: 8px;
`;

export const MaidBtnGhost = styled.button`
  flex: 0 0 auto;
  padding: 12px 16px;
  border-radius: ${radiusSm};
  border: 1px solid ${line};
  background: ${surface};
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  color: ${text};
  font-family: inherit;

  &:hover {
    background: #f8fafc;
  }
`;

export const MaidBtnPrimary = styled.button<{ disabled?: boolean }>`
  flex: 1;
  min-width: 0;
  padding: 13px 20px;
  border-radius: ${radiusSm};
  border: none;
  font-weight: 700;
  font-size: 0.9375rem;
  cursor: ${(p) => (p.disabled ? "not-allowed" : "pointer")};
  font-family: inherit;
  background: ${(p) => (p.disabled ? "#cbd5e1" : `linear-gradient(135deg, ${accent} 0%, #2563eb 100%)`)};
  color: #fff;
  box-shadow: ${(p) => (p.disabled ? "none" : "0 4px 14px rgba(11, 91, 211, 0.35)")};
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease;

  &:not(:disabled):hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(11, 91, 211, 0.4);
  }

  &:not(:disabled):active {
    transform: translateY(0);
  }
`;

/* Legacy exports kept for other imports */
export const MaidDivider = styled.hr`
  border: none;
  border-top: 1px solid ${line};
  margin: 14px 0;
`;

export const MaidFooterMeta = styled.div``;
export const MaidDetailStack = styled.div``;
export const MaidDetailLine = styled.p``;
export const MaidDurationRow = styled.div``;
export const MaidDurationLabel = styled.span``;
export const MaidDurationCtrl = styled.div``;
export const MaidDurationBtn = styled.button``;
export const MaidDurationVal = styled.span``;
