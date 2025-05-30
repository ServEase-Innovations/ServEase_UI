/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState } from "react";
import { Autocomplete, TextField, Chip, Grid } from "@mui/material";

interface ChipInputProps {
  options: string[]; // List of dropdown options
  onChange: (selectedValues: string[]) => void; // Function to handle changes
  label?: string; // Optional label
  placeholder?: string; // Optional placeholder
}

const ChipInput: React.FC<ChipInputProps> = ({
  options,
  onChange,
  label = "Pick Your Chips",
  placeholder = "Type or select...",
}) => {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  const handleSelectionChange = (event: any, newValue: string[]) => {
    setSelectedLanguages(newValue);
    onChange(newValue); // Pass selected values to the parent component
  };

  return (
    <Grid container spacing={2} style={{ padding: "16px" }}>
      <Grid item xs={12}>
        <Autocomplete
          multiple
          id="chip-input-autocomplete"
          options={options} // Receive options dynamically
          value={selectedLanguages}
          onChange={handleSelectionChange}
          freeSolo
          renderTags={(value: readonly string[], getTagProps) =>
            value.map((option: string, index: number) => (
              <Chip
              variant="outlined"
              label={option}
              {...getTagProps({ index })} // This includes a unique `key`
              style={{
                margin: "5px",
                fontSize: "14px",
              }}
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label={label}
              placeholder={placeholder}
              InputProps={{
                ...params.InputProps,
                style: {
                  height: "auto",
                  minHeight: "60px",
                  padding: "10px",
                },
              }}
              style={{
                width: "100%",
              }}
            />
          )}
          style={{
            width: "100%",
            minHeight: "60px",
            padding: "8px",
          }}
        />
      </Grid>
    </Grid>
  );
};

export default ChipInput;
 