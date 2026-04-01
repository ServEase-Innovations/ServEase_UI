/* eslint-disable */
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  Paper,
  Slider,
  IconButton,
  Alert,
  Tooltip,
} from "@mui/material";
import { AccessTime, Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { Button } from "src/components/Button/button";

interface TimeSlotSelectorProps {
  title: string;
  slots: number[][];
  minTime: number;
  maxTime: number;
  marks: { value: number; label: string }[];
  notAvailableMessage: string;
  addSlotMessage: string;
  slotLabel: string; // e.g., "Time Slot"
  addButtonLabel: string;
  clearButtonLabel: string;
  duplicateErrorKey: string; // translation key for duplicate error
  onAddSlot: () => void;
  onRemoveSlot: (index: number) => void;
  onClearSlots: () => void;
  onSlotChange: (index: number, newValue: number[]) => void;
  formatDisplayTime: (value: number) => string;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  title,
  slots,
  minTime,
  maxTime,
  marks,
  notAvailableMessage,
  addSlotMessage,
  slotLabel,
  addButtonLabel,
  clearButtonLabel,
  duplicateErrorKey,
  onAddSlot,
  onRemoveSlot,
  onClearSlots,
  onSlotChange,
  formatDisplayTime,
}) => {
  // Internal state to track duplicate errors per slot
  const [duplicateErrors, setDuplicateErrors] = useState<{
    [key: string]: boolean;
  }>({});

  // Reset errors when slots change (add/remove/clear)
  useEffect(() => {
    setDuplicateErrors({});
  }, [slots]);

  // Handler for slot change with duplicate check
  const handleSlotChange = (index: number, newValue: number[]) => {
    // Check if the same range already exists in any other slot
    const exists = slots.some(
      (slot, i) =>
        i !== index && slot[0] === newValue[0] && slot[1] === newValue[1]
    );
    if (exists) {
      setDuplicateErrors((prev) => ({ ...prev, [`slot-${index}`]: true }));
      return;
    }
    setDuplicateErrors((prev) => ({ ...prev, [`slot-${index}`]: false }));
    onSlotChange(index, newValue);
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header with title and action buttons */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            variant="h6"
            color="primary"
            sx={{ display: "flex", alignItems: "center", mr: 2 }}
          >
            <AccessTime sx={{ mr: 1 }} />
            {title}
          </Typography>
          <Chip
            label={
              slots.length === 0
                ? notAvailableMessage
                : `${slots.length} ${slotLabel}`
            }
            color={slots.length === 0 ? "default" : "primary"}
            size="small"
            variant={slots.length === 0 ? "outlined" : "filled"}
          />
        </Box>
        <Box>
          <Tooltip title={addSlotMessage}>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={onAddSlot}
              sx={{ borderRadius: 2, mr: 1 }}
            >
              {addButtonLabel}
            </Button>
          </Tooltip>
          {slots.length > 0 && (
            <Button
              variant="outlined"
              size="small"
              color="error"
              onClick={onClearSlots}
              sx={{ borderRadius: 2 }}
            >
              {clearButtonLabel}
            </Button>
          )}
        </Box>
      </Box>

      {/* No slots placeholder */}
      {slots.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 2,
            borderRadius: 2,
            bgcolor: "#f5f5f5",
            textAlign: "center",
            border: "2px dashed",
            borderColor: "grey.300",
          }}
        >
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {notAvailableMessage}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {addSlotMessage}
          </Typography>
        </Paper>
      ) : (
        // Render each slot
        slots.map((slot, index) => {
          const hasError = duplicateErrors[`slot-${index}`];
          return (
            <Paper
              key={`slot-${index}`}
              elevation={1}
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                position: "relative",
                bgcolor: "#fff",
                border: "1px solid",
                borderColor: "primary.light",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography variant="subtitle2" color="primary">
                  {slotLabel} {index + 1}
                </Typography>
                {slots.length > 1 && (
                  <IconButton
                    size="small"
                    onClick={() => onRemoveSlot(index)}
                    sx={{ color: "error.main" }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                Selected: {formatDisplayTime(slot[0])} - {formatDisplayTime(slot[1])}
              </Typography>

              <Box sx={{ px: 1, mt: 2 }}>
                <Slider
                  value={slot}
                  onChange={(_, newValue) =>
                    handleSlotChange(index, newValue as number[])
                  }
                  min={minTime}
                  max={maxTime}
                  step={0.5}
                  marks={marks}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => formatDisplayTime(value)}
                  getAriaValueText={(value) => formatDisplayTime(value)}
                  disableSwap={false}
                />
                {hasError && (
                  <Alert severity="error" sx={{ mt: 1, borderRadius: 1 }}>
                    {duplicateErrorKey}
                  </Alert>
                )}
              </Box>
            </Paper>
          );
        })
      )}
    </Box>
  );
};

export default TimeSlotSelector;