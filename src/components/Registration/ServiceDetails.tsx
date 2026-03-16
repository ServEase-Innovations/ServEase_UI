/* eslint-disable */

// components/Registration/ServiceDetails.tsx
import React, { useState } from "react";
import {
  Grid,
  Typography,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormHelperText,
  Paper,
  Box,
  TextField,
  Chip,
  Tooltip,
  IconButton,
  Fade,
  Alert,
  Autocomplete,
} from "@mui/material";
import {
  Home as HomeIcon,
  AccessTime,
  Add as AddIcon,
  Delete as DeleteIcon,
  Language as LanguageIcon,
} from "@mui/icons-material";
import { Button } from "../Button/button";

interface ServiceDetailsProps {
  formData: any;
  errors: any;
  isCookSelected: boolean;
  isNannySelected: boolean;
  morningSlots: number[][];
  eveningSlots: number[][];
  isFullTime: boolean;
  selectedTimeSlots: string;
  onServiceTypeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCookingSpecialityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNannyCareTypeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDietChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExperienceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReferralCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFullTimeToggle: (checked: boolean) => void;
  onAddMorningSlot: () => void;
  onRemoveMorningSlot: (index: number) => void;
  onClearMorningSlots: () => void;
  onAddEveningSlot: () => void;
  onRemoveEveningSlot: (index: number) => void;
  onClearEveningSlots: () => void;
  onMorningSlotChange: (index: number, newValue: number[]) => void;
  onEveningSlotChange: (index: number, newValue: number[]) => void;
  TimeSliderWithDisabledRanges: React.FC<any>;
  DisabledRangesIndicator: React.FC<any>;
  getDisabledRangesForSlot: (slots: number[][], currentIndex: number) => number[][];
  formatDisplayTime: (value: number) => string;
  // Add language props
  selectedLanguages?: string[];
  onLanguagesChange?: (languages: string[]) => void;
}

