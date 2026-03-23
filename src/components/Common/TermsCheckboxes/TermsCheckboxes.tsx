/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useLanguage } from 'src/context/LanguageContext';

export interface TermsCheckboxesProps {
  onChange?: (allAccepted: boolean) => void;
}

export const TermsCheckboxes: React.FC<TermsCheckboxesProps> = ({ onChange }) => {
  const { t } = useLanguage(); // Add this line to use translations
  
  const [termsAccepted, setTermsAccepted] = useState({
    keyFacts: false,
    termsConditions: false,
    privacyPolicy: false,
  });

  // Reset all checkboxes
  const resetTerms = () => {
    setTermsAccepted({
      keyFacts: false,
      termsConditions: false,
      privacyPolicy: false,
    });
  };

  useEffect(() => {
    if (onChange) {
      onChange(termsAccepted.keyFacts && termsAccepted.termsConditions && termsAccepted.privacyPolicy);
    }
  }, [termsAccepted, onChange]);

  const handleCheckboxChange = (term: keyof typeof termsAccepted) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setTermsAccepted((prev) => ({
      ...prev,
      [term]: e.target.checked,
    }));
  };

  const handleMasterCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setTermsAccepted({
      keyFacts: checked,
      termsConditions: checked,
      privacyPolicy: checked,
    });
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        component="ul"
        sx={{
          pl: 2,
          listStyle: 'none',
          '& li': {
            mb: 1.5,
            display: 'flex',
            alignItems: 'center',
          },
        }}
      >
        {/* Master Checkbox */}
        <li>
          <input
            type="checkbox"
            checked={termsAccepted.keyFacts && termsAccepted.termsConditions && termsAccepted.privacyPolicy}
            onChange={handleMasterCheckboxChange}
            style={{ marginRight: '8px' }}
          />
          <Typography variant="body2" sx={{ color: '#4a5568', fontWeight: 500 }}>
            {t('reviewAndAgree')}
          </Typography>
        </li>

        {/* Key Facts */}
        <li>
          <input
            type="checkbox"
            checked={termsAccepted.keyFacts}
            onChange={handleCheckboxChange('keyFacts')}
            style={{ marginRight: '8px' }}
          />
          <Typography
            variant="body2"
            component="span"
            sx={{ color: '#4a5568', cursor: 'pointer' }}
            onClick={() => window.open('/KeyFactsStatement', '_blank')}
          >
            {t('iAgreeToServEaso')}{' '}
            <a
              href="/KeyFactsStatement"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#3182ce', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              {t('keyFactsStatement')}
              {/* <OpenInNewIcon fontSize="small" style={{ marginLeft: 4, verticalAlign: 'middle' }} /> */}
            </a>
          </Typography>
        </li>

        {/* Terms & Conditions */}
        <li>
          <input
            type="checkbox"
            checked={termsAccepted.termsConditions}
            onChange={handleCheckboxChange('termsConditions')}
            style={{ marginRight: '8px' }}
          />
          <Typography
            variant="body2"
            component="span"
            sx={{ color: '#4a5568', cursor: 'pointer' }}
            onClick={() => window.open('/TnC', '_blank')}
          >
            {t('iAgreeToServEaso')}{' '}
            <a
              href="/TnC"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#3182ce', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              {t('termsAndConditions')}
              {/* <OpenInNewIcon fontSize="small" style={{ marginLeft: 4, verticalAlign: 'middle' }} /> */}
            </a>
          </Typography>
        </li>

        {/* Privacy */}
        <li>
          <input
            type="checkbox"
            checked={termsAccepted.privacyPolicy}
            onChange={handleCheckboxChange('privacyPolicy')}
            style={{ marginRight: '8px' }}
          />
          <Typography
            variant="body2"
            component="span"
            sx={{ color: '#4a5568', cursor: 'pointer' }}
            onClick={() => window.open('/Privacy', '_blank')}
          >
            {t('iAgreeToServEaso')}{' '}
            <a
              href="/Privacy"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#3182ce', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              {t('privacyStatement')}
              {/* <OpenInNewIcon fontSize="small" style={{ marginLeft: 4, verticalAlign: 'middle' }} /> */}
            </a>
          </Typography>
        </li>
      </Box>
    </Box>
  );
};