import { IconButton } from "src/components/Button/icon-button";
import React, { useEffect, useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  Slider,
  Chip,
  Button,
  Stack,
  Rating,
  Autocomplete,
  TextField,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useLanguage } from "src/context/LanguageContext";

interface FilterProps {
  open: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterCriteria) => void;
  initialFilters?: FilterCriteria;
}

export interface FilterCriteria {
  experience: number[];
  rating: number | null;
  gender: string | null;
  diet: string | null;
  language: string[];
  distance: number[];
  availability: string[];
}

const DrawerHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  padding: theme.spacing(2.5, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  background: "linear-gradient(135deg, #0369a1 0%, #0f172a 55%, #0f172a 100%)",
  color: "#f8fafc",
  flexShrink: 0,
}));

const FilterSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const LANGUAGES = [
  "English",
  "Hindi",
  "Bengali",
  "Telugu",
  "Tamil",
  "Kannada",
  "Malayalam",
  "Marathi",
  "Gujarati",
  "Punjabi",
  "Odia",
  "Assamese",
  "Urdu",
  "Sanskrit",
  "Nepali",
  "French",
  "German",
  "Spanish",
  "Arabic",
  "Japanese",
  "Chinese",
  "Russian",
  "Portuguese",
  "Italian",
  "Dutch",
];

const DEFAULT_FILTERS: FilterCriteria = {
  experience: [0, 30],
  rating: null,
  gender: null,
  diet: null,
  language: [],
  distance: [0, 50],
  availability: [],
};

const GENDER_OPTIONS = [
  { value: "MALE", labelKey: "male" },
  { value: "FEMALE", labelKey: "female" },
  { value: "OTHER", labelKey: "other" },
] as const;

const DIET_OPTIONS = [
  { value: "VEG", labelKey: "veg" },
  { value: "NONVEG", labelKey: "nonVeg" },
  { value: "BOTH", labelKey: "both" },
] as const;

const AVAILABILITY_OPTIONS = [
  { value: "Fully Available", labelKey: "fullyAvailable" },
  { value: "Partially Available", labelKey: "partiallyAvailable" },
  { value: "Limited", labelKey: "filterLimited" },
] as const;

