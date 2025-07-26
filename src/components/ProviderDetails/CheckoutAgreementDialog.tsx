/* eslint-disable */
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
  
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Button } from "../Button/button";
interface CheckoutWithAgreementProps {
  open: boolean;
  onClose: () => void;
  onProceed: () => void;
}

const CheckoutWithAgreement: React.FC<CheckoutWithAgreementProps> = ({
  open,
  onClose,
  onProceed
}) => {
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    keyFacts: false
  });

  const handleCheckboxChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setAgreements(prev => ({ ...prev, [name]: event.target.checked }));
  };

  const allAgreed = agreements.terms && agreements.privacy && agreements.keyFacts;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
    >
      <DialogTitle>Before You Continue</DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          Please agree to the following before proceeding with your booking:
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={agreements.keyFacts}
                onChange={handleCheckboxChange('keyFacts')}
              />
            }
            label={
              <Typography component="span">
                I agree to the{' '}
                <a
  href="https://www.serveaso.com/tnc"
  style={{ color: '#1d4ed8', textDecoration: 'none' }}
  target="_blank"
  rel="noopener noreferrer"
>
  ServEaso App Terms and Conditions
  <OpenInNewIcon fontSize="small" style={{ marginLeft: 4, verticalAlign: 'middle' }} />
</a>
              </Typography>
            }
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={agreements.terms}
                onChange={handleCheckboxChange('terms')}
              />
            }
            label={
              <Typography component="span">
                I agree to the{' '}
                <a
                  href="https://www.serveaso.com/tnc"
                  style={{ color: '#1d4ed8', textDecoration: 'none' }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ServEaso App Terms and Conditions
                </a>
              </Typography>
            }
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={agreements.privacy}
                onChange={handleCheckboxChange('privacy')}
              />
            }
            label={
              <Typography component="span">
                I agree to the{' '}
                <a
                  href="https://www.servease.com/privacy"
                  style={{ color: '#1d4ed8', textDecoration: 'none' }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ServEaso App Privacy Statement
                </a>
              </Typography>
            }
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={onProceed}
          color="primary"
          variant="contained"
          disabled={!allAgreed}
         sx={{
    '&&.Mui-disabled': {  // Notice the double ampersand for higher specificity
      backgroundColor: '#f5f5f5',
      color: '#bdbdbd',
      border: '1px solid #e0e0e0',
      cursor: 'not-allowed',
      pointerEvents: 'auto'
    }
  }}
        >
          Proceed to Pay
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheckoutWithAgreement;