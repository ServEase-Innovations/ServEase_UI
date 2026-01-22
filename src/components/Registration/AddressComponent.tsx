/* eslint-disable */
import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
  Collapse,
  IconButton,
  CircularProgress,
  Autocomplete,
  FormControl,
  FormHelperText,
} from '@mui/material';
import {
  Home as HomeIcon,
  LocationOn as LocationIcon,
  ContentCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import axios from 'axios';

export interface AddressData {
  apartment: string;
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

interface AddressComponentProps {
  onAddressChange: (type: 'permanent' | 'correspondence', data: AddressData) => void;
  permanentAddress: AddressData;
  correspondenceAddress: AddressData;
  errors?: {
    permanent?: Partial<AddressData>;
    correspondence?: Partial<AddressData>;
  };
}

interface Country {
  country: string;
  iso2: string;
  iso3: string;
}

interface State {
  name: string;
  state_code?: string;
}

// CountryStateService for API calls
class CountryStateService {
  private cachedCountries: Country[] = [];
  private cachedStates: Map<string, State[]> = new Map();
  private BASE_URL = 'https://countriesnow.space/api/v0.1';

  // Get all countries
  async getAllCountries(): Promise<Country[]> {
    if (this.cachedCountries.length > 0) {
      return this.cachedCountries;
    }

    try {
      const response = await axios.get(`${this.BASE_URL}/countries`);
      this.cachedCountries = response.data.data || [];
      
      // Sort countries alphabetically
      this.cachedCountries.sort((a, b) => a.country.localeCompare(b.country));
      
      return this.cachedCountries;
    } catch (error) {
      console.error('Error fetching countries:', error);
      return this.getFallbackCountries();
    }
  }

  // Get states for a specific country
  async getStatesByCountry(countryName: string): Promise<State[]> {
    if (this.cachedStates.has(countryName)) {
      return this.cachedStates.get(countryName) || [];
    }

    try {
      const response = await axios.post(`${this.BASE_URL}/countries/states`, {
        country: countryName
      });
      
      const states = response.data.data?.states || [];
      this.cachedStates.set(countryName, states);
      return states;
    } catch (error) {
      console.error(`Error fetching states for ${countryName}:`, error);
      return [];
    }
  }

  // Get popular countries (put them at the top)
  async getCountriesWithPopularFirst(): Promise<Country[]> {
    const allCountries = await this.getAllCountries();
    const popularCountries = [
      'India', 'United States', 'United Kingdom', 'Canada', 
      'Australia', 'Germany', 'France', 'Japan', 'Singapore'
    ];
    
    const popular = allCountries.filter(c => 
      popularCountries.includes(c.country)
    ).sort((a, b) => 
      popularCountries.indexOf(a.country) - popularCountries.indexOf(b.country)
    );
    
    const others = allCountries.filter(c => 
      !popularCountries.includes(c.country)
    );
    
    return [...popular, ...others];
  }

  // Fallback countries in case API fails
  getFallbackCountries(): Country[] {
    return [
      { country: 'India', iso2: 'IN', iso3: 'IND' },
      { country: 'United States', iso2: 'US', iso3: 'USA' },
      { country: 'United Kingdom', iso2: 'GB', iso3: 'GBR' },
      { country: 'Canada', iso2: 'CA', iso3: 'CAN' },
      { country: 'Australia', iso2: 'AU', iso3: 'AUS' },
      { country: 'Germany', iso2: 'DE', iso3: 'DEU' },
      { country: 'France', iso2: 'FR', iso3: 'FRA' },
      { country: 'Japan', iso2: 'JP', iso3: 'JPN' },
      { country: 'Singapore', iso2: 'SG', iso3: 'SGP' },
      { country: 'United Arab Emirates', iso2: 'AE', iso3: 'ARE' },
    ];
  }
}

const countryStateService = new CountryStateService();

const AddressComponent: React.FC<AddressComponentProps> = ({
  onAddressChange,
  permanentAddress,
  correspondenceAddress,
  errors = {}
}) => {
  const [isSameAddress, setIsSameAddress] = useState(false);
  const [showPincodeHelp, setShowPincodeHelp] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [permanentStates, setPermanentStates] = useState<State[]>([]);
  const [correspondenceStates, setCorrespondenceStates] = useState<State[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingPermanentStates, setLoadingPermanentStates] = useState(false);
  const [loadingCorrespondenceStates, setLoadingCorrespondenceStates] = useState(false);
  const [apiError, setApiError] = useState<string>('');

  // Load countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      setLoadingCountries(true);
      setApiError('');
      try {
        const data = await countryStateService.getCountriesWithPopularFirst();
        setCountries(data);
      } catch (error) {
        console.error('Failed to load countries:', error);
        setApiError('Failed to load countries. Using default list.');
        const fallback = countryStateService.getFallbackCountries();
        setCountries(fallback);
      } finally {
        setLoadingCountries(false);
      }
    };

    loadCountries();
  }, []);

  // Load states for permanent address when country changes
  useEffect(() => {
    const loadStates = async () => {
      if (!permanentAddress.country) {
        setPermanentStates([]);
        return;
      }

      setLoadingPermanentStates(true);
      try {
        const data = await countryStateService.getStatesByCountry(permanentAddress.country);
        setPermanentStates(data);
        // If there's only one state, auto-select it
        if (data.length === 1 && !permanentAddress.state) {
          handlePermanentAddressChange('state', data[0].name);
        }
      } catch (error) {
        console.error(`Failed to load states for ${permanentAddress.country}:`, error);
        setPermanentStates([]);
      } finally {
        setLoadingPermanentStates(false);
      }
    };

    loadStates();
  }, [permanentAddress.country]);

  // Load states for correspondence address when country changes
  useEffect(() => {
    const loadStates = async () => {
      if (!correspondenceAddress.country) {
        setCorrespondenceStates([]);
        return;
      }

      setLoadingCorrespondenceStates(true);
      try {
        const data = await countryStateService.getStatesByCountry(correspondenceAddress.country);
        setCorrespondenceStates(data);
        // If there's only one state, auto-select it
        if (data.length === 1 && !correspondenceAddress.state && !isSameAddress) {
          handleCorrespondenceAddressChange('state', data[0].name);
        }
      } catch (error) {
        console.error(`Failed to load states for ${correspondenceAddress.country}:`, error);
        setCorrespondenceStates([]);
      } finally {
        setLoadingCorrespondenceStates(false);
      }
    };

    if (!isSameAddress) {
      loadStates();
    }
  }, [correspondenceAddress.country, isSameAddress]);

  // Handle permanent address field changes
  const handlePermanentAddressChange = (field: keyof AddressData, value: string) => {
    const newAddress = { ...permanentAddress, [field]: value };
    onAddressChange('permanent', newAddress);

    if (isSameAddress) {
      onAddressChange('correspondence', newAddress);
    }
  };

  // Handle country and state changes for permanent address
  const handlePermanentCountryChange = (selectedCountry: string) => {
    const newAddress = { 
      ...permanentAddress, 
      country: selectedCountry,
      state: '' // Clear state when country changes
    };
    onAddressChange('permanent', newAddress);

    if (isSameAddress) {
      onAddressChange('correspondence', newAddress);
    }
  };

  const handlePermanentStateChange = (selectedState: string) => {
    const newAddress = { ...permanentAddress, state: selectedState };
    onAddressChange('permanent', newAddress);

    if (isSameAddress) {
      onAddressChange('correspondence', newAddress);
    }
  };

  // Handle correspondence address field changes
  const handleCorrespondenceAddressChange = (field: keyof AddressData, value: string) => {
    const newAddress = { ...correspondenceAddress, [field]: value };
    onAddressChange('correspondence', newAddress);
  };

  // Handle country and state changes for correspondence address
  const handleCorrespondenceCountryChange = (selectedCountry: string) => {
    const newAddress = { 
      ...correspondenceAddress, 
      country: selectedCountry,
      state: '' // Clear state when country changes
    };
    onAddressChange('correspondence', newAddress);
  };

  const handleCorrespondenceStateChange = (selectedState: string) => {
    handleCorrespondenceAddressChange('state', selectedState);
  };

  const handleSameAddressToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setIsSameAddress(checked);

    if (checked) {
      // Copy permanent → correspondence
      onAddressChange('correspondence', permanentAddress);
    }
  };

  // Get current country object for Autocomplete
  const getCountryValue = (countryName: string): Country | null => {
    if (!countryName) return null;
    return countries.find(c => c.country === countryName) || null;
  };

  // Get current state object for Autocomplete
  const getStateValue = (stateName: string, statesList: State[]): State | null => {
    if (!stateName) return null;
    return statesList.find(s => s.name === stateName) || null;
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {apiError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {apiError}
        </Alert>
      )}

      {/* Permanent Address Card */}
      <Card 
        variant="outlined" 
        sx={{ 
          mb: 4, 
          borderColor: errors.permanent ? 'error.main' : 'divider',
          borderWidth: errors.permanent ? 2 : 1,
          borderRadius: 2,
          boxShadow: errors.permanent ? '0 0 0 1px #f44336' : 'none'
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <HomeIcon color="primary" sx={{ mr: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Permanent Address *
            </Typography>
          </Box>
          
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Apartment/Flat Name or Number *"
                fullWidth
                value={permanentAddress.apartment}
                onChange={(e) => handlePermanentAddressChange('apartment', e.target.value)}
                error={!!errors.permanent?.apartment}
                helperText={errors.permanent?.apartment }
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Street Name/Locality *"
                fullWidth
                value={permanentAddress.street}
                onChange={(e) => handlePermanentAddressChange('street', e.target.value)}
                error={!!errors.permanent?.street}
                helperText={errors.permanent?.street}
                variant="outlined"
                size="small"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="City *"
                fullWidth
                value={permanentAddress.city}
                onChange={(e) => handlePermanentAddressChange('city', e.target.value)}
                error={!!errors.permanent?.city}
                helperText={errors.permanent?.city}
                variant="outlined"
                size="small"
              />
            </Grid>
            
            {/* Country Select for Permanent Address */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.permanent?.country} required>
                <Autocomplete
                  value={getCountryValue(permanentAddress.country)}
                  onChange={(event, newValue) => {
                    handlePermanentCountryChange(newValue?.country || '');
                  }}
                  options={countries}
                  getOptionLabel={(option) => option.country}
                  loading={loadingCountries}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Country *"
                      error={!!errors.permanent?.country}
                      helperText={errors.permanent?.country}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingCountries ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} key={option.iso2}>
                      <Typography>{option.country}</Typography>
                    </li>
                  )}
                  isOptionEqualToValue={(option, value) => 
                    option.country === value?.country
                  }
                />
              </FormControl>
            </Grid>
            
            {/* State Select for Permanent Address */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.permanent?.state} required>
                <Autocomplete
                  value={getStateValue(permanentAddress.state, permanentStates)}
                  onChange={(event, newValue) => {
                    handlePermanentStateChange(newValue?.name || '');
                  }}
                  options={permanentStates}
                  getOptionLabel={(option) => option.name}
                  loading={loadingPermanentStates}
                  disabled={!permanentAddress.country}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="State *"
                      error={!!errors.permanent?.state}
                      helperText={errors.permanent?.state || (permanentAddress.country && !permanentStates.length ? "No states available for this country" : "")}
                      placeholder={permanentAddress.country ? "Select state" : "Select country first"}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingPermanentStates ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} key={option.name}>
                      <Typography>{option.name}</Typography>
                    </li>
                  )}
                  isOptionEqualToValue={(option, value) => 
                    option.name === value?.name
                  }
                />
                {!permanentAddress.country && (
                  <FormHelperText>Please select a country first</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Pincode *"
                fullWidth
                value={permanentAddress.pincode}
                onChange={(e) =>
                  handlePermanentAddressChange(
                    'pincode',
                    e.target.value.replace(/\D/g, '').slice(0, 6)
                  )
                }
                error={!!errors.permanent?.pincode}
                helperText={errors.permanent?.pincode || "6-digit code"}
                variant="outlined"
                size="small"
                inputProps={{ 
                  maxLength: 6,
                  inputMode: 'numeric',
                  pattern: '[0-9]*'
                }}
                onFocus={() => setShowPincodeHelp(true)}
                onBlur={() => setShowPincodeHelp(false)}
              />
            </Grid>
          </Grid>
          
          <Collapse in={showPincodeHelp}>
            <Alert severity="info" sx={{ mt: 1 }} icon={false}>
              <Typography variant="caption">
                Enter your 6-digit postal code. For international addresses, enter ZIP code.
              </Typography>
            </Alert>
          </Collapse>
        </CardContent>
      </Card>

      {/* Same Address Toggle */}
      <Box 
        sx={{ 
          mb: 4, 
          p: 2, 
          bgcolor: 'grey.50', 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={isSameAddress}
              onChange={handleSameAddressToggle}
              color="primary"
              size="medium"
              sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
            />
          }
          label={
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              Use same address for correspondence
              {isSameAddress && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Correspondence address will be auto-filled from permanent address
                </Typography>
              )}
            </Typography>
          }
        />
        
        {isSameAddress && (
          <Alert 
            severity="info" 
            icon={<CopyIcon />}
            sx={{ mt: 2, alignItems: 'center' }}
          >
            Correspondence address is currently synced with permanent address
          </Alert>
        )}
      </Box>

      {/* Correspondence Address Card (only show if not same) */}
      {!isSameAddress && (
        <Card 
          variant="outlined" 
          sx={{ 
            borderColor: errors.correspondence ? 'error.main' : 'divider',
            borderWidth: errors.correspondence ? 2 : 1,
            borderRadius: 2,
            boxShadow: errors.correspondence ? '0 0 0 1px #f44336' : 'none'
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationIcon color="primary" sx={{ mr: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Correspondence Address *
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              This is where we'll send your official documents and communications
            </Typography>
            
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Apartment/Flat Name or Number *"
                  fullWidth
                  value={correspondenceAddress.apartment}
                  onChange={(e) => handleCorrespondenceAddressChange('apartment', e.target.value)}
                  error={!!errors.correspondence?.apartment}
                  helperText={errors.correspondence?.apartment}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Street Name/Locality *"
                  fullWidth
                  value={correspondenceAddress.street}
                  onChange={(e) => handleCorrespondenceAddressChange('street', e.target.value)}
                  error={!!errors.correspondence?.street}
                  helperText={errors.correspondence?.street}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="City *"
                  fullWidth
                  value={correspondenceAddress.city}
                  onChange={(e) => handleCorrespondenceAddressChange('city', e.target.value)}
                  error={!!errors.correspondence?.city}
                  helperText={errors.correspondence?.city}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              
              {/* Country Select for Correspondence Address */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.correspondence?.country} required>
                  <Autocomplete
                    value={getCountryValue(correspondenceAddress.country)}
                    onChange={(event, newValue) => {
                      handleCorrespondenceCountryChange(newValue?.country || '');
                    }}
                    options={countries}
                    getOptionLabel={(option) => option.country}
                    loading={loadingCountries}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Country *"
                        error={!!errors.correspondence?.country}
                        helperText={errors.correspondence?.country}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingCountries ? (
                                <CircularProgress color="inherit" size={20} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props} key={option.iso2}>
                        <Typography>{option.country}</Typography>
                      </li>
                    )}
                    isOptionEqualToValue={(option, value) => 
                      option.country === value?.country
                    }
                  />
                </FormControl>
              </Grid>
              
              {/* State Select for Correspondence Address */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.correspondence?.state} required>
                  <Autocomplete
                    value={getStateValue(correspondenceAddress.state, correspondenceStates)}
                    onChange={(event, newValue) => {
                      handleCorrespondenceStateChange(newValue?.name || '');
                    }}
                    options={correspondenceStates}
                    getOptionLabel={(option) => option.name}
                    loading={loadingCorrespondenceStates}
                    disabled={!correspondenceAddress.country}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="State *"
                        error={!!errors.correspondence?.state}
                        helperText={errors.correspondence?.state || (correspondenceAddress.country && !correspondenceStates.length ? "No states available for this country" : "")}
                        placeholder={correspondenceAddress.country ? "Select state" : "Select country first"}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingCorrespondenceStates ? (
                                <CircularProgress color="inherit" size={20} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props} key={option.name}>
                        <Typography>{option.name}</Typography>
                      </li>
                    )}
                    isOptionEqualToValue={(option, value) => 
                      option.name === value?.name
                    }
                  />
                  {!correspondenceAddress.country && (
                    <FormHelperText>Please select a country first</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Pincode *"
                  fullWidth
                  value={correspondenceAddress.pincode}
                  onChange={(e) =>
                    handleCorrespondenceAddressChange(
                      'pincode',
                      e.target.value.replace(/\D/g, '').slice(0, 6)
                    )
                  }
                  error={!!errors.correspondence?.pincode}
                  helperText={errors.correspondence?.pincode}
                  variant="outlined"
                  size="small"
                  inputProps={{ 
                    maxLength: 6,
                    inputMode: 'numeric',
                    pattern: '[0-9]*'
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Helper Text */}
      <Alert 
        severity="info" 
        sx={{ mt: 3, borderRadius: 2 }}
        icon={false}
      >
        <Typography variant="body2">
          <strong>Note:</strong> Please ensure your address details are accurate as they will be used for verification and communication purposes.
        </Typography>
      </Alert>
    </Box>
  );
};

export default AddressComponent;