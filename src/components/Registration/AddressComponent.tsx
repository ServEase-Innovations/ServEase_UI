/* eslint-disable */
import React, { useState } from 'react';
import {
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
} from '@mui/material';

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

const AddressComponent: React.FC<AddressComponentProps> = ({
  onAddressChange,
  permanentAddress,
  correspondenceAddress,
  errors = {}
}) => {
  const [isSameAddress, setIsSameAddress] = useState(false);

  const handlePermanentAddressChange = (field: keyof AddressData, value: string) => {
    const newAddress = { ...permanentAddress, [field]: value };
    onAddressChange('permanent', newAddress);

    if (isSameAddress) {
      onAddressChange('correspondence', newAddress);
    }
  };

  const handleCorrespondenceAddressChange = (field: keyof AddressData, value: string) => {
    const newAddress = { ...correspondenceAddress, [field]: value };
    onAddressChange('correspondence', newAddress);
  };

  const handleSameAddressToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setIsSameAddress(checked);

    if (checked) {
      // Copy permanent → correspondence
      onAddressChange('correspondence', permanentAddress);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Address Information
      </Typography>

      {/* Permanent Address */}
      <Box mb={3}>
        <Typography variant="subtitle1" gutterBottom>
          Permanent Address *
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Apartment Name/Flat Name or Number *"
              fullWidth
              value={permanentAddress.apartment}
              onChange={(e) => handlePermanentAddressChange('apartment', e.target.value)}
              error={!!errors.permanent?.apartment}
              helperText={errors.permanent?.apartment}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Street Name/Locality name *"
              fullWidth
              value={permanentAddress.street}
              onChange={(e) => handlePermanentAddressChange('street', e.target.value)}
              error={!!errors.permanent?.street}
              helperText={errors.permanent?.street}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="City *"
              fullWidth
              value={permanentAddress.city}
              onChange={(e) => handlePermanentAddressChange('city', e.target.value)}
              error={!!errors.permanent?.city}
              helperText={errors.permanent?.city}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="State *"
              fullWidth
              value={permanentAddress.state}
              onChange={(e) => handlePermanentAddressChange('state', e.target.value)}
              error={!!errors.permanent?.state}
              helperText={errors.permanent?.state}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Country *"
              fullWidth
              value={permanentAddress.country}
              onChange={(e) => handlePermanentAddressChange('country', e.target.value)}
              error={!!errors.permanent?.country}
              helperText={errors.permanent?.country}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
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
              helperText={errors.permanent?.pincode}
              inputProps={{ maxLength: 6 }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Same as Permanent Checkbox */}
      <Box mb={2}>
        <FormControlLabel
          control={
            <Checkbox
              checked={isSameAddress}
              onChange={handleSameAddressToggle}
              color="primary"
            />
          }
          label="Same as Permanent Address"
        />
      </Box>

      {/* Correspondence Address (only show if not same) */}
      {!isSameAddress && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Correspondence Address *
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Apartment Name/Flat Name or Number *"
                fullWidth
                value={correspondenceAddress.apartment}
                onChange={(e) => handleCorrespondenceAddressChange('apartment', e.target.value)}
                error={!!errors.correspondence?.apartment}
                helperText={errors.correspondence?.apartment}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Street Name/Locality name *"
                fullWidth
                value={correspondenceAddress.street}
                onChange={(e) => handleCorrespondenceAddressChange('street', e.target.value)}
                error={!!errors.correspondence?.street}
                helperText={errors.correspondence?.street}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="City *"
                fullWidth
                value={correspondenceAddress.city}
                onChange={(e) => handleCorrespondenceAddressChange('city', e.target.value)}
                error={!!errors.correspondence?.city}
                helperText={errors.correspondence?.city}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="State *"
                fullWidth
                value={correspondenceAddress.state}
                onChange={(e) => handleCorrespondenceAddressChange('state', e.target.value)}
                error={!!errors.correspondence?.state}
                helperText={errors.correspondence?.state}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Country *"
                fullWidth
                value={correspondenceAddress.country}
                onChange={(e) => handleCorrespondenceAddressChange('country', e.target.value)}
                error={!!errors.correspondence?.country}
                helperText={errors.correspondence?.country}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
                inputProps={{ maxLength: 6 }}
              />
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default AddressComponent;