const ProviderFilter: React.FC<FilterProps> = ({
  open,
  onClose,
  onApplyFilters,
  initialFilters,
}) => {
  const { t } = useLanguage();
  const [filters, setFilters] = useState<FilterCriteria>(
    initialFilters || DEFAULT_FILTERS
  );
  const [tempFilters, setTempFilters] = useState<FilterCriteria>(filters);

  useEffect(() => {
    if (open) {
      const next = initialFilters || filters;
      setTempFilters(next);
    }
  }, [open, initialFilters, filters]);

  const toggleSingle = (
    field: "gender" | "diet",
    value: string
  ) => {
    setTempFilters((prev) => ({
      ...prev,
      [field]: prev[field] === value ? null : value,
    }));
  };

  const toggleAvailability = (status: string) => {
    setTempFilters((prev) => ({
      ...prev,
      availability: prev.availability.includes(status)
        ? prev.availability.filter((a) => a !== status)
        : [...prev.availability, status],
    }));
  };

  const handleApply = () => {
    setFilters(tempFilters);
    onApplyFilters(tempFilters);
    onClose();
  };

  const handleReset = () => {
    setTempFilters(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
    onApplyFilters(DEFAULT_FILTERS);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{ zIndex: 10001 }}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 420 },
          display: "flex",
          flexDirection: "column",
          maxHeight: "100dvh",
        },
      }}
    >
      <DrawerHeader>
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ color: "inherit" }}>
            <FilterListIcon
              sx={{ mr: 1, verticalAlign: "middle", fontSize: 22 }}
            />
            {t("filterProviders")}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          aria-label={t("close")}
          className="-mt-0.5 shrink-0 text-slate-50 opacity-100 hover:bg-white/15 hover:text-white"
        >
          <CloseIcon sx={{ fontSize: 22, opacity: 1 }} />
        </IconButton>
      </DrawerHeader>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 3,
          py: 2.5,
          WebkitOverflowScrolling: "touch",
        }}
      >
        <FilterSection>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            {t("filterExperienceYears")}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
            {t("filterRangeSummary", {
              min: tempFilters.experience[0],
              max: tempFilters.experience[1],
              unit: t("filterYearsUnit"),
            })}
          </Typography>
          <Box sx={{ px: 0.5 }}>
            <Slider
              value={tempFilters.experience}
              onChange={(_, newValue) =>
                setTempFilters((prev) => ({
                  ...prev,
                  experience: newValue as number[],
                }))
              }
              valueLabelDisplay="auto"
              min={0}
              max={30}
              step={1}
            />
          </Box>
        </FilterSection>

        <FilterSection>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            {t("filterMinimumRating")}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
            <Rating
              value={tempFilters.rating ?? 0}
              onChange={(_, newValue) =>
                setTempFilters((prev) => ({
                  ...prev,
                  rating: newValue || null,
                }))
              }
              precision={0.5}
              size="large"
            />
            <Typography variant="body2" color="text.secondary">
              {tempFilters.rating
                ? t("filterRatingSelected", { rating: tempFilters.rating })
                : t("filterRatingAny")}
            </Typography>
            {tempFilters.rating != null && (
              <Button
                size="small"
                variant="text"
                onClick={() =>
                  setTempFilters((prev) => ({ ...prev, rating: null }))
                }
              >
                {t("detailsClearFilters")}
              </Button>
            )}
          </Stack>
        </FilterSection>

        <FilterSection>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            {t("filterDistanceKm")}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
            {t("filterRangeSummary", {
              min: tempFilters.distance[0],
              max: tempFilters.distance[1],
              unit: t("filterKmUnit"),
            })}
          </Typography>
          <Box sx={{ px: 0.5 }}>
            <Slider
              value={tempFilters.distance}
              onChange={(_, newValue) =>
                setTempFilters((prev) => ({
                  ...prev,
                  distance: newValue as number[],
                }))
              }
              valueLabelDisplay="auto"
              min={0}
              max={50}
              step={1}
            />
          </Box>
        </FilterSection>

        <FilterSection>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            {t("genderLabel").trim()}
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {GENDER_OPTIONS.map(({ value, labelKey }) => (
              <Chip
                key={value}
                label={t(labelKey)}
                clickable
                color={tempFilters.gender === value ? "primary" : "default"}
                variant={tempFilters.gender === value ? "filled" : "outlined"}
                onClick={() => toggleSingle("gender", value)}
              />
            ))}
          </Stack>
        </FilterSection>

        <FilterSection>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            {t("dietPreference")}
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {DIET_OPTIONS.map(({ value, labelKey }) => (
              <Chip
                key={value}
                label={t(labelKey)}
                clickable
                color={tempFilters.diet === value ? "primary" : "default"}
                variant={tempFilters.diet === value ? "filled" : "outlined"}
                onClick={() => toggleSingle("diet", value)}
              />
            ))}
          </Stack>
        </FilterSection>

        <FilterSection>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            {t("languagesSpoken")}
          </Typography>
          <Autocomplete
            multiple
            options={LANGUAGES}
            value={tempFilters.language}
            onChange={(_, newValue) =>
              setTempFilters((prev) => ({ ...prev, language: newValue }))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder={t("filterSelectLanguages")}
                size="small"
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option}
                  size="small"
                  {...getTagProps({ index })}
                />
              ))
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                padding: "6px 8px",
                minHeight: 48,
                alignItems: "flex-start",
              },
            }}
            ListboxProps={{ style: { maxHeight: 280 } }}
          />
          {tempFilters.language.length > 0 && (
            <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
              <Button
                size="small"
                onClick={() =>
                  setTempFilters((prev) => ({ ...prev, language: [] }))
                }
              >
                {t("filterClearLanguages")}
              </Button>
            </Box>
          )}
        </FilterSection>

        <FilterSection sx={{ mb: 0 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            {t("filterAvailabilityStatus")}
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {AVAILABILITY_OPTIONS.map(({ value, labelKey }) => (
              <Chip
                key={value}
                label={t(labelKey)}
                clickable
                color={
                  tempFilters.availability.includes(value) ? "primary" : "default"
                }
                variant={
                  tempFilters.availability.includes(value) ? "filled" : "outlined"
                }
                onClick={() => toggleAvailability(value)}
              />
            ))}
          </Stack>
        </FilterSection>
      </Box>

      <Box
        sx={{
          flexShrink: 0,
          px: 3,
          py: 2,
          pb: "max(16px, env(safe-area-inset-bottom))",
          borderTop: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          boxShadow: "0 -6px 20px rgba(15, 23, 42, 0.08)",
          display: "flex",
          gap: 1.5,
        }}
      >
        <Button
          fullWidth
          variant="outlined"
          onClick={handleReset}
          sx={{ minHeight: 48, textTransform: "none", fontWeight: 600 }}
        >
          {t("filterResetAll")}
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={handleApply}
          sx={{ minHeight: 48, textTransform: "none", fontWeight: 600 }}
        >
          {t("filterApplyFilters")}
        </Button>
      </Box>
    </Drawer>
  );
};

export default ProviderFilter;
