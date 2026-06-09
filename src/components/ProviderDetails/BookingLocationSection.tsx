/* eslint-disable */
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Typography,
} from "@mui/material";
import {
  MapPin,
  LocateFixed,
  Navigation,
  Home,
  Building2,
  MapPinned,
  Check,
} from "lucide-react";
import { Button, dialogActionsClassName } from "../Button/button";
import { IconButton } from "../Button/icon-button";
import CloseIcon from "@mui/icons-material/Close";
import { add } from "../../features/geoLocation/geoLocationSlice";
import { useAppUser } from "src/context/AppUserContext";
import { useLanguage } from "src/context/LanguageContext";
import preferenceInstance from "src/services/preferenceInstance";
import { resolveCustomerId } from "src/services/couponService";
import {
  extractSavedLocations,
  formatCustomerDisplayName,
  formatCustomerPhone,
  formatSavedLocationAddress,
  formatSavedLocationLabel,
  formatServiceAddressFromGeoLocation,
  hasValidBookingLocation,
  locationsMatch,
  type SavedLocationEntry,
} from "src/utils/bookingLocation";
import MapComponent from "../MapComponent/MapComponent";
import axios from "axios";
import { keys } from "../../env/env";

type BookingLocationSectionProps = {
  allowChange?: boolean;
};

type PendingMapSelection = {
  payload: Record<string, unknown>;
  displayAddress: string;
};

function savedLocationIcon(name: string) {
  const key = String(name || "").toLowerCase();
  if (key === "home") return Home;
  if (key === "office") return Building2;
  return MapPinned;
}