const ServiceDetails: React.FC<ServiceDetailsProps> = ({
  formData,
  errors,
  isCookSelected,
  isNannySelected,
  morningSlots,
  eveningSlots,
  isFullTime,
  selectedTimeSlots,
  onServiceTypeChange,
  onCookingSpecialityChange,
  onNannyCareTypeChange,
  onDietChange,
  onExperienceChange,
  onDescriptionChange,
  onReferralCodeChange,
  onFullTimeToggle,
  onAddMorningSlot,
  onRemoveMorningSlot,
  onClearMorningSlots,
  onAddEveningSlot,
  onRemoveEveningSlot,
  onClearEveningSlots,
  onMorningSlotChange,
  onEveningSlotChange,
  TimeSliderWithDisabledRanges,
  DisabledRangesIndicator,
  getDisabledRangesForSlot,
  formatDisplayTime,
  // Add language props with default values
  selectedLanguages = [],
  onLanguagesChange,
}) => {
  // Language selection state (only available languages, selected comes from props)
  const [availableLanguages] = useState<string[]>([
    "Assamese", "Bengali", "Gujarati", "Hindi", "Kannada", 
    "Kashmiri", "Marathi", "Malayalam", "Oriya", "Punjabi", 
    "Sanskrit", "Tamil", "Telugu", "Urdu", "Sindhi", 
    "Konkani", "Nepali", "Manipuri", "Bodo", "Dogri", 
    "Maithili", "Santhali", "English"
  ]);

  // Handler for language changes
  const handleLanguageChange = (event: any, newValue: string[]) => {
    if (onLanguagesChange) {
      onLanguagesChange(newValue);
    }
  };

  const serviceTypes = [
    { value: "COOK", label: "Cook" },
    { value: "NANNY", label: "Nanny"},
    { value: "MAID", label: "Maid" },
  ];

  const dietOptions = ["VEG", "NONVEG", "BOTH"];
  const nannyCareOptions = [
    { value: "BABY_CARE", label: "Baby Care" },
    { value: "ELDERLY_CARE", label: "Elderly Care" },
    { value: "BOTH", label: "Both" },
  ];

  return (
    <Grid container spacing={2}>
      {/* Combined Services Card */}
      <Grid item xs={12}>
        <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: '#f8f9fa' }}>
          <CardContent>
            <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <HomeIcon sx={{ mr: 1 }} />
              Service Details
            </Typography>
            
            <Grid container spacing={3}>
              {/* Service Type Selection - Now with clickable cards like diet section */}
              <Grid item xs={12}>
                <FormControl 
                  component="fieldset" 
                  error={!!errors.housekeepingRole}
                  required
                  fullWidth
                >
                  <FormLabel 
                    component="legend" 
                    sx={{ 
                      mb: 2,
                      '& .MuiFormLabel-asterisk': {
                        color: '#d32f2f',
                        fontSize: '1rem',
                        marginLeft: '2px'
                      }
                    }}
                  >
                    <Typography variant="body1" color="primary" fontWeight="bold" sx={{ fontSize: '0.95rem', display: 'inline' }}>
                      Select Service Type(s)
                    </Typography>
                  </FormLabel>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'row', 
                    gap: 2, 
                    flexWrap: 'wrap',
                    width: '100%',
                  }}>
                    {serviceTypes.map((service) => (
                      <Paper
                        key={service.value}
                        elevation={formData.housekeepingRole.includes(service.value) ? 2 : 0}
                        sx={{
                          p: 2,
                          px: 3,
                          borderRadius: 2,
                          bgcolor: formData.housekeepingRole.includes(service.value) ? '#e3f2fd' : '#fff',
                          border: '1px solid',
                          borderColor: formData.housekeepingRole.includes(service.value) ? '#1976d2' : '#e0e0e0',
                          transition: 'all 0.2s',
                          cursor: 'pointer',
                          flex: { xs: '1 1 auto', sm: '0 1 auto' },
                          minWidth: '155px',
                          textAlign: 'center',
                          '&:hover': {
                            borderColor: '#1976d2',
                            bgcolor: formData.housekeepingRole.includes(service.value) ? '#e3f2fd' : '#f5f5f5',
                          },
                        }}
                        onClick={() => {
                          const event = {
                            target: { value: service.value }
                          } as React.ChangeEvent<HTMLInputElement>;
                          onServiceTypeChange(event);
                        }}
                      >
                        <Box>
                          <Typography 
                            variant="body2" 
                            fontWeight={formData.housekeepingRole.includes(service.value) ? 'bold' : 'normal'}
                            color={formData.housekeepingRole.includes(service.value) ? '#1976d2' : 'text.primary'}
                            sx={{ mb: 0.5 }}
                          >
                            {service.label}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ fontSize: '0.7rem' }}
                          >
                        
                          </Typography>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                  
                  {errors.housekeepingRole && (
                    <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                      {errors.housekeepingRole}
                    </Alert>
                  )}
                </FormControl>
              </Grid>

              {/* Cooking Speciality - Only show when Cook is selected */}
              {isCookSelected && (
                <Grid item xs={12}>
                  <FormControl component="fieldset" error={!!errors.cookingSpeciality} required fullWidth>
                    <FormLabel 
                      component="legend" 
                      sx={{ 
                        mb: 1.5,
                        '& .MuiFormLabel-asterisk': {
                          color: '#d32f2f',
                          fontSize: '0.95rem',
                          marginLeft: '2px'
                        }
                      }}
                    >
                      <Typography variant="body1" color="primary" fontWeight="bold" sx={{ fontSize: '0.9rem', display: 'inline' }}>
                        Cooking Speciality
                      </Typography>
                    </FormLabel>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'row', 
                      gap: 2,
                      flexWrap: 'wrap',
                      width: '100%',
                    }}>
                      {['VEG', 'NONVEG', 'BOTH'].map((option) => (
                        <Paper
                          key={option}
                          elevation={formData.cookingSpeciality === option ? 2 : 0}
                          sx={{
                            p: 1.5,
                            px: 3,
                            borderRadius: 2,
                            bgcolor: formData.cookingSpeciality === option ? '#e3f2fd' : '#fff',
                            border: '1px solid',
                            borderColor: formData.cookingSpeciality === option ? '#1976d2' : '#e0e0e0',
                            transition: 'all 0.2s',
                            cursor: 'pointer',
                            flex: { xs: '1 1 auto', sm: '0 1 auto' },
                            minWidth: '100px',
                            textAlign: 'center',
                            '&:hover': {
                              borderColor: '#1976d2',
                              bgcolor: formData.cookingSpeciality === option ? '#e3f2fd' : '#f5f5f5',
                            },
                          }}
                          onClick={() => {
                            const event = {
                              target: { value: option, name: 'cookingSpeciality' }
                            } as React.ChangeEvent<HTMLInputElement>;
                            onCookingSpecialityChange(event);
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            fontWeight={formData.cookingSpeciality === option ? 'bold' : 'normal'}
                            color={formData.cookingSpeciality === option ? '#1976d2' : 'text.primary'}
                          >
                            {option === 'VEG' ? 'Veg' : 
                             option === 'NONVEG' ? 'Non-Veg' : 
                             'Both'}
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                    
                    {errors.cookingSpeciality && (
                      <FormHelperText error sx={{ mt: 1 }}>
                        {errors.cookingSpeciality}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              )}

              {/* Nanny Care Type - New section for Nanny */}
              {isNannySelected && (
                <Grid item xs={12}>
                  <FormControl component="fieldset" error={!!errors.nannyCareType} required fullWidth>
                    <FormLabel 
                      component="legend" 
                      sx={{ 
                        mb: 1.5,
                        '& .MuiFormLabel-asterisk': {
                          color: '#d32f2f',
                          fontSize: '0.95rem',
                          marginLeft: '2px'
                        }
                      }}
                    >
                      <Typography variant="body1" color="primary" fontWeight="bold" sx={{ fontSize: '0.9rem', display: 'inline' }}>
                        Care Type
                      </Typography>
                    </FormLabel>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'row', 
                      gap: 2,
                      flexWrap: 'wrap',
                      width: '100%',
                    }}>
                      {nannyCareOptions.map((option) => (
                        <Paper
                          key={option.value}
                          elevation={formData.nannyCareType === option.value ? 2 : 0}
                          sx={{
                            p: 1.5,
                            px: 3,
                            borderRadius: 2,
                            bgcolor: formData.nannyCareType === option.value ? '#e3f2fd' : '#fff',
                            border: '1px solid',
                            borderColor: formData.nannyCareType === option.value ? '#1976d2' : '#e0e0e0',
                            transition: 'all 0.2s',
                            cursor: 'pointer',
                            flex: { xs: '1 1 auto', sm: '0 1 auto' },
                            minWidth: '120px',
                            textAlign: 'center',
                            '&:hover': {
                              borderColor: '#1976d2',
                              bgcolor: formData.nannyCareType === option.value ? '#e3f2fd' : '#f5f5f5',
                            },
                          }}
                          onClick={() => {
                            const event = {
                              target: { value: option.value, name: 'nannyCareType' }
                            } as React.ChangeEvent<HTMLInputElement>;
                            onNannyCareTypeChange(event);
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            fontWeight={formData.nannyCareType === option.value ? 'bold' : 'normal'}
                            color={formData.nannyCareType === option.value ? '#1976d2' : 'text.primary'}
                          >
                            {option.label}
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                    
                    {errors.nannyCareType && (
                      <FormHelperText error sx={{ mt: 1 }}>
                        {errors.nannyCareType}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              )}

              {/* Diet Section */}
              <Grid item xs={12}>
                <FormControl component="fieldset" error={!!errors.diet} required fullWidth>
                  <FormLabel 
                    component="legend" 
                    sx={{ 
                      mb: 1.5,
                      '& .MuiFormLabel-asterisk': {
                        color: '#d32f2f',
                        fontSize: '0.95rem',
                        marginLeft: '2px'
                      }
                    }}
                    >
                      <Typography variant="body1" color="primary" fontWeight="bold" sx={{ fontSize: '0.9rem', display: 'inline' }}>
                        Diet Preference
                      </Typography>
                    </FormLabel>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'row', 
                      gap: 2,
                      flexWrap: 'wrap',
                      width: '100%',
                    }}>
                      {dietOptions.map((option) => (
                        <Paper
                          key={option}
                          elevation={formData.diet === option ? 2 : 0}
                          sx={{
                            p: 1.5,
                            px: 3,
                            borderRadius: 2,
                            bgcolor: formData.diet === option ? '#e3f2fd' : '#fff',
                            border: '1px solid',
                            borderColor: formData.diet === option ? '#1976d2' : '#e0e0e0',
                            transition: 'all 0.2s',
                            cursor: 'pointer',
                            flex: { xs: '1 1 auto', sm: '0 1 auto' },
                            minWidth: '100px',
                            textAlign: 'center',
                            '&:hover': {
                              borderColor: '#1976d2',
                              bgcolor: formData.diet === option ? '#e3f2fd' : '#f5f5f5',
                            },
                          }}
                          onClick={() => {
                            const event = {
                              target: { value: option, name: 'diet' }
                            } as React.ChangeEvent<HTMLInputElement>;
                            onDietChange(event);
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            fontWeight={formData.diet === option ? 'bold' : 'normal'}
                            color={formData.diet === option ? '#1976d2' : 'text.primary'}
                          >
                            {option === 'VEG' ? 'Veg' : 
                             option === 'NONVEG' ? 'Non-Veg' : 
                             'Both'}
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                    
                    {errors.diet && (
                      <FormHelperText error sx={{ mt: 1 }}>
                        {errors.diet}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      
      {/* Description Field */}
      <Grid item xs={12}>
        <TextField
          placeholder="Description"
          name="description"
          fullWidth
          value={formData.description}
          onChange={onDescriptionChange}
          multiline
          rows={3}
        />
      </Grid>

      {/* Language Selection Section */}
      <Grid item xs={12}>
        <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: '#f8f9fa' }}>
          <CardContent>
            <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <LanguageIcon sx={{ mr: 1 }} />
              Languages Spoken
            </Typography>
            
            <Autocomplete
              multiple
              options={availableLanguages}
              value={selectedLanguages}
              onChange={handleLanguageChange}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    size="small"
                    {...getTagProps({ index })}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select languages you speak"
                  helperText="You can select multiple languages or type your own"
                />
              )}
              sx={{
                '& .MuiAutocomplete-tag': {
                  bgcolor: '#e3f2fd',
                  color: '#1976d2',
                  borderRadius: 1.5,
                  '& .MuiChip-deleteIcon': {
                    color: '#1976d2',
                    '&:hover': {
                      color: '#1565c0'
                    }
                  }
                }
              }}
            />
            
            {/* Selected Languages Summary */}
            {selectedLanguages.length > 0 && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                <Typography variant="body2" color="primary" gutterBottom fontWeight="bold">
                  Selected Languages ({selectedLanguages.length}):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selectedLanguages.map((language, index) => (
                    <Chip
                      key={index}
                      label={language}
                      size="small"
                      onDelete={() => {
                        const newLanguages = selectedLanguages.filter((_, i) => i !== index);
                        if (onLanguagesChange) {
                          onLanguagesChange(newLanguages);
                        }
                      }}
                      sx={{
                        bgcolor: '#fff',
                        '& .MuiChip-deleteIcon': {
                          color: '#1976d2'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
      
      {/* Experience and Referral Code Fields */}
      <Grid item xs={12} sm={6}>
        <TextField
          placeholder="Experience *"
          name="experience"
          fullWidth
          required
          value={formData.experience}
          onChange={onExperienceChange}
          error={!!errors.experience}
          helperText={
            errors.experience ||
            "Years in business or relevant experience"
          }
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          placeholder="Referral Code (Optional)"
          name="referralCode"
          fullWidth
          value={formData.referralCode || ""}
          onChange={onReferralCodeChange}
        />
      </Grid>
      
      {/* Time slot section */}
      <Grid item xs={12}>
        <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: '#f8f9fa' }}>
          <CardContent>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend" sx={{ mb: 2 }}>
                <Typography variant="h6" color="primary">
                  Select Your Available Time Slots
                </Typography>
              </FormLabel>
              
              <FormGroup>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    bgcolor: isFullTime ? '#e3f2fd' : 'transparent',
                    borderRadius: 2,
                    transition: 'all 0.3s'
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isFullTime}
                        onChange={(e) => onFullTimeToggle(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Full Time Availability
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          6:00 AM - 8:00 PM (All slots covered)
                        </Typography>
                      </Box>
                    }
                    sx={{ width: '100%', m: 0 }}
                  />
                </Paper>

                {!isFullTime && (
                  <Fade in={!isFullTime}>
                    <Box>
                      {/* Morning Slots Section */}
                      <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                              <AccessTime sx={{ mr: 1 }} />
                              Morning Availability
                            </Typography>
                            <Chip 
                              label={morningSlots.length === 0 ? "Not Available" : `${morningSlots.length} slot(s)`}
                              color={morningSlots.length === 0 ? "default" : "primary"}
                              size="small"
                              variant={morningSlots.length === 0 ? "outlined" : "filled"}
                            />
                          </Box>
                          <Box>
                            {morningSlots.length > 0 && morningSlots.length < 12 && (
                              <Tooltip title="Add another morning time slot">
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<AddIcon />}
                                  onClick={onAddMorningSlot}
                                  sx={{ borderRadius: 2, mr: 1 }}
                                >
                                  Add Slot
                                </Button>
                              </Tooltip>
                            )}
                            {morningSlots.length === 0 ? (
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={onAddMorningSlot}
                                sx={{ borderRadius: 2 }}
                              >
                                Add Slots
                              </Button>
                            ) : (
                              <Button
                                variant="outlined"
                                size="small"
                                color="error"
                                onClick={onClearMorningSlots}
                                sx={{ borderRadius: 2 }}
                              >
                                Clear All
                              </Button>
                            )}
                          </Box>
                        </Box>

                        {morningSlots.length === 0 ? (
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              mb: 2,
                              borderRadius: 2,
                              bgcolor: '#f5f5f5',
                              textAlign: 'center',
                              border: '2px dashed',
                              borderColor: 'grey.300'
                            }}
                          >
                            <Typography variant="body1" color="text.secondary" gutterBottom>
                              Not available in the morning
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Click "Add Morning Slots" if you want to add morning availability
                            </Typography>
                          </Paper>
                        ) : (
                          morningSlots.map((slot, index) => {
                            const disabledRanges = getDisabledRangesForSlot(morningSlots, index);
                            
                            return (
                              <Paper
                                key={`morning-${index}`}
                                elevation={1}
                                sx={{
                                  p: 2,
                                  mb: 2,
                                  borderRadius: 2,
                                  position: 'relative',
                                  bgcolor: '#fff',
                                  border: '1px solid',
                                  borderColor: 'primary.light'
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="subtitle2" color="primary">
                                    Time Slot {index + 1}
                                  </Typography>
                                  {morningSlots.length > 1 && (
                                    <IconButton
                                      size="small"
                                      onClick={() => onRemoveMorningSlot(index)}
                                      sx={{ color: 'error.main' }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  )}
                                </Box>
                                
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Selected: {formatDisplayTime(slot[0])} - {formatDisplayTime(slot[1])}
                                </Typography>
                                
                                {disabledRanges.length > 0 && (
                                  <>
                                    <Typography variant="caption" color="warning.main" sx={{ display: 'block', mb: 1 }}>
                                      ⚠️ Gray areas are already selected in other slots
                                    </Typography>
                                    <DisabledRangesIndicator 
                                      ranges={disabledRanges}
                                      min={6}
                                      max={12}
                                    />
                                  </>
                                )}
                                
                                <Box sx={{ px: 1 }}>
                                  <TimeSliderWithDisabledRanges
                                    value={slot}
                                    onChange={(newValue) => onMorningSlotChange(index, newValue)}
                                    min={6}
                                    max={12}
                                    marks={[
                                      { value: 6, label: "6:00 AM" },
                                      { value: 8, label: "8:00 AM" },
                                      { value: 10, label: "10:00 AM" },
                                      { value: 12, label: "12:00 PM" },
                                    ]}
                                    disabledRanges={disabledRanges}
                                  />
                                </Box>
                              </Paper>
                            );
                          })
                        )}
                      </Box>

                      {/* Evening Slots Section */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                              <AccessTime sx={{ mr: 1 }} />
                              Evening Availability
                            </Typography>
                            <Chip 
                              label={eveningSlots.length === 0 ? "Not Available" : `${eveningSlots.length} slot(s)`}
                              color={eveningSlots.length === 0 ? "default" : "primary"}
                              size="small"
                              variant={eveningSlots.length === 0 ? "outlined" : "filled"}
                            />
                          </Box>
                          <Box>
                            {eveningSlots.length > 0 && eveningSlots.length < 16 && (
                              <Tooltip title="Add another evening time slot">
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<AddIcon />}
                                  onClick={onAddEveningSlot}
                                  sx={{ borderRadius: 2, mr: 1 }}
                                >
                                  Add Slot
                                </Button>
                              </Tooltip>
                            )}
                            {eveningSlots.length === 0 ? (
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={onAddEveningSlot}
                                sx={{ borderRadius: 2 }}
                              >
                                Add Slots
                              </Button>
                            ) : (
                              <Button
                                variant="outlined"
                                size="small"
                                color="error"
                                onClick={onClearEveningSlots}
                                sx={{ borderRadius: 2 }}
                              >
                                Clear All
                              </Button>
                            )}
                          </Box>
                        </Box>

                        {eveningSlots.length === 0 ? (
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              mb: 2,
                              borderRadius: 2,
                              bgcolor: '#f5f5f5',
                              textAlign: 'center',
                              border: '2px dashed',
                              borderColor: 'grey.300'
                            }}
                          >
                            <Typography variant="body1" color="text.secondary" gutterBottom>
                              Not available in the evening
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Click "Add Evening Slots" if you want to add evening availability
                            </Typography>
                          </Paper>
                        ) : (
                          eveningSlots.map((slot, index) => {
                            const disabledRanges = getDisabledRangesForSlot(eveningSlots, index);
                            
                            return (
                              <Paper
                                key={`evening-${index}`}
                                elevation={1}
                                sx={{
                                  p: 2,
                                  mb: 2,
                                  borderRadius: 2,
                                  position: 'relative',
                                  bgcolor: '#fff',
                                  border: '1px solid',
                                  borderColor: 'primary.light'
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="subtitle2" color="primary">
                                    Time Slot {index + 1}
                                  </Typography>
                                  {eveningSlots.length > 1 && (
                                    <IconButton
                                      size="small"
                                      onClick={() => onRemoveEveningSlot(index)}
                                      sx={{ color: 'error.main' }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  )}
                                </Box>
                                
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Selected: {formatDisplayTime(slot[0])} - {formatDisplayTime(slot[1])}
                                </Typography>
                                
                                {disabledRanges.length > 0 && (
                                  <>
                                    <Typography variant="caption" color="warning.main" sx={{ display: 'block', mb: 1 }}>
                                      ⚠️ Gray areas are already selected in other slots
                                    </Typography>
                                    <DisabledRangesIndicator 
                                      ranges={disabledRanges}
                                      min={12}
                                      max={20}
                                    />
                                  </>
                                )}
                                
                                <Box sx={{ px: 1 }}>
                                  <TimeSliderWithDisabledRanges
                                    value={slot}
                                    onChange={(newValue) => onEveningSlotChange(index, newValue)}
                                    min={12}
                                    max={20}
                                    marks={[
                                      { value: 12, label: "12:00 PM" },
                                      { value: 14, label: "2:00 PM" },
                                      { value: 16, label: "4:00 PM" },
                                      { value: 18, label: "6:00 PM" },
                                      { value: 20, label: "8:00 PM" },
                                    ]}
                                    disabledRanges={disabledRanges}
                                  />
                                </Box>
                              </Paper>
                            );
                          })
                        )}
                      </Box>

                      {/* Summary Card */}
                      {selectedTimeSlots && (
                        <Paper
                          elevation={3}
                          sx={{
                            mt: 3,
                            p: 2,
                            borderRadius: 2,
                            bgcolor: '#e3f2fd',
                            color: '#1976d2',
                            border: '1px solid #90caf9'
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Your Selected Time Slots:
                          </Typography>
                          <Typography variant="body1">
                            {selectedTimeSlots}
                          </Typography>
                        </Paper>
                      )}
                    </Box>
                  </Fade>
                )}
              </FormGroup>
            </FormControl>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ServiceDetails;