/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Slider,
  FormGroup,
  Chip,
  Button,
  Divider,
  Stack,
  IconButton,
  Rating,
  Select,
  MenuItem,
  OutlinedInput,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';

interface FilterProps {
  open: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterCriteria) => void;
  initialFilters?: FilterCriteria;
}

export interface FilterCriteria {
  experience: number[];
  rating: number | null;
  gender: string[];
  diet: string[];
  language: string[];
  distance: number[];
  availability: string[];
}

const FilterSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

// Language options - expanded list
const LANGUAGES = [
  'English', 'Hindi', 'Bengali', 'Telugu', 'Tamil', 
  'Kannada', 'Malayalam', 'Marathi', 'Gujarati', 'Punjabi',
  'Odia', 'Assamese', 'Urdu', 'Sanskrit', 'Nepali',
  'French', 'German', 'Spanish', 'Arabic', 'Japanese',
  'Chinese', 'Russian', 'Portuguese', 'Italian', 'Dutch'
];

const dietOptions = ['VEG', 'NONVEG', 'BOTH'];
const genderOptions = ['MALE', 'FEMALE', 'OTHER'];
const availabilityOptions = ['Fully Available', 'Partially Available', 'Limited'];

const ProviderFilter: React.FC<FilterProps> = ({
  open,
  onClose,
  onApplyFilters,
  initialFilters
}) => {
  const [filters, setFilters] = useState<FilterCriteria>(
    initialFilters || {
      experience: [0, 30],
      rating: null,
      gender: [],
      diet: [],
      language: [],
      distance: [0, 50],
      availability: []
    }
  );

  const [tempFilters, setTempFilters] = useState<FilterCriteria>(filters);

  const handleGenderChange = (gender: string) => {
    setTempFilters(prev => ({
      ...prev,
      gender: prev.gender.includes(gender)
        ? prev.gender.filter(g => g !== gender)
        : [...prev.gender, gender]
    }));
  };

  const handleDietChange = (diet: string) => {
    setTempFilters(prev => ({
      ...prev,
      diet: prev.diet.includes(diet)
        ? prev.diet.filter(d => d !== diet)
        : [...prev.diet, diet]
    }));
  };

  const handleAvailabilityChange = (status: string) => {
    setTempFilters(prev => ({
      ...prev,
      availability: prev.availability.includes(status)
        ? prev.availability.filter(a => a !== status)
        : [...prev.availability, status]
    }));
  };

  // New handler for language dropdown (multi-select)
  const handleLanguageChange = (event: SelectChangeEvent<typeof tempFilters.language>) => {
    const { value } = event.target;
    setTempFilters(prev => ({
      ...prev,
      language: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleApply = () => {
    setFilters(tempFilters);
    onApplyFilters(tempFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      experience: [0, 30],
      rating: null,
      gender: [],
      diet: [],
      language: [],
      distance: [0, 50],
      availability: []
    };
    setTempFilters(resetFilters);
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  // Helper function to render selected chips in dropdown
  const renderLanguageChips = (selected: string[]) => {
    if (selected.length === 0) {
      return <em>Select languages</em>;
    }
    
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {selected.map((lang) => (
          <Chip
            key={lang}
            label={lang}
            size="small"
            onDelete={() => {
              setTempFilters(prev => ({
                ...prev,
                language: prev.language.filter(l => l !== lang)
              }));
            }}
            onMouseDown={(e) => e.stopPropagation()}
          />
        ))}
      </Box>
    );
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          p: 3,
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Filter Providers
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ height: 'calc(100vh - 200px)', overflowY: 'auto', pr: 1 }}>
        {/* Experience Filter */}
        <FilterSection>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Experience (years)
          </Typography>
          <Box sx={{ px: 1 }}>
            <Slider
              value={tempFilters.experience}
              onChange={(_, newValue) => setTempFilters(prev => ({ ...prev, experience: newValue as number[] }))}
              valueLabelDisplay="auto"
              min={0}
              max={30}
              marks={[
                { value: 0, label: '0' },
                { value: 10, label: '10' },
                { value: 20, label: '20' },
                { value: 30, label: '30' }
              ]}
            />
          </Box>
        </FilterSection>

        {/* Rating Filter */}
        <FilterSection>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Minimum Rating
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Rating
              value={tempFilters.rating}
              onChange={(_, newValue) => setTempFilters(prev => ({ ...prev, rating: newValue }))}
              precision={0.5}
            />
            {tempFilters.rating && (
              <Chip
                label={`${tempFilters.rating}+`}
                size="small"
                onDelete={() => setTempFilters(prev => ({ ...prev, rating: null }))}
              />
            )}
          </Box>
        </FilterSection>

        {/* Distance Filter */}
        <FilterSection>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Distance (km)
          </Typography>
          <Box sx={{ px: 1 }}>
            <Slider
              value={tempFilters.distance}
              onChange={(_, newValue) => setTempFilters(prev => ({ ...prev, distance: newValue as number[] }))}
              valueLabelDisplay="auto"
              min={0}
              max={50}
              marks={[
                { value: 0, label: '0' },
                { value: 10, label: '10' },
                { value: 25, label: '25' },
                { value: 50, label: '50' }
              ]}
            />
          </Box>
        </FilterSection>

        {/* Gender Filter */}
        <FilterSection>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Gender
          </Typography>
          <FormGroup>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {genderOptions.map(gender => (
                <Chip
                  key={gender}
                  label={gender}
                  clickable
                  color={tempFilters.gender.includes(gender) ? 'primary' : 'default'}
                  onClick={() => handleGenderChange(gender)}
                  variant={tempFilters.gender.includes(gender) ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
          </FormGroup>
        </FilterSection>

        {/* Diet Filter */}
        <FilterSection>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Diet Preference
          </Typography>
          <FormGroup>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {dietOptions.map(diet => (
                <Chip
                  key={diet}
                  label={diet}
                  clickable
                  color={tempFilters.diet.includes(diet) ? 'primary' : 'default'}
                  onClick={() => handleDietChange(diet)}
                  variant={tempFilters.diet.includes(diet) ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
          </FormGroup>
        </FilterSection>

        {/* Language Filter - Dropdown */}
        <FilterSection>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Languages
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel id="language-select-label">Select Languages</InputLabel>
            <Select
              labelId="language-select-label"
              multiple
              value={tempFilters.language}
              onChange={handleLanguageChange}
              input={<OutlinedInput label="Select Languages" />}
              renderValue={renderLanguageChips}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                    width: 250,
                  },
                },
              }}
            >
              {LANGUAGES.map((language) => (
                <MenuItem key={language} value={language}>
                  {language}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {tempFilters.language.length > 0 && (
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                size="small" 
                onClick={() => setTempFilters(prev => ({ ...prev, language: [] }))}
                sx={{ textTransform: 'none' }}
              >
                Clear languages
              </Button>
            </Box>
          )}
        </FilterSection>

        {/* Availability Filter */}
        <FilterSection>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Availability Status
          </Typography>
          <FormGroup>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {availabilityOptions.map(status => (
                <Chip
                  key={status}
                  label={status}
                  clickable
                  color={tempFilters.availability.includes(status) ? 'primary' : 'default'}
                  onClick={() => handleAvailabilityChange(status)}
                  variant={tempFilters.availability.includes(status) ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
          </FormGroup>
        </FilterSection>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={handleReset}
        >
          Reset All
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={handleApply}
        >
          Apply Filters
        </Button>
      </Box>
    </Drawer>
  );
};

export default ProviderFilter;