/* eslint-disable */
import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Divider, 
  List, 
  ListItem, 
  ListItemText,
  IconButton,
  Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLanguage } from 'src/context/LanguageContext';

// Define the props interface
interface TnCProps {
  onBack?: () => void;
}

const TnC: React.FC<TnCProps> = ({ onBack }) => {
  const { t } = useLanguage();

  return (
    <Container maxWidth="md" sx={{ py: 4, mt: '88px' }}>
      <Paper
        elevation={3}
        sx={{
          p: '88px',
          borderRadius: '2px',
          position: 'relative', // Required for absolute positioning
        }}
      >
        {onBack && (
          <IconButton
            onClick={onBack}
            aria-label="back"
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              backgroundColor: 'white',
              boxShadow: 1,
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: '#f0f0f0',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}

        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          sx={{ fontWeight: 'bold' }}
        >
          {t('termsAndConditions')}
        </Typography>

        <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
          {t('forServEasoApp')}
        </Typography>

        <Box sx={{ my: 3 }}>
          <Typography variant="body1" paragraph>
            {t('tncWelcomeMessage')}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
          {t('definitions')}
        </Typography>

        <List dense>
          <ListItem>
            <ListItemText primary={t('definition1')} />
          </ListItem>
          <ListItem>
            <ListItemText primary={t('definition2')} />
          </ListItem>
          <ListItem>
            <ListItemText primary={t('definition3')} />
          </ListItem>
          <ListItem>
            <ListItemText primary={t('definition4')} />
          </ListItem>
          <ListItem>
            <ListItemText primary={t('definition5')} />
          </ListItem>
        </List>

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
          {t('serviceAgreement')}
        </Typography>

        <List dense>
          <ListItem>
            <ListItemText primary={t('serviceAgreementA')} />
          </ListItem>
          <ListItem>
            <ListItemText primary={t('serviceAgreementB')} />
          </ListItem>
          <ListItem>
            <ListItemText primary={t('serviceAgreementC')} />
          </ListItem>
        </List>

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
          {t('clientResponsibilities')}
        </Typography>

        <List dense>
          <ListItem>
            <ListItemText primary={t('clientResponsibilityA')} />
          </ListItem>
          <ListItem>
            <ListItemText primary={t('clientResponsibilityB')} />
          </ListItem>
          <ListItem>
            <ListItemText primary={t('clientResponsibilityC')} />
          </ListItem>
          <ListItem>
            <ListItemText primary={t('clientResponsibilityD')} />
          </ListItem>
          <ListItem>
            <ListItemText primary={t('clientResponsibilityE')} />
          </ListItem>
          <ListItem>
            <ListItemText primary={t('clientResponsibilityF')} />
          </ListItem>
        </List>

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
          {t('contactInformation')}
        </Typography>

        <Box sx={{ backgroundColor: '#f5f5f5', p: 3, borderRadius: 1, mt: 2 }}>
          <Typography variant="body1" paragraph>
            {t('contactInfoMessage')}
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>{t('tncCompanyName')}</strong>
            <br />
            {t('tncCompanyAddress')}
            <br />
            {t('companyEmail')}
          </Typography>
        </Box>

        <Box sx={{ mt: 4, p: 2, backgroundColor: '#fff8e1', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            {t('importantConsiderations')}
          </Typography>
          <Typography variant="body2" component="div">
            <ul>
              <li>{t('consideration1')}</li>
              <li>{t('consideration2')}</li>
              <li>{t('consideration3')}</li>
              <li>{t('consideration4')}</li>
              <li>{t('consideration5')}</li>
              <li>{t('consideration6')}</li>
            </ul>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default TnC;