const BookingLocationSection: React.FC<BookingLocationSectionProps> = ({
  allowChange = true,
}) => {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const { appUser } = useAppUser();
  const geoLocation = useSelector((state: any) => state?.geoLocation?.value);

  const [changeOpen, setChangeOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [savedLocations, setSavedLocations] = useState<SavedLocationEntry[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [pendingMapSelection, setPendingMapSelection] = useState<PendingMapSelection | null>(null);

  const customerName = formatCustomerDisplayName(appUser);
  const customerPhone = formatCustomerPhone(appUser);
  const serviceAddress = formatServiceAddressFromGeoLocation(geoLocation);
  const hasLocation = hasValidBookingLocation(geoLocation);

  const loadSavedLocations = useCallback(async () => {
    const customerId = resolveCustomerId(appUser);
    if (!customerId) {
      setSavedLocations([]);
      return;
    }
    setLoadingSaved(true);
    try {
      const response = await preferenceInstance.get(`/api/user-settings/${customerId}`);
      setSavedLocations(extractSavedLocations(response.data));
    } catch {
      setSavedLocations([]);
    } finally {
      setLoadingSaved(false);
    }
  }, [appUser]);

  useEffect(() => {
    if (changeOpen) {
      void loadSavedLocations();
    }
  }, [changeOpen, loadSavedLocations]);

  const applyLocation = (locationData: Record<string, unknown>) => {
    dispatch(add(locationData));
    setChangeOpen(false);
    setMapOpen(false);
    setPendingMapSelection(null);
  };

  const handleSelectSaved = (saved: SavedLocationEntry) => {
    if (saved?.location) {
      applyLocation(saved.location);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await axios.get(
            "https://maps.googleapis.com/maps/api/geocode/json",
            {
              params: {
                latlng: `${latitude},${longitude}`,
                key: keys.api_key,
              },
            }
          );
          const result = response.data.results?.[0];
          if (result) {
            applyLocation(result);
          } else {
            applyLocation({ lat: latitude, lng: longitude });
          }
        } catch {
          applyLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        } finally {
          setDetecting(false);
        }
      },
      () => setDetecting(false),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 }
    );
  };

  const handleMapSelect = (data: { address: unknown; lat: number; lng: number }) => {
    const payload: Record<string, unknown> = {
      lat: data.lat,
      lng: data.lng,
    };
    if (Array.isArray(data.address) && data.address[0]) {
      Object.assign(payload, data.address[0]);
      payload.address = data.address;
    }
    const displayAddress =
      typeof payload.formatted_address === "string"
        ? payload.formatted_address
        : formatServiceAddressFromGeoLocation(payload);
    setPendingMapSelection({ payload, displayAddress });
  };

  const handleOpenMap = () => {
    setPendingMapSelection(null);
    setMapOpen(true);
  };

  const handleCloseMap = () => {
    setMapOpen(false);
    setPendingMapSelection(null);
  };

  const labelForSaved = (name: string) => formatSavedLocationLabel(name, t);

  return (
    <>
      <Box
        sx={{
          p: 1.75,
          borderRadius: 2,
          border: hasLocation ? "1px solid #bbf7d0" : "1px solid #fecaca",
          background: hasLocation
            ? "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)"
            : "linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5 }}>
          <Box sx={{ display: "flex", gap: 1.25, minWidth: 0, flex: 1 }}>
            <Box
              sx={{
                mt: 0.25,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 2,
                bgcolor: hasLocation ? "#dcfce7" : "#fee2e2",
                color: hasLocation ? "#15803d" : "#b91c1c",
                flexShrink: 0,
                width: 40,
                height: 40,
              }}
            >
              <MapPin size={20} aria-hidden />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#64748b",
                  mb: 0.75,
                }}
              >
                {t("bookingLocationTitle")}
              </Typography>
              {customerName ? (
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                  {customerName}
                </Typography>
              ) : null}
              {customerPhone ? (
                <Typography sx={{ fontSize: 12, color: "#64748b", mt: 0.25 }}>
                  {t("contactNumber")}: {customerPhone}
                </Typography>
              ) : null}
              <Typography
                sx={{
                  fontSize: 13,
                  color: hasLocation ? "#14532d" : "#991b1b",
                  mt: 0.75,
                  lineHeight: 1.5,
                  wordBreak: "break-word",
                }}
              >
                {hasLocation ? serviceAddress : t("bookingLocationMissing")}
              </Typography>
            </Box>
          </Box>
          {allowChange ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold"
              onClick={() => setChangeOpen(true)}
            >
              {t("changeAddress")}
            </Button>
          ) : null}
        </Box>
      </Box>

      <Dialog
        open={changeOpen}
        onClose={() => setChangeOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
      >
        <Box
          sx={{
            background: "linear-gradient(135deg, #0f766e 0%, #0369a1 100%)",
            color: "#fff",
            px: 2.5,
            py: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.85 }}>
                {t("bookingLocationTitle")}
              </Typography>
              <Typography sx={{ fontSize: 18, fontWeight: 700, mt: 0.25, lineHeight: 1.3 }}>
                {t("changeBookingAddress")}
              </Typography>
              <Typography sx={{ fontSize: 13, mt: 0.75, opacity: 0.9, lineHeight: 1.45 }}>
                {t("changeBookingAddressHint")}
              </Typography>
            </Box>
            <IconButton
              aria-label="close"
              onClick={() => setChangeOpen(false)}
              className="!shrink-0 h-9 w-9 !rounded-lg !text-white hover:!bg-white/10"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <DialogContent sx={{ pt: 2.5, pb: 2 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.25, mb: 2.5 }}>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={detecting}
              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-sky-300 hover:bg-sky-50 disabled:opacity-60"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                {detecting ? <CircularProgress size={18} /> : <LocateFixed size={18} aria-hidden />}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-900">{t("detectLocation")}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                  {t("detectLocationDescription")}
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={handleOpenMap}
              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-violet-300 hover:bg-violet-50"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                <Navigation size={18} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-900">{t("pickOnMap")}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                  {t("pickOnMapDescription")}
                </span>
              </span>
            </button>
          </Box>

          <Divider sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {t("savedAddresses")}
            </Typography>
          </Divider>

          {loadingSaved ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : savedLocations.length === 0 ? (
            <Box
              sx={{
                py: 2.5,
                px: 2,
                borderRadius: 2,
                border: "1px dashed #cbd5e1",
                bgcolor: "#f8fafc",
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
                {t("noSavedAddresses")}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {savedLocations.map((saved) => {
                const Icon = savedLocationIcon(saved.name);
                const isSelected = locationsMatch(geoLocation, saved.location);
                const label = labelForSaved(saved.name);
                const addressLine = formatSavedLocationAddress(saved);

                return (
                  <button
                    key={`${saved.name}-${addressLine}`}
                    type="button"
                    onClick={() => handleSelectSaved(saved)}
                    className={`flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition ${
                      isSelected
                        ? "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200"
                        : "border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        isSelected ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Icon size={18} aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{label}</span>
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                            <Check size={10} aria-hidden />
                            {t("currentlySelectedAddress")}
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-slate-600 line-clamp-2">
                        {addressLine}
                      </span>
                    </span>
                  </button>
                );
              })}
            </Box>
          )}
        </DialogContent>

        <DialogActions className={dialogActionsClassName}>
          <Button type="button" variant="dialogCancel" onClick={() => setChangeOpen(false)}>
            {t("cancel")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={mapOpen}
        onClose={handleCloseMap}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
      >
        <Box
          sx={{
            background: "linear-gradient(135deg, #4c1d95 0%, #0369a1 100%)",
            color: "#fff",
            px: 2.5,
            py: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 18, fontWeight: 700, lineHeight: 1.3 }}>
                {t("pickOnMap")}
              </Typography>
              <Typography sx={{ fontSize: 13, mt: 0.5, opacity: 0.9 }}>
                {t("pickOnMapDescription")}
              </Typography>
            </Box>
            <IconButton
              aria-label="close"
              onClick={handleCloseMap}
              className="!shrink-0 h-9 w-9 !rounded-lg !text-white hover:!bg-white/10"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <DialogContent sx={{ p: 0 }}>
          <MapComponent
            style={{ width: "100%", height: 420 }}
            onLocationSelect={handleMapSelect}
          />
          {pendingMapSelection?.displayAddress ? (
            <Box sx={{ px: 2.5, py: 1.5, bgcolor: "#f0fdf4", borderTop: "1px solid #bbf7d0" }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#166534", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {t("currentlySelectedAddress")}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#14532d", mt: 0.5, lineHeight: 1.45 }}>
                {pendingMapSelection.displayAddress}
              </Typography>
            </Box>
          ) : null}
        </DialogContent>

        <DialogActions className={dialogActionsClassName}>
          <Button type="button" variant="dialogCancel" onClick={handleCloseMap}>
            {t("cancel")}
          </Button>
          <Button
            type="button"
            variant="cta"
            disabled={!pendingMapSelection}
            onClick={() => {
              if (pendingMapSelection) {
                applyLocation(pendingMapSelection.payload);
              }
            }}
          >
            {t("useThisAddress")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BookingLocationSection;